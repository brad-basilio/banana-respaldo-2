import { useState, useEffect } from "react";
import Number2Currency from "../../../../Utils/Number2Currency";
import ButtonPrimary from "./ButtonPrimary";
import ButtonSecondary from "./ButtonSecondary";
import CardItem from "./CardItem";
import DiscountRulesRest from "../../../../Actions/DiscountRulesRest";
import FreeItemsDisplay from "./FreeItemsDisplay";
import PromotionSuggestion from "./PromotionSuggestion";

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
            // Debug: Log información del carrito antes de enviar
            console.log('🛒 CartStep applying discounts:', {
                cart,
                subTotal,
                totalWithoutDiscounts
            });
            
            const result = await DiscountRulesRest.applyToCart(cart, totalWithoutDiscounts);
            
            if (result.success && result.data) {
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
                console.error('❌ Discount application failed:', result.error);
                
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

    return (
        <div className="grid lg:grid-cols-5 gap-4 md:gap-8">
            {/* Product List */}
            <div className="lg:col-span-3 space-y-4 md:space-y-6">
                {/* Promotion Suggestions */}
                {promotionSuggestions.length > 0 && (
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
                )}
                
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
                        <CardItem key={index} {...item} setCart={setCart} />
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
                            <div className="text-sm font-medium text-green-600 mb-2">
                                🎉 Descuentos aplicados:
                            </div>
                            {appliedDiscounts.map((discount, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="text-green-600">
                                        {discount.name}
                                        {discount.description && (
                                            <span className="text-xs text-gray-500 block">
                                                {discount.description}
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-green-600 font-semibold">
                                        -S/ {Number2Currency(discount.amount)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between text-sm font-semibold text-green-600 pt-1 border-t border-green-200">
                                <span>Total descuentos:</span>
                                <span>-S/ {Number2Currency(totalDiscount)}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Productos gratuitos */}
                    <FreeItemsDisplay freeItems={freeItems} />
                    
                    <div className="py-3 border-y-2 mt-4 md:mt-6">
                        <div className="flex justify-between font-bold text-lg md:text-[20px] items-center">
                            <span>Total</span>
                            <span>S/ {Number2Currency(totalFinal)}</span>
                        </div>
                        {totalDiscount > 0 && (
                            <div className="text-sm text-gray-500 mt-1">
                                <span className="line-through">S/ {Number2Currency(totalWithoutDiscounts || (totalFinal + totalDiscount))}</span>
                                <span className="ml-2 text-green-600 font-semibold">
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
        </div>
    );
}