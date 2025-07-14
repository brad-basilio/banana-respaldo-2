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
    echo "🖼️ [TEST] Generando PDF con object-fit: cover aplicado...\n";
    
    $controller = new ProjectPDFController();
    
    $request = Request::create('/test', 'GET', []);
    
    $response = $controller->generatePDF($request, '9f61f9e9-004d-49c9-9092-e43132e7b8cf');
    
    if ($response->getStatusCode() === 200) {
        echo "✅ [TEST] PDF generado exitosamente con object-fit: cover\n";
        
        // Guardar el PDF
        $pdfContent = $response->getContent();
        file_put_contents('test_pdf_con_cover.pdf', $pdfContent);
        
        echo "📄 [TEST] PDF guardado como: test_pdf_con_cover.pdf\n";
        echo "🎯 [TEST] La imagen ahora debería verse con cover aplicado (sin distorsión)\n";
        
    } else {
        echo "❌ [TEST] Error generando PDF: " . $response->getStatusCode() . "\n";
        echo "Contenido: " . $response->getContent() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ [TEST] Error: " . $e->getMessage() . "\n";
}
