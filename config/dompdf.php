<?php

return [

    /*
    |--------------------------------------------------------------------------
    | DomPDF Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración optimizada para generación de PDFs de alta calidad
    | específicamente para el Creative Editor de BananaLab
    |
    */

    'show_warnings' => false,
    'public_path' => public_path(),
    'convert_entities' => true,
    'options' => [
        /**
         * Calidad y resolución para impresión profesional
         */
        'dpi' => 300,
        'defaultMediaType' => 'screen',
        'defaultPaperSize' => 'a4',
        'defaultFont' => 'Arial',
        
        /**
         * Márgenes optimizados para impresión (en mm)
         */
        'margin_left' => 5,
        'margin_right' => 5,
        'margin_top' => 5,
        'margin_bottom' => 5,
        
        /**
         * Configuración de imágenes
         */
        'isRemoteEnabled' => true,
        'isHtml5ParserEnabled' => true,
        'isFontSubsettingEnabled' => true,
        'isPhpEnabled' => false,
        
        /**
         * Configuración de memoria y rendimiento
         */
        'chroot' => public_path(),
        'logOutputFile' => storage_path('logs/dompdf.log'),
        'tempDir' => sys_get_temp_dir(),
        'fontDir' => storage_path('fonts/'),
        'fontCache' => storage_path('fonts/'),
        'cacheDir' => storage_path('app/dompdf/'),
        
        /**
         * Configuración específica para Creative Editor
         */
        'enable_css_float' => true,
        'enable_javascript' => false,
        'debugPng' => false,
        'debugKeepTemp' => false,
        'debugCss' => false,
        'debugLayout' => false,
        'debugLayoutLines' => false,
        'debugLayoutBlocks' => false,
        'debugLayoutInline' => false,
        'debugLayoutPaddingBox' => false,
        
        /**
         * Configuración de renderizado para mejor calidad
         */
        'pdf_backend' => 'CPDF',
        'render_backend' => 'auto',
        'enable_remote' => true,
        'enable_html5_parser' => true,
    ],
];
