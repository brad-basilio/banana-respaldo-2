<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== BUSCAR UBICACIÓN CON IS_FREE = TRUE ===\n";

// Buscar una ubicación con is_free = true para probar
$freeLocations = \App\Models\DeliveryPrice::where('is_free', true)->limit(5)->get();

echo "Ubicaciones con is_free = true encontradas:\n";
foreach($freeLocations as $loc) {
    echo "- Ubigeo: {$loc->ubigeo}, Price: {$loc->price}, Express: {$loc->express_price}\n";
}

if ($freeLocations->count() > 0) {
    $testLocation = $freeLocations->first();
    echo "\n=== PROBANDO CON {$testLocation->ubigeo} ===\n";
    
    $cart_totals = [150, 189, 200, 250]; // Diferentes montos para probar
    
    foreach($cart_totals as $cart_total) {
        echo "\n--- Cart Total: $cart_total ---\n";
        
        // Configuración
        $freeShippingThreshold = \App\Models\General::where('correlative', 'shipping_free')->first();
        $minFreeShipping = $freeShippingThreshold ? floatval($freeShippingThreshold->description) : 0;
        $qualifiesForFreeShipping = $minFreeShipping > 0 && $cart_total >= $minFreeShipping;
        
        echo "- Threshold: $minFreeShipping\n";
        echo "- Qualifies: " . ($qualifiesForFreeShipping ? 'SI' : 'NO') . "\n";
        
        if ($qualifiesForFreeShipping) {
            $final_price = 0;
            echo "- Resultado: ✅ GRATIS (S/ 0.00)\n";
        } else {
            $final_price = $testLocation->price;
            echo "- Resultado: 💰 COBRAR (S/ {$testLocation->price})\n";
        }
    }
}
