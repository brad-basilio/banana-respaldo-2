<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Cargar la configuración de Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Verificar max_allowed_packet
    $result = DB::select("SHOW VARIABLES LIKE 'max_allowed_packet'");
    $maxPacket = $result[0]->Value;
    
    echo "🔍 MySQL max_allowed_packet: " . number_format($maxPacket) . " bytes (" . round($maxPacket / 1024 / 1024, 2) . " MB)\n";
    
    // Verificar el tamaño de un proyecto problemático
    $projectId = '9f61f9e9-004d-49c9-9092-e43132e7b8cf';
    $project = DB::table('canvas_projects')->where('id', $projectId)->first();
    
    if ($project && $project->design_data) {
        $size = strlen($project->design_data);
        echo "📊 Tamaño actual del design_data: " . number_format($size) . " bytes (" . round($size / 1024 / 1024, 2) . " MB)\n";
        echo "⚠️  Porcentaje del límite: " . round(($size / $maxPacket) * 100, 2) . "%\n";
        
        if ($size > $maxPacket * 0.8) {
            echo "🚨 ADVERTENCIA: El tamaño está cerca del límite!\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
