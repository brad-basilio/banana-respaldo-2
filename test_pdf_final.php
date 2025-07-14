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
    echo "🎯 [TEST] Generando PDF con imagen corregida...\n";
    
    $controller = new ProjectPDFController();
    
    // Crear request vacío para usar datos del proyecto guardado
    $request = Request::create('/test', 'GET', []);
    
    $response = $controller->generatePDF($request, '9f424fe8-dc75-499c-992c-20ba49fdd6ce');
    
    if ($response->getStatusCode() === 200) {
        echo "✅ [TEST] PDF generado exitosamente\n";
        echo "📄 Content-Type: " . $response->headers->get('Content-Type') . "\n";
        echo "📄 Content-Length: " . strlen($response->getContent()) . " bytes\n";
        
        // Guardar PDF para inspección
        file_put_contents('test_pdf_final.pdf', $response->getContent());
        echo "💾 [TEST] PDF guardado como: test_pdf_final.pdf\n";
    } else {
        echo "❌ [TEST] Error generando PDF\n";
        echo "Status: " . $response->getStatusCode() . "\n";
        echo "Response: " . $response->getContent() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ [TEST] Error: " . $e->getMessage() . "\n";
}
