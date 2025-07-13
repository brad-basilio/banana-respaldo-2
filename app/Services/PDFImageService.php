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
                return file_get_contents($imagePath);
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
                $imageData = file_get_contents($tempFile);
                $fileSize = strlen($imageData);
                
                Log::info("✅ [PDF-IMAGE] Imagen optimizada: {$newWidth}x{$newHeight}, $fileSize bytes");
                return $imageData;
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
    public function processBase64ImageForPDF($base64Data, $maxWidth = 2400, $quality = 85)
    {
        try {
            // Decodificar base64
            if (strpos($base64Data, 'data:') === 0) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
            }
            
            $imageData = base64_decode($base64Data);
            if (!$imageData) {
                Log::warning("⚠️ [PDF-IMAGE] Error decodificando base64");
                return null;
            }

            // Crear archivo temporal
            $tempFile = $this->createTempFile('img');
            file_put_contents($tempFile, $imageData);
            $this->tempFiles[] = $tempFile;

            // Procesar como archivo normal
            $result = $this->processImageForPDF($tempFile, $maxWidth, $quality);
            
            return $result;

        } catch (\Exception $e) {
            Log::error("❌ [PDF-IMAGE] Error procesando imagen base64: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Carga imagen según su tipo con soporte para WebP
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
                
            default:
                // Intentar como WebP si el tipo no se reconoce pero es un archivo webp
                if (pathinfo($imagePath, PATHINFO_EXTENSION) === 'webp' && function_exists('imagecreatefromwebp')) {
                    return @imagecreatefromwebp($imagePath);
                }
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
                $transparentNew = imagecolorallocate(
                    $destinationImage,
                    $transparentColor['red'],
                    $transparentColor['green'],
                    $transparentColor['blue']
                );
                imagefill($destinationImage, 0, 0, $transparentNew);
                imagecolortransparent($destinationImage, $transparentNew);
            }
        }
    }

    /**
     * Calcula nuevas dimensiones manteniendo proporción
     */
    private function calculateDimensions($originalWidth, $originalHeight, $maxWidth)
    {
        if ($originalWidth <= $maxWidth) {
            return [
                'width' => $originalWidth,
                'height' => $originalHeight
            ];
        }

        $ratio = $originalHeight / $originalWidth;
        $newWidth = $maxWidth;
        $newHeight = (int)($maxWidth * $ratio);

        return [
            'width' => $newWidth,
            'height' => $newHeight
        ];
    }

    /**
     * Crea archivo temporal
     */
    private function createTempFile($extension = 'tmp')
    {
        return tempnam(sys_get_temp_dir(), 'pdf') . '.' . $extension;
    }

    /**
     * Fallback a imagen original si falla el procesamiento
     */
    private function fallbackToOriginal($imagePath)
    {
        try {
            return file_get_contents($imagePath);
        } catch (\Exception $e) {
            Log::error("❌ [PDF-IMAGE] Error en fallback: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Limpia archivos temporales
     */
    public function cleanup()
    {
        $deleted = 0;
        foreach ($this->tempFiles as $file) {
            if (file_exists($file)) {
                @unlink($file);
                $deleted++;
                Log::info("🗑️ [PDF-IMAGE] Archivo temporal limpiado: $file");
            }
        }
        
        $this->tempFiles = [];
        
        if ($deleted > 0) {
            Log::info("🧹 [PDF-IMAGE] Limpieza completada: $deleted archivos eliminados");
        }
    }

    /**
     * Destructor para limpiar automáticamente
     */
    public function __destruct()
    {
        $this->cleanup();
    }
}
