<?php

namespace App\Http\Controllers\Api\Canvas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProjectImageController extends Controller
{
    /**
     * Subir imágenes del proyecto al servidor
     */
    public function uploadImages(Request $request, $projectId)
    {
        try {
            $request->validate([
                'images' => 'required|array',
                'images.*.filename' => 'required|string',
                'images.*.data' => 'required|string',
                'images.*.type' => 'required|string',
                'images.*.elementId' => 'required|string'
            ]);

            $uploadedImages = [];
            $projectPath = "images/projects/{$projectId}";

            // Crear directorio del proyecto si no existe - USANDO DISCO LOCAL como BasicController
            if (!Storage::exists($projectPath)) {
                Storage::makeDirectory($projectPath);
                Log::info("📁 [IMAGE-UPLOAD] Directorio creado: {$projectPath}");
            }

            foreach ($request->images as $imageData) {
                try {
                    // Decodificar la imagen base64
                    $imageContent = base64_decode($imageData['data']);
                    
                    if ($imageContent === false) {
                        Log::error("❌ [IMAGE-UPLOAD] Error decodificando base64 para: {$imageData['elementId']}");
                        continue;
                    }

                    // Generar nombre único para evitar conflictos
                    $filename = $imageData['filename'];
                    $uniqueFilename = $this->generateUniqueFilename($projectPath, $filename);
                    $fullPath = $projectPath . '/' . $uniqueFilename;

                    // Guardar la imagen en storage/app/ - COMO BasicController
                    $saved = Storage::put($fullPath, $imageContent);

                    if ($saved) {
                        $uploadedImages[] = [
                            'elementId' => $imageData['elementId'],
                            'originalFilename' => $filename,
                            'savedFilename' => $uniqueFilename,
                            'path' => $fullPath,
                            'url' => '/api/canvas/image/' . base64_encode($fullPath), // URL para servir la imagen
                            'size' => strlen($imageContent),
                            'type' => $imageData['type']
                        ];

                        Log::info("✅ [IMAGE-UPLOAD] Imagen guardada: {$imageData['elementId']} -> {$uniqueFilename}");
                    } else {
                        Log::error("❌ [IMAGE-UPLOAD] Error guardando imagen: {$imageData['elementId']}");
                    }

                } catch (\Exception $e) {
                    Log::error("❌ [IMAGE-UPLOAD] Error procesando imagen {$imageData['elementId']}: " . $e->getMessage());
                    continue;
                }
            }

            // Limpiar imágenes antiguas del proyecto (opcional)
            $this->cleanupOldImages($projectPath);

            return response()->json([
                'success' => true,
                'message' => 'Imágenes subidas exitosamente',
                'uploaded_count' => count($uploadedImages),
                'total_requested' => count($request->images),
                'images' => $uploadedImages,
                'project_path' => $projectPath
            ]);

        } catch (\Exception $e) {
            Log::error("❌ [IMAGE-UPLOAD] Error general: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error subiendo imágenes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar nombre único para evitar conflictos
     */
    private function generateUniqueFilename($projectPath, $originalFilename)
    {
        $pathInfo = pathinfo($originalFilename);
        $basename = $pathInfo['filename'];
        $extension = $pathInfo['extension'] ?? 'png';
        
        $counter = 1;
        $uniqueFilename = $originalFilename;
        
        while (Storage::exists($projectPath . '/' . $uniqueFilename)) {
            $uniqueFilename = $basename . '_' . $counter . '.' . $extension;
            $counter++;
        }
        
        return $uniqueFilename;
    }

    /**
     * Limpiar imágenes antiguas del proyecto (mantener solo las últimas 50)
     */
    private function cleanupOldImages($projectPath)
    {
        try {
            $files = Storage::files($projectPath);
            
            if (count($files) > 50) {
                // Ordenar por fecha de modificación
                $filesWithTime = [];
                foreach ($files as $file) {
                    $filesWithTime[] = [
                        'file' => $file,
                        'time' => Storage::lastModified($file)
                    ];
                }
                
                // Ordenar por tiempo (más antiguos primero)
                usort($filesWithTime, function($a, $b) {
                    return $a['time'] - $b['time'];
                });
                
                // Eliminar los más antiguos (mantener solo los últimos 50)
                $filesToDelete = array_slice($filesWithTime, 0, count($filesWithTime) - 50);
                
                foreach ($filesToDelete as $fileData) {
                    Storage::delete($fileData['file']);
                    Log::info("🗑️ [IMAGE-CLEANUP] Imagen antigua eliminada: " . $fileData['file']);
                }
            }
        } catch (\Exception $e) {
            Log::warning("⚠️ [IMAGE-CLEANUP] Error en limpieza: " . $e->getMessage());
        }
    }

    /**
     * Obtener todas las imágenes de un proyecto
     */
    public function getProjectImages($projectId)
    {
        try {
            $projectPath = "images/projects/{$projectId}";
            $files = Storage::files($projectPath);
            
            $images = [];
            foreach ($files as $file) {
                $images[] = [
                    'filename' => basename($file),
                    'path' => $file,
                    'url' => '/api/canvas/image/' . base64_encode($file),
                    'size' => Storage::size($file),
                    'last_modified' => Storage::lastModified($file)
                ];
            }
            
            return response()->json([
                'success' => true,
                'project_id' => $projectId,
                'images_count' => count($images),
                'images' => $images
            ]);
            
        } catch (\Exception $e) {
            Log::error("❌ [IMAGE-LIST] Error listando imágenes: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo imágenes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar imágenes no utilizadas de un proyecto
     */
    public function cleanupUnusedImages(Request $request, $projectId)
    {
        try {
            $request->validate([
                'used_images' => 'required|array'
            ]);

            $projectPath = "images/projects/{$projectId}";
            $allFiles = Storage::files($projectPath);
            $usedImages = $request->used_images;
            
            $deletedCount = 0;
            
            foreach ($allFiles as $file) {
                $filename = basename($file);
                $fileUrl = '/api/canvas/image/' . base64_encode($file);
                
                // Verificar si la imagen está en uso
                $isUsed = false;
                foreach ($usedImages as $usedImage) {
                    if (str_contains($usedImage, $filename) || str_contains($usedImage, $fileUrl)) {
                        $isUsed = true;
                        break;
                    }
                }
                
                if (!$isUsed) {
                    Storage::delete($file);
                    $deletedCount++;
                    Log::info("🗑️ [IMAGE-CLEANUP] Imagen no utilizada eliminada: {$filename}");
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Limpieza completada',
                'deleted_count' => $deletedCount,
                'remaining_count' => count($allFiles) - $deletedCount
            ]);
            
        } catch (\Exception $e) {
            Log::error("❌ [IMAGE-CLEANUP] Error en limpieza: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error en limpieza: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Servir imagen desde storage/app - COMO BasicController
     */
    public function serveImage($encodedPath)
    {
        try {
            $path = base64_decode($encodedPath);
            
            if (!Storage::exists($path)) {
                return response()->json(['error' => 'Imagen no encontrada'], 404);
            }
            
            $file = Storage::get($path);
            $mimeType = Storage::mimeType($path);
            
            return response($file)
                ->header('Content-Type', $mimeType)
                ->header('Cache-Control', 'public, max-age=31536000') // Cache por 1 año
                ->header('Expires', gmdate('D, d M Y H:i:s \G\M\T', time() + 31536000));
                
        } catch (\Exception $e) {
            Log::error("❌ [IMAGE-SERVE] Error sirviendo imagen: " . $e->getMessage());
            return response()->json(['error' => 'Error sirviendo imagen'], 500);
        }
    }
}
