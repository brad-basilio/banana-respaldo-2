<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * Middleware para optimizar automáticamente datos grandes antes de operaciones MySQL
 * Previene errores de max_allowed_packet
 */
class OptimizeMySQLData
{
    const MAX_MYSQL_PACKET_SIZE = 1048576; // 1MB
    const SAFE_PACKET_RATIO = 0.8; // 80% del límite

    public function handle(Request $request, Closure $next)
    {
        // Solo aplicar a rutas de canvas auto-save
        if (!$this->shouldOptimize($request)) {
            return $next($request);
        }

        // Verificar y optimizar design_data si está presente
        if ($request->has('design_data')) {
            $designData = $request->input('design_data');
            $optimizedData = $this->optimizeDesignData($designData);
            
            // Verificar tamaño después de optimización
            $size = strlen(json_encode($optimizedData));
            $maxSize = self::MAX_MYSQL_PACKET_SIZE * self::SAFE_PACKET_RATIO;
            
            if ($size > $maxSize) {
                Log::warning('Datos demasiado grandes incluso después de optimización', [
                    'size' => $size,
                    'max_size' => $maxSize,
                    'url' => $request->url()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Los datos del proyecto son demasiado grandes. Por favor, reduce el número de imágenes o su tamaño.',
                    'error_type' => 'data_too_large',
                    'size_mb' => round($size / 1024 / 1024, 2),
                    'max_size_mb' => round($maxSize / 1024 / 1024, 2)
                ], 413); // 413 Payload Too Large
            }
            
            // Reemplazar los datos optimizados en la request
            $request->merge(['design_data' => $optimizedData]);
            
            Log::info('Datos optimizados automáticamente por middleware', [
                'original_size' => strlen(json_encode($designData)),
                'optimized_size' => $size,
                'savings_percent' => round((1 - $size / strlen(json_encode($designData))) * 100, 2)
            ]);
        }

        return $next($request);
    }

    /**
     * Determinar si la request necesita optimización
     */
    private function shouldOptimize(Request $request): bool
    {
        $optimizableRoutes = [
            'api/canvas/projects/*/save-progress',
            'api/canvas/auto-save'
        ];

        $currentPath = $request->path();
        
        foreach ($optimizableRoutes as $route) {
            if (fnmatch($route, $currentPath)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Optimizar design_data para reducir tamaño
     */
    private function optimizeDesignData($designData): array
    {
        if (!is_array($designData) || !isset($designData['pages'])) {
            return $designData;
        }

        $optimized = $designData;

        foreach ($optimized['pages'] as &$page) {
            if (!isset($page['cells'])) continue;

            foreach ($page['cells'] as &$cell) {
                if (!isset($cell['elements'])) continue;

                foreach ($cell['elements'] as &$element) {
                    // Optimizar imágenes base64 grandes
                    if ($this->isLargeBase64Image($element)) {
                        $element = $this->optimizeImageElement($element);
                    }
                    
                    // Simplificar filtros con valores por defecto
                    if (isset($element['filters'])) {
                        $element['filters'] = $this->simplifyFilters($element['filters']);
                    }
                    
                    // Remover campos temporales
                    unset($element['_temp'], $element['_cache'], $element['_preview']);
                }
            }
            
            // Remover caches de página
            unset($page['_cache'], $page['_preview'], $page['_thumbnail_cache']);
        }

        return $optimized;
    }

    /**
     * Verificar si es una imagen base64 grande
     */
    private function isLargeBase64Image($element): bool
    {
        return isset($element['type']) && 
               $element['type'] === 'image' &&
               isset($element['content']) &&
               is_string($element['content']) &&
               strpos($element['content'], 'data:image/') === 0 &&
               strlen($element['content']) > 500000; // 500KB
    }

    /**
     * Optimizar elemento de imagen
     */
    private function optimizeImageElement($element): array
    {
        $originalSize = strlen($element['content']);
        
        // Para auto-save, reemplazar con placeholder
        $element['content_backup'] = hash('sha256', $element['content']); // Hash para verificación
        $element['content_size'] = $originalSize;
        $element['content'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // 1x1 pixel
        $element['needs_reupload'] = true;
        
        return $element;
    }

    /**
     * Simplificar filtros removiendo valores por defecto
     */
    private function simplifyFilters($filters): array
    {
        $defaults = [
            'brightness' => 100,
            'contrast' => 100,
            'saturation' => 100,
            'tint' => 0,
            'hue' => 0,
            'blur' => 0,
            'scale' => 1,
            'rotate' => 0,
            'opacity' => 100,
            'blendMode' => 'normal'
        ];

        $simplified = [];
        foreach ($filters as $key => $value) {
            if (!isset($defaults[$key]) || $value !== $defaults[$key]) {
                $simplified[$key] = $value;
            }
        }

        return $simplified; // Siempre devolver array
    }
}
