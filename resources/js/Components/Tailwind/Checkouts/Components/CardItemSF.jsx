import { Minus, Plus, PlusCircle, Trash2, Package, Star } from "lucide-react";
import Number2Currency from "../../../../Utils/Number2Currency";

const CardItemSF = ({ setCart, ...item }) => {

    const onDeleteClicked = () => {
        setCart(old => old.filter(x => x.id !== item.id));
    }

    const onPlusClicked = () => {
        setCart(old =>
            old.map(x =>
                x.id === item.id ? { ...x, quantity: (x.quantity || 1) + 1 } : x
            )
        );
    }

    const onMinusClicked = () => {
        setCart(old =>
            old.map(x => {
                if (x.id === item.id) {
                    const newQuantity = (x.quantity || 1) - 1;
                    if (newQuantity <= 0) {
                        onDeleteClicked(item.id);
                        return null;
                    }
                    return { ...x, quantity: newQuantity };
                }
                return x;
            }).filter(Boolean)
        );
    }

    // Calcular el descuento si existe
    const discount = item.price > item.final_price ? Math.round(((item.price - item.final_price) / item.price) * 100) : 0;
    
    console.log(item);
    return (
        <>  
            {/* Versión para desktop (tabla) */}
            <tr key={item.id} className="hidden md:table-row border-b hover:bg-gray-50 transition-colors duration-200 font-font-general">
                {/* Columna Producto */}
                <td className="px-6 py-6">
                    <div className="flex items-center">
                        <div className="relative group">
                            <img
                                src={`/storage/images/item/${item.image}`}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-200"
                            />
                            {discount > 0 && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                                    -{discount}%
                                </div>
                            )}
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm 2xl:text-base font-bold customtext-neutral-dark leading-tight">{item.name}</h3>
                            <div className="text-xs 2xl:text-sm customtext-neutral-dark mt-1 space-y-1">
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Package size={12} />
                                    <span>SKU: {item.sku || item.id}</span>
                                </div>
                            </div>
                            <button
                                onClick={onDeleteClicked}
                                className="mt-2 inline-flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors duration-200 text-xs font-medium"
                                aria-label="Remove item"
                            >
                                <Trash2 size={14} />
                                Eliminar
                            </button>
                        </div>
                    </div>
                </td>
                
                {/* Columna Cantidad */}
                <td className="px-4 py-4">
                    <div className="flex justify-center">
                        <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                            <button
                                type="button"
                                onClick={onMinusClicked}
                                className="p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
                                aria-label="Decrease quantity"
                            >
                                <Minus size={16} />
                            </button>
                            <div className="w-10 h-10 flex justify-center items-center bg-gray-50 border-x border-gray-200">
                                <span className="font-bold text-base">{item.quantity || 1}</span>
                            </div>
                            <button
                                type="button"
                                onClick={onPlusClicked}
                                className="p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
                                aria-label="Increase quantity"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </td>
                
                {/* Columna Precio Unitario */}
                <td className="px-4 py-4 text-center">
                    <div className="space-y-1">
                        {discount > 0 && (
                            <div className="text-xs text-gray-500 line-through">
                                S/ {Number2Currency(item.price)}
                            </div>
                        )}
                        <div className="font-bold text-base text-gray-900">
                            S/ {Number2Currency(item.final_price)}
                        </div>
                        {discount > 0 && (
                            <div className="text-xs text-green-600 font-medium">
                                Ahorras S/ {Number2Currency(item.price - item.final_price)}
                            </div>
                        )}
                    </div>
                </td>
                
                {/* Columna Subtotal */}
                <td className="px-4 py-4 text-center">
                    <div className="font-bold text-lg text-gray-900">
                        S/ {Number2Currency(item.final_price * item.quantity)}
                    </div>
                </td>
            </tr>

            {/* Versión para mobile (tarjeta) */}
            <div className="md:hidden bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 mb-4 w-full font-font-general">
                <div className="flex items-start gap-3 relative">
                    <div className="relative group">
                        <img
                            src={`/storage/images/item/${item.image}`}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-200"
                        />
                        {discount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                                -{discount}%
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <h3 className="font-bold text-base mb-2 leading-tight customtext-neutral-dark">{item.name}</h3>
                        
                        <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-gray-100"></div>
                                <span className="text-xs text-gray-600">Color: {item.color || 'Personalizado'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Package size={12} />
                                <span className="text-xs">SKU: {item.sku || item.id}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <button 
                                    onClick={onMinusClicked} 
                                    className="p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
                                >
                                    <Minus size={14} />
                                </button>
                                <div className="w-8 h-8 flex justify-center items-center bg-gray-50 border-x border-gray-200">
                                    <span className="font-bold text-sm">{item.quantity || 1}</span>
                                </div>
                                <button 
                                    onClick={onPlusClicked} 
                                    className="p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className="text-right">
                                {discount > 0 && (
                                    <div className="text-xs text-gray-500 line-through">
                                        S/ {Number2Currency(item.price)}
                                    </div>
                                )}
                                <div className="font-bold text-base text-gray-900">
                                    S/ {Number2Currency(item.final_price)}
                                </div>
                                {discount > 0 && (
                                    <div className="text-xs text-green-600 font-medium">
                                        Ahorras S/ {Number2Currency(item.price - item.final_price)}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Subtotal:</span>
                                <span className="font-bold text-lg text-gray-900">
                                    S/ {Number2Currency(item.final_price * item.quantity)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={onDeleteClicked}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors duration-200"
                        aria-label="Remove item"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
    </>
    );
}

export default CardItemSF;