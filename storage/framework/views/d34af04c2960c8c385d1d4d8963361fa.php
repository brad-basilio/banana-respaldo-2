<!DOCTYPE html>
<html lang="es">

<head>
    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Próximamente | <?php echo e(env('APP_NAME')); ?></title>
    <link rel="shortcut icon" href="/assets/resources/icon.png" type="image/png">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes fadeIn {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        @keyframes slideUp {
            from {
                transform: translateY(30px);
                opacity: 0;
            }

            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @keyframes pulse {

            0%,
            100% {
                transform: scale(1);
                opacity: 0.3;
            }

            50% {
                transform: scale(1.05);
                opacity: 0.5;
            }
        }

        .animate-fade-in {
            animation: fadeIn 1.5s ease-out forwards;
        }

        .animate-slide-up {
            opacity: 0;
            animation: slideUp 1s ease-out forwards;
        }

        .animate-pulse-slow {
            animation: pulse 6s infinite ease-in-out;
        }

        .delay-100 {
            animation-delay: 100ms;
        }

        .delay-300 {
            animation-delay: 300ms;
        }

        .delay-500 {
            animation-delay: 500ms;
        }
    </style>
</head>

<body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
    <div class="fixed inset-0 -z-10 flex items-center justify-center overflow-hidden pointer-events-none">
        <div class="absolute h-[400px] w-[400px] rounded-full bg-indigo-100 animate-pulse-slow"></div>
    </div>
    <div class="text-center max-w-md mx-auto">
        <a href="/login"
            class="mx-auto h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center mb-12 animate-fade-in">
            <span class="text-xl font-bold text-indigo-600"><?php echo e(substr(env('APP_NAME'), 0, 1)); ?></span>
        </a>
        <h1 class="text-4xl font-bold tracking-tight text-gray-900 mb-4 animate-slide-up delay-100">
            Próximamente
        </h1>
        <p class="text-gray-500 animate-slide-up delay-300">
            Estamos trabajando en algo increíble. Mantente atento a las actualizaciones.
        </p>
        <div class="mt-8 mx-auto w-16 h-1 bg-indigo-200 rounded animate-slide-up delay-500"></div>
    </div>
</body>

</html>
<?php /**PATH C:\xampp\htdocs\builder\resources\views/coming-soon.blade.php ENDPATH**/ ?>