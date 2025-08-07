<?php

namespace App\Http\Controllers\Api\Canvas;

use App\Http\Controllers\Controller;
use App\Services\ThumbnailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
use SoDe\Extend\Crypto;

/**
 * Controlador profesional para el sistema de auto-guardado de proyectos Canvas
 * Maneja guardado automático, manual, carga de imágenes y recuperación de progreso
 * Incluye optimizaciones para evitar errores de max_allowed_packet
 */
class ProjectSaveController extends Controller
{
    // Límites de seguridad para evitar errores de MySQL
    const MAX_MYSQL_PACKET_SIZE = 1048576; // 1MB por defecto en MySQL
    const SAFE_PACKET_RATIO = 0.7; // Usar solo 70% del límite para seguridad
    const MAX_BASE64_IMAGE_SIZE = 500000; // 500KB max para imágenes base64 en auto-save

    /**
     * Guardar progreso automáticamente (optimizado para velocidad y tamaño)
     */
    public function saveProgress(Request $request, $projectId)
    {
        try {
            $request->validate([
                'design_data' => 'required|array',
                'thumbnails' => 'array'
            ]);

            $designData = $request->input('design_data');
            $thumbnails = $request->input('thumbnails', []);

            // 🔧 OPTIMIZACIÓN: Preparar datos para auto-save (sin procesar imágenes grandes)
            $optimizedData = $this->optimizeDataForAutoSave($designData);

            // 🔍 VALIDACIÓN: Verificar tamaño antes de guardar
            $jsonData = json_encode($optimizedData);
            $dataSize = strlen($jsonData);
            $maxSafeSize = self::MAX_MYSQL_PACKET_SIZE * self::SAFE_PACKET_RATIO;

            if ($dataSize > $maxSafeSize) {
                // 🗜️ COMPRESIÓN: Intentar comprimir datos si están muy grandes
                $compressedData = $this->compressLargeData($optimizedData);
                $jsonData = json_encode($compressedData);
                $dataSize = strlen($jsonData);

               

                // Si aún está muy grande, rechazar
                if ($dataSize > $maxSafeSize) {
                    throw new \Exception("Los datos del proyecto son demasiado grandes para auto-save. Tamaño: " . round($dataSize/1024/1024, 2) . "MB");
                }
                
                $optimizedData = $compressedData;
            }

            // Procesar thumbnails si están presentes
            $processedThumbnails = [];
            if (!empty($thumbnails)) {
                
                
                $processedThumbnails = ThumbnailService::processThumbnails($thumbnails, $projectId);
                
            }

            // Usar el modelo Eloquent para encontrar el proyecto
            $project = \App\Models\CanvasProject::findOrFail($projectId);

            // Eloquent se encargará de la codificación JSON automáticamente
            $project->design_data = $optimizedData;
            
            // Solo guardar thumbnails si se procesaron exitosamente
            if (!empty($processedThumbnails)) {
                $project->thumbnails = $processedThumbnails;
            }
            
            $project->progress_saved_at = Carbon::now();
            $project->is_autosave = true;

            $project->save();

         

            return response()->json([
                'success' => true,
                'message' => 'Progreso guardado automáticamente',
                'data' => [
                    'project_id' => $projectId,
                    'saved_at' => $project->progress_saved_at->toIso8601String(),
                    'type' => 'auto_save',
                    'data_size_kb' => round($dataSize / 1024, 2)
                ]
            ]);

        } catch (\Exception $e) {
         

            return response()->json([
                'success' => false,
                'message' => 'Error al guardar el progreso: ' . $e->getMessage(),
                'error_type' => $this->classifyError($e)
            ], 500);
        }
    }

