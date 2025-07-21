<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\Setting;
use App\Models\System;
use App\Models\SystemColor;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use SoDe\Extend\Crypto;
use SoDe\Extend\File;
use SoDe\Extend\JSON;
use SoDe\Extend\Response;
use Throwable;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File as FacadesFile;
use ReflectionClass;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class SystemController extends BasicController
{
    public $model = System::class;
    public $reactView = 'Admin/System';
    public $softDeletion = false;


    private function getRelations(Model $modelo)
    {
        $relaciones = [];
        $reflexion = new ReflectionClass($modelo);

        foreach ($reflexion->getMethods() as $metodo) {
            if ($metodo->class === $reflexion->getName() && $metodo->isPublic() && !$metodo->isStatic()) {
                try {
                    $resultado = $modelo->{$metodo->name}();
                    if ($resultado instanceof Relation) {
                        $relaciones[] = $metodo->name;
                    }
                } catch (Throwable $e) {
                    continue;
                }
            }
        }

        return $relaciones;
    }

    public function setReactViewProperties(Request $request)
    {
        $systems = System::all();
        $pages = JSON::parse(File::get(storage_path('app/pages.json')));
        $components = JSON::parse(File::get(storage_path('app/components.json')));

        $files = File::scan(base_path() . '/app/Models', ['type' => 'file']);
        $models = [];
        foreach ($files as $file) {
            $fileName = str_replace('.php', '', $file);
            $modelName = str_replace('/', '\\', $fileName);
            $className = 'App\\Models\\' . $modelName;

            if (!is_subclass_of($className, Model::class)) continue;

            $modelInstance = new $className();
            $fields = $modelInstance->getFillable();

            $relations = $this->getRelations($modelInstance);

            $models[] = [
                'name' => $modelName,
                'fields' => $fields,
                'relations' => $relations
            ];
        }

        $colors = SystemColor::all();

        $settings = Setting::all();

        return [
            'systems' => $systems,
            'pages' => $pages,
            'components' => $components,
            'models' => $models,
            'colors' => $colors,
            'settings' => $settings
        ];
    }

    public function afterSave(Request $request, object $jpa, ?bool $isNew)
    {
        return $jpa;
    }

    public function updateOrder(Request $request)
    {
        $response = Response::simpleTryCatch(function () use ($request) {
            $udpates = $request->all();
            foreach ($udpates as $id => $after_component) {
                $system = System::find($id);
                $system->after_component = $after_component;
                $system->save();
            }
        });
        return response($response->toArray(), $response->status);
    }

    public function savePage(Request $request)
    {
        $response = Response::simpleTryCatch(function () use ($request) {
            $pages = JSON::parse(File::get(storage_path('app/pages.json')));

            $pageData = $request->all();
            $pageId = $pageData['id'] ?? null;

            $isUpdated = false;

            $newPages = array_map(function ($p) use ($pageData, $pageId, &$isUpdated) {
                if ($p['id'] === $pageId) {
                    $isUpdated = true;
                    return array_merge($p, $pageData);
                }
                return $p;
            }, $pages);

            if (!$isUpdated) {
                $newPages[] = [
                    'id' => Crypto::randomUUID(),
                    'name' => $pageData['name'] ?? 'Nueva página',
                    'path' => $pageData['path'] ?? '/page-' . Crypto::short(),
                    'extends_base' => true
                ];
            }

            File::save(storage_path('app/pages.json'), JSON::stringify($newPages, true));

            return $newPages;
        });

        return response($response->toArray(), 200);
    }

    public function deletePage(Request $request)
    {
        $response = Response::simpleTryCatch(function () use ($request) {
            $pages = JSON::parse(File::get(storage_path('app/pages.json')));
            $pageId = $request->route('id');
            $newPages = array_filter($pages, function ($p) use ($pageId) {
                return $p['id'] !== $pageId;
            });
            File::save(storage_path('app/pages.json'), JSON::stringify(array_values($newPages), true));
            System::where('page_id', $pageId)->delete();
            return true;
        });

        return response($response->toArray(), $response->status);
    }

    public function exportBK(Request $request)
    {
        // Get and encode the images
        $iconPath = public_path('assets/resources/icon.png');
        $logoPath = public_path('assets/resources/logo.png');
        $logoFooterPath = public_path('assets/resources/logo-footer.png');

        $iconBase64 = FacadesFile::exists($iconPath) ? base64_encode(FacadesFile::get($iconPath)) : '';
        $logoBase64 = FacadesFile::exists($logoPath) ? base64_encode(FacadesFile::get($logoPath)) : '';
        $logoFooterBase64 = FacadesFile::exists($logoFooterPath) ? base64_encode(FacadesFile::get($logoFooterPath)) : '';

        // INICIO: Dumping database
        $sqlContent = '';
        if (env('APP_ENV') === 'production') {
            $username = env('DB_USERNAME');
            $password = env('DB_PASSWORD');
            $database = env('DB_DATABASE');
            $dumpFileName = env('APP_CORRELATIVE') . '_backup.sql';
            $dumpPath = storage_path('app/' . $dumpFileName);

            $command = "mysqldump -u {$username} -p'{$password}' {$database} > {$dumpPath}";

            $process = Process::fromShellCommandline($command);
            try {
                $process->mustRun();
                $sqlContent = file_get_contents($dumpPath);
            } catch (ProcessFailedException $exception) {
                // dump($exception->getMessage());
            }
        }

        $backup = [
            'pages' => JSON::parse(File::get(storage_path('app/pages.json'))),
            'components' => System::all(),
            'colors' => SystemColor::all(),
            'icon' => $iconBase64,
            'logo' => $logoBase64,
            'logo_footer' => $logoFooterBase64,
            'sql' => $sqlContent
        ];

        return response()->json($backup);
    }

    public function importBK(Request $request)
    {
        $response = Response::simpleTryCatch(function () use ($request) {
            DB::transaction(function () use ($request) {
                $backupData = $request->file('backup')->get();
                $data = JSON::parse($backupData);

                // Restaurar las páginas
                if (isset($data['pages'])) {
                    FacadesFile::put(storage_path('app/pages.json'), JSON::stringify($data['pages'], true));
                }

                // Restaurar los componentes
                $this->model::whereNotNull('id')->delete();
                if (isset($data['components'])) {
                    foreach ($data['components'] as $component) {
                        $this->model::create($component);
                    }
                }

                // Restaurar los colores
                SystemColor::whereNotNull('id')->delete();
                if (isset($data['colors'])) {
                    foreach ($data['colors'] as $color) {
                        SystemColor::create($color);
                    }
                }

                // Restaurar las imágenes
                if (isset($data['icon'])) {
                    $iconPath = public_path('assets/resources/icon.png');
                    FacadesFile::put($iconPath, base64_decode($data['icon']));
                }

                if (isset($data['logo'])) {
                    $logoPath = public_path('assets/resources/logo.png');
                    FacadesFile::put($logoPath, base64_decode($data['logo']));
                }

                if (isset($data['logo_footer'])) {
                    $logoFooterPath = public_path('assets/resources/logo-footer.png');
                    FacadesFile::put($logoFooterPath, base64_decode($data['logo_footer']));
                }
            });
        });

        return response($response->toArray(), $response->status);
    }

    public function fetchRemoteChanges(Request $request)
    {
        $response = Response::simpleTryCatch(function () {
            $projectPath = base_path();

            // Verificar y configurar safe.directory si es necesario
            $safeDirectoryCheck = new Process(['git', 'config', '--global', '--add', 'safe.directory', $projectPath], $projectPath);
            $safeDirectoryCheck->run();

            $commands = [
                ['git', 'restore', '--source=HEAD', '--staged', '--worktree', '.'],
                ['git', 'pull'],
                ['php', 'artisan', 'migrate', '--force'],
                ['php', 'artisan', 'config:clear'],
                ['php', 'artisan', 'cache:clear'],
            ];

            foreach ($commands as $cmd) {
                $process = new Process($cmd, base_path());
                $process->run();

                if (!$process->isSuccessful()) {
                    if (strpos($process->getErrorOutput(), 'dubious ownership') !== false) {
                        throw new Exception('Error de permisos Git. Por favor, contacte al administrador del sistema.');
                    }
                    throw new Exception($process->getErrorOutput());
                }
            }
        });
        return response($response->toArray(), $response->status);
    }

    public function hasRemoteChanges(Request $request)
    {
        $response = Response::simpleTryCatch(function () {
            $projectPath = base_path();

            // Verificar y configurar safe.directory si es necesario
            $safeDirectoryCheck = new Process(['git', 'config', '--global', '--add', 'safe.directory', $projectPath], $projectPath);
            $safeDirectoryCheck->run();

            // 1. Fetch del remoto
            $fetch = new Process(['git', 'fetch'], $projectPath);
            $fetch->run();

            if (!$fetch->isSuccessful()) {
                if (strpos($fetch->getErrorOutput(), 'dubious ownership') !== false) {
                    throw new \Exception('Error de permisos Git. Por favor, contacte al administrador del sistema.');
                }
                throw new \Exception($fetch->getErrorOutput());
            }

            // 2. Verificar si HEAD está detrás del remoto
            $statusCheck = new Process(['git', 'rev-list', 'HEAD..origin/main', '--count'], $projectPath);
            $statusCheck->run();

            if (!$statusCheck->isSuccessful()) {
                throw new \Exception($statusCheck->getErrorOutput());
            }

            $aheadCount = (int) trim($statusCheck->getOutput());
            $hasChanges = $aheadCount > 0;

            // 3. Obtener último commit local
            $commitLog = new Process(['git', 'log', 'origin/main', '-1', "--pretty=format:%an\n%ci\n%s"], $projectPath);
            $commitLog->run();

            $lastCommit = $commitLog->isSuccessful()
                ? trim($commitLog->getOutput())
                : 'No se pudo obtener el último commit.';

            return [
                'commits' => $aheadCount,
                'has_changes' => $hasChanges,
                'last_commit' => $lastCommit,
            ];
        });

        return response($response->toArray(), $response->status);
    }

    public function getRelatedFilter(Request $request, string $model, string $method)
    {
        $response = Response::simpleTryCatch(function () use ($model, $method) {
            $class = 'App\\Models\\' . $model;
            $instance = new $class();
            $relation = $instance->$method();
            $relatedModel = $relation->getRelated();
            return $relatedModel->all();
        });
        return response($response->toArray(), $response->status);
    }

    /**
     * Obtener proyectos con PDFs generados para administración
     */
    public function getProjectsWithPDFs()
    {
        $response = Response::simpleTryCatch(function () {
            $pdfDirectory = storage_path('app/public/images/pdf');
            $projects = [];

            if (is_dir($pdfDirectory)) {
                $projectDirs = array_filter(scandir($pdfDirectory), function($item) use ($pdfDirectory) {
                    return is_dir($pdfDirectory . '/' . $item) && !in_array($item, ['.', '..']);
                });

                foreach ($projectDirs as $projectId) {
                    $pdfPath = $pdfDirectory . '/' . $projectId . '/album.pdf';
                    if (file_exists($pdfPath)) {
                        $fileInfo = stat($pdfPath);
                        $projects[] = [
                            'project_id' => $projectId,
                            'pdf_path' => '/storage/images/pdf/' . $projectId . '/album.pdf',
                            'file_size' => $fileInfo['size'],
                            'created_at' => date('Y-m-d H:i:s', $fileInfo['ctime']),
                            'modified_at' => date('Y-m-d H:i:s', $fileInfo['mtime'])
                        ];
                    }
                }

                // Ordenar por fecha de modificación (más recientes primero)
                usort($projects, function($a, $b) {
                    return strtotime($b['modified_at']) - strtotime($a['modified_at']);
                });
            }

            return [
                'projects' => $projects,
                'total' => count($projects)
            ];
        });

        return response($response->toArray(), $response->status);
    }
}
