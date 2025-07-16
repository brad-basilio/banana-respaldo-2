<?php
require_once 'vendor/autoload.php';

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

// Configurar el driver GD
$manager = new ImageManager(new Driver());

// Verificar que GD está instalado
if (!extension_loaded('gd')) {
    echo "ERROR: GD extension is not installed\n";
    exit(1);
}

echo "GD extension is installed\n";

// Crear una imagen de prueba
$image = $manager->create(200, 200)->fill('ff0000');
echo "Created test image successfully\n";

// Redimensionar a miniatura
$thumbnail = $image->resize(150, 150);
echo "Resized image successfully\n";

// Intentar guardar
try {
    $thumbnail->save('test_thumbnail.jpg');
    echo "Thumbnail saved successfully\n";
    
    // Verificar que se guardó
    if (file_exists('test_thumbnail.jpg')) {
        echo "Thumbnail file exists\n";
        unlink('test_thumbnail.jpg'); // Limpiar
        echo "Test file cleaned up\n";
    }
} catch (Exception $e) {
    echo "Error saving thumbnail: " . $e->getMessage() . "\n";
}

echo "Test completed\n";
?>
