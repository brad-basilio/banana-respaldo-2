<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OptimizeMySQLSettings extends Command
{
    protected $signature = 'mysql:optimize-settings 
                           {--check : Solo verificar configuración actual}
                           {--fix : Aplicar ajustes recomendados}';

    protected $description = 'Optimizar configuración de MySQL para proyectos Canvas grandes';

    public function handle()
    {
        $this->info('🔍 Verificando configuración de MySQL...');

        try {
            // Verificar configuración actual
            $settings = $this->getCurrentMySQLSettings();
            $this->displayCurrentSettings($settings);

            // Analizar proyectos existentes
            $analysis = $this->analyzeCanvasProjects();
            $this->displayProjectAnalysis($analysis);

            // Mostrar recomendaciones
            $recommendations = $this->generateRecommendations($settings, $analysis);
            $this->displayRecommendations($recommendations);

            if ($this->option('fix')) {
                $this->applyOptimizations($recommendations);
            } elseif ($this->option('check')) {
                $this->info('✅ Verificación completada. Use --fix para aplicar optimizaciones.');
            } else {
                if ($this->confirm('¿Desea aplicar las optimizaciones recomendadas?')) {
                    $this->applyOptimizations($recommendations);
                }
            }

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            Log::error('Error en comando mysql:optimize-settings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }

        return 0;
    }

    private function getCurrentMySQLSettings()
    {
        $variables = [
            'max_allowed_packet',
            'innodb_buffer_pool_size',
            'query_cache_size',
            'tmp_table_size',
            'max_heap_table_size'
        ];

        $settings = [];
        foreach ($variables as $variable) {
            try {
                $result = DB::select("SHOW VARIABLES LIKE '{$variable}'");
                if (!empty($result)) {
                    $settings[$variable] = $result[0]->Value;
                }
            } catch (\Exception $e) {
                $settings[$variable] = 'Error al obtener';
            }
        }

        return $settings;
    }

    private function displayCurrentSettings($settings)
    {
        $this->info('📊 Configuración actual de MySQL:');
        $this->table(
            ['Variable', 'Valor Actual', 'Tamaño MB'],
            collect($settings)->map(function ($value, $key) {
                $sizeMB = is_numeric($value) ? round($value / 1024 / 1024, 2) : 'N/A';
                return [$key, number_format($value), $sizeMB];
            })->values()->toArray()
        );
    }

    private function analyzeCanvasProjects()
    {
        $this->info('🔬 Analizando proyectos Canvas...');

        $projects = DB::table('canvas_projects')
            ->whereNotNull('design_data')
            ->select('id', 'name', 'design_data', 'created_at')
            ->get();

        $analysis = [
            'total_projects' => $projects->count(),
            'total_size' => 0,
            'average_size' => 0,
            'largest_project' => null,
            'projects_over_1mb' => 0,
            'size_distribution' => ['< 100KB' => 0, '100KB-500KB' => 0, '500KB-1MB' => 0, '> 1MB' => 0]
        ];

        foreach ($projects as $project) {
            $size = strlen($project->design_data);
            $analysis['total_size'] += $size;

            if (!$analysis['largest_project'] || $size > $analysis['largest_project']['size']) {
                $analysis['largest_project'] = [
                    'id' => $project->id,
                    'name' => $project->name,
                    'size' => $size,
                    'size_mb' => round($size / 1024 / 1024, 2)
                ];
            }

            if ($size > 1048576) { // > 1MB
                $analysis['projects_over_1mb']++;
                $analysis['size_distribution']['> 1MB']++;
            } elseif ($size > 512000) { // > 500KB
                $analysis['size_distribution']['500KB-1MB']++;
            } elseif ($size > 102400) { // > 100KB
                $analysis['size_distribution']['100KB-500KB']++;
            } else {
                $analysis['size_distribution']['< 100KB']++;
            }
        }

        if ($analysis['total_projects'] > 0) {
            $analysis['average_size'] = $analysis['total_size'] / $analysis['total_projects'];
        }

        return $analysis;
    }

    private function displayProjectAnalysis($analysis)
    {
        $this->info('📈 Análisis de proyectos Canvas:');
        
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Total de proyectos', number_format($analysis['total_projects'])],
                ['Tamaño total', round($analysis['total_size'] / 1024 / 1024, 2) . ' MB'],
                ['Tamaño promedio', round($analysis['average_size'] / 1024, 2) . ' KB'],
                ['Proyectos > 1MB', $analysis['projects_over_1mb']],
            ]
        );

        if ($analysis['largest_project']) {
            $this->warn("📦 Proyecto más grande: {$analysis['largest_project']['name']} ({$analysis['largest_project']['size_mb']} MB)");
        }

        $this->info('📊 Distribución por tamaño:');
        foreach ($analysis['size_distribution'] as $range => $count) {
            $this->line("  {$range}: {$count} proyectos");
        }
    }

    private function generateRecommendations($settings, $analysis)
    {
        $recommendations = [];
        $currentMaxPacket = (int) $settings['max_allowed_packet'];

        // Recomendar max_allowed_packet basado en el proyecto más grande
        if ($analysis['largest_project']) {
            $recommendedSize = max(
                $analysis['largest_project']['size'] * 2, // 2x el proyecto más grande
                16777216 // Mínimo 16MB
            );

            if ($currentMaxPacket < $recommendedSize) {
                $recommendations['max_allowed_packet'] = [
                    'current' => $currentMaxPacket,
                    'recommended' => $recommendedSize,
                    'reason' => 'Proyecto más grande requiere más espacio'
                ];
            }
        }

        // Verificar si hay proyectos que podrían causar problemas
        if ($analysis['projects_over_1mb'] > 0 && $currentMaxPacket < 4194304) { // < 4MB
            $recommendations['max_allowed_packet'] = [
                'current' => $currentMaxPacket,
                'recommended' => 8388608, // 8MB
                'reason' => "Hay {$analysis['projects_over_1mb']} proyectos > 1MB"
            ];
        }

        return $recommendations;
    }

    private function displayRecommendations($recommendations)
    {
        if (empty($recommendations)) {
            $this->info('✅ La configuración actual es adecuada para los proyectos existentes.');
            return;
        }

        $this->warn('⚠️  Recomendaciones de optimización:');
        
        foreach ($recommendations as $setting => $rec) {
            $currentMB = round($rec['current'] / 1024 / 1024, 2);
            $recommendedMB = round($rec['recommended'] / 1024 / 1024, 2);
            
            $this->line("📝 {$setting}:");
            $this->line("   Actual: {$currentMB} MB");
            $this->line("   Recomendado: {$recommendedMB} MB");
            $this->line("   Razón: {$rec['reason']}");
            $this->line('');
        }
    }

    private function applyOptimizations($recommendations)
    {
        if (empty($recommendations)) {
            $this->info('✅ No hay optimizaciones que aplicar.');
            return;
        }

        $this->info('🔧 Aplicando optimizaciones...');

        $configFile = base_path('.env');
        $mysqlConfigSuggestions = [];

        foreach ($recommendations as $setting => $rec) {
            if ($setting === 'max_allowed_packet') {
                $mysqlConfigSuggestions[] = "max_allowed_packet = {$rec['recommended']}";
            }
        }

        // Mostrar sugerencias para configuración de MySQL
        if (!empty($mysqlConfigSuggestions)) {
            $this->warn('📝 Agregue estas líneas a su configuración de MySQL (my.cnf o my.ini):');
            $this->line('[mysqld]');
            foreach ($mysqlConfigSuggestions as $suggestion) {
                $this->line($suggestion);
            }
            $this->line('');
            $this->warn('⚠️  Reinicie MySQL después de aplicar los cambios.');
            
            // Crear archivo de configuración recomendada
            $configContent = "[mysqld]\n" . implode("\n", $mysqlConfigSuggestions) . "\n";
            file_put_contents(storage_path('mysql_recommended_config.cnf'), $configContent);
            $this->info("💾 Configuración guardada en: " . storage_path('mysql_recommended_config.cnf'));
        }

        $this->info('✅ Recomendaciones generadas. Aplique los cambios manualmente a MySQL.');
    }
}
