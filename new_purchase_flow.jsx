// NUEVO FLUJO CORRECTO: PDF PRIMERO, LUEGO CARRITO
const handlePurchase = async () => {
    if (isProcessing) return;

    // Establecer estado de procesamiento
    setIsProcessing(true);

    // Mostrar modal premium de preparación
    setAlbumPreparationModal({
        isOpen: true,
        message: "Iniciando proceso...",
        subMessage: "Estamos preparando tu álbum",
        progress: 0
    });

    try {
        // Verificar que tenemos datos del proyecto
        if (!projectData?.id) {
            console.error('❌ No hay datos del proyecto');
            setAlbumPreparationModal({ isOpen: false, message: "", subMessage: "", progress: 0 });
            alert('Error: No se encontró información del proyecto.');
            return;
        }

        // Verificar que la función addAlbumToCart esté disponible
        if (typeof addAlbumToCart !== 'function') {
            console.error('❌ addAlbumToCart no es una función');
            setAlbumPreparationModal({ isOpen: false, message: "", subMessage: "", progress: 0 });
            alert('Error: Función de carrito no disponible. Inténtelo nuevamente.');
            return;
        }

        // 🔧 PASO 1: GENERAR PDF PRIMERO y esperar confirmación del backend
        let pdfSuccess = false;
        if (!pdfGenerated && !pdfGenerationInProgress) {
            console.log('📄 [PURCHASE] PASO 1: Generando PDF para compra...');
            
            setAlbumPreparationModal({
                isOpen: true,
                message: "Preparando PDF del álbum...",
                subMessage: "Esto puede tardar unos segundos",
                progress: 30
            });

            pdfSuccess = await generatePDFSilently();
            console.log('📄 [PURCHASE] Resultado de generatePDFSilently:', pdfSuccess);
            
            if (!pdfSuccess) {
                console.error('❌ [PURCHASE] PDF no se pudo generar o subir correctamente');
                setAlbumPreparationModal({ isOpen: false, message: "", subMessage: "", progress: 0 });
                alert('Error: No se pudo generar el PDF del álbum. Por favor, inténtelo nuevamente.');
                return;
            }
            
            console.log('✅ [PURCHASE] PDF generado y subido exitosamente al servidor');
            setAlbumPreparationModal({
                isOpen: true,
                message: "PDF subido correctamente",
                subMessage: "Agregando al carrito...",
                progress: 60
            });
        } else {
            console.log('📄 [PURCHASE] PDF ya disponible, procediendo...');
            pdfSuccess = true;
            setAlbumPreparationModal({
                isOpen: true,
                message: "PDF disponible",
                subMessage: "Agregando al carrito...",
                progress: 60
            });
        }

        // 🔧 PASO 2: SOLO DESPUÉS DE CONFIRMACIÓN DEL BACKEND, agregar al carrito
        console.log('🛒 [CART] PASO 2: PDF confirmado en servidor, agregando al carrito...');
        const cartResult = addAlbumToCart();
        
        let addedToCart;
        if (cartResult && typeof cartResult.then === 'function') {
            console.log('🛒 [CART] addAlbumToCart es async, esperando resultado...');
            addedToCart = await cartResult;
        } else {
            console.log('🛒 [CART] addAlbumToCart es sync, resultado inmediato:', cartResult);
            addedToCart = cartResult;
        }

        if (!addedToCart) {
            console.error('❌ No se pudo agregar al carrito');
            setAlbumPreparationModal({ isOpen: false, message: "", subMessage: "", progress: 0 });
            alert('Error al agregar el álbum al carrito. El PDF se generó correctamente, pero hubo un problema con el carrito.');
            return;
        }

        console.log('✅ [PURCHASE] Álbum agregado exitosamente al carrito');
        
        // 🔧 PASO 3: SOLO DESPUÉS DE TODO LO ANTERIOR, redirigir
        setAlbumPreparationModal({
            isOpen: true,
            message: "¡Álbum agregado al carrito!",
            subMessage: "Redirigiendo automáticamente...",
            progress: 100
        });

        console.log('✅ [REDIRECT] Todo completado exitosamente, redirigiendo...');
        
        // Cerrar modal y redirigir
        setTimeout(() => {
            setAlbumPreparationModal({ isOpen: false, message: "", subMessage: "", progress: 0 });
            onRequestClose();
            window.location.href = '/cart';
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error en proceso de compra:', error);
        setAlbumPreparationModal({ isOpen: false, message: "", subMessage: "", progress: 0 });
        
        // Verificación de carrito y redirección de emergencia
        try {
            const cartKey = `${window.Global?.APP_CORRELATIVE || 'bananalab'}_cart`;
            const verifyCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
            if (verifyCart.length > 0) {
                console.log('✅ [RECOVERY] Producto encontrado en carrito, redirigiendo...');
                onRequestClose();
                setTimeout(() => {
                    window.location.href = '/cart';
                }, 500);
                return;
            }
        } catch (recoveryError) {
            console.error('❌ Error en recuperación:', recoveryError);
        }

        const userChoice = confirm(`Error: ${error.message}\n\n¿Desea intentar ir al carrito manualmente?`);
        if (userChoice) {
            window.location.href = '/cart';
        }
    } finally {
        setIsProcessing(false);
    }
};
