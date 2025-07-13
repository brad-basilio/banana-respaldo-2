<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CanvasProject;

class InspectProject extends Command
{
    protected $signature = 'project:inspect {projectId}';
    protected $description = 'Inspeccionar la estructura de datos de un proyecto';

    public function handle()
    {
        $projectId = $this->argument('projectId');
        
        $project = CanvasProject::find($projectId);
        
        if (!$project) {
            $this->error("Proyecto no encontrado: {$projectId}");
            return;
        }
        
        $this->info("=== PROYECTO: {$project->name} ===");
        $this->newLine();
        
        $this->info("📊 PROJECT_DATA:");
        if ($project->project_data) {
            $this->line(json_encode($project->project_data, JSON_PRETTY_PRINT));
        } else {
            $this->warn("NULL");
        }
        
        $this->newLine();
        $this->info("🎨 DESIGN_DATA:");
        if ($project->design_data) {
            $this->line(json_encode($project->design_data, JSON_PRETTY_PRINT));
        } else {
            $this->warn("NULL");
        }
        
        $this->newLine();
        $this->info("⚙️ CONFIGURATION:");
        if ($project->configuration) {
            $this->line($project->configuration);
        } else {
            $this->warn("NULL");
        }
        
        $this->newLine();
        $this->info("📝 RESUMEN:");
        $hasProjectData = !empty($project->project_data);
        $hasDesignData = !empty($project->design_data);
        $hasConfiguration = !empty($project->configuration);
        
        $this->table(
            ['Campo', 'Estado', 'Tamaño'],
            [
                ['project_data', $hasProjectData ? '✅ Tiene datos' : '❌ Vacío', $hasProjectData ? strlen(json_encode($project->project_data)) . ' chars' : '0'],
                ['design_data', $hasDesignData ? '✅ Tiene datos' : '❌ Vacío', $hasDesignData ? strlen(json_encode($project->design_data)) . ' chars' : '0'],
                ['configuration', $hasConfiguration ? '✅ Tiene datos' : '❌ Vacío', $hasConfiguration ? strlen($project->configuration) . ' chars' : '0']
            ]
        );
        
        if ($hasProjectData && isset($project->project_data['pages'])) {
            $pages = $project->project_data['pages'];
            $this->newLine();
            $this->info("📄 PÁGINAS EN PROJECT_DATA: " . count($pages));
            
            foreach ($pages as $i => $page) {
                $cellCount = isset($page['cells']) ? count($page['cells']) : 0;
                $elementCount = 0;
                
                if (isset($page['cells'])) {
                    foreach ($page['cells'] as $cell) {
                        if (isset($cell['elements'])) {
                            $elementCount += count($cell['elements']);
                        }
                    }
                }
                
                $this->line("  Página " . ($i + 1) . ": {$cellCount} celdas, {$elementCount} elementos");
            }
        }
    }
}
