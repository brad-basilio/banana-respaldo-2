<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Cargar la configuración de Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Verificar el proyecto específico que está causando problemas
    $projectId = '9f61f9e9-004d-49c9-9092-e43132e7b8cf';
    
    echo "🔍 ANÁLISIS DETALLADO DEL PROYECTO PROBLEMÁTICO\n";
    echo "=" . str_repeat("=", 50) . "\n\n";
    
    $project = DB::table('canvas_projects')->where('id', $projectId)->first();
    
    if (!$project) {
        echo "❌ Proyecto no encontrado\n";
        exit(1);
    }
    
    echo "📋 INFORMACIÓN DEL PROYECTO:\n";
    echo "- ID: {$project->id}\n";
    echo "- Nombre: " . ($project->name ?: 'Sin nombre') . "\n";
    echo "- Creado: {$project->created_at}\n";
    echo "- Actualizado: {$project->updated_at}\n\n";
    
    // Analizar design_data
    if ($project->design_data) {
        $designDataSize = strlen($project->design_data);
        echo "📊 ANÁLISIS DE design_data:\n";
        echo "- Tamaño total: " . number_format($designDataSize) . " bytes (" . round($designDataSize / 1024 / 1024, 2) . " MB)\n";
        
        try {
            $designData = json_decode($project->design_data, true);
            
            if ($designData && isset($designData['pages'])) {
                echo "- Páginas: " . count($designData['pages']) . "\n";
                
                $totalImages = 0;
                $base64Images = 0;
                $uploadedImages = 0;
                $largestImageSize = 0;
                $totalImageSize = 0;
                
                foreach ($designData['pages'] as $pageIndex => $page) {
                    echo "\n  📄 PÁGINA " . ($pageIndex + 1) . " ({$page['type']}):\n";
                    
                    if (isset($page['cells'])) {
                        foreach ($page['cells'] as $cellIndex => $cell) {
                            if (isset($cell['elements'])) {
                                foreach ($cell['elements'] as $elementIndex => $element) {
                                    if ($element['type'] === 'image') {
                                        $totalImages++;
                                        
                                        if (isset($element['content'])) {
                                            $contentSize = strlen($element['content']);
                                            $totalImageSize += $contentSize;
                                            
                                            if ($contentSize > $largestImageSize) {
                                                $largestImageSize = $contentSize;
                                            }
                                            
                                            if (strpos($element['content'], 'data:image/') === 0) {
                                                $base64Images++;
                                                echo "    🖼️  Imagen BASE64 #{$elementIndex}: " . round($contentSize / 1024, 2) . " KB\n";
                                                
                                                // Analizar tipo de imagen
                                                if (preg_match('/data:image\/([^;]+)/', $element['content'], $matches)) {
                                                    echo "       Tipo: {$matches[1]}\n";
                                                }
                                            } else {
                                                $uploadedImages++;
                                                echo "    🔗 Imagen SUBIDA #{$elementIndex}: {$element['content']}\n";
                                            }
                                        }
                                    } elseif ($element['type'] === 'text') {
                                        $textSize = strlen($element['content'] ?? '');
                                        echo "    📝 Texto #{$elementIndex}: " . round($textSize / 1024, 2) . " KB\n";
                                    }
                                }
                            }
                        }
                    }
                }
                
                echo "\n📈 RESUMEN DE CONTENIDO:\n";
                echo "- Total de imágenes: {$totalImages}\n";
                echo "- Imágenes BASE64: {$base64Images}\n";
                echo "- Imágenes subidas: {$uploadedImages}\n";
                echo "- Tamaño total de imágenes: " . round($totalImageSize / 1024 / 1024, 2) . " MB\n";
                echo "- Imagen más grande: " . round($largestImageSize / 1024, 2) . " KB\n";
                
                // Calcular porcentaje de imágenes base64 vs total
                $base64Percentage = ($totalImageSize / $designDataSize) * 100;
                echo "- Porcentaje del tamaño ocupado por imágenes: " . round($base64Percentage, 2) . "%\n";
                
                if ($base64Images > 0) {
                    echo "\n⚠️  PROBLEMAS DETECTADOS:\n";
                    echo "- Hay {$base64Images} imágenes que siguen siendo BASE64\n";
                    echo "- Estas imágenes ocupan " . round($totalImageSize / 1024 / 1024, 2) . " MB del total\n";
                    echo "- El auto-save NO debería procesar imágenes BASE64 grandes\n";
                    
                    if ($designDataSize > 1048576) { // > 1MB
                        echo "- ❌ El tamaño total EXCEDE el límite de MySQL (1MB)\n";
                    }
                }
                
            } else {
                echo "❌ No se pudieron decodificar los datos JSON\n";
            }
            
        } catch (Exception $e) {
            echo "❌ Error analizando design_data: " . $e->getMessage() . "\n";
        }
    } else {
        echo "ℹ️  No hay design_data\n";
    }
    
    // Verificar thumbnails
    if ($project->thumbnails) {
        $thumbnailsSize = strlen($project->thumbnails);
        echo "\n🖼️  THUMBNAILS:\n";
        echo "- Tamaño: " . number_format($thumbnailsSize) . " bytes (" . round($thumbnailsSize / 1024, 2) . " KB)\n";
    }
    
    // Verificar configuración de MySQL
    echo "\n🔧 CONFIGURACIÓN DE MYSQL:\n";
    $maxPacket = DB::select("SHOW VARIABLES LIKE 'max_allowed_packet'")[0]->Value;
    echo "- max_allowed_packet: " . number_format($maxPacket) . " bytes (" . round($maxPacket / 1024 / 1024, 2) . " MB)\n";
    
    if ($project->design_data) {
        $designDataSize = strlen($project->design_data);
        $percentage = ($designDataSize / $maxPacket) * 100;
        echo "- Uso actual: " . round($percentage, 2) . "% del límite\n";
        
        if ($percentage > 80) {
            echo "- ⚠️  PELIGRO: Muy cerca del límite\n";
        }
        
        if ($designDataSize > $maxPacket) {
            echo "- ❌ EXCEDE el límite de MySQL\n";
        }
    }
    
    // Recomendaciones
    echo "\n💡 RECOMENDACIONES:\n";
    if ($base64Images > 0) {
        echo "1. El auto-save NO debe guardar imágenes BASE64 grandes\n";
        echo "2. Implementar compresión o placeholders para auto-save\n";
        echo "3. Solo el guardado manual debe procesar imágenes\n";
    }
    
    if ($designDataSize > 1048576) {
        echo "4. Considerar aumentar max_allowed_packet en MySQL\n";
        echo "5. Implementar guardado por chunks\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
