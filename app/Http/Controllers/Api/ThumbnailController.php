<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CanvasProject;
use App\Services\ThumbnailGeneratorService;
use App\Services\ThumbnailService;
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
            // Configuración optimizada para PDFs de ALTA CALIDAD
            $config = [
                'width' => $request->get('width', 1000),  // 🚀 4000px con scale 4
                'height' => $request->get('height', 800), // 🚀 3200px con scale 4
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


            return response()->json([
                'success' => true,
                'thumbnails' => $thumbnails,
                'project_id' => $projectId,
                'total_pages' => count($pages),
                'config' => $config
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error generando thumbnails'], 500);
        }
    }

    /**
     * Genera thumbnail de alta calidad para una página específica
     */
    public function generatePageThumbnail(Request $request, $projectId, $pageIndex)
    {
        try {

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
                'width' => $request->get('width', 1000),  // 🚀 4000px con scale 4  
                'height' => $request->get('height', 800), // 🚀 3200px con scale 4
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
            return response()->json(['error' => 'Error obteniendo thumbnails'], 500);
        }
    }

    /**
     * Guarda thumbnails base64 como archivos
     */
    public function saveThumbnailsAsFiles(Request $request, $projectId)
    {
        try {

            $project = CanvasProject::findOrFail($projectId);
            $thumbnails = $request->get('thumbnails', []);

            if (empty($thumbnails)) {
                return response()->json(['error' => 'No se proporcionaron thumbnails'], 400);
            }

            $savedThumbnails = [];
            
            foreach ($thumbnails as $thumbnail) {
                if (!isset($thumbnail['page_id']) || !isset($thumbnail['thumbnail_data'])) {
                    continue;
                }
                
                $pageId = $thumbnail['page_id'];
                $thumbnailData = $thumbnail['thumbnail_data'];
                
                // Validar que sea base64
                if (!str_starts_with($thumbnailData, 'data:image/')) {
                    continue;
                }
                
                // 🚀 OPTIMIZACIÓN: Guardar como archivo WebP usando ThumbnailService
                $thumbnailUrl = ThumbnailService::saveBase64Thumbnail($thumbnailData, $projectId, $pageId);
                
                if ($thumbnailUrl) {
                    $savedThumbnails[] = [
                        'page_id' => $pageId,
                        'thumbnail_url' => $thumbnailUrl,
                        'status' => 'saved'
                    ];
                } else {
                  //  Log::error("❌ [THUMBNAIL] Error guardando thumbnail para página: {$pageId}");
                }
            }

            return response()->json([
                'success' => true,
                'saved_thumbnails' => $savedThumbnails,
                'project_id' => $projectId,
                'total_saved' => count($savedThumbnails)
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error guardando thumbnails como archivos'], 500);
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
            return response()->json(['error' => 'Error eliminando thumbnails'], 500);
        }
    }

    /**
     * Cargar thumbnails existentes desde archivos
     */
    public function loadExistingThumbnails(Request $request, $projectId)
    {
        try {
            $pages = $request->input('pages', []);
            
            // Cargar thumbnails existentes usando ThumbnailService
            $existingThumbnails = ThumbnailService::loadExistingThumbnails($projectId, $pages);
            
          
            
            return response()->json($existingThumbnails);
            
        } catch (\Exception $e) {
            return response()->json([], 500);
        }
    }
}
