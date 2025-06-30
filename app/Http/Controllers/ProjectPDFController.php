<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\CanvasProject;
use App\Models\User;
use SoDe\Extend\Crypto;
use SoDe\Extend\Response;

class ProjectPDFController extends Controller
{
    /**
     * Generar y guardar PDF de un proyecto
     */
    public function generatePDF(Request $request, $projectId)
    {
        $response = new Response();

        try {
            // Validar datos recibidos
            $request->validate([
                'pdf_blob' => 'required|string',
                'item_data' => 'sometimes|array'
            ]);

            // Obtener datos del request
            $pdfBlob = $request->input('pdf_blob');
            $itemData = $request->input('item_data', []);

            Log::info('📄 Iniciando generación de PDF', [
                'project_id' => $projectId,
                'pdf_size' => strlen($pdfBlob),
                'item_data' => $itemData,
                'user_authenticated' => Auth::check(),
                'user_id' => Auth::id()
            ]);

            // Generar nombre único para el PDF
            $fileName = $this->generatePDFFileName($projectId, $itemData);
            $filePath = "pdfs/projects/{$fileName}";

            // Decodificar el base64 y guardar el archivo
            $pdfData = base64_decode($pdfBlob);

            if (!$pdfData) {
                throw new \Exception('Error al decodificar el PDF');
            }

            // Guardar el archivo en storage
            $stored = Storage::put($filePath, $pdfData);

            if (!$stored) {
                throw new \Exception('Error al guardar el PDF en el servidor');
            }

            Log::info('💾 PDF guardado exitosamente', [
                'project_id' => $projectId,
                'file_path' => $filePath,
                'file_size' => strlen($pdfData)
            ]);

            // Buscar o crear registro del proyecto y actualizar con PDF en una sola operación
            Log::info('🔧 Iniciando actualización de proyecto con PDF', [
                'project_id' => $projectId,
                'file_path' => $filePath,
                'item_data' => $itemData
            ]);

            $project = $this->findOrUpdateProjectWithPDF($projectId, $itemData, $filePath);

            if ($project) {
                Log::info('📄 Proyecto actualizado con PDF exitosamente', [
                    'project_id' => $projectId,
                    'database_id' => $project->id,
                    'pdf_path' => $project->pdf_path,
                    'pdf_generated_at' => $project->pdf_generated_at,
                    'status' => $project->status
                ]);
            } else {
                Log::error('❌ No se pudo actualizar el proyecto con PDF', [
                    'project_id' => $projectId,
                    'item_data' => $itemData
                ]);
            }

            $response->data = [
                'success' => true,
                'message' => 'PDF generado y guardado exitosamente',
                'project_id' => $projectId,
                'pdf_path' => $filePath,
                'file_name' => $fileName,
                'file_size' => strlen($pdfData)
            ];
        } catch (\Exception $e) {
            Log::error('❌ Error generando PDF', [
                'project_id' => $projectId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al generar PDF: ' . $e->getMessage()
            ], 500);
        }

        return response($response->toArray(), $response->status);
    }

    /**
     * Obtener PDF de un proyecto (solo para administradores)
     */
    public function getPDF(Request $request, $projectId)
    {
        try {
            Log::info('📄 Solicitud de descarga de PDF', [
                'project_id' => $projectId,
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email
            ]);

            // Buscar el proyecto por ID
            $project = CanvasProject::find($projectId);

            Log::info('📄 project', [
                'project' => $project,

            ]);
            if (!$project || !$project->pdf_path) {
                Log::warning('📄 PDF no encontrado', [
                    'project_id' => $projectId,
                    'project_exists' => !is_null($project),
                    'has_pdf_path' => $project ? !is_null($project->pdf_path) : false
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'PDF no encontrado para este proyecto'
                ], 404);
            }

            // Verificar que el archivo existe
            if (!Storage::exists($project->pdf_path)) {
                Log::error('📄 Archivo PDF no encontrado en storage', [
                    'project_id' => $projectId,
                    'pdf_path' => $project->pdf_path
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Archivo PDF no encontrado en el servidor'
                ], 404);
            }

            Log::info('📄 Descarga de PDF exitosa', [
                'project_id' => $projectId,
                'pdf_path' => $project->pdf_path
            ]);

            // Devolver el archivo PDF
            return Storage::download(
                $project->pdf_path,
                "proyecto_{$projectId}.pdf"
            );
        } catch (\Exception $e) {
            Log::error('❌ Error obteniendo PDF', [
                'project_id' => $projectId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el PDF'
            ], 500);
        }
    }

