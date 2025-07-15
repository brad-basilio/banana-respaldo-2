<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $project->name ?? 'Proyecto' }} - PDF con Layouts</title>
    <style>
        /* 🖨️ CONFIGURACIÓN DE PÁGINA PARA IMPRESIÓN PROFESIONAL */
        @page {
            margin: 0;
            size: {{ $config['width'] }}cm {{ $config['height'] }}cm;
        }
        
        body {
            font-family: 'DejaVu Sans', 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }
        
        /* 🖨️ ESTILOS DE PÁGINA */
        .page {
            page-break-after: always;
            width: {{ $config['width'] }}cm;
            height: {{ $config['height'] }}cm;
            position: relative;
            overflow: hidden;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            box-sizing: border-box;
        }
        
        .page:last-child {
            page-break-after: auto;
        }
        
        /* 🖨️ FONDO DE PÁGINA */
        .page-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            object-fit: cover;
        }
        
        /* 📐 CONTENEDOR DE LAYOUT CON GRID */
        .layout-container {
            position: relative;
            width: 100%;
            height: 100%;
            z-index: 1;
            display: grid;
            box-sizing: border-box;
        }
        
        /* 📐 ESTILOS ESPECÍFICOS DE LAYOUTS */
        .layout-grid-1-1 { 
            grid-template-columns: 1fr; 
            grid-template-rows: 1fr; 
        }
        
        .layout-grid-2-1 { 
            grid-template-columns: 1fr 1fr; 
            grid-template-rows: 1fr; 
        }
        
        .layout-grid-1-2 { 
            grid-template-columns: 1fr; 
            grid-template-rows: 1fr 1fr; 
        }
        
        .layout-grid-3-1 { 
            grid-template-columns: 1fr 1fr 1fr; 
            grid-template-rows: 1fr; 
        }
        
        .layout-grid-2-2 { 
            grid-template-columns: 1fr 1fr; 
            grid-template-rows: 1fr 1fr; 
        }
        
        .layout-grid-3-2 { 
            grid-template-columns: 1fr 1fr 1fr; 
            grid-template-rows: 1fr 1fr; 
        }
        
        .layout-grid-5-3 { 
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr; 
            grid-template-rows: 1fr 1fr 1fr; 
        }
        
        /* 📐 ESTILOS PARA LAYOUTS COMPLEJOS */
        .layout-magazine-asymmetric .cell-0 {
            grid-column: 1 / 4;
            grid-row: 1 / 3;
        }
        
        .layout-magazine-asymmetric .cell-1 {
            grid-column: 4 / 6;
            grid-row: 1 / 2;
        }
        
        .layout-magazine-asymmetric .cell-2 {
            grid-column: 4 / 6;
            grid-row: 2 / 3;
        }
        
        .layout-magazine-asymmetric .cell-3 {
            grid-column: 1 / 6;
            grid-row: 3 / 4;
        }
        
        /* 📐 CELDAS DE LAYOUT */
        .layout-cell {
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
        }
        
        /* 📐 GAPS DINÁMICOS */
        .gap-0 { gap: 0; }
        .gap-1 { gap: 0.25rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-8 { gap: 2rem; }
        
        /* 📐 PADDING DINÁMICO */
        .p-0 { padding: 0; }
        .p-1 { padding: 0.25rem; }
        .p-2 { padding: 0.5rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .p-8 { padding: 2rem; }
        
        /* 🎨 ESTILOS DE CELDAS */
        .cell-rounded { border-radius: 0.5rem; }
        .cell-rounded-md { border-radius: 0.375rem; }
        .cell-rounded-lg { border-radius: 0.5rem; }
        .cell-rounded-xl { border-radius: 0.75rem; }
        .cell-rounded-2xl { border-radius: 1rem; }
        
        .cell-shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .cell-shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .cell-shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .cell-shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .cell-shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        
        /* 🖨️ ELEMENTOS DENTRO DE CELDAS */
        .element {
            position: absolute;
            box-sizing: border-box;
            overflow: hidden;
        }
        
        .element img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: optimize-contrast;
            image-rendering: crisp-edges;
        }
        
        .element .text-content {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            padding: 4px;
            box-sizing: border-box;
            line-height: 1.2;
        }
        
        /* 🖨️ PREVENIR PROBLEMAS DE RENDERIZADO */
        * {
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
        }
        
        @media print {
            * {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    @if(isset($pages) && count($pages) > 0)
        @foreach ($pages as $pageIndex => $page)
            <div class="page" 
                 style="background-color: {{ $page['backgroundColor'] ?? '#FFFFFF' }};">
                
                {{-- 🖨️ IMAGEN DE FONDO --}}
                @if(!empty($page['backgroundImage']))
                    <img src="{{ $page['backgroundImage'] }}" 
                         class="page-background" 
                         alt="Fondo de página {{ $pageIndex + 1 }}">
                @endif
                
                {{-- 📐 CONTENEDOR DE LAYOUT CON GRID --}}
                @if(isset($page['layoutInfo']))
                    @php
                        $layoutInfo = $page['layoutInfo'];
                        $gridConfig = $layoutInfo['gridConfig'];
                        $layoutStyle = $layoutInfo['style'];
                        
                        // Construir clases CSS dinámicamente
                        $layoutClasses = [];
                        $layoutClasses[] = 'layout-container';
                        $layoutClasses[] = 'layout-grid-' . $gridConfig['columns'] . '-' . $gridConfig['rows'];
                        $layoutClasses[] = 'layout-' . str_replace('-', '-', $layoutInfo['id']);
                        
                        // Añadir clases de gap y padding
                        if (isset($layoutStyle['gap'])) {
                            $gap = intval(str_replace('px', '', $layoutStyle['gap']));
                            $layoutClasses[] = 'gap-' . min(8, max(0, intval($gap / 4)));
                        }
                        
                        if (isset($layoutStyle['padding'])) {
                            $padding = intval(str_replace('px', '', $layoutStyle['padding']));
                            $layoutClasses[] = 'p-' . min(8, max(0, intval($padding / 4)));
                        }
                    @endphp
                    
                    <div class="{{ implode(' ', $layoutClasses) }}"
                         style="@if(isset($layoutStyle['gap']))gap: {{ $layoutStyle['gap'] }};@endif
                                @if(isset($layoutStyle['padding']))padding: {{ $layoutStyle['padding'] }};@endif">
                        
                        {{-- 📐 PROCESAR CELDAS SEGÚN EL LAYOUT --}}
                        @if(isset($page['cells']) && count($page['cells']) > 0)
                            @foreach ($page['cells'] as $cellIndex => $cell)
                                @php
                                    // Construir clases CSS para la celda
                                    $cellClasses = ['layout-cell', 'cell-' . $cellIndex];
                                    
                                    // Añadir estilos específicos del layout
                                    if (isset($cell['layoutStyle'])) {
                                        $layoutStyle = $cell['layoutStyle'];
                                        
                                        // Parsear estilos de Tailwind
                                        if (strpos($layoutStyle, 'rounded-2xl') !== false) {
                                            $cellClasses[] = 'cell-rounded-2xl';
                                        } elseif (strpos($layoutStyle, 'rounded-xl') !== false) {
                                            $cellClasses[] = 'cell-rounded-xl';
                                        } elseif (strpos($layoutStyle, 'rounded-lg') !== false) {
                                            $cellClasses[] = 'cell-rounded-lg';
                                        } elseif (strpos($layoutStyle, 'rounded-md') !== false) {
                                            $cellClasses[] = 'cell-rounded-md';
                                        } elseif (strpos($layoutStyle, 'rounded') !== false) {
                                            $cellClasses[] = 'cell-rounded';
                                        }
                                        
                                        // Añadir sombras
                                        if (strpos($layoutStyle, 'shadow-2xl') !== false) {
                                            $cellClasses[] = 'cell-shadow-2xl';
                                        } elseif (strpos($layoutStyle, 'shadow-xl') !== false) {
                                            $cellClasses[] = 'cell-shadow-xl';
                                        } elseif (strpos($layoutStyle, 'shadow-lg') !== false) {
                                            $cellClasses[] = 'cell-shadow-lg';
                                        } elseif (strpos($layoutStyle, 'shadow-md') !== false) {
                                            $cellClasses[] = 'cell-shadow-md';
                                        } elseif (strpos($layoutStyle, 'shadow-sm') !== false) {
                                            $cellClasses[] = 'cell-shadow-sm';
                                        }
                                    }
                                @endphp
                                
                                <div class="{{ implode(' ', $cellClasses) }}">
                                    {{-- 🖨️ ELEMENTOS DENTRO DE LA CELDA --}}
                                    @if(isset($cell['elements']) && count($cell['elements']) > 0)
                                        @foreach ($cell['elements'] as $element)
                                            <div class="element"
                                                 style="left: {{ $element['position']['x'] }}%; 
                                                        top: {{ $element['position']['y'] }}%; 
                                                        width: {{ $element['size']['width'] }}%; 
                                                        height: {{ $element['size']['height'] }}%; 
                                                        z-index: {{ $element['zIndex'] ?? 1 }};">
                                                
                                                @if ($element['type'] === 'text')
                                                    <div class="text-content"
                                                         style="color: {{ $element['style']['color'] ?? '#000000' }}; 
                                                                font-size: {{ $element['style']['fontSize'] ?? '16px' }}; 
                                                                font-weight: {{ $element['style']['fontWeight'] ?? 'normal' }}; 
                                                                font-family: {{ $element['style']['fontFamily'] ?? 'sans-serif' }}; 
                                                                line-height: {{ $element['style']['lineHeight'] ?? '1.2' }};
                                                                text-align: {{ $element['style']['textAlign'] ?? 'left' }};">
                                                        <span>{{ $element['content'] }}</span>
                                                    </div>
                                                    
                                                @elseif ($element['type'] === 'image' && !empty($element['content']))
                                                    <img src="{{ $element['content'] }}" 
                                                         alt="Imagen {{ $loop->iteration }}"
                                                         style="object-fit: cover; image-rendering: high-quality;">
                                                @endif
                                            </div>
                                        @endforeach
                                    @endif
                                </div>
                            @endforeach
                        @endif
                    </div>
                @else
                    {{-- 📐 FALLBACK PARA PÁGINAS SIN LAYOUT --}}
                    <div class="layout-container layout-grid-1-1">
                        @if(isset($page['cells']) && count($page['cells']) > 0)
                            @foreach ($page['cells'] as $cell)
                                @if(isset($cell['elements']) && count($cell['elements']) > 0)
                                    @foreach ($cell['elements'] as $element)
                                        <div class="element"
                                             style="left: {{ $element['position']['x'] }}%; 
                                                    top: {{ $element['position']['y'] }}%; 
                                                    width: {{ $element['size']['width'] }}%; 
                                                    height: {{ $element['size']['height'] }}%; 
                                                    z-index: {{ $element['zIndex'] ?? 1 }};">
                                            
                                            @if ($element['type'] === 'text')
                                                <div class="text-content"
                                                     style="color: {{ $element['style']['color'] ?? '#000000' }}; 
                                                            font-size: {{ $element['style']['fontSize'] ?? '16px' }}; 
                                                            font-weight: {{ $element['style']['fontWeight'] ?? 'normal' }}; 
                                                            font-family: {{ $element['style']['fontFamily'] ?? 'sans-serif' }}; 
                                                            line-height: {{ $element['style']['lineHeight'] ?? '1.2' }};">
                                                    <span>{{ $element['content'] }}</span>
                                                </div>
                                                
                                            @elseif ($element['type'] === 'image' && !empty($element['content']))
                                                <img src="{{ $element['content'] }}" 
                                                     alt="Imagen {{ $loop->iteration }}"
                                                     style="object-fit: cover; image-rendering: high-quality;">
                                            @endif
                                        </div>
                                    @endforeach
                                @endif
                            @endforeach
                        @endif
                    </div>
                @endif
            </div>
        @endforeach
    @else
        <div class="page" style="background-color: #FFFFFF;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <h1 style="color: #666; font-size: 24px; margin: 0;">Proyecto sin contenido</h1>
                <p style="color: #999; font-size: 16px; margin: 10px 0 0 0;">
                    Este proyecto no tiene páginas o elementos para mostrar en el PDF.
                </p>
            </div>
        </div>
    @endif
</body>
</html>
