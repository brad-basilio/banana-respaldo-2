/**
 * Modal para recuperar progreso guardado automáticamente
 * Permite al usuario decidir si cargar el progreso más reciente o comenzar desde cero
 */

import React, { useState } from 'react';
import { 
    RotateCcw, 
    Trash2, 
    Clock, 
    AlertTriangle, 
    Check,
    FileText,
    Calendar
} from 'lucide-react';

const ProgressRecoveryModal = ({ 
    isOpen, 
    onClose, 
    savedProgress, 
    onLoadProgress, 
    onDiscardProgress 
}) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !savedProgress) return null;

    const handleLoadProgress = async () => {
        setIsLoading(true);
        try {
            await onLoadProgress(savedProgress);
            onClose();
        } catch (error) {
            console.error('Error cargando progreso:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiscardProgress = async () => {
        setIsLoading(true);
        try {
            await onDiscardProgress();
            onClose();
        } catch (error) {
            console.error('Error descartando progreso:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'hace unos segundos';
        if (diffMinutes < 60) return `hace ${diffMinutes} minutos`;
        if (diffHours < 24) return `hace ${diffHours} horas`;
        if (diffDays === 1) return 'ayer';
        if (diffDays < 7) return `hace ${diffDays} días`;
        
        return date.toLocaleDateString();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <RotateCcw className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Progreso Guardado Encontrado
                        </h3>
                        <p className="text-sm text-gray-500">
                            Se encontró un trabajo sin finalizar
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Progress Info */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-700">
                                    Guardado automáticamente
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatDate(savedProgress.savedAt)}
                                </div>
                            </div>
                        </div>

                        {savedProgress.pages && (
                            <div className="flex items-start gap-3">
                                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-sm text-gray-700">
                                        {savedProgress.pages.length} páginas en progreso
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {savedProgress.meta?.version || 'Versión no especificada'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <div className="font-medium mb-1">
                                    ¿Qué te gustaría hacer?
                                </div>
                                <div className="text-amber-700">
                                    Puedes continuar desde donde lo dejaste o comenzar un nuevo diseño.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={handleLoadProgress}
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium 
                                 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        Continuar Editando
                    </button>
                    
                    <button
                        onClick={handleDiscardProgress}
                        disabled={isLoading}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium 
                                 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        Comenzar de Nuevo
                    </button>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ProgressRecoveryModal;
