import axios from 'axios';

const API_BASE_URL = '/api';

/**
 * Discount Rules API Service
 */
export default class DiscountRulesRest {
    /**
     * Apply discount rules to a cart
     * @param {Array} cartItems - Array of cart items
     * @param {number} totalAmount - Total amount of the cart
     * @param {string} customerEmail - Customer email (optional)
     * @returns {Promise} API response
     */    static async applyToCart(cartItems, totalAmount, customerEmail = null) {
        try {
            // Debug: Log datos de entrada
            console.log('🛒 Applying discount rules to cart:', {
                cartItems,
                totalAmount,
                customerEmail
            });

            // Validar que tenemos datos válidos
            if (!Array.isArray(cartItems) || cartItems.length === 0) {
                return {
                    success: false,
                    error: 'Carrito vacío o inválido',
                    data: null
                };
            }            const payload = {
                cart_items: cartItems.map(item => {
                    const cartItem = {
                        item_id: String(item.item_id || item.id || ''), // Keep as string for UUID
                        quantity: parseInt(item.quantity) || 1,
                        price: parseFloat(item.price || item.final_price || 0),
                        name: String(item.name || item.description || 'Producto sin nombre'),
                        category_id: item.category_id ? String(item.category_id) : null // Keep as string for UUID
                    };
                    
                    // Debug: Log cada item procesado
                    console.log('📦 Processing cart item:', cartItem);
                    
                    return cartItem;
                }),
                total_amount: parseFloat(totalAmount) || 0,
                customer_email: customerEmail || null
            };

            // Debug: Log payload final
            console.log('📤 Sending payload to API:', payload);

            const response = await axios.post(`${API_BASE_URL}/discount-rules/apply-to-cart`, payload);
            
            if (response.data.status === 200) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }
            
            return {
                success: false,
                error: response.data.message || 'Error al aplicar descuentos',
                data: null
            };
            
        } catch (error) {
            console.error('Error applying discount rules:', error);
            
            if (error.response?.data) {
                return {
                    success: false,
                    error: error.response.data.message || 'Error del servidor',
                    data: error.response.data.data || null
                };
            }
            
            return {
                success: false,
                error: 'Error de conexión',
                data: null
            };
        }
    }    /**
     * Format discount information for display
     * @param {Array} appliedDiscounts - Array of applied discounts
     * @returns {Array} Formatted discount information
     */
    static formatDiscounts(appliedDiscounts) {
        if (!appliedDiscounts || !Array.isArray(appliedDiscounts)) {
            return [];
        }

        return appliedDiscounts.map(discount => ({
            id: discount.rule_id,
            name: discount.rule_name || 'Descuento automático',
            description: discount.description || '',
            amount: parseFloat(discount.discount_amount || 0),
            type: discount.discount_type || 'fixed',
            promotion_type: discount.promotion_type || null,
            free_items: discount.free_items || [],
            formatted_amount: discount.discount_type === 'percentage' 
                ? `${discount.discount_amount}%` 
                : `S/ ${parseFloat(discount.discount_amount || 0).toFixed(2)}`
        }));
    }

    /**
     * Get all free items from applied discounts
     * @param {Array} appliedDiscounts - Array of applied discounts
     * @returns {Array} Array of free items
     */
    static getFreeItems(appliedDiscounts) {
        if (!appliedDiscounts || !Array.isArray(appliedDiscounts)) {
            return [];
        }

        const freeItems = [];
        appliedDiscounts.forEach(discount => {
            if (discount.free_items && Array.isArray(discount.free_items)) {
                freeItems.push(...discount.free_items);
            }
        });

        return freeItems;
    }

    /**
     * Calculate total discount amount
     * @param {Array} appliedDiscounts - Array of applied discounts
     * @returns {number} Total discount amount
     */
    static calculateTotalDiscount(appliedDiscounts) {
        if (!appliedDiscounts || !Array.isArray(appliedDiscounts)) {
            return 0;
        }

        return appliedDiscounts.reduce((total, discount) => {
            return total + parseFloat(discount.discount_amount || 0);
        }, 0);
    }
}
