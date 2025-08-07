/**
 * Configuración optimizada para generación de thumbnails
 * Ajusta estos valores según las necesidades de tu aplicación
 */

export const THUMBNAIL_CONFIG = {
    // Configuraciones por tipo de thumbnail
    types: {
        preview: {
            width: 200,
            height: 150,
            scale: 0.5,
            quality: 0.8,
            format: 'png'
        },
        sidebar: {
            width: 160,
            height: 120,
            scale: 0.4,
            quality: 0.7,
            format: 'jpeg'
        },
        high_quality: {
            width: 800,
            height: 600,
            scale: 2,
            quality: 1.0,
            format: 'png'
        },
        pdf: {
            width: 1200,
            height: 900,
            scale: 3,
            quality: 1.0,
            format: 'png'
        }
    },
    
    // Configuración de html2canvas
    html2canvas: {
        base: {
            allowTaint: true,
            useCORS: true,
            logging: false,
            removeContainer: true,
            imageTimeout: 15000,
            backgroundColor: null
        },
        optimized: {
            // Configuración adicional para mejor rendimiento
            foreignObjectRendering: false,
            ignoreElements: (element) => {
                // Ignorar elementos que pueden causar problemas
                const ignoredClasses = [
                    'tooltip',
                    'popover',
                    'modal',
                    'dropdown',
                    'resize-handle',
                    'text-toolbar'
                ];
                
                return ignoredClasses.some(className => 
                    element.classList?.contains(className)
                );
            }
        }
    },
    
    // Configuración de rendimiento
    performance: {
        maxConcurrentGenerations: 2,
        generationDebounce: 1000, // ms
        batchSize: 3,
        batchDelay: 200, // ms entre lotes
        maxRetries: 2,
        retryDelay: 1000 // ms
    },
    
    // Configuración de cache
    cache: {
        maxSize: 50, // máximo número de thumbnails en cache
        ttl: 5 * 60 * 1000, // 5 minutos en ms
        cleanupInterval: 60 * 1000 // 1 minuto en ms
    },
    
    // Configuración de layouts
    layouts: {
        // Mapeo de clases CSS Grid a configuraciones específicas
        gridTemplates: {
            'grid-cols-1': '1fr',
            'grid-cols-2': '1fr 1fr',
            'grid-cols-3': '1fr 1fr 1fr',
            'grid-cols-4': '1fr 1fr 1fr 1fr',
            'grid-cols-5': '1fr 1fr 1fr 1fr 1fr'
        },
        gridRows: {
            'grid-rows-1': '1fr',
            'grid-rows-2': '1fr 1fr',
            'grid-rows-3': '1fr 1fr 1fr'
        },
        // Estilos por defecto para diferentes tipos de layout
        defaultStyles: {
            basic: {
                gap: '16px',
                padding: '16px'
            },
            hero: {
                gap: '8px',
                padding: '8px'
            },
            editorial: {
                gap: '6px',
                padding: '4px'
            },
            minimal: {
                gap: '32px',
                padding: '24px'
            }
        }
    },
    
    // Configuración de fallbacks
    fallbacks: {
        colors: {
            cover: '#8B5CF6',
            content: '#3B82F6',
            final: '#10B981',
            default: '#6B7280'
        },
        dimensions: {
            width: 200,
            height: 150
        }
    },
    
    // Configuración de debugging
    debug: {
        enabled: process.env.NODE_ENV === 'development',
        logLevel: 'info', // 'error', 'warn', 'info', 'debug'
        showStats: true,
        showTimings: true
    }
};

/**
 * Obtiene la configuración para un tipo específico de thumbnail
 */
export const getThumbnailConfig = (type = 'preview') => {
    const baseConfig = THUMBNAIL_CONFIG.types[type] || THUMBNAIL_CONFIG.types.preview;
    const html2canvasConfig = {
        ...THUMBNAIL_CONFIG.html2canvas.base,
        ...THUMBNAIL_CONFIG.html2canvas.optimized,
        scale: baseConfig.scale,
        width: baseConfig.width,
        height: baseConfig.height
    };
    
    return {
        ...baseConfig,
        html2canvas: html2canvasConfig
    };
};

/**
 * Obtiene la configuración de layout CSS Grid
 */
export const getLayoutGridConfig = (layoutTemplate) => {
    const config = {
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr'
    };
    
    // Extraer configuración de columnas
    const colsMatch = layoutTemplate.match(/grid-cols-(\d+)/);
    if (colsMatch) {
        const cols = parseInt(colsMatch[1]);
        config.gridTemplateColumns = Array(cols).fill('1fr').join(' ');
    }
    
    // Extraer configuración de filas
    const rowsMatch = layoutTemplate.match(/grid-rows-(\d+)/);
    if (rowsMatch) {
        const rows = parseInt(rowsMatch[1]);
        config.gridTemplateRows = Array(rows).fill('1fr').join(' ');
    }
    
    return config;
};

/**
 * Valida si una configuración de thumbnail es válida
 */
export const validateThumbnailConfig = (config) => {
    const required = ['width', 'height', 'scale', 'quality'];
    const missing = required.filter(key => !(key in config));
    
    if (missing.length > 0) {
        throw new Error(`Configuración de thumbnail inválida. Faltan: ${missing.join(', ')}`);
    }
    
    if (config.width <= 0 || config.height <= 0) {
        throw new Error('Las dimensiones del thumbnail deben ser positivas');
    }
    
    if (config.scale <= 0 || config.scale > 5) {
        throw new Error('La escala del thumbnail debe estar entre 0 y 5');
    }
    
    if (config.quality < 0 || config.quality > 1) {
        throw new Error('La calidad del thumbnail debe estar entre 0 y 1');
    }
    
    return true;
};

export default THUMBNAIL_CONFIG;