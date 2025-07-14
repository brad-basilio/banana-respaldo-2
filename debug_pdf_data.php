<?php
/**
 * Script de debug para analizar los datos que se envían al PDF
 * 
 * Uso: 
 * php debug_pdf_data.php {project_id}
 */

require_once __DIR__ . '/bootstrap/app.php';

use App\Models\CanvasProject;
use Illuminate\Support\Facades\Log;

if ($argc < 2) {
    echo "❌ Error: Debes proporcionar un ID de proyecto\n";
    echo "Uso: php debug_pdf_data.php {project_id}\n";
    exit(1);
}

$projectId = $argv[1];

try {
    echo "🔍 [DEBUG-PDF] Analizando proyecto ID: {$projectId}\n\n";
    
    // 1. Buscar el proyecto
    $project = CanvasProject::find($projectId);
    
    if (!$project) {
        echo "❌ [DEBUG-PDF] Proyecto no encontrado\n";
        exit(1);
    }
    
    echo "✅ [DEBUG-PDF] Proyecto encontrado: {$project->name}\n";
    echo "📄 [DEBUG-PDF] Tipo de preset: {$project->preset_type}\n\n";
    
    // 2. Analizar design_data
    if (empty($project->design_data)) {
        echo "❌ [DEBUG-PDF] El proyecto no tiene design_data\n";
        exit(1);
    }
    
    $designData = is_string($project->design_data) 
        ? json_decode($project->design_data, true) 
        : $project->design_data;
    
    if (!$designData) {
        echo "❌ [DEBUG-PDF] Error decodificando design_data\n";
        exit(1);
    }
    
    echo "📊 [DEBUG-PDF] Design data decodificado correctamente\n";
    
    // 3. Analizar páginas
    if (!isset($designData['pages']) || empty($designData['pages'])) {
        echo "❌ [DEBUG-PDF] No hay páginas en design_data\n";
        exit(1);
    }
    
    $pages = $designData['pages'];
    echo "📄 [DEBUG-PDF] Páginas encontradas: " . count($pages) . "\n\n";
    
    // 4. Analizar cada página
    foreach ($pages as $pageIndex => $page) {
        echo "📄 [DEBUG-PDF] === PÁGINA " . ($pageIndex + 1) . " ===\n";
        echo "   ID: " . ($page['id'] ?? 'sin-id') . "\n";
        echo "   Color de fondo: " . ($page['backgroundColor'] ?? 'no-definido') . "\n";
        echo "   Imagen de fondo: " . (!empty($page['backgroundImage']) ? 'SÍ' : 'NO') . "\n";
        
        if (!empty($page['backgroundImage'])) {
            $bgImage = $page['backgroundImage'];
            if (strpos($bgImage, 'data:image/') === 0) {
                echo "   Tipo de fondo: Base64\n";
            } elseif (strpos($bgImage, '/api/canvas/image/') === 0) {
                echo "   Tipo de fondo: API URL\n";
            } elseif (strpos($bgImage, 'storage/') !== false) {
                echo "   Tipo de fondo: Storage URL\n";
            } else {
                echo "   Tipo de fondo: URL externa o ruta\n";
            }
            echo "   Fondo URL: " . substr($bgImage, 0, 100) . (strlen($bgImage) > 100 ? '...' : '') . "\n";
        }
        
        // Analizar celdas
        if (!isset($page['cells']) || !is_array($page['cells'])) {
            echo "   ⚠️  No tiene celdas válidas\n";
            continue;
        }
        
        echo "   Celdas: " . count($page['cells']) . "\n";
        
        $elementCount = 0;
        $imageCount = 0;
        $textCount = 0;
        
        foreach ($page['cells'] as $cellIndex => $cell) {
            if (!isset($cell['elements']) || !is_array($cell['elements'])) {
                continue;
            }
            
            foreach ($cell['elements'] as $element) {
                $elementCount++;
                
                if (isset($element['type'])) {
                    if ($element['type'] === 'image') {
                        $imageCount++;
                        echo "   🖼️  Imagen " . $imageCount . ":\n";
                        
                        $imageSource = $element['content'] ?? $element['src'] ?? 'no-definido';
                        if (strpos($imageSource, 'data:image/') === 0) {
                            echo "      Tipo: Base64\n";
                        } elseif (strpos($imageSource, '/api/canvas/image/') === 0) {
                            echo "      Tipo: API URL\n";
                        } elseif (strpos($imageSource, 'storage/') !== false) {
                            echo "      Tipo: Storage URL\n";
                        } else {
                            echo "      Tipo: URL externa o ruta\n";
                        }
                        echo "      Fuente: " . substr($imageSource, 0, 80) . (strlen($imageSource) > 80 ? '...' : '') . "\n";
                        echo "      Posición: x={$element['position']['x']}, y={$element['position']['y']}\n";
                        echo "      Tamaño: w={$element['size']['width']}, h={$element['size']['height']}\n";
                        
                    } elseif ($element['type'] === 'text') {
                        $textCount++;
                        echo "   📝 Texto " . $textCount . ":\n";
                        $content = $element['content'] ?? $element['text'] ?? '';
                        echo "      Contenido: " . substr($content, 0, 50) . (strlen($content) > 50 ? '...' : '') . "\n";
                        echo "      Posición: x={$element['position']['x']}, y={$element['position']['y']}\n";
                        echo "      Tamaño: w={$element['size']['width']}, h={$element['size']['height']}\n";
                        
                        if (isset($element['style'])) {
                            $style = $element['style'];
                            echo "      Color: " . ($style['color'] ?? 'no-definido') . "\n";
                            echo "      Tamaño fuente: " . ($style['fontSize'] ?? 'no-definido') . "\n";
                            echo "      Familia fuente: " . ($style['fontFamily'] ?? 'no-definido') . "\n";
                        }
                    }
                }
            }
        }
        
        echo "   Total elementos: $elementCount (Imágenes: $imageCount, Textos: $textCount)\n\n";
    }
    
    echo "✅ [DEBUG-PDF] Análisis completado\n";
    echo "📊 [DEBUG-PDF] RESUMEN:\n";
    echo "   - Páginas: " . count($pages) . "\n";
    echo "   - Proyecto tiene datos válidos para PDF\n";
    
} catch (\Exception $e) {
    echo "❌ [DEBUG-PDF] Error: " . $e->getMessage() . "\n";
    echo "🔍 [DEBUG-PDF] Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
