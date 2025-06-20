import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para tracking de ecommerce
 */
export const useEcommerceTracking = () => {
    const trackingRef = useRef({
        hasTrackedPageView: false,
        hasTrackedInitiateCheckout: false
    });

    /**
     * Track vista de producto
     */
    const trackProductView = (productId, productData = {}) => {
        if (typeof window === 'undefined') return;

        // Facebook Pixel ViewContent
        if (typeof window.fbq !== 'undefined') {
            window.fbq('track', 'ViewContent', {
                content_ids: [productId],
                content_type: 'product',
                content_name: productData.name || '',
                value: productData.price || 0,
                currency: 'PEN'
            });
        }

        // Google Analytics view_item
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'view_item', {
                currency: 'PEN',
                value: productData.price || 0,
                items: [{
                    item_id: productId,
                    item_name: productData.name || '',
                    category: productData.category || '',
                    price: productData.price || 0
                }]
            });
        }

        // TikTok Pixel ViewContent
        if (typeof window.ttq !== 'undefined') {
            window.ttq.track('ViewContent', {
                content_id: productId,
                content_type: 'product',
                content_name: productData.name || '',
                value: productData.price || 0,
                currency: 'PEN'
            });
        }

        console.log('✅ ProductView tracked for product:', productId);
    };

    /**
     * Track agregar al carrito
     */
    const trackAddToCart = async (productId, quantity = 1, productData = {}) => {
        if (typeof window === 'undefined') return;

        try {
            const response = await fetch('/api/tracking/add-to-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity,
                    ...productData
                })
            });

            const result = await response.json();
            
            if (result.success && result.tracking_scripts) {
                executeTrackingScripts(result.tracking_scripts);
                console.log('✅ AddToCart tracked successfully');
            }
        } catch (error) {
            console.error('❌ Error tracking AddToCart:', error);
        }
    };

    /**
     * Track iniciar checkout
     */
    const trackInitiateCheckout = async (cartItems, totalValue) => {
        if (typeof window === 'undefined' || trackingRef.current.hasTrackedInitiateCheckout) return;

        try {
            // Marcar como ya trackeado para evitar duplicados
            trackingRef.current.hasTrackedInitiateCheckout = true;

            const response = await fetch('/api/tracking/initiate-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({
                    cart_items: cartItems.map(item => ({
                        product_id: item.id,
                        name: item.name,
                        price: item.final_price || item.price,
                        quantity: item.quantity,
                        subtotal: (item.final_price || item.price) * item.quantity
                    }))
                })
            });

            const result = await response.json();
            
            if (result.success && result.tracking_scripts) {
                executeTrackingScripts(result.tracking_scripts);
                console.log('✅ InitiateCheckout tracked successfully');
            }
        } catch (error) {
            console.error('❌ Error tracking InitiateCheckout:', error);
            // Reset para permitir reintento
            trackingRef.current.hasTrackedInitiateCheckout = false;
        }
    };

    /**
     * Track compra completada
     */
    const trackPurchase = (orderId, conversionScripts) => {
        if (typeof window === 'undefined') return;

        if (conversionScripts) {
            // Usar scripts del servidor
            executeTrackingScripts(conversionScripts);
        } else {
            // Fallback: obtener scripts del API
            fetch(`/api/tracking/purchase/${orderId}`)
                .then(response => response.text())
                .then(scripts => {
                    if (scripts) {
                        executeTrackingScripts(scripts);
                        console.log('✅ Purchase tracked successfully');
                    }
                })
                .catch(error => {
                    console.error('❌ Error tracking Purchase:', error);
                });
        }
    };

    /**
     * Track vista de página del checkout
     */
    const trackCheckoutPageView = (step, cartItems = []) => {
        if (typeof window === 'undefined' || trackingRef.current.hasTrackedPageView) return;

        trackingRef.current.hasTrackedPageView = true;

        const totalValue = cartItems.reduce((sum, item) => 
            sum + (item.final_price || item.price) * item.quantity, 0
        );

        // Facebook Pixel PageView específico del checkout
        if (typeof window.fbq !== 'undefined') {
            window.fbq('track', 'PageView');
            
            // Track AddToCart si están viendo el carrito con items
            if (step === 1 && cartItems.length > 0) {
                window.fbq('track', 'AddToCart', {
                    content_ids: cartItems.map(item => item.id),
                    content_type: 'product',
                    value: totalValue,
                    currency: 'PEN',
                    num_items: cartItems.length
                });
            }
        }

        // Google Analytics Enhanced Ecommerce
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'page_view', {
                page_title: `Checkout - Paso ${step}`,
                page_location: window.location.href
            });

            if (step === 1 && cartItems.length > 0) {
                window.gtag('event', 'view_cart', {
                    currency: 'PEN',
                    value: totalValue,
                    items: cartItems.map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        category: item.category?.name || 'Sin categoría',
                        quantity: item.quantity,
                        price: item.final_price || item.price
                    }))
                });
            }
        }

        console.log(`✅ Checkout PageView tracked - Step ${step}`);
    };

    /**
     * Ejecutar scripts de tracking dinámicamente
     */
    const executeTrackingScripts = (scripts) => {
        if (typeof window === 'undefined' || !scripts) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = scripts;
        
        const scriptTags = tempDiv.querySelectorAll('script');
        scriptTags.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.head.appendChild(newScript);
            // Remover inmediatamente para limpiar
            setTimeout(() => {
                if (newScript.parentNode) {
                    newScript.parentNode.removeChild(newScript);
                }
            }, 100);
        });
    };

    /**
     * Reset del tracking (útil para navegación SPA)
     */
    const resetTracking = () => {
        trackingRef.current = {
            hasTrackedPageView: false,
            hasTrackedInitiateCheckout: false
        };
    };

    return {
        trackProductView,
        trackAddToCart,
        trackInitiateCheckout,
        trackPurchase,
        trackCheckoutPageView,
        resetTracking
    };
};

export default useEcommerceTracking;
