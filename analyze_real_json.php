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
    echo "🔍 [ANÁLISIS] Analizando design_data real desde la base de datos...\n";
    
    // Buscar el proyecto específico que mencionaste
    $project = CanvasProject::where('id', '9f61f9e9-004d-49c9-9092-e43132e7b8cf')->first();
    
    if (!$project) {
        echo "❌ [ANÁLISIS] Proyecto no encontrado: 9f61f9e9-004d-49c9-9092-e43132e7b8cf\n";
        exit;
    }
    
    echo "✅ [ANÁLISIS] Proyecto encontrado: {$project->name}\n";
    
    // Obtener design_data
    $designData = is_string($project->design_data) 
        ? json_decode($project->design_data, true) 
        : $project->design_data;
    
    if (!$designData || !isset($designData['pages'])) {
        echo "❌ [ANÁLISIS] No se encontraron páginas en design_data\n";
        exit;
    }
    
    echo "✅ [ANÁLISIS] Páginas encontradas: " . count($designData['pages']) . "\n";
    
    // Analizar la primera página (cover)
    $coverPage = $designData['pages'][0];
    echo "\n📄 [ANÁLISIS] Página de portada:\n";
    echo "ID: " . ($coverPage['id'] ?? 'no-id') . "\n";
    echo "Tipo: " . ($coverPage['type'] ?? 'no-type') . "\n";
    echo "Background Image: " . ($coverPage['backgroundImage'] ?? 'no-background') . "\n";
    echo "Background Color: " . ($coverPage['backgroundColor'] ?? 'no-color') . "\n";
    
    // Analizar celdas
    if (isset($coverPage['cells']) && is_array($coverPage['cells'])) {
        echo "\n📦 [ANÁLISIS] Celdas en portada: " . count($coverPage['cells']) . "\n";
        
        foreach ($coverPage['cells'] as $cellIndex => $cell) {
            echo "\n--- CELDA {$cellIndex} ---\n";
            echo "ID: " . ($cell['id'] ?? 'no-id') . "\n";
            
            if (isset($cell['elements']) && is_array($cell['elements'])) {
                echo "Elementos: " . count($cell['elements']) . "\n";
                
                foreach ($cell['elements'] as $elementIndex => $element) {
                    echo "\n  --- ELEMENTO {$elementIndex} ---\n";
                    echo "  ID: " . ($element['id'] ?? 'no-id') . "\n";
                    echo "  Tipo: " . ($element['type'] ?? 'no-type') . "\n";
                    
                    if ($element['type'] === 'image') {
                        echo "  🖼️ IMAGEN ENCONTRADA:\n";
                        echo "    Content: " . ($element['content'] ?? 'no-content') . "\n";
                        echo "    Position:\n";
                        echo "      x: " . ($element['position']['x'] ?? 'no-x') . "\n";
                        echo "      y: " . ($element['position']['y'] ?? 'no-y') . "\n";
                        echo "    Size:\n";
                        echo "      width: " . ($element['size']['width'] ?? 'no-width') . "\n";
                        echo "      height: " . ($element['size']['height'] ?? 'no-height') . "\n";
                        echo "    zIndex: " . ($element['zIndex'] ?? 'no-zindex') . "\n";
                        
                        // Verificar si la imagen existe
                        $imagePath = $element['content'];
                        $fullPath = public_path($imagePath);
                        echo "    Ruta completa: {$fullPath}\n";
                        
                        if (file_exists($fullPath)) {
                            echo "    ✅ Imagen existe en disco\n";
                            echo "    📏 Tamaño: " . filesize($fullPath) . " bytes\n";
                        } else {
                            echo "    ❌ Imagen NO existe en disco\n";
                        }
                        
                        // ANALIZAR EL PROBLEMA: Los valores son decimales (0-1), no píxeles
                        echo "\n  🔍 ANÁLISIS DE VALORES:\n";
                        echo "    - Position x: {$element['position']['x']} (decimal entre 0-1)\n";
                        echo "    - Position y: {$element['position']['y']} (decimal entre 0-1)\n";
                        echo "    - Size width: {$element['size']['width']} (decimal entre 0-1)\n";
                        echo "    - Size height: {$element['size']['height']} (decimal entre 0-1)\n";
                        
                        // Convertir a porcentajes
                        $xPercent = $element['position']['x'] * 100;
                        $yPercent = $element['position']['y'] * 100;
                        $widthPercent = $element['size']['width'] * 100;
                        $heightPercent = $element['size']['height'] * 100;
                        
                        echo "\n  📊 CONVERSIÓN A PORCENTAJES:\n";
                        echo "    - Position x: {$xPercent}%\n";
                        echo "    - Position y: {$yPercent}%\n";
                        echo "    - Size width: {$widthPercent}%\n";
                        echo "    - Size height: {$heightPercent}%\n";
                        
                    } elseif ($element['type'] === 'text') {
                        echo "  📝 TEXTO ENCONTRADO:\n";
                        echo "    Content: " . ($element['content'] ?? 'no-content') . "\n";
                        echo "    Position: x=" . ($element['position']['x'] ?? 'no-x') . ", y=" . ($element['position']['y'] ?? 'no-y') . "\n";
                        echo "    Size: w=" . ($element['size']['width'] ?? 'no-width') . ", h=" . ($element['size']['height'] ?? 'no-height') . "\n";
                    }
                }
            }
        }
    }
    
    // Verificar workspaceDimensions
    if (isset($designData['workspaceDimensions'])) {
        echo "\n📐 [ANÁLISIS] WorkspaceDimensions en design_data:\n";
        echo json_encode($designData['workspaceDimensions'], JSON_PRETTY_PRINT);
    } else {
        echo "\n❌ [ANÁLISIS] No se encontraron workspaceDimensions en design_data\n";
    }
    
} catch (Exception $e) {
    echo "❌ [ANÁLISIS] Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
