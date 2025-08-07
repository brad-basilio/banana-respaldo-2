import React, { useEffect, useMemo } from 'react';
import { useThumbnails } from '../../hooks/useThumbnails';
import OptimizedThumbnail from '../UI/OptimizedThumbnail';
import { layouts } from '../../constants/layouts';

/**
 * Componente de integración para manejar thumbnails en el editor
 * Este componente demuestra cómo usar el hook useThumbnails correctamente
 */
const ThumbnailIntegration = ({ 
    pages, 
    currentPage, 
    workspaceDimensions,
    onPageSelect 
}) => {
    // Hook personalizado para manejar thumbnails
    const {
        thumbnails,
        isGenerating,
        errors,
        generateThumbnail,
        invalidateThumbnail,
        getThumbnail,
        hasThumbnail,
        getStats
    } = useThumbnails(pages, layouts, workspaceDimensions);
    
    // Generar thumbnail para la página actual cuando cambie
    useEffect(() => {
        if (pages[currentPage]) {
            const currentPageData = pages[currentPage];
            
            // Solo generar si no existe o si han pasado más de 5 minutos
            if (!hasThumbnail(currentPageData.id)) {
                console.log(`🔄 Generando thumbnail para página actual: ${currentPageData.id}`);
                generateThumbnail(currentPageData.id, { type: 'preview' });
            }
        }
    }, [currentPage, pages, generateThumbnail, hasThumbnail]);
    
    // Generar thumbnails para páginas visibles (lazy loading)
    useEffect(() => {
        const visiblePages = pages.slice(
            Math.max(0, currentPage - 2), 
            Math.min(pages.length, currentPage + 3)
        );
        
        visiblePages.forEach(page => {
            if (!hasThumbnail(page.id) && !isGenerating[page.id]) {
                setTimeout(() => {
                    generateThumbnail(page.id, { type: 'preview' });
                }, Math.random() * 1000); // Distribuir las generaciones
            }
        });
    }, [currentPage, pages, generateThumbnail, hasThumbnail, isGenerating]);
    
    // Invalidar thumbnail cuando cambie el contenido de una página
    const handlePageContentChange = (pageId) => {
        console.log(`📝 Contenido de página ${pageId} cambió, invalidando thumbnail`);
        invalidateThumbnail(pageId);
    };
    
    // Categorizar páginas para la sidebar
    const categorizedPages = useMemo(() => {
        return {
            cover: pages.filter(page => page.type === "cover"),
            content: pages.filter(page => page.type === "content"),
            final: pages.filter(page => page.type === "final")
        };
    }, [pages]);
    
    // Estadísticas para debugging
    const stats = getStats();
    
    return (
        <div className="thumbnail-integration">
            {/* Debug info (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="p-2 bg-gray-100 text-xs text-gray-600 border-b">
                    <div>Thumbnails: {stats.generatedThumbnails}/{stats.totalPages}</div>
                    <div>Generando: {stats.currentlyGenerating}</div>
                    <div>Errores: {stats.errorsCount}</div>
                    <div>Progreso: {stats.completionPercentage.toFixed(1)}%</div>
                </div>
            )}
            
            {/* Sección de páginas */}
            <div className="space-y-4">
                {/* Portada */}
                {categorizedPages.cover.length > 0 && (
                    <div>
                        <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></div>
                            Portada
                        </div>
                        {categorizedPages.cover.map((page, index) => (
                            <PageThumbnailItem
                                key={page.id}
                                page={page}
                                pageIndex={pages.indexOf(page)}
                                currentPage={currentPage}
                                thumbnail={getThumbnail(page.id)}
                                isGenerating={isGenerating[page.id]}
                                error={errors[page.id]}
                                onSelect={onPageSelect}
                                onContentChange={handlePageContentChange}
                            />
                        ))}
                    </div>
                )}
                
                {/* Páginas de contenido */}
                {categorizedPages.content.length > 0 && (
                    <div>
                        <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></div>
                            Páginas de contenido
                        </div>
                        <div className="space-y-2">
                            {categorizedPages.content.map((page, index) => (
                                <PageThumbnailItem
                                    key={page.id}
                                    page={page}
                                    pageIndex={pages.indexOf(page)}
                                    currentPage={currentPage}
                                    thumbnail={getThumbnail(page.id)}
                                    isGenerating={isGenerating[page.id]}
                                    error={errors[page.id]}
                                    onSelect={onPageSelect}
                                    onContentChange={handlePageContentChange}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Contraportada */}
                {categorizedPages.final.length > 0 && (
                    <div>
                        <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></div>
                            Contraportada
                        </div>
                        {categorizedPages.final.map((page, index) => (
                            <PageThumbnailItem
                                key={page.id}
                                page={page}
                                pageIndex={pages.indexOf(page)}
                                currentPage={currentPage}
                                thumbnail={getThumbnail(page.id)}
                                isGenerating={isGenerating[page.id]}
                                error={errors[page.id]}
                                onSelect={onPageSelect}
                                onContentChange={handlePageContentChange}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Componente individual para cada thumbnail de página
 */
const PageThumbnailItem = React.memo(({ 
    page, 
    pageIndex, 
    currentPage, 
    thumbnail, 
    isGenerating, 
    error,
    onSelect,
    onContentChange 
}) => {
    const isSelected = currentPage === pageIndex;
    
    const handleClick = () => {
        onSelect(pageIndex);
    };
    
    // Determinar el texto a mostrar
    const getPageLabel = () => {
        switch (page.type) {
            case 'cover':
                return 'Portada';
            case 'final':
                return 'Contraportada';
            case 'content':
                return `Página ${page.pageNumber}`;
            default:
                return `Página ${pageIndex + 1}`;
        }
    };
    
    return (
        <div
            className={`relative group flex flex-col cursor-pointer transition-all duration-200 transform mb-2 ${
                isSelected
                    ? "ring-2 ring-purple-400 scale-[1.02] shadow-md"
                    : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
            }`}
            onClick={handleClick}
        >
            <div className="relative overflow-hidden border aspect-[4/3] bg-white">
                <OptimizedThumbnail
                    pageId={page.id}
                    thumbnail={thumbnail}
                    altText={getPageLabel()}
                    type={page.type}
                    className="w-full h-full"
                />
                
                {/* Indicadores de estado */}
                {isGenerating && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                        Generando...
                    </div>
                )}
                
                {error && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                        Error
                    </div>
                )}
                
                {/* Badge de número de página para contenido */}
                {page.type === 'content' && (
                    <div className="absolute top-1 left-1 bg-white/90 rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold shadow-sm">
                        {page.pageNumber}
                    </div>
                )}
                
                {/* Badge de tipo para portada/contraportada */}
                {(page.type === 'cover' || page.type === 'final') && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 group-hover:opacity-100 opacity-80 transition-opacity">
                        <span className="text-[10px] text-white font-medium block">
                            {getPageLabel()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
});

PageThumbnailItem.displayName = 'PageThumbnailItem';

export default ThumbnailIntegration;