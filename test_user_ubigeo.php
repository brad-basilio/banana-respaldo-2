<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== PROBANDO CON UBIGEO DEL USUARIO ===\n";

// Ubigeo del usuario según el log: 140104
$userUbigeo = '140104';
$cart_total = 189;

echo "Usuario ubigeo: $userUbigeo\n";
echo "Cart total: $cart_total\n\n";

// Verificar configuración
$freeShippingThreshold = \App\Models\General::where('correlative', 'shipping_free')->first();
$minFreeShipping = $freeShippingThreshold ? floatval($freeShippingThreshold->description) : 0;
echo "Threshold configurado: $minFreeShipping\n\n";

// Buscar el precio para este ubigeo
$deliveryPrice = \App\Models\DeliveryPrice::where('ubigeo', $userUbigeo)->first();

if ($deliveryPrice) {
    echo "✅ Precio encontrado para ubigeo $userUbigeo:\n";
    echo "- Price: " . $deliveryPrice->price . "\n";
    echo "- Express Price: " . $deliveryPrice->express_price . "\n";
    echo "- Is Free: " . ($deliveryPrice->is_free ? 'true' : 'false') . "\n";
    echo "- Is Agency: " . ($deliveryPrice->is_agency ? 'true' : 'false') . "\n";
    
    // Aplicar lógica
    $qualifiesForFreeShipping = $minFreeShipping > 0 && $cart_total >= $minFreeShipping;
    
    echo "\n=== APLICANDO LÓGICA ===\n";
    echo "- qualifiesForFreeShipping: " . ($qualifiesForFreeShipping ? 'true' : 'false') . "\n";
    echo "- cart_total >= minFreeShipping: " . ($cart_total >= $minFreeShipping ? 'true' : 'false') . " ($cart_total >= $minFreeShipping)\n";
    
    if ($deliveryPrice->is_free) {
        if ($qualifiesForFreeShipping) {
            echo "- Resultado: ✅ GRATIS (S/ 0.00)\n";
        } else {
            echo "- Resultado: 💰 COBRAR (S/ {$deliveryPrice->price})\n";
        }
    } else {
        echo "- Resultado: 💰 SIEMPRE COBRAR (S/ {$deliveryPrice->price})\n";
    }
} else {
    echo "❌ No se encontró precio para ubigeo $userUbigeo\n";
    
    // Buscar ubigeos similares
    echo "\n=== BUSCANDO UBIGEOS SIMILARES ===\n";
    $similar = \App\Models\DeliveryPrice::where('ubigeo', 'like', substr($userUbigeo, 0, 4) . '%')->get();
    foreach($similar as $dp) {
        echo "- Ubigeo: {$dp->ubigeo}, Price: {$dp->price}, Free: " . ($dp->is_free ? 'true' : 'false') . "\n";
    }
}
