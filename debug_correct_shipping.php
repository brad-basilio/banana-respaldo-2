<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== VERIFICACIÓN SHIPPING_FREE CORRECTO ===\n";

// Usar la lógica correcta del controlador
$freeShippingThreshold = \App\Models\General::where('correlative', 'shipping_free')->first();
$minFreeShipping = $freeShippingThreshold ? floatval($freeShippingThreshold->description) : 0;

echo "Registro encontrado:\n";
if ($freeShippingThreshold) {
    echo "✅ ID: " . $freeShippingThreshold->id . "\n";
    echo "✅ Correlative: " . $freeShippingThreshold->correlative . "\n";
    echo "✅ Description: '" . $freeShippingThreshold->description . "'\n";
    echo "✅ Min Free Shipping: " . $minFreeShipping . "\n";
} else {
    echo "❌ No se encontró registro con correlative 'shipping_free'\n";
    
    // Buscar registros similares
    echo "\n=== REGISTROS SIMILARES ===\n";
    $similar = \App\Models\General::where('correlative', 'like', '%shipping%')
                                 ->orWhere('correlative', 'like', '%envio%')
                                 ->orWhere('correlative', 'like', '%free%')
                                 ->get();
    
    foreach($similar as $s) {
        echo "- Correlative: '{$s->correlative}', Description: '{$s->description}'\n";
    }
}
