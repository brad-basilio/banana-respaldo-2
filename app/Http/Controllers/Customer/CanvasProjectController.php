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
}
