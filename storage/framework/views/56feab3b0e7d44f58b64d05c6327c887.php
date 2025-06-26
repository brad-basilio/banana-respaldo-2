<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Resumen de pedido</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0; color: #000;">
    <table align="center" cellpadding="0" cellspacing="0" width="100%"
        style="max-width: 600px; margin: auto; border-collapse: collapse;">
        <tr>
            <td style="padding: 30px 20px; text-align: center;">
                <p style="font-size: 16px; margin: 0;">Gracias por tu compra 🎉</p>
                <h1 style="font-size: 28px; margin: 10px 0; color: #3c1905;">Tu orden ha sido recibida</h1>
                <p style="font-size: 14px; margin: 0;">Código de pedido</p>
                <p style="font-weight: bold; font-size: 16px; margin: 5px 0;">#<?php echo e($sale->code); ?></p>
            </td>
        </tr>

        <!-- Productos -->
        <tr>
            <td style="padding: 20px; background-color: #f8f8f8; border-radius: 8px;">
                <?php $__currentLoopData = $sale->details; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $detail): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                        <tr>
                            <td width="70" style="vertical-align: top;">
                                <img src="/storage/images/item/<?php echo e($detail->image); ?>" alt="Producto"
                                    style="border-radius: 5px; width: 80px; height: 80px; object-fit: cover; object-position: center">
                            </td>
                            <td style="padding-left: 10px;">
                                <p style="margin: 0; font-weight: bold;"><?php echo e($detail->name); ?></p>
                                <p style="margin: 2px 0; font-size: 13px;">Color: <?php echo e($detail->colors); ?></p>
                                <p style="margin: 2px 0; font-size: 13px;">Cantidad: <?php echo e($detail->quantity); ?> - Precio:
                                    S/ <?php echo e(number_format($detail->price, 2)); ?></p>
                            </td>
                        </tr>
                    </table>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </td>
        </tr>

        <!-- Totales -->
        <tr>
            <td style="padding: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="text-align: left; font-size: 14px;">Subtotal</td>
                        <td style="text-align: right; font-size: 14px;">S/
                            <?php echo e(number_format($sale->total_amount * 0.82, 2)); ?></td>
                    </tr>
                    <tr>
                        <td style="text-align: left; font-size: 14px;">IGV</td>
                        <td style="text-align: right; font-size: 14px;">S/
                            <?php echo e(number_format($sale->total_amount * 0.18, 2)); ?></td>
                    </tr>
                    <tr>
                        <td style="text-align: left; font-size: 14px;">Envío</td>
                        <td style="text-align: right; font-size: 14px;">S/ <?php echo e(number_format($sale->delivery, 2)); ?></td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border-top: 1px solid #ddd; padding-top: 10px;"></td>
                    </tr>
                    <tr>
                        <td style="text-align: left; font-size: 16px; font-weight: bold;">Total</td>
                        <td style="text-align: right; font-size: 16px; font-weight: bold;">S/
                            <?php echo e(number_format($sale->total_amount, 2)); ?></td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Botón -->
        <tr>
            <td style="padding: 30px; text-align: center;">
                <a href="https://tusitio.com"
                    style="background-color: #3c1905; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">Seguir
                    Comprando</a>
            </td>
        </tr>
    </table>
</body>

</html>
<?php /**PATH C:\xampp\htdocs\salafabulosa\resources\views/emails/new-sale.blade.php ENDPATH**/ ?>