<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CanvasProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CanvasProjectController extends Controller
{
    /**
     * Crear un nuevo proyecto de canvas para el usuario autenticado
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function create(Request $request)
    {
        try {
            // Verificar que el usuario esté autenticado
            if (!Auth::check()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Validar los datos de entrada
            $request->validate([
                'item_id' => 'required|string',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'item_name' => 'nullable|string',
                'item_image' => 'nullable|string',
                'item_price' => 'nullable|numeric',
                'canvas_preset_id' => 'nullable|string',
            ]);

            $user = Auth::user();

            // Crear el proyecto de canvas usando Eloquent
            $project = CanvasProject::create([
                'user_id' => $user->id,
                'item_id' => $request->item_id,
                'canvas_preset_id' => $request->canvas_preset_id,
                'name' => $request->name,
                'item_data' => [
                    'item_name' => $request->item_name,
                    'item_image' => $request->item_image,
                    'item_price' => $request->item_price,
                    'description' => $request->description,
                ],
                'project_data' => [
                    'pages' => [],
                    'elements' => [],
                    'configurations' => []
                ],
                'status' => 'draft',
                'thumbnail' => null,
            ]);

            // Debug log
            Log::info('Canvas project created', [
                'project_id' => $project->id,
                'project_data' => $project->toArray()
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Proyecto de canvas creado exitosamente',
                'data' => $project
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error al crear el proyecto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener proyectos del usuario con paginación
     */
    public function paginate(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $user = Auth::user();
            $perPage = $request->input('take', 15);
            $page = $request->input('skip', 0) / $perPage + 1;

            $query = CanvasProject::where('user_id', $user->id)
                ->orderBy('updated_at', 'desc');

            // Filtros opcionales
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            if ($request->has('search') && $request->search) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $projects = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'status' => true,
                'data' => $projects->items(),
                'totalCount' => $projects->total()
            ]);

        } catch (\Exception $e) {
            Log::error('Error en paginación de proyectos: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error al obtener los proyectos'
            ], 500);
        }
    }

    /**
     * Obtener un proyecto específico
     */
    public function get($id)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $user = Auth::user();
            $project = CanvasProject::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$project) {
                return response()->json([
                    'status' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $project
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener proyecto: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error al obtener el proyecto'
            ], 500);
        }
    }

    /**
     * Actualizar un proyecto (solo metadatos como nombre)
     */
    public function save(Request $request)
    {
        try {
            Log::info('CanvasProjectController.save called', [
                'request_data' => $request->all(),
                'user_id' => Auth::id()
            ]);

            if (!Auth::check()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $request->validate([
                'id' => 'required|string',
                'name' => 'required|string|max:255',
            ]);

            $user = Auth::user();
            $project = CanvasProject::where('id', $request->id)
                ->where('user_id', $user->id)
                ->first();

            if (!$project) {
                return response()->json([
                    'status' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            // Solo permitir editar si está en borrador
            if (!$project->isEditable()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Este proyecto no se puede editar porque está finalizado'
                ], 403);
            }

            $project->update([
                'name' => $request->name
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Proyecto actualizado correctamente',
                'data' => $project
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Datos inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al actualizar proyecto: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error al actualizar el proyecto'
            ], 500);
        }
    }

    /**
     * Eliminar un proyecto completamente
     */
    public function delete($id)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $user = Auth::user();
            $project = CanvasProject::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$project) {
                return response()->json([
                    'status' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            // Solo permitir eliminar si está en borrador
            if (!$project->isEditable()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Este proyecto no se puede eliminar porque está finalizado'
                ], 403);
            }

            // Eliminar físicamente el proyecto
            $project->delete();

            Log::info('Proyecto eliminado', [
                'project_id' => $id,
                'user_id' => $user->id
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Proyecto eliminado correctamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al eliminar proyecto: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error al eliminar el proyecto'
            ], 500);
        }
    }
}
