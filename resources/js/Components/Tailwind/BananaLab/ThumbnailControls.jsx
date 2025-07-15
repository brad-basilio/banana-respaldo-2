import React from 'react';
import { Camera, Download, Trash2, RefreshCw, Image, Zap } from 'lucide-react';

export default function ThumbnailControls({
    generateHighQualityThumbnail,
    generateAllHighQualityThumbnails,
    getStoredThumbnails,
    deleteStoredThumbnails,
    currentPage,
    pages,
    projectData,
    pageThumbnails
}) {
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isGeneratingAll, setIsGeneratingAll] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleGenerateCurrentThumbnail = async () => {
        setIsGenerating(true);
        try {
            const thumbnail = await generateHighQualityThumbnail(currentPage, {
                width: 800,
                height: 600,
                quality: 95,
                scale: 4,
                dpi: 300
            });
            
            if (thumbnail) {
                console.log('✅ Thumbnail generado para página actual:', thumbnail);
            }
        } catch (error) {
            console.error('❌ Error generando thumbnail:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateAllThumbnails = async () => {
        setIsGeneratingAll(true);
        try {
            const thumbnails = await generateAllHighQualityThumbnails({
                width: 800,
                height: 600,
                quality: 95,
                scale: 4,
                dpi: 300
            });
            
            console.log('✅ Todos los thumbnails generados:', thumbnails.length);
        } catch (error) {
            console.error('❌ Error generando thumbnails:', error);
        } finally {
            setIsGeneratingAll(false);
        }
    };

    const handleLoadStoredThumbnails = async () => {
        setIsLoading(true);
        try {
            const thumbnails = await getStoredThumbnails();
            console.log('✅ Thumbnails cargados:', thumbnails.length);
        } catch (error) {
            console.error('❌ Error cargando thumbnails:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteThumbnails = async () => {
        if (confirm('¿Estás seguro de que quieres eliminar todos los thumbnails guardados?')) {
            setIsLoading(true);
            try {
                const success = await deleteStoredThumbnails();
                if (success) {
                    console.log('✅ Thumbnails eliminados exitosamente');
                }
            } catch (error) {
                console.error('❌ Error eliminando thumbnails:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (!projectData?.id) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Thumbnails de Alta Calidad
                </h3>
                <span className="text-xs text-gray-500">
                    {Object.keys(pageThumbnails).length} / {pages.length}
                </span>
            </div>

            <div className="space-y-2">
                {/* Generar thumbnail de página actual */}
                <button
                    onClick={handleGenerateCurrentThumbnail}
                    disabled={isGenerating || isGeneratingAll}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Camera className="w-4 h-4" />
                    )}
                    {isGenerating ? 'Generando...' : `Generar Página ${currentPage + 1}`}
                </button>

                {/* Generar todos los thumbnails */}
                <button
                    onClick={handleGenerateAllThumbnails}
                    disabled={isGenerating || isGeneratingAll}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {isGeneratingAll ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Zap className="w-4 h-4" />
                    )}
                    {isGeneratingAll ? 'Generando...' : 'Generar Todas las Páginas'}
                </button>

                {/* Cargar thumbnails guardados */}
                <button
                    onClick={handleLoadStoredThumbnails}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {isLoading ? 'Cargando...' : 'Cargar Guardados'}
                </button>

                {/* Eliminar thumbnails */}
                <button
                    onClick={handleDeleteThumbnails}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                    {isLoading ? 'Eliminando...' : 'Eliminar Todos'}
                </button>
            </div>

            {/* Estadísticas */}
            <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                        <span className="font-medium">Páginas:</span> {pages.length}
                    </div>
                    <div>
                        <span className="font-medium">Thumbnails:</span> {Object.keys(pageThumbnails).length}
                    </div>
                </div>
            </div>

            {/* Preview de thumbnails */}
            {Object.keys(pageThumbnails).length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Preview:</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(pageThumbnails).slice(0, 6).map(([pageId, thumbnail]) => (
                            <div key={pageId} className="aspect-square rounded overflow-hidden bg-gray-100">
                                <img
                                    src={thumbnail}
                                    alt={`Thumbnail ${pageId}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
