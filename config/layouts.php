<?php

return [
    'layouts' => [
        'single' => [
            'rows' => 1,
            'cols' => 1,
            'cells' => [
                ['row' => 0, 'col' => 0, 'width' => 1, 'height' => 1]
            ]
        ],
        'double-horizontal' => [
            'rows' => 1,
            'cols' => 2,
            'cells' => [
                ['row' => 0, 'col' => 0, 'width' => 1, 'height' => 1],
                ['row' => 0, 'col' => 1, 'width' => 1, 'height' => 1]
            ]
        ],
        'double-vertical' => [
            'rows' => 2,
            'cols' => 1,
            'cells' => [
                ['row' => 0, 'col' => 0, 'width' => 1, 'height' => 1],
                ['row' => 1, 'col' => 0, 'width' => 1, 'height' => 1]
            ]
        ],
        'triple-horizontal' => [
            'rows' => 1,
            'cols' => 3,
            'cells' => [
                ['row' => 0, 'col' => 0, 'width' => 1, 'height' => 1],
                ['row' => 0, 'col' => 1, 'width' => 1, 'height' => 1],
                ['row' => 0, 'col' => 2, 'width' => 1, 'height' => 1]
            ]
        ],
        'triple-vertical' => [
            'rows' => 3,
            'cols' => 1,
            'cells' => [
                ['row' => 0, 'col' => 0, 'width' => 1, 'height' => 1],
                ['row' => 1, 'col' => 0, 'width' => 1, 'height' => 1],
                ['row' => 2, 'col' => 0, 'width' => 1, 'height' => 1]
            ]
        ],
        'quad' => [
            'rows' => 2,
            'cols' => 2,
            'cells' => [
                ['row' => 0, 'col' => 0, 'width' => 1, 'height' => 1],
                ['row' => 0, 'col' => 1, 'width' => 1, 'height' => 1],
                ['row' => 1, 'col' => 0, 'width' => 1, 'height' => 1],
                ['row' => 1, 'col' => 1, 'width' => 1, 'height' => 1]
            ]
        ],
        'mixed-left' => [
            'rows' => 2,
            'cols' => 2,
            'cells' => [
                ['row' => 0, 'col' => 0, 'width' => 1, 'height' => 2], // Celda grande izquierda
                ['row' => 0, 'col' => 1, 'width' => 1, 'height' => 1],
                ['row' => 1, 'col' => 1, 'width' => 1, 'height' => 1]
            ]
        ],
        'mixed-right' => [
            'rows' => 2,
            'cols' => 2,
            'cells' => [
                ['row' => 0, 'col' => 0, 'width' => 1, 'height' => 1],
                ['row' => 1, 'col' => 0, 'width' => 1, 'height' => 1],
                ['row' => 0, 'col' => 1, 'width' => 1, 'height' => 2] // Celda grande derecha
            ]
        ],
        'mixed-top' => [
            'rows' => 2,
            'cols' => 2,
            'cells' => [
                ['row' => 0, 'col' => 0, 'width' => 2, 'height' => 1], // Celda grande arriba
                ['row' => 1, 'col' => 0, 'width' => 1, 'height' => 1],
                ['row' => 1, 'col' => 1, 'width' => 1, 'height' => 1]
            ]
        ],
        'mixed-bottom' => [
            'rows' => 2,
            'cols' => 2,
            'cells' => [
                ['row' => 0, 'col' => 0, 'width' => 1, 'height' => 1],
                ['row' => 0, 'col' => 1, 'width' => 1, 'height' => 1],
                ['row' => 1, 'col' => 0, 'width' => 2, 'height' => 1] // Celda grande abajo
            ]
        ]
    ],
    
    'default_style' => [
        'gap' => '8px',
        'padding' => '16px',
        'background' => '#ffffff',
        'border' => 'none',
        'border-radius' => '0px'
    ],
    
    'cell_styles' => [
        'default' => [
            'background' => 'transparent',
            'border' => '1px solid #e2e8f0',
            'border-radius' => '4px',
            'padding' => '8px',
            'overflow' => 'hidden'
        ],
        'no-border' => [
            'background' => 'transparent',
            'border' => 'none',
            'border-radius' => '0px',
            'padding' => '0px',
            'overflow' => 'hidden'
        ],
        'shadow' => [
            'background' => '#ffffff',
            'border' => 'none',
            'border-radius' => '8px',
            'padding' => '12px',
            'box-shadow' => '0 2px 8px rgba(0,0,0,0.1)',
            'overflow' => 'hidden'
        ]
    ]
];
