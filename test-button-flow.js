// Script de prueba para depurar el flujo del botón "Comprar ahora"
// Este script puede ejecutarse en la consola del navegador

function testButtonFlow() {
    console.log('🧪 === INICIO PRUEBA FLUJO BOTÓN ===');
    
    // Verificar estado inicial
    console.log('🔍 Verificando estado inicial...');
    console.log('Global.APP_URL:', window.Global?.APP_URL);
    console.log('localStorage carrito:', localStorage.getItem(`${window.Global?.APP_CORRELATIVE || 'bananalab'}_cart`));
    
    // Simular timeout
    console.log('⏱️ Simulando timeout...');
    setTimeout(() => {
        console.log('✅ Timeout completado');
        
        // Verificar redirección
        const cartUrl = `${window.Global.APP_URL}/cart`;
        console.log('🔄 URL de redirección:', cartUrl);
        
        // Simular redirección (comentar para no redirigir realmente)
        // window.location.href = cartUrl;
        
        console.log('🧪 === FIN PRUEBA FLUJO BOTÓN ===');
    }, 1000);
}

function checkCartState() {
    console.log('🔍 === VERIFICANDO ESTADO DEL CARRITO ===');
    
    const cartKey = `${window.Global?.APP_CORRELATIVE || 'bananalab'}_cart`;
    console.log('🔑 Clave del carrito:', cartKey);
    
    const cart = localStorage.getItem(cartKey);
    console.log('📦 Carrito raw:', cart);
    
    if (cart) {
        try {
            const parsedCart = JSON.parse(cart);
            console.log('📋 Carrito parseado:', parsedCart);
            console.log('📊 Número de items:', parsedCart.length);
            
            if (parsedCart.length > 0) {
                console.log('🎯 Último item:', parsedCart[parsedCart.length - 1]);
            }
        } catch (e) {
            console.error('❌ Error parseando carrito:', e);
        }
    } else {
        console.log('❌ No hay carrito en localStorage');
    }
    
    console.log('🔍 === FIN VERIFICACIÓN CARRITO ===');
}

function clearProcessingState() {
    console.log('🧹 === LIMPIANDO ESTADO DE PROCESAMIENTO ===');
    
    // Si hay un componente React accesible, intentar limpiar su estado
    // Esto debe ejecutarse desde la consola cuando el modal esté abierto
    
    console.log('ℹ️ Para limpiar el estado del botón, ejecute este código:');
    console.log('React Component State Reset needed...');
    
    console.log('🧹 === FIN LIMPIEZA ===');
}

// Funciones disponibles para usar en la consola:
window.debugButtonFlow = {
    testButtonFlow,
    checkCartState,
    clearProcessingState
};

console.log('🧪 Debug functions loaded. Use:');
console.log('- window.debugButtonFlow.testButtonFlow()');
console.log('- window.debugButtonFlow.checkCartState()');
console.log('- window.debugButtonFlow.clearProcessingState()');