    /**
     * Listar proyectos con PDFs (solo para administradores)
     */
    public function listProjectsWithPDFs(Request $request)
    {
        try {
            Log::info('📄 Solicitud de lista de proyectos con PDFs', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email
            ]);

            // Obtener proyectos con PDFs
            $projects = CanvasProject::whereNotNull('pdf_path')
                ->with('user:id,name,email')
                ->orderBy('pdf_generated_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'projects' => $projects
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Error listando proyectos con PDFs', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la lista de proyectos'
            ], 500);
        }
    }

    /**
     * Generar nombre único para el archivo PDF
     */
    private function generatePDFFileName($projectId, $itemData = [])
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $itemTitle = isset($itemData['title']) ?
            preg_replace('/[^a-zA-Z0-9_-]/', '', $itemData['title']) :
            'album';

        return "{$projectId}_{$itemTitle}_{$timestamp}.pdf";
    }

    /**
     * Buscar o crear proyecto y actualizar con datos del PDF en una sola operación
     */
    private function findOrUpdateProjectWithPDF($projectId, $itemData = [], $pdfFilePath = null)
    {
        try {
            Log::info('🔍 Buscando proyecto para actualizar con PDF', [
                'project_id' => $projectId,
                'item_data' => $itemData,
                'pdf_path' => $pdfFilePath
            ]);

            // Buscar proyecto existente por ID
            $project = CanvasProject::find($projectId);

            Log::info('🔍 Resultado de búsqueda de proyecto', [
                'project_id' => $projectId,
                'project_found' => !is_null($project),
                'project_data' => $project ? [
                    'id' => $project->id,
                    'name' => $project->name,
                    'status' => $project->status,
                    'current_pdf_path' => $project->pdf_path
                ] : null
            ]);

            if ($project) {
                Log::info('✅ Proyecto encontrado, actualizando con información del PDF', [
                    'project_id' => $projectId,
                    'database_id' => $project->id,
                    'current_status' => $project->status
                ]);

                // Preparar datos de actualización incluyendo PDF
                $updateData = [
                    'status' => 'completed', // Estado final después de generar PDF
                    'updated_at' => now()
                ];

                // Agregar datos del PDF si se proporciona
                if ($pdfFilePath) {
                    $updateData['pdf_path'] = $pdfFilePath;
                    $updateData['pdf_generated_at'] = now();
                }

                // Solo actualizar campos si se proporcionan en itemData
                if (isset($itemData['title'])) {
                    $updateData['name'] = $itemData['title'];
                }
                if (isset($itemData['item_id'])) {
                    $updateData['item_id'] = $itemData['item_id'];
                }
                if (isset($itemData['preset_id'])) {
                    $updateData['canvas_preset_id'] = $itemData['preset_id'];
                }
                if (isset($itemData['user_id'])) {
                    $updateData['user_id'] = $itemData['user_id'];
                }

                $updateResult = $project->update($updateData);

                Log::info('🔄 Resultado de actualización de proyecto', [
                    'project_id' => $projectId,
                    'update_successful' => $updateResult,
                    'updated_fields' => array_keys($updateData),
                    'pdf_path_in_update' => $updateData['pdf_path'] ?? 'no_pdf_provided'
                ]);

                // Verificar que la actualización se haya aplicado correctamente
                $project->refresh();
                Log::info('🔄 Estado del proyecto después de actualización', [
                    'project_id' => $projectId,
                    'final_pdf_path' => $project->pdf_path,
                    'final_status' => $project->status,
                    'final_pdf_generated_at' => $project->pdf_generated_at
                ]);
            } else {
                Log::warning('⚠️ Proyecto no encontrado, creando nuevo registro con PDF', [
                    'project_id' => $projectId
                ]);

                // Si no existe, crear uno nuevo con el ID proporcionado incluyendo PDF
                $user = Auth::user();
                $userId = $itemData['user_id'] ?? ($user ? $user->id : null);

                $createData = [
                    'id' => $projectId, // Usar el projectId como ID principal
                    'user_id' => $userId,
                    'name' => $itemData['title'] ?? 'Álbum Personalizado',
                    'item_id' => $itemData['item_id'] ?? null,
                    'canvas_preset_id' => $itemData['preset_id'] ?? null,
                    'status' => 'completed', // Estado final después de generar PDF
                    'created_at' => now(),
                    'updated_at' => now()
                ];

                // Agregar datos del PDF si se proporciona
                if ($pdfFilePath) {
                    $createData['pdf_path'] = $pdfFilePath;
                    $createData['pdf_generated_at'] = now();
                }

                $project = CanvasProject::create($createData);

                Log::info('🆕 Nuevo proyecto creado con PDF', [
                    'project_id' => $projectId,
                    'database_id' => $project->id,
                    'pdf_path' => $createData['pdf_path'] ?? 'no_pdf_provided'
                ]);
            }

            return $project;
        } catch (\Exception $e) {
            Log::error('❌ Error buscando/actualizando proyecto con PDF', [
                'project_id' => $projectId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return null;
        }
    }

    /**
     * Buscar o actualizar proyecto existente en la base de datos
     */
    private function findOrCreateProject($projectId, $itemData = [])
    {
        try {
            Log::info('🔍 Buscando proyecto existente', [
                'project_id' => $projectId,
                'item_data' => $itemData
            ]);

            // Buscar proyecto existente por ID
            $project = CanvasProject::find($projectId);

            if ($project) {
                Log::info('✅ Proyecto encontrado, actualizando información', [
                    'project_id' => $projectId,
                    'database_id' => $project->id,
                    'current_status' => $project->status
                ]);

                // Actualizar información del proyecto si se proporciona
                $updateData = [
                    'status' => 'exported', // Usar valor válido del ENUM
                    'updated_at' => now()
                ];

                // Solo actualizar campos si se proporcionan en itemData
                if (isset($itemData['title'])) {
                    $updateData['name'] = $itemData['title'];
                }
                if (isset($itemData['item_id'])) {
                    $updateData['item_id'] = $itemData['item_id'];
                }
                if (isset($itemData['preset_id'])) {
                    $updateData['canvas_preset_id'] = $itemData['preset_id'];
                }
                if (isset($itemData['user_id'])) {
                    $updateData['user_id'] = $itemData['user_id'];
                }

                $project->update($updateData);

                Log::info('🔄 Proyecto actualizado', [
                    'project_id' => $projectId,
                    'updated_fields' => array_keys($updateData)
                ]);
            } else {
                Log::warning('⚠️ Proyecto no encontrado, creando nuevo registro', [
                    'project_id' => $projectId
                ]);

                // Si no existe, crear uno nuevo con el ID proporcionado
                $user = Auth::user();
                $userId = $itemData['user_id'] ?? ($user ? $user->id : null);

                $project = CanvasProject::create([
                    'id' => $projectId, // Usar el projectId como ID principal
                    'user_id' => $userId,
                    'name' => $itemData['title'] ?? 'Álbum Personalizado',
                    'item_id' => $itemData['item_id'] ?? null,
                    'canvas_preset_id' => $itemData['preset_id'] ?? null,
                    'status' => 'draft', // Usar valor válido del ENUM
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                Log::info('🆕 Nuevo proyecto creado', [
                    'project_id' => $projectId,
                    'database_id' => $project->id
                ]);
            }

            return $project;
        } catch (\Exception $e) {
            Log::error('❌ Error buscando/actualizando proyecto', [
                'project_id' => $projectId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return null;
        }
    }

    /**
     * Obtener información del proyecto sin descargar el PDF
     */
    public function getProjectInfo(Request $request, $projectId)
    {
        try {
            Log::info('📄 Solicitud de información del proyecto', [
                'project_id' => $projectId,
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email
            ]);

            // Buscar el proyecto por ID
            $project = CanvasProject::find($projectId);

            if (!$project) {
                Log::warning('📄 Proyecto no encontrado', [
                    'project_id' => $projectId
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            // Verificar si el archivo PDF existe
            $pdfExists = false;
            if ($project->pdf_path) {
                $pdfExists = Storage::exists($project->pdf_path);
            }

            Log::info('📄 Información del proyecto obtenida', [
                'project_id' => $projectId,
                'has_pdf' => !is_null($project->pdf_path),
                'pdf_exists' => $pdfExists
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $project->id,
                    'pdf_path' => $project->pdf_path,
                    'pdf_generated_at' => $project->pdf_generated_at,
                    //'item_data' => $project->item_data,
                    'has_pdf' => !is_null($project->pdf_path),
                    'pdf_exists' => $pdfExists,
                    'name' => $project->name,
                    'status' => $project->status
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error obteniendo información del proyecto {$projectId}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor'
            ], 500);
        }
    }
}
