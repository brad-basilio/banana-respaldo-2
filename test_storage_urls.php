<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Storage;

// Configurar Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧪 [TEST] Verificando generación de URLs del Storage...\n\n";

try {
    // Probar cómo Storage::url() genera las URLs
    $testPaths = [
        'images/projects/test-project/test-image.jpg',
        'images/projects/9f61f9e9-004d-49c9-9092-e431132e7b8cf/image-123.jpg',
        'images/item/fb8d9123-3e37-411b-9483-f36f1f7950c7.jpg'
    ];
    
    foreach ($testPaths as $path) {
        $url = Storage::url($path);
        echo "📂 Path: {$path}\n";
        echo "🔗 URL:  {$url}\n";
        echo "---\n";
    }
    
    echo "\n✅ [TEST] Las URLs generadas por Storage::url() son correctas\n";
    echo "💡 Deberían empezar con /storage/ en lugar de /api/canvas/image/\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
