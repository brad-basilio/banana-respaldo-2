/**
 * Utilidades para convertir data URLs a Blob URLs
 * Optimiza el uso de memoria manteniendo la compatibilidad con el sistema existente
 */

// Cache de conversiones para evitar duplicados
const conversionCache = new Map();
const blobUrlRegistry = new Map(); // pageId -> blobUrl

/**
 * Convierte un data URL a Blob URL
 * @param {string} dataUrl - El data URL a convertir
 * @param {string} pageId - ID de la página (opcional, para cache)
 * @returns {string} Blob URL
 */
export const dataUrlToBlobUrl = (dataUrl, pageId = null) => {
    // Verificar si ya está convertido
    if (dataUrl.startsWith('blob:')) {
        return dataUrl;
    }
    
    // Verificar cache si tenemos pageId
    if (pageId && conversionCache.has(pageId)) {
        const cached = conversionCache.get(pageId);
        // Verificar que el Blob URL sigue siendo válido
        if (cached.dataUrl === dataUrl && isValidBlobUrl(cached.blobUrl)) {
            console.log(`🔄 [CACHE-HIT] Usando Blob URL cacheado para ${pageId}`);
            return cached.blobUrl;
        } else {
            // Limpiar cache inválido
            conversionCache.delete(pageId);
            if (cached.blobUrl) {
                URL.revokeObjectURL(cached.blobUrl);
            }
        }
    }
    
    try {
        // Extraer el tipo MIME y los datos
        const [header, data] = dataUrl.split(',');
        const mimeMatch = header.match(/data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        
        // Convertir base64 a Uint8Array
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Crear Blob
        const blob = new Blob([bytes], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        
        // Guardar en cache si tenemos pageId
        if (pageId) {
            conversionCache.set(pageId, {
                dataUrl,
                blobUrl,
                timestamp: Date.now(),
                size: bytes.length
            });
            
            blobUrlRegistry.set(pageId, blobUrl);
            
            console.log(`✅ [CONVERSION] Data URL convertido a Blob URL para ${pageId}`);
            console.log(`📊 [CONVERSION] Tamaño: ${(bytes.length / 1024).toFixed(2)} KB`);
        }
        
        return blobUrl;
        
    } catch (error) {
        console.error('❌ [CONVERSION] Error convirtiendo data URL a Blob URL:', error);
        return dataUrl; // Fallback al data URL original
    }
};

/**
 * Verifica si un Blob URL sigue siendo válido
 * @param {string} blobUrl - El Blob URL a verificar
 * @returns {boolean}
 */
const isValidBlobUrl = (blobUrl) => {
    try {
        // Intentar crear una imagen para verificar si el Blob URL es válido
        const img = new Image();
        img.src = blobUrl;
        return true;
    } catch {
        return false;
    }
};

/**
 * Convierte múltiples thumbnails de data URL a Blob URL
 * @param {Object} thumbnails - Objeto con pageId -> dataUrl
 * @returns {Object} Objeto con pageId -> blobUrl
 */
export const convertThumbnailsToBlobUrls = (thumbnails) => {
    const converted = {};
    let totalSaved = 0;
    let convertedCount = 0;
    
    console.log('🔄 [BATCH-CONVERSION] Iniciando conversión masiva de thumbnails...');
    
    Object.entries(thumbnails).forEach(([pageId, dataUrl]) => {
        if (dataUrl && dataUrl.startsWith('data:image/')) {
            const originalSize = dataUrl.length;
            const blobUrl = dataUrlToBlobUrl(dataUrl, pageId);
            
            if (blobUrl !== dataUrl) {
                converted[pageId] = blobUrl;
                totalSaved += originalSize;
                convertedCount++;
            } else {
                converted[pageId] = dataUrl; // Mantener original si falló la conversión
            }
        } else {
            converted[pageId] = dataUrl; // Ya es Blob URL o no es imagen
        }
    });
    
    console.log(`✅ [BATCH-CONVERSION] Conversión completada:`);
    console.log(`📊 [BATCH-CONVERSION] ${convertedCount} thumbnails convertidos`);
    console.log(`💾 [BATCH-CONVERSION] ~${(totalSaved / 1024 / 1024).toFixed(2)} MB liberados de memoria`);
    
    return converted;
};

/**
 * Limpia un Blob URL específico
 * @param {string} pageId - ID de la página
 */
export const revokeBlobUrl = (pageId) => {
    if (conversionCache.has(pageId)) {
        const cached = conversionCache.get(pageId);
        if (cached.blobUrl) {
            URL.revokeObjectURL(cached.blobUrl);
            console.log(`🗑️ [CLEANUP] Blob URL liberado para ${pageId}`);
        }
        conversionCache.delete(pageId);
    }
    
    if (blobUrlRegistry.has(pageId)) {
        const blobUrl = blobUrlRegistry.get(pageId);
        URL.revokeObjectURL(blobUrl);
        blobUrlRegistry.delete(pageId);
    }
};

/**
 * Limpia todos los Blob URLs
 */
export const revokeAllBlobUrls = () => {
    console.log('🧹 [CLEANUP] Limpiando todos los Blob URLs...');
    
    let cleanedCount = 0;
    
    // Limpiar cache de conversiones
    conversionCache.forEach((cached, pageId) => {
        if (cached.blobUrl) {
            URL.revokeObjectURL(cached.blobUrl);
            cleanedCount++;
        }
    });
    conversionCache.clear();
    
    // Limpiar registro
    blobUrlRegistry.forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
    });
    blobUrlRegistry.clear();
    
    console.log(`✅ [CLEANUP] ${cleanedCount} Blob URLs liberados`);
};

/**
 * Obtiene estadísticas del sistema de conversión
 * @returns {Object} Estadísticas
 */
export const getConversionStats = () => {
    const totalCached = conversionCache.size;
    const totalSize = Array.from(conversionCache.values())
        .reduce((sum, cached) => sum + (cached.size || 0), 0);
    
    return {
        totalCached,
        totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        cacheEntries: Array.from(conversionCache.entries()).map(([pageId, cached]) => ({
            pageId,
            size: cached.size,
            timestamp: cached.timestamp,
            age: Date.now() - cached.timestamp
        }))
    };
};

/**
 * Hook para usar en componentes React
 * Convierte automáticamente data URLs a Blob URLs
 */
export const useBlobUrlConverter = () => {
    const convertThumbnail = (dataUrl, pageId) => {
        return dataUrlToBlobUrl(dataUrl, pageId);
    };
    
    const convertMultiple = (thumbnails) => {
        return convertThumbnailsToBlobUrls(thumbnails);
    };
    
    const cleanup = (pageId) => {
        revokeBlobUrl(pageId);
    };
    
    const cleanupAll = () => {
        revokeAllBlobUrls();
    };
    
    const getStats = () => {
        return getConversionStats();
    };
    
    return {
        convertThumbnail,
        convertMultiple,
        cleanup,
        cleanupAll,
        getStats
    };
};

// Exponer funciones globalmente para debugging
if (typeof window !== 'undefined') {
    window.blobUrlConverter = {
        convert: dataUrlToBlobUrl,
        convertMultiple: convertThumbnailsToBlobUrls,
        cleanup: revokeBlobUrl,
        cleanupAll: revokeAllBlobUrls,
        getStats: getConversionStats
    };
}

export default {
    dataUrlToBlobUrl,
    convertThumbnailsToBlobUrls,
    revokeBlobUrl,
    revokeAllBlobUrls,
    getConversionStats,
    useBlobUrlConverter
};