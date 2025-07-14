<?php

require_once 'vendor/autoload.php';

use App\Models\CanvasProject;
use App\Http\Controllers\Api\ProjectPDFController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

// Configurar Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->handle(
    Illuminate\Http\Request::capture()
);

try {
    echo "🔍 [DEBUG] Analizando elemento de imagen específico...\n";
    
    // Buscar el proyecto
    $project = CanvasProject::where('id', '9f424fe8-dc75-499c-992c-20ba49fdd6ce')->first();
    $designData = is_string($project->design_data) 
        ? json_decode($project->design_data, true) 
        : $project->design_data;
    
    // Encontrar la página con el elemento de imagen
    $imagePage = null;
    $imageElement = null;
    
    foreach ($designData['pages'] as $pageIndex => $page) {
        if (!isset($page['cells']) || !is_array($page['cells'])) continue;
        
        foreach ($page['cells'] as $cellIndex => $cell) {
            if (!isset($cell['elements']) || !is_array($cell['elements'])) continue;
            
            foreach ($cell['elements'] as $elementIndex => $element) {
                if ($element['type'] === 'image' && isset($element['id']) && $element['id'] === 'cover-image') {
                    $imagePage = $pageIndex;
                    $imageElement = $element;
                    echo "✅ [DEBUG] Elemento de imagen encontrado en página {$pageIndex}\n";
                    echo "📍 Posición: " . json_encode($element['position']) . "\n";
                    echo "📏 Tamaño: " . json_encode($element['size']) . "\n";
                    echo "🖼️ Contenido: " . substr($element['content'], 0, 100) . "...\n";
                    break 3;
                }
            }
        }
    }
    
    if (!$imageElement) {
        echo "❌ [DEBUG] No se encontró el elemento de imagen\n";
        exit;
    }
    
    // Probar la función processElement directamente
    echo "\n🧪 [DEBUG] Probando processElement...\n";
    
    // Crear controlador
    $controller = new class extends \App\Http\Controllers\Api\ProjectPDFController {
        public function __construct() {
            // Inicializar servicio de imágenes
            $this->imageService = new \App\Services\PDFImageService();
        }
        
        public function testProcessElement($element, $index, $workspaceDimensions) {
            return $this->processElement($element, $index, $workspaceDimensions);
        }
        
        public function testProcessImageContent($content) {
            return $this->processImageContent($content);
        }
    };
    
    // Definir dimensiones del workspace
    $workspaceDimensions = ['width' => 800, 'height' => 600];
    
    // Procesar elemento
    $processedElement = $controller->testProcessElement($imageElement, 0, $workspaceDimensions);
    
    if ($processedElement) {
        echo "✅ [DEBUG] Elemento procesado exitosamente\n";
        echo "📊 Resultado: " . json_encode($processedElement, JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "❌ [DEBUG] Error procesando elemento\n";
    }
    
    // Probar procesamiento de imagen específicamente
    echo "\n🖼️ [DEBUG] Probando processImageContent...\n";
    
    // Verificar si la imagen existe
    $imagePath = $imageElement['content'];
    echo "📂 Ruta de imagen: {$imagePath}\n";
    
    $fullPath = public_path($imagePath);
    echo "📂 Ruta completa: {$fullPath}\n";
    
    if (file_exists($fullPath)) {
        echo "✅ [DEBUG] Imagen existe en disco\n";
        echo "📏 Tamaño: " . filesize($fullPath) . " bytes\n";
    } else {
        echo "❌ [DEBUG] Imagen NO existe en disco\n";
    }
    
    $imageContent = $controller->testProcessImageContent($imageElement['content']);
    
    if ($imageContent) {
        echo "✅ [DEBUG] Imagen procesada: " . substr($imageContent, 0, 100) . "...\n";
        
        // Verificar si el archivo existe
        if (file_exists($imageContent)) {
            echo "✅ [DEBUG] Archivo de imagen procesada existe\n";
            echo "📂 Tamaño: " . filesize($imageContent) . " bytes\n";
        } else {
            echo "❌ [DEBUG] Archivo de imagen procesada no existe\n";
        }
    } else {
        echo "❌ [DEBUG] Error procesando imagen\n";
    }
    
} catch (Exception $e) {
    echo "❌ [DEBUG] Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
