<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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

            // Generar nombre único para el archivo (siguiendo el patrón de las imágenes del proyecto)
            $fileName = "images/thumbnails/{$projectId}/{$pageId}_" . time() . ".{$imageType}";
            
            // Guardar archivo en storage/app (igual que las imágenes del proyecto)
            $saved = Storage::put($fileName, $decodedImage);
            
            if ($saved) {
                // Devolver URL pública (igual que las imágenes del proyecto)
                $url = '/storage/' . $fileName;
                Log::info("ThumbnailService: Thumbnail guardado exitosamente: {$fileName}");
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
}
