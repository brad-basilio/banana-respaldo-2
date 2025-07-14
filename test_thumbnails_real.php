<?php

require __DIR__ . '/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\CanvasProject;
use App\Services\ThumbnailService;
use Illuminate\Support\Facades\Storage;

echo "🔍 Probando guardado de thumbnails en proyecto real...\n\n";

// Usar el proyecto de prueba
$projectId = '9f424fe8-dc75-499c-992c-20ba49fdd6ce';

try {
    $project = CanvasProject::find($projectId);
    
    if (!$project) {
        echo "❌ Proyecto no encontrado\n";
        exit(1);
    }
    
    echo "✅ Proyecto encontrado: {$project->name}\n";
    
    // Simular algunos thumbnails base64
    $testThumbnails = [
        'page-cover' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        'page-content-1' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        'page-final' => '/storage/images/existing-thumb.jpg' // URL existente
    ];
    
    echo "📸 Procesando thumbnails...\n";
    
    $processedThumbnails = ThumbnailService::processThumbnails($testThumbnails, $projectId);
    
    echo "📊 Thumbnails procesados:\n";
    foreach ($processedThumbnails as $pageId => $url) {
        echo "  - {$pageId}: {$url}\n";
        
        // Verificar que los archivos se crearon
        if (strpos($url, '/storage/images/thumbnails/') === 0) {
            $filePath = str_replace('/storage/', '', $url);
            if (Storage::exists($filePath)) {
                $fileSize = Storage::size($filePath);
                echo "    ✅ Archivo verificado: {$filePath} ({$fileSize} bytes)\n";
            } else {
                echo "    ❌ Archivo no encontrado: {$filePath}\n";
            }
        }
    }
    
    // Actualizar el proyecto con los nuevos thumbnails
    $project->thumbnails = $processedThumbnails;
    $project->save();
    
    echo "\n💾 Thumbnails guardados en base de datos\n";
    
    // Verificar estructura de directorios
    echo "\n📁 Verificando estructura de directorios:\n";
    $thumbnailDir = "images/thumbnails/{$projectId}";
    
    if (Storage::exists($thumbnailDir)) {
        $files = Storage::files($thumbnailDir);
        echo "  - Directorio: storage/app/{$thumbnailDir}\n";
        echo "  - Archivos encontrados: " . count($files) . "\n";
        
        foreach ($files as $file) {
            $size = Storage::size($file);
            echo "    - {$file} ({$size} bytes)\n";
        }
    } else {
        echo "  - ❌ Directorio no encontrado: {$thumbnailDir}\n";
    }
    
    // Mostrar comparación con estructura de imágenes del proyecto
    echo "\n📊 Comparación con estructura de imágenes:\n";
    echo "  - Imágenes del proyecto: storage/app/images/item/\n";
    echo "  - Thumbnails del proyecto: storage/app/images/thumbnails/{$projectId}/\n";
    echo "  - URL pública imágenes: /storage/images/item/\n";
    echo "  - URL pública thumbnails: /storage/images/thumbnails/{$projectId}/\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n✅ Prueba de thumbnails en proyecto real completada\n";
