<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// Configurar Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 [TEST] Verificando URLs de imágenes en design_data...\n\n";

try {
    // Obtener proyectos recientes con design_data
    $projects = DB::table('canvas_projects')
        ->whereNotNull('design_data')
        ->orderBy('updated_at', 'desc')
        ->limit(5)
        ->get(['id', 'name', 'design_data', 'updated_at']);

    if ($projects->isEmpty()) {
        echo "❌ No se encontraron proyectos con design_data\n";
        exit;
    }

    foreach ($projects as $project) {
        echo "📂 Proyecto: {$project->name} (ID: {$project->id})\n";
        echo "📅 Actualizado: {$project->updated_at}\n";
        
        $designData = json_decode($project->design_data, true);
        
        if (!$designData || !isset($designData['pages'])) {
            echo "⚠️  No hay datos de páginas válidos\n\n";
            continue;
        }
        
        $imageCount = 0;
        $apiUrlCount = 0;
        $base64Count = 0;
        $otherUrlCount = 0;
        
        foreach ($designData['pages'] as $pageIndex => $page) {
            if (isset($page['cells'])) {
                foreach ($page['cells'] as $cellIndex => $cell) {
                    if (isset($cell['elements'])) {
                        foreach ($cell['elements'] as $elementIndex => $element) {
                            if ($element['type'] === 'image' && !empty($element['content'])) {
                                $imageCount++;
                                $content = $element['content'];
                                
                                if (strpos($content, '/api/canvas/image/') === 0) {
                                    $apiUrlCount++;
                                    echo "  🔗 API URL: {$content}\n";
                                } elseif (strpos($content, 'data:image/') === 0) {
                                    $base64Count++;
                                    $size = strlen($content);
                                    echo "  📸 Base64: " . substr($content, 0, 50) . "... ({$size} chars)\n";
                                } else {
                                    $otherUrlCount++;
                                    echo "  🌐 Otra URL: {$content}\n";
                                }
                            }
                        }
                    }
                }
            }
        }
        
        echo "📊 Resumen:\n";
        echo "  - Total imágenes: {$imageCount}\n";
        echo "  - URLs /api/canvas/image/: {$apiUrlCount}\n";
        echo "  - Base64: {$base64Count}\n";
        echo "  - Otras URLs: {$otherUrlCount}\n";
        
        if ($apiUrlCount > 0) {
            echo "❌ PROBLEMA: Se encontraron URLs con /api/canvas/image/\n";
        } else {
            echo "✅ OK: No hay URLs problemáticas\n";
        }
        
        echo "\n" . str_repeat("-", 60) . "\n\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "✅ [TEST] Verificación completada\n";
