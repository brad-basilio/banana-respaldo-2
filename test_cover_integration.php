<?php
// Test simple para verificar la integración de cover

require_once __DIR__ . '/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$projectId = '9f61f9e9-004d-49c9-9092-e43132e7b8cf';

echo "🧪 TESTING COVER INTEGRATION\n";
echo "=" . str_repeat("=", 40) . "\n\n";

try {
    // Crear request
    $request = new Illuminate\Http\Request();
    
    // Usar el controlador existente
    $controller = new App\Http\Controllers\Api\ProjectPDFController();
    
    echo "🔄 Generando PDF con cover integrado...\n";
    
    // Generar PDF
    $response = $controller->generatePDF($request, $projectId);
    
    if ($response instanceof Illuminate\Http\JsonResponse) {
        $data = $response->getData(true);
        
        if (isset($data['error'])) {
            echo "❌ ERROR: " . $data['error'] . "\n";
        } else {
            echo "✅ Respuesta JSON recibida\n";
            echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "✅ PDF generado exitosamente!\n";
        
        if (method_exists($response, 'getContent')) {
            $content = $response->getContent();
            echo "📏 Tamaño del PDF: " . strlen($content) . " bytes\n";
            
            // Guardar para inspección
            $filename = 'test_cover_integrated_' . date('Y-m-d_H-i-s') . '.pdf';
            file_put_contents($filename, $content);
            echo "💾 PDF guardado: {$filename}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . " línea: " . $e->getLine() . "\n";
}

echo "\n" . str_repeat("=", 40) . "\n";
echo "🎉 Test completado!\n";
?>
