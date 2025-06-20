<?php
    $route = Route::currentRouteName();
    // $component = Router::components[$route];
    // $admintoInstance = isset($component['adminto-instance']) ? $component['adminto-instance'] : false;
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title>Panel | <?php echo e(env('APP_NAME', 'Base Template')); ?></title>
    <link rel="shortcut icon" href="/assets/resources/icon.png?v=<?php echo e(uniqid()); ?>" type="image/png">

    <meta name="csrf_token" content="<?php echo e(csrf_token()); ?>">

    <link href="/lte/assets/libs/mohithg-switchery/switchery.min.css" rel="stylesheet" type="text/css" />
    <link href="/lte/assets/libs/select2/css/select2.min.css" rel="stylesheet" type="text/css" />

    
    <link href="/lte/assets/libs/quill/quill.snow.css" rel="stylesheet" type="text/css" />
    <link href="/lte/assets/libs/quill/quill.bubble.css" rel="stylesheet" type="text/css" />

    <script src="/lte/assets/libs/exceljs/exceljs.min.js"></script>
    <script src="/lte/assets/libs/filesaver/FileSaver.min.js"></script>
    <script src="/lte/assets/libs/jszip//jszip.min.js"></script>

    
    <link href="/lte/assets/libs/dxdatagrid/css/dx.light.compact.css?v=06d3ebc8-645c-4d80-a600-c9652743c425"
        rel="stylesheet" type="text/css" id="dg-default-stylesheet" />
    <link href="/lte/assets/libs/dxdatagrid/css/dx.dark.compact.css?v=06d3ebc8-645c-4d80-a600-c9652743c425"
        rel="stylesheet" type="text/css" id="dg-dark-stylesheet" disabled="disabled" />

    <?php if($route == 'Admin/Gallery.jsx'): ?>
        <link href="/lte/assets/libs/magnific-popup/magnific-popup.css" rel="stylesheet" type="text/css" />
    <?php elseif($route == 'Admin/System.jsx'): ?>
        <link rel="stylesheet" href="/lte/assets/libs/codemirror/codemirror.min.css">
        <link rel="stylesheet" href="/lte/assets/libs/codemirror/themes/sode.css">
    <?php endif; ?>

    
    <link href="/lte/assets/css/config/default/bootstrap.min.css" rel="stylesheet" type="text/css"
        id="bs-default-stylesheet" />
    <link href="/lte/assets/css/config/default/bootstrap-dark.min.css" rel="stylesheet" type="text/css"
        id="bs-dark-stylesheet" disabled="disabled" />

    
    <link href="/lte/assets/css/config/default/app.css" rel="stylesheet" type="text/css" id="app-default-stylesheet" />
    <link href="/lte/assets/css/config/default/app-dark.css" rel="stylesheet" type="text/css" id="app-dark-stylesheet"
        disabled="disabled" />

    
    <link href="/lte/assets/css/icons.min.css" rel="stylesheet" type="text/css" />

    <?php echo app('Illuminate\Foundation\Vite')('resources/js/' . $route); ?>
    <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->head; } ?>

    <style>
        .cursor-pointer {
            cursor: pointer;
        }

        .tippy-tooltip {
            padding: 0;
        }

        .dx-datagrid-content .dx-datagrid-table .dx-row>td {
            vertical-align: middle;
        }
    </style>
</head>

<body class="loading"
    data-layout='{"mode": "horizontal", "width": "fluid", "menuPosition": "fixed", "sidebar": { "color": "light", "size": "default", "showuser": true}, "topbar": {"color": "light"}, "showRightSidebarOnPageLoad": false}'>
    <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->body; } else { ?><div id="app" data-page="<?php echo e(json_encode($page)); ?>"></div><?php } ?>

    <div class="rightbar-overlay"></div>
    <script src="/lte/assets/libs/qrcodejs/qrcode.min.js"></script>
    <!-- Extends js -->
    <script src="/assets/js/file.extend.js"></script>
    <script src="/assets/js/storage.extend.js"></script>

    <!-- Vendor js -->
    <script src="/lte/assets/js/vendor.min.js"></script>

    <?php if($route == 'home'): ?>
        <script src="/lte/assets/libs/jquery-knob/jquery.knob.min.js"></script>
    <?php elseif($route == 'Admin/Gallery.jsx'): ?>
        <script src="/lte/assets/libs/isotope-layout/isotope.pkgd.min.js"></script>
        <script src="/lte/assets/libs/magnific-popup/jquery.magnific-popup.min.js"></script>
        <script src="/lte/assets/js/pages/gallery.init.js"></script>
    <?php elseif($route == 'Admin/System.jsx'): ?>
        <script src="/lte/assets/libs/jquery-ui/jquery-ui.min.js"></script>
        <script src="/lte/assets/libs/codemirror/codemirror.min.js"></script>
        <script src="/lte/assets/libs/codemirror/beautify-html.min.js"></script>
        <script src="/lte/assets/libs/codemirror/mode/xml/xml.min.js"></script>
        <script src="/lte/assets/libs/codemirror/mode/javascript/javascript.min.js"></script>
        <script src="/lte/assets/libs/codemirror/mode/css/css.min.js"></script>
        <script src="/lte/assets/libs/codemirror/mode/htmlmixed/htmlmixed.min.js"></script>
    <?php endif; ?>
    <script src="/lte/assets/libs/mohithg-switchery/switchery.min.js"></script>
    <script src="/lte/assets/libs/select2/js/select2.full.min.js"></script>
    <script src="/lte/assets/libs/tippy.js/tippy.all.min.js"></script>

    <!-- App js -->
    <script src="/lte/assets/js/app.js?v=<?php echo e(uniqid()); ?>"></script>

    <script src="/lte/assets/libs/dxdatagrid/js/dx.all.js"></script>
    <script src="/lte/assets/libs/dxdatagrid/js/localization/dx.messages.es.js"></script>
    <script src="/lte/assets/libs/dxdatagrid/js/localization/dx.messages.en.js"></script>
    <script src="/lte/assets/libs/moment/min/moment.min.js"></script>
    <script src="/lte/assets/libs/moment/moment-timezone.js"></script>
    <script src="/lte/assets/libs/moment/locale/es.js"></script>
    <script src="/lte/assets/libs/quill/quill.min.js"></script>
</body>

</html>
<?php /**PATH C:\laragon\www\xcleretor\resources\views/admin.blade.php ENDPATH**/ ?>