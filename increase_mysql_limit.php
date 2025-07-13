<?php
use Illuminate\Support\Facades\DB;

// Verificar límite actual
$result = DB::select("SHOW VARIABLES LIKE 'max_allowed_packet'");
$currentBytes = $result[0]->Value;
$currentMB = round($currentBytes / 1024 / 1024, 2);

echo "Límite actual de max_allowed_packet: {$currentMB} MB\n";

// Aplicar nuevo límite
try {
    DB::statement('SET GLOBAL max_allowed_packet = 104857600');
    echo "✅ Límite aumentado a 100 MB exitosamente\n";
    
    // Verificar el cambio
    $newResult = DB::select("SHOW VARIABLES LIKE 'max_allowed_packet'");
    $newBytes = $newResult[0]->Value;
    $newMB = round($newBytes / 1024 / 1024, 2);
    
    echo "Nuevo límite: {$newMB} MB\n";
    
} catch (Exception $e) {
    echo "❌ Error al cambiar límite: " . $e->getMessage() . "\n";
}
