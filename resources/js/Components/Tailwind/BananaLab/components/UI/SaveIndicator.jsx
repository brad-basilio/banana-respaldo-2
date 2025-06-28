/**
 * Indicador visual profesional del estado de auto-guardado
 * Muestra el estado actual del sistema de guardado con animaciones y detalles
 */

import React from 'react';
import { 
    Save, 
    Cloud, 
    CloudOff, 
    Loader2, 
    Check, 
    AlertTriangle, 
    Wifi, 
    WifiOff,
    Clock
} from 'lucide-react';

const SaveIndicator = ({ 
    saveStatus, 
    lastSaved, 
    lastAutoSaved, 
    hasUnsavedChanges, 
    isOnline, 
    saveError,
    onManualSave,
    className = '' 
}) => {
    
    // Función para formatear el tiempo relativo
    const getTimeAgo = (date) => {
        if (!date) return null;
        
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffSeconds = Math.floor(diffMs / 1000);
        
        if (diffSeconds < 30) return 'hace unos segundos';
        if (diffMinutes < 1) return `hace ${diffSeconds}s`;
        if (diffMinutes < 60) return `hace ${diffMinutes}m`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `hace ${diffHours}h`;
        
        return date.toLocaleDateString();
    };

    // Determinar el icono y color basado en el estado
    const getStatusDisplay = () => {
        if (!isOnline) {
            return {
                icon: <WifiOff className="w-4 h-4" />,
                color: 'text-orange-500',
                bg: 'bg-orange-50 border-orange-200',
                text: 'Sin conexión',
                detail: 'Guardado local activo'
            };
        }

        switch (saveStatus) {
            case 'saving':
                return {
                    icon: <Loader2 className="w-4 h-4 animate-spin" />,
                    color: 'text-blue-500',
                    bg: 'bg-blue-50 border-blue-200',
                    text: 'Guardando...',
                    detail: 'Sincronizando cambios'
                };
            case 'saved':
                return {
                    icon: <Check className="w-4 h-4" />,
                    color: 'text-green-500',
                    bg: 'bg-green-50 border-green-200',
                    text: 'Guardado',
                    detail: lastAutoSaved ? `Auto-guardado ${getTimeAgo(lastAutoSaved)}` : 'Todo sincronizado'
                };
            case 'error':
                return {
                    icon: <AlertTriangle className="w-4 h-4" />,
                    color: 'text-red-500',
                    bg: 'bg-red-50 border-red-200',
                    text: 'Error al guardar',
                    detail: saveError || 'Error desconocido'
                };
            case 'pending':
                return {
                    icon: <Clock className="w-4 h-4" />,
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-50 border-yellow-200',
                    text: hasUnsavedChanges ? 'Cambios pendientes' : 'Pendiente',
                    detail: 'Esperando a guardar...'
                };
            default:
                return {
                    icon: <Save className="w-4 h-4" />,
                    color: 'text-gray-500',
                    bg: 'bg-gray-50 border-gray-200',
                    text: 'Listo',
                    detail: 'Sistema de guardado activo'
                };
        }
    };

    const statusDisplay = getStatusDisplay();

    return (
        <div className={`relative group ${className}`}>
            {/* Indicador principal */}
            <div 
                className={`
                    inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 
                    transition-all duration-200 cursor-pointer
                    ${statusDisplay.bg} ${statusDisplay.color}
                    hover:shadow-md
                `}
                onClick={() => saveStatus !== 'saving' && onManualSave?.()}
            >
                {statusDisplay.icon}
                <span className="text-sm font-medium">
                    {statusDisplay.text}
                </span>
                
                {/* Badge de cambios sin guardar */}
                {hasUnsavedChanges && saveStatus !== 'saving' && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                )}
                
                {/* Indicador de conexión */}
                <div className="flex items-center">
                    {isOnline ? (
                        <Wifi className="w-3 h-3 text-green-500" />
                    ) : (
                        <WifiOff className="w-3 h-3 text-orange-500" />
                    )}
                </div>
            </div>

            {/* Tooltip detallado */}
            <div className="
                absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg
                opacity-0 group-hover:opacity-100 pointer-events-none
                transition-opacity duration-200 z-50 whitespace-nowrap
            ">
                <div className="space-y-1">
                    <div className="font-medium">{statusDisplay.text}</div>
                    <div className="text-gray-300">{statusDisplay.detail}</div>
                    
                    {lastSaved && (
                        <div className="text-gray-400 text-xs">
                            Último guardado manual: {getTimeAgo(lastSaved)}
                        </div>
                    )}
                    
                    <div className="text-gray-400 text-xs">
                        {isOnline ? '🌐 En línea' : '📴 Sin conexión'}
                        {saveStatus !== 'saving' && ' • Click para guardar'}
                    </div>
                </div>
                
                {/* Flecha del tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>

            {/* Barra de progreso para guardado */}
            {saveStatus === 'saving' && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-200 rounded-b-lg overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse"></div>
                </div>
            )}
        </div>
    );
};

export default SaveIndicator;
