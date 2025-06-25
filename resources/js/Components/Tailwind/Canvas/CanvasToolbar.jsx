import React from 'react';
import { motion } from 'framer-motion';
import { 
    Box,
    Settings,
    ImageIcon
} from 'lucide-react';

export default function CanvasToolbar({ 
    activePanel, 
    setActivePanel, 
    elementTypes, 
    onAddElement, 
    onImageUpload,
    fileInputRef 
}) {
    const toolbarItems = [
        {
            id: 'elements',
            icon: Box,
            label: 'Elementos',
            description: 'Agregar textos, formas e imágenes'
        },
        {
            id: 'properties',
            icon: Settings,
            label: 'Propiedades',
            description: 'Configurar elemento seleccionado'
        }
    ];

    return (
        <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Herramientas</h3>
            <div className="space-y-2">
                {toolbarItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActivePanel(item.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                            activePanel === item.id
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'hover:bg-gray-50 text-gray-600'
                        }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <div className="text-left">
                            <div className="text-sm font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                    </button>
                ))}
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Acciones Rápidas
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <ImageIcon className="w-6 h-6 text-gray-600 mb-1" />
                        <span className="text-xs text-gray-600">Subir Imagen</span>
                    </button>
                    <button
                        onClick={() => onAddElement('text')}
                        className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-lg font-bold text-gray-600 mb-1">T</span>
                        <span className="text-xs text-gray-600">Texto</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
