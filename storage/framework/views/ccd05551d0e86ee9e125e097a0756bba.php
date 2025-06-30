

<?php $__env->startSection('title', 'Tiendas / Sucursales'); ?>

<?php $__env->startSection('content'); ?>
    <div id="stores-admin"></div>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('scripts'); ?>
    <?php echo app('Illuminate\Foundation\Vite')('resources/js/Admin/Stores.jsx'); ?>
    <script>
        const ubigeos = <?php echo json_encode($ubigeos, 15, 512) ?>;
        $(function() {
            ReactAppend('stores-admin', 'Stores', { ubigeos });
        });
    </script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\xampp\htdocs\projects\stechperu_final\resources\views/Admin/Stores.blade.php ENDPATH**/ ?>