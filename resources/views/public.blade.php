@php
    $component = Route::currentRouteName();
@endphp

<!DOCTYPE html>
<html lang="es">

<head>
    @viteReactRefresh
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $data['name'] ?? 'Página' }} | {{ env('APP_NAME', 'xcleretor') }}</title>

    <link rel="shortcut icon" href="/assets/resources/icon.png?v={{ uniqid() }}" type="image/png">
    <meta name="description" content="xcleretor">
    @isset($data['description'])
        <meta name="description" content="{{ $data['description'] }}">
    @endisset
    @isset($data['keywords'])
        <meta name="keywords" content="{{ implode(', ', $data['keywords']) }}">
    @endisset

    <meta name="author" content="Powered by Mundo Web">

    <!-- Carga diferida de select2 CSS -->
    <link rel="preload" href="/lte/assets/libs/select2/css/select2.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/lte/assets/libs/select2/css/select2.min.css"></noscript>
    
    <!-- Carga diferida de icons CSS -->
    <link rel="preload" href="/lte/assets/css/icons.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/lte/assets/css/icons.min.css"></noscript>
    

    <link rel="preload" href='https://fonts.googleapis.com/css?family=Poppins' as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href='https://fonts.googleapis.com/css?family=Poppins'></noscript>
    
    
    <!-- Carga diferida de Tailwind CSS -->
    <link rel="preload" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"></noscript>
    
    <script src="https://cdn.tailwindcss.com" defer></script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap" rel="stylesheet">
    
    @php
        $pixelScripts = App\Helpers\PixelHelper::getPixelScripts();
    @endphp
    
    {!! $pixelScripts['head'] !!}

    @if ($data['fonts']['title']['url'] && $data['fonts']['title']['source'] !== 'true')
        <link rel="stylesheet" href="{{ $data['fonts']['title']['url'] }}">
    @endif

    @if ($data['fonts']['paragraph']['url'] && $data['fonts']['paragraph']['source'] !== 'true')
        <link rel="stylesheet" href="{{ $data['fonts']['paragraph']['url'] }}">
    @endif

    @vite(['resources/css/app.css', 'resources/js/' . Route::currentRouteName()])
    @inertiaHead

    @if ($component == 'BlogArticle.jsx')
        <link href="/lte/assets/libs/quill/quill.snow.css" rel="stylesheet" type="text/css" />
        <link href="/lte/assets/libs/quill/quill.bubble.css" rel="stylesheet" type="text/css" />
        <style>
            .ql-editor blockquote {
                border-left: 4px solid #f8b62c;
                padding-left: 16px;
            }

            .ql-editor * {
                /* color: #475569; */
            }

            .ql-editor img {
                border-radius: 8px;
            }
        </style>
    @endif
    <style>
        body {
            /* background-image: url('/assets/img/maqueta/home-mobile.png');*/
            width: 100%;
            height: auto;
            background-size: 100% auto;
            background-repeat: no-repeat;
            /* Asegura que la imagen no se repita */
            background-position: top center;
            /* Centra la imagen en la parte superior */
        }
    </style>

    @if ($data['fonts']['title']['url'] && $data['fonts']['title']['source'] == 'true')
        <style>
            @font-face {
                font-family: "{{ $data['fonts']['title']['name'] }}";
                src: url('{{ $data['fonts']['title']['url'] }}') format('woff2');
            }
        </style>
    @endif
    @if ($data['fonts']['title']['name'])
        <style>
            .font-title {
                font-family: "{{ $data['fonts']['title']['name'] }}", sans-serif;
            }
        </style>
    @endif
    @if ($data['fonts']['paragraph']['url'] && $data['fonts']['paragraph']['source'] == 'true')
        <style>
            @font-face {
                font-family: "{{ $data['fonts']['paragraph']['name'] }}";
                src: url('{{ $data['fonts']['paragraph']['url'] }}') format('woff2');
            }
        </style>
    @endif
    @if ($data['fonts']['paragraph']['name'])
        <style>
            * {
                font-family: "{{ $data['fonts']['paragraph']['name'] }}", sans-serif;
            }
        </style>
    @endif
    @foreach ($data['colors'] as $color)
        <style>
            .stroke-{{ $color->name }} {
                stroke: {{ $color->description }};
            }

            .background-{{ $color->name }} {
                background-color: {{ $color->description }};
            }

            .bg-{{ $color->name }} {
                background-color: {{ $color->description }};
            }

            .customtext-{{ $color->name }} {
                color: {{ $color->description }};
            }

            /* Variantes de hover */
            .hover\:customtext-{{ $color->name }}:hover {
                color: {{ $color->description }};
            }

            .hover\:bg-{{ $color->name }}:hover {
                background-color: {{ $color->description }};

            }

            .placeholder\:customtext-{{ $color->name }}::placeholder {
                color: {{ $color->description }};
            }
            .active\:bg-{{ $color->name }}:active {
                background-color: {{ $color->description }};
            }
            .active\:customtext-{{ $color->name }}:active {
                color: {{ $color->description }};
            }
            .active\:border-{{ $color->name }}:active {
                border-color: {{ $color->description }};
            }

            .border-{{ $color->name }} {
                border-color: {{ $color->description }};
            }

            .fill-{{ $color->name }} {
                fill: {{ $color->description }};
            }

            .before\:.bg-{{ $color->name }} {
                background-color: {{ $color->description }};
            }

            .lg\:.bg-{{ $color->name }} {
                background-color: {{ $color->description }};
            }
        </style>
    @endforeach

    <style>
        .font-emoji {
            font-family: "Noto Color Emoji", sans-serif;
        }

        .select2-container--default .select2-selection--single .select2-selection__arrow {
            top: 50%;
            transform: translateY(-50%);
        }
    </style>
    
</head>

<body class="font-general">
    @php
        $pixelScripts = App\Helpers\PixelHelper::getPixelScripts();
    @endphp
    
    {!! $pixelScripts['body'] !!}

    @inertia

    {{-- <div id="page-loader" class="fixed inset-0 flex flex-col justify-center items-center bg-white/90 backdrop-blur-sm z-50">

        <div class="animate-bounce">
            <img

                src='/assets/resources/logo.png?v={{uniqid()}}'
                alt={Global.APP_NAME}
                onError="(e) => { e.target.onerror = null; e.target.src = '/assets/img/logo-bk.svg';}"

                class=" w-64 lg:w-96 transition-all duration-300 transform hover:scale-105"
            />
        </div>
    </div> --}}

    <!-- Vendor js -->
    <script src="/lte/assets/js/vendor.min.js" defer></script>

    <!-- Culqi Checkout v4 -->
    <script src="https://checkout.culqi.com/js/v4"></script>

    <script src="/lte/assets/libs/select2/js/select2.full.min.js" defer></script>    <!-- App js -->
    <script src="https://cdn.jsdelivr.net/npm/flowbite@2.4.1/dist/flowbite.min.js" defer></script>
    <script src="/lte/assets/libs/moment/min/moment.min.js" defer></script>
    <script src="/lte/assets/libs/moment/moment-timezone.js" defer></script>
    <script src="/lte/assets/libs/moment/locale/es.js" defer></script>
    <script src="/lte/assets/libs/quill/quill.min.js" defer></script>
    
    <!-- Ecommerce Tracking System -->
    <script src="/assets/js/ecommerce-tracker.js" defer></script>
    <script>
        document.addEventListener('click', function(event) {
            const target = event.target;

            if (target.tagName === 'BUTTON' && target.hasAttribute('href')) {
                const href = target.getAttribute('href');

                if (target.getAttribute('target') === '_blank') {
                    window.open(href, '_blank');
                } else {
                    location.href = href;
                }
            }
        });
    </script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));
            
            if ('IntersectionObserver' in window) {
                let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            let lazyImage = entry.target;
                            lazyImage.src = lazyImage.dataset.src;
                            lazyImage.classList.remove('lazy');
                            lazyImageObserver.unobserve(lazyImage);
                        }
                    });
                });
                
                lazyImages.forEach(function(lazyImage) {
                    lazyImageObserver.observe(lazyImage);
                });
            }

            // document.body.removeChild(document.getElementById('page-loader'))
        });
    </script>

</body>

</html>
