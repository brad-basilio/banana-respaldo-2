<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ThumbnailService
{
    /**
     * Convierte un thumbnail base64 a archivo de imagen y devuelve la URL
     */
    public static function saveBase64Thumbnail($base64Data, $projectId, $pageId)
    {
        try {
            // Validar que es base64 válido
            if (!preg_match('/^data:image\/(\w+);base64,/', $base64Data, $matches)) {
                Log::warning("ThumbnailService: Base64 inválido para página {$pageId}");
                return null;
            }

            $imageType = $matches[1];
            $base64String = substr($base64Data, strpos($base64Data, ',') + 1);
            $decodedImage = base64_decode($base64String);

            if ($decodedImage === false) {
                Log::warning("ThumbnailService: Error decodificando base64 para página {$pageId}");
                return null;
            }

            // Obtener el índice de la página desde el pageId
            $pageIndex = self::getPageIndexFromPageId($pageId);
            
            // Crear directorio si no existe
            $projectPath = "images/thumbnails/{$projectId}";
            if (!Storage::exists($projectPath)) {
                Storage::makeDirectory($projectPath);
            }
            
            // 🔄 NUEVA ESTRUCTURA: Usar naming consistente con ThumbnailGeneratorService
            $pdfFilename = "page-{$pageIndex}-pdf.png";        // Para PDFs de alta calidad
            $thumbnailFilename = "page-{$pageIndex}-thumbnail.png"; // Para sidebar
            
            // Guardar como PNG para PDF (alta calidad)
            $pdfPath = "{$projectPath}/{$pdfFilename}";
            $savedPdf = Storage::put($pdfPath, $decodedImage);
            
            if ($savedPdf) {
                // Generar thumbnail pequeño para sidebar usando Intervention Image
                self::generateSidebarThumbnailFromBase64($decodedImage, $projectId, $pageIndex, $thumbnailFilename);
                
                // Devolver URL usando el servicio de imágenes con timestamp para evitar cache
                $encodedPath = base64_encode($pdfPath);
                $timestamp = time();
                $url = "/api/canvas/serve-image/{$encodedPath}?v={$timestamp}";
                Log::info("ThumbnailService: Thumbnail guardado exitosamente: {$pdfFilename}");
                return $url;
            }

        } catch (\Exception $e) {
            Log::error("ThumbnailService: Error guardando thumbnail: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Procesa y convierte todos los thumbnails base64 de un proyecto
     */
    public static function processThumbnails($thumbnailsData, $projectId)
    {
        if (empty($thumbnailsData)) {
            return [];
        }

        $processedThumbnails = [];
        
        // Si es string JSON, decodificar
        if (is_string($thumbnailsData)) {
            $thumbnailsData = json_decode($thumbnailsData, true);
        }

        Log::info("📸 [THUMBNAIL-SERVICE] Procesando thumbnails para proyecto {$projectId}", [
            'thumbnails_recibidos' => array_keys($thumbnailsData ?? []),
            'total_thumbnails' => count($thumbnailsData ?? [])
        ]);

        if (!is_array($thumbnailsData)) {
            return [];
        }

        foreach ($thumbnailsData as $pageId => $thumbnailBase64) {
            // Solo procesar si es base64
            if (strpos($thumbnailBase64, 'data:image/') === 0) {
                $thumbnailUrl = self::saveBase64Thumbnail($thumbnailBase64, $projectId, $pageId);
                
                if ($thumbnailUrl) {
                    $processedThumbnails[$pageId] = $thumbnailUrl;
                } else {
                    // Mantener el base64 original si no se pudo convertir
                    $processedThumbnails[$pageId] = $thumbnailBase64;
                }
            } else {
                // Ya es una URL o path, mantener como está
                $processedThumbnails[$pageId] = $thumbnailBase64;
            }
        }

        return $processedThumbnails;
    }

    /**
     * Elimina thumbnails físicos de un proyecto
     */
    public static function deleteThumbnails($projectId)
    {
        try {
            // Usar el mismo patrón que las imágenes del proyecto
            $thumbnailPath = "images/thumbnails/{$projectId}";
            if (Storage::exists($thumbnailPath)) {
                Storage::deleteDirectory($thumbnailPath);
                Log::info("ThumbnailService: Thumbnails eliminados para proyecto {$projectId}");
            }
        } catch (\Exception $e) {
            Log::error("ThumbnailService: Error eliminando thumbnails: " . $e->getMessage());
        }
    }

    /**
     * Limpia thumbnails base64 de los datos del proyecto antes de guardar
     */
    public static function cleanThumbnailsFromData($data)
    {
        if (is_string($data)) {
            $data = json_decode($data, true);
        }

        if (isset($data['thumbnails'])) {
            unset($data['thumbnails']);
        }

        return $data;
    }

    /**
     * Obtiene el índice de la página desde el pageId
     */
    private static function getPageIndexFromPageId($pageId)
    {
        // Si el pageId ya es un número, usarlo directamente
        if (is_numeric($pageId)) {
            return (int)$pageId;
        }
        
        // Casos especiales para portada y contraportada
        if ($pageId === 'page-cover') {
            return 0;
        }
        
        if ($pageId === 'page-final') {
            // La contraportada va al final, necesitamos calcular el índice correcto
            // Por ahora, usar un índice alto (22) que debería funcionar para la mayoría de casos
            return 22;
        }
        
        // Intentar extraer el número del pageId (ej: "page-content-2" -> 2)
        if (preg_match('/page-content-(\d+)/', $pageId, $matches)) {
            return (int)$matches[1];
        }
        
        // Intentar extraer el número del pageId (ej: "page-2" -> 2)
        if (preg_match('/page-(\d+)/', $pageId, $matches)) {
            return (int)$matches[1];
        }
        
        // Si no se puede extraer, intentar con el final del pageId
        if (preg_match('/(\d+)$/', $pageId, $matches)) {
            return (int)$matches[1];
        }
        
        // Por defecto, retornar 0
        return 0;
    }

    /**
     * Generar thumbnail pequeño para sidebar usando Intervention Image
     */
    private static function generateSidebarThumbnailFromBase64($imageData, $projectId, $pageIndex, $filename)
    {
        try {
            // Crear manager de Intervention Image v3
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            
            // Crear imagen con Intervention Image v3
            $image = $manager->read($imageData);
            
            // Redimensionar para sidebar (1200x1600 px) manteniendo aspecto
            $image->scale(1200, 1600);
            
            // Guardar en storage/app/images/thumbnails para mantener consistencia
            $sidebarPath = "images/thumbnails/{$projectId}";
            $sidebarFullPath = "{$sidebarPath}/{$filename}";
            
            // Crear directorio si no existe
            if (!Storage::exists($sidebarPath)) {
                Storage::makeDirectory($sidebarPath);
            }
            
            // Guardar como PNG para sidebar usando Storage::put
            $image->save(storage_path("app/{$sidebarFullPath}"));
            
            Log::info("✅ [THUMBNAIL-SERVICE] Thumbnail sidebar generado: {$filename}");
            
        } catch (\Exception $e) {
            Log::error("❌ [THUMBNAIL-SERVICE] Error generando thumbnail sidebar: " . $e->getMessage());
            // No lanzar excepción, solo log del error
        }
    }

    /**
     * Cargar thumbnails existentes desde archivos para un proyecto
     */
    public static function loadExistingThumbnails($projectId, $pages = [])
    {
        $thumbnails = [];
        
        try {
            $projectPath = "images/thumbnails/{$projectId}";
            
            Log::info("📸 [THUMBNAIL-SERVICE] Cargando thumbnails existentes para proyecto {$projectId}", [
                'path' => $projectPath,
                'pages_count' => count($pages)
            ]);
            
            if (Storage::exists($projectPath)) {
                // Buscar archivos de thumbnail para cada página
                foreach ($pages as $index => $page) {
                    $pageId = $page['id'] ?? "page-{$index}";
                    $thumbnailFilename = "page-{$index}-thumbnail.png";
                    $thumbnailPath = "{$projectPath}/{$thumbnailFilename}";
                    
                    Log::info("📸 [THUMBNAIL-SERVICE] Verificando thumbnail", [
                        'page_id' => $pageId,
                        'index' => $index,
                        'filename' => $thumbnailFilename,
                        'path' => $thumbnailPath,
                        'exists' => Storage::exists($thumbnailPath)
                    ]);
                    
                    if (Storage::exists($thumbnailPath)) {
                        // Generar URL para el thumbnail con timestamp para evitar cache
                        $encodedPath = base64_encode($thumbnailPath);
                        $timestamp = Storage::lastModified($thumbnailPath);
                        $thumbnails[$pageId] = "/api/canvas/serve-image/{$encodedPath}?v={$timestamp}";
                        
                        Log::info("📸 [THUMBNAIL-SERVICE] Thumbnail encontrado", [
                            'page_id' => $pageId,
                            'url' => $thumbnails[$pageId]
                        ]);
                    }
                }
            }
            
            Log::info("📸 [THUMBNAIL-SERVICE] Thumbnails cargados", [
                'thumbnails_encontrados' => array_keys($thumbnails),
                'total_thumbnails' => count($thumbnails)
            ]);
        } catch (\Exception $e) {
            Log::error("ThumbnailService: Error cargando thumbnails existentes: " . $e->getMessage());
        }
        
        return $thumbnails;
    }
}
