<?php
// Archivo para probar la generación de PDF
// Este script se debe ejecutar desde la línea de comandos

use App\Http\Controllers\Api\ProjectPDFController;
use App\Models\CanvasProject;
use Illuminate\Http\Request;

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Procesar el request
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Obtener el primer proyecto disponible
$project = CanvasProject::first();

if (!$project) {
    echo "No hay proyectos disponibles para probar\n";
    exit(1);
}

echo "Proyecto encontrado: " . $project->id . " - " . $project->name . "\n";

// Crear un nuevo controlador de PDF
$controller = new ProjectPDFController();

// Crear request con datos mínimos
$data = [
    'pages_count' => 10, // Asumimos 10 páginas para probar
    'quality' => 'high',
    'format' => 'A4',
];

$request = Request::create('/api/projects/' . $project->id . '/generate-pdf', 'POST', $data);

try {
    echo "Generando PDF...\n";
    $response = $controller->generatePDF($request, $project->id);
    $responseData = json_decode($response->getContent(), true);
    
    echo "Respuesta de la API: \n";
    print_r($responseData);
    
    if (isset($responseData['pdf_url'])) {
        echo "\nPDF generado exitosamente en: " . $responseData['pdf_url'] . "\n";
    }
} catch (Exception $e) {
    echo "Error al generar PDF: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
