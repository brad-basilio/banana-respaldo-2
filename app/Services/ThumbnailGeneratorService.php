<?php

namespace App\Services;

use App\Models\CanvasProject;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ThumbnailGeneratorService
{
    protected $tempFiles = [];

    /**
     * Genera thumbnails de alta calidad para todas las páginas
     */
    public function generateHighQualityThumbnails(CanvasProject $project, array $pages, array $config = [])
    {
        $thumbnails = [];
        
        // Configuración por defecto
        $defaultConfig = [
            'width' => 800,
            'height' => 600,
            'quality' => 95,
            'scale' => 4,
            'dpi' => 300,
            'format' => 'png'
        ];
        
        $config = array_merge($defaultConfig, $config);
       

        foreach ($pages as $pageIndex => $page) {
            try {
                $thumbnail = $this->generatePageThumbnail($project, $page, $pageIndex, $config);
                
                if ($thumbnail) {
                    $thumbnails[] = $thumbnail;
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        // Limpiar archivos temporales
        $this->cleanupTempFiles();

        return $thumbnails;
    }

    /**
     * Genera thumbnail para una página específica
     */
    public function generatePageThumbnail(CanvasProject $project, array $page, int $pageIndex, array $config = [])
    {
        try {
        

            // Obtener configuración del preset
            $presetConfig = $this->getPresetConfiguration($project);
            
            // Calcular dimensiones finales
            $finalWidth = $config['width'] ?? 800;
            $finalHeight = $config['height'] ?? 600;
            
            // Dimensiones del canvas de trabajo (más grande para mejor calidad)
            $workingWidth = $finalWidth * ($config['scale'] ?? 4);
            $workingHeight = $finalHeight * ($config['scale'] ?? 4);

            // Crear canvas base
            $canvas = imagecreatetruecolor($workingWidth, $workingHeight);
            
            // Configurar para transparencia
            imagealphablending($canvas, false);
            imagesavealpha($canvas, true);
            
            // Fondo de la página
            $backgroundColor = $page['backgroundColor'] ?? '#FFFFFF';
            $bgColor = $this->hexToRgb($backgroundColor);
            $background = imagecolorallocate($canvas, $bgColor['r'], $bgColor['g'], $bgColor['b']);
            imagefill($canvas, 0, 0, $background);

            // Procesar imagen de fondo si existe
            if (!empty($page['backgroundImage'])) {
                $this->addBackgroundImage($canvas, $page['backgroundImage'], $workingWidth, $workingHeight);
            }

            // Obtener información del layout
            $layoutInfo = null;
            if (isset($page['layout'])) {
                $layoutInfo = $this->getLayoutInfo($page['layout']);
            }

            // Procesar elementos de las celdas
            if (isset($page['cells']) && is_array($page['cells'])) {
                foreach ($page['cells'] as $cellIndex => $cell) {
                    if (isset($cell['elements']) && is_array($cell['elements'])) {
                        foreach ($cell['elements'] as $element) {
                            $this->addElementToCanvas($canvas, $element, $workingWidth, $workingHeight, $presetConfig, $layoutInfo, $cellIndex);
                        }
                    }
                }
            }

            // Redimensionar a tamaño final con alta calidad
            $finalCanvas = imagecreatetruecolor($finalWidth, $finalHeight);
            imagealphablending($finalCanvas, false);
            imagesavealpha($finalCanvas, true);
            
            // Redimensionar con suavizado
            imagecopyresampled(
                $finalCanvas, $canvas,
                0, 0, 0, 0,
                $finalWidth, $finalHeight,
                $workingWidth, $workingHeight
            );

            // Guardar thumbnail
            $thumbnailPath = $this->saveThumbnail($finalCanvas, $project, $pageIndex, $config);

            // Limpiar memoria
            imagedestroy($canvas);
            imagedestroy($finalCanvas);

            return [
                'page_index' => $pageIndex,
                'page_id' => $page['id'] ?? "page-{$pageIndex}",
                'pdf_filename' => "page-{$pageIndex}-pdf.png", // Archivo para PDF
                'thumbnail_filename' => "page-{$pageIndex}-thumbnail.png", // Archivo para sidebar
                'thumbnail_url' => $thumbnailPath, // URL completa para usar inmediatamente
                'width' => $finalWidth,
                'height' => $finalHeight,
                'quality' => $config['quality'] ?? 95,
                'layout' => $page['layout'] ?? 'none',
                'generated_at' => now()->toISOString()
            ];

        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Añade elemento al canvas
     */
    private function addElementToCanvas($canvas, array $element, int $canvasWidth, int $canvasHeight, array $presetConfig, $layoutInfo = null, $cellIndex = null)
    {
        $position = $element['position'] ?? ['x' => 0, 'y' => 0];
        $size = $element['size'] ?? ['width' => 0.1, 'height' => 0.1];
        
        // Convertir posiciones normalizadas a píxeles
        $x = ($position['x'] ?? 0) * $canvasWidth;
        $y = ($position['y'] ?? 0) * $canvasHeight;
        $width = ($size['width'] ?? 0) * $canvasWidth;
        $height = ($size['height'] ?? 0) * $canvasHeight;

        // Si hay layout, ajustar posición dentro de la celda
        if ($layoutInfo && $cellIndex !== null && isset($layoutInfo['cells'][$cellIndex])) {
            $cellConfig = $layoutInfo['cells'][$cellIndex];
            
            // Calcular dimensiones de la celda
            $cellWidth = $canvasWidth / $layoutInfo['cols'];
            $cellHeight = $canvasHeight / $layoutInfo['rows'];
            
            // Ajustar posición relativa a la celda
            $cellX = $cellConfig['col'] * $cellWidth;
            $cellY = $cellConfig['row'] * $cellHeight;
            
            $x = $cellX + ($position['x'] ?? 0) * $cellWidth;
            $y = $cellY + ($position['y'] ?? 0) * $cellHeight;
            $width = ($size['width'] ?? 0) * $cellWidth;
            $height = ($size['height'] ?? 0) * $cellHeight;
        }

        switch ($element['type']) {
            case 'image':
                $this->addImageElement($canvas, $element, $x, $y, $width, $height);
                break;
            case 'text':
                $this->addTextElement($canvas, $element, $x, $y, $width, $height);
                break;
        }
    }

    /**
     * Añade imagen al canvas
     */
    private function addImageElement($canvas, array $element, float $x, float $y, float $width, float $height)
    {
        $imageContent = $element['content'] ?? null;
        if (!$imageContent) return;

        try {
            $imagePath = $this->resolveImagePath($imageContent);
            if (!$imagePath || !file_exists($imagePath)) {
                return;
            }

            // Cargar imagen
            $sourceImage = $this->createImageFromFile($imagePath);
            if (!$sourceImage) return;

            // Redimensionar manteniendo aspecto (cover)
            $sourceWidth = imagesx($sourceImage);
            $sourceHeight = imagesy($sourceImage);
            
            $scaleX = $width / $sourceWidth;
            $scaleY = $height / $sourceHeight;
            $scale = max($scaleX, $scaleY); // Para cover

            $scaledWidth = $sourceWidth * $scale;
            $scaledHeight = $sourceHeight * $scale;

            // Centrar la imagen
            $offsetX = ($width - $scaledWidth) / 2;
            $offsetY = ($height - $scaledHeight) / 2;

            // Copiar imagen redimensionada
            imagecopyresampled(
                $canvas, $sourceImage,
                $x + $offsetX, $y + $offsetY,
                0, 0,
                $scaledWidth, $scaledHeight,
                $sourceWidth, $sourceHeight
            );

            imagedestroy($sourceImage);

        } catch (\Exception $e) {
            //
        }
    }

    /**
     * Añade texto al canvas
     */
    private function addTextElement($canvas, array $element, float $x, float $y, float $width, float $height)
    {
        $content = $element['content'] ?? '';
        if (empty($content)) return;

        $style = $element['style'] ?? [];
        
        // Procesar estilo de texto
        $fontSize = $this->parseFontSize($style['fontSize'] ?? '16px');
        $color = $this->parseColor($style['color'] ?? '#000000');
        $textAlign = $style['textAlign'] ?? 'left';

        // Crear color para GD
        $textColor = imagecolorallocate($canvas, $color['r'], $color['g'], $color['b']);

        // Usar fuente por defecto de GD (mejorable con TTF)
        $font = 5; // Fuente built-in más grande

        // Limpiar contenido HTML
        $cleanContent = strip_tags($content);
        $cleanContent = html_entity_decode($cleanContent, ENT_QUOTES, 'UTF-8');

        // Calcular posición según alineación
        $textWidth = imagefontwidth($font) * strlen($cleanContent);
        
        switch ($textAlign) {
            case 'center':
                $textX = $x + ($width - $textWidth) / 2;
                break;
            case 'right':
                $textX = $x + $width - $textWidth;
                break;
            default:
                $textX = $x;
        }

        $textY = $y + $height / 2 - imagefontheight($font) / 2;

        // Escribir texto
        imagestring($canvas, $font, $textX, $textY, $cleanContent, $textColor);
    }

    /**
     * Guardar thumbnail (alta calidad para PDF + thumbnail pequeño para sidebar)
     */
    private function saveThumbnail($canvas, CanvasProject $project, int $pageIndex, array $config)
    {
        $quality = $config['quality'] ?? 95;
        
        // 🔄 NUEVA ESTRUCTURA: Nombres más descriptivos
        $pdfFilename = "page-{$pageIndex}-pdf.png";        // Para PDFs de alta calidad
        $thumbnailFilename = "page-{$pageIndex}-thumbnail.png"; // Para sidebar
        
        $projectPath = "images/thumbnails/{$project->id}";
        $pdfRelativePath = "{$projectPath}/{$pdfFilename}";

        // Crear directorio si no existe con permisos correctos
        if (!Storage::exists($projectPath)) {
            $fullPath = storage_path('app/' . $projectPath);
            if (!file_exists($fullPath)) {
                mkdir($fullPath, 0775, true); // Crear con permisos 775 recursivamente
            }
        }

        // 1. Guardar thumbnail de alta calidad (para PDF) como PNG
        ob_start();
        imagepng($canvas, null, 9); // PNG con máxima compresión (0-9)
        $imageContent = ob_get_contents();
        ob_end_clean();

        // Guardar usando Storage en la carpeta correcta (storage/app/images/thumbnails)
        $pdfRelativePath = "images/thumbnails/{$project->id}/{$pdfFilename}";
        $saved = Storage::put($pdfRelativePath, $imageContent);

        if ($saved) {
            // 2. Generar thumbnail pequeño para sidebar usando Intervention Image
            $this->generateSidebarThumbnail($canvas, $project, $pageIndex, $thumbnailFilename);
            
            // 🚀 RETORNAR URL DIRECTA usando storage:link
            return "/storage/images/thumbnails/{$project->id}/{$thumbnailFilename}";
        } else {
            throw new \Exception("Error guardando thumbnail: {$pdfFilename}");
        }
    }

    /**
     * Generar thumbnail pequeño para sidebar
     */
    private function generateSidebarThumbnail($canvas, CanvasProject $project, int $pageIndex, string $filename)
    {
        try {
            // Convertir canvas GD a string
            ob_start();
            imagepng($canvas, null, 9); // PNG para mejor calidad
            $imageContent = ob_get_contents();
            ob_end_clean();

            // Crear manager de Intervention Image v3
            $manager = new ImageManager(new Driver());
            
            // Crear imagen con Intervention Image v3
            $image = $manager->read($imageContent);
            
            // Redimensionar para sidebar (150x200 px) manteniendo aspecto
            $image->scale(600, 800);
            
            // Guardar en storage/app/images/thumbnails para mantener consistencia
            $sidebarPath = "images/thumbnails/{$project->id}";
            $sidebarFullPath = "{$sidebarPath}/{$filename}";
            
            // Crear directorio si no existe con permisos correctos
            if (!Storage::exists($sidebarPath)) {
                $fullPath = storage_path('app/' . $sidebarPath);
                if (!file_exists($fullPath)) {
                    mkdir($fullPath, 0775, true); // Crear con permisos 775 recursivamente
                }
            }
            
            // Guardar como PNG para sidebar usando Storage::put
            $image->save(storage_path("app/{$sidebarFullPath}"));
            
            
        } catch (\Exception $e) {
            // No lanzar excepción, solo log del error
        }
    }

    /**
     * Utilidades auxiliares
     */
    private function hexToRgb($hex)
    {
        $hex = ltrim($hex, '#');
        return [
            'r' => hexdec(substr($hex, 0, 2)),
            'g' => hexdec(substr($hex, 2, 2)),
            'b' => hexdec(substr($hex, 4, 2))
        ];
    }

    private function parseFontSize($fontSize)
    {
        return (int)preg_replace('/[^0-9]/', '', $fontSize) ?: 16;
    }

    private function parseColor($color)
    {
        if (strpos($color, '#') === 0) {
            return $this->hexToRgb($color);
        }
        return ['r' => 0, 'g' => 0, 'b' => 0];
    }

    private function resolveImagePath($imageContent)
    {
        // Similar a la lógica del ProjectPDFController
        if (strpos($imageContent, 'data:image/') === 0) {
            // Procesar base64
            return $this->processBase64Image($imageContent);
        }
        
        if (strpos($imageContent, '/api/canvas/image/') === 0) {
            return $this->convertApiUrlToAbsolutePath($imageContent);
        }
        
        if (strpos($imageContent, 'storage/') === 0) {
            return public_path($imageContent);
        }
        
        return public_path($imageContent);
    }

    private function createImageFromFile($path)
    {
        $imageInfo = getimagesize($path);
        if (!$imageInfo) return null;

        switch ($imageInfo[2]) {
            case IMAGETYPE_JPEG:
                return imagecreatefromjpeg($path);
            case IMAGETYPE_PNG:
                return imagecreatefrompng($path);
            case IMAGETYPE_GIF:
                return imagecreatefromgif($path);
            default:
                return null;
        }
    }

    private function processBase64Image($base64String)
    {
        // Implementar procesamiento de base64
        try {
            $base64Data = substr($base64String, strpos($base64String, ',') + 1);
            $imageData = base64_decode($base64Data);
            
            $tempPath = sys_get_temp_dir() . '/thumbnail_' . uniqid() . '.jpg';
            file_put_contents($tempPath, $imageData);
            
            $this->tempFiles[] = $tempPath;
            return $tempPath;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function convertApiUrlToAbsolutePath($url)
    {
        // Similar a ProjectPDFController
        try {
            $encodedPath = last(explode('/', $url));
            $decodedPath = base64_decode($encodedPath);
            return storage_path('app/' . $decodedPath);
        } catch (\Exception $e) {
            return null;
        }
    }

    private function addBackgroundImage($canvas, $backgroundImage, $width, $height)
    {
        $imagePath = $this->resolveImagePath($backgroundImage);
        if (!$imagePath || !file_exists($imagePath)) return;

        $bgImage = $this->createImageFromFile($imagePath);
        if (!$bgImage) return;

        // Redimensionar background a tamaño completo
        imagecopyresampled(
            $canvas, $bgImage,
            0, 0, 0, 0,
            $width, $height,
            imagesx($bgImage), imagesy($bgImage)
        );

        imagedestroy($bgImage);
    }

    private function getPresetConfiguration(CanvasProject $project)
    {
        // Reutilizar lógica del ProjectPDFController
        if ($project->canvasPreset) {
            return [
                'width' => $project->canvasPreset->width,
                'height' => $project->canvasPreset->height,
                'dpi' => $project->canvasPreset->dpi ?? 300
            ];
        }

        return [
            'width' => 210,
            'height' => 297,
            'dpi' => 300
        ];
    }

    /**
     * Obtener thumbnails guardados
     */
    public function getStoredThumbnails(CanvasProject $project)
    {
        $thumbnails = [];
        $projectPath = "images/thumbnails/{$project->id}";
        
        if (Storage::exists($projectPath)) {
            $files = Storage::files($projectPath);
            
            foreach ($files as $file) {
                $filename = basename($file);
                
                // Extraer el índice de página del nombre del archivo
                if (preg_match('/page-(\d+)-thumbnail\.png/', $filename, $matches)) {
                    $pageIndex = (int)$matches[1];
                    
                    // Generar URL usando el servicio de imágenes
                    $encodedPath = base64_encode($file);
                    $thumbnailUrl = "/api/canvas/serve-image/{$encodedPath}";
                    
                    $thumbnails[] = [
                        'page_index' => $pageIndex,
                        'page_id' => "page-{$pageIndex}",
                        'thumbnail_filename' => $filename,
                        'thumbnail_url' => $thumbnailUrl,
                        'file_path' => $file,
                        'last_modified' => Storage::lastModified($file)
                    ];
                }
            }
            
            // Ordenar por índice de página
            usort($thumbnails, function($a, $b) {
                return $a['page_index'] - $b['page_index'];
            });
        }
        
        return $thumbnails;
    }

    /**
     * Eliminar thumbnails guardados
     */
    public function deleteStoredThumbnails(CanvasProject $project)
    {
        $projectPath = "images/thumbnails/{$project->id}";
        $deleted = 0;
        
        if (Storage::exists($projectPath)) {
            $files = Storage::files($projectPath);
            
            foreach ($files as $file) {
                if (Storage::delete($file)) {
                    $deleted++;
                }
            }
            
            // Eliminar el directorio si está vacío
            if (count(Storage::files($projectPath)) === 0) {
                Storage::deleteDirectory($projectPath);
            }
        }
        
        return $deleted;
    }

    /**
     * Limpiar archivos temporales
     */
    private function cleanupTempFiles()
    {
        foreach ($this->tempFiles as $tempFile) {
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
        $this->tempFiles = [];
    }

    /**
     * Guarda un thumbnail base64 como archivo
     */
    public function saveBase64AsFile(CanvasProject $project, $pageId, $thumbnailData)
    {
        try {

            // Validar formato base64
            if (!str_starts_with($thumbnailData, 'data:image/')) {
                return null;
            }

            // Extraer información del base64
            $parts = explode(';base64,', $thumbnailData);
            if (count($parts) !== 2) {
                return null;
            }

            $imageData = base64_decode($parts[1]);
            if ($imageData === false) {
                return null;
            }

            // Obtener extensión de la imagen
            $mimeType = $parts[0];
            $extension = 'png'; // Por defecto PNG
            if (strpos($mimeType, 'jpeg') !== false) {
                $extension = 'jpg';
            } elseif (strpos($mimeType, 'png') !== false) {
                $extension = 'png';
            } elseif (strpos($mimeType, 'webp') !== false) {
                $extension = 'webp';
            }

            // Definir ruta del archivo
            $thumbnailsDir = "images/thumbnails/{$project->id}";
            $filename = "page_{$pageId}.{$extension}";
            $filePath = "{$thumbnailsDir}/{$filename}";

            // Crear directorio si no existe con permisos correctos
            if (!Storage::exists($thumbnailsDir)) {
                $fullPath = storage_path('app/' . $thumbnailsDir);
                if (!file_exists($fullPath)) {
                    mkdir($fullPath, 0775, true); // Crear con permisos 775 recursivamente
                }
            }

            // Guardar archivo
            $success = Storage::put($filePath, $imageData);

            if ($success) {
                $encodedPath = base64_encode($filePath);
                $thumbnailUrl = "/api/canvas/serve-image/{$encodedPath}";
                return $thumbnailUrl;
            } else {
                return null;
            }

        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Obtiene información del layout desde la configuración
     */
    private function getLayoutInfo($layoutName)
    {
        $layouts = config('layouts.layouts', []);
        
        if (!isset($layouts[$layoutName])) {
            return null;
        }
        
        $layout = $layouts[$layoutName];
        
        return [
            'rows' => $layout['rows'],
            'cols' => $layout['cols'],
            'cells' => $layout['cells'],
            'gap' => config('layouts.default_style.gap', '8px'),
            'padding' => config('layouts.default_style.padding', '16px')
        ];
    }
}
