import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Trash2, 
    Copy,
    Eye,
    EyeOff 
} from 'lucide-react';

export default function PropertiesPanel({ 
    selectedElement, 
    onUpdateElement, 
    onDeleteElement, 
    onDuplicateElement 
}) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    if (!selectedElement) {
        return (
            <motion.div 
                className="p-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
                    </svg>
                    <p className="text-sm">Selecciona un elemento para editarlo</p>
                </div>
            </motion.div>
        );
    }

    const handleInputChange = (field, value) => {
        onUpdateElement(selectedElement.id, { [field]: value });
    };

    const renderTextProperties = () => (
        <div className="space-y-4">
            {/* Content */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contenido</label>
                <textarea
                    value={selectedElement.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                    rows="3"
                    placeholder="Ingresa tu texto..."
                />
            </div>

            {/* Font Size */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño de fuente</label>
                <input
                    type="range"
                    min="8"
                    max="72"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value))}
                    className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">{selectedElement.fontSize || 16}px</div>
            </div>

            {/* Font Family */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fuente</label>
                <select
                    value={selectedElement.fontFamily || 'Arial'}
                    onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                </select>
            </div>

            {/* Font Weight */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Peso de fuente</label>
                <div className="grid grid-cols-3 gap-2">
                    {['normal', '500', 'bold'].map((weight) => (
                        <button
                            key={weight}
                            onClick={() => handleInputChange('fontWeight', weight)}
                            className={`px-3 py-2 text-xs rounded border transition-colors ${
                                selectedElement.fontWeight === weight
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {weight === 'normal' ? 'Normal' : weight === '500' ? 'Medio' : 'Negrita'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Text Align */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alineación</label>
                <div className="grid grid-cols-3 gap-2">
                    {['left', 'center', 'right'].map((align) => (
                        <button
                            key={align}
                            onClick={() => handleInputChange('textAlign', align)}
                            className={`px-3 py-2 text-xs rounded border transition-colors ${
                                selectedElement.textAlign === align
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {align === 'left' ? 'Izq' : align === 'center' ? 'Centro' : 'Der'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center space-x-2">
                    <input
                        type="color"
                        value={selectedElement.color || '#000000'}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300"
                    />
                    <input
                        type="text"
                        value={selectedElement.color || '#000000'}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="#000000"
                    />
                </div>
            </div>
        </div>
    );

    const renderImageProperties = () => (
        <div className="space-y-4">
            {/* Opacity */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Opacidad</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedElement.opacity || 1}
                    onChange={(e) => handleInputChange('opacity', parseFloat(e.target.value))}
                    className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">
                    {Math.round((selectedElement.opacity || 1) * 100)}%
                </div>
            </div>

            {/* Rotation */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rotación</label>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedElement.rotation || 0}
                    onChange={(e) => handleInputChange('rotation', parseInt(e.target.value))}
                    className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">{selectedElement.rotation || 0}°</div>
            </div>

            {/* Replace Image */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reemplazar imagen</label>
                <button className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
                    Seleccionar nueva imagen
                </button>
            </div>
        </div>
    );

    const renderShapeProperties = () => (
        <div className="space-y-4">
            {/* Fill Color */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color de relleno</label>
                <div className="flex items-center space-x-2">
                    <input
                        type="color"
                        value={selectedElement.fill || '#3B82F6'}
                        onChange={(e) => handleInputChange('fill', e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300"
                    />
                    <input
                        type="text"
                        value={selectedElement.fill || '#3B82F6'}
                        onChange={(e) => handleInputChange('fill', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="#3B82F6"
                    />
                </div>
            </div>

            {/* Stroke Color */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color del borde</label>
                <div className="flex items-center space-x-2">
                    <input
                        type="color"
                        value={selectedElement.stroke || '#000000'}
                        onChange={(e) => handleInputChange('stroke', e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300"
                    />
                    <input
                        type="text"
                        value={selectedElement.stroke || '#000000'}
                        onChange={(e) => handleInputChange('stroke', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="#000000"
                    />
                </div>
            </div>

            {/* Stroke Width */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Grosor del borde</label>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={selectedElement.strokeWidth || 1}
                    onChange={(e) => handleInputChange('strokeWidth', parseInt(e.target.value))}
                    className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">{selectedElement.strokeWidth || 1}px</div>
            </div>
        </div>
    );

    const renderCommonProperties = () => (
        <div className="space-y-4">
            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">X</label>
                    <input
                        type="number"
                        value={Math.round(selectedElement.x || 0)}
                        onChange={(e) => handleInputChange('x', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Y</label>
                    <input
                        type="number"
                        value={Math.round(selectedElement.y || 0)}
                        onChange={(e) => handleInputChange('y', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ancho</label>
                    <input
                        type="number"
                        value={Math.round(selectedElement.width || 0)}
                        onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Alto</label>
                    <input
                        type="number"
                        value={Math.round(selectedElement.height || 0)}
                        onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <motion.div 
            className="p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Element Info */}
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Elemento seleccionado
                </h4>
                <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                    Tipo: {selectedElement.type}
                    {selectedElement.type === 'text' && selectedElement.content && (
                        <div className="mt-1 truncate">"{selectedElement.content}"</div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 mb-4">
                <button
                    onClick={() => onDuplicateElement(selectedElement.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                    <Copy className="w-4 h-4" />
                    <span>Duplicar</span>
                </button>
                <button
                    onClick={() => onDeleteElement(selectedElement.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                </button>
            </div>

            {/* Type-specific Properties */}
            <div className="mb-6">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Propiedades</h5>
                {selectedElement.type === 'text' && renderTextProperties()}
                {selectedElement.type === 'image' && renderImageProperties()}
                {selectedElement.type === 'shape' && renderShapeProperties()}
            </div>

            {/* Common Properties */}
            <div className="mb-4">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full text-left text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 hover:text-gray-700 transition-colors"
                >
                    Posición y tamaño {showAdvanced ? '▼' : '▶'}
                </button>
                {showAdvanced && renderCommonProperties()}
            </div>

            {/* Layer Controls */}
            <div className="border-t border-gray-200 pt-4">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Capas</h5>
                <div className="grid grid-cols-2 gap-2">
                    <button className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                        Al frente
                    </button>
                    <button className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                        Atrás
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
