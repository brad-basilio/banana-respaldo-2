<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\CanvasPreset;
use App\Models\CanvasProject;
use App\Services\ThumbnailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CanvasController extends Controller
{
    /**
     * Create a new canvas project for an item
     */
    public function createProject(Request $request)
    {
        try {
            $request->validate([
                'id' => 'sometimes|string|uuid',
                'item_id' => 'required|exists:items,id',
                'canvas_preset_id' => 'required|exists:canvas_presets,id',
                'name' => 'string|max:255',
                'design_data' => 'sometimes|array',
                'status' => 'sometimes|string|in:draft,completed,exported,ordered',
            ]);

            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Obtener el item y el preset
            $item = Item::with('canvasPreset')->findOrFail($request->item_id);
            $canvasPreset = $item->canvasPreset;

            if (!$canvasPreset) {
                return response()->json(['error' => 'Este producto no tiene configuración de canvas'], 400);
            }

            // Crear o actualizar el proyecto
            $projectId = $request->id ?? (string) Str::uuid();
            
            // Intentar encontrar proyecto existente si se proporciona ID
            $project = null;
            if ($request->id) {
                $project = CanvasProject::find($request->id);
            }
            
            if ($project) {
                // Actualizar proyecto existente
                $project->update([
                    'user_id' => $user->id,
                    'item_id' => $item->id,
                    'canvas_preset_id' => $canvasPreset->id,
                    'name' => $request->name ?? $project->name ?? "Proyecto {$item->name}",
                    'project_data' => $this->generateInitialProjectData($item, $canvasPreset),
                    'status' => $request->status ?? $project->status ?? 'draft',
                ]);
            } else {
                // Crear nuevo proyecto
                $project = CanvasProject::create([
                    'id' => $projectId,
                    'user_id' => $user->id,
                    'item_id' => $item->id,
                    'canvas_preset_id' => $canvasPreset->id,
                    'name' => $request->name ?? "Proyecto {$item->name}",
                    'project_data' => $this->generateInitialProjectData($item, $canvasPreset),
                    'status' => $request->status ?? 'draft',
                ]);
            }

            return response()->json([
                'id' => $project->id,
                'message' => 'Proyecto creado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al crear el proyecto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate initial project data based on item and preset
     */
    private function generateInitialProjectData($item, $canvasPreset)
    {
        $pages = [];
        $totalPages = $canvasPreset->pages ?? 20; // Usar páginas del preset
        
        // Crear una imagen base por defecto o usar la imagen del item
        $baseImageUrl = isset($item->image) ? "/storage/images/item/{$item->image}" : "/api/cover/thumbnail/null";

        // Página de portada
        $pages[] = [
            'id' => 'page-cover',
            'type' => 'cover',
            'layout' => 'layout-1',
            'cells' => [[
                'id' => 'cell-cover-1',
                'elements' => [
                    [
                        'id' => 'cover-base',
                        'type' => 'text',
                        'content' => $item->name ?? 'Mi Álbum',
                        'position' => ['x' => 10, 'y' => 10],
                        'size' => ['width' => 80, 'height' => 20],
                        'style' => [
                            'fontSize' => '24px',
                            'fontFamily' => 'Arial',
                            'color' => '#000000',
                            'fontWeight' => 'bold',
                            'textAlign' => 'center'
                        ],
                        'zIndex' => 1
                    ],
                    // Imagen del item si existe
                    ...(isset($item->image) && $item->image ? [[
                        'id' => 'cover-image',
                        'type' => 'image',
                        'content' => $baseImageUrl,
                        'position' => ['x' => 25, 'y' => 30],
                        'size' => ['width' => 50, 'height' => 50],
                        'filters' => new \stdClass(),
                        'mask' => 'none',
                        'zIndex' => 2
                    ]] : [])
                ]
            ]]
        ];

        // Páginas de contenido
        for ($i = 1; $i <= $totalPages; $i++) {
            $pages[] = [
                'id' => "page-content-{$i}",
                'type' => 'content',
                'pageNumber' => $i,
                'layout' => 'layout-1',
                'cells' => [[
                    'id' => "cell-content-{$i}-1",
                    'elements' => [
                        [
                            'id' => "content-text-{$i}",
                            'type' => 'text',
                            'content' => "Página {$i}",
                            'position' => ['x' => 5, 'y' => 5],
                            'size' => ['width' => 90, 'height' => 10],
                            'style' => [
                                'fontSize' => '16px',
                                'fontFamily' => 'Arial',
                                'color' => '#666666',
                                'textAlign' => 'center'
                            ],
                            'zIndex' => 1
                        ]
                    ]
                ]]
            ];
        }

        // Página final/contraportada
        $pages[] = [
            'id' => 'page-final',
            'type' => 'final',
            'layout' => 'layout-1',
            'cells' => [[
                'id' => 'cell-final-1',
                'elements' => [
                    [
                        'id' => 'final-text',
                        'type' => 'text',
                        'content' => 'Fin',
                        'position' => ['x' => 40, 'y' => 45],
                        'size' => ['width' => 20, 'height' => 10],
                        'style' => [
                            'fontSize' => '18px',
                            'fontFamily' => 'Arial',
                            'color' => '#000000',
                            'textAlign' => 'center'
                        ],
                        'zIndex' => 1
                    ]
                ]
            ]]
        ];

        return [
            'pages' => $pages,
            'currentPage' => 0,
            'workspaceSize' => 'preset',
            'canvasConfig' => [
                'width' => $canvasPreset->width,
                'height' => $canvasPreset->height,
                'dpi' => $canvasPreset->dpi,
                'backgroundColor' => $canvasPreset->background_color
            ]
        ];
    }

    /**
     * Show the canvas editor for a specific project
     */
    public function editor($projectId)
    {
        // Verificar que el usuario esté autenticado
        if (!Auth::check()) {
            return redirect()->route('login')->with('message', 'Debes iniciar sesión para acceder al editor.');
        }

        // Obtener el proyecto
        $project = CanvasProject::with(['item', 'canvasPreset', 'user'])
            ->where('id', $projectId)
            ->where('user_id', Auth::id()) // Solo proyectos del usuario actual
            ->firstOrFail();

        return Inertia::render('Canvas/Editor', [
            'project' => $project,
            'item' => $project->item,
            'canvasPreset' => $project->canvasPreset,
            'initialProject' => $project->project_data,
        ]);
    }

    /**
     * Save canvas project data
     */
    public function save(Request $request, $projectId = null)
    {
        try {
            // Obtener el project_id de la URL o del body de la request
            $projectId = $projectId ?: $request->project_id;
            
            if (!$projectId) {
                return response()->json(['error' => 'Project ID es requerido'], 400);
            }

            $request->validate([
                'project_data' => 'required|array',
                'thumbnails' => 'sometimes|array'
            ]);

            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Obtener el proyecto
            $project = CanvasProject::where('id', $projectId)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // Procesar thumbnails si están presentes
            $processedThumbnails = [];
            if ($request->has('thumbnails') && !empty($request->thumbnails)) {
                Log::info("🖼️ [THUMBNAIL] Procesando thumbnails para proyecto {$projectId}", [
                    'thumbnail_count' => count($request->thumbnails)
                ]);
                
                $processedThumbnails = ThumbnailService::processThumbnails(
                    $request->thumbnails, 
                    $projectId
                );
                
                Log::info("✅ [THUMBNAIL] Thumbnails procesados: " . count($processedThumbnails));
            }

            // Limpiar thumbnails base64 de los datos del proyecto para optimizar almacenamiento
            $cleanProjectData = ThumbnailService::cleanThumbnailsFromData($request->project_data);

            // Actualizar los datos del proyecto
            $updateData = [
                'project_data' => $cleanProjectData,
                'status' => 'draft', // Mantener como borrador mientras se edita
            ];

            // Solo guardar thumbnails si se procesaron exitosamente
            if (!empty($processedThumbnails)) {
                $updateData['thumbnails'] = json_encode($processedThumbnails);
            }

            $project->update($updateData);

            return response()->json([
                'id' => $project->id,
                'message' => 'Proyecto guardado exitosamente',
                'project' => $project,
                'thumbnails_processed' => count($processedThumbnails)
            ]);

        } catch (\Exception $e) {
            Log::error("❌ [SAVE] Error guardando proyecto: " . $e->getMessage());
            return response()->json([
                'error' => 'Error al guardar el proyecto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export canvas project to PDF/image
     */
    public function export($projectId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $project = CanvasProject::where('id', $projectId)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // TODO: Implementar lógica de exportación a PDF/imagen
            // Por ahora solo marcamos como exportado
            $project->update(['status' => 'exported']);

            return response()->json([
                'message' => 'Proyecto exportado exitosamente',
                'download_url' => '/storage/exports/' . $project->id . '.pdf' // Placeholder
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al exportar el proyecto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * List user's canvas projects
     */
    public function list()
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $projects = CanvasProject::with(['item', 'canvasPreset'])
                ->where('user_id', $user->id)
                ->orderBy('updated_at', 'desc')
                ->get();

            return response()->json($projects);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener los proyectos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a canvas project
     */
    public function delete($projectId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $project = CanvasProject::where('id', $projectId)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $project->delete();

            return response()->json([
                'message' => 'Proyecto eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al eliminar el proyecto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get project data for API
     */
    public function getProject($projectId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Obtener el proyecto con todas las relaciones necesarias
            $project = CanvasProject::with(['item', 'canvasPreset', 'user'])
                ->where('id', $projectId)
                ->where('user_id', $user->id) // Solo proyectos del usuario actual
                ->firstOrFail();

            return response()->json([
                'project' => $project,
                'item' => $project->item,
                'canvasPreset' => $project->canvasPreset,
                'initialProject' => $project->project_data,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener el proyecto: ' . $e->getMessage()
            ], 404);
        }
    }
}
