/**
 * Sistema de Tracking para Ecommerce
 * Implementa automáticamente los eventos de tracking en el frontend
 */

class EcommerceTracker {
    constructor() {
        this.init();
    }

    init() {
        // Auto-track page views (ya se hace automáticamente con los píxeles)
        console.log('📊 Ecommerce Tracker inicializado');
        
        // Configurar listeners para eventos comunes
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Track clicks en botones "Agregar al carrito"
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart-btn, [data-action="add-to-cart"]')) {
                this.handleAddToCartClick(e);
            }
            
            if (e.target.matches('.initiate-checkout-btn, [data-action="checkout"]')) {
                this.handleInitiateCheckout(e);
            }
        });
    }

    /**
     * Track Add to Cart event
     */
    async trackAddToCart(productId, quantity = 1, productData = {}) {
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
                // Ejecutar scripts de tracking
                this.executeTrackingScripts(result.tracking_scripts);
                console.log('✅ AddToCart tracked successfully');
            }
        } catch (error) {
            console.error('❌ Error tracking AddToCart:', error);
        }
    }

    /**
     * Track Initiate Checkout event
     */
    async trackInitiateCheckout(cartItems) {
        try {
            const response = await fetch('/api/tracking/initiate-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({
                    cart_items: cartItems
                })
            });

            const result = await response.json();
            
            if (result.success && result.tracking_scripts) {
                this.executeTrackingScripts(result.tracking_scripts);
                console.log('✅ InitiateCheckout tracked successfully');
            }
        } catch (error) {
            console.error('❌ Error tracking InitiateCheckout:', error);
        }
    }

    /**
     * Track Purchase (llamar en página de éxito)
     */
    async trackPurchase(orderId) {
        try {
            const response = await fetch(`/api/tracking/purchase/${orderId}`);
            const scripts = await response.text();
            
            if (scripts) {
                this.executeTrackingScripts(scripts);
                console.log('✅ Purchase tracked successfully');
            }
        } catch (error) {
            console.error('❌ Error tracking Purchase:', error);
        }
    }

    /**
     * Track Product View (llamar en páginas de producto)
     */
    trackProductView(productId, productData = {}) {
        // Facebook Pixel ViewContent
        if (typeof fbq !== 'undefined') {
            fbq('track', 'ViewContent', {
                content_ids: [productId],
                content_type: 'product',
                content_name: productData.name || '',
                value: productData.price || 0,
                currency: 'PEN'
            });
        }

        // Google Analytics view_item
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_item', {
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
        if (typeof ttq !== 'undefined') {
            ttq.track('ViewContent', {
                content_id: productId,
                content_type: 'product',
                content_name: productData.name || '',
                value: productData.price || 0,
                currency: 'PEN'
            });
        }

        console.log('✅ ProductView tracked for product:', productId);
    }

    /**
     * Track Search events
     */
    trackSearch(searchTerm, resultsCount = 0) {
        // Facebook Pixel Search
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Search', {
                search_string: searchTerm,
                content_type: 'product'
            });
        }

        // Google Analytics search
        if (typeof gtag !== 'undefined') {
            gtag('event', 'search', {
                search_term: searchTerm,
                results_count: resultsCount
            });
        }

        console.log('✅ Search tracked:', searchTerm);
    }

    /**
     * Handle Add to Cart button clicks
     */
    handleAddToCartClick(event) {
        const button = event.target;
        const productId = button.dataset.productId || button.closest('[data-product-id]')?.dataset.productId;
        const quantity = button.dataset.quantity || 1;
        
        if (productId) {
            this.trackAddToCart(productId, quantity);
        }
    }

    /**
     * Handle Initiate Checkout button clicks
     */
    handleInitiateCheckout(event) {
        // Obtener items del carrito desde localStorage, sessionStorage o API
        const cartItems = this.getCartItems();
        if (cartItems.length > 0) {
            this.trackInitiateCheckout(cartItems);
        }
    }

    /**
     * Get cart items (implementar según tu sistema de carrito)
     */
    getCartItems() {
        // Ejemplo: obtener del localStorage
        try {
            return JSON.parse(localStorage.getItem('cart_items') || '[]');
        } catch (error) {
            return [];
        }
    }

    /**
     * Execute tracking scripts dynamically
     */
    executeTrackingScripts(scripts) {
        const scriptElement = document.createElement('div');
        scriptElement.innerHTML = scripts;
        
        const scriptTags = scriptElement.querySelectorAll('script');
        scriptTags.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.head.appendChild(newScript);
            document.head.removeChild(newScript);
        });
    }
}

// Inicializar el tracker automáticamente
document.addEventListener('DOMContentLoaded', () => {
    window.ecommerceTracker = new EcommerceTracker();
});

// Funciones globales para uso fácil
window.trackAddToCart = (productId, quantity, productData) => {
    window.ecommerceTracker?.trackAddToCart(productId, quantity, productData);
};

window.trackProductView = (productId, productData) => {
    window.ecommerceTracker?.trackProductView(productId, productData);
};

window.trackSearch = (searchTerm, resultsCount) => {
    window.ecommerceTracker?.trackSearch(searchTerm, resultsCount);
};

window.trackPurchase = (orderId) => {
    window.ecommerceTracker?.trackPurchase(orderId);
};

// Ejemplos de uso:
/*

// En página de producto:
trackProductView('123', {
    name: 'Producto Ejemplo',
    price: 99.99,
    category: 'Electrónicos'
});

// En botón agregar al carrito:
<button onclick="trackAddToCart('123', 1)" class="add-to-cart-btn">
    Agregar al Carrito
</button>

// O usando data attributes:
<button data-action="add-to-cart" data-product-id="123" data-quantity="1">
    Agregar al Carrito
</button>

// En página de búsqueda:
trackSearch('laptop', 25);

// En página de éxito de compra:
trackPurchase('ORDER-123');

*/
