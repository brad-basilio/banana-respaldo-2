<?php

require __DIR__ . '/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\CanvasProject;
use App\Http\Controllers\Api\ProjectPDFController;
use Illuminate\Support\Facades\Log;

// ID del proyecto a probar (desde tu JSON)
$projectId = '9f424fe8-dc75-499c-992c-20ba49fdd6ce';

echo "🔍 Probando PDF export para proyecto: {$projectId}\n\n";

try {
    // Buscar el proyecto
    $project = CanvasProject::find($projectId);
    
    if (!$project) {
        echo "❌ Proyecto no encontrado\n";
        exit(1);
    }
    
    echo "✅ Proyecto encontrado: {$project->name}\n";
    echo "📊 Datos del proyecto:\n";
    
    $designData = is_string($project->design_data) 
        ? json_decode($project->design_data, true) 
        : $project->design_data;
    if ($designData && isset($designData['pages'])) {
        echo "  - Páginas: " . count($designData['pages']) . "\n";
        
        // Contar elementos por página
        foreach ($designData['pages'] as $index => $page) {
            $elementCount = 0;
            if (isset($page['cells'])) {
                foreach ($page['cells'] as $cell) {
                    if (isset($cell['elements'])) {
                        $elementCount += count($cell['elements']);
                    }
                }
            }
            echo "  - Página " . ($index + 1) . ": {$elementCount} elementos\n";
            
            // Mostrar detalles de la primera página como ejemplo
            if ($index === 0 && isset($page['cells'][0]['elements'])) {
                echo "    Elementos en primera página:\n";
                foreach ($page['cells'][0]['elements'] as $element) {
                    echo "      - {$element['type']}: " . substr($element['content'] ?? 'sin contenido', 0, 50) . "\n";
                }
            }
        }
    } else {
        echo "  - ⚠️ No se encontraron páginas en design_data\n";
    }
    
    // Verificar thumbnails
    if ($project->thumbnails) {
        $thumbnails = is_string($project->thumbnails) 
            ? json_decode($project->thumbnails, true) 
            : $project->thumbnails;
        echo "  - Thumbnails: " . count($thumbnails) . "\n";
    } else {
        echo "  - Thumbnails: 0\n";
    }
    
    echo "\n🖨️ Simulando export PDF...\n";
    
    // Crear request simulado con datos completos del proyecto
    $request = new \Illuminate\Http\Request();
    $request->merge([
        'quality' => 'high',
        'dpi' => 300,
        'includeBackgrounds' => true,
        'optimize' => true,
        'pages' => $designData['pages'] ?? [],
        'projectData' => [
            'id' => $project->id,
            'name' => $project->name,
            'design_data' => $designData
        ]
    ]);
    
    // Usar el controlador para generar PDF
    $controller = new ProjectPDFController();
    $response = $controller->generatePDF($request, $projectId);
    
    echo "📄 Respuesta del controlador:\n";
    echo "  - Status: " . $response->status() . "\n";
    
    if ($response->status() === 200) {
        echo "✅ PDF generado exitosamente\n";
        
        // Obtener headers
        $headers = $response->headers->all();
        if (isset($headers['content-type'])) {
            echo "  - Content-Type: " . implode(', ', $headers['content-type']) . "\n";
        }
        if (isset($headers['content-length'])) {
            echo "  - Content-Length: " . implode(', ', $headers['content-length']) . " bytes\n";
        }
    } else {
        echo "❌ Error generando PDF\n";
        $content = $response->getContent();
        echo "  - Error: " . substr($content, 0, 500) . "\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n✅ Prueba completada\n";
