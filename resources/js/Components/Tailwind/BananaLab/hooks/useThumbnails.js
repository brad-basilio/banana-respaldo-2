import { useState, useCallback, useRef, useEffect } from 'react';
import { generatePageThumbnail, generateFallbackThumbnail } from '../utils/thumbnailGenerator';

/**
 * Hook personalizado para manejar thumbnails de páginas
 * Optimizado para evitar regeneraciones innecesarias y mejorar rendimiento
 */
export const useThumbnails = (pages, layouts, workspaceDimensions) => {
    const [thumbnails, setThumbnails] = useState({});
    const [isGenerating, setIsGenerating] = useState({});
    const [errors, setErrors] = useState({});
    
    // Referencias para evitar regeneraciones innecesarias
    const generationQueue = useRef(new Set());
    const lastGenerationTime = useRef({});
    const abortControllers = useRef({});
    
    // Debounce para evitar múltiples generaciones simultáneas
    const GENERATION_DEBOUNCE = 1000; // 1 segundo
    
    /**
     * Genera thumbnail para una página específica
     */
    const generateThumbnail = useCallback(async (pageId, options = {}) => {
        // Evitar generaciones duplicadas
        if (generationQueue.current.has(pageId)) {
            console.log(`⏭️ Saltando generación duplicada para página ${pageId}`);
            return thumbnails[pageId];
        }
        
        // Debounce: evitar regeneraciones muy frecuentes
        const now = Date.now();
        const lastGeneration = lastGenerationTime.current[pageId] || 0;
        if (now - lastGeneration < GENERATION_DEBOUNCE) {
            console.log(`⏱️ Debounce activo para página ${pageId}`);
            return thumbnails[pageId];
        }
        
        // Cancelar generación anterior si existe
        if (abortControllers.current[pageId]) {
            abortControllers.current[pageId].abort();
        }
        
        // Crear nuevo AbortController
        const abortController = new AbortController();
        abortControllers.current[pageId] = abortController;
        
        try {
            // Marcar como en proceso
            generationQueue.current.add(pageId);
            setIsGenerating(prev => ({ ...prev, [pageId]: true }));
            setErrors(prev => ({ ...prev, [pageId]: null }));
            
            // Buscar la página y su layout
            const page = pages.find(p => p.id === pageId);
            if (!page) {
                throw new Error(`Página ${pageId} no encontrada`);
            }
            
            const layout = layouts.find(l => l.id === page.layout);
            if (!layout) {
                console.warn(`Layout ${page.layout} no encontrado para página ${pageId}`);
            }
            
            console.log(`📸 Iniciando generación de thumbnail para página ${pageId}`);
            
            // Esperar un momento para asegurar que el DOM esté actualizado
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Verificar si fue cancelado
            if (abortController.signal.aborted) {
                return thumbnails[pageId];
            }
            
            // Generar thumbnail
            const thumbnail = await generatePageThumbnail(pageId, layout, {
                type: options.type || 'preview',
                workspaceDimensions
            });
            
            // Verificar si fue cancelado después de la generación
            if (abortController.signal.aborted) {
                return thumbnails[pageId];
            }
            
            if (thumbnail) {
                // Actualizar estado
                setThumbnails(prev => ({
                    ...prev,
                    [pageId]: thumbnail
                }));
                
                lastGenerationTime.current[pageId] = now;
                console.log(`✅ Thumbnail generado exitosamente para página ${pageId}`);
                
                return thumbnail;
            } else {
                throw new Error('No se pudo generar el thumbnail');
            }
            
        } catch (error) {
            if (error.name === 'AbortError' || abortController.signal.aborted) {
                console.log(`🚫 Generación cancelada para página ${pageId}`);
                return thumbnails[pageId];
            }
            
            console.error(`❌ Error generando thumbnail para página ${pageId}:`, error);
            
            // Generar thumbnail de fallback
            const fallbackThumbnail = generateFallbackThumbnail(
                pageId, 
                page?.type || 'content',
                { width: 200, height: 150 }
            );
            
            setThumbnails(prev => ({
                ...prev,
                [pageId]: fallbackThumbnail
            }));
            
            setErrors(prev => ({
                ...prev,
                [pageId]: error.message
            }));
            
            return fallbackThumbnail;
            
        } finally {
            // Limpiar estado
            generationQueue.current.delete(pageId);
            setIsGenerating(prev => ({ ...prev, [pageId]: false }));
            delete abortControllers.current[pageId];
        }
    }, [pages, layouts, thumbnails, workspaceDimensions]);
    
    /**
     * Genera thumbnails para múltiples páginas con control de concurrencia
     */
    const generateMultipleThumbnails = useCallback(async (pageIds, options = {}) => {
        const maxConcurrent = options.maxConcurrent || 2;
        const results = {};
        
        // Procesar en lotes para evitar sobrecarga
        for (let i = 0; i < pageIds.length; i += maxConcurrent) {
            const batch = pageIds.slice(i, i + maxConcurrent);
            
            const batchPromises = batch.map(async (pageId) => {
                const thumbnail = await generateThumbnail(pageId, options);
                return { pageId, thumbnail };
            });
            
            const batchResults = await Promise.allSettled(batchPromises);
            
            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const { pageId, thumbnail } = result.value;
                    results[pageId] = thumbnail;
                } else {
                    const pageId = batch[index];
                    console.error(`❌ Error en lote para página ${pageId}:`, result.reason);
                }
            });
            
            // Pausa entre lotes
            if (i + maxConcurrent < pageIds.length) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        return results;
    }, [generateThumbnail]);
    
    /**
     * Invalida y regenera thumbnail de una página
     */
    const invalidateThumbnail = useCallback((pageId) => {
        console.log(`🔄 Invalidando thumbnail para página ${pageId}`);
        
        // Cancelar generación en curso si existe
        if (abortControllers.current[pageId]) {
            abortControllers.current[pageId].abort();
        }
        
        // Limpiar estado
        setThumbnails(prev => {
            const updated = { ...prev };
            delete updated[pageId];
            return updated;
        });
        
        setErrors(prev => {
            const updated = { ...prev };
            delete updated[pageId];
            return updated;
        });
        
        // Limpiar tiempo de última generación para permitir regeneración inmediata
        delete lastGenerationTime.current[pageId];
        
        // Regenerar después de un breve delay
        setTimeout(() => {
            generateThumbnail(pageId);
        }, 100);
    }, [generateThumbnail]);
    
    /**
     * Limpia todos los thumbnails
     */
    const clearAllThumbnails = useCallback(() => {
        console.log('🧹 Limpiando todos los thumbnails');
        
        // Cancelar todas las generaciones en curso
        Object.values(abortControllers.current).forEach(controller => {
            controller.abort();
        });
        
        // Limpiar estado
        setThumbnails({});
        setIsGenerating({});
        setErrors({});
        generationQueue.current.clear();
        lastGenerationTime.current = {};
        abortControllers.current = {};
    }, []);
    
    /**
     * Obtiene el thumbnail de una página, generándolo si no existe
     */
    const getThumbnail = useCallback((pageId, options = {}) => {
        const existingThumbnail = thumbnails[pageId];
        
        if (existingThumbnail) {
            return existingThumbnail;
        }
        
        // Si no existe y no se está generando, iniciar generación
        if (!isGenerating[pageId] && !generationQueue.current.has(pageId)) {
            generateThumbnail(pageId, options);
        }
        
        return null;
    }, [thumbnails, isGenerating, generateThumbnail]);
    
    /**
     * Verifica si una página tiene thumbnail
     */
    const hasThumbnail = useCallback((pageId) => {
        return !!thumbnails[pageId];
    }, [thumbnails]);
    
    /**
     * Obtiene estadísticas de thumbnails
     */
    const getStats = useCallback(() => {
        const totalPages = pages.length;
        const generatedThumbnails = Object.keys(thumbnails).length;
        const currentlyGenerating = Object.values(isGenerating).filter(Boolean).length;
        const errorsCount = Object.keys(errors).length;
        
        return {
            totalPages,
            generatedThumbnails,
            currentlyGenerating,
            errorsCount,
            completionPercentage: totalPages > 0 ? (generatedThumbnails / totalPages) * 100 : 0
        };
    }, [pages.length, thumbnails, isGenerating, errors]);
    
    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            // Cancelar todas las generaciones en curso
            Object.values(abortControllers.current).forEach(controller => {
                controller.abort();
            });
        };
    }, []);
    
    return {
        thumbnails,
        isGenerating,
        errors,
        generateThumbnail,
        generateMultipleThumbnails,
        invalidateThumbnail,
        clearAllThumbnails,
        getThumbnail,
        hasThumbnail,
        getStats
    };
};

export default useThumbnails;