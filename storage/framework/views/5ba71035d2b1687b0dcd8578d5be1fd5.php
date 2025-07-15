<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($project->name ?? 'Proyecto'); ?> - PDF</title>
    <style>
        /* 🖨️ CONFIGURACIÓN DE PÁGINA PARA IMPRESIÓN PROFESIONAL */
        @page {
            margin: 0; /* Sin márgenes para usar toda la página */
            size: <?php echo e($config['width']); ?>cm <?php echo e($config['height']); ?>cm;
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
            width: <?php echo e($config['width']); ?>cm;
            height: <?php echo e($config['height']); ?>cm;
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
            width:max-content !important;
            max-width: max-content !important;
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
            width:max-content !important;
            max-width:max-content !important;
            margin: 0;
            padding: 4px; /* Pequeño padding para separar del borde */
           
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
    <?php if(isset($pages) && count($pages) > 0): ?>
        <?php $__currentLoopData = $pages; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $pageIndex => $page): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <div class="page" 
                 style="background-color: <?php echo e($page['backgroundColor'] ?? '#FFFFFF'); ?>;">
                
                
                <?php if(!empty($page['backgroundImage'])): ?>
                    <img src="<?php echo e($page['backgroundImage']); ?>" 
                         class="page-background" 
                         alt="Fondo de página <?php echo e($pageIndex + 1); ?>"
                         style="object-fit: cover;">
                <?php endif; ?>
                
                
                <div class="elements-container">
                    <?php if(isset($page['cells']) && count($page['cells']) > 0): ?>
                        <?php $__currentLoopData = $page['cells']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $cell): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <?php if(isset($cell['elements']) && count($cell['elements']) > 0): ?>
                                <?php $__currentLoopData = $cell['elements']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $element): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <div class="element"
                                         style="left: <?php echo e($element['position']['x']); ?>%; 
                                                top: <?php echo e($element['position']['y']); ?>%; 
                                                width: <?php echo e($element['size']['width']); ?>%; 
                                                height: <?php echo e($element['size']['height']); ?>%; 
                                                z-index: <?php echo e($element['zIndex'] ?? 1); ?>;">
                                        
                                        <?php if($element['type'] === 'text'): ?>
                                            
                                           
                                            <span class="text-content"
                                                 style="color: <?php echo e($element['style']['color'] ?? '#000000'); ?>; 
                                                        font-size: <?php echo e($element['style']['fontSize'] ?? '16px'); ?>; 
                                                    
                                                        font-weight: <?php echo e($element['style']['fontWeight'] ?? 'normal'); ?>; 
                                                        font-family: <?php echo e($element['style']['fontFamily'] ?? 'sans-serif'); ?>; 
                                                       
                                                        line-height: <?php echo e($element['style']['lineHeight'] ?? '1.2'); ?>;
                                                        max-width: max-content !important;">
                                             <span ><?php echo e($element['content']); ?></span>
                                            </span>
                                            
                                        <?php elseif($element['type'] === 'image' && !empty($element['content'])): ?>
                                            
                                            <img src="<?php echo e($element['content']); ?>" 
                                                 alt="Imagen <?php echo e($loop->iteration); ?>"
                                                 style="object-fit: cover; image-rendering: high-quality;">
                                        <?php endif; ?>
                                    </div>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            <?php endif; ?>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    <?php else: ?>
        
        <div class="page" style="background-color: #FFFFFF;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <h1 style="color: #666; font-size: 24px; margin: 0;">Proyecto sin contenido</h1>
                <p style="color: #999; font-size: 16px; margin: 10px 0 0 0;">
                    Este proyecto no tiene páginas o elementos para mostrar en el PDF.
                </p>
            </div>
        </div>
    <?php endif; ?>
</body>
</html>
<?php /**PATH C:\xampp\htdocs\projects\bananalab_app\resources\views/pdf/project-enhanced.blade.php ENDPATH**/ ?>