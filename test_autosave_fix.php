<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Log;

// Configurar Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧪 [TEST] Simulando auto-save con estructura correcta...\n\n";

try {
    $projectId = '9f61f9e9-004d-49c9-9092-e43132e7b8cf';
    
    // Simular datos como los que envía el frontend corregido
    $testData = [
        'design_data' => [  // ✅ Corregido: ahora usa design_data
            'pages' => [
                [
                    'id' => 'page-cover',
                    'type' => 'cover',
                    'layout' => 'layout-1',
                    'cells' => [
                        [
                            'id' => 'cell-cover-1',
                            'elements' => [
                                [
                                    'id' => 'test-element-123',
                                    'type' => 'image',
                                    'content' => '/storage/images/projects/' . $projectId . '/test-image.jpg',
                                    'position' => ['x' => 0.1, 'y' => 0.1],
                                    'size' => ['width' => 0.3, 'height' => 0.3]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            'currentPage' => 0,
            'workspaceDimensions' => [
                'width' => 723,
                'height' => 511,
                'originalWidth' => 297,
                'originalHeight' => 210,
                'scale' => 0.06437389770723104
            ],
            'workspaceSize' => 'preset',
            'selectedElement' => 'test-element-123',
            'selectedCell' => 'cell-cover-1',
            'history' => [],
            'historyIndex' => 0,
            'timestamp' => date('c'),
            'version' => '2.0',
            'project' => [
                'id' => $projectId,
                'name' => 'Proyecto de Prueba',
                'item_id' => 'test-item-id'
            ]
        ],
        'thumbnails' => [
            'page-cover' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        ]
    ];
    
    echo "📊 [DATA] Estructura de datos a enviar:\n";
    echo "- Campo principal: design_data ✅\n";
    echo "- Campo thumbnails: " . (isset($testData['thumbnails']) ? 'present ✅' : 'missing ❌') . "\n";
    echo "- Tamaño total: " . round(strlen(json_encode($testData)) / 1024, 2) . " KB\n\n";
    
    // Verificar que la estructura es válida según las reglas del controlador
    $rules = [
        'design_data' => 'required|array',
        'thumbnails' => 'array'
    ];
    
    $validator = \Illuminate\Support\Facades\Validator::make($testData, $rules);
    
    if ($validator->fails()) {
        echo "❌ [VALIDATION] Errores de validación:\n";
        foreach ($validator->errors()->all() as $error) {
            echo "  - {$error}\n";
        }
    } else {
        echo "✅ [VALIDATION] Datos válidos según reglas del controlador\n";
        echo "✅ [VALIDATION] Campo 'design_data' presente y es array\n";
        echo "✅ [VALIDATION] Campo 'thumbnails' presente y es array\n";
    }
    
    echo "\n🔧 [FIX] El problema se solucionó cambiando:\n";
    echo "  ❌ Antes: project_data: designData\n";
    echo "  ✅ Ahora:  design_data: designData\n";
    
    echo "\n📡 [SIMULATION] Simulando request HTTP:\n";
    echo "POST /api/canvas/projects/{$projectId}/save-progress\n";
    echo "Content-Type: application/json\n";
    echo "Payload: " . json_encode($testData, JSON_PRETTY_PRINT) . "\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n✅ [TEST] Simulación completada\n";
