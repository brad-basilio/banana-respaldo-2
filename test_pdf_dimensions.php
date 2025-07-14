<?php

require_once 'vendor/autoload.php';

use App\Http\Controllers\Api\ProjectPDFController;
use App\Models\CanvasProject;
use Illuminate\Http\Request;

// Configurar entorno de prueba
$_ENV['APP_ENV'] = 'local';
$_ENV['APP_DEBUG'] = true;
$_ENV['DB_CONNECTION'] = 'mysql';
$_ENV['DB_HOST'] = '127.0.0.1';
$_ENV['DB_PORT'] = '3306';
$_ENV['DB_DATABASE'] = 'bananalab_app_db';
$_ENV['DB_USERNAME'] = 'root';
$_ENV['DB_PASSWORD'] = '';

// Inicializar Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Request::capture();
$response = $kernel->handle($request);

echo "🧪 Testing PDF Dimensions Conversion\n";
echo "=====================================\n\n";

try {
    // Buscar un proyecto de prueba
    $project = CanvasProject::first();
    
    if (!$project) {
        echo "❌ No se encontró ningún proyecto para probar\n";
        exit;
    }
    
    echo "✅ Proyecto encontrado: {$project->name} (ID: {$project->id})\n";
    
    // Simular datos de prueba
    $testData = [
        'pages' => [
            [
                'id' => 'page-1',
                'backgroundColor' => '#FFFFFF',
                'backgroundImage' => null,
                'cells' => [
                    [
                        'id' => 'cell-1',
                        'elements' => [
                            [
                                'id' => 'element-1',
                                'type' => 'image',
                                'position' => ['x' => 100, 'y' => 50],
                                'size' => ['width' => 200, 'height' => 150],
                                'zIndex' => 1,
                                'content' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=='
                            ],
                            [
                                'id' => 'element-2',
                                'type' => 'text',
                                'position' => ['x' => 300, 'y' => 200],
                                'size' => ['width' => 180, 'height' => 50],
                                'zIndex' => 2,
                                'content' => 'Texto de prueba',
                                'style' => [
                                    'fontSize' => '18px',
                                    'color' => '#333333'
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ];
    
    // Crear request simulado
    $request = new Request();
    $request->merge(['pages' => $testData['pages']]);
    
    // Probar el controlador
    $controller = new ProjectPDFController();
    $response = $controller->generatePDF($request, $project->id);
    
    echo "✅ PDF generado exitosamente\n";
    echo "📄 Tipo de respuesta: " . get_class($response) . "\n";
    echo "📏 Tamaño del PDF: " . strlen($response->getContent()) . " bytes\n";
    
} catch (Exception $e) {
    echo "❌ Error durante la prueba: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n🧪 Prueba finalizada\n";
