import React from 'react';
import { motion } from 'framer-motion';
import { 
    Plus,
    Trash2,
    Copy,
    Eye
} from 'lucide-react';

export default function PagesSidebar({ 
    pages, 
    currentPage, 
    onPageSelect, 
    onAddPage, 
    onDeletePage, 
    onDuplicatePage,
    canvasSettings 
}) {
    const generateThumbnail = (page) => {
        // Esta función podría generar una miniatura real del contenido de la página
        // Por ahora, retornamos un placeholder
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="80" fill="${page.background || '#ffffff'}" stroke="#e5e7eb" stroke-width="1"/>
                <text x="60" y="40" text-anchor="middle" font-family="Arial" font-size="10" fill="#6b7280">
                    Página ${pages.indexOf(page) + 1}
                </text>
                <text x="60" y="55" text-anchor="middle" font-family="Arial" font-size="8" fill="#9ca3af">
                    ${page.elements.length} elementos
                </text>
            </svg>
        `)}`;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Páginas</h3>
                    <button
                        onClick={onAddPage}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nueva</span>
                    </button>
                </div>
                <div className="text-xs text-gray-500">
                    {pages.length} página{pages.length !== 1 ? 's' : ''}
                    {canvasSettings.width && canvasSettings.height && (
                        <span> • {canvasSettings.width}×{canvasSettings.height}px</span>
                    )}
                </div>
            </div>

            {/* Pages List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                    {pages.map((page, index) => (
                        <motion.div
                            key={page.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                                currentPage === index
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                            onClick={() => onPageSelect(index)}
                        >
                            {/* Page Thumbnail */}
                            <div className="aspect-[3/2] rounded-t-lg overflow-hidden bg-gray-50">
                                <img
                                    src={page.thumbnail || generateThumbnail(page)}
                                    alt={`Página ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Overlay with page number */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                                    <Eye className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            {/* Page Info */}
                            <div className="p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">
                                            Página {index + 1}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {page.elements.length} elemento{page.elements.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    
                                    {/* Page Actions */}
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDuplicatePage(index);
                                            }}
                                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                                            title="Duplicar página"
                                        >
                                            <Copy className="w-4 h-4 text-gray-600" />
                                        </button>
                                        {pages.length > 1 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeletePage(index);
                                                }}
                                                className="p-1 rounded hover:bg-red-100 transition-colors"
                                                title="Eliminar página"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Current Page Indicator */}
                            {currentPage === index && (
                                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"></div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer Info */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                        <span>Tamaño:</span>
                        <span>{canvasSettings.width} × {canvasSettings.height}px</span>
                    </div>
                    <div className="flex justify-between">
                        <span>DPI:</span>
                        <span>{canvasSettings.dpi}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Zoom:</span>
                        <span>Ajustar al canvas</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
