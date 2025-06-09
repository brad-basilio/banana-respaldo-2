#!/usr/bin/env php
<?php

/**
 * Script de migración y testing del UnifiedItemImport
 * 
 * Este script permite:
 * 1. Probar el nuevo importador con archivos existentes
 * 2. Comparar resultados entre importadores
 * 3. Generar reportes de compatibilidad
 * 
 * Uso:
 * php migrate_importer.php --file=path/to/excel.xlsx --mode=test
 * php migrate_importer.php --help
 */

require_once __DIR__ . '/../vendor/autoload.php';

use App\Imports\UnifiedItemImport;
use Maatwebsite\Excel\Facades\Excel;

class ImporterMigrationTool
{
    private $options;
    private $verbose = false;

    public function __construct($options = [])
    {
        $this->options = $options;
        $this->verbose = isset($options['verbose']) || isset($options['v']);
    }

    public function run()
    {
        $mode = $this->options['mode'] ?? 'help';        switch ($mode) {
            case 'test':
                return $this->testUnifiedImporter();
            case 'analyze':
                return $this->analyzeFile();
            default:
                return $this->showHelp();
        }
    }

    private function testUnifiedImporter()
    {
        $file = $this->options['file'] ?? null;
        if (!$file || !file_exists($file)) {
            $this->error("Archivo no encontrado: {$file}");
            return 1;
        }

        $this->info("🧪 Probando UnifiedItemImport con: {$file}");

        try {
            // Configurar opciones
            $importOptions = [
                'truncate' => isset($this->options['no-truncate']) ? false : true,
            ];

            $import = new UnifiedItemImport($importOptions);
            
            // Configurar mapeos personalizados si se especifican
            if (isset($this->options['type'])) {
                $mappings = $this->getTypeMappings($this->options['type']);
                $import->setFieldMappings($mappings);
                $this->info("📋 Usando mapeos para tipo: {$this->options['type']}");
            }

            // Mostrar información de mapeos si es verbose
            if ($this->verbose) {
                $this->info("🗺️  Mapeos de campos disponibles:");
                foreach ($import->getFieldMappings() as $field => $aliases) {
                    $this->info("  - {$field}: " . implode(', ', $aliases));
                }
            }

            // Ejecutar importación
            $start = microtime(true);
            Excel::import($import, $file);
            $duration = microtime(true) - $start;

            // Mostrar resultados
            $errors = $import->getErrors();
            $this->success("✅ Importación completada en " . round($duration, 2) . " segundos");
            
            if (empty($errors)) {
                $this->success("🎉 Sin errores detectados");
            } else {
                $this->warning("⚠️  Se encontraron " . count($errors) . " errores:");
                foreach (array_slice($errors, 0, 5) as $error) {
                    $this->warning("   • {$error}");
                }
                if (count($errors) > 5) {
                    $this->warning("   ... y " . (count($errors) - 5) . " errores más");
                }
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Error durante la importación: " . $e->getMessage());
            if ($this->verbose) {
                $this->error("   Archivo: " . $e->getFile());
                $this->error("   Línea: " . $e->getLine());
            }
            return 1;
        }
    }

    private function analyzeFile()
    {
        $file = $this->options['file'] ?? null;
        if (!$file || !file_exists($file)) {
            $this->error("Archivo no encontrado: {$file}");
            return 1;
        }

        $this->info("🔍 Analizando estructura del archivo: {$file}");

        try {
            // Leer solo headers
            $data = Excel::toArray(new class implements \Maatwebsite\Excel\Concerns\ToArray {
                public function array(array $array)
                {
                    return [array_slice($array[0], 0, 3)]; // Headers + 2 filas de ejemplo
                }
            }, $file);

            if (empty($data) || empty($data[0])) {
                $this->error("❌ No se pudo leer el archivo o está vacío");
                return 1;
            }

            $headers = $data[0][0] ?? [];
            $sampleRow1 = $data[0][1] ?? [];
            $sampleRow2 = $data[0][2] ?? [];

            $this->info("📊 Estructura del archivo:");
            $this->info("   Columnas encontradas: " . count($headers));
            $this->info("   Headers: " . implode(', ', $headers));

            if ($this->verbose && !empty($sampleRow1)) {
                $this->info("   Ejemplo fila 1: " . implode(' | ', array_slice($sampleRow1, 0, 5)));
                if (!empty($sampleRow2)) {
                    $this->info("   Ejemplo fila 2: " . implode(' | ', array_slice($sampleRow2, 0, 5)));
                }
            }

            // Analizar compatibilidad
            $import = new UnifiedItemImport(['truncate' => false]);
            $mappings = $import->getFieldMappings();
            
            $recognized = [];
            $unrecognized = [];

            foreach ($headers as $header) {
                $headerLower = strtolower(trim($header));
                $found = false;
                
                foreach ($mappings as $systemField => $possibleNames) {
                    if (in_array($headerLower, array_map('strtolower', $possibleNames))) {
                        $recognized[$header] = $systemField;
                        $found = true;
                        break;
                    }
                }
                
                if (!$found) {
                    $unrecognized[] = $header;
                }
            }

            $compatibilityRate = count($headers) > 0 ? (count($recognized) / count($headers)) * 100 : 0;

            $this->info("🎯 Análisis de compatibilidad:");
            $this->info("   Tasa de reconocimiento: " . round($compatibilityRate, 1) . "%");
            
            if (!empty($recognized)) {
                $this->success("   ✅ Campos reconocidos (" . count($recognized) . "):");
                foreach ($recognized as $header => $systemField) {
                    $this->success("      {$header} → {$systemField}");
                }
            }

            if (!empty($unrecognized)) {
                $this->warning("   ⚠️  Campos no reconocidos (" . count($unrecognized) . "):");
                foreach ($unrecognized as $header) {
                    $this->warning("      {$header}");
                }
            }

            // Verificar campos esenciales
            $essentialFields = ['sku', 'nombre_producto', 'categoria'];
            $missingEssential = [];
            
            foreach ($essentialFields as $field) {
                if (!in_array($field, $recognized)) {
                    $missingEssential[] = $field;
                }
            }

            if (!empty($missingEssential)) {
                $this->error("   ❌ Campos esenciales faltantes: " . implode(', ', $missingEssential));
                $this->info("   💡 Considera agregar mapeos personalizados o renombrar columnas");
            } else {
                $this->success("   ✅ Todos los campos esenciales están presentes");
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Error al analizar archivo: " . $e->getMessage());
            return 1;
        }
    }

    private function getTypeMappings($type)
    {
        switch ($type) {
            case 'paani':
                return [
                    'collection' => ['colleccion', 'collection'],
                    'marca' => ['marca', 'brand'],
                ];
            case 'sf':
                return [
                    'nombre_producto' => ['nombre_de_producto', 'nombre_producto'],
                ];
            default:
                return [];
        }
    }

    private function showHelp()
    {
        echo <<<HELP

🚀 Herramienta de Migración del Importador de Productos

USO:
    php migrate_importer.php --mode=MODE --file=ARCHIVO [OPCIONES]

MODOS:
    test        Probar el UnifiedItemImport con un archivo
    analyze     Analizar compatibilidad de un archivo Excel
    help        Mostrar esta ayuda

OPCIONES:
    --file=PATH         Ruta al archivo Excel a procesar
    --type=TYPE         Tipo de archivo (standard, paani, sf)
    --no-truncate       No limpiar tablas antes de importar
    --verbose, -v       Mostrar información detallada

EJEMPLOS:
    # Probar importación con un archivo
    php migrate_importer.php --mode=test --file=productos.xlsx

    # Analizar compatibilidad
    php migrate_importer.php --mode=analyze --file=productos.xlsx --verbose

    # Probar con tipo específico
    php migrate_importer.php --mode=test --file=paani.xlsx --type=paani

    # Importar sin limpiar tablas
    php migrate_importer.php --mode=test --file=nuevos.xlsx --no-truncate

HELP;
        return 0;
    }

    private function info($message)
    {
        echo "[INFO] {$message}\n";
    }

    private function success($message)
    {
        echo "\033[32m[SUCCESS]\033[0m {$message}\n";
    }

    private function warning($message)
    {
        echo "\033[33m[WARNING]\033[0m {$message}\n";
    }

    private function error($message)
    {
        echo "\033[31m[ERROR]\033[0m {$message}\n";
    }
}

// Procesar argumentos de línea de comandos
function parseArgs($argv)
{
    $options = [];
    
    for ($i = 1; $i < count($argv); $i++) {
        $arg = $argv[$i];
        
        if (strpos($arg, '--') === 0) {
            $parts = explode('=', substr($arg, 2), 2);
            $key = $parts[0];
            $value = isset($parts[1]) ? $parts[1] : true;
            $options[$key] = $value;
        } elseif (strpos($arg, '-') === 0) {
            $options[substr($arg, 1)] = true;
        }
    }
    
    return $options;
}

// Verificar que no se ejecute desde navegador
if (php_sapi_name() !== 'cli') {
    die("Este script debe ejecutarse desde línea de comandos\n");
}

// Ejecutar herramienta
$options = parseArgs($argv);
$tool = new ImporterMigrationTool($options);
exit($tool->run());
