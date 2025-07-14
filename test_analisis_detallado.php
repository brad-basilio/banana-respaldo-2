<?php

require_once 'vendor/autoload.php';

use App\Models\CanvasProject;
use Illuminate\Support\Facades\Log;

// Configurar Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->handle(
    Illuminate\Http\Request::capture()
);

try {
    $project = CanvasProject::find('9f61f9e9-004d-49c9-9092-e43132e7b8cf');
    
    if (!$project) {
        echo "❌ Proyecto no encontrado\n";
        exit;
    }
    
    echo "🔍 [ANÁLISIS DETALLADO] Analizando valores de posición y tamaño\n\n";
    
    $designData = is_string($project->design_data) 
        ? json_decode($project->design_data, true) 
        : $project->design_data;
    
    if (!$designData || !isset($designData['pages'])) {
        echo "❌ No hay datos de diseño válidos\n";
        exit;
    }
    
    // Analizar cada página
    foreach ($designData['pages'] as $pageIndex => $page) {
        echo "📄 PÁGINA " . ($pageIndex + 1) . ":\n";
        
        if (!isset($page['cells']) || !is_array($page['cells'])) {
            echo "  ❌ Sin celdas válidas\n";
            continue;
        }
        
        foreach ($page['cells'] as $cellIndex => $cell) {
            if (!isset($cell['elements']) || !is_array($cell['elements'])) {
                continue;
            }
            
            foreach ($cell['elements'] as $elementIndex => $element) {
                $elementId = $element['id'] ?? "element-{$elementIndex}";
                $elementType = $element['type'] ?? 'unknown';
                
                echo "  🔸 Elemento: {$elementId} (tipo: {$elementType})\n";
                
                if (isset($element['position']) && isset($element['size'])) {
                    $pos = $element['position'];
                    $size = $element['size'];
                    
                    echo "    📍 Posición original: x={$pos['x']}, y={$pos['y']}\n";
                    echo "    📏 Tamaño original: w={$size['width']}, h={$size['height']}\n";
                    
                    // Determinar si los valores están normalizados (0-1) o ya en porcentajes
                    $isNormalized = (
                        $pos['x'] >= 0 && $pos['x'] <= 1 &&
                        $pos['y'] >= 0 && $pos['y'] <= 1 &&
                        $size['width'] >= 0 && $size['width'] <= 1 &&
                        $size['height'] >= 0 && $size['height'] <= 1
                    );
                    
                    if ($isNormalized) {
                        echo "    ✅ Valores NORMALIZADOS (0-1) - Multiplicar por 100\n";
                        $xPercent = $pos['x'] * 100;
                        $yPercent = $pos['y'] * 100;
                        $widthPercent = $size['width'] * 100;
                        $heightPercent = $size['height'] * 100;
                    } else {
                        echo "    ⚠️ Valores YA EN PORCENTAJES - NO multiplicar\n";
                        $xPercent = $pos['x'];
                        $yPercent = $pos['y'];
                        $widthPercent = $size['width'];
                        $heightPercent = $size['height'];
                    }
                    
                    echo "    📐 Valores finales: x={$xPercent}%, y={$yPercent}%, w={$widthPercent}%, h={$heightPercent}%\n";
                    
                    // Verificar si hay imagen
                    if ($elementType === 'image' && isset($element['content'])) {
                        $contentLength = strlen($element['content']);
                        echo "    🖼️ Contenido de imagen: {$contentLength} caracteres\n";
                        
                        if (strpos($element['content'], 'data:image/') === 0) {
                            echo "    ✅ Imagen base64 válida\n";
                        } else {
                            echo "    ⚠️ No es imagen base64\n";
                        }
                    }
                    
                } else {
                    echo "    ❌ Sin posición o tamaño válidos\n";
                }
                
                echo "\n";
            }
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
