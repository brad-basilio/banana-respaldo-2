<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

// Configurar Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧪 [TEST] Simulando proceso de subida y almacenamiento de imágenes...\n\n";

try {
    // Simular datos como los que envía el frontend
    $projectId = '9f61f9e9-004d-49c9-9092-e431132e7b8cf'; // Proyecto existente
    $testImages = [
        [
            'filename' => 'test-image-123.jpg',
            'data' => base64_encode(file_get_contents('public/favicon.ico')), // Usar favicon como imagen de prueba
            'type' => 'png',
            'elementId' => 'test-element-123'
        ]
    ];
    
    echo "📤 [UPLOAD] Simulando subida de " . count($testImages) . " imagen(es)...\n";
    
    $uploadedImages = [];
    
    foreach ($testImages as $imageData) {
        $filename = $imageData['filename'];
        $projectPath = "images/projects/{$projectId}";
        
        // Generar nombre único
        $timestamp = now()->format('YmdHis');
        $random = substr(md5(uniqid()), 0, 8);
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $uniqueFilename = pathinfo($filename, PATHINFO_FILENAME) . "_{$timestamp}_{$random}.{$extension}";
        $fullPath = "{$projectPath}/{$uniqueFilename}";
        
        // Decodificar y guardar
        $imageContent = base64_decode($imageData['data']);
        $saved = Storage::put($fullPath, $imageContent);
        
        if ($saved) {
            // Generar URL como lo hace el controlador corregido
            $publicUrl = Storage::url($fullPath);
            
            $uploadedImages[] = [
                'elementId' => $imageData['elementId'],
                'originalFilename' => $filename,
                'savedFilename' => $uniqueFilename,
                'path' => $fullPath,
                'url' => $publicUrl, // URL directa del storage
                'size' => strlen($imageContent),
                'type' => $imageData['type']
            ];
            
            echo "✅ [UPLOAD] Imagen guardada: {$imageData['elementId']} -> {$uniqueFilename}\n";
            echo "    📂 Path: {$fullPath}\n";
            echo "    🔗 URL:  {$publicUrl}\n";
        } else {
            echo "❌ [UPLOAD] Error guardando imagen: {$imageData['elementId']}\n";
        }
    }
    
    echo "\n📊 [RESULT] Resumen de la subida:\n";
    echo "- Imágenes procesadas: " . count($testImages) . "\n";
    echo "- Imágenes guardadas: " . count($uploadedImages) . "\n";
    
    if (count($uploadedImages) > 0) {
        echo "\n🔍 [CHECK] Verificando URLs generadas:\n";
        foreach ($uploadedImages as $img) {
            if (strpos($img['url'], '/storage/') === 0) {
                echo "✅ URL correcta: {$img['url']}\n";
            } else {
                echo "❌ URL incorrecta: {$img['url']}\n";
            }
        }
        
        // Simular lo que recibiría el frontend
        $response = [
            'success' => true,
            'uploadedImages' => $uploadedImages,
            'message' => 'Imágenes subidas exitosamente'
        ];
        
        echo "\n📦 [RESPONSE] JSON que recibiría el frontend:\n";
        echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
    }
    
    // Limpiar archivo de prueba
    if (count($uploadedImages) > 0) {
        foreach ($uploadedImages as $img) {
            Storage::delete($img['path']);
            echo "🗑️  [CLEANUP] Archivo de prueba eliminado: {$img['path']}\n";
        }
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n✅ [TEST] Simulación completada\n";
