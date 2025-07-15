<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CanvasProject;
use App\Services\ThumbnailGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ThumbnailController extends Controller
{
    protected $thumbnailService;

    public function __construct(ThumbnailGeneratorService $thumbnailService)
    {
        $this->thumbnailService = $thumbnailService;
    }

    /**
     * Genera thumbnails de alta calidad para todas las páginas del proyecto
     */
    public function generateProjectThumbnails(Request $request, $projectId)
    {
        try {
            Log::info("🖼️ [THUMBNAIL] Iniciando generación de thumbnails para proyecto: {$projectId}");

            $project = CanvasProject::findOrFail($projectId);
            
            // Obtener páginas del request o del proyecto
            $pages = $request->get('pages');
            if (!$pages && $project->design_data) {
                $designData = is_string($project->design_data) 
                    ? json_decode($project->design_data, true) 
                    : $project->design_data;
                $pages = $designData['pages'] ?? [];
            }

            if (empty($pages)) {
                return response()->json(['error' => 'No se encontraron páginas'], 400);
            }

            // Configuración de thumbnails
            $config = [
                'width' => $request->get('width', 800),
                'height' => $request->get('height', 600),
                'quality' => $request->get('quality', 95),
                'scale' => $request->get('scale', 4), // 4x para alta calidad
                'dpi' => $request->get('dpi', 300), // 300 DPI para impresión
            ];

            // Generar thumbnails
            $thumbnails = $this->thumbnailService->generateHighQualityThumbnails(
                $project, 
                $pages, 
                $config
            );

            Log::info("✅ [THUMBNAIL] Generados " . count($thumbnails) . " thumbnails");

            return response()->json([
                'success' => true,
                'thumbnails' => $thumbnails,
                'project_id' => $projectId,
                'total_pages' => count($pages),
                'config' => $config
            ]);

        } catch (\Exception $e) {
            Log::error("❌ [THUMBNAIL] Error: " . $e->getMessage());
            return response()->json(['error' => 'Error generando thumbnails'], 500);
        }
    }

    /**
     * Genera thumbnail de alta calidad para una página específica
     */
    public function generatePageThumbnail(Request $request, $projectId, $pageIndex)
    {
        try {
            Log::info("🖼️ [THUMBNAIL] Generando thumbnail para página {$pageIndex}");

            $project = CanvasProject::findOrFail($projectId);
            
            // Obtener página específica
            $pages = $request->get('pages');
            if (!$pages && $project->design_data) {
                $designData = is_string($project->design_data) 
                    ? json_decode($project->design_data, true) 
                    : $project->design_data;
                $pages = $designData['pages'] ?? [];
            }

            if (!isset($pages[$pageIndex])) {
                return response()->json(['error' => 'Página no encontrada'], 404);
            }

            $config = [
                'width' => $request->get('width', 800),
                'height' => $request->get('height', 600),
                'quality' => $request->get('quality', 95),
                'scale' => $request->get('scale', 4),
                'dpi' => $request->get('dpi', 300),
            ];

            $thumbnail = $this->thumbnailService->generatePageThumbnail(
                $project, 
                $pages[$pageIndex], 
                $pageIndex, 
                $config
            );

            return response()->json([
                'success' => true,
                'thumbnail' => $thumbnail,
                'page_index' => $pageIndex,
                'project_id' => $projectId
            ]);

        } catch (\Exception $e) {
            Log::error("❌ [THUMBNAIL] Error: " . $e->getMessage());
            return response()->json(['error' => 'Error generando thumbnail'], 500);
        }
    }

    /**
     * Obtiene los thumbnails guardados de un proyecto
     */
    public function getProjectThumbnails($projectId)
    {
        try {
            $project = CanvasProject::findOrFail($projectId);
            
            $thumbnails = $this->thumbnailService->getStoredThumbnails($project);

            return response()->json([
                'success' => true,
                'thumbnails' => $thumbnails,
                'project_id' => $projectId
            ]);

        } catch (\Exception $e) {
            Log::error("❌ [THUMBNAIL] Error obteniendo thumbnails: " . $e->getMessage());
            return response()->json(['error' => 'Error obteniendo thumbnails'], 500);
        }
    }

    /**
     * Elimina thumbnails de un proyecto
     */
    public function deleteProjectThumbnails($projectId)
    {
        try {
            $project = CanvasProject::findOrFail($projectId);
            
            $deleted = $this->thumbnailService->deleteStoredThumbnails($project);

            return response()->json([
                'success' => true,
                'deleted' => $deleted,
                'project_id' => $projectId
            ]);

        } catch (\Exception $e) {
            Log::error("❌ [THUMBNAIL] Error eliminando thumbnails: " . $e->getMessage());
            return response()->json(['error' => 'Error eliminando thumbnails'], 500);
        }
    }
}
