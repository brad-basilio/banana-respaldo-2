import { useState } from "react";
import { Plus, Gift, Tag } from "lucide-react";

export default function PromotionSuggestion({ suggestion, onAddToCart, cart, setCart }) {
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async () => {
        setIsAdding(true);
        
        try {
            // Encontrar el item en el carrito
            const existingItemIndex = cart.findIndex(item => 
                (item.item_id || item.id) === suggestion.item_id
            );
            
            if (existingItemIndex !== -1) {
                // Actualizar cantidad existente
                const updatedCart = [...cart];
                updatedCart[existingItemIndex].quantity += suggestion.suggested_quantity;
                setCart(updatedCart);
            } else {
                // Esto no debería pasar, pero por seguridad
                console.warn('Item no encontrado en carrito para promoción');
            }
            
            // Callback para actualizar los descuentos
            if (onAddToCart) {
                await onAddToCart();
            }
        } catch (error) {
            console.error('Error al agregar producto promocional:', error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex items-start gap-4">
                {/* Icono de regalo */}
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6 text-green-600" />
                    </div>
                </div>
                
                {/* Contenido principal */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                            ¡Promoción Disponible!
                        </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        ¡Agrega {suggestion.suggested_quantity} más y llévalo GRATIS!
                    </h3>
                    
                    <div className="text-sm text-gray-600 mb-3">
                        <p className="mb-1">
                            <span className="font-medium">Producto:</span> {suggestion.item_name}
                        </p>
                        <p className="mb-1">
                            <span className="font-medium">Tienes:</span> {suggestion.current_quantity} unidades
                        </p>
                        <p>
                            <span className="font-medium">Agrega:</span> {suggestion.suggested_quantity} más y 
                            <span className="font-bold text-green-600"> ¡te ahorras S/ {suggestion.savings}!</span>
                        </p>
                    </div>
                    
                    <div className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full inline-block mb-3">
                        Compra {suggestion.buy_quantity} lleva {suggestion.get_quantity} gratis
                    </div>
                </div>
                
                {/* Imagen del producto */}
                <div className="flex-shrink-0">
                    <img 
                        src={`/storage/${suggestion.item_image}`}
                        alt={suggestion.item_name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                </div>
            </div>
            
            {/* Botón de acción */}
            <div className="mt-4 pt-3 border-t border-green-200">
                <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    {isAdding ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Agregando...
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" />
                            ¡Aprovechar Promoción Gratis!
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
