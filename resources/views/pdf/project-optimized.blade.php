<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF - {{ $project->name ?? 'Álbum' }}</title>
    <style>
        @page {
            margin: 0;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.4;
            color: #333;
        }
        
        .page {
            page-break-after: always;
            width: 100%;
            height: 100vh;
            position: relative;
            overflow: hidden;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        .page-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
        
        .page-background img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .page-content {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            display: grid;
            gap: 8px;
            padding: 16px;
        }
        
        /* Layout dinámico basado en configuración */
        .layout-grid-1-1 { grid-template-columns: 1fr; grid-template-rows: 1fr; }
        .layout-grid-1-2 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; }
        .layout-grid-2-1 { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
        .layout-grid-1-3 { grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr; }
        .layout-grid-3-1 { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr 1fr; }
        .layout-grid-2-2 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
        .layout-grid-2-3 { grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr; }
        .layout-grid-3-2 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; }
        .layout-grid-3-3 { grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; }
        
        /* Celdas con posicionamiento específico */
        .cell {
            position: relative;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 8px;
        }
        
        .cell.no-border {
            border: none;
            border-radius: 0;
            padding: 0;
        }
        
        .element {
            position: absolute;
            max-width: 100%;
            max-height: 100%;
        }
        
        .element img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: inherit;
        }
        
        .element.text {
            display: flex;
            align-items: center;
            justify-content: center;
            word-wrap: break-word;
            overflow: hidden;
        }
        
        /* Layout específicos (fallback) */
        .layout-single { grid-template-columns: 1fr; grid-template-rows: 1fr; }
        .layout-two-col { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; }
        .layout-two-row { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
        .layout-three-col { grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr; }
        .layout-three-row { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr 1fr; }
        .layout-four-grid { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
        .layout-six-grid { grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr; }
        
        /* Optimizaciones para impresión */
        img {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            image-rendering: high-quality;
            image-rendering: -webkit-optimize-contrast;
        }
        
        .text-element {
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
    </style>
</head>
<body>
    @foreach($pages as $pageIndex => $page)
        <div class="page">
            {{-- Fondo de página --}}
            @if(!empty($page['backgroundImage']))
                <div class="page-background">
                    <img src="{{ $page['backgroundImage'] }}" alt="Fondo de página {{ $pageIndex + 1 }}">
                </div>
            @elseif(!empty($page['backgroundColor']))
                <div class="page-background" style="background-color: {{ $page['backgroundColor'] }};"></div>
            @endif
            
            {{-- Contenido de página con layout dinámico --}}
            @if(isset($page['layoutInfo']) && $page['layoutInfo'])
                <?php $layoutInfo = $page['layoutInfo']; ?>
                <div class="page-content" 
                     style="
                        display: grid;
                        grid-template-columns: repeat({{ $layoutInfo['cols'] }}, 1fr);
                        grid-template-rows: repeat({{ $layoutInfo['rows'] }}, 1fr);
                        gap: {{ $layoutInfo['gap'] ?? '8px' }};
                        padding: {{ $layoutInfo['padding'] ?? '16px' }};
                     ">
                    @if(isset($page['cells']) && is_array($page['cells']))
                        @foreach($page['cells'] as $cellIndex => $cell)
                            <div class="cell {{ $cell['style'] ?? '' }}" 
                                 data-cell="{{ $cellIndex }}"
                                 @if(isset($layoutInfo['cells'][$cellIndex]))
                                     style="
                                        grid-column: {{ $layoutInfo['cells'][$cellIndex]['col'] + 1 }} / span {{ $layoutInfo['cells'][$cellIndex]['width'] }};
                                        grid-row: {{ $layoutInfo['cells'][$cellIndex]['row'] + 1 }} / span {{ $layoutInfo['cells'][$cellIndex]['height'] }};
                                     "
                                 @endif>
                                @if(isset($cell['elements']) && is_array($cell['elements']))
                                    @foreach($cell['elements'] as $elementIndex => $element)
                                        @if($element['type'] === 'image' && !empty($element['content']))
                                            <div class="element image" 
                                                 style="
                                                    left: {{ ($element['position']['x'] ?? 0) * 100 }}%;
                                                    top: {{ ($element['position']['y'] ?? 0) * 100 }}%;
                                                    width: {{ ($element['size']['width'] ?? 0.3) * 100 }}%;
                                                    height: {{ ($element['size']['height'] ?? 0.3) * 100 }}%;
                                                    transform: rotate({{ $element['filters']['rotate'] ?? 0 }}deg) scale({{ $element['filters']['scale'] ?? 1 }});
                                                    opacity: {{ ($element['filters']['opacity'] ?? 100) / 100 }};
                                                    filter: brightness({{ $element['filters']['brightness'] ?? 100 }}%) 
                                                           contrast({{ $element['filters']['contrast'] ?? 100 }}%) 
                                                           saturate({{ $element['filters']['saturation'] ?? 100 }}%) 
                                                           hue-rotate({{ $element['filters']['hue'] ?? 0 }}deg) 
                                                           blur({{ $element['filters']['blur'] ?? 0 }}px);
                                                 ">
                                                <img src="{{ $element['content'] }}" 
                                                     alt="Imagen {{ $pageIndex + 1 }}-{{ $cellIndex + 1 }}-{{ $elementIndex + 1 }}"
                                                     loading="eager">
                                            </div>
                                        @elseif($element['type'] === 'text' && !empty($element['content']))
                                            <div class="element text text-element" 
                                                 style="
                                                    left: {{ ($element['position']['x'] ?? 0) * 100 }}%;
                                                    top: {{ ($element['position']['y'] ?? 0) * 100 }}%;
                                                    width: {{ ($element['size']['width'] ?? 0.3) * 100 }}%;
                                                    height: {{ ($element['size']['height'] ?? 0.3) * 100 }}%;
                                                    font-size: {{ $element['fontSize'] ?? 16 }}px;
                                                    font-weight: {{ $element['fontWeight'] ?? 'normal' }};
                                                    color: {{ $element['color'] ?? '#000000' }};
                                                    text-align: {{ $element['textAlign'] ?? 'center' }};
                                                    transform: rotate({{ $element['filters']['rotate'] ?? 0 }}deg) scale({{ $element['filters']['scale'] ?? 1 }});
                                                    opacity: {{ ($element['filters']['opacity'] ?? 100) / 100 }};
                                                 ">
                                                {!! nl2br(e($element['content'])) !!}
                                            </div>
                                        @endif
                                    @endforeach
                                @endif
                            </div>
                        @endforeach
                    @endif
                </div>
            @else
                {{-- Fallback sin layout específico --}}
                <div class="page-content {{ 'layout-' . ($page['layout'] ?? 'single') }}">
                    @if(isset($page['cells']) && is_array($page['cells']))
                        @foreach($page['cells'] as $cellIndex => $cell)
                            <div class="cell" data-cell="{{ $cellIndex }}">
                                @if(isset($cell['elements']) && is_array($cell['elements']))
                                    @foreach($cell['elements'] as $elementIndex => $element)
                                        @if($element['type'] === 'image' && !empty($element['content']))
                                            <div class="element image" 
                                                 style="
                                                    left: {{ ($element['position']['x'] ?? 0) * 100 }}%;
                                                    top: {{ ($element['position']['y'] ?? 0) * 100 }}%;
                                                    width: {{ ($element['size']['width'] ?? 0.3) * 100 }}%;
                                                    height: {{ ($element['size']['height'] ?? 0.3) * 100 }}%;
                                                    transform: rotate({{ $element['filters']['rotate'] ?? 0 }}deg) scale({{ $element['filters']['scale'] ?? 1 }});
                                                    opacity: {{ ($element['filters']['opacity'] ?? 100) / 100 }};
                                                    filter: brightness({{ $element['filters']['brightness'] ?? 100 }}%) 
                                                           contrast({{ $element['filters']['contrast'] ?? 100 }}%) 
                                                           saturate({{ $element['filters']['saturation'] ?? 100 }}%) 
                                                           hue-rotate({{ $element['filters']['hue'] ?? 0 }}deg) 
                                                           blur({{ $element['filters']['blur'] ?? 0 }}px);
                                                 ">
                                                <img src="{{ $element['content'] }}" 
                                                     alt="Imagen {{ $pageIndex + 1 }}-{{ $cellIndex + 1 }}-{{ $elementIndex + 1 }}"
                                                     loading="eager">
                                            </div>
                                        @elseif($element['type'] === 'text' && !empty($element['content']))
                                            <div class="element text text-element" 
                                                 style="
                                                    left: {{ ($element['position']['x'] ?? 0) * 100 }}%;
                                                    top: {{ ($element['position']['y'] ?? 0) * 100 }}%;
                                                    width: {{ ($element['size']['width'] ?? 0.3) * 100 }}%;
                                                    height: {{ ($element['size']['height'] ?? 0.3) * 100 }}%;
                                                    font-size: {{ $element['fontSize'] ?? 16 }}px;
                                                    font-weight: {{ $element['fontWeight'] ?? 'normal' }};
                                                    color: {{ $element['color'] ?? '#000000' }};
                                                    text-align: {{ $element['textAlign'] ?? 'center' }};
                                                    transform: rotate({{ $element['filters']['rotate'] ?? 0 }}deg) scale({{ $element['filters']['scale'] ?? 1 }});
                                                    opacity: {{ ($element['filters']['opacity'] ?? 100) / 100 }};
                                                 ">
                                                {!! nl2br(e($element['content'])) !!}
                                            </div>
                                        @endif
                                    @endforeach
                                @endif
                            </div>
                        @endforeach
                    @endif
                </div>
            @endif
        </div>
    @endforeach
</body>
</html>
