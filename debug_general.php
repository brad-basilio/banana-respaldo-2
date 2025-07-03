<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== VERIFICACIÓN CONFIGURACIÓN GENERAL ===\n";

$general = \App\Models\General::first();

if ($general) {
    echo "✅ Configuración encontrada:\n";
    echo "- ID: " . $general->id . "\n";
    echo "- Shipping Free: '" . $general->shipping_free . "'\n";
    echo "- Tipo: " . gettype($general->shipping_free) . "\n";
    echo "- Es null: " . ($general->shipping_free === null ? 'SI' : 'NO') . "\n";
    echo "- Es empty: " . (empty($general->shipping_free) ? 'SI' : 'NO') . "\n";
    echo "- Valor numérico: " . (is_numeric($general->shipping_free) ? $general->shipping_free : 'NO ES NUMÉRICO') . "\n";
} else {
    echo "❌ No se encontró configuración general\n";
}

// Ver todas las columnas de la tabla
echo "\n=== ESTRUCTURA DE LA TABLA ===\n";
$columns = \Illuminate\Support\Facades\Schema::getColumnListing('generals');
echo "Columnas disponibles: " . implode(', ', $columns) . "\n";

// Ver todos los registros
echo "\n=== TODOS LOS REGISTROS ===\n";
$allGenerals = \App\Models\General::all();
foreach($allGenerals as $g) {
    echo "ID: {$g->id}, shipping_free: '{$g->shipping_free}'\n";
}
