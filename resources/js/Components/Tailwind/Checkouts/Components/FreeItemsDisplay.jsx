import Number2Currency from "../../../../Utils/Number2Currency";

export default function FreeItemsDisplay({ freeItems }) {
    if (!freeItems || freeItems.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3 border-t pt-4 mt-4">
            <div className="flex items-center gap-2 text-green-600 font-semibold">
                <span className="text-lg">🎁</span>
                <span className="text-sm">¡Productos GRATIS incluidos!</span>
            </div>
            
            <div className="space-y-3">
                {freeItems.map((freeItem, index) => (
                    <div key={index} className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-4">
                            {/* Imagen del producto */}
                            <div className="relative">
                                <img
                                    src={`/storage/images/item/${freeItem.item_image}`}
                                    alt={freeItem.item_name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                    onError={(e) => {
                                        e.target.src = "/api/cover/thumbnail/null";
                                    }}
                                />
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                    ¡GRATIS!
                                </div>
                            </div>
                            
                            {/* Información del producto */}
                            <div className="flex-1">
                                <h4 className="font-semibold text-green-700 text-sm">
                                    {freeItem.item_name}
                                </h4>
                                <p className="text-green-600 text-xs">
                                    Cantidad gratuita: {freeItem.quantity}
                                </p>
                                <p className="text-green-600 text-xs">
                                    Valor: S/ {Number2Currency(freeItem.item_price)} c/u
                                </p>
                                {freeItem.buy_quantity && freeItem.get_quantity && (
                                    <p className="text-green-600 text-xs font-medium mt-1">
                                        📦 Compra {freeItem.buy_quantity} → Lleva {freeItem.get_quantity} GRATIS
                                    </p>
                                )}
                            </div>
                            
                            {/* Ahorro total */}
                            <div className="text-right">
                                <span className="text-green-700 font-bold text-sm">
                                    Ahorras
                                </span>
                                <div className="text-green-700 font-bold text-lg">
                                    S/ {Number2Currency(freeItem.discount)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Total de ahorro en productos gratis */}
            {freeItems.length > 1 && (
                <div className="bg-green-100 border-2 border-green-300 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                        <span className="text-green-700 font-semibold">
                            Total ahorro en productos gratis:
                        </span>
                        <span className="text-green-700 font-bold text-lg">
                            S/ {Number2Currency(freeItems.reduce((total, item) => total + parseFloat(item.discount || 0), 0))}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
