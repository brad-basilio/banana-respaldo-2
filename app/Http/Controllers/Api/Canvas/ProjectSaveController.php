<?php

namespace App\Http\Controllers\Api\Canvas;

use App\Http\Controllers\Controller;
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
 */
class ProjectSaveController extends Controller
{
    /**
     * Guardar progreso automáticamente (sin procesar imágenes)
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

            // Verificar que el proyecto existe
            $project = DB::table('canvas_projects')->where('id', $projectId)->first();
            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            // Preparar datos para guardar
            $saveData = [
                'design_data' => json_encode($designData),
                'thumbnails' => json_encode($thumbnails),
                'progress_saved_at' => Carbon::now(),
                'is_autosave' => true,
                'updated_at' => Carbon::now()
            ];

            // Actualizar el registro
            DB::table('canvas_projects')
                ->where('id', $projectId)
                ->update($saveData);

            Log::info("Auto-save exitoso para proyecto {$projectId}", [
                'project_id' => $projectId,
                'data_size' => strlen(json_encode($designData)),
                'pages_count' => count($designData['pages'] ?? [])
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Progreso guardado automáticamente',
                'data' => [
                    'project_id' => $projectId,
                    'saved_at' => Carbon::now()->toISOString(),
                    'type' => 'auto_save'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Error en auto-save para proyecto {$projectId}: " . $e->getMessage(), [
                'project_id' => $projectId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al guardar el progreso: ' . $e->getMessage()
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

            // Preparar datos para guardar
            $saveData = [
                'design_data' => json_encode($processedData),
                'thumbnails' => json_encode($thumbnails),
                'manually_saved_at' => Carbon::now(),
                'progress_saved_at' => Carbon::now(),
                'is_finalized' => true,
                'is_autosave' => false,
                'updated_at' => Carbon::now()
            ];

            // Actualizar el registro
            DB::table('canvas_projects')
                ->where('id', $projectId)
                ->update($saveData);

            Log::info("Guardado manual exitoso para proyecto {$projectId}", [
                'project_id' => $projectId,
                'data_size' => strlen(json_encode($processedData)),
                'pages_count' => count($processedData['pages'] ?? [])
            ]);

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
            Log::error("Error en guardado manual para proyecto {$projectId}: " . $e->getMessage(), [
                'project_id' => $projectId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

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
            Log::error("Error cargando progreso para proyecto {$projectId}: " . $e->getMessage());

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

            Log::info("Imagen subida exitosamente", [
                'project_id' => $projectId,
                'element_id' => $elementId,
                'filename' => $filename,
                'uuid' => $uuid,
                'size' => $imageFile->getSize()
            ]);

            return response()->json([
                'success' => true,
                'filename' => $filename,
                'uuid' => $uuid,
                'url' => "/api/canvas_project/media/{$filename}",
                'size' => $imageFile->getSize(),
                'path' => $path
            ]);

        } catch (\Exception $e) {
            Log::error("Error subiendo imagen: " . $e->getMessage());

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
                            
                            Log::info("Imagen base64 procesada", [
                                'element_id' => $element['id'],
                                'project_id' => $projectId,
                                'filename' => $filename
                            ]);
                            
                        } catch (\Exception $e) {
                            Log::warning("Error procesando imagen base64", [
                                'element_id' => $element['id'],
                                'error' => $e->getMessage()
                            ]);
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

        // Retornar solo el filename (no la URL completa)
        // El frontend deberá usar la ruta del media endpoint
        return $filename;
    }
}