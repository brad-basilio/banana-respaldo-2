<?php

require __DIR__ . '/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Services\ThumbnailService;
use Illuminate\Support\Facades\Storage;

echo "🔍 Probando ThumbnailService...\n\n";

// Simular un thumbnail base64 (pequeño)
$testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

$projectId = 'test-project-123';
$pageId = 'test-page-1';

try {
    echo "📸 Procesando thumbnail de prueba...\n";
    
    $result = ThumbnailService::saveBase64Thumbnail($testBase64, $projectId, $pageId);
    
    if ($result) {
        echo "✅ Thumbnail guardado exitosamente: {$result}\n";
        
        // Verificar que el archivo se creó
        $filePath = str_replace('/storage/', '', $result);
        
        if (Storage::exists($filePath)) {
            echo "✅ Archivo verificado en storage: {$filePath}\n";
            
            // Obtener información del archivo
            $fileSize = Storage::size($filePath);
            echo "📊 Tamaño del archivo: {$fileSize} bytes\n";
            
            // Verificar que la URL es accesible
            echo "🌐 URL pública: {$result}\n";
            
            // Limpiar archivo de prueba
            Storage::delete($filePath);
            echo "🗑️ Archivo de prueba eliminado\n";
            
        } else {
            echo "❌ Archivo no encontrado en storage: {$filePath}\n";
        }
        
    } else {
        echo "❌ Error guardando thumbnail\n";
    }
    
    echo "\n🔄 Probando procesamiento de múltiples thumbnails...\n";
    
    $thumbnailsData = [
        'page-1' => $testBase64,
        'page-2' => $testBase64,
        'page-3' => '/storage/images/existing-thumb.jpg', // URL existente
    ];
    
    $processedThumbnails = ThumbnailService::processThumbnails($thumbnailsData, $projectId);
    
    echo "📊 Thumbnails procesados:\n";
    foreach ($processedThumbnails as $pageId => $url) {
        echo "  - {$pageId}: {$url}\n";
        
        // Limpiar archivos de prueba que se crearon
        if (strpos($url, '/storage/images/thumbnails/') === 0) {
            $filePath = str_replace('/storage/', '', $url);
            if (Storage::exists($filePath)) {
                Storage::delete($filePath);
                echo "    🗑️ Archivo de prueba eliminado: {$filePath}\n";
            }
        }
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n✅ Prueba de ThumbnailService completada\n";
