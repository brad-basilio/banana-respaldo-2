<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CanvasProject;
use Illuminate\Support\Facades\DB;

class VerifyPDFSetup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pdf:verify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar que el sistema de generación de PDF esté configurado correctamente';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verificando configuración del sistema de generación de PDF...');
        $this->newLine();
        
        $checks = [
            'Extensiones PHP' => $this->checkPHPExtensions(),
            'DomPDF' => $this->checkDomPDF(),
            'Estructura de base de datos' => $this->checkDatabase(),
            'Directorios y permisos' => $this->checkDirectories(),
            'Archivos del sistema' => $this->checkSystemFiles(),
            'Proyectos de prueba' => $this->checkTestProjects(),
        ];
        
        $allPassed = true;
        
        foreach ($checks as $checkName => $result) {
            if ($result['status']) {
                $this->info("✅ {$checkName}: {$result['message']}");
            } else {
                $this->error("❌ {$checkName}: {$result['message']}");
                $allPassed = false;
            }
        }
        
        $this->newLine();
        
        if ($allPassed) {
            $this->info('🎉 ¡Sistema de PDF configurado correctamente! Listo para generar PDFs de alta calidad.');
        } else {
            $this->error('⚠️ Se encontraron problemas en la configuración. Revisa los errores anteriores.');
        }
        
        $this->newLine();
        $this->info('💡 Para probar la generación de PDF, ejecuta: php artisan pdf:test');
    }
    
    private function checkPHPExtensions()
    {
        $required = ['gd', 'dom', 'mbstring', 'xml'];
        $missing = [];
        
        foreach ($required as $ext) {
            if (!extension_loaded($ext)) {
                $missing[] = $ext;
            }
        }
        
        if (empty($missing)) {
            return ['status' => true, 'message' => 'Todas las extensiones requeridas están habilitadas'];
        } else {
            return ['status' => false, 'message' => 'Faltan extensiones: ' . implode(', ', $missing)];
        }
    }
    
    private function checkDomPDF()
    {
        try {
            if (class_exists('Dompdf\Dompdf')) {
                return ['status' => true, 'message' => 'DomPDF está disponible'];
            } else {
                return ['status' => false, 'message' => 'DomPDF no está instalado'];
            }
        } catch (\Exception $e) {
            return ['status' => false, 'message' => 'Error verificando DomPDF: ' . $e->getMessage()];
        }
    }
    
    private function checkDatabase()
    {
        try {
            // Verificar tabla canvas_projects
            if (!DB::getSchemaBuilder()->hasTable('canvas_projects')) {
                return ['status' => false, 'message' => 'Tabla canvas_projects no existe'];
            }
            
            // Verificar columnas requeridas
            $requiredColumns = ['project_data', 'design_data', 'configuration', 'pdf_path', 'pdf_generated_at'];
            $missingColumns = [];
            
            foreach ($requiredColumns as $column) {
                if (!DB::getSchemaBuilder()->hasColumn('canvas_projects', $column)) {
                    $missingColumns[] = $column;
                }
            }
            
            if (!empty($missingColumns)) {
                return ['status' => false, 'message' => 'Faltan columnas: ' . implode(', ', $missingColumns)];
            }
            
            return ['status' => true, 'message' => 'Estructura de base de datos correcta'];
            
        } catch (\Exception $e) {
            return ['status' => false, 'message' => 'Error verificando BD: ' . $e->getMessage()];
        }
    }
    
    private function checkDirectories()
    {
        $directories = [
            storage_path('app') => 'Directorio de storage',
            public_path('storage') => 'Storage público',
            sys_get_temp_dir() => 'Directorio temporal del sistema'
        ];
        
        foreach ($directories as $dir => $name) {
            if (!is_dir($dir)) {
                return ['status' => false, 'message' => "{$name} no existe: {$dir}"];
            }
            
            if (!is_writable($dir)) {
                return ['status' => false, 'message' => "{$name} no es escribible: {$dir}"];
            }
        }
        
        return ['status' => true, 'message' => 'Todos los directorios son accesibles'];
    }
    
    private function checkSystemFiles()
    {
        $files = [
            app_path('Http/Controllers/Api/ProjectPDFController.php') => 'Controlador de PDF',
            app_path('Services/PDFImageService.php') => 'Servicio de imágenes',
            resource_path('views/pdf/project-enhanced.blade.php') => 'Template de PDF',
            app_path('Console/Commands/TestPDFGeneration.php') => 'Comando de prueba'
        ];
        
        foreach ($files as $file => $name) {
            if (!file_exists($file)) {
                return ['status' => false, 'message' => "{$name} no existe: {$file}"];
            }
        }
        
        return ['status' => true, 'message' => 'Todos los archivos del sistema están presentes'];
    }
    
    private function checkTestProjects()
    {
        try {
            $projectCount = CanvasProject::count();
            
            if ($projectCount === 0) {
                return ['status' => false, 'message' => 'No hay proyectos para probar (crea al menos uno en el editor)'];
            }
            
            $projectsWithData = CanvasProject::whereNotNull('project_data')
                ->orWhereNotNull('design_data')
                ->orWhereNotNull('configuration')
                ->count();
            
            if ($projectsWithData === 0) {
                return ['status' => false, 'message' => 'Los proyectos no tienen datos de diseño guardados'];
            }
            
            return ['status' => true, 'message' => "{$projectsWithData} de {$projectCount} proyectos tienen datos válidos"];
            
        } catch (\Exception $e) {
            return ['status' => false, 'message' => 'Error verificando proyectos: ' . $e->getMessage()];
        }
    }
}
