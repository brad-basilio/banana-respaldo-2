<?php

require_once 'vendor/autoload.php';

use App\Models\CanvasProject;
use App\Http\Controllers\Api\ProjectPDFController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

// Configurar Laravel para funcionar fuera del contexto web
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->handle(
    Illuminate\Http\Request::capture()
);

try {
    echo "🔍 [DEBUG] Iniciando debug de imágenes en PDF...\n";
    
    // 1. Buscar un proyecto con imágenes
    $project = CanvasProject::where('id', '9f424fe8-dc75-499c-992c-20ba49fdd6ce')->first();
    
    if (!$project) {
        echo "❌ [DEBUG] No se encontró el proyecto\n";
        exit;
    }
    
    echo "✅ [DEBUG] Proyecto encontrado: {$project->name}\n";
    
    // 2. Verificar design_data
    $designData = null;
    if (!empty($project->design_data)) {
        $designData = is_string($project->design_data) 
            ? json_decode($project->design_data, true) 
            : $project->design_data;
    }
    
    if (!$designData || !isset($designData['pages'])) {
        echo "❌ [DEBUG] No se encontraron páginas en design_data\n";
        exit;
    }
    
    echo "✅ [DEBUG] Páginas encontradas: " . count($designData['pages']) . "\n";
    
    // 3. Analizar elementos de imagen
    $imageElements = [];
    foreach ($designData['pages'] as $pageIndex => $page) {
        if (!isset($page['cells']) || !is_array($page['cells'])) {
            continue;
        }
        
        foreach ($page['cells'] as $cellIndex => $cell) {
            if (!isset($cell['elements']) || !is_array($cell['elements'])) {
                continue;
            }
            
            foreach ($cell['elements'] as $elementIndex => $element) {
                if ($element['type'] === 'image') {
                    $imageElements[] = [
                        'page' => $pageIndex,
                        'cell' => $cellIndex,
                        'element' => $elementIndex,
                        'id' => $element['id'] ?? 'no-id',
                        'content' => $element['content'] ?? $element['src'] ?? 'no-content',
                        'position' => $element['position'] ?? 'no-position',
                        'size' => $element['size'] ?? 'no-size',
                        'full_element' => $element
                    ];
                }
            }
        }
    }
    
    echo "🖼️ [DEBUG] Elementos de imagen encontrados: " . count($imageElements) . "\n";
    
    // 4. Mostrar detalles de cada imagen
    foreach ($imageElements as $index => $imageElement) {
        echo "\n--- IMAGEN " . ($index + 1) . " ---\n";
        echo "Página: {$imageElement['page']}\n";
        echo "Celda: {$imageElement['cell']}\n";
        echo "Elemento: {$imageElement['element']}\n";
        echo "ID: {$imageElement['id']}\n";
        echo "Posición: " . json_encode($imageElement['position']) . "\n";
        echo "Tamaño: " . json_encode($imageElement['size']) . "\n";
        echo "Contenido (primeros 100 chars): " . substr($imageElement['content'], 0, 100) . "...\n";
        
        // Verificar si el contenido es base64
        if (strpos($imageElement['content'], 'data:image/') === 0) {
            echo "✅ Tipo: Base64\n";
        } elseif (strpos($imageElement['content'], '/api/canvas/image/') === 0) {
            echo "✅ Tipo: URL API\n";
        } elseif (strpos($imageElement['content'], 'storage/') === 0) {
            echo "✅ Tipo: Storage\n";
        } else {
            echo "❓ Tipo: Desconocido\n";
        }
    }
    
    // 5. Probar el controlador con debug
    echo "\n🎯 [DEBUG] Probando controlador PDF...\n";
    
    $controller = new ProjectPDFController();
    
    // Crear un request fake
    $request = Request::create('/api/projects/9f424fe8-dc75-499c-992c-20ba49fdd6ce/pdf', 'GET', [
        'pages' => $designData['pages']
    ]);
    
    try {
        $response = $controller->debugPDFHtml($request, '9f424fe8-dc75-499c-992c-20ba49fdd6ce');
        $responseData = json_decode($response->getContent(), true);
        
        if (isset($responseData['html_full'])) {
            echo "✅ [DEBUG] HTML generado correctamente\n";
            
            // Buscar imágenes en el HTML
            $html = $responseData['html_full'];
            $imageMatches = [];
            preg_match_all('/<img[^>]+src="([^"]*)"[^>]*>/', $html, $imageMatches);
            
            echo "🖼️ [DEBUG] Imágenes encontradas en HTML: " . count($imageMatches[1]) . "\n";
            
            foreach ($imageMatches[1] as $index => $src) {
                echo "Imagen " . ($index + 1) . ": " . substr($src, 0, 100) . "...\n";
            }
            
            // Guardar HTML para inspección
            file_put_contents('debug_html_output.html', $html);
            echo "📄 [DEBUG] HTML guardado en: debug_html_output.html\n";
            
        } else {
            echo "❌ [DEBUG] Error en respuesta del controlador\n";
            echo "Respuesta: " . $response->getContent() . "\n";
        }
        
    } catch (Exception $e) {
        echo "❌ [DEBUG] Error en controlador: " . $e->getMessage() . "\n";
        echo "Trace: " . $e->getTraceAsString() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ [DEBUG] Error general: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
