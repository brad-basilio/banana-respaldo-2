import React, { useState, useEffect, useRef } from 'react';
import { Book } from 'lucide-react';

/**
 * Componente optimizado para mostrar thumbnails con lazy loading y fallbacks
 */
const OptimizedThumbnail = React.memo(({ 
    pageId, 
    thumbnail, 
    altText, 
    type = 'content',
    className = '',
    onLoad,
    onError,
    showPlaceholder = true,
    placeholderIcon: PlaceholderIcon
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);
    
    // Intersection Observer para lazy loading
    useEffect(() => {
        if (!imgRef.current) return;
        
        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observerRef.current?.disconnect();
                }
            },
            {
                rootMargin: '50px' // Cargar 50px antes de que sea visible
            }
        );
        
        observerRef.current.observe(imgRef.current);
        
        return () => {
            observerRef.current?.disconnect();
        };
    }, []);
    
    // Handlers para eventos de imagen
    const handleImageLoad = () => {
        setImageLoaded(true);
        setImageError(false);
        onLoad?.();
    };
    
    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(false);
        onError?.();
    };
    
    // Determinar qué mostrar
    const shouldShowImage = thumbnail && isInView && !imageError;
    const shouldShowPlaceholder = !thumbnail || imageError || !imageLoaded;
    
    // Icono de placeholder por defecto según tipo
    const DefaultPlaceholderIcon = PlaceholderIcon || (() => {
        if (type === 'cover' || type === 'final') {
            return <Book className="w-8 h-8" />;
        }
        
        return (
            <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-gray-300 rounded-sm"></div>
                ))}
            </div>
        );
    });
    
    // Colores según tipo de página
    const typeColors = {
        cover: 'text-purple-300 bg-purple-50',
        content: 'text-blue-300 bg-blue-50',
        final: 'text-green-300 bg-green-50'
    };
    
    const colorClasses = typeColors[type] || 'text-gray-300 bg-gray-50';
    
    return (
        <div 
            ref={imgRef}
            className={`relative w-full h-full overflow-hidden ${className}`}
        >
            {/* Imagen principal */}
            {shouldShowImage && (
                <img
                    src={thumbnail}
                    alt={altText}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                    decoding="async"
                    style={{
                        imageRendering: 'optimizeQuality'
                    }}
                />
            )}
            
            {/* Placeholder/Loading */}
            {shouldShowPlaceholder && showPlaceholder && (
                <div className={`absolute inset-0 flex items-center justify-center ${colorClasses} transition-opacity duration-300 ${
                    imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'
                }`}>
                    <div className="text-center">
                        <DefaultPlaceholderIcon />
                        {!thumbnail && (
                            <div className="mt-2">
                                <div className="text-xs opacity-75">Generando...</div>
                                <div className="w-8 h-1 bg-current opacity-30 rounded-full mx-auto mt-1">
                                    <div className="h-full bg-current rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        )}
                        {imageError && (
                            <div className="text-xs opacity-75 mt-1">Error</div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Loading spinner para cuando está cargando */}
            {thumbnail && isInView && !imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
});

OptimizedThumbnail.displayName = 'OptimizedThumbnail';

export default OptimizedThumbnail;