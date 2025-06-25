import React from 'react';
import { motion } from 'framer-motion';

export default function ElementsPanel({ 
    elementTypes, 
    onAddElement, 
    onImageUpload, 
    fileInputRef 
}) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div 
            className="p-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Agregar Elementos</h4>
            
            {/* Text Elements */}
            <motion.div variants={itemVariants} className="mb-6">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Texto</h5>
                <div className="space-y-2">
                    <button
                        onClick={() => onAddElement('text')}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group"
                    >
                        <elementTypes.text.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-900">Texto</div>
                            <div className="text-xs text-gray-500">Agregar texto personalizable</div>
                        </div>
                    </button>
                    
                    {/* Text Presets */}
                    <div className="ml-8 space-y-1">
                        <button
                            onClick={() => {
                                const titleElement = {
                                    ...elementTypes.text.default,
                                    content: 'Título Principal',
                                    fontSize: 24,
                                    fontWeight: 'bold'
                                };
                                onAddElement('text');
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded"
                        >
                            Título Principal
                        </button>
                        <button
                            onClick={() => {
                                const subtitleElement = {
                                    ...elementTypes.text.default,
                                    content: 'Subtítulo',
                                    fontSize: 18,
                                    fontWeight: '500'
                                };
                                onAddElement('text');
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded"
                        >
                            Subtítulo
                        </button>
                        <button
                            onClick={() => {
                                const bodyElement = {
                                    ...elementTypes.text.default,
                                    content: 'Texto del cuerpo',
                                    fontSize: 14
                                };
                                onAddElement('text');
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded"
                        >
                            Texto del cuerpo
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Image Elements */}
            <motion.div variants={itemVariants} className="mb-6">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Imágenes</h5>
                <div className="space-y-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group"
                    >
                        <elementTypes.image.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-900">Subir Imagen</div>
                            <div className="text-xs text-gray-500">Desde tu dispositivo</div>
                        </div>
                    </button>
                    
                    <button
                        onClick={() => onAddElement('image')}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group"
                    >
                        <elementTypes.image.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-900">Placeholder</div>
                            <div className="text-xs text-gray-500">Imagen de marcador</div>
                        </div>
                    </button>
                </div>
            </motion.div>

            {/* Shape Elements */}
            <motion.div variants={itemVariants} className="mb-6">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Formas</h5>
                <div className="space-y-2">
                    <button
                        onClick={() => onAddElement('shape')}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group"
                    >
                        <elementTypes.shape.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-900">Rectángulo</div>
                            <div className="text-xs text-gray-500">Forma rectangular</div>
                        </div>
                    </button>
                    
                    {/* Shape Presets */}
                    <div className="grid grid-cols-3 gap-2 ml-8">
                        <button
                            onClick={() => {
                                const circleElement = {
                                    ...elementTypes.shape.default,
                                    shape: 'circle',
                                    width: 100,
                                    height: 100
                                };
                                onAddElement('shape');
                            }}
                            className="aspect-square bg-gray-100 rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center"
                            title="Círculo"
                        >
                            <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                        </button>
                        <button
                            onClick={() => {
                                const rectElement = {
                                    ...elementTypes.shape.default,
                                    shape: 'rectangle',
                                    width: 150,
                                    height: 100
                                };
                                onAddElement('shape');
                            }}
                            className="aspect-square bg-gray-100 rounded hover:bg-blue-100 transition-colors flex items-center justify-center"
                            title="Rectángulo"
                        >
                            <div className="w-8 h-6 bg-blue-500 rounded"></div>
                        </button>
                        <button
                            onClick={() => {
                                const squareElement = {
                                    ...elementTypes.shape.default,
                                    shape: 'square',
                                    width: 100,
                                    height: 100
                                };
                                onAddElement('shape');
                            }}
                            className="aspect-square bg-gray-100 rounded hover:bg-blue-100 transition-colors flex items-center justify-center"
                            title="Cuadrado"
                        >
                            <div className="w-6 h-6 bg-blue-500 rounded"></div>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Templates Section */}
            <motion.div variants={itemVariants} className="mb-6">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Plantillas</h5>
                <div className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                    Próximamente: Plantillas prediseñadas
                </div>
            </motion.div>
        </motion.div>
    );
}
