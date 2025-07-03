<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== UBICACIONES CON PROBLEMA DE CONFIGURACIÓN ===\n";

// Buscar ubicaciones con is_free=true y price=0
$problematicLocations = \App\Models\DeliveryPrice::where('is_free', true)
                                                ->where('price', 0)
                                                ->get();

echo "Ubicaciones con is_free=true y price=0.00 (problemáticas):\n";
echo "Total encontradas: " . $problematicLocations->count() . "\n\n";

foreach($problematicLocations->take(10) as $loc) {
    echo "- Ubigeo: {$loc->ubigeo}, Price: {$loc->price}, Express: {$loc->express_price}\n";
}

if ($problematicLocations->count() > 10) {
    echo "... y " . ($problematicLocations->count() - 10) . " más\n";
}

echo "\n=== UBICACIONES CON CONFIGURACIÓN CORRECTA ===\n";

// Buscar ubicaciones con is_free=true y price>0
$correctLocations = \App\Models\DeliveryPrice::where('is_free', true)
                                            ->where('price', '>', 0)
                                            ->get();

echo "Ubicaciones con is_free=true y price>0 (correctas):\n";
echo "Total encontradas: " . $correctLocations->count() . "\n\n";

foreach($correctLocations->take(5) as $loc) {
    echo "- Ubigeo: {$loc->ubigeo}, Price: {$loc->price}, Express: {$loc->express_price}\n";
}

echo "\n=== SOLUCIONES POSIBLES ===\n";
echo "1. Cambiar is_free=false para ubicaciones con price=0\n";
echo "2. Asignar un price>0 a ubicaciones con is_free=true\n";
echo "3. Modificar la lógica para manejar este caso especial\n";
