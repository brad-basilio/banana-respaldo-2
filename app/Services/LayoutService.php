<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class LayoutService
{
    /**
     * Definición de layouts sincronizada con el frontend
     * Esta es la misma estructura que layouts.js
     */
    private static $layouts = [
        'layout-1' => [
            'id' => 'layout-1',
            'name' => 'Básico - Una Celda',
            'cells' => 1,
            'template' => 'grid-cols-1 grid-rows-1',
            'style' => [
                'gap' => '0px',
                'padding' => '0px'
            ],
            'cellStyles' => [
                0 => 'rounded-lg overflow-hidden shadow-lg'
            ],
            'gridConfig' => [
                'columns' => 1,
                'rows' => 1
            ]
        ],
        'layout-2' => [
            'id' => 'layout-2',
            'name' => 'Básico - Dos Celdas',
            'cells' => 2,
            'template' => 'grid-cols-2 grid-rows-1',
            'style' => [
                'gap' => '16px',
                'padding' => '16px'
            ],
            'cellStyles' => [
                0 => 'rounded-lg overflow-hidden shadow-lg',
                1 => 'rounded-lg overflow-hidden shadow-lg'
            ],
            'gridConfig' => [
                'columns' => 2,
                'rows' => 1
            ]
        ],
        'layout-3' => [
            'id' => 'layout-3',
            'name' => 'Básico - Tres Celdas',
            'cells' => 3,
            'template' => 'grid-cols-3 grid-rows-1',
            'style' => [
                'gap' => '12px',
                'padding' => '16px'
            ],
            'cellStyles' => [
                0 => 'rounded-lg overflow-hidden shadow-lg',
                1 => 'rounded-lg overflow-hidden shadow-lg',
                2 => 'rounded-lg overflow-hidden shadow-lg'
            ],
            'gridConfig' => [
                'columns' => 3,
                'rows' => 1
            ]
        ],
        'layout-4' => [
            'id' => 'layout-4',
            'name' => 'Básico - Cuatro Celdas',
            'cells' => 4,
            'template' => 'grid-cols-2 grid-rows-2',
            'style' => [
                'gap' => '12px',
                'padding' => '16px'
            ],
            'cellStyles' => [
                0 => 'rounded-lg overflow-hidden shadow-lg',
                1 => 'rounded-lg overflow-hidden shadow-lg',
                2 => 'rounded-lg overflow-hidden shadow-lg',
                3 => 'rounded-lg overflow-hidden shadow-lg'
            ],
            'gridConfig' => [
                'columns' => 2,
                'rows' => 2
            ]
        ],
        'hero-fullpage' => [
            'id' => 'hero-fullpage',
            'name' => 'Hero - Página Completa',
            'cells' => 1,
            'template' => 'grid-cols-1 grid-rows-1',
            'style' => [
                'gap' => '0px',
                'padding' => '0px'
            ],
            'cellStyles' => [
                0 => 'rounded-lg overflow-hidden shadow-2xl'
            ],
            'gridConfig' => [
                'columns' => 1,
                'rows' => 1
            ]
        ],
        'hero-split' => [
            'id' => 'hero-split',
            'name' => 'Hero - División Dramática',
            'cells' => 2,
            'template' => 'grid-cols-2 grid-rows-1 gap-4',
            'style' => [
                'gap' => '10px'
            ],
            'cellStyles' => [
                0 => 'rounded-lg overflow-hidden',
                1 => 'rounded-lg overflow-hidden'
            ],
            'gridConfig' => [
                'columns' => 2,
                'rows' => 1
            ]
        ],
        'magazine-asymmetric' => [
            'id' => 'magazine-asymmetric',
            'name' => 'Magazine - Asimétrico',
            'cells' => 4,
            'template' => 'grid-cols-5 grid-rows-3 gap-2',
            'style' => [
                'gap' => '6px'
            ],
            'cellStyles' => [
                0 => 'col-span-3 row-span-2 rounded-lg overflow-hidden shadow-lg',
                1 => 'col-span-2 row-span-1 rounded-md overflow-hidden shadow-md',
                2 => 'col-span-2 row-span-1 rounded-md overflow-hidden shadow-md',
                3 => 'col-span-5 row-span-1 rounded-md overflow-hidden shadow-sm'
            ],
            'gridConfig' => [
                'columns' => 5,
                'rows' => 3,
                'cellPositions' => [
                    0 => ['col-start' => 1, 'col-end' => 4, 'row-start' => 1, 'row-end' => 3],
                    1 => ['col-start' => 4, 'col-end' => 6, 'row-start' => 1, 'row-end' => 2],
                    2 => ['col-start' => 4, 'col-end' => 6, 'row-start' => 2, 'row-end' => 3],
                    3 => ['col-start' => 1, 'col-end' => 6, 'row-start' => 3, 'row-end' => 4]
                ]
            ]
        ],
        'magazine-grid' => [
            'id' => 'magazine-grid',
            'name' => 'Magazine - Grid Moderno',
            'cells' => 6,
            'template' => 'grid-cols-3 grid-rows-2 gap-3',
            'style' => [
                'gap' => '8px',
                'padding' => '4px'
            ],
            'cellStyles' => [
                0 => 'rounded-lg overflow-hidden shadow-md',
                1 => 'rounded-lg overflow-hidden shadow-md',
                2 => 'rounded-lg overflow-hidden shadow-md',
                3 => 'rounded-lg overflow-hidden shadow-md',
                4 => 'rounded-lg overflow-hidden shadow-md',
                5 => 'rounded-lg overflow-hidden shadow-md'
            ],
            'gridConfig' => [
                'columns' => 3,
                'rows' => 2
            ]
        ]
    ];

    /**
     * Obtiene la configuración de un layout específico
     */
    public static function getLayout($layoutId)
    {
        return self::$layouts[$layoutId] ?? self::$layouts['layout-1'];
    }

    /**
     * Obtiene todos los layouts disponibles
     */
    public static function getAllLayouts()
    {
        return self::$layouts;
    }

    /**
     * Procesa una página aplicando la información de layout
     */
    public static function processPageWithLayout($page)
    {
        // Obtener layout de la página
        $layoutId = $page['layout'] ?? 'layout-1';
        $layout = self::getLayout($layoutId);

        Log::info("📐 [LAYOUT-SERVICE] Procesando página con layout: {$layoutId}", [
            'layout_name' => $layout['name'],
            'cells_expected' => $layout['cells'],
            'cells_actual' => count($page['cells'] ?? [])
        ]);

        // Añadir información del layout a la página
        $page['layoutInfo'] = [
            'id' => $layoutId,
            'name' => $layout['name'],
            'template' => $layout['template'],
            'style' => $layout['style'],
            'cellStyles' => $layout['cellStyles'],
            'gridConfig' => $layout['gridConfig']
        ];

        // Procesar las celdas con información del layout
        if (isset($page['cells']) && is_array($page['cells'])) {
            foreach ($page['cells'] as $cellIndex => &$cell) {
                // Añadir estilo específico de la celda según el layout
                if (isset($layout['cellStyles'][$cellIndex])) {
                    $cell['layoutStyle'] = $layout['cellStyles'][$cellIndex];
                }

                // Añadir posición de grid si está disponible
                if (isset($layout['gridConfig']['cellPositions'][$cellIndex])) {
                    $cell['gridPosition'] = $layout['gridConfig']['cellPositions'][$cellIndex];
                }

                // Calcular dimensiones de la celda basándose en el layout
                $cellDimensions = self::calculateCellDimensions($cellIndex, $layout);
                $cell['layoutDimensions'] = $cellDimensions;
            }
        }

        return $page;
    }

    /**
     * Calcula las dimensiones de una celda específica basándose en el layout
     */
    private static function calculateCellDimensions($cellIndex, $layout)
    {
        $gridConfig = $layout['gridConfig'];
        $columns = $gridConfig['columns'];
        $rows = $gridConfig['rows'];

        // Para layouts complejos con posiciones específicas
        if (isset($gridConfig['cellPositions'][$cellIndex])) {
            $position = $gridConfig['cellPositions'][$cellIndex];
            
            return [
                'width' => (($position['col-end'] - $position['col-start']) / $columns) * 100,
                'height' => (($position['row-end'] - $position['row-start']) / $rows) * 100,
                'x' => (($position['col-start'] - 1) / $columns) * 100,
                'y' => (($position['row-start'] - 1) / $rows) * 100
            ];
        }

        // Para layouts simples regulares
        $cellWidth = 100 / $columns;
        $cellHeight = 100 / $rows;
        
        $col = $cellIndex % $columns;
        $row = floor($cellIndex / $columns);
        
        return [
            'width' => $cellWidth,
            'height' => $cellHeight,
            'x' => $col * $cellWidth,
            'y' => $row * $cellHeight
        ];
    }

    /**
     * Convierte template CSS a estilo CSS válido para PDF
     */
    public static function convertTemplateToCSS($template)
    {
        // Convertir clases de Tailwind a CSS válido
        $cssRules = [];
        
        if (strpos($template, 'grid-cols-1') !== false) {
            $cssRules[] = 'grid-template-columns: 1fr;';
        } elseif (strpos($template, 'grid-cols-2') !== false) {
            $cssRules[] = 'grid-template-columns: 1fr 1fr;';
        } elseif (strpos($template, 'grid-cols-3') !== false) {
            $cssRules[] = 'grid-template-columns: 1fr 1fr 1fr;';
        } elseif (strpos($template, 'grid-cols-5') !== false) {
            $cssRules[] = 'grid-template-columns: 1fr 1fr 1fr 1fr 1fr;';
        }
        
        if (strpos($template, 'grid-rows-1') !== false) {
            $cssRules[] = 'grid-template-rows: 1fr;';
        } elseif (strpos($template, 'grid-rows-2') !== false) {
            $cssRules[] = 'grid-template-rows: 1fr 1fr;';
        } elseif (strpos($template, 'grid-rows-3') !== false) {
            $cssRules[] = 'grid-template-rows: 1fr 1fr 1fr;';
        }
        
        // Extraer gap si existe
        if (preg_match('/gap-(\d+)/', $template, $matches)) {
            $gap = $matches[1] * 0.25; // Convertir unidades de Tailwind a rem
            $cssRules[] = "gap: {$gap}rem;";
        }
        
        return implode(' ', $cssRules);
    }

    /**
     * Valida que una página tenga la estructura correcta según su layout
     */
    public static function validatePageLayout($page)
    {
        $layoutId = $page['layout'] ?? 'layout-1';
        $layout = self::getLayout($layoutId);
        
        $errors = [];
        
        // Validar número de celdas
        $expectedCells = $layout['cells'];
        $actualCells = count($page['cells'] ?? []);
        
        if ($actualCells !== $expectedCells) {
            $errors[] = "Layout {$layoutId} espera {$expectedCells} celdas, pero se encontraron {$actualCells}";
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'layout' => $layout
        ];
    }
}
