<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $project->name ?? 'Proyecto' }} - PDF</title>
    <style>
        /* 🖨️ CONFIGURACIÓN DE PÁGINA PARA IMPRESIÓN PROFESIONAL */
        @page {
            margin: 0; /* Sin márgenes para usar toda la página */
            size: {{ $config['width'] }}cm {{ $config['height'] }}cm;
        }
        
        body {
            font-family: 'DejaVu Sans', 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }
        
        /* 🖨️ ESTILOS DE PÁGINA PARA CALIDAD PROFESIONAL */
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
        
        /* 🖨️ ELEMENTOS POSICIONADOS CON PRECISIÓN */
        .element {
            position: absolute;
            box-sizing: border-box;
            overflow: hidden;
            object-fit: cover !important;
            background-size: cover;
            background-position: center;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: optimize-contrast;
            image-rendering: crisp-edges;
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
        
        /* 🖨️ TEXTO OPTIMIZADO PARA IMPRESIÓN */
        .element .text-content {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 4px; /* Pequeño padding para separar del borde */
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
            box-sizing: border-box;
            display: flex;
            align-items: flex-start;
            line-height: 1.2;
        }
        
        /* 🖨️ FONDO DE PÁGINA OPTIMIZADO */
        .page-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            object-fit: cover;
        }
        
        /* 🖨️ CONTENEDOR DE ELEMENTOS */
        .elements-container {
            position: relative;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
        
        /* 🖨️ PREVENIR PROBLEMAS DE RENDERIZADO */
        * {
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
        }
        
        /* 🖨️ ASEGURAR CALIDAD DE FUENTES */
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
                
                {{-- 🖨️ IMAGEN DE FONDO SI EXISTE --}}
                @if(!empty($page['backgroundImage']))
                    <img src="{{ $page['backgroundImage'] }}" 
                         class="page-background" 
                         alt="Fondo de página {{ $pageIndex + 1 }}"
                         style="object-fit: cover;">
                @endif
                
                {{-- 🖨️ CONTENEDOR DE ELEMENTOS --}}
                <div class="elements-container">
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
                                            {{-- 🖨️ ELEMENTO DE TEXTO OPTIMIZADO --}}
                                            <div class="text-content"
                                                 style="color: {{ $element['style']['color'] ?? '#000000' }}; 
                                                        font-size: {{ $element['style']['fontSize'] ?? '16px' }}; 
                                                        text-align: {{ $element['style']['textAlign'] ?? 'left' }}; 
                                                        font-weight: {{ $element['style']['fontWeight'] ?? 'normal' }}; 
                                                        font-family: {{ $element['style']['fontFamily'] ?? 'sans-serif' }}; 
                                                        background-color: {{ $element['style']['backgroundColor'] ?? 'transparent' }};
                                                        line-height: {{ $element['style']['lineHeight'] ?? '1.2' }};">
                                                {{ $element['content'] }}
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
                        @endforeach
                    @endif
                </div>
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
