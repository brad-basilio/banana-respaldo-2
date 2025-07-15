<?php

namespace App\Http\Controllers;

use App\Models\CanvasProject;
use App\Services\PDFImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Dompdf\Dompdf;
use Dompdf\Options;

class ProjectPDFController extends Controller
{
    protected PDFImageService $imageService;
    
    public function __construct(PDFImageService $imageService)
    {
        $this->imageService = $imageService;
        
        // Configurar límites de memoria y tiempo para PDFs grandes
        ini_set('memory_limit', '512M');
        ini_set('max_execution_time', 300); // 5 minutos
    }

    public function generatePDF(Request $request, $projectId)
    {
        $startTime = microtime(true);
        
        try {
            Log::info("🖨️ [PDF-CONTROLLER] Iniciando generación de PDF para proyecto: {$projectId}");
            
            // Validar proyecto
            $project = CanvasProject::findOrFail($projectId);
            
            // Validar datos del proyecto
            if (empty($project->design_data)) {
                Log::warning("❌ [PDF-CONTROLLER] Proyecto {$projectId} no tiene design_data");
                return $this->errorResponse('El proyecto no tiene datos de diseño guardados.', 404);
            }

            $designData = is_string($project->design_data) 
                ? json_decode($project->design_data, true) 
                : $project->design_data;
                
            if (!isset($designData['pages']) || empty($designData['pages'])) {
                Log::warning("❌ [PDF-CONTROLLER] Proyecto {$projectId} no tiene páginas en design_data");
                return $this->errorResponse('El proyecto está vacío o no tiene páginas diseñadas.', 404);
            }

            $pages = $designData['pages'];
            $totalPages = count($pages);
            
            Log::info("📄 [PDF-CONTROLLER] Procesando {$totalPages} páginas");

            // Procesar páginas en lotes para evitar problemas de memoria
            $processedPages = [];
            $batchSize = 5; // Procesar 5 páginas a la vez
            
            for ($i = 0; $i < $totalPages; $i += $batchSize) {
                $batch = array_slice($pages, $i, $batchSize);
                $processedBatch = $this->processPagesOptimized($batch, $i + 1, min($i + $batchSize, $totalPages));
                $processedPages = array_merge($processedPages, $processedBatch);
                
                // Limpiar memoria entre lotes
                if (function_exists('gc_collect_cycles')) {
                    gc_collect_cycles();
                }
                
                Log::info("📦 [PDF-CONTROLLER] Lote procesado: páginas " . ($i + 1) . " a " . min($i + $batchSize, $totalPages));
            }

            // Generar HTML del PDF
            $html = $this->generatePDFHTML($processedPages, $project);
            
            // Configurar DomPDF con optimizaciones
            $options = new Options();
            $options->set('isRemoteEnabled', true);
            $options->set('isHtml5ParserEnabled', true);
            $options->set('dpi', 300);
            $options->set('defaultFont', 'DejaVu Sans');
            $options->set('isFontSubsettingEnabled', true);
            $options->set('chroot', [storage_path(), public_path()]);
            
            // Configuraciones para PDFs grandes
            $options->set('debugKeepTemp', false);
            $options->set('debugCss', false);
            $options->set('debugLayout', false);
            $options->set('debugLayoutLines', false);
            $options->set('debugLayoutBlocks', false);
            $options->set('debugLayoutInline', false);
            $options->set('debugLayoutPaddingBox', false);

            $dompdf = new Dompdf($options);
            
            // Configurar papel personalizado
            $paperWidth = $project->canvasPreset->width ?? 21;
            $paperHeight = $project->canvasPreset->height ?? 29.7;
            $customPaper = [0, 0, $paperWidth * 28.3465, $paperHeight * 28.3465];
            
            Log::info("📏 [PDF-CONTROLLER] Configurando papel: {$paperWidth}x{$paperHeight} cm");
            
            $dompdf->setPaper($customPaper, 'portrait');
            $dompdf->loadHtml($html);
            
            // Renderizar con manejo de errores
            try {
                $dompdf->render();
            } catch (\Exception $renderError) {
                Log::error("❌ [PDF-CONTROLLER] Error en renderizado: " . $renderError->getMessage());
                return $this->errorResponse('Error al renderizar el PDF. El proyecto puede ser demasiado complejo.', 500);
            }

            $pdfOutput = $dompdf->output();
            $pdfSize = strlen($pdfOutput);
            $executionTime = round(microtime(true) - $startTime, 2);
            
            Log::info("✅ [PDF-CONTROLLER] PDF generado exitosamente", [
                'project_id' => $projectId,
                'pages' => $totalPages,
                'size_mb' => round($pdfSize / 1024 / 1024, 2),
                'execution_time' => $executionTime . 's'
            ]);

            $filename = "proyecto-" . Str::slug($project->name ?? 'album') . "-" . date('Y-m-d') . ".pdf";
            
            // Guardar PDF temporalmente para evitar problemas de content-length
            $tempPath = storage_path('app/temp/' . uniqid('pdf_') . '.pdf');
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            file_put_contents($tempPath, $pdfOutput);
            
            // Limpiar cualquier output buffer
            if (ob_get_level()) {
                ob_end_clean();
            }
            
            // Retornar descarga directa del archivo
            return response()->download($tempPath, $filename, [
                'Content-Type' => 'application/pdf',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ])->deleteFileAfterSend(true);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning("❌ [PDF-CONTROLLER] Proyecto no encontrado: {$projectId}");
            return $this->errorResponse('Proyecto no encontrado.', 404);
        } catch (\Exception $e) {
            $executionTime = round(microtime(true) - $startTime, 2);
            Log::error("❌ [PDF-CONTROLLER] Error general en generación de PDF", [
                'project_id' => $projectId,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'execution_time' => $executionTime . 's'
            ]);
            
            return $this->errorResponse('Error interno del servidor al generar el PDF.', 500);
        }
    }

    /**
     * Procesa páginas de manera optimizada para evitar problemas de memoria
     */
    private function processPagesOptimized(array $pages, int $startIndex, int $endIndex): array
    {
        Log::info("🔄 [PDF-CONTROLLER] Procesando páginas {$startIndex} a {$endIndex}");
        
        return array_map(function ($page, $index) use ($startIndex) {
            $pageNumber = $startIndex + $index;
            
            // Procesar imagen de fondo
            if (!empty($page['backgroundImage'])) {
                $page['backgroundImage'] = $this->processImagePath($page['backgroundImage'], "background-page-{$pageNumber}");
            }

            // Procesar elementos de celdas
            if (isset($page['cells']) && is_array($page['cells'])) {
                foreach ($page['cells'] as &$cell) {
                    if (isset($cell['elements']) && is_array($cell['elements'])) {
                        foreach ($cell['elements'] as &$element) {
                            if ($element['type'] === 'image' && !empty($element['content'])) {
                                $element['content'] = $this->processImagePath(
                                    $element['content'], 
                                    "element-page-{$pageNumber}-" . ($element['id'] ?? 'unknown')
                                );
                            }
                        }
                    }
                }
            }
            
            return $page;
        }, $pages, array_keys($pages));
    }

    /**
     * Procesa y optimiza rutas de imágenes
     */
    private function processImagePath(string $imagePath, string $context = ''): string
    {
        try {
            // Si es una imagen base64, optimizarla
            if (Str::startsWith($imagePath, 'data:image/')) {
                return $this->imageService->processBase64Image($imagePath);
            }
            
            // Si es una URL del API de canvas
            if (Str::startsWith($imagePath, '/api/canvas/image/')) {
                $encodedPath = last(explode('/', $imagePath));
                $decodedPath = base64_decode($encodedPath);
                $fullPath = storage_path('app/' . $decodedPath);

                if (file_exists($fullPath)) {
                    return $this->imageService->processImageForPDF($fullPath);
                }
            }
            
            // Si es una ruta de storage pública
            if (Str::startsWith($imagePath, '/storage/')) {
                $fullPath = public_path($imagePath);
                if (file_exists($fullPath)) {
                    return $this->imageService->processImageForPDF($fullPath);
                }
            }
            
            // Si es una URL completa
            if (Str::startsWith($imagePath, 'http')) {
                return $imagePath; // DomPDF puede manejar URLs directamente
            }
            
            return $imagePath;
            
        } catch (\Exception $e) {
            Log::warning("⚠️ [PDF-CONTROLLER] Error procesando imagen ({$context}): " . $e->getMessage());
            return $imagePath; // Devolver la imagen original si falla el procesamiento
        }
    }

    /**
     * Genera el HTML optimizado para el PDF
     */
    private function generatePDFHTML(array $pages, CanvasProject $project): string
    {
        Log::info("🔨 [PDF-CONTROLLER] Generando HTML para PDF");
        
        try {
            // Procesar páginas para añadir información de layout
            $processedPages = array_map(function ($page) {
                if (isset($page['layout'])) {
                    $page['layoutInfo'] = $this->getLayoutInfo($page['layout']);
                }
                return $page;
            }, $pages);
            
            return View::make('pdf.project-optimized', [
                'pages' => $processedPages,
                'project' => $project,
                'totalPages' => count($pages)
            ])->render();
        } catch (\Exception $e) {
            Log::error("❌ [PDF-CONTROLLER] Error generando HTML: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Devuelve una respuesta de error JSON estandarizada
     */
    private function errorResponse(string $message, int $status = 500): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'timestamp' => now()->toISOString()
        ], $status);
    }

    /**
     * Obtiene información del layout desde la configuración
     */
    private function getLayoutInfo($layoutName)
    {
        $layouts = config('layouts.layouts', []);
        
        if (!isset($layouts[$layoutName])) {
            return null;
        }
        
        $layout = $layouts[$layoutName];
        
        return [
            'rows' => $layout['rows'],
            'cols' => $layout['cols'],
            'cells' => $layout['cells'],
            'gap' => config('layouts.default_style.gap', '8px'),
            'padding' => config('layouts.default_style.padding', '16px')
        ];
    }
}