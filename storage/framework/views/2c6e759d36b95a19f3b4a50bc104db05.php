<?php
    $component = Route::currentRouteName();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><?php echo e($data['name'] ?? 'Página'); ?> | <?php echo e(env('APP_NAME', 'Sala Fabulosa')); ?></title>

    <link rel="shortcut icon" href="/assets/resources/icon.png?v=<?php echo e(uniqid()); ?>" type="image/png">
    <meta name="description" content="Sala Fabulosa">
    <?php if(isset($data['description'])): ?>
        <meta name="description" content="<?php echo e($data['description']); ?>">
    <?php endif; ?>
    <?php if(isset($data['keywords'])): ?>
        <meta name="keywords" content="<?php echo e(implode(', ', $data['keywords'])); ?>">
    <?php endif; ?>

    <meta name="author" content="Powered by Manuel Gamboa">

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
    
    <?php
        $pixelScripts = App\Helpers\PixelHelper::getPixelScripts();
    ?>
    
    <?php echo $pixelScripts['head']; ?>


    <?php if($data['fonts']['title']['url'] && $data['fonts']['title']['source'] !== 'true'): ?>
        <link rel="stylesheet" href="<?php echo e($data['fonts']['title']['url']); ?>">
    <?php endif; ?>

    <?php if($data['fonts']['paragraph']['url'] && $data['fonts']['paragraph']['source'] !== 'true'): ?>
        <link rel="stylesheet" href="<?php echo e($data['fonts']['paragraph']['url']); ?>">
    <?php endif; ?>

    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/' . Route::currentRouteName()]); ?>
    <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->head; } ?>

    <?php if($component == 'BlogArticle.jsx'): ?>
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
    <?php endif; ?>
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

    <?php if($data['fonts']['title']['url'] && $data['fonts']['title']['source'] == 'true'): ?>
        <style>
            @font-face {
                font-family: "<?php echo e($data['fonts']['title']['name']); ?>";
                src: url('<?php echo e($data['fonts']['title']['url']); ?>') format('woff2');
            }
        </style>
    <?php endif; ?>
    <?php if($data['fonts']['title']['name']): ?>
        <style>
            .font-title {
                font-family: "<?php echo e($data['fonts']['title']['name']); ?>", sans-serif;
            }
        </style>
    <?php endif; ?>
    <?php if($data['fonts']['paragraph']['url'] && $data['fonts']['paragraph']['source'] == 'true'): ?>
        <style>
            @font-face {
                font-family: "<?php echo e($data['fonts']['paragraph']['name']); ?>";
                src: url('<?php echo e($data['fonts']['paragraph']['url']); ?>') format('woff2');
            }
        </style>
    <?php endif; ?>
    <?php if($data['fonts']['paragraph']['name']): ?>
        <style>
            * {
                font-family: "<?php echo e($data['fonts']['paragraph']['name']); ?>", sans-serif;
            }
        </style>
    <?php endif; ?>
    <?php $__currentLoopData = $data['colors']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $color): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <style>
            .bg-<?php echo e($color->name); ?> {
                background-color: <?php echo e($color->description); ?>;
            }

            .customtext-<?php echo e($color->name); ?> {
                color: <?php echo e($color->description); ?>;
            }

            /* Variantes de hover */
            .hover\:customtext-<?php echo e($color->name); ?>:hover {
                color: <?php echo e($color->description); ?>;
            }

            .hover\:bg-<?php echo e($color->name); ?>:hover {
                background-color: <?php echo e($color->description); ?>;

            }

            .placeholder\:customtext-<?php echo e($color->name); ?>::placeholder {
                color: <?php echo e($color->description); ?>;
            }
            .active\:bg-<?php echo e($color->name); ?>:active {
                background-color: <?php echo e($color->description); ?>;
            }
            .active\:customtext-<?php echo e($color->name); ?>:active {
                color: <?php echo e($color->description); ?>;
            }
            .active\:border-<?php echo e($color->name); ?>:active {
                border-color: <?php echo e($color->description); ?>;
            }

            .border-<?php echo e($color->name); ?> {
                border-color: <?php echo e($color->description); ?>;
            }

            .fill-<?php echo e($color->name); ?> {
                fill: <?php echo e($color->description); ?>;
            }

            .before\:.bg-<?php echo e($color->name); ?> {
                background-color: <?php echo e($color->description); ?>;
            }

            .lg\:.bg-<?php echo e($color->name); ?> {
                background-color: <?php echo e($color->description); ?>;
            }
        </style>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
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
    <?php
        $pixelScripts = App\Helpers\PixelHelper::getPixelScripts();
    ?>
    
    <?php echo $pixelScripts['body']; ?>


    <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->body; } else { ?><div id="app" data-page="<?php echo e(json_encode($page)); ?>"></div><?php } ?>

    <!-- Vendor js -->
    <script src="/lte/assets/js/vendor.min.js" defer></script>

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
        });
    </script>

</body>

</html>
<?php /**PATH C:\xampp\htdocs\projects\stechperu_final\resources\views/public.blade.php ENDPATH**/ ?>