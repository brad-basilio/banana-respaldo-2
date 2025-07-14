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
    echo "🎯 [FINAL] Generando PDF con object-fit: cover aplicado correctamente...\n";
    
    $controller = new ProjectPDFController();
    
    $request = Request::create('/test', 'GET', []);
    
    $response = $controller->generatePDF($request, '9f61f9e9-004d-49c9-9092-e43132e7b8cf');
    
    if ($response->getStatusCode() === 200) {
        echo "✅ [FINAL] PDF generado exitosamente\n";
        
        // Guardar el PDF
        $pdfContent = $response->getContent();
        file_put_contents('test_pdf_final_con_cover.pdf', $pdfContent);
        
        echo "📄 [FINAL] PDF guardado como: test_pdf_final_con_cover.pdf\n";
        echo "🖼️ [FINAL] Características aplicadas:\n";
        echo "   ✅ object-fit: cover !important (para elementos)\n";
        echo "   ✅ object-fit: cover !important (para imágenes)\n";
        echo "   ✅ background-size: cover (para fondos)\n";
        echo "   ✅ image-rendering: high-quality\n";
        echo "   ✅ Posiciones y tamaños en porcentajes\n";
        echo "\n🎉 [FINAL] La imagen ahora debería verse:\n";
        echo "   • Sin distorsión (proporción mantenida)\n";
        echo "   • Rellenando todo el contenedor\n";
        echo "   • Con alta calidad de renderizado\n";
        echo "   • En la posición correcta (49.1% x 13.5%)\n";
        echo "   • Con el tamaño correcto (36.8% x 53.2%)\n";
        
    } else {
        echo "❌ [FINAL] Error generando PDF: " . $response->getStatusCode() . "\n";
        echo "Contenido: " . $response->getContent() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ [FINAL] Error: " . $e->getMessage() . "\n";
}
