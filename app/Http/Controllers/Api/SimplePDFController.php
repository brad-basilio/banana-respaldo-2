<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CanvasProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Dompdf\Dompdf;
use Dompdf\Options;

class SimplePDFController extends Controller
{
    public function generatePDF(Request $request, $projectId)
    {
        try {
            Log::info("🖨️ [SIMPLE-PDF] Iniciando generación para proyecto: {$projectId}");
            
            // Buscar proyecto
            $project = CanvasProject::findOrFail($projectId);
            Log::info("✅ [SIMPLE-PDF] Proyecto encontrado: " . $project->name);
            
            // Verificar design_data
            if (empty($project->design_data)) {
                return response()->json(['error' => 'Proyecto sin datos de diseño'], 404);
            }
            
            $designData = is_string($project->design_data) 
                ? json_decode($project->design_data, true) 
                : $project->design_data;
                
            if (!isset($designData['pages']) || empty($designData['pages'])) {
                return response()->json(['error' => 'Proyecto sin páginas'], 404);
            }
            
            $pages = $designData['pages'];
            Log::info("✅ [SIMPLE-PDF] Encontradas " . count($pages) . " páginas");
            
            // Configurar DomPDF con configuración robusta
            $options = new Options();
            $options->set('isRemoteEnabled', true);
            $options->set('isHtml5ParserEnabled', true);
            $options->set('defaultFont', 'Arial');
            $options->set('dpi', 300);
            $options->set('defaultPaperSize', 'A4');
            $options->set('defaultPaperOrientation', 'landscape');
            
            // Crear instancia DomPDF
            $dompdf = new Dompdf($options);
            
            // Crear HTML optimizado para todas las páginas con contenido real
            $html = '<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    @page { 
                        margin: 0; 
                        size: A4 landscape; 
                    }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        font-family: Arial, sans-serif; 
                    }
                    .page { 
                        width: 297mm; 
                        height: 210mm; 
                        page-break-after: always; 
                        position: relative;
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                        box-sizing: border-box;
                    }
                    .page:last-child { 
                        page-break-after: avoid; 
                    }
                    .page-cells {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        display: grid;
                        gap: 16px;
                        padding: 16px;
                        box-sizing: border-box;
                    }
                    .cell {
                        position: relative;
                        overflow: hidden;
                        border-radius: 8px;
                    }
                    .element {
                        position: absolute;
                        max-width: 100%;
                        max-height: 100%;
                    }
                    .element-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: inherit;
                    }
                    .element-text {
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        line-height: 1.4;
                    }
                    /* Grid layouts */
                    .grid-1 { grid-template-columns: 1fr; }
                    .grid-2-horizontal { grid-template-columns: 1fr 1fr; }
                    .grid-2-vertical { grid-template-rows: 1fr 1fr; }
                    .grid-3-horizontal { grid-template-columns: 1fr 1fr 1fr; }
                    .grid-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
                </style>
            </head>
            <body>';
            
            // Agregar cada página con su contenido real
            foreach ($pages as $index => $page) {
                $pageNumber = $index + 1;
                $pageType = $page['type'] ?? 'content';
                $backgroundImage = '';
                
                // Manejar imagen de fondo de forma segura
                if (isset($page['backgroundImage']) && !empty($page['backgroundImage'])) {
                    $imagePath = public_path($page['backgroundImage']);
                    if (file_exists($imagePath)) {
                        // Convertir imagen a base64 para embeber
                        $imageData = base64_encode(file_get_contents($imagePath));
                        $imageType = pathinfo($imagePath, PATHINFO_EXTENSION);
                        
                        // Convertir WebP a JPEG si es necesario
                        if (strtolower($imageType) === 'webp') {
                            try {
                                $img = imagecreatefromwebp($imagePath);
                                if ($img) {
                                    ob_start();
                                    imagejpeg($img, null, 90);
                                    $imageData = base64_encode(ob_get_contents());
                                    ob_end_clean();
                                    imagedestroy($img);
                                    $imageType = 'jpeg';
                                }
                            } catch (\Exception $e) {
                                Log::warning("⚠️ [SIMPLE-PDF] Error convirtiendo WebP: " . $e->getMessage());
                            }
                        }
                        
                        $backgroundImage = "background-image: url('data:image/{$imageType};base64,{$imageData}');";
                    }
                }
                
                // Color de fondo de la página
                $backgroundColor = $page['backgroundColor'] ?? '#ffffff';
                
                $html .= '<div class="page" style="' . $backgroundImage . ' background-color: ' . $backgroundColor . ';">';
                
                // Obtener layout/grid de la página
                $cells = $page['cells'] ?? [];
                if (!empty($cells)) {
                    // Determinar grid basado en número de células
                    $gridClass = 'grid-1';
                    $cellCount = count($cells);
                    
                    if ($cellCount == 2) {
                        $gridClass = 'grid-2-horizontal';
                    } elseif ($cellCount == 3) {
                        $gridClass = 'grid-3-horizontal';
                    } elseif ($cellCount == 4) {
                        $gridClass = 'grid-4';
                    }
                    
                    $html .= '<div class="page-cells ' . $gridClass . '">';
                    
                    // Procesar cada célula
                    foreach ($cells as $cellIndex => $cell) {
                        $html .= '<div class="cell">';
                        
                        // Procesar elementos de la célula
                        $elements = $cell['elements'] ?? [];
                        
                        foreach ($elements as $elementIndex => $element) {
                            if (isset($element['locked']) && $element['locked']) {
                                continue; // Saltar elementos bloqueados
                            }
                            
                            $elementType = $element['type'] ?? 'unknown';
                            
                            $position = $element['position'] ?? ['x' => 0, 'y' => 0];
                            $filters = $element['filters'] ?? [];
                            
                            // Calcular posición
                            $left = $position['x'] ?? 0;
                            $top = $position['y'] ?? 0;
                            
                            // Aplicar filtros básicos
                            $opacity = ($filters['opacity'] ?? 100) / 100;
                            $scale = $filters['scale'] ?? 1;
                            $rotate = $filters['rotate'] ?? 0;
                            
                            $elementStyle = "left: {$left}px; top: {$top}px; opacity: {$opacity}; transform: scale({$scale}) rotate({$rotate}deg);";
                            
                            if ($elementType === 'image' && !empty($element['content'])) {
                                // Procesar imagen
                                $imageData = $element['content'];
                                
                                // Si es una URL relativa, convertir a path absoluto
                                if (strpos($imageData, 'data:') !== 0) {
                                    if (strpos($imageData, '/') === 0) {
                                        $imagePath = public_path($imageData);
                                    } else {
                                        $imagePath = public_path('/' . $imageData);
                                    }
                                    
                                    if (file_exists($imagePath)) {
                                        $imageContent = base64_encode(file_get_contents($imagePath));
                                        $imageExtension = pathinfo($imagePath, PATHINFO_EXTENSION);
                                        
                                        // Convertir WebP a JPEG si es necesario
                                        if (strtolower($imageExtension) === 'webp') {
                                            try {
                                                $img = imagecreatefromwebp($imagePath);
                                                if ($img) {
                                                    ob_start();
                                                    imagejpeg($img, null, 90);
                                                    $imageContent = base64_encode(ob_get_contents());
                                                    ob_end_clean();
                                                    imagedestroy($img);
                                                    $imageExtension = 'jpeg';
                                                }
                                            } catch (\Exception $e) {
                                                Log::warning("⚠️ [SIMPLE-PDF] Error procesando imagen: " . $e->getMessage());
                                                continue;
                                            }
                                        }
                                        
                                        $imageData = "data:image/{$imageExtension};base64,{$imageContent}";
                                    } else {
                                        continue; // Saltar si la imagen no existe
                                    }
                                }
                                
                                $html .= '<div class="element" style="' . $elementStyle . '">';
                                $html .= '<img src="' . $imageData . '" class="element-image" alt="" />';
                                $html .= '</div>';
                                
                            } elseif ($elementType === 'text' && !empty($element['content'])) {
                                // Procesar texto
                                $textContent = strip_tags($element['content']); // Limpiar HTML
                                $fontSize = $element['fontSize'] ?? 16;
                                $fontFamily = $element['fontFamily'] ?? 'Arial';
                                $color = $element['color'] ?? '#000000';
                                $fontWeight = ($element['fontWeight'] ?? 'normal') === 'bold' ? 'bold' : 'normal';
                                $fontStyle = ($element['fontStyle'] ?? 'normal') === 'italic' ? 'italic' : 'normal';
                                $textAlign = $element['textAlign'] ?? 'left';
                                
                                $textStyle = $elementStyle . " font-size: {$fontSize}px; font-family: {$fontFamily}; color: {$color}; font-weight: {$fontWeight}; font-style: {$fontStyle}; text-align: {$textAlign};";
                                
                                $html .= '<div class="element element-text" style="' . $textStyle . '">';
                                $html .= htmlspecialchars($textContent);
                                $html .= '</div>';
                            }
                        }
                        
                        $html .= '</div>'; // Fin de célula
                    }
                    
                    $html .= '</div>'; // Fin de page-cells
                } else {
                    // Página sin células, solo mostrar background
                    $html .= '<div class="page-cells"></div>';
                }
                
                $html .= '</div>'; // Fin de página
            }
            
            $html .= '</body></html>';
            
            // Generar PDF
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'landscape');
            $dompdf->render();
            
            // Preparar nombre del archivo
            $fileName = 'simple-' . ($project->name ?? 'proyecto') . '-' . now()->format('Y-m-d') . '.pdf';
            $fileName = preg_replace('/[^a-zA-Z0-9\-_.]/', '', $fileName);
            
            Log::info("✅ [SIMPLE-PDF] PDF generado exitosamente: {$fileName}");
            
            // Retornar PDF como descarga
            return Response::make($dompdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
                'Content-Length' => strlen($dompdf->output()),
                'Cache-Control' => 'private, max-age=0, must-revalidate',
                'Pragma' => 'public',
            ]);
            
        } catch (\Exception $e) {
            Log::error("❌ [SIMPLE-PDF] Error: " . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Error generando PDF',
                'message' => $e->getMessage(),
                'debug' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
    }
}
