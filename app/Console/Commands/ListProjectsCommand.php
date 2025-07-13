<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CanvasProject;

class ListProjectsCommand extends Command
{
    protected $signature = 'projects:list';
    protected $description = 'List all canvas projects';

    public function handle()
    {
        $projects = CanvasProject::select('id', 'name', 'created_at')->get();
        
        $this->info('Proyectos disponibles:');
        
        if ($projects->isEmpty()) {
            $this->warn('No hay proyectos en la base de datos');
            return;
        }
        
        foreach ($projects as $project) {
            $this->line("ID: {$project->id} - {$project->name} ({$project->created_at})");
        }
        
        $this->info("\nTotal: " . count($projects) . " proyectos");
    }
}
