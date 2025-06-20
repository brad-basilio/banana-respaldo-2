<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\UnifiedItemImport;
use App\Imports\ItemImport;
use App\Imports\ItemImportPaani;
use App\Imports\ItemImportSf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

/**
 * Controlador de ejemplo que muestra la migración del sistema de importación
 * Este controlador demuestra cómo usar el nuevo UnifiedItemImport
 * y mantener compatibilidad con los importadores anteriores
 */
class MigratedImportController extends Controller
{
    /**
     * Nuevo método de importación usando el importador unificado
     * Reemplaza a todos los métodos de importación anteriores
     */
    public function unifiedImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
            'type' => 'string|in:standard,paani,sf', // Opcional: tipo de formato
        ]);

        try {
            // Configurar el importador según el tipo de archivo
            $options = [
                'truncate' => $request->boolean('truncate', true),
            ];

            $import = new UnifiedItemImport($options);

            // Configurar mapeos específicos según el tipo
            switch ($request->input('type', 'standard')) {
                case 'paani':
                    $import->setFieldMappings([
                        'collection' => ['colleccion', 'collection'],
                        'marca' => ['marca', 'brand'],
                    ]);
                    break;
                    
                case 'sf':
                    // Los mapeos de SF ya están incluidos por defecto
                    break;
                    
                default:
                    // Usar mapeos estándar
                    break;
            }

            // Ejecutar importación
            Excel::import($import, $request->file('file'));

            $errors = $import->getErrors();
            
            return response()->json([
                'success' => empty($errors),
                'message' => empty($errors) 
                    ? 'Productos importados exitosamente' 
                    : 'Importación completada con algunos errores',
                'errors_count' => count($errors),
                'errors' => count($errors) <= 10 ? $errors : array_slice($errors, 0, 10),
                'total_errors' => count($errors),
            ], empty($errors) ? 200 : 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error durante la importación: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ================================================================
    // MÉTODOS ANTIGUOS - Mantenerlos para compatibilidad si es necesario
    // Se recomienda migrar al método unifiedImport()
    // ================================================================

    /**
     * @deprecated Usar unifiedImport() en su lugar
     */
    public function importItems(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            // Usar el importador unificado en lugar del antiguo
            $import = new UnifiedItemImport();
            Excel::import($import, $request->file('file'));

            $errors = $import->getErrors();
            
            return response()->json([
                'success' => empty($errors),
                'message' => empty($errors) 
                    ? 'Items imported successfully' 
                    : 'Import completed with errors',
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @deprecated Usar unifiedImport() con type='paani'
     */
    public function importPaani(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            // Migrar al importador unificado
            $import = new UnifiedItemImport();
            $import->setFieldMappings([
                'collection' => ['colleccion', 'collection'],
                'marca' => ['marca', 'brand'],
            ]);
            
            Excel::import($import, $request->file('file'));

            $errors = $import->getErrors();
            
            return response()->json([
                'success' => empty($errors),
                'message' => empty($errors) 
                    ? 'Paani items imported successfully' 
                    : 'Import completed with errors',
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paani import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @deprecated Usar unifiedImport() con type='sf'
     */
    public function importSf(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            // Migrar al importador unificado (SF mappings ya incluidos)
            $import = new UnifiedItemImport();
            Excel::import($import, $request->file('file'));

            $errors = $import->getErrors();
            
            return response()->json([
                'success' => empty($errors),
                'message' => empty($errors) 
                    ? 'SF items imported successfully' 
                    : 'Import completed with errors',
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'SF import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ================================================================
    // MÉTODOS DE UTILIDAD
    // ================================================================

    /**
     * Comparar rendimiento entre importadores (para testing)
     */
    public function compareImporters(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        $results = [];
        
        try {
            // Test con importador unificado
            $start = microtime(true);
            $unifiedImport = new UnifiedItemImport(['truncate' => false]);
            Excel::import($unifiedImport, $request->file('file'));
            $unifiedTime = microtime(true) - $start;
            
            $results['unified'] = [
                'time' => round($unifiedTime, 3),
                'errors' => count($unifiedImport->getErrors()),
                'status' => 'completed'
            ];

            /* 
            // Test con importador original (comentado para evitar conflictos)
            $start = microtime(true);
            $originalImport = new ItemImport();
            Excel::import($originalImport, $request->file('file'));
            $originalTime = microtime(true) - $start;
            
            $results['original'] = [
                'time' => round($originalTime, 3),
                'errors' => count($originalImport->getErrors()),
                'status' => 'completed'
            ];
            */

            return response()->json([
                'success' => true,
                'comparison' => $results,
                'recommendation' => 'Se recomienda usar el UnifiedItemImport para mejor rendimiento y flexibilidad'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en comparación: ' . $e->getMessage(),
                'partial_results' => $results,
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de compatibilidad de un archivo
     */
    public function analyzeFile(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120',
        ]);

        try {
            // Leer headers del archivo
            $data = Excel::toArray(new class implements \Maatwebsite\Excel\Concerns\ToArray {
                public function array(array $array)
                {
                    return [array_slice($array[0], 0, 1)]; // Solo headers
                }
            }, $request->file('file'));

            $headers = $data[0][0] ?? [];
            
            // Analizar compatibilidad con cada importador
            $compatibility = [
                'unified' => $this->analyzeUnifiedCompatibility($headers),
                'original' => $this->analyzeOriginalCompatibility($headers),
                'paani' => $this->analyzePaaniCompatibility($headers),
                'sf' => $this->analyzeSfCompatibility($headers),
            ];

            // Determinar el mejor importador
            $bestImporter = array_keys($compatibility, max($compatibility))[0];

            return response()->json([
                'success' => true,
                'headers' => $headers,
                'compatibility_scores' => $compatibility,
                'recommended_importer' => $bestImporter,
                'analysis' => [
                    'total_columns' => count($headers),
                    'recommendation' => $bestImporter === 'unified' 
                        ? 'El importador unificado es la mejor opción'
                        : "El importador {$bestImporter} tiene mejor compatibilidad, pero se recomienda migrar al unificado"
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al analizar archivo: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function analyzeUnifiedCompatibility(array $headers): float
    {
        $unifiedImport = new UnifiedItemImport(['truncate' => false]);
        $mappings = $unifiedImport->getFieldMappings();
        
        $recognized = 0;
        foreach ($headers as $header) {
            $headerLower = strtolower(trim($header));
            foreach ($mappings as $possibleNames) {
                if (in_array($headerLower, array_map('strtolower', $possibleNames))) {
                    $recognized++;
                    break;
                }
            }
        }
        
        return count($headers) > 0 ? ($recognized / count($headers)) * 100 : 0;
    }

    private function analyzeOriginalCompatibility(array $headers): float
    {
        $standardFields = ['sku', 'nombre_producto', 'categoria', 'subcategoria', 'marca', 'precio', 'descuento'];
        $recognized = 0;
        
        foreach ($headers as $header) {
            if (in_array(strtolower(trim($header)), $standardFields)) {
                $recognized++;
            }
        }
        
        return count($headers) > 0 ? ($recognized / count($headers)) * 100 : 0;
    }

    private function analyzePaaniCompatibility(array $headers): float
    {
        $paaniFields = ['sku', 'nombre_producto', 'categoria', 'colleccion', 'marca', 'precio'];
        $recognized = 0;
        
        foreach ($headers as $header) {
            if (in_array(strtolower(trim($header)), $paaniFields)) {
                $recognized++;
            }
        }
        
        return count($headers) > 0 ? ($recognized / count($headers)) * 100 : 0;
    }

    private function analyzeSfCompatibility(array $headers): float
    {
        $sfFields = ['sku', 'nombre_de_producto', 'categoria', 'collection', 'marca', 'precio'];
        $recognized = 0;
        
        foreach ($headers as $header) {
            if (in_array(strtolower(trim($header)), $sfFields)) {
                $recognized++;
            }
        }
        
        return count($headers) > 0 ? ($recognized / count($headers)) * 100 : 0;
    }
}
