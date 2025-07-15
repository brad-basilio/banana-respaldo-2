<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $project->name ?? 'Proyecto' }} - PDF</title>
    <style>
        /* 🖨️ RESET Y CONFIGURACIÓN BASE */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', 'Helvetica', 'Arial', sans-serif;
            font-size: 12pt;
            line-height: 1.2;
            color: #000000;
            background: #FFFFFF;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }

        /* 🖨️ CONFIGURACIÓN DE PÁGINAS */
        .page {
            width: {{ $config['width'] * 10 }}mm;
            height: {{ $config['height'] * 10 }}mm;
            position: relative;
            page-break-after: always;
            page-break-inside: avoid;
            overflow: hidden;
        }

        .page:last-child {
            page-break-after: avoid;
        }

        /* 🖨️ IMAGEN DE FONDO */
        .page-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            object-fit: cover;
        }

        /* 🖨️ LAYOUT GRID CONTAINER */
        .layout-grid {
            width: 100%;
            height: 100%;
            position: relative;
            display: grid;
        }

        /* 🖨️ CELDAS DEL LAYOUT */
        .layout-cell {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        /* 🖨️ CONTENEDOR DE ELEMENTOS DENTRO DE CELDA */
        .cell-elements {
            position: relative;
            width: 100%;
            height: 100%;
        }

        /* 🖨️ ELEMENTOS INDIVIDUALES */
        .element {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* 🖨️ TEXTO OPTIMIZADO PARA IMPRESIÓN */
        .text-content {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            /* Valores por defecto que pueden ser sobrescritos */
            font-size: 12pt !important;
            color: #000000 !important;
            font-family: 'DejaVu Sans', 'Helvetica', 'Arial', sans-serif !important;
            font-weight: normal !important;
            text-align: left !important;
            line-height: 1.2 !important;
            min-height: 20px !important;
            visibility: visible !important;
            opacity: 1 !important;
            /* Mejorar el renderizado de texto */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeSpeed;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            text-size-adjust: 100%;
        }

        /* 🖨️ IMÁGENES OPTIMIZADAS PARA IMPRESIÓN */
        .element img {
            width: 100%;
            height: 100%;
            object-fit: cover !important;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: optimize-contrast;
            image-rendering: crisp-edges;
            max-width: none;
        }

        /* 🖨️ ASEGURAR CALIDAD DE FUENTES */
        @media print {
            * {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .page {
                margin: 0;
                border: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    @if(isset($pages) && count($pages) > 0)
        @foreach ($pages as $pageIndex => $page)
            <div class="page" 
                 style="background-color: {{ $page['backgroundColor'] ?? '#FFFFFF' }};">
                
                {{-- 🖨️ IMAGEN DE FONDO SI EXISTE --}}
                @if(!empty($page['backgroundImage']))
                    <img src="{{ $page['backgroundImage'] }}" 
                         class="page-background" 
                         alt="Fondo de página {{ $pageIndex + 1 }}"
                         style="object-fit: cover;">
                @endif
                
                {{-- 🖨️ CONTENEDOR DE LAYOUT CON GRID --}}
                @if(isset($page['layout']))
                    @php
                        $layout = $page['layout'];
                        $gridCSS = $layout['gridCSS'];
                        $gap = $layout['style']['gap'] ?? '0px';
                        $padding = $layout['style']['padding'] ?? '0px';
                        
                        $gridStyle = sprintf(
                            'display: grid; grid-template-columns: %s; grid-template-rows: %s; gap: %s; padding: %s; width: 100%%; height: 100%%;',
                            $gridCSS['grid-template-columns'] ?? '1fr',
                            $gridCSS['grid-template-rows'] ?? '1fr',
                            $gap,
                            $padding
                        );
                    @endphp
                    
                    <div class="layout-grid" style="{{ $gridStyle }}">
                        @if(isset($page['cells']) && count($page['cells']) > 0)
                            @foreach ($page['cells'] as $cellIndex => $cell)
                                @php
                                    $cellStyle = '';
                                    if (isset($cell['style']) && is_array($cell['style'])) {
                                        $cssProps = [];
                                        foreach ($cell['style'] as $prop => $value) {
                                            $cssProps[] = $prop . ': ' . $value;
                                        }
                                        $cellStyle = implode('; ', $cssProps);
                                    }
                                @endphp
                                
                                <div class="layout-cell" 
                                     style="{{ $cellStyle }}"
                                     data-cell-index="{{ $cellIndex }}"
                                     data-layout="{{ $layout['id'] }}">
                                    
                                    <div class="cell-elements">
                                        @if(isset($cell['elements']) && count($cell['elements']) > 0)
                                            @foreach ($cell['elements'] as $element)
                                                <div class="element"
                                                     style="left: {{ $element['position']['x'] }}%; 
                                                            top: {{ $element['position']['y'] }}%; 
                                                            width: {{ $element['size']['width'] }}%; 
                                                            height: {{ $element['size']['height'] }}%; 
                                                            z-index: {{ $element['zIndex'] ?? 1 }};">
                                                    
                                                    @if ($element['type'] === 'text')
                                                        {{-- 🖨️ ELEMENTO DE TEXTO OPTIMIZADO --}}
                                                        @php
                                                            $style = $element['style'] ?? [];
                                                            $content = $element['content'] ?? '';
                                                            
                                                            // Procesar estilos de texto con mejores fallbacks
                                                            $color = $style['color'] ?? '#000000';
                                                            $fontSize = $style['fontSize'] ?? '12pt';
                                                            $fontFamily = $style['fontFamily'] ?? 'DejaVu Sans, Arial, sans-serif';
                                                            $fontWeight = $style['fontWeight'] ?? 'normal';
                                                            $textAlign = $style['textAlign'] ?? 'left';
                                                            $backgroundColor = $style['backgroundColor'] ?? 'transparent';
                                                            $lineHeight = $style['lineHeight'] ?? '1.2';
                                                            
                                                            // Asegurar tamaño mínimo visible y convertir a pt
                                                            $numericSize = (int)preg_replace('/[^0-9]/', '', $fontSize);
                                                            if ($numericSize < 9) {
                                                                $fontSize = '12pt';
                                                            } else {
                                                                // Convertir px a pt si es necesario
                                                                if (strpos($fontSize, 'px') !== false) {
                                                                    $pxSize = (int)str_replace('px', '', $fontSize);
                                                                    $ptSize = round($pxSize * 0.75);
                                                                    $fontSize = $ptSize . 'pt';
                                                                } else if (strpos($fontSize, 'pt') === false) {
                                                                    // Si no tiene unidad, asumir px y convertir a pt
                                                                    $ptSize = round($numericSize * 0.75);
                                                                    $fontSize = $ptSize . 'pt';
                                                                }
                                                            }
                                                            
                                                            // Mapear fuentes compatibles
                                                            $fontFamilyMap = [
                                                                'Arial' => 'Arial, sans-serif',
                                                                'Helvetica' => 'Helvetica, sans-serif',
                                                                'Times' => 'Times, serif',
                                                                'sans-serif' => 'DejaVu Sans, Arial, sans-serif',
                                                                'serif' => 'DejaVu Serif, Times, serif'
                                                            ];
                                                            
                                                            foreach ($fontFamilyMap as $key => $value) {
                                                                if (stripos($fontFamily, $key) !== false) {
                                                                    $fontFamily = $value;
                                                                    break;
                                                                }
                                                            }
                                                        @endphp
                                                        
                                                        <div class="text-content"
                                                             style="color: {{ $color }} !important; 
                                                                    font-size: {{ $fontSize }} !important; 
                                                                    text-align: {{ $textAlign }} !important; 
                                                                    font-weight: {{ $fontWeight }} !important; 
                                                                    font-family: {{ $fontFamily }} !important; 
                                                                    background-color: {{ $backgroundColor }} !important;
                                                                    line-height: {{ $lineHeight }} !important;
                                                                    display: flex !important;
                                                                    align-items: center !important;
                                                                    justify-content: center !important;
                                                                    visibility: visible !important;
                                                                    opacity: 1 !important;
                                                                    overflow: visible !important;">
                                                            {!! $content !!}
                                                        </div>
                                                        
                                                    @elseif ($element['type'] === 'image' && !empty($element['content']))
                                                        {{-- 🖨️ ELEMENTO DE IMAGEN OPTIMIZADO --}}
                                                        <img src="{{ $element['content'] }}" 
                                                             alt="Imagen {{ $loop->iteration }}"
                                                             style="object-fit: cover; image-rendering: high-quality;">
                                                    @endif
                                                </div>
                                            @endforeach
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        @endif
                    </div>
                @else
                    {{-- 🖨️ FALLBACK SIN LAYOUT (POSICIONAMIENTO ABSOLUTO) --}}
                    <div class="elements-container" style="position: relative; width: 100%; height: 100%;">
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
                                                            font-size: {{ $element['style']['fontSize'] ?? '12pt' }}; 
                                                            text-align: {{ $element['style']['textAlign'] ?? 'left' }}; 
                                                            font-weight: {{ $element['style']['fontWeight'] ?? 'normal' }}; 
                                                            font-family: {{ $element['style']['fontFamily'] ?? 'DejaVu Sans, Arial, sans-serif' }}; 
                                                            background-color: {{ $element['style']['backgroundColor'] ?? 'transparent' }};
                                                            line-height: {{ $element['style']['lineHeight'] ?? '1.2' }};">
                                                    {!! $element['content'] !!}
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
        {{-- 🖨️ PÁGINA DE ERROR SI NO HAY CONTENIDO --}}
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
