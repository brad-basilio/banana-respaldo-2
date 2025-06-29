<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use SoDe\Extend\Response;
use App\Models\CanvasProject;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Contracts\Routing\ResponseFactory;

class ProjectController extends Controller
{
    /**
     * Obtener todos los proyectos del usuario autenticado
     */
    public function index(): HttpResponse | ResponseFactory
    {
        $response = new Response();
        
        try {
            $user = Auth::user();
            
            if (!$user) {
                $response->status = 401;
                $response->message = 'Usuario no autenticado';
                return response($response->toArray(), $response->status);
            }

            // Obtener proyectos del usuario
            $projects = CanvasProject::where('user_id', $user->id)
                ->orderBy('updated_at', 'desc')
                ->get();

            $response->status = 200;
            $response->message = 'Proyectos obtenidos correctamente';
            $response->data = $projects;
            
        } catch (\Throwable $th) {
            $response->status = 500;
            $response->message = 'Error al obtener los proyectos: ' . $th->getMessage();
        }
        
        return response($response->toArray(), $response->status);
    }

    /**
     * Mostrar un proyecto específico
     */
    public function show($id): HttpResponse | ResponseFactory
    {
        $response = new Response();
        
        try {
            $user = Auth::user();
            
            if (!$user) {
                $response->status = 401;
                $response->message = 'Usuario no autenticado';
                return response($response->toArray(), $response->status);
            }

            $project = CanvasProject::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$project) {
                $response->status = 404;
                $response->message = 'Proyecto no encontrado';
                return response($response->toArray(), $response->status);
            }

            $response->status = 200;
            $response->message = 'Proyecto obtenido correctamente';
            $response->data = $project;
            
        } catch (\Throwable $th) {
            $response->status = 500;
            $response->message = 'Error al obtener el proyecto: ' . $th->getMessage();
        }
        
        return response($response->toArray(), $response->status);
    }

    /**
     * Crear un nuevo proyecto
     */
    public function store(Request $request): HttpResponse | ResponseFactory
    {
        $response = new Response();
        
        try {
            $user = Auth::user();
            
            if (!$user) {
                $response->status = 401;
                $response->message = 'Usuario no autenticado';
                return response($response->toArray(), $response->status);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'item_id' => 'nullable|string',
                'canvas_preset_id' => 'nullable|string',
                'project_data' => 'nullable|array',
                'thumbnail' => 'nullable|string',
                'status' => 'nullable|string|in:draft,completed,exported,ordered'
            ]);

            $project = CanvasProject::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'item_id' => $validated['item_id'] ?? null,
                'canvas_preset_id' => $validated['canvas_preset_id'] ?? null,
                'project_data' => $validated['project_data'] ?? null,
                'thumbnail' => $validated['thumbnail'] ?? null,
                'status' => $validated['status'] ?? 'draft'
            ]);

            $response->status = 201;
            $response->message = 'Proyecto creado correctamente';
            $response->data = $project;
            
        } catch (\Throwable $th) {
            $response->status = 500;
            $response->message = 'Error al crear el proyecto: ' . $th->getMessage();
        }
        
        return response($response->toArray(), $response->status);
    }

    /**
     * Actualizar un proyecto
     */
    public function update(Request $request, $id): HttpResponse | ResponseFactory
    {
        $response = new Response();
        
        try {
            $user = Auth::user();
            
            if (!$user) {
                $response->status = 401;
                $response->message = 'Usuario no autenticado';
                return response($response->toArray(), $response->status);
            }

            $project = CanvasProject::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$project) {
                $response->status = 404;
                $response->message = 'Proyecto no encontrado';
                return response($response->toArray(), $response->status);
            }

            // Verificar si el proyecto puede ser editado
            if (!$project->isEditable()) {
                $response->status = 403;
                $response->message = 'No se puede editar un proyecto finalizado';
                return response($response->toArray(), $response->status);
            }

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'project_data' => 'nullable|array',
                'thumbnail' => 'nullable|string',
                'status' => 'nullable|string|in:draft,completed,exported,ordered'
            ]);

            $project->update($validated);

            $response->status = 200;
            $response->message = 'Proyecto actualizado correctamente';
            $response->data = $project->fresh();
            
        } catch (\Throwable $th) {
            $response->status = 500;
            $response->message = 'Error al actualizar el proyecto: ' . $th->getMessage();
        }
        
        return response($response->toArray(), $response->status);
    }

    /**
     * Eliminar un proyecto
     */
    public function destroy($id): HttpResponse | ResponseFactory
    {
        $response = new Response();
        
        try {
            $user = Auth::user();
            
            if (!$user) {
                $response->status = 401;
                $response->message = 'Usuario no autenticado';
                return response($response->toArray(), $response->status);
            }

            $project = CanvasProject::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$project) {
                $response->status = 404;
                $response->message = 'Proyecto no encontrado';
                return response($response->toArray(), $response->status);
            }

            // Verificar si el proyecto puede ser eliminado
            if (!$project->isEditable()) {
                $response->status = 403;
                $response->message = 'No se puede eliminar un proyecto finalizado';
                return response($response->toArray(), $response->status);
            }

            $project->delete();

            $response->status = 200;
            $response->message = 'Proyecto eliminado correctamente';
            
        } catch (\Throwable $th) {
            $response->status = 500;
            $response->message = 'Error al eliminar el proyecto: ' . $th->getMessage();
        }
        
        return response($response->toArray(), $response->status);
    }
}
