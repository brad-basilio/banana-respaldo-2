<?php

require_once 'vendor/autoload.php';

use App\Models\CanvasProject;
use App\Http\Controllers\Api\ProjectPDFController;
use Illuminate\Http\Request;

// Configurar Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->handle(
    Illuminate\Http\Request::capture()
);

try {
    echo "🎯 [TEST] Generando PDF con valores normalizados corregidos...\n";
    echo "📁 [TEST] Proyecto: 9f61f9e9-004d-49c9-9092-e43132e7b8cf\n";
    
    $controller = new ProjectPDFController();
    
    // Crear request vacío para usar datos del proyecto guardado
    $request = Request::create('/test', 'GET', []);
    
    $response = $controller->generatePDF($request, '9f61f9e9-004d-49c9-9092-e43132e7b8cf');
    
    if ($response->getStatusCode() === 200) {
        echo "✅ [TEST] PDF generado exitosamente\n";
        echo "📄 Content-Type: " . $response->headers->get('Content-Type') . "\n";
        echo "📄 Content-Length: " . strlen($response->getContent()) . " bytes\n";
        
        // Guardar PDF para inspección
        file_put_contents('test_pdf_valores_correctos.pdf', $response->getContent());
        echo "💾 [TEST] PDF guardado como: test_pdf_valores_correctos.pdf\n";
        
        echo "\n📊 [TEST] La imagen debería aparecer en:\n";
        echo "  Position: 49.1% x 13.5% (casi centro horizontal, parte superior)\n";
        echo "  Size: 36.8% x 53.2% (un tercio del ancho, más de la mitad del alto)\n";
        echo "  ¡Ahora debería ser claramente visible!\n";
        
    } else {
        echo "❌ [TEST] Error generando PDF\n";
        echo "Status: " . $response->getStatusCode() . "\n";
        echo "Response: " . $response->getContent() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ [TEST] Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
