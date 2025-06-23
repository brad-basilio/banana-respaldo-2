import { useState } from "react";
import { X, Gift, Sparkles } from "lucide-react";

export default function PromotionModal({ 
    isOpen, 
    onClose, 
    suggestion, 
    onAddToCart,
    productName 
}) {
    const [isAdding, setIsAdding] = useState(false);

    if (!isOpen || !suggestion) return null;

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            console.log('Modal - suggestion data:', suggestion);
            await onAddToCart(suggestion);
            onClose();
        } catch (error) {
            console.error('Error adding promotional item:', error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 scale-100">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>

                    {/* Header with animation */}
                    <div className="text-center pt-8 pb-6 px-6">
                        <div className="relative inline-block mb-4">
                            <div className="animate-bounce">
                                <Gift size={48} className="customtext-primary mx-auto" />
                            </div>
                            <Sparkles size={20} className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
                            <Sparkles size={16} className="absolute -bottom-1 -left-2 text-yellow-400 animate-pulse delay-300" />
                        </div>
                        
                        <h2 className="text-2xl font-bold customtext-neutral-dark mb-2">
                            🎉 ¡Promoción Especial!
                        </h2>
                        <p className="text-gray-600">
                            Tienes un producto que califica para una promoción
                        </p>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">
                                    Al tener  <span className="font-semibold customtext-primary">{suggestion.current_quantity} {productName}</span> en tu carrito
                                </p>
                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <p className="font-bold text-lg customtext-primary mb-1">
                                        {suggestion.rule_name}
                                    </p>
                                    <p className="text-sm customtext-neutral-light">
                                        {suggestion.description || 'Obtén un producto gratis'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Product details */}
                        <div className="border-2 border-dashed rounded-xl p-4 mb-6 bg-green-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 w-9/12">
                                    <div className="w-12 h-12  rounded-full flex items-center justify-center">
                                        <Gift className="customtext-primary" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold customtext-neutral-dark">
                                            {suggestion.item_name}
                                        </p>
                                        <p className="text-sm customtext-primary">
                                            Cantidad: {suggestion.suggested_quantity}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold customtext-primary">
                                        ¡GRATIS!
                                    </p>
                                    <p className="text-xs text-gray-500 line-through">
                                        S/ {Number(suggestion.value || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdding}
                                className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
                            >
                                {isAdding ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Agregando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Gift size={20} />
                                        <span>¡Agregar Regalo!</span>
                                    </div>
                                )}
                            </button>
                            
                            <button
                                onClick={onClose}
                                className="w-full bg-gray-100 customtext-neutral-light font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                            >
                                Tal vez después
                            </button>
                        </div>

                        {/* Footer note */}
                        <p className="text-xs text-gray-500 text-center mt-4">
                            * Promoción válida mientras tengas los productos requeridos en tu carrito
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
