<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project PDF</title>
    <style>
        @page {
            margin: 0; /* Sin márgenes para ocupar toda la página */
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
        }
        .page {
            page-break-after: always;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }
        .page:last-child {
            page-break-after: auto;
        }
        .element {
            position: absolute;
            box-sizing: border-box;
        }
        .element img {
            width: 100%;
            height: 100%;
            object-fit: cover; /* Asegura que la imagen cubra el contenedor */
        }
        .element p {
            margin: 0;
            padding: 8px; /* Añadir un poco de padding para que el texto no se pegue a los bordes */
            white-space: pre-wrap; /* Respetar saltos de línea y espacios */
            word-wrap: break-word; /* Romper palabras largas */
        }
    </style>
</head>
<body>
    @if(isset($pages) && count($pages) > 0)
        @foreach ($pages as $page)
            <div class="page"
                 style="background-color: {{ $page['backgroundColor'] ?? '#FFFFFF' }}; @if(!empty($page['backgroundImage'])) background-image: url('{{ $page['backgroundImage'] }}'); @endif">
                
                @if(isset($page['cells']))
                    @foreach ($page['cells'] as $cell)
                        @if(isset($cell['elements']))
                            @foreach ($cell['elements'] as $element)
                                <div class="element"
                                     style="left: {{ $element['position']['x'] }}%; top: {{ $element['position']['y'] }}%; width: {{ $element['size']['width'] }}%; height: {{ $element['size']['height'] }}%; z-index: {{ $element['zIndex'] ?? 1 }};">
                                    
                                    @if ($element['type'] === 'text')
                                        <p style="color: {{ $element['style']['color'] ?? '#000' }}; font-size: {{ $element['style']['fontSize'] ?? '16px' }}; text-align: {{ $element['style']['textAlign'] ?? 'left' }}; font-weight: {{ $element['style']['fontWeight'] ?? 'normal' }}; font-family: {{ $element['style']['fontFamily'] ?? 'sans-serif' }}; background-color: {{ $element['style']['backgroundColor'] ?? 'transparent' }};">
                                            {{ $element['content'] }}
                                        </p>
                                    @elseif ($element['type'] === 'image' && !empty($element['content']))
                                        <img src="{{ $element['content'] }}">
                                    @endif
                                </div>
                            @endforeach
                        @endif
                    @endforeach
                @endif
            </div>
        @endforeach
    @else
        <div class="page" style="background-color: #FFFFFF;">
            <p style="text-align: center; font-size: 24px; color: #333; padding-top: 40%;">El proyecto no tiene contenido para mostrar.</p>
        </div>
    @endif
</body>
</html>
