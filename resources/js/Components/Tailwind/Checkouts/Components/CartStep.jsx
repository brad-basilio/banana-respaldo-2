import React, { useState, useEffect } from 'react';
import Number2Currency from "../../../../Utils/Number2Currency.jsx";
import ButtonPrimary from "./ButtonPrimary";
import ButtonSecondary from "./ButtonSecondary";
import CardItem from "./CardItem";
import DiscountRulesRest from "../../../../Actions/DiscountRulesRest";
import FreeItemsDisplay from "./FreeItemsDisplay";
import PromotionSuggestion from "./PromotionSuggestion";
import PromotionModal from "./PromotionModal";

export default function CartStep({ 
    cart, 
    setCart, 
    onContinue, 
    subTotal, 
    envio, 
    igv, 
    totalFinal, 
    openModal,
    automaticDiscounts,
    setAutomaticDiscounts,
    automaticDiscountTotal,
    setAutomaticDiscountTotal,
    totalWithoutDiscounts
}) {
    const [appliedDiscounts, setAppliedDiscounts] = useState(automaticDiscounts || []);
    const [totalDiscount, setTotalDiscount] = useState(automaticDiscountTotal || 0);
    const [isLoadingDiscounts, setIsLoadingDiscounts] = useState(false);
    const [freeItems, setFreeItems] = useState([]);
    const [promotionSuggestions, setPromotionSuggestions] = useState([]);
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    const isCartEmpty = cart.length === 0;

    // Apply discount rules when cart changes
    useEffect(() => {
        if (cart.length > 0 && subTotal > 0) {
            applyDiscountRules();
        } else {
            // Reset discounts if cart is empty
            const emptyDiscounts = [];
            const zeroDiscount = 0;
            setAppliedDiscounts(emptyDiscounts);
            setTotalDiscount(zeroDiscount);
            setFreeItems([]);
            setPromotionSuggestions([]);
            if (setAutomaticDiscounts) setAutomaticDiscounts(emptyDiscounts);
            if (setAutomaticDiscountTotal) setAutomaticDiscountTotal(zeroDiscount);
        }
    }, [cart, subTotal]);

    const applyDiscountRules = async () => {
        setIsLoadingDiscounts(true);
        try {
            // Debug: Log información detallada del carrito antes de enviar
            const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            console.log('🛒 CartStep applying discounts:', {
                cart,
                subTotal,
                totalWithoutDiscounts,
                totalQuantity,
                cartLength: cart.length,
                cartItems: cart.map(item => ({
                    id: item.id || item.item_id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price || item.final_price,
                    category_id: item.category_id
                }))
            });
            
            const result = await DiscountRulesRest.applyToCart(cart, totalWithoutDiscounts);
            
            // Debug: Log respuesta completa del servidor
            console.log('📥 Server response:', {
                success: result.success,
                data: result.data,
                error: result.error,
                fullResult: result
            });
            
            if (result.success && result.data) {
                console.log('✅ Discounts found:', result.data.applied_discounts);
                const discounts = DiscountRulesRest.formatDiscounts(result.data.applied_discounts);
                const discountAmount = result.data.total_discount || 0;
                const freeItemsData = DiscountRulesRest.getFreeItems(result.data.applied_discounts);
                
                // Extract promotion suggestions from applied discounts
                const suggestions = [];
                result.data.applied_discounts.forEach(discount => {
                    if (discount.suggested_items && Array.isArray(discount.suggested_items)) {
                        suggestions.push(...discount.suggested_items);
                    }
                });
                
                setAppliedDiscounts(discounts);
                setTotalDiscount(discountAmount);
                setFreeItems(freeItemsData);
                setPromotionSuggestions(suggestions);
                
                // Update parent component state
                if (setAutomaticDiscounts) setAutomaticDiscounts(discounts);
                if (setAutomaticDiscountTotal) setAutomaticDiscountTotal(discountAmount);
            } else {
                console.error('❌ Discount application failed:', {
                    error: result.error,
                    success: result.success,
                    data: result.data,
                    fullResult: result
                });
                
                // No discounts applied or error
                const emptyDiscounts = [];
                const zeroDiscount = 0;
                setAppliedDiscounts(emptyDiscounts);
                setTotalDiscount(zeroDiscount);
                setFreeItems([]);
                setPromotionSuggestions([]);
                if (setAutomaticDiscounts) setAutomaticDiscounts(emptyDiscounts);
                if (setAutomaticDiscountTotal) setAutomaticDiscountTotal(zeroDiscount);
            }
        } catch (error) {
            console.error('Error applying discount rules:', error);
            const emptyDiscounts = [];
            const zeroDiscount = 0;
            setAppliedDiscounts(emptyDiscounts);
            setTotalDiscount(zeroDiscount);
            setFreeItems([]);
            setPromotionSuggestions([]);
            if (setAutomaticDiscounts) setAutomaticDiscounts(emptyDiscounts);
            if (setAutomaticDiscountTotal) setAutomaticDiscountTotal(zeroDiscount);
        } finally {
            setIsLoadingDiscounts(false);
        }
    };

    // Check if a product has available promotions
    const hasPromotionAvailable = (productId) => {
        return promotionSuggestions.some(suggestion => 
            suggestion.item_id === productId || 
            suggestion.triggering_item_id === productId
        );
    };

    // Get promotion for a specific product
    const getPromotionForProduct = (productId) => {
        return promotionSuggestions.find(suggestion => 
            suggestion.item_id === productId || 
            suggestion.triggering_item_id === productId
        );
    };

    // Handle promotion click
    const handlePromotionClick = (product) => {
        const promotion = getPromotionForProduct(product.id);
        if (promotion) {
            setSelectedPromotion(promotion);
            setSelectedProduct(product);
            setShowPromotionModal(true);
        }
    };

    // Handle adding promotional item from modal
    const handleAddPromotionalItem = async (suggestion) => {
        try {
            console.log('CartStep - handleAddPromotionalItem received:', suggestion);
            console.log('CartStep - current cart:', cart);
            
            // Buscar el item existente en el carrito y agregar la cantidad sugerida
            setCart(old => {
                console.log('CartStep - old cart before update:', old);
                const existingItemIndex = old.findIndex(item => 
                    (item.item_id || item.id) === suggestion.item_id
                );
                
                console.log('CartStep - existingItemIndex:', existingItemIndex);
                
                if (existingItemIndex !== -1) {
                    // Actualizar cantidad existente
                    const updatedCart = [...old];
                    const quantityToAdd = suggestion.quantity || suggestion.suggested_quantity || 1;
                    console.log('CartStep - adding quantity:', quantityToAdd);
                    updatedCart[existingItemIndex].quantity += quantityToAdd;
                    console.log('CartStep - updated cart:', updatedCart);
                    return updatedCart;
                } else {
                    console.log('CartStep - item not found, creating new product');
                    // Si no existe, crear un nuevo producto (caso menos común)
                    const newProduct = {
                        id: suggestion.item_id,
                        name: suggestion.item_name,
                        quantity: suggestion.quantity || suggestion.suggested_quantity || 1,
                        price: suggestion.value || 0,
                        final_price: suggestion.value || 0,
                        image: suggestion.item_image || 'default.jpg',
                        brand: { name: suggestion.item_brand || 'N/A' },
                        sku: suggestion.item_sku || 'PROMO',
                        stock: 999
                    };
                    return [...old, newProduct];
                }
            });

            // Reapply discounts after adding the item
            setTimeout(() => {
                applyDiscountRules();
            }, 100);
            
        } catch (error) {
            console.error('Error adding promotional item:', error);
        }
    };

    return (
        <div className="grid lg:grid-cols-5 gap-4 md:gap-8">
            {/* Product List */}
            <div className="lg:col-span-3 space-y-4 md:space-y-6">
                {/* Promotion Suggestions {promotionSuggestions.length > 0 && (
                    <div className="space-y-4">
                        {promotionSuggestions.map((suggestion, index) => (
                            <PromotionSuggestion
                                key={`suggestion-${suggestion.item_id}-${index}`}
                                suggestion={suggestion}
                                cart={cart}
                                setCart={setCart}
                                onAddToCart={applyDiscountRules}
                            />
                        ))}
                    </div>
                )}*/}
                
                
                {isCartEmpty ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h3>
                        <p className="text-gray-500">¡Explora nuestros productos y encuentra algo especial!</p>
                    </div>
                ) : (
                    cart.map((item, index) => (
                        <CardItem 
                            key={index} 
                            {...item} 
                            setCart={setCart}
                            hasPromotion={hasPromotionAvailable(item.id)}
                            onPromotionClick={handlePromotionClick}
                        />
                    ))
                )}
            </div>

            {/* Checkout Summary */}
            <div className="lg:col-span-2 bg-[#F7F9FB] rounded-xl shadow-lg p-4 md:p-6 h-max mt-4 md:mt-0">
                <h3 className="text-xl md:text-2xl font-bold pb-4 md:pb-6">Resumen</h3>
                <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between">
                        <span className="customtext-neutral-dark">Subtotal</span>
                        <span className="font-semibold">S/ {Number2Currency(subTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="customtext-neutral-dark">IGV</span>
                        <span className="font-semibold">S/ {Number2Currency(igv)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="customtext-neutral-dark">Envío</span>
                        <span className="font-semibold">S/ {Number2Currency(envio)}</span>
                    </div>
                    
                    {/* Descuentos Automáticos */}
                    {isLoadingDiscounts && (
                        <div className="flex justify-between items-center">
                            <span className="customtext-neutral-dark">Verificando descuentos...</span>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                    )}
                    
                    {!isLoadingDiscounts && appliedDiscounts.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xl md:text-2xl font-bold pb-4 md:pb-6  customtext-neutral-dark mb-2">
                                🎉 Descuentos aplicados:
                            </div>
                            {appliedDiscounts.map((discount, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="customtext-neutral-dark">
                                        {discount.name}
                                        {discount.description && (
                                            <span className="text-xs font-semibold block">
                                                {discount.description}
                                            </span>
                                        )}
                                    </span>
                                    <span className="customtext-neutral-dark font-semibold">
                                        -S/ {Number2Currency(discount.amount)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between text-sm font-semibold customtext-neutral-dark pt-1">
                                <span>Total descuentos:</span>
                                <span>-S/ {Number2Currency(totalDiscount)}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Productos gratuitos   <FreeItemsDisplay freeItems={freeItems} />*/}
                  
                    
                    <div className="py-3 border-y-2 mt-4 md:mt-6">
                        <div className="flex justify-between font-bold text-lg md:text-[20px] items-center">
                            <span>Total</span>
                            <span>S/ {Number2Currency(totalFinal)}</span>
                        </div>
                        {totalDiscount > 0 && (
                            <div className="text-sm text-gray-500 mt-1">
                                <span className="line-through">S/ {Number2Currency(totalWithoutDiscounts || (totalFinal + totalDiscount))}</span>
                                <span className="ml-2 customtext-neutral-dark font-semibold">
                                    Ahorras S/ {Number2Currency(totalDiscount)}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2 pt-3 md:pt-4">
                        <ButtonPrimary 
                            onClick={onContinue} 
                            className="w-full"
                            disabled={isCartEmpty}
                        >
                            {isCartEmpty ? 'Carrito Vacío' : 'Continuar Compra'}
                        </ButtonPrimary>
                        <ButtonSecondary href="/" className="w-full">
                            {isCartEmpty ? 'Ir a Comprar' : 'Cancelar'}
                        </ButtonSecondary>
                    </div>
                    <div>
                        <p className="text-xs md:text-sm customtext-neutral-dark">
                            Al realizar tu pedido, aceptas los <a href="#" onClick={() => openModal(1)} className="customtext-primary font-bold">Términos y Condiciones</a>, y que nosotros usaremos sus datos personales de acuerdo con nuestra <a href="#" onClick={() => openModal(0)} className="customtext-primary font-bold">Política de Privacidad</a>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Promotion Modal */}
            <PromotionModal 
                isOpen={showPromotionModal}
                onClose={() => setShowPromotionModal(false)}
                suggestion={selectedPromotion}
                onAddToCart={handleAddPromotionalItem}
                productName={selectedProduct?.name || ''}
            />
        </div>
    );
}