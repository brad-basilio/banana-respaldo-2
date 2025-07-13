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
            
            if (!$project) {
                Log::error("❌ [PDF-GENERATOR] Proyecto no encontrado: {$projectId}");
                return response()->json([
                    'success' => false, 
                    'message' => 'Proyecto no encontrado.'
                ], 404);
            }

            // 2. VALIDAR DATOS DEL PROYECTO - versión robusta
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
            Log::info("✅ [PDF-GENERATOR] Encontradas " . count($pages) . " páginas");
            
            $projectData = ['pages' => $pages];

            // 3. INSTANCIAR SERVICIO DE IMÁGENES
            $imageService = new PDFImageService();
            
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
            $response = response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
                'Content-Length' => strlen($pdf->output()),
            ]);
            
            // 9. LIMPIAR ARCHIVOS TEMPORALES
            if (!empty($this->tempFiles)) {
                PDFImageService::cleanupTempFiles($this->tempFiles);
            }
            
            return $response;

        } catch (\Exception $e) {
            Log::error("❌ [PDF-GENERATOR] Error crítico generando PDF para proyecto {$projectId}: " . $e->getMessage(), [
                'exception' => $e->getTraceAsString()
            ]);
            
            // Limpiar archivos temporales en caso de error
            if (!empty($this->tempFiles)) {
                PDFImageService::cleanupTempFiles($this->tempFiles);
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
            $validPages = array_filter($projectData['pages'], function($page) {
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
                
                // Procesar elementos de la celda
                foreach ($cell['elements'] as $elementIndex => $element) {
                    $processedElement = $this->processElement($element, $elementIndex);
                    
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
     * Procesa un elemento individual
     */
    private function processElement(array $element, int $index)
    {
        if (!isset($element['type']) || !isset($element['position']) || !isset($element['size'])) {
            Log::warning("⚠️ [PDF-GENERATOR] Elemento {$index} no tiene estructura válida");
            return null;
        }
        
        $processed = [
            'id' => $element['id'] ?? "element-{$index}",
            'type' => $element['type'],
            'position' => [
                'x' => $element['position']['x'] ?? 0,
                'y' => $element['position']['y'] ?? 0,
            ],
            'size' => [
                'width' => $element['size']['width'] ?? 100,
                'height' => $element['size']['height'] ?? 100,
            ],
            'zIndex' => $element['zIndex'] ?? 1,
        ];
        
        // Procesar según el tipo de elemento
        switch ($element['type']) {
            case 'image':
                $processed['content'] = $this->processImageContent($element['content'] ?? $element['src'] ?? null);
                if (!$processed['content']) {
                    Log::warning("⚠️ [PDF-GENERATOR] Imagen del elemento {$index} no pudo ser procesada");
                    return null;
                }
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
            
            $tempFile = PDFImageService::base64ToTempFile($imageContent, [
                'maxWidth' => 2480,
                'maxHeight' => 3508,
                'quality' => 95,
                'format' => 'jpg'
            ]);
            
            if ($tempFile) {
                // Guardar referencia para limpieza posterior
                $this->tempFiles[] = $tempFile;
                return $tempFile;
            }
            
            // Fallback: devolver base64 original
            return $imageContent;
        }
        
        // Si es una URL de API interna, convertir a ruta absoluta
        if (strpos($imageContent, '/api/canvas/image/') === 0) {
            $absolutePath = $this->convertApiUrlToAbsolutePath($imageContent);
            
            if ($absolutePath && file_exists($absolutePath)) {
                // Procesar imagen para optimizar para PDF
                $optimizedPath = PDFImageService::processImageForPDF($absolutePath, [
                    'maxWidth' => 2480,
                    'maxHeight' => 3508,
                    'quality' => 95,
                    'format' => 'jpg'
                ]);
                
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
                $optimizedPath = PDFImageService::processImageForPDF($fullPath, [
                    'maxWidth' => 2480,
                    'maxHeight' => 3508,
                    'quality' => 95,
                    'format' => 'jpg'
                ]);
                
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
            $optimizedPath = PDFImageService::processImageForPDF($publicPath, [
                'maxWidth' => 2480,
                'maxHeight' => 3508,
                'quality' => 95,
                'format' => 'jpg'
            ]);
            
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
            return null;
        }
        
        return $this->processImageContent($backgroundImage);
    }

    /**
     * Procesa estilos de texto
     */
    private function processTextStyle(array $style)
    {
        return [
            'color' => $style['color'] ?? '#000000',
            'fontSize' => $style['fontSize'] ?? '16px',
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
            'width' => 21, // cm
            'height' => 29.7, // cm
            'orientation' => 'portrait'
        ];
        
        // Intentar obtener desde el preset relacionado
        if ($project->canvasPreset) {
            $preset = $project->canvasPreset;
            
            return [
                'width' => $preset->width ?? $defaultConfig['width'],
                'height' => $preset->height ?? $defaultConfig['height'],
                'orientation' => ($preset->width > $preset->height) ? 'landscape' : 'portrait'
            ];
        }
        
        // Intentar desde item_data
        if (isset($project->item_data['preset'])) {
            $presetData = $project->item_data['preset'];
            
            return [
                'width' => $presetData['width'] ?? $defaultConfig['width'],
                'height' => $presetData['height'] ?? $defaultConfig['height'],
                'orientation' => ($presetData['width'] > $presetData['height']) ? 'landscape' : 'portrait'
            ];
        }
        
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
        $dompdf->getOptions()->setChroot([public_path(), storage_path()]);
        
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
}