    /**
     * Guardar manualmente (con procesamiento completo de imágenes)
     */
    public function save(Request $request, $projectId)
    {
        try {
            $request->validate([
                'design_data' => 'required|array',
                'thumbnails' => 'array'
            ]);

            $designData = $request->input('design_data');
            $thumbnails = $request->input('thumbnails', []);

            // Verificar que el proyecto existe
            $project = DB::table('canvas_projects')->where('id', $projectId)->first();
            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            // Procesar imágenes base64 y convertirlas a archivos
            $processedData = $this->processImagesInDesignData($designData, $projectId);

            // Procesar thumbnails si están presentes
            $processedThumbnails = [];
            if (!empty($thumbnails)) {
             
                
                $processedThumbnails = ThumbnailService::processThumbnails($thumbnails, $projectId);
                
            }

            // Preparar datos para guardar
            $saveData = [
                'design_data' => json_encode($processedData),
                'manually_saved_at' => Carbon::now(),
                'progress_saved_at' => Carbon::now(),
                'is_finalized' => true,
                'is_autosave' => false,
                'updated_at' => Carbon::now()
            ];

            // Solo guardar thumbnails si se procesaron exitosamente
            if (!empty($processedThumbnails)) {
                $saveData['thumbnails'] = json_encode($processedThumbnails);
            }

            // Actualizar el registro
            DB::table('canvas_projects')
                ->where('id', $projectId)
                ->update($saveData);



            return response()->json([
                'success' => true,
                'message' => 'Proyecto guardado exitosamente',
                'data' => [
                    'project_id' => $projectId,
                    'saved_at' => Carbon::now()->toISOString(),
                    'type' => 'manual_save'
                ]
            ]);

        } catch (\Exception $e) {
        

            return response()->json([
                'success' => false,
                'message' => 'Error al guardar el proyecto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cargar progreso guardado
     */
    public function loadProgress(Request $request, $projectId)
    {
        try {
            $project = DB::table('canvas_projects')->where('id', $projectId)->first();
            
            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $designData = null;
            $thumbnails = [];
            $savedAt = null;

            if ($project->design_data) {
                $designData = json_decode($project->design_data, true);
                $thumbnails = $project->thumbnails ? json_decode($project->thumbnails, true) : [];
                $savedAt = $project->progress_saved_at;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'project_id' => $projectId,
                    'design_data' => $designData,
                    'thumbnails' => $thumbnails,
                    'saved_at' => $savedAt,
                    'is_finalized' => $project->is_finalized,
                    'manually_saved_at' => $project->manually_saved_at
                ]
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Error al cargar el progreso'
            ], 500);
        }
    }

    /**
     * Subir imagen individual (siguiendo el patrón de BasicController)
     */
    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|file|image|max:10240', // 10MB max
                'project_id' => 'required|string',
                'element_id' => 'required|string'
            ]);

            $projectId = $request->input('project_id');
            $elementId = $request->input('element_id');
            $imageFile = $request->file('image');

            // Generar UUID único como en BasicController
            $uuid = \SoDe\Extend\Crypto::randomUUID();
            $extension = $imageFile->getClientOriginalExtension();
            $filename = "{$uuid}.{$extension}";
            
            // Guardar en la estructura de BasicController: images/canvas_project/
            $path = "images/canvas_project/{$filename}";
            
            // Guardar la imagen usando Storage::put como BasicController
            Storage::put($path, file_get_contents($imageFile));
            
            // ✅ FIJO: Establecer permisos 777
            $fullPath = storage_path('app/' . $path);
            if (file_exists($fullPath)) {
                chmod($fullPath, 0777);
            }

          

