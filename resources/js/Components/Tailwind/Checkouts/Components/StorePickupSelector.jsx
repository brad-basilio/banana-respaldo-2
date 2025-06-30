import React, { useState, useEffect } from "react";

const StorePickupSelector = ({ 
    ubigeoCode, 
    onStoreSelect, 
    selectedStore = null,
    className = ""
}) => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (ubigeoCode) {
            loadStores();
        }
    }, [ubigeoCode]);

    const loadStores = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/stores/by-ubigeo/${ubigeoCode}`);
            const result = await response.json();
            
            if (response.ok) {
                setStores(result.data || []);
            } else {
                throw new Error(result.message || 'Error al cargar tiendas');
            }
        } catch (err) {
            setError(err.message);
            setStores([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStoreSelect = (store) => {
        onStoreSelect(store);
    };

    if (loading) {
        return (
            <div className={`text-center p-8 ${className}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cargando tiendas...</h3>
                <p className="text-gray-600">Buscando tiendas disponibles en tu ubicación</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-800 text-center mb-2">Error al cargar tiendas</h3>
                <p className="text-red-600 text-center">{error}</p>
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className={`bg-amber-50 border border-amber-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mx-auto mb-4">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-amber-800 text-center mb-2">Sin tiendas disponibles</h3>
                <p className="text-amber-700 text-center">No hay tiendas disponibles para retiro en esta ubicación. Por favor, selecciona otra opción de envío.</p>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona una tienda para retiro</h3>
                <p className="text-gray-600">Elige la tienda más conveniente para retirar tu pedido</p>
            </div>
            
            <div className="grid gap-4">
                {stores.map((store) => (
                    <div 
                        key={store.id}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedStore?.id === store.id 
                                ? 'border-blue-500 bg-blue-50 shadow-md' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleStoreSelect(store)}
                    >
                        {/* Radio button visual */}
                        <div className="absolute top-4 right-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedStore?.id === store.id 
                                    ? 'border-blue-500 bg-blue-500' 
                                    : 'border-gray-300 bg-white'
                            }`}>
                                {selectedStore?.id === store.id && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pr-8">
                            {/* Store Image */}
                            <div className="flex-shrink-0">
                                {store.image ? (
                                    <img 
                                        src={`/storage/images/stores/${store.image}`}
                                        alt={store.name}
                                        className="w-16 h-16 object-cover rounded-lg border"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0v-4a2 2 0 012-2h2m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v8.1M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            
                            {/* Store Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 truncate">{store.name}</h4>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{store.address}</p>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                    {store.phone && (
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span>{store.phone}</span>
                                        </div>
                                    )}
                                    {store.manager && (
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Encargado: {store.manager}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Business Hours */}
                                {store.business_hours && (
                                    <div className="bg-gray-50 rounded-md p-3 mt-3">
                                        <div className="text-xs font-medium text-gray-700 mb-2">Horarios de atención:</div>
                                        <div className="text-xs text-gray-600">
                                            {(() => {
                                                try {
                                                    const hours = typeof store.business_hours === 'string' 
                                                        ? JSON.parse(store.business_hours) 
                                                        : store.business_hours;
                                                    
                                                    const today = new Date().toLocaleDateString('es-PE', { weekday: 'long' });
                                                    const todayMap = {
                                                        'lunes': 'Lunes',
                                                        'martes': 'Martes',
                                                        'miércoles': 'Miércoles',
                                                        'jueves': 'Jueves',
                                                        'viernes': 'Viernes',
                                                        'sábado': 'Sábado',
                                                        'domingo': 'Domingo'
                                                    };
                                                    
                                                    const todaySpanish = todayMap[today.toLowerCase()] || today;
                                                    const todaySchedule = hours.find(h => 
                                                        h.day.toLowerCase() === todaySpanish.toLowerCase()
                                                    );
                                                    
                                                    if (todaySchedule) {
                                                        const status = todaySchedule.closed 
                                                            ? `Hoy: Cerrado` 
                                                            : `Hoy: ${todaySchedule.open} - ${todaySchedule.close}`;
                                                        
                                                        const isOpen = !todaySchedule.closed && (() => {
                                                            const now = new Date();
                                                            const currentTime = now.getHours() * 60 + now.getMinutes();
                                                            const [openHour, openMin] = todaySchedule.open.split(':').map(Number);
                                                            const [closeHour, closeMin] = todaySchedule.close.split(':').map(Number);
                                                            const openTime = openHour * 60 + openMin;
                                                            const closeTime = closeHour * 60 + closeMin;
                                                            return currentTime >= openTime && currentTime <= closeTime;
                                                        })();

                                                        return (
                                                            <div className="flex items-center justify-between">
                                                                <span>{status}</span>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    isOpen 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {isOpen ? 'Abierto' : 'Cerrado'}
                                                                </span>
                                                            </div>
                                                        );
                                                    }
                                                    return "Horarios disponibles";
                                                } catch (e) {
                                                    return "Horarios disponibles";
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {store.description && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-sm text-gray-600">{store.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StorePickupSelector;
