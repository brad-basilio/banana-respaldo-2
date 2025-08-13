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
                return null;
            }

            $imageType = $matches[1];
            $base64String = substr($base64Data, strpos($base64Data, ',') + 1);
            $decodedImage = base64_decode($base64String);

            if ($decodedImage === false) {
                return null;
            }

            // Obtener el índice de la página desde el pageId
            $pageIndex = self::getPageIndexFromPageId($pageId);
            
            // Crear directorio si no existe
            $projectPath = "images/thumbnails/{$projectId}";
            if (!Storage::exists($projectPath)) {
                $fullPath = storage_path('app/' . $projectPath);
                if (!file_exists($fullPath)) {
                    mkdir($fullPath, 0775, true); // Crear con permisos 775 recursivamente
                }
            }
            
            // � NUEVA ESTRUCTURA: Usar WebP para mejor compresión
            $pdfFilename = "page-{$pageIndex}-pdf.webp";        // Para PDFs de alta calidad
            $thumbnailFilename = "page-{$pageIndex}-thumbnail.webp"; // Para sidebar
            
            // 🔧 OPTIMIZACIÓN: Convertir a WebP usando Intervention Image
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $image = $manager->read($decodedImage);
            
            // Guardar como WebP para PDF (alta calidad - 95% calidad)
            $pdfPath = "{$projectPath}/{$pdfFilename}";
            $pdfFullPath = storage_path("app/{$pdfPath}");
            $image->toWebp(95)->save($pdfFullPath);
            
            // Generar thumbnail pequeño para sidebar
            self::generateSidebarThumbnailFromImage($image, $projectId, $pageIndex, $thumbnailFilename);
            
            // Devolver URL usando timestamp para evitar cache
            $timestamp = time();
            return "/storage/images/thumbnails/{$projectId}/{$thumbnailFilename}?v={$timestamp}";

        } catch (\Exception $e) {
           Log::error("ThumbnailService: Error guardando thumbnail WebP: " . $e->getMessage());
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
            }
        } catch (\Exception $e) {
           // Log::error("ThumbnailService: Error eliminando thumbnails: " . $e->getMessage());
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
     * Generar thumbnail pequeño para sidebar usando Intervention Image con WebP
     */
    private static function generateSidebarThumbnailFromImage($image, $projectId, $pageIndex, $filename)
    {
        try {
            // Clonar la imagen para no afectar la original
            $sidebarImage = clone $image;
            
            // Redimensionar para sidebar (1200x1600 px) manteniendo aspecto
            $sidebarImage->scale(1200, 1600);
            
            // Guardar en storage/app/images/thumbnails para mantener consistencia
            $sidebarPath = "images/thumbnails/{$projectId}";
            $sidebarFullPath = "{$sidebarPath}/{$filename}";
            
            // Crear directorio si no existe
            if (!Storage::exists($sidebarPath)) {
                $fullPath = storage_path('app/' . $sidebarPath);
                if (!file_exists($fullPath)) {
                    mkdir($fullPath, 0775, true); // Crear con permisos 775 recursivamente
                }
            }
            
            // 🚀 OPTIMIZACIÓN: Guardar como WebP para sidebar (85% calidad para tamaño óptimo)
            $sidebarImage->toWebp(85)->save(storage_path("app/{$sidebarFullPath}"));
            
        } catch (\Exception $e) {
            Log::error("ThumbnailService: Error generando thumbnail sidebar WebP: " . $e->getMessage());
        }
    }

    /**
     * Generar thumbnail pequeño para sidebar usando Intervention Image (LEGACY - para base64)
     */
    private static function generateSidebarThumbnailFromBase64($imageData, $projectId, $pageIndex, $filename)
    {
        try {
            // Crear manager de Intervention Image v3
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            
            // Crear imagen con Intervention Image v3
            $image = $manager->read($imageData);
            
            // Usar la nueva función con WebP
            self::generateSidebarThumbnailFromImage($image, $projectId, $pageIndex, $filename);
            
        } catch (\Exception $e) {
            Log::error("ThumbnailService: Error en generateSidebarThumbnailFromBase64: " . $e->getMessage());
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
            
            if (Storage::exists($projectPath)) {
                // Buscar archivos de thumbnail para cada página
                foreach ($pages as $index => $page) {
                    $pageId = $page['id'] ?? "page-{$index}";
                    
                    // 🚀 OPTIMIZACIÓN: Buscar archivos WebP primero, PNG como fallback
                    $thumbnailFilenameWebP = "page-{$index}-thumbnail.webp";
                    $thumbnailFilenamePNG = "page-{$index}-thumbnail.png";
                    
                    $thumbnailPathWebP = "{$projectPath}/{$thumbnailFilenameWebP}";
                    $thumbnailPathPNG = "{$projectPath}/{$thumbnailFilenamePNG}";
                    
                    if (Storage::exists($thumbnailPathWebP)) {
                        // Usar WebP si existe
                        $timestamp = Storage::lastModified($thumbnailPathWebP);
                        $thumbnails[$pageId] = "/storage/images/thumbnails/{$projectId}/{$thumbnailFilenameWebP}?v={$timestamp}";
                    } elseif (Storage::exists($thumbnailPathPNG)) {
                        // Fallback a PNG si existe
                        $timestamp = Storage::lastModified($thumbnailPathPNG);
                        $thumbnails[$pageId] = "/storage/images/thumbnails/{$projectId}/{$thumbnailFilenamePNG}?v={$timestamp}";
                    }
                }
            }
            
        } catch (\Exception $e) {
           Log::error("ThumbnailService: Error cargando thumbnails existentes: " . $e->getMessage());
        }
        
        return $thumbnails;
    }
}