            return response()->json([
                'success' => true,
                'filename' => $filename,
                'uuid' => $uuid,
                'url' => "/api/canvas_project/media/{$filename}",
                'size' => $imageFile->getSize(),
                'path' => $path
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Error al subir la imagen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Procesar imágenes base64 en los datos de diseño
     */
    private function processImagesInDesignData($designData, $projectId)
    {
        if (!isset($designData['pages']) || !is_array($designData['pages'])) {
            return $designData;
        }

        $processedData = $designData;

        foreach ($processedData['pages'] as &$page) {
            if (!isset($page['cells']) || !is_array($page['cells'])) {
                continue;
            }

            foreach ($page['cells'] as &$cell) {
                if (!isset($cell['elements']) || !is_array($cell['elements'])) {
                    continue;
                }

                foreach ($cell['elements'] as &$element) {
                    if ($element['type'] === 'image' && 
                        isset($element['content']) && 
                        is_string($element['content']) &&
                        strpos($element['content'], 'data:image/') === 0) {
                        
                        try {
                            // Convertir base64 a archivo
                            $filename = $this->saveBase64Image($element['content'], $projectId, $element['id']);
                            // Generar URL usando el endpoint media de CanvasProjectController
                            $element['content'] = "/api/canvas_project/media/{$filename}";
                            $element['is_uploaded'] = true;
                            
                          
                            
                        } catch (\Exception $e) {
                         
                            // Mantener base64 como fallback
                            $element['upload_error'] = $e->getMessage();
                        }
                    }
                }
            }
        }

        return $processedData;
    }

    /**
     * Guardar imagen base64 como archivo (siguiendo el patrón de BasicController)
     */
    private function saveBase64Image($base64Data, $projectId, $elementId)
    {
        // Extraer información de la imagen
        if (!preg_match('/^data:image\/([a-zA-Z]+);base64,(.+)$/', $base64Data, $matches)) {
            throw new \Exception('Formato de imagen base64 inválido');
        }

        $imageType = $matches[1];
        $imageData = base64_decode($matches[2]);

        if ($imageData === false) {
            throw new \Exception('Error decodificando imagen base64');
        }

        // Generar UUID único como en BasicController
        $uuid = \SoDe\Extend\Crypto::randomUUID();
        $filename = "{$uuid}.{$imageType}";
        
        // Guardar en la estructura de BasicController: images/canvas_project/
        $path = "images/canvas_project/{$filename}";

        // Guardar archivo usando Storage::put como BasicController
        Storage::put($path, $imageData);
        
        // ✅ FIJO: Establecer permisos 777
        $fullPath = storage_path('app/' . $path);
        if (file_exists($fullPath)) {
            chmod($fullPath, 0777);
        }

        // Retornar solo el filename (no la URL completa)
        // El frontend deberá usar la ruta del media endpoint
        return $filename;
    }

    /**
     * 🔧 OPTIMIZACIÓN: Preparar datos para auto-save reduciendo tamaño
     */
    private function optimizeDataForAutoSave($designData)
    {
        if (!isset($designData['pages']) || !is_array($designData['pages'])) {
            return $designData;
        }

        $optimizedData = $designData;

        foreach ($optimizedData['pages'] as &$page) {
            if (!isset($page['cells']) || !is_array($page['cells'])) {
                continue;
            }

            foreach ($page['cells'] as &$cell) {
                if (!isset($cell['elements']) || !is_array($cell['elements'])) {
                    continue;
                }

                foreach ($cell['elements'] as &$element) {
                    if ($element['type'] === 'image' && isset($element['content'])) {
                        // 📷 Si es una imagen base64 muy grande, reemplazarla con placeholder
                        if (is_string($element['content']) && 
                            strpos($element['content'], 'data:image/') === 0 && 
                            strlen($element['content']) > self::MAX_BASE64_IMAGE_SIZE) {
                            
                            // Guardar metadatos de la imagen pero no el contenido completo
                            $element['content_placeholder'] = 'large_base64_image';
                            $element['content_size'] = strlen($element['content']);
                            $element['content'] = 'data:image/png;base64,placeholder'; // Placeholder pequeño
                            $element['needs_upload'] = true;

                        
                        }
                    }
                }
            }
        }

        return $optimizedData;
    }

    /**
     * 🗜️ COMPRESIÓN: Comprimir datos grandes eliminando información redundante
     */
    private function compressLargeData($data)
    {
        $compressed = $data;

        // Remover campos opcionales que ocupan mucho espacio
        if (isset($compressed['pages'])) {
            foreach ($compressed['pages'] as &$page) {
                // Remover thumbnails temporales en auto-save
                unset($page['thumbnail_cache']);
                unset($page['preview_cache']);

                if (isset($page['cells'])) {
                    foreach ($page['cells'] as &$cell) {
                        if (isset($cell['elements'])) {
                            foreach ($cell['elements'] as &$element) {
                                // Simplificar filtros por defecto
                                if (isset($element['filters'])) {
                                    $element['filters'] = $this->simplifyFilters($element['filters']);
                                }
                                
                                // Remover caches y datos temporales
                                unset($element['render_cache']);
                                unset($element['transform_cache']);
                            }
                        }
                    }
                }
            }
        }

        return $compressed;
    }

    /**
     * Simplificar filtros removiendo valores por defecto
     */
    private function simplifyFilters($filters)
    {
        $defaults = [
            'brightness' => 100,
            'contrast' => 100,
            'saturation' => 100,
            'tint' => 0,
            'hue' => 0,
            'blur' => 0,
            'scale' => 1,
            'rotate' => 0,
            'opacity' => 100,
            'blendMode' => 'normal'
        ];

        $simplified = [];
        foreach ($filters as $key => $value) {
            // Solo incluir si el valor no es el por defecto
            if (!isset($defaults[$key]) || $value !== $defaults[$key]) {
                $simplified[$key] = $value;
            }
        }

        return $simplified;
    }

    /**
     * 🔍 CLASIFICACIÓN: Clasificar tipo de error para mejor handling
     */
    private function classifyError($exception)
    {
        $message = $exception->getMessage();
        
        if (strpos($message, 'max_allowed_packet') !== false) {
            return 'mysql_packet_size';
        }
        
        if (strpos($message, 'Connection') !== false) {
            return 'database_connection';
        }
        
        if (strpos($message, 'demasiado grandes') !== false) {
            return 'data_too_large';
        }
        
        return 'unknown';
    }
}