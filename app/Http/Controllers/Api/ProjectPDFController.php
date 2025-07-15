<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CanvasProject;
use App\Services\PDFImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Dompdf\Dompdf;
use Dompdf\Options;

class ProjectPDFController extends Controller
{
    /**
     * Array para trackear archivos temporales creados durante el proceso
     */
    private $tempFiles = [];

    /**
     * Servicio de procesamiento de imágenes
     */
    private $imageService;

    /**
     * Proyecto actual siendo procesado
     */
    private $currentProject;

    /**
     * Genera un PDF de alta calidad para un proyecto específico
     */
    public function generatePDF(Request $request, $projectId)
    {
        try {
            // Aumentar límites de memoria y tiempo para proyectos grandes
            ini_set('memory_limit', '2G');
            ini_set('max_execution_time', 300);
            set_time_limit(300);

            Log::info("🖨️ [PDF-GENERATOR] Iniciando generación de PDF para proyecto: {$projectId}");

            // 1. VALIDAR Y OBTENER EL PROYECTO
            $project = CanvasProject::findOrFail($projectId);
            $this->currentProject = $project; // Asignar para uso global

            if (!$project) {
                Log::error("❌ [PDF-GENERATOR] Proyecto no encontrado: {$projectId}");
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado.'
                ], 404);
            }

            // 2. VALIDAR DATOS DEL PROYECTO - versión robusta
            $pages = null;

            // Primero intentar obtener páginas desde el request (datos más actuales)
            if ($request->has('pages') && is_array($request->get('pages'))) {
                $pages = $request->get('pages');
                Log::info("✅ [PDF-GENERATOR] Usando páginas del request: " . count($pages) . " páginas");
            }

            // Si no hay páginas en el request, usar las del proyecto guardado
            if (!$pages) {
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
                Log::info("✅ [PDF-GENERATOR] Usando páginas del proyecto guardado: " . count($pages) . " páginas");
            }

            if (empty($pages)) {
                return response()->json(['error' => 'No se encontraron páginas para procesar'], 404);
            }

            $projectData = ['pages' => $pages];

            // 3. INSTANCIAR SERVICIO DE IMÁGENES
            $this->imageService = new PDFImageService();

            // 4. PROCESAR Y VALIDAR PÁGINAS
            $processedPages = $this->processProjectPages($projectData['pages']);

            if (empty($processedPages)) {
                Log::error("❌ [PDF-GENERATOR] No se pudieron procesar las páginas del proyecto: {$projectId}");
                return response()->json([
                    'success' => false,
                    'message' => 'Las páginas del proyecto no tienen contenido válido para generar el PDF.'
                ], 400);
            }

            // 4. OBTENER CONFIGURACIÓN DEL PRESET
            $presetConfig = $this->getPresetConfiguration($project);

            Log::info("📏 [PDF-GENERATOR] Configuración del preset obtenida", [
                'width_cm' => $presetConfig['width'],
                'height_cm' => $presetConfig['height'],
                'orientation' => $presetConfig['orientation']
            ]);

            // 5. GENERAR HTML OPTIMIZADO PARA PDF
            $html = $this->generatePDFHtml($processedPages, $presetConfig, $project);

            if (empty($html)) {
                Log::error("❌ [PDF-GENERATOR] Error generando HTML para PDF: {$projectId}");
                return response()->json([
                    'success' => false,
                    'message' => 'Error interno al procesar el contenido del proyecto.'
                ], 500);
            }

            // 6. CONFIGURAR Y GENERAR PDF CON ALTA CALIDAD
            $pdf = $this->createHighQualityPDF($html, $presetConfig);

            // 7. GENERAR NOMBRE DEL ARCHIVO
            $fileName = $this->generatePDFFileName($project);

            Log::info("✅ [PDF-GENERATOR] PDF generado exitosamente: {$fileName}");

            // 8. RETORNAR PDF COMO DESCARGA
            $pdfContent = $pdf->output();
            $response = response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]);

            // 9. LIMPIAR ARCHIVOS TEMPORALES
            if (!empty($this->tempFiles)) {
                $this->cleanupTempFiles();
            }

            return $response;
        } catch (\Exception $e) {
            Log::error("❌ [PDF-GENERATOR] Error crítico generando PDF para proyecto {$projectId}: " . $e->getMessage(), [
                'exception' => $e->getTraceAsString()
            ]);

            // Limpiar archivos temporales en caso de error
            if (!empty($this->tempFiles)) {
                $this->cleanupTempFiles();
            }

            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error interno al generar el PDF. Por favor, inténtalo de nuevo.'
            ], 500);
        }
    }

    /**
     * Valida y extrae los datos del proyecto
     */
    private function validateAndExtractProjectData(CanvasProject $project)
    {
        $projectData = null;

        // Opción 1: design_data (prioridad - donde están los datos reales)
        if (!empty($project->design_data)) {
            try {
                $decoded = is_string($project->design_data)
                    ? json_decode($project->design_data, true)
                    : $project->design_data;

                if (isset($decoded['pages']) && is_array($decoded['pages']) && count($decoded['pages']) > 0) {
                    $projectData = $decoded;
                    Log::info("📊 [PDF-GENERATOR] Datos encontrados en design_data con " . count($decoded['pages']) . " páginas");
                }
            } catch (\Exception $e) {
                Log::warning("⚠️ [PDF-GENERATOR] Error parseando design_data: " . $e->getMessage());
            }
        }

        // Opción 2: project_data (fallback)
        if (!$projectData && !empty($project->project_data)) {
            try {
                $decoded = is_string($project->project_data)
                    ? json_decode($project->project_data, true)
                    : $project->project_data;

                if (isset($decoded['pages']) && is_array($decoded['pages']) && count($decoded['pages']) > 0) {
                    $projectData = $decoded;
                    Log::info("📊 [PDF-GENERATOR] Datos encontrados en project_data con " . count($decoded['pages']) . " páginas");
                }
            } catch (\Exception $e) {
                Log::warning("⚠️ [PDF-GENERATOR] Error parseando project_data: " . $e->getMessage());
            }
        }

        // Opción 3: configuration (fallback adicional)
        if (!$projectData && !empty($project->configuration)) {
            try {
                $decoded = is_string($project->configuration)
                    ? json_decode($project->configuration, true)
                    : $project->configuration;

                if (isset($decoded['pages']) && is_array($decoded['pages']) && count($decoded['pages']) > 0) {
                    $projectData = $decoded;
                    Log::info("📊 [PDF-GENERATOR] Datos encontrados en configuration con " . count($decoded['pages']) . " páginas");
                }
            } catch (\Exception $e) {
                Log::warning("⚠️ [PDF-GENERATOR] Error parseando configuration: " . $e->getMessage());
            }
        }

        // Validar que haya páginas válidas
        if ($projectData && isset($projectData['pages']) && count($projectData['pages']) > 0) {
            // Filtrar páginas que tengan estructura válida (no necesariamente contenido)
            $validPages = array_filter($projectData['pages'], function ($page) {
                return isset($page['id']) && isset($page['type']) && isset($page['cells']) && is_array($page['cells']);
            });

            if (count($validPages) > 0) {
                $projectData['pages'] = array_values($validPages); // Reindexar
                Log::info("✅ [PDF-GENERATOR] Encontradas " . count($validPages) . " páginas válidas para PDF");
                return $projectData;
            }
        }

        Log::error("❌ [PDF-GENERATOR] No se encontraron datos válidos del proyecto", [
            'project_id' => $project->id,
            'has_project_data' => !empty($project->project_data),
            'project_data_type' => gettype($project->project_data),
            'project_data_length' => is_string($project->project_data) ? strlen($project->project_data) : 0,
            'has_design_data' => !empty($project->design_data),
            'design_data_type' => gettype($project->design_data),
            'design_data_length' => is_string($project->design_data) ? strlen($project->design_data) : 0,
            'has_configuration' => !empty($project->configuration)
        ]);

        return null;
    }

    /**
     * Procesa las páginas del proyecto para optimizarlas para PDF
     */
    private function processProjectPages(array $pages)
    {
        $processedPages = [];

        // Ya no necesitamos calcular dimensiones del workspace porque los valores están normalizados
        Log::info("📐 [PDF-GENERATOR] Procesando páginas con valores normalizados (0-1)");

        foreach ($pages as $pageIndex => $page) {
            Log::info("🔄 [PDF-GENERATOR] Procesando página " . ($pageIndex + 1));

            if (!isset($page['cells']) || !is_array($page['cells'])) {
                Log::warning("⚠️ [PDF-GENERATOR] Página " . ($pageIndex + 1) . " no tiene celdas válidas");
                continue;
            }

            $processedPage = [
                'id' => $page['id'] ?? "page-{$pageIndex}",
                'backgroundColor' => $page['backgroundColor'] ?? '#FFFFFF',
                'backgroundImage' => $this->processBackgroundImage($page['backgroundImage'] ?? null),
                'cells' => []
            ];

            $hasContent = false;

            // Procesar celdas
            foreach ($page['cells'] as $cellIndex => $cell) {
                if (!isset($cell['elements']) || !is_array($cell['elements'])) {
                    continue;
                }

                $processedCell = [
                    'id' => $cell['id'] ?? "cell-{$cellIndex}",
                    'elements' => []
                ];

                // Procesar elementos de la celda - pasamos null como workspaceDimensions ya que no lo necesitamos
                foreach ($cell['elements'] as $elementIndex => $element) {
                    $processedElement = $this->processElement($element, $elementIndex, []);

                    if ($processedElement) {
                        $processedCell['elements'][] = $processedElement;
                        $hasContent = true;
                    }
                }

                if (!empty($processedCell['elements'])) {
                    $processedPage['cells'][] = $processedCell;
                }
            }

            if ($hasContent) {
                $processedPages[] = $processedPage;
                Log::info("✅ [PDF-GENERATOR] Página " . ($pageIndex + 1) . " procesada con éxito");
            } else {
                Log::warning("⚠️ [PDF-GENERATOR] Página " . ($pageIndex + 1) . " no tiene contenido válido");
            }
        }

        Log::info("📋 [PDF-GENERATOR] Páginas procesadas: " . count($processedPages) . " de " . count($pages));

        return $processedPages;
    }

    /**
     * Calcula las dimensiones del workspace basándose en el preset
     */
    private function getWorkspaceDimensions(CanvasProject $project)
    {
        // Usar dimensiones fijas del workspace del editor
        // Estas son las dimensiones visuales del workspace, no las del preset físico
        $workspaceWidth = 800;  // Ancho visual del workspace
        $workspaceHeight = 600; // Alto visual del workspace

        // Si el preset tiene una proporción diferente, ajustar manteniendo el ancho
        if ($project->canvasPreset) {
            $preset = $project->canvasPreset;

            if ($preset->width && $preset->height) {
                $aspectRatio = $preset->height / $preset->width;

                // Ajustar altura manteniendo proporción
                $workspaceHeight = $workspaceWidth * $aspectRatio;

                Log::info("📐 [PDF-GENERATOR] Dimensiones ajustadas por proporción", [
                    'preset_width_cm' => $preset->width,
                    'preset_height_cm' => $preset->height,
                    'aspect_ratio' => $aspectRatio,
                    'workspace_width' => $workspaceWidth,
                    'workspace_height' => $workspaceHeight
                ]);
            }
        }

        return [
            'width' => $workspaceWidth,
            'height' => $workspaceHeight
        ];
    }

    /**
     * Procesa un elemento individual
     */
    private function processElement(array $element, int $index, array $workspaceDimensions)
    {
        if (!isset($element['type']) || !isset($element['position']) || !isset($element['size'])) {
            Log::warning("⚠️ [PDF-GENERATOR] Elemento {$index} no tiene estructura válida");
            return null;
        }

        // Los valores en design_data ya están normalizados (0-1), solo necesitamos convertir a porcentajes
        $xPercent = ($element['position']['x'] ?? 0) * 100;
        $yPercent = ($element['position']['y'] ?? 0) * 100;
        $widthPercent = ($element['size']['width'] ?? 0) * 100;
        $heightPercent = ($element['size']['height'] ?? 0) * 100;

        Log::info("🔄 [PDF-GENERATOR] Elemento {$index} - Valores normalizados a porcentajes", [
            'element_id' => $element['id'] ?? 'unknown',
            'type' => $element['type'],
            'original_normalized' => [
                'x' => $element['position']['x'] ?? 0,
                'y' => $element['position']['y'] ?? 0,
                'width' => $element['size']['width'] ?? 0,
                'height' => $element['size']['height'] ?? 0
            ],
            'converted_percentages' => [
                'x' => round($xPercent, 2),
                'y' => round($yPercent, 2),
                'width' => round($widthPercent, 2),
                'height' => round($heightPercent, 2)
            ]
        ]);

        $processed = [
            'id' => $element['id'] ?? "element-{$index}",
            'type' => $element['type'],
            'position' => [
                'x' => $xPercent,
                'y' => $yPercent,
            ],
            'size' => [
                'width' => $widthPercent,
                'height' => $heightPercent,
            ],
            'zIndex' => $element['zIndex'] ?? 1,
        ];

        // Procesar según el tipo de elemento
        switch ($element['type']) {
            case 'image':
                // Usar cover si tenemos dimensiones específicas
                if (isset($element['size']['width']) && isset($element['size']['height'])) {
                    // Obtener dimensiones reales del preset
                    $presetConfig = $this->getPresetConfiguration($this->currentProject);

                    // Las dimensiones del preset están en milímetros, convertir a pixels
                    // 1 mm = 11.8 pixels a 300 DPI
                    $presetWidthPx = $presetConfig['width'] * 11.8;
                    $presetHeightPx = $presetConfig['height'] * 11.8;

                    $targetWidth = ($widthPercent / 100) * $presetWidthPx;
                    $targetHeight = ($heightPercent / 100) * $presetHeightPx;

                    Log::info("📐 [PDF-GENERATOR] Calculando dimensiones cover desde preset", [
                        'preset_width_mm' => $presetConfig['width'],
                        'preset_height_mm' => $presetConfig['height'],
                        'preset_width_px' => round($presetWidthPx),
                        'preset_height_px' => round($presetHeightPx),
                        'element_width_percent' => $widthPercent,
                        'element_height_percent' => $heightPercent,
                        'target_width_px' => round($targetWidth),
                        'target_height_px' => round($targetHeight)
                    ]);

                    $processed['content'] = $this->processImageContentWithCover(
                        $element['content'] ?? $element['src'] ?? null,
                        round($targetWidth),
                        round($targetHeight)
                    );
                } else {
                    $processed['content'] = $this->processImageContent($element['content'] ?? $element['src'] ?? null);
                }

                if (!$processed['content']) {
                    Log::warning("⚠️ [PDF-GENERATOR] Imagen del elemento {$index} no pudo ser procesada", [
                        'original_content' => $element['content'] ?? $element['src'] ?? 'null',
                        'element_id' => $element['id'] ?? 'unknown'
                    ]);
                    return null;
                }
                Log::info("✅ [PDF-GENERATOR] Imagen procesada exitosamente para elemento {$index}", [
                    'element_id' => $element['id'] ?? 'unknown',
                    'processed_path' => is_string($processed['content']) ? (strlen($processed['content']) > 100 ? substr($processed['content'], 0, 100) . '...' : $processed['content']) : 'base64_data'
                ]);
                break;

            case 'text':
                $processed['content'] = $element['content'] ?? $element['text'] ?? '';
                $processed['style'] = $this->processTextStyle($element['style'] ?? []);

                if (empty($processed['content'])) {
                    Log::warning("⚠️ [PDF-GENERATOR] Elemento de texto {$index} está vacío");
                    return null;
                }
                break;

            default:
                Log::warning("⚠️ [PDF-GENERATOR] Tipo de elemento desconocido: {$element['type']}");
                return null;
        }

        return $processed;
    }

    /**
     * Procesa el contenido de una imagen
     */
    private function processImageContent($imageContent)
    {
        if (empty($imageContent)) {
            return null;
        }

        // Si es una imagen base64, procesarla con el servicio
        if (strpos($imageContent, 'data:image/') === 0) {
            Log::info("🖼️ [PDF-GENERATOR] Procesando imagen base64");

            try {
                // Decodificar base64 y guardar como archivo temporal
                $base64String = substr($imageContent, strpos($imageContent, ',') + 1);
                $decodedImage = base64_decode($base64String);

                if ($decodedImage === false) {
                    Log::warning("⚠️ [PDF-GENERATOR] Error decodificando imagen base64");
                    return $imageContent; // Fallback al base64 original
                }

                // Crear archivo temporal
                $tempPath = sys_get_temp_dir() . '/pdf_image_' . uniqid() . '.jpg';
                file_put_contents($tempPath, $decodedImage);

                // Optimizar imagen
                $optimizedPath = $this->imageService->processImageForPDF($tempPath, 2480, 95);

                if ($optimizedPath) {
                    $this->tempFiles[] = $optimizedPath;
                    return $optimizedPath;
                }

                // Limpiar archivo temporal si falla la optimización
                if (file_exists($tempPath)) {
                    unlink($tempPath);
                }
            } catch (\Exception $e) {
                Log::error("❌ [PDF-GENERATOR] Error procesando imagen base64: " . $e->getMessage());
            }

            // Fallback: devolver base64 original
            return $imageContent;
        }

        // Si es una URL de API interna, convertir a ruta absoluta
        if (strpos($imageContent, '/api/canvas/image/') === 0) {
            $absolutePath = $this->convertApiUrlToAbsolutePath($imageContent);

            if ($absolutePath && file_exists($absolutePath)) {
                // Procesar imagen para optimizar para PDF
                $optimizedPath = $this->imageService->processImageForPDF($absolutePath, 2480, 95);
                Log("🖼️ [PDF-optimizedPath imagen de API: {$optimizedPath}");

                if ($optimizedPath) {
                    $this->tempFiles[] = $optimizedPath;
                    return $optimizedPath;
                }

                return $absolutePath;
            }
        }

        // Si es una ruta de storage, convertir a URL pública
        if (strpos($imageContent, 'storage/') === 0 || strpos($imageContent, '/storage/') === 0) {
            $path = ltrim($imageContent, '/');
            $fullPath = public_path($path);

            if (file_exists($fullPath)) {
                Log::info("🖼️ [PDF-GENERATOR] Imagen encontrada en storage público: {$path}");

                // Optimizar imagen
                $optimizedPath = $this->imageService->processImageForPDF($fullPath, 2480, 95);

                Log::info("🖼️ [PDF-GENERATOR] Optimización de imagen: {$optimizedPath}");

                if ($optimizedPath) {
                    $this->tempFiles[] = $optimizedPath;
                    return $optimizedPath;
                }

                return $fullPath;
            }
        }

        // Si es una URL completa, la dejamos tal como está
        if (filter_var($imageContent, FILTER_VALIDATE_URL)) {
            Log::info("🖼️ [PDF-GENERATOR] Usando URL externa: {$imageContent}");
            return $imageContent;
        }

        // Intentar como ruta relativa desde public
        $publicPath = public_path($imageContent);
        if (file_exists($publicPath)) {
            Log::info("🖼️ [PDF-GENERATOR] Imagen encontrada en public: {$imageContent}");

            // Optimizar imagen
            $optimizedPath = $this->imageService->processImageForPDF($publicPath, 2480, 95);

            if ($optimizedPath) {
                $this->tempFiles[] = $optimizedPath;
                return $optimizedPath;
            }

            return $publicPath;
        }

        Log::warning("⚠️ [PDF-GENERATOR] No se pudo resolver la imagen: {$imageContent}");
        return null;
    }

    /**
     * Convierte URL de API interna a ruta absoluta
     */
    private function convertApiUrlToAbsolutePath($url)
    {
        try {
            $encodedPath = last(explode('/', $url));
            $decodedPath = base64_decode($encodedPath);
            $fullPath = storage_path('app/' . $decodedPath);

            if (file_exists($fullPath)) {
                Log::info("🖼️ [PDF-GENERATOR] Imagen de API convertida: {$decodedPath}");
                return $fullPath;
            }
        } catch (\Exception $e) {
            Log::warning("⚠️ [PDF-GENERATOR] Error decodificando URL de API: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Procesa imagen de fondo
     */
    private function processBackgroundImage($backgroundImage)
    {
        if (empty($backgroundImage)) {
            Log::info("🖼️ [PDF-GENERATOR] Imagen de fondo vacía");
            return null;
        }

        Log::info("🖼️ [PDF-GENERATOR] Procesando imagen de fondo", [
            'tipo' => gettype($backgroundImage),
            'longitud' => is_string($backgroundImage) ? strlen($backgroundImage) : 'no-string',
            'es_base64' => is_string($backgroundImage) && strpos($backgroundImage, 'data:image/') === 0,
            'es_url_api' => is_string($backgroundImage) && strpos($backgroundImage, '/api/canvas/image/') === 0,
            'preview' => is_string($backgroundImage) ? substr($backgroundImage, 0, 100) : 'no-string'
        ]);

        // Para imágenes de fondo, usar dimensiones reales del preset
        $presetConfig = $this->getPresetConfiguration($this->currentProject);

        // Las dimensiones del preset están en milímetros, convertir a pixels
        // 1 mm = 11.8 pixels a 300 DPI
        $pageWidth = $presetConfig['width'] * 11.8;
        $pageHeight = $presetConfig['height'] * 11.8;

        Log::info("📐 [PDF-GENERATOR] Dimensiones de fondo desde preset", [
            'preset_width_mm' => $presetConfig['width'],
            'preset_height_mm' => $presetConfig['height'],
            'page_width_px' => round($pageWidth),
            'page_height_px' => round($pageHeight)
        ]);

        $result = $this->processImageContentWithCover($backgroundImage, round($pageWidth), round($pageHeight));

        Log::info("🖼️ [PDF-GENERATOR] Resultado de imagen de fondo", [
            'resultado_tipo' => gettype($result),
            'resultado_longitud' => is_string($result) ? strlen($result) : 'no-string',
            'resultado_preview' => is_string($result) ? substr($result, 0, 100) : 'no-string'
        ]);

        return $result;
    }

    /**
     * Procesa estilos de texto
     */
    private function processTextStyle(array $style)
    {
        $fontSize = str_replace('px', '', $style['fontSize']);
        $fontSize = $fontSize * 10;

        return [
            'color' => $style['color'] ?? '#000000',
            'fontSize' => $fontSize . 'pt'  ?? '16px',
            'fontFamily' => $style['fontFamily'] ?? 'sans-serif',
            'fontWeight' => $style['fontWeight'] ?? 'normal',
            'textAlign' => $style['textAlign'] ?? 'left',
            'backgroundColor' => $style['backgroundColor'] ?? 'transparent',
            'lineHeight' => $style['lineHeight'] ?? 'normal',
        ];
    }

    /**
     * Obtiene la configuración del preset
     */
    private function getPresetConfiguration(CanvasProject $project)
    {
        $defaultConfig = [
            'width' => 210, // mm (A4)
            'height' => 297, // mm (A4)
            'orientation' => 'portrait'
        ];

        // Intentar obtener desde el preset relacionado (PRIORIDAD)
        if ($project->canvasPreset) {
            $preset = $project->canvasPreset;

            Log::info("📐 [PDF-GENERATOR] Obteniendo configuración del CanvasPreset", [
                'preset_id' => $preset->id,
                'preset_name' => $preset->name,
                'preset_width_mm' => $preset->width,
                'preset_height_mm' => $preset->height,
                'preset_dpi' => $preset->dpi ?? 300
            ]);

            if ($preset->width && $preset->height) {
                return [
                    'width' => (float) $preset->width,
                    'height' => (float) $preset->height,
                    'orientation' => ($preset->width > $preset->height) ? 'landscape' : 'portrait',
                    'dpi' => $preset->dpi ?? 300
                ];
            }
        }

        // Si no hay preset, intentar desde item_data
        if (isset($project->item_data['preset']) && is_array($project->item_data['preset'])) {
            $presetData = $project->item_data['preset'];

            Log::info("📐 [PDF-GENERATOR] Obteniendo configuración del item_data", [
                'preset_data' => $presetData
            ]);

            if (isset($presetData['width']) && isset($presetData['height'])) {
                return [
                    'width' => (float) $presetData['width'],
                    'height' => (float) $presetData['height'],
                    'orientation' => ($presetData['width'] > $presetData['height']) ? 'landscape' : 'portrait',
                    'dpi' => $presetData['dpi'] ?? 300
                ];
            }
        }

        Log::warning("⚠️ [PDF-GENERATOR] No se encontró configuración del preset, usando valores por defecto", [
            'project_id' => $project->id,
            'has_canvas_preset' => !is_null($project->canvasPreset),
            'has_item_data' => !empty($project->item_data)
        ]);

        return $defaultConfig;
    }

    /**
     * Genera el HTML optimizado para PDF
     */
    private function generatePDFHtml(array $pages, array $config, CanvasProject $project)
    {
        try {
            $viewData = [
                'pages' => $pages,
                'config' => $config,
                'project' => $project,
                'pageCount' => count($pages)
            ];

            Log::info("📄 [PDF-GENERATOR] Generando HTML con " . count($pages) . " páginas");

            return View::make('pdf.project-enhanced', $viewData)->render();
        } catch (\Exception $e) {
            Log::error("❌ [PDF-GENERATOR] Error generando HTML: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Crea PDF con configuración de alta calidad
     */
    private function createHighQualityPDF(string $html, array $config)
    {
        // Configurar opciones de alta calidad
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $options->set('isPhpEnabled', false);
        $options->set('isFontSubsettingEnabled', true);
        $options->set('defaultFont', 'sans-serif');
        $options->set('dpi', 300); // 300 DPI para calidad de impresión
        $options->set('defaultMediaType', 'print');
        $options->set('debugKeepTemp', false);

        // Crear instancia de DomPDF
        $dompdf = new Dompdf($options);

        // Configurar rutas accesibles: public, storage y directorio temporal
        $allowedPaths = [
            public_path(),
            storage_path(),
            sys_get_temp_dir() // Permitir acceso al directorio temporal
        ];
        $dompdf->getOptions()->setChroot($allowedPaths);

        Log::info("📁 [PDF-GENERATOR] Rutas permitidas para DomPDF: " . json_encode($allowedPaths));

        // Cargar HTML
        $dompdf->loadHtml($html);

        // Configurar tamaño del papel
        $paperWidth = $config['width'] * 28.3465; // Convertir cm a puntos
        $paperHeight = $config['height'] * 28.3465; // Convertir cm a puntos

        $customPaper = [0, 0, $paperWidth, $paperHeight];
        $dompdf->setPaper($customPaper, $config['orientation']);

        Log::info("📏 [PDF-GENERATOR] Configuración del papel", [
            'width_pt' => $paperWidth,
            'height_pt' => $paperHeight,
            'orientation' => $config['orientation']
        ]);

        // Renderizar PDF
        $dompdf->render();

        return $dompdf;
    }

    /**
     * Genera nombre del archivo PDF
     */
    private function generatePDFFileName(CanvasProject $project)
    {
        $baseName = $project->name ?? 'proyecto';
        $baseName = Str::slug($baseName);

        if (empty($baseName)) {
            $baseName = 'proyecto';
        }

        $date = now()->format('Y-m-d');

        return "{$baseName}_{$date}.pdf";
    }

    /**
     * Limpiar archivos temporales
     */
    private function cleanupTempFiles()
    {
        foreach ($this->tempFiles as $tempFile) {
            if (file_exists($tempFile)) {
                try {
                    unlink($tempFile);
                    Log::info("🗑️ [PDF-GENERATOR] Archivo temporal eliminado: {$tempFile}");
                } catch (\Exception $e) {
                    Log::warning("⚠️ [PDF-GENERATOR] No se pudo eliminar archivo temporal: {$tempFile} - " . $e->getMessage());
                }
            }
        }
        $this->tempFiles = [];
    }

    /**
     * Método debug para ver el HTML que se genera para el PDF
     */
    public function debugPDFHtml(Request $request, $projectId)
    {
        try {
            Log::info("🔍 [PDF-DEBUG] Iniciando debug de HTML para proyecto: {$projectId}");

            // 1. BUSCAR Y VALIDAR EL PROYECTO
            $project = CanvasProject::find($projectId);
            $this->currentProject = $project; // Asignar para uso global

            if (!$project) {
                return response()->json([
                    'error' => 'Proyecto no encontrado',
                    'project_id' => $projectId
                ], 404);
            }

            // 2. VALIDAR DATOS DEL PROYECTO
            $pages = null;

            // Primero intentar obtener páginas desde el request
            if ($request->has('pages') && is_array($request->get('pages'))) {
                $pages = $request->get('pages');
                Log::info("🔍 [PDF-DEBUG] Usando páginas del request: " . count($pages) . " páginas");
            }

            // Si no hay páginas en el request, usar las del proyecto guardado
            if (!$pages) {
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
                Log::info("🔍 [PDF-DEBUG] Usando páginas del proyecto guardado: " . count($pages) . " páginas");
            }

            if (empty($pages)) {
                return response()->json(['error' => 'No se encontraron páginas para procesar'], 404);
            }

            // 3. INSTANCIAR SERVICIO DE IMÁGENES
            $this->imageService = new PDFImageService();

            // 4. PROCESAR Y VALIDAR PÁGINAS
            $processedPages = $this->processProjectPages($pages);

            if (empty($processedPages)) {
                return response()->json([
                    'error' => 'No se pudieron procesar las páginas',
                    'original_pages_count' => count($pages),
                    'processed_pages_count' => 0
                ], 400);
            }

            // 5. OBTENER CONFIGURACIÓN DEL PRESET
            $presetConfig = $this->getPresetConfiguration($project);

            // 6. GENERAR HTML
            $html = $this->generatePDFHtml($processedPages, $presetConfig, $project);

            if (empty($html)) {
                return response()->json(['error' => 'Error generando HTML'], 500);
            }

            // 7. RETORNAR DEBUG INFO
            return response()->json([
                'success' => true,
                'project_id' => $projectId,
                'project_name' => $project->name,
                'original_pages_count' => count($pages),
                'processed_pages_count' => count($processedPages),
                'preset_config' => $presetConfig,
                'pages_debug' => $this->getPageDebugInfo($pages),
                'processed_pages_debug' => $this->getPageDebugInfo($processedPages),
                'html_preview' => substr($html, 0, 2000) . (strlen($html) > 2000 ? '...' : ''),
                'html_full' => $html
            ]);
        } catch (\Exception $e) {
            Log::error("❌ [PDF-DEBUG] Error: " . $e->getMessage());

            return response()->json([
                'error' => 'Error en debug: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Obtiene información de debug de las páginas
     */
    private function getPageDebugInfo(array $pages)
    {
        $debug = [];

        foreach ($pages as $pageIndex => $page) {
            $pageDebug = [
                'page_number' => $pageIndex + 1,
                'id' => $page['id'] ?? 'sin-id',
                'background_color' => $page['backgroundColor'] ?? 'no-definido',
                'background_image' => !empty($page['backgroundImage']),
                'cells_count' => isset($page['cells']) ? count($page['cells']) : 0,
                'elements' => []
            ];

            if (isset($page['cells']) && is_array($page['cells'])) {
                $elementCount = 0;
                $imageCount = 0;
                $textCount = 0;

                foreach ($page['cells'] as $cell) {
                    if (isset($cell['elements']) && is_array($cell['elements'])) {
                        foreach ($cell['elements'] as $element) {
                            $elementCount++;

                            if (isset($element['type'])) {
                                if ($element['type'] === 'image') {
                                    $imageCount++;
                                } elseif ($element['type'] === 'text') {
                                    $textCount++;
                                }

                                $pageDebug['elements'][] = [
                                    'type' => $element['type'],
                                    'has_content' => !empty($element['content'] ?? $element['src'] ?? $element['text'] ?? ''),
                                    'position' => $element['position'] ?? 'no-definida',
                                    'size' => $element['size'] ?? 'no-definido'
                                ];
                            }
                        }
                    }
                }

                $pageDebug['total_elements'] = $elementCount;
                $pageDebug['image_elements'] = $imageCount;
                $pageDebug['text_elements'] = $textCount;
            }

            $debug[] = $pageDebug;
        }

        return $debug;
    }

    /**
     * Procesa el contenido de una imagen con efecto cover
     */
    private function processImageContentWithCover($imageContent, $targetWidth, $targetHeight)
    {
        if (empty($imageContent)) {
            return null;
        }

        Log::info("🖼️ [PDF-GENERATOR] Procesando imagen con cover: {$targetWidth}x{$targetHeight}");

        // Si es una imagen base64, procesarla
        if (strpos($imageContent, 'data:image/') === 0) {
            try {
                $base64String = substr($imageContent, strpos($imageContent, ',') + 1);
                $decodedImage = base64_decode($base64String);

                if ($decodedImage === false) {
                    Log::warning("⚠️ [PDF-GENERATOR] Error decodificando imagen base64");
                    return $this->processImageContent($imageContent); // Fallback
                }

                $tempPath = sys_get_temp_dir() . '/pdf_image_' . uniqid() . '.jpg';
                file_put_contents($tempPath, $decodedImage);

                // Aplicar cover
                $coverPath = $this->imageService->processImageWithCover($tempPath, $targetWidth, $targetHeight);

                // Limpiar archivo temporal original
                if (file_exists($tempPath)) {
                    unlink($tempPath);
                }

                return $coverPath ?: $this->processImageContent($imageContent);
            } catch (\Exception $e) {
                Log::error("❌ [PDF-GENERATOR] Error procesando imagen base64 con cover: " . $e->getMessage());
                return $this->processImageContent($imageContent); // Fallback
            }
        }

        // Si es una URL de API interna
        if (strpos($imageContent, '/api/canvas/image/') === 0) {
            $absolutePath = $this->convertApiUrlToAbsolutePath($imageContent);

            if ($absolutePath && file_exists($absolutePath)) {
                $coverPath = $this->imageService->processImageWithCover($absolutePath, $targetWidth, $targetHeight);

                if ($coverPath) {
                    $this->tempFiles[] = $coverPath;
                    return $coverPath;
                }
            }
        }

        // Si es una ruta de storage
        if (strpos($imageContent, 'storage/') === 0 || strpos($imageContent, '/storage/') === 0) {
            $path = ltrim($imageContent, '/');
            $fullPath = public_path($path);

            if (file_exists($fullPath)) {
                $coverPath = $this->imageService->processImageWithCover($fullPath, $targetWidth, $targetHeight);

                if ($coverPath) {
                    $this->tempFiles[] = $coverPath;
                    return $coverPath;
                }
            }
        }

        // Si es una ruta relativa desde public
        $publicPath = public_path($imageContent);
        if (file_exists($publicPath)) {
            $coverPath = $this->imageService->processImageWithCover($publicPath, $targetWidth, $targetHeight);

            if ($coverPath) {
                $this->tempFiles[] = $coverPath;
                return $coverPath;
            }
        }

        // Fallback al método original
        return $this->processImageContent($imageContent);
    }
}
