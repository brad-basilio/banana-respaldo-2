<?php
// Test para verificar que las dimensiones del preset se obtienen correctamente

require_once __DIR__ . '/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\CanvasProject;

$projectId = '9f61f9e9-004d-49c9-9092-e43132e7b8cf';

echo "🧪 TESTING PRESET DIMENSIONS\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    $project = CanvasProject::with('canvasPreset')->findOrFail($projectId);
    
    echo "📋 PROYECTO:\n";
    echo "- ID: {$project->id}\n";
    echo "- Nombre: {$project->name}\n";
    
    if ($project->canvasPreset) {
        $preset = $project->canvasPreset;
        echo "\n📐 CANVAS PRESET:\n";
        echo "- ID: {$preset->id}\n";
        echo "- Nombre: {$preset->name}\n";
        echo "- Ancho: {$preset->width} cm\n";
        echo "- Alto: {$preset->height} cm\n";
        echo "- DPI: " . ($preset->dpi ?? 'No definido') . "\n";
        echo "- Páginas: " . ($preset->pages ?? 'No definido') . "\n";
        echo "- Tipo: {$preset->type}\n";
        
        // Calcular dimensiones en pixels
        $widthPx = $preset->width * 11.8; // mm a pixels (300 DPI)
        $heightPx = $preset->height * 11.8;
        
        echo "\n📏 DIMENSIONES CALCULADAS:\n";
        echo "- Ancho en pixels: " . round($widthPx) . " px\n";
        echo "- Alto en pixels: " . round($heightPx) . " px\n";
        echo "- Proporción: " . round($preset->width / $preset->height, 2) . "\n";
        echo "- Orientación: " . ($preset->width > $preset->height ? 'Landscape' : 'Portrait') . "\n";
        
        // Mostrar conversión
        echo "\n🔄 CONVERSIÓN:\n";
        echo "- De: {$preset->width} x {$preset->height} mm\n";
        echo "- A: " . round($widthPx) . " x " . round($heightPx) . " px\n";
        echo "- Factor: 11.8 px/mm (300 DPI)\n";
        
        // Simular cálculo para un elemento de 50% x 30%
        $elementWidthPercent = 50;
        $elementHeightPercent = 30;
        
        $targetWidth = ($elementWidthPercent / 100) * $widthPx;
        $targetHeight = ($elementHeightPercent / 100) * $heightPx;
        
        echo "\n🖼️ EJEMPLO ELEMENTO (50% x 30%):\n";
        echo "- Target Width: " . round($targetWidth) . " px\n";
        echo "- Target Height: " . round($targetHeight) . " px\n";
        
        // Validar que está en rango seguro
        if ($targetWidth <= 2000 && $targetHeight <= 2000) {
            echo "✅ Dimensiones dentro del rango seguro\n";
        } else {
            echo "⚠️ Dimensiones requieren ajuste para evitar errores de memoria\n";
        }
        
    } else {
        echo "\n❌ NO HAY CANVAS PRESET ASOCIADO\n";
        
        // Revisar item_data
        if (!empty($project->item_data)) {
            echo "\n🔍 ITEM DATA:\n";
            echo json_encode($project->item_data, JSON_PRETTY_PRINT) . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . " línea: " . $e->getLine() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "🎉 Test completado!\n";
?>
