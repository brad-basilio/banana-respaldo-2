<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        $origin = $request->headers->get('Origin');
        $allowedOrigins = [
            'http://localhost:8000',
            'http://127.0.0.1:8000',
            'http://localhost:3000',
            env('APP_URL')
        ];
        
        // Determinar el origin permitido
        $allowOrigin = in_array($origin, $allowedOrigins) ? $origin : $allowedOrigins[0];
        
        // Configurar headers CORS
        $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Xsrf-Token, X-Requested-With, X-CSRF-TOKEN');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        
        return $response;
    }
}
