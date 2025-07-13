<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CanvasProject;
use App\Http\Controllers\Api\ProjectPDFController;
use Illuminate\Http\Request;

class TestPDFGeneration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pdf:test {projectId? : ID del proyecto a testear}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Probar la generación de PDF para un proyecto específico';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $projectId = $this->argument('projectId');
        
        if (!$projectId) {
            // Mostrar proyectos disponibles
            $projects = CanvasProject::select('id', 'name', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
                
            if ($projects->isEmpty()) {
                $this->error('❌ No hay proyectos disponibles para testear.');
                return;
            }
            
            $this->info('📋 Proyectos disponibles:');
            $this->table(
                ['ID', 'Nombre', 'Fecha'],
                $projects->map(function ($project) {
                    return [
                        $project->id,
                        $project->name ?? 'Sin título',
                        $project->created_at->format('Y-m-d H:i:s')
                    ];
                })
            );
            
            $projectId = $this->ask('Ingresa el ID del proyecto que quieres testear:');
        }
        
        if (!$projectId) {
            $this->error('❌ ID de proyecto requerido.');
            return;
        }
        
        $this->info("🖨️ Iniciando prueba de generación de PDF para proyecto: {$projectId}");
        
        try {
            // Verificar que el proyecto existe
            $project = CanvasProject::find($projectId);
            if (!$project) {
                $this->error("❌ Proyecto no encontrado: {$projectId}");
                return;
            }
            
            $this->info("✅ Proyecto encontrado: " . ($project->name ?? 'Sin título'));
            
            // Crear instancia del controlador
            $controller = new ProjectPDFController();
            
            // Crear request mock
            $request = new Request();
            
            $this->info("🔄 Generando PDF...");
            
            // Llamar al método de generación
            $response = $controller->generatePDF($request, $projectId);
            
            // Verificar respuesta
            if ($response->getStatusCode() === 200) {
                $contentType = $response->headers->get('content-type');
                $contentLength = $response->headers->get('content-length') ?? strlen($response->getContent());
                
                $this->info("✅ PDF generado exitosamente");
                $this->info("📄 Tipo de contenido: {$contentType}");
                $this->info("📊 Tamaño: " . $this->formatBytes($contentLength));
                
                // Opcionalmente guardar el PDF para inspección
                if ($this->confirm('¿Guardar el PDF para inspección?')) {
                    $fileName = storage_path("app/test-pdf-{$projectId}.pdf");
                    file_put_contents($fileName, $response->getContent());
                    $this->info("💾 PDF guardado en: {$fileName}");
                }
                
            } else {
                $this->error("❌ Error generando PDF. Status: " . $response->getStatusCode());
                
                // Mostrar contenido de error si es JSON
                $content = $response->getContent();
                $errorData = json_decode($content, true);
                
                if ($errorData && isset($errorData['message'])) {
                    $this->error("Mensaje de error: " . $errorData['message']);
                } else {
                    $this->error("Contenido de respuesta: " . substr($content, 0, 200));
                }
            }
            
        } catch (\Exception $e) {
            $this->error("❌ Excepción durante la generación: " . $e->getMessage());
            $this->error("Stack trace: " . $e->getTraceAsString());
        }
    }
    
    /**
     * Formatear bytes a formato legible
     */
    private function formatBytes($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
