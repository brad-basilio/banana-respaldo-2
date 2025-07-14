<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PDFImageService
{
    private $tempFiles = [];

    /**
     * Procesa y optimiza una imagen para el PDF
     * Soporte mejorado para WebP, JPEG, PNG y GIF
     * DEVUELVE LA RUTA DEL ARCHIVO, NO EL CONTENIDO BINARIO
     */
    public function processImageForPDF($imagePath, $maxWidth = 2400, $quality = 85)
    {
        try {
            if (!file_exists($imagePath)) {
                Log::warning("🖼️ [PDF-IMAGE] Archivo no encontrado: $imagePath");
                return null;
            }

            // Obtener información de la imagen
            $imageInfo = @getimagesize($imagePath);
            if (!$imageInfo) {
                Log::warning("🖼️ [PDF-IMAGE] No se pudo obtener información de la imagen: $imagePath");
                return null;
            }

            $originalWidth = $imageInfo[0];
            $originalHeight = $imageInfo[1];
            $imageType = $imageInfo[2];

            Log::info("🖼️ [PDF-IMAGE] Procesando imagen: $imagePath");
            Log::info("📏 [PDF-IMAGE] Dimensiones originales: {$originalWidth}x{$originalHeight}");

            // Cargar la imagen según su tipo
            $sourceImage = $this->loadImageByType($imagePath, $imageType);
            if (!$sourceImage) {
                Log::warning("⚠️ [PDF-IMAGE] Tipo de imagen no soportado: $imageType");
                return $this->fallbackToOriginal($imagePath);
            }

            // Calcular nuevas dimensiones manteniendo aspecto
            $newDimensions = $this->calculateDimensions($originalWidth, $originalHeight, $maxWidth);
            $newWidth = $newDimensions['width'];
            $newHeight = $newDimensions['height'];

            // Si no necesita redimensionamiento y es JPEG, usar original
            if ($newWidth === $originalWidth && $newHeight === $originalHeight && $imageType === IMAGETYPE_JPEG) {
                imagedestroy($sourceImage);
                Log::info("✅ [PDF-IMAGE] Imagen sin cambios, usando original: $imagePath");
                return $imagePath; // Devolver ruta original
            }

            // Crear imagen redimensionada
            $destinationImage = imagecreatetruecolor($newWidth, $newHeight);
            
            // Preservar transparencia para PNG y GIF
            if ($imageType === IMAGETYPE_PNG || $imageType === IMAGETYPE_GIF) {
                $this->preserveTransparency($destinationImage, $sourceImage, $imageType);
            }

            // Redimensionar con alta calidad
            imagecopyresampled(
                $destinationImage, $sourceImage,
                0, 0, 0, 0,
                $newWidth, $newHeight,
                $originalWidth, $originalHeight
            );

            // Convertir a JPEG para el PDF
            $tempFile = $this->createTempFile('jpg');
            $success = imagejpeg($destinationImage, $tempFile, $quality);

            // Limpiar memoria
            imagedestroy($sourceImage);
            imagedestroy($destinationImage);

            if ($success) {
                $this->tempFiles[] = $tempFile;
                $fileSize = filesize($tempFile);
                
                Log::info("✅ [PDF-IMAGE] Imagen optimizada: {$newWidth}x{$newHeight}, $fileSize bytes");
                return $tempFile; // Devolver ruta del archivo temporal
            } else {
                Log::warning("⚠️ [PDF-IMAGE] Error al guardar imagen optimizada");
                return $this->fallbackToOriginal($imagePath);
            }

        } catch (\Exception $e) {
            Log::error("❌ [PDF-IMAGE] Error procesando imagen: " . $e->getMessage());
            return $this->fallbackToOriginal($imagePath);
        }
    }

    /**
     * Procesa imagen desde base64
     */
    public function processBase64Image($base64Data, $maxWidth = 2400, $quality = 85)
    {
        try {
            if (empty($base64Data)) {
                return null;
            }

            // Decodificar base64
            $base64String = substr($base64Data, strpos($base64Data, ',') + 1);
            $decodedImage = base64_decode($base64String);

            if ($decodedImage === false) {
                Log::warning("⚠️ [PDF-IMAGE] Error decodificando base64");
                return null;
            }

            // Crear archivo temporal
            $tempFile = tempnam(sys_get_temp_dir(), 'pdf_base64_') . '.jpg';
            file_put_contents($tempFile, $decodedImage);

            // Procesar la imagen
            $result = $this->processImageForPDF($tempFile, $maxWidth, $quality);
            
            // Limpiar archivo temporal original si es diferente del resultado
            if ($tempFile !== $result && file_exists($tempFile)) {
                unlink($tempFile);
            }
            
            return $result;

        } catch (\Exception $e) {
            Log::error("❌ [PDF-IMAGE] Error procesando base64: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Carga imagen según su tipo
     */
    private function loadImageByType($imagePath, $imageType)
    {
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                return @imagecreatefromjpeg($imagePath);
            case IMAGETYPE_PNG:
                return @imagecreatefrompng($imagePath);
            case IMAGETYPE_GIF:
                return @imagecreatefromgif($imagePath);
            case IMAGETYPE_WEBP:
                if (function_exists('imagecreatefromwebp')) {
                    return @imagecreatefromwebp($imagePath);
                }
                break;
            case 18: // WEBP fallback
                if (function_exists('imagecreatefromwebp')) {
                    return @imagecreatefromwebp($imagePath);
                }
                break;
        }
        return false;
    }

    /**
     * Preserva transparencia para PNG y GIF
     */
    private function preserveTransparency($destinationImage, $sourceImage, $imageType)
    {
        if ($imageType === IMAGETYPE_PNG) {
            imagealphablending($destinationImage, false);
            imagesavealpha($destinationImage, true);
            $transparent = imagecolorallocatealpha($destinationImage, 255, 255, 255, 127);
            imagefill($destinationImage, 0, 0, $transparent);
        } elseif ($imageType === IMAGETYPE_GIF) {
            $transparentIndex = imagecolortransparent($sourceImage);
            if ($transparentIndex >= 0) {
                $transparentColor = imagecolorsforindex($sourceImage, $transparentIndex);
                $transparentNew = imagecolorallocate($destinationImage, $transparentColor['red'], $transparentColor['green'], $transparentColor['blue']);
                imagefill($destinationImage, 0, 0, $transparentNew);
                imagecolortransparent($destinationImage, $transparentNew);
            }
        }
    }

    /**
     * Calcula dimensiones manteniendo aspecto
     */
    private function calculateDimensions($originalWidth, $originalHeight, $maxWidth)
    {
        if ($originalWidth <= $maxWidth && $originalHeight <= $maxWidth) {
            return [
                'width' => $originalWidth,
                'height' => $originalHeight
            ];
        }

        $ratio = min($maxWidth / $originalWidth, $maxWidth / $originalHeight);
        return [
            'width' => (int)round($originalWidth * $ratio),
            'height' => (int)round($originalHeight * $ratio)
        ];
    }

    /**
     * Crea archivo temporal
     */
    private function createTempFile($extension)
    {
        return tempnam(sys_get_temp_dir(), 'pdf') . '.' . $extension;
    }

    /**
     * Fallback a imagen original
     */
    private function fallbackToOriginal($imagePath)
    {
        try {
            Log::info("⚠️ [PDF-IMAGE] Usando imagen original como fallback: $imagePath");
            return $imagePath; // Devolver ruta original
        } catch (\Exception $e) {
            Log::error("❌ [PDF-IMAGE] Error en fallback: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Limpia archivos temporales
     */
    public function cleanupTempFiles()
    {
        $cleanedCount = 0;
        foreach ($this->tempFiles as $tempFile) {
            if (file_exists($tempFile)) {
                if (unlink($tempFile)) {
                    $cleanedCount++;
                    Log::info("🗑️ [PDF-IMAGE] Archivo temporal limpiado: $tempFile");
                }
            }
        }
        
        $this->tempFiles = [];
        
        if ($cleanedCount > 0) {
            Log::info("🧹 [PDF-IMAGE] Limpieza completada: $cleanedCount archivos eliminados");
        }
    }

    /**
     * Destructor para limpiar archivos al finalizar
     */
    public function __destruct()
    {
        $this->cleanupTempFiles();
    }

    /**
     * Procesa una imagen aplicando efecto cover usando Intervention Image
     */
    public function processImageWithCover($imagePath, $targetWidth, $targetHeight, $quality = 90)
    {
        try {
            if (!file_exists($imagePath)) {
                Log::warning("🖼️ [PDF-IMAGE-COVER] Archivo no encontrado: $imagePath");
                return null;
            }

            // Validar dimensiones para evitar errores de memoria
            $maxWidth = 2000;
            $maxHeight = 2000;
            
            if ($targetWidth > $maxWidth || $targetHeight > $maxHeight) {
                $ratio = min($maxWidth / $targetWidth, $maxHeight / $targetHeight);
                $targetWidth = round($targetWidth * $ratio);
                $targetHeight = round($targetHeight * $ratio);
                
                Log::info("📐 [PDF-IMAGE-COVER] Dimensiones ajustadas: {$targetWidth}x{$targetHeight}");
            }

            // Usar Intervention Image para aplicar cover
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $image = $manager->read($imagePath);
            
            // Aplicar cover (mantiene proporción y recorta)
            $image = $image->cover($targetWidth, $targetHeight);
            
            // Crear archivo temporal
            $tempPath = sys_get_temp_dir() . '/pdf_cover_' . uniqid() . '.jpg';
            $image->toJpeg($quality)->save($tempPath);
            
            // Registrar para limpieza
            $this->tempFiles[] = $tempPath;
            
            Log::info("✅ [PDF-IMAGE-COVER] Imagen procesada con cover: {$tempPath}");
            
            return $tempPath;
            
        } catch (\Exception $e) {
            Log::error("❌ [PDF-IMAGE-COVER] Error: " . $e->getMessage());
            return $this->processImageForPDF($imagePath, 2400, $quality); // Fallback
        }
    }
}
