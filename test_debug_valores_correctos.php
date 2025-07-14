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
    echo "🔍 [DEBUG] Generando HTML de debug con valores corregidos...\n";
    
    $controller = new ProjectPDFController();
    
    $request = Request::create('/test', 'GET', []);
    
    $response = $controller->debugPDFHtml($request, '9f61f9e9-004d-49c9-9092-e43132e7b8cf');
    $responseData = json_decode($response->getContent(), true);
    
    if (isset($responseData['html_full'])) {
        echo "✅ [DEBUG] HTML generado correctamente\n";
        
        // Buscar la imagen específica
        $html = $responseData['html_full'];
        $imageMatches = [];
        preg_match_all('/<img[^>]+src="([^"]*)"[^>]*>/', $html, $imageMatches);
        
        echo "🖼️ [DEBUG] Imágenes encontradas en HTML: " . count($imageMatches[1]) . "\n";
        
        foreach ($imageMatches[1] as $index => $src) {
            echo "Imagen " . ($index + 1) . ": " . substr($src, 0, 100) . "...\n";
        }
        
        // Buscar elementos con el ID cover-image
        $coverImageMatches = [];
        preg_match_all('/<div[^>]*style="[^"]*left:\s*([0-9.]+)%[^"]*top:\s*([0-9.]+)%[^"]*width:\s*([0-9.]+)%[^"]*height:\s*([0-9.]+)%[^"]*"[^>]*>.*?<img/s', $html, $coverImageMatches);
        
        if (count($coverImageMatches[0]) > 0) {
            echo "\n📐 [DEBUG] Elementos de imagen encontrados con posiciones:\n";
            for ($i = 0; $i < count($coverImageMatches[1]); $i++) {
                echo "Elemento " . ($i + 1) . ":\n";
                echo "  Left: " . $coverImageMatches[1][$i] . "%\n";
                echo "  Top: " . $coverImageMatches[2][$i] . "%\n";
                echo "  Width: " . $coverImageMatches[3][$i] . "%\n";
                echo "  Height: " . $coverImageMatches[4][$i] . "%\n";
            }
        }
        
        // Guardar HTML para inspección
        file_put_contents('debug_html_valores_correctos.html', $html);
        echo "\n📄 [DEBUG] HTML guardado en: debug_html_valores_correctos.html\n";
        
    } else {
        echo "❌ [DEBUG] Error en respuesta del controlador\n";
        echo "Respuesta: " . $response->getContent() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ [DEBUG] Error: " . $e->getMessage() . "\n";
}
