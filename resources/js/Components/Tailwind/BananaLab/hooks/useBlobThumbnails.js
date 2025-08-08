import { useState, useEffect, useCallback } from 'react';
import { dataUrlToBlobUrl, convertThumbnailsToBlobUrls, revokeBlobUrl, revokeAllBlobUrls, getConversionStats } from '../utils/dataUrlToBlobUrl';

/**
 * Hook que convierte automáticamente data URLs a Blob URLs
 * Mantiene compatibilidad total con el sistema existente
 */
export const useBlobThumbnails = (originalThumbnails) => {
    const [blobThumbnails, setBlobThumbnails] = useState({});
    const [isConverting, setIsConverting] = useState(false);
    
    // Convertir thumbnails cuando cambien
    useEffect(() => {
        if (!originalThumbnails || Object.keys(originalThumbnails).length === 0) {
            return;
        }
        
        setIsConverting(true);
        
        // Convertir con un pequeño delay para no bloquear la UI
        const convertAsync = async () => {
            try {
                // Convertir solo los que son data URLs
                const toConvert = {};
                const alreadyBlob = {};
                
                Object.entries(originalThumbnails).forEach(([pageId, url]) => {
                    if (url && url.startsWith('data:image/')) {
                        toConvert[pageId] = url;
                    } else {
                        alreadyBlob[pageId] = url; // Ya es Blob URL o no es imagen
                    }
                });
                
                if (Object.keys(toConvert).length > 0) {
                    console.log(`🔄 [BLOB-HOOK] Convirtiendo ${Object.keys(toConvert).length} data URLs a Blob URLs...`);
                    
                    const converted = convertThumbnailsToBlobUrls(toConvert);
                    
                    setBlobThumbnails({
                        ...alreadyBlob,
                        ...converted
                    });
                } else {
                    setBlobThumbnails(alreadyBlob);
                }
                
            } catch (error) {
                console.error('❌ [BLOB-HOOK] Error en conversión:', error);
                setBlobThumbnails(originalThumbnails); // Fallback
            } finally {
                setIsConverting(false);
            }
        };
        
        // Usar requestAnimationFrame para no bloquear el render
        requestAnimationFrame(() => {
            convertAsync();
        });
        
    }, [originalThumbnails]);
    
    // Función para convertir un thumbnail individual
    const convertSingle = useCallback((dataUrl, pageId) => {
        if (!dataUrl || !dataUrl.startsWith('data:image/')) {
            return dataUrl;
        }
        
        const blobUrl = dataUrlToBlobUrl(dataUrl, pageId);
        
        // Actualizar el estado
        setBlobThumbnails(prev => ({
            ...prev,
            [pageId]: blobUrl
        }));
        
        return blobUrl;
    }, []);
    
    // Función para limpiar un thumbnail específico
    const cleanup = useCallback((pageId) => {
        revokeBlobUrl(pageId);
        setBlobThumbnails(prev => {
            const updated = { ...prev };
            delete updated[pageId];
            return updated;
        });
    }, []);
    
    // Función para limpiar todos los thumbnails
    const cleanupAll = useCallback(() => {
        revokeAllBlobUrls();
        setBlobThumbnails({});
    }, []);
    
    // Función para obtener estadísticas
    const getStats = useCallback(() => {
        const stats = getConversionStats();
        const totalThumbnails = Object.keys(originalThumbnails || {}).length;
        const blobCount = Object.values(blobThumbnails).filter(url => url?.startsWith('blob:')).length;
        const dataCount = Object.values(originalThumbnails || {}).filter(url => url?.startsWith('data:')).length;
        
        return {
            ...stats,
            totalThumbnails,
            blobCount,
            dataCount,
            conversionRate: totalThumbnails > 0 ? ((blobCount / totalThumbnails) * 100).toFixed(1) : 0
        };
    }, [originalThumbnails, blobThumbnails]);
    
    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            revokeAllBlobUrls();
        };
    }, []);
    
    return {
        thumbnails: blobThumbnails,
        isConverting,
        convertSingle,
        cleanup,
        cleanupAll,
        getStats
    };
};

export default useBlobThumbnails;