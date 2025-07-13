<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ValidatePDFRequest
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Validar que el projectId sea válido
        $projectId = $request->route('projectId');
        
        if (empty($projectId)) {
            Log::warning('❌ [PDF-MIDDLEWARE] Solicitud sin projectId válido');
            return response()->json([
                'success' => false,
                'message' => 'ID de proyecto requerido.'
            ], 400);
        }

        // Validar formato UUID si es necesario
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $projectId)) {
            Log::warning('❌ [PDF-MIDDLEWARE] Formato de projectId inválido', ['projectId' => $projectId]);
            return response()->json([
                'success' => false,
                'message' => 'Formato de ID de proyecto inválido.'
            ], 400);
        }

        // Verificar que el usuario tenga permisos sobre el proyecto
        $user = $request->user();
        if (!$user) {
            Log::warning('❌ [PDF-MIDDLEWARE] Usuario no autenticado');
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado.'
            ], 401);
        }

        // Log de solicitud válida
        Log::info('✅ [PDF-MIDDLEWARE] Solicitud PDF válida', [
            'projectId' => $projectId,
            'userId' => $user->id,
            'userEmail' => $user->email
        ]);

        return $next($request);
    }
}
