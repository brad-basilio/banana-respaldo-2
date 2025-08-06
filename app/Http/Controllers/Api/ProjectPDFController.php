<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CanvasProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Dompdf\Dompdf;
use Dompdf\Options;

class ProjectPDFController extends Controller
{
    /**
     * Generar PDF usando thumbnails PDF de alta calidad
     */
    public function generatePDF(Request $request, $projectId)
    {
        try {
            Log::info("📄 [PDF-GENERATOR] Iniciando generación de PDF para proyecto: {$projectId}");

            // Obtener el proyecto y sus relaciones importantes para dimensiones
            $project = CanvasProject::with(['item', 'canvasPreset'])->findOrFail($projectId);
            // Obtener páginas del request
            $pages = $request->get('pages', []);
            $workspaceDimensions = $request->get('workspace_dimensions', ['width' => 800, 'height' => 600]);
            
            // Extraer dimensiones originales en mm si existen
            $originalWidthMm = $workspaceDimensions['originalWidth'] ?? null;
            $originalHeightMm = $workspaceDimensions['originalHeight'] ?? null;
            
            $quality = $request->get('quality', 'high');
            $format = $request->get('format', 'album');
            $usePdfThumbnails = $request->get('use_pdf_thumbnails', true);
            
            // Obtener dimensiones del preset asociado al proyecto
            $presetDimensions = null;
            if ($project->canvasPreset) {
                $presetData = $project->canvasPreset->preset_data ?? null;
                if (is_array($presetData) && isset($presetData['dimensions'])) {
                    $presetDimensions = $presetData['dimensions'];
                    Log::info("📏 [PDF-GENERATOR] Dimensiones obtenidas del preset: ", $presetDimensions);
                }
            }

            // Log de los datos recibidos para debugging
            Log::info("📥 [PDF-GENERATOR] Datos recibidos:", [
                'request_data' => $request->all(),
                'pages_received' => is_array($pages) ? count($pages) : 'no es array'
            ]);

            if (empty($pages)) {
                // Si no hay páginas, intentar generarlas automáticamente
                Log::warning("⚠️ [PDF-GENERATOR] No se recibieron páginas, generando array automático");
                $pagesCount = $request->get('pages_count', 0);
                
                if ($pagesCount > 0) {
                    $pages = [];
                    for ($i = 0; $i < $pagesCount; $i++) {
                        $pages[$i] = [
                            'index' => $i,
                            'id' => "page-{$i}"
                        ];
                    }
                    Log::info("✅ [PDF-GENERATOR] Páginas generadas automáticamente: " . count($pages));
                } else {
                    return response()->json(['error' => 'No se encontraron páginas en el request ni se pudo generar automáticamente'], 400);
                }
            }

            Log::info("📊 [PDF-GENERATOR] Configuración:", [
                'pages_count' => count($pages),
                'workspace' => $workspaceDimensions,
                'quality' => $quality,
                'format' => $format,
                'use_pdf_thumbnails' => $usePdfThumbnails
            ]);

            // Verificar que existen los thumbnails PDF - SOLO EN STORAGE/APP/IMAGES
            $thumbnailPaths = [];
            $localBaseDir = "images/thumbnails/{$projectId}";  // En storage/app/images
            
            // Log para debugging
            Log::info("🔍 [PDF-GENERATOR] Buscando thumbnails en storage/app/{$localBaseDir} para el proyecto {$projectId}");
            
            // Recorrer todas las páginas
            if (is_array($pages)) {
                foreach ($pages as $index => $page) {
                    // El índice puede ser un valor numérico o el índice podría estar en el objeto page
                    $pageIndex = is_array($page) && isset($page['index']) ? $page['index'] : $index;
                    
                    // Intentar primero con el thumbnail PDF
                    $thumbnailFileName = "page-{$pageIndex}-pdf.png";
                    $localThumbnailPath = "{$localBaseDir}/{$thumbnailFileName}";
                    
                    // Buscar en storage/app
                    if (Storage::exists($localThumbnailPath)) {
                        $thumbnailPaths[$pageIndex] = storage_path("app/{$localThumbnailPath}");
                        Log::info("✅ [PDF-GENERATOR] Thumbnail encontrado: {$localThumbnailPath}");
                    } 
                    else {
                        Log::warning("⚠️ [PDF-GENERATOR] Thumbnail PDF no encontrado, intentando alternativas...");
                        
                        // Alternativa 1: Thumbnail normal
                        $localNormalPath = "{$localBaseDir}/page-{$pageIndex}.png";
                        
                        if (Storage::exists($localNormalPath)) {
                            $thumbnailPaths[$pageIndex] = storage_path("app/{$localNormalPath}");
                            Log::info("✅ [PDF-GENERATOR] Usando thumbnail normal: {$localNormalPath}");
                        }
                        // Alternativa 2: Cualquier archivo que coincida con el patrón page-{index}*
                        else if (Storage::exists($localBaseDir)) {
                            $files = Storage::files($localBaseDir);
                            foreach ($files as $file) {
                                if (strpos($file, "page-{$pageIndex}") !== false) {
                                    $thumbnailPaths[$pageIndex] = storage_path("app/{$file}");
                                    Log::info("✅ [PDF-GENERATOR] Usando archivo alternativo: {$file}");
                                    break;
                                }
                            }
                        }
                        
                        // Si no se encontró ningún archivo, registrar error
                        if (!isset($thumbnailPaths[$pageIndex])) {
                            Log::error("❌ [PDF-GENERATOR] No se encontró ningún archivo para la página {$pageIndex}");
                        }
                    }
                }
            } else {
                Log::error("❌ [PDF-GENERATOR] El formato de páginas no es un array válido");
            }

            if (empty($thumbnailPaths)) {
                return response()->json(['error' => 'No se encontraron thumbnails para generar el PDF'], 400);
            }

            // Configurar DOMPDF
            $options = new Options();
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isRemoteEnabled', true);
            $options->set('defaultFont', 'sans-serif');
            $options->set('dpi', $quality === 'high' ? 300 : 150);
            $options->set('fontHeightRatio', 1.1);
            $options->set('isPhpEnabled', true);

            $dompdf = new Dompdf($options);

            // Calcular dimensiones del PDF basado en las dimensiones disponibles
            $pageWidth = $workspaceDimensions['width'] ?? 800;
            $pageHeight = $workspaceDimensions['height'] ?? 600;
            
            // Jerarquía para obtener dimensiones:
            // 1. Primero: Usar dimensiones originales en mm del frontend (prioridad máxima) 
            // 2. Segundo: Usar dimensiones del Preset si están disponibles
            // 3. Tercero: Usar dimensiones del workspace si están disponibles
            // 4. Cuarto: Usar dimensiones basadas en el formato (A4, album, etc.)
            // 5. Quinto: Usar dimensiones por defecto (fallback)
            
            // Verificar si tenemos dimensiones originales del frontend en mm (prioridad máxima)
            if ($originalWidthMm && $originalHeightMm) {
                $pageWidthMm = $originalWidthMm;
                $pageHeightMm = $originalHeightMm;
                Log::info("📏 [PDF-GENERATOR] Usando dimensiones originales del frontend (mm): {$pageWidthMm}mm x {$pageHeightMm}mm");
            }
            // Si no hay dimensiones originales, verificar preset
            else if ($presetDimensions && isset($presetDimensions['width']) && isset($presetDimensions['height'])) {
                // Si el preset tiene dimensiones en mm, usarlas directamente
                if (isset($presetDimensions['units']) && $presetDimensions['units'] === 'mm') {
                    $pageWidthMm = $presetDimensions['width'];
                    $pageHeightMm = $presetDimensions['height'];
                    Log::info("📐 [PDF-GENERATOR] Usando dimensiones exactas del preset (mm): {$pageWidthMm}mm x {$pageHeightMm}mm");
                }
                // Si el preset tiene dimensiones en px, convertir a mm
                else {
                    $pageWidth = $presetDimensions['width'];
                    $pageHeight = $presetDimensions['height'];
                    // Convertir a mm (asumiendo 96 DPI)
                    $pageWidthMm = ($pageWidth / 96) * 25.4;
                    $pageHeightMm = ($pageHeight / 96) * 25.4;
                    Log::info("📐 [PDF-GENERATOR] Usando dimensiones del preset convertidas a mm: {$pageWidthMm}mm x {$pageHeightMm}mm");
                }
            } 
            // Usar dimensiones basadas en formato conocido
            else if ($format !== 'custom') {
                // Definiciones de formatos estándar en mm
                $formatDimensions = [
                    'A4' => ['width' => 210, 'height' => 297],
                    'A5' => ['width' => 148, 'height' => 210],
                    'letter' => ['width' => 216, 'height' => 279],
                    'legal' => ['width' => 216, 'height' => 356],
                    'album' => ['width' => 220, 'height' => 220], // Album cuadrado estándar
                    'photobook' => ['width' => 280, 'height' => 210], // Photobook apaisado
                    'portrait' => ['width' => 210, 'height' => 280], // Photobook vertical
                    'square_large' => ['width' => 300, 'height' => 300], // Album cuadrado grande
                    'square_small' => ['width' => 150, 'height' => 150], // Album cuadrado pequeño
                    'landscape_large' => ['width' => 330, 'height' => 250], // Apaisado grande
                ];
                
                // Si el formato existe en nuestra lista, usar esas dimensiones
                if (isset($formatDimensions[$format])) {
                    $pageWidthMm = $formatDimensions[$format]['width'];
                    $pageHeightMm = $formatDimensions[$format]['height'];
                    Log::info("📐 [PDF-GENERATOR] Usando dimensiones de formato estándar: {$format} ({$pageWidthMm}mm x {$pageHeightMm}mm)");
                } else {
                    // Convertir a mm para DOMPDF (asumiendo 96 DPI)
                    $pageWidthMm = ($pageWidth / 96) * 25.4;
                    $pageHeightMm = ($pageHeight / 96) * 25.4;
                    Log::info("📐 [PDF-GENERATOR] Usando dimensiones convertidas: {$pageWidthMm}mm x {$pageHeightMm}mm");
                }
            } else {
                // Para formato custom, convertir a mm para DOMPDF (asumiendo 96 DPI)
                $pageWidthMm = ($pageWidth / 96) * 25.4;
                $pageHeightMm = ($pageHeight / 96) * 25.4;
                Log::info("📐 [PDF-GENERATOR] Usando dimensiones personalizadas: {$pageWidthMm}mm x {$pageHeightMm}mm");
            }

            // Generar HTML para el PDF
            $html = $this->generatePDFHtml($thumbnailPaths, $pageWidthMm, $pageHeightMm, $project);

            $dompdf->loadHtml($html);
            
            // Determinar orientación basándonos en las dimensiones reales
            $orientation = $pageWidthMm > $pageHeightMm ? 'landscape' : 'portrait';
            
            // Verificar si se debe forzar el uso de landscape para A4 horizontal
            if ($originalWidthMm && $originalHeightMm) {
                // Si las dimensiones originales son 297x210, estamos ante un A4 horizontal
                if (abs($originalWidthMm - 297) < 5 && abs($originalHeightMm - 210) < 5) {
                    $orientation = 'landscape';
                    Log::info("📏 [PDF-GENERATOR] Forzando orientación landscape para A4 horizontal (297x210mm)");
                }
            }
            
            // Convertir mm a puntos (1 pt = 0.352778 mm, así que multiplicamos por 2.83465)
            $widthPts = $pageWidthMm * 2.83465;
            $heightPts = $pageHeightMm * 2.83465;
            
            Log::info("📐 [PDF-GENERATOR] Configurando PDF con dimensiones: {$widthPts}pt x {$heightPts}pt, orientación: {$orientation}");
            
            // Establecer las dimensiones exactas y orientación
            $dompdf->setPaper([0, 0, $widthPts, $heightPts], $orientation);

            // Renderizar el PDF
            $dompdf->render();

            // Crear directorio para PDFs solo en storage/app/images
            $pdfDir = "images/pdf/{$projectId}";
            
            // Crear el directorio en local storage con permisos correctos
            if (!Storage::exists($pdfDir)) {
                $fullPath = storage_path('app/' . $pdfDir);
                if (!file_exists($fullPath)) {
                    mkdir($fullPath, 0775, true); // Crear con permisos 775 recursivamente
                    Log::info("📁 [PDF] Directorio creado con permisos 775: {$pdfDir}");
                }
            }

            // Guardar el PDF únicamente en local storage (no en public)
            $pdfFileName = "{$projectId}.pdf";
            $pdfPath = "{$pdfDir}/{$pdfFileName}";
            $pdfContent = $dompdf->output();
            
            // Guardar en local storage
            Storage::put($pdfPath, $pdfContent);
            
            // ✅ FIJO: Establecer permisos 777
            $fullPath = storage_path('app/' . $pdfPath);
            if (file_exists($fullPath)) {
                chmod($fullPath, 0777);
            }
            
            // Generar la URL para acceso
            $pdfUrl = "/api/customer/projects/{$projectId}/download-pdf"; // URL para descargar mediante API
            $pdfSize = strlen($pdfContent);

            Log::info("✅ [PDF-GENERATOR] PDF generado exitosamente:", [
                'path' => $pdfPath,
                'size' => $pdfSize,
                'pages' => count($thumbnailPaths)
            ]);

            return response()->json([
                'success' => true,
                'pdf_path' => $pdfPath,
                'pdf_url' => $pdfUrl,
                'pdf_size' => $pdfSize,
                'pages_count' => count($thumbnailPaths),
                'dimensions' => [
                    'width_px' => $pageWidth,
                    'height_px' => $pageHeight,
                    'width_mm' => $pageWidthMm,
                    'height_mm' => $pageHeightMm
                ],
                'source' => 'pdf_thumbnails',
                'quality' => $quality,
                'format' => $format
            ]);

        } catch (\Exception $e) {
            Log::error("❌ [PDF-GENERATOR] Error: " . $e->getMessage());
            Log::error("❌ [PDF-GENERATOR] Stack trace: " . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Error generando PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar HTML para el PDF usando las imágenes thumbnail
     */
    private function generatePDFHtml($thumbnailPaths, $pageWidthMm, $pageHeightMm, $project)
    {
        // Determinar orientación
        $orientation = $pageWidthMm > $pageHeightMm ? 'landscape' : 'portrait';
        $aspectRatio = $pageWidthMm / $pageHeightMm;
        
        Log::info("📄 [PDF-HTML] Generando HTML con dimensiones: {$pageWidthMm}mm x {$pageHeightMm}mm, orientación: {$orientation}, ratio: {$aspectRatio}");
        
        $html = '<!DOCTYPE html>';
        $html .= '<html><head>';
        $html .= '<meta charset="utf-8">';
        $html .= '<title>Álbum - ' . htmlspecialchars($project->name ?? 'Proyecto') . '</title>';
        $html .= '<style>';
        $html .= 'body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #fff; }';
        $html .= '@page { ';
        $html .= '  size: ' . $pageWidthMm . 'mm ' . $pageHeightMm . 'mm; ';
        $html .= '  margin: 0; ';
        $html .= '}';
        $html .= '.page { ';
        $html .= '  box-sizing: border-box; ';
        $html .= '  width: ' . $pageWidthMm . 'mm; ';
        $html .= '  height: ' . $pageHeightMm . 'mm; ';
        $html .= '  margin: 0; ';
        $html .= '  padding: 0; ';
        $html .= '  page-break-after: always; ';
        $html .= '  overflow: hidden; ';
        $html .= '  position: relative; ';
        $html .= '  background-color: #fff; ';
        $html .= '  text-align: center; ';
        $html .= '}';
        $html .= '.page:last-child { page-break-after: avoid; }';
        $html .= '.page img { ';
        $html .= '  width: 100%; ';  // Usar el 100% del ancho disponible
        $html .= '  height: 100%; '; // Usar el 100% de la altura disponible
        $html .= '  object-fit: cover; '; // Llenar toda la página recortando si es necesario
        $html .= '  display: block; ';
        $html .= '  margin: 0; ';
        $html .= '  padding: 0; ';
        $html .= '}';
        $html .= '</style>';
        $html .= '</head><body>';
        
        // Log para depuración
        Log::info("📝 [PDF-GENERATOR] Configurando CSS para imágenes: object-fit: cover, ancho y alto 100%, sin márgenes");

        foreach ($thumbnailPaths as $index => $imagePath) {
            try {
                // Obtener información de la imagen para ajustar tamaños
                $imageInfo = getimagesize($imagePath);
                $imgWidth = $imageInfo[0];
                $imgHeight = $imageInfo[1];
                $imgRatio = $imgWidth / $imgHeight;
                
                Log::info("🖼️ [PDF-HTML] Imagen {$index}: {$imgWidth}x{$imgHeight}, ratio: {$imgRatio}");
                
                // Convertir la imagen a base64 para embeberla en el PDF
                $imageData = base64_encode(file_get_contents($imagePath));
                $mimeType = $imageInfo['mime'] ?? 'image/png';

                // Determinar estilos específicos para que la imagen llene completamente el espacio
                // Siempre usar object-fit: cover para asegurar que la imagen llena toda la página
                $imgStyle = 'width: 100%; height: 100%; object-fit: cover; display: block; margin: 0; padding: 0;';
                
                Log::info("🖼️ [PDF-HTML] Aplicando estilo a imagen {$index}: {$imgStyle}");

                $html .= '<div class="page">';
                $html .= '<img src="data:' . $mimeType . ';base64,' . $imageData . '" ' .
                         'alt="Página ' . ($index + 1) . '" ' .
                         ($imgStyle ? 'style="' . $imgStyle . '"' : '') . '>';
                $html .= '</div>';
            } catch (\Exception $e) {
                Log::error("❌ [PDF-HTML] Error procesando imagen {$index}: " . $e->getMessage());
                
                // En caso de error, agregar página con mensaje de error
                $html .= '<div class="page" style="text-align: center; padding: 20mm;">';
                $html .= '<h1>Error en la página ' . ($index + 1) . '</h1>';
                $html .= '<p>No se pudo procesar la imagen.</p>';
                $html .= '</div>';
            }
        }

        $html .= '</body></html>';

        return $html;
    }

    /**
     * Obtener información del PDF si existe
     */
    public function getPDFInfo(Request $request, $projectId)
    {
        try {
            $pdfDir = "images/pdf/{$projectId}";
            $pdfFileName = "{$projectId}.pdf";
            $pdfPath = "{$pdfDir}/{$pdfFileName}";
            
            // Verificar solo en storage/app/images
            if (Storage::exists($pdfPath)) {
                $pdfSize = Storage::size($pdfPath);
                $pdfUrl = "/api/customer/projects/{$projectId}/download-pdf"; // URL para descarga directa
                
                Log::info("✅ [PDF-INFO] PDF encontrado: {$pdfPath}");

                return response()->json([
                    'exists' => true,
                    'pdf_path' => $pdfPath,
                    'pdf_url' => $pdfUrl,
                    'pdf_size' => $pdfSize,
                    'created_at' => date('Y-m-d H:i:s', Storage::lastModified($pdfPath))
                ]);
            } else {
                Log::warning("⚠️ [PDF-INFO] PDF no encontrado para proyecto: {$projectId}");
                return response()->json(['exists' => false]);
            }
        } catch (\Exception $e) {
            Log::error("❌ [PDF-INFO] Error: " . $e->getMessage());
            return response()->json(['error' => 'Error obteniendo información del PDF'], 500);
        }
    }

    /**
     * Descargar PDF existente
     */
    public function downloadPDF(Request $request, $projectId)
    {
        try {
            $pdfDir = "images/pdf/{$projectId}";
            $pdfFileName = "{$projectId}.pdf";
            $pdfPath = "{$pdfDir}/{$pdfFileName}";

            // Verificar solo en storage/app/images
            if (Storage::exists($pdfPath)) {
                Log::info("📥 [PDF-DOWNLOAD] Descargando PDF: {$pdfPath}");
                return response()->file(storage_path("app/{$pdfPath}"), [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'attachment; filename="album-'.$projectId.'.pdf"'
                ]);
            } else {
                Log::warning("⚠️ [PDF-DOWNLOAD] PDF no encontrado para proyecto: {$projectId}");
                return response()->json(['error' => 'PDF no encontrado'], 404);
            }
        } catch (\Exception $e) {
            Log::error("❌ [PDF-DOWNLOAD] Error: " . $e->getMessage());
            return response()->json(['error' => 'Error descargando PDF'], 500);
        }
    }
}
