<?php

require_once 'vendor/autoload.php';

// Configurar Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\CanvasProject;

echo "🔍 Investigando estructura de datos del proyecto...\n\n";

$projectId = '9f424fe8-dc75-499c-992c-20ba49fdd6ce';
$project = CanvasProject::find($projectId);

if (!$project) {
    echo "❌ Proyecto no encontrado\n";
    exit(1);
}

echo "✅ Proyecto encontrado: " . $project->name . "\n";
echo "📊 Tamaño de design_data: " . strlen($project->design_data) . " bytes\n";

$designData = json_decode($project->design_data, true);

if (!$designData) {
    echo "❌ Error decodificando JSON\n";
    exit(1);
}

echo "🔑 Claves principales en design_data:\n";
foreach (array_keys($designData) as $key) {
    echo "  - $key\n";
}

if (isset($designData['pages'])) {
    echo "\n📄 Información de páginas:\n";
    echo "  Total páginas: " . count($designData['pages']) . "\n";
    
    // Examinar las primeras 3 páginas
    for ($i = 0; $i < min(3, count($designData['pages'])); $i++) {
        $page = $designData['pages'][$i];
        echo "\n  Página " . ($i + 1) . ":\n";
        echo "    - ID: " . ($page['id'] ?? 'N/A') . "\n";
        echo "    - Tipo: " . ($page['type'] ?? 'N/A') . "\n";
        echo "    - Background: " . (isset($page['backgroundImage']) ? 'SÍ' : 'NO') . "\n";
        echo "    - Color fondo: " . ($page['backgroundColor'] ?? 'N/A') . "\n";
        
        if (isset($page['cells'])) {
            echo "    - Células: " . count($page['cells']) . "\n";
            
            foreach ($page['cells'] as $cellIndex => $cell) {
                echo "      Célula " . ($cellIndex + 1) . ":\n";
                echo "        - ID: " . ($cell['id'] ?? 'N/A') . "\n";
                echo "        - Elementos: " . (isset($cell['elements']) ? count($cell['elements']) : 0) . "\n";
                
                if (isset($cell['elements']) && count($cell['elements']) > 0) {
                    foreach ($cell['elements'] as $elemIndex => $element) {
                        echo "          Elemento " . ($elemIndex + 1) . ":\n";
                        echo "            - Tipo: " . ($element['type'] ?? 'N/A') . "\n";
                        echo "            - Contenido: " . (isset($element['content']) ? (strlen($element['content']) > 50 ? substr($element['content'], 0, 50) . '...' : $element['content']) : 'N/A') . "\n";
                        echo "            - Posición: x=" . ($element['position']['x'] ?? 'N/A') . ", y=" . ($element['position']['y'] ?? 'N/A') . "\n";
                    }
                }
            }
        } else {
            echo "    - ❌ NO tiene células\n";
        }
    }
} else {
    echo "\n❌ NO se encontraron páginas en design_data\n";
}

echo "\n🏁 Análisis completado.\n";
