import React from 'react';

/**
 * Componente para mostrar el estado de guardado y botón de guardado manual
 */
const SaveIndicator = ({ isSaving, lastSaved, saveError, onManualSave }) => {
    return (
        <div className="flex items-center gap-3">
            {/* Indicador de estado */}
            <div className="flex items-center gap-2 text-white/80 text-xs">
                {isSaving ? (
                    <>
                        <div className="animate-spin h-3 w-3 border border-white/50 border-t-white rounded-full"></div>
                        <span>Guardando...</span>
                    </>
                ) : lastSaved ? (
                    <>
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                        <span>Guardado {new Date(lastSaved).toLocaleTimeString()}</span>
                    </>
                ) : saveError ? (
                    <>
                        <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                        <span>Error al guardar</span>
                    </>
                ) : null}
            </div>

            {/* Botón de guardado manual */}
            <button
                onClick={onManualSave}
                disabled={isSaving}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Guardar proyecto manualmente"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" 
                    />
                </svg>
                Guardar
            </button>
        </div>
    );
};

export default SaveIndicator;
