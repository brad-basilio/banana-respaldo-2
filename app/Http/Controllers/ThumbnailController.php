<?php

namespace App\Http\Controllers;

use App\Models\CanvasProject;
use App\Services\ThumbnailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ThumbnailController extends Controller
{
    /**
     * Cargar thumbnails existentes desde archivos
     */
    public function loadExistingThumbnails(Request $request, $projectId)
    {
        try {
            $pages = $request->input('pages', []);
            
            // Cargar thumbnails existentes usando ThumbnailService
            $existingThumbnails = ThumbnailService::loadExistingThumbnails($projectId, $pages);
            
            Log::info("📸 [THUMBNAIL-CONTROLLER] Thumbnails existentes cargados para proyecto {$projectId}", [
                'count' => count($existingThumbnails)
            ]);
            
            return response()->json($existingThumbnails);
            
        } catch (\Exception $e) {
            Log::error("❌ [THUMBNAIL-CONTROLLER] Error cargando thumbnails existentes: " . $e->getMessage());
            return response()->json([], 500);
        }
    }
}
