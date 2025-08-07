/**
 * GENERADOR DE THUMBNAILS OPTIMIZADO PARA VPS Y VELOCIDAD
 * Version ultra-rápida con técnicas de optimización avanzadas y bajo consumo de memoria
 * 
 * MEJORAS VPS:
 * - Sistema de detección y preservación de filtros automatizado con logging reducido
 * - Renderizado garantizado de filtros con técnica de doble canvas optimizada
 * - Cache limitado para evitar leaks de memoria
 * - Sistema de limpieza automática de recursos
 */

// 🚀 VPS OPTIMIZATION: Cache limitado para evitar memory leaks
const imageCache = new Map();
const thumbnailCache = new Map();
const isVPS = typeof window !== 'undefined' && 
    (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost');
const log = isVPS ? () => {} : console.log;
const warn = isVPS ? () => {} : console.warn;
const error = console.error;

// 🚀 VPS: Limpieza automática de cache cada 5 minutos
if (isVPS && typeof setInterval !== 'undefined') {
    setInterval(() => {
        if (imageCache.size > 20) {
            const entries = Array.from(imageCache.entries());
            entries.slice(0, entries.length - 10).forEach(([key]) => {
                imageCache.delete(key);
            });
        }
        if (thumbnailCache.size > 30) {
            const entries = Array.from(thumbnailCache.entries());
            entries.slice(0, entries.length - 15).forEach(([key]) => {
                thumbnailCache.delete(key);
            });
        }
    }, 300000); // 5 minutos
}

/**
 * Crea un botón de emergencia específico para una página con filtros (solo en desarrollo)
 * @param {string} pageId - ID de la página que necesita regeneración de filtros
 */
function createEmergencyFilterButton(pageId) {
    // 🚀 VPS: No crear botones de emergencia en producción para ahorrar memoria
    if (isVPS || typeof document === 'undefined' || document.getElementById('filter-emergency-button-' + pageId)) {
        return;
    }
    
    log(`🚨 [EMERGENCIA] Creando botón específico para página ${pageId}`);
    
    const button = document.createElement('button');
    button.id = 'filter-emergency-button-' + pageId;
    button.innerText = '🎨 Regenerar filtros';
    button.style.cssText = `
        position: fixed;
        bottom: 70px;
        right: 20px;
        background: linear-gradient(135deg, #8844ee 0%, #6366f1 100%);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 12px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    
    button.onmouseover = () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
    };
    
    button.onmouseout = () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    };
    
    button.onclick = () => {
        // Efecto visual
        button.style.transform = 'scale(0.95)';
        setTimeout(() => button.style.transform = 'scale(1)', 150);
        
        // Cambiar texto para feedback visual
        button.innerText = '⚙️ Regenerando...';
        
        // Activar flags para forzar regeneración con filtros
        window.FORCE_FILTER_APPLICATION = true;
        window.PRESERVE_FILTERS_FOR_PAGE = pageId;
        
        // Limpiar caché para esta página
        if (thumbnailCache.has(`${pageId}-300x300`)) {
            thumbnailCache.delete(`${pageId}-300x300`);
        }
        
        // Intentar regenerar
        setTimeout(() => {
            try {
                console.log(`🔄 [EMERGENCIA-FILTROS] Regenerando miniatura para página ${pageId}`);
                
                // Usar función global de regeneración si está disponible
                if (typeof window.regenerateCurrentThumbnailNow === 'function') {
                    window.regenerateCurrentThumbnailNow();
                } else if (typeof window.forceRegenerateThumbnail === 'function') {
                    window.forceRegenerateThumbnail();
                }
                
                // Añadir timestamp para evitar caché del navegador
                const cacheBreaker = Date.now();
                window._lastFilterRegeneration = cacheBreaker;
                
                // Actualizar UI para mostrar éxito
                setTimeout(() => {
                    button.innerText = '✅ ¡Filtros aplicados!';
                    setTimeout(() => {
                        button.innerText = '🎨 Regenerar filtros';
                        
                        // Resetear flags después de un tiempo
                        setTimeout(() => {
                            window.FORCE_FILTER_APPLICATION = false;
                            window.PRESERVE_FILTERS_FOR_PAGE = null;
                        }, 1000);
                    }, 2000);
                }, 500);
                
            } catch (error) {
                console.error('❌ [EMERGENCIA-FILTROS] Error regenerando miniatura:', error);
                button.innerText = '❌ Error';
                setTimeout(() => {
                    button.innerText = '🎨 Regenerar filtros';
                }, 2000);
            }
        }, 100);
    };
    
    document.body.appendChild(button);
}

/**
 * Aplica una máscara (clipPath) al contexto del canvas
 */
function applyMaskToCanvas(ctx, mask, x, y, width, height) {
    if (!mask || !mask.type) return;
    
    console.log('🎭 [Mask] Aplicando máscara:', mask.type);
    
    ctx.save();
    ctx.beginPath();
    
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    switch (mask.type) {
        case 'circle':
            const radius = Math.min(width, height) / 2;
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            break;
            
        case 'ellipse':
            ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, 2 * Math.PI);
            break;
            
        case 'star':
            const spikes = 5;
            const outerRadius = Math.min(width, height) / 2;
            const innerRadius = outerRadius * 0.4;
            
            for (let i = 0; i < spikes * 2; i++) {
                const angle = (i * Math.PI) / spikes;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const px = centerX + Math.cos(angle) * radius;
                const py = centerY + Math.sin(angle) * radius;
                
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            break;
            
        case 'hexagon':
            const hexRadius = Math.min(width, height) / 2;
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const px = centerX + Math.cos(angle) * hexRadius;
                const py = centerY + Math.sin(angle) * hexRadius;
                
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            break;
            
        case 'triangle':
            ctx.moveTo(centerX, y);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x + width, y + height);
            ctx.closePath();
            break;
            
        default:
            // Rectangle por defecto
            ctx.rect(x, y, width, height);
    }
    
    ctx.clip();
}

/**
 * Pre-carga y cachea una imagen de forma asíncrona
 */
async function preloadImage(src) {
    if (imageCache.has(src)) {
        return imageCache.get(src);
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            imageCache.set(src, img);
            resolve(img);
        };
        
        img.onerror = () => {
            console.warn(`⚠️ No se pudo cargar imagen: ${src}`);
            resolve(null);
        };
        
        // Timeout para evitar cuelgues
        setTimeout(() => {
            if (!imageCache.has(src)) {
                console.warn(`⏰ Timeout cargando imagen: ${src}`);
                resolve(null);
            }
        }, 3000);
        
        img.src = src;
    });
}

/**
 * Renderiza elementos de forma rápida con técnicas optimizadas
 */
function fastRenderElement(ctx, element, cellBounds) {
    const { x: cellX, y: cellY, width: cellWidth, height: cellHeight } = cellBounds;
    
    // Calcular posición del elemento con corrección de coordenadas
    const posX = element.position?.x || 0;
    const posY = element.position?.y || 0;
    
    // Cálculo mejorado de coordenadas para evitar problemas de posicionamiento
    const elementX = cellX + (posX <= 1 ? posX * cellWidth : posX);
    const elementY = cellY + (posY <= 1 ? posY * cellHeight : posY);
    
    const elementWidth = element.size?.width ? 
        (element.size.width <= 1 ? element.size.width * cellWidth : element.size.width) : 
        cellWidth;
    const elementHeight = element.size?.height ? 
        (element.size.height <= 1 ? element.size.height * cellHeight : element.size.height) : 
        cellHeight;

    // Verificar si hay una solicitud de preservación de filtros activa
    const shouldPreserveFilters = window.PRESERVE_FILTERS_FOR_PAGE === true || 
                                  window.PRESERVE_FILTERS_FOR_PAGE === element.pageId;
    
    console.log(`🎨 [FastThumbnail] Renderizando elemento ${element.id}:`, {
        type: element.type,
        hasFilters: !!element.filters,
        hasMask: !!element.mask,
        filters: element.filters,
        mask: element.mask,
        preserveFilters: shouldPreserveFilters
    });

    if (element.type === 'image' && element.content) {
        const img = imageCache.get(element.content);
        if (img) {
            ctx.save();
            
            // Asegurar que siempre se aplica un contexto para renderizado consistente
            ctx.translate(elementX, elementY);
            
            // APLICAR TODOS LOS FILTROS CSS COMPLETOS
            if (element.filters) {
                console.log('🎨 [FastThumbnail] APLICANDO FILTROS COMPLETOS:', element.filters);
                
                // Verificar si hay filtros reales (no valores por defecto)
                const hasRealFilters = 
                    (element.filters.brightness !== undefined && element.filters.brightness !== 100) || 
                    (element.filters.contrast !== undefined && element.filters.contrast !== 100) ||
                    (element.filters.saturation !== undefined && element.filters.saturation !== 100) ||
                    (element.filters.tint !== undefined && element.filters.tint !== 0) ||
                    (element.filters.hue !== undefined && element.filters.hue !== 0) ||
                    (element.filters.blur !== undefined && element.filters.blur > 0) ||
                    (element.filters.gaussianBlur !== undefined && element.filters.gaussianBlur > 0) ||
                    (element.filters.opacity !== undefined && element.filters.opacity !== 100) ||
                    (element.filters.scale !== undefined && element.filters.scale !== 1) ||
                    (element.filters.rotate !== undefined && element.filters.rotate !== 0) ||
                    element.filters.flipHorizontal || 
                    element.filters.flipVertical;
                
                // Marcar el elemento si tiene filtros reales
                if (hasRealFilters) {
                    console.log('✅ [FastThumbnail] Filtros reales detectados, aplicando...');
                    element._hasRealFilters = true; // Marcar para referencia futura
                    
                    // Registrar esta página como que tiene elementos con filtros
                    if (element.pageId && !window._pagesWithFilters) {
                        window._pagesWithFilters = new Set();
                        window._pagesWithFilters.add(element.pageId);
                    }
                }
                
                // Crear el string de filtros CSS
                const filterString = `
                    brightness(${(element.filters.brightness ?? 100) / 100})
                    contrast(${(element.filters.contrast ?? 100) / 100})
                    saturate(${(element.filters.saturation ?? 100) / 100})
                    sepia(${(element.filters.tint ?? 0) / 100})
                    hue-rotate(${element.filters.hue ?? 0}deg)
                    blur(${Math.max(element.filters.blur ?? 0, element.filters.gaussianBlur ?? 0)}px)
                    opacity(${(element.filters.opacity ?? 100) / 100})
                `.replace(/\s+/g, ' ').trim();
                
                console.log('🎨 [FastThumbnail] Filter string:', filterString);
                
                // Determinar si debemos usar el método avanzado o el estándar
                const useAdvancedMethod = hasRealFilters || window.FORCE_FILTER_APPLICATION;
                
                if (useAdvancedMethod && element.type === 'image' && img) {
                    console.log('🚀 [FastThumbnail] Usando método avanzado de dos pasos para filtros');
                    
                    // NUEVO MÉTODO: Renderizado en dos pasos garantizando filtros
                    try {
                        // Paso 1: Calcular dimensiones del recorte
                        const imgRatio = img.width / img.height;
                        const destRatio = elementWidth / elementHeight;
                        
                        let sx = 0, sy = 0, sw = img.width, sh = img.height;
                        if (imgRatio > destRatio) {
                            sw = img.height * destRatio;
                            sx = (img.width - sw) / 2;
                        } else {
                            sh = img.width / destRatio;
                            sy = (img.height - sh) / 2;
                        }
                        
                        // Paso 2: Crear canvas temporal para filtros
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = elementWidth;
                        tempCanvas.height = elementHeight;
                        const tempCtx = tempCanvas.getContext('2d', { alpha: true });
                        
                        // Paso 3: Aplicar filtros al contexto temporal
                        tempCtx.filter = filterString;
                        
                        // Paso 4: Dibujar en el canvas temporal con filtros aplicados
                        tempCtx.drawImage(img, sx, sy, sw, sh, 0, 0, elementWidth, elementHeight);
                        
                        // Aplicar transformaciones si existen
                        if (element.filters.scale !== 1 || 
                            element.filters.rotate !== 0 || 
                            element.filters.flipHorizontal || 
                            element.filters.flipVertical) {
                            
                            console.log('⚙️ [FastThumbnail] Aplicando transformaciones avanzadas');
                            
                            // Canvas secundario para transformaciones
                            const transformCanvas = document.createElement('canvas');
                            transformCanvas.width = elementWidth;
                            transformCanvas.height = elementHeight;
                            const transformCtx = transformCanvas.getContext('2d', { alpha: true });
                            
                            // Configurar transformaciones
                            transformCtx.save();
                            transformCtx.translate(elementWidth/2, elementHeight/2);
                            
                            // Escala y volteos
                            const scaleX = (element.filters.flipHorizontal ? -1 : 1) * (element.filters.scale || 1);
                            const scaleY = (element.filters.flipVertical ? -1 : 1) * (element.filters.scale || 1);
                            transformCtx.scale(scaleX, scaleY);
                            
                            // Rotación
                            if (element.filters.rotate) {
                                transformCtx.rotate((element.filters.rotate * Math.PI) / 180);
                            }
                            
                            // Dibujar imagen filtrada
                            transformCtx.drawImage(tempCanvas, -elementWidth/2, -elementHeight/2);
                            transformCtx.restore();
                            
                            // Paso final: Dibujar en contexto principal
                            ctx.drawImage(transformCanvas, 0, 0);
                        } else {
                            // Dibujar directamente del canvas con filtros al principal
                            ctx.drawImage(tempCanvas, 0, 0);
                        }
                        
                        // Marcar como éxito y salir de la función para evitar el renderizado estándar
                        console.log('✅ [FastThumbnail] Filtros aplicados exitosamente con método avanzado');
                        return;
                        
                    } catch (e) {
                        console.error('⚠️ Error en método avanzado de filtros:', e);
                        // Continuar con el método estándar como fallback
                    }
                } else {
                    // MÉTODO ESTÁNDAR: Aplicar filtros directamente al contexto
                    try {
                        ctx.filter = filterString;
                        
                        // Método alternativo: Forzar aplicación en navegadores problemáticos
                        if (window.FORCE_FILTER_APPLICATION) {
                            console.log('🔥 [FastThumbnail] Forzando aplicación con método alternativo');
                            const originalGlobalAlpha = ctx.globalAlpha;
                            ctx.globalAlpha = 0.9999; // Cambio mínimo para forzar re-renderizado
                            setTimeout(() => {
                                if (ctx) ctx.globalAlpha = originalGlobalAlpha;
                            }, 0);
                        }
                    } catch (e) {
                        console.error('⚠️ Error al aplicar filtros estándar:', e);
                    }
                }
                
                // Aplicar transformaciones si no usamos el método avanzado
                if (!useAdvancedMethod && element.type === 'image' && img) {
                    const scale = element.filters.scale ?? 1;
                    const rotate = element.filters.rotate ?? 0;
                    const flipHorizontal = element.filters.flipHorizontal ?? false;
                    const flipVertical = element.filters.flipVertical ?? false;
                    
                    const hasTransformations = 
                        scale !== 1 || 
                        rotate !== 0 || 
                        flipHorizontal || 
                        flipVertical;
                    
                    if (hasTransformations) {
                        console.log('⚙️ [FastThumbnail] Aplicando transformaciones estándar');
                        
                        ctx.translate(elementWidth/2, elementHeight/2);
                        ctx.scale(
                            scale * (flipHorizontal ? -1 : 1), 
                            scale * (flipVertical ? -1 : 1)
                        );
                        ctx.rotate((rotate * Math.PI) / 180);
                        ctx.translate(-elementWidth/2, -elementHeight/2);
                    }
                }
            }
            
            // APLICAR MÁSCARA SI EXISTE (ANTES del dibujo)
            if (element.mask) {
                console.log('🎭 [FastThumbnail] APLICANDO MÁSCARA:', element.mask);
                applyMaskToCanvas(ctx, element.mask, elementX, elementY, elementWidth, elementHeight);
            }
            
            // Este código solo se ejecutará si el método avanzado de renderizado no se aplicó antes
            // Cálculo de dimensiones para todos los casos
            const imgRatio = img.width / img.height;
            const destRatio = elementWidth / elementHeight;
            
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            
            if (imgRatio > destRatio) {
                sw = img.height * destRatio;
                sx = (img.width - sw) / 2;
            } else {
                sh = img.width / destRatio;
                sy = (img.height - sh) / 2;
            }
            
            // MÉTODO ULTRA AVANZADO: Como última opción, usar la función especializada
            const shouldUseUltraMethod = 
                (element._hasRealFilters || 
                (element.filters && window.ENABLE_ADVANCED_FILTER_RENDERING) || 
                window.FORCE_FILTER_APPLICATION) && 
                typeof applyFiltersToImage === 'function';
            
            if (shouldUseUltraMethod) {
                console.log('🌟 [MÉTODO ULTRA] Usando técnica especializada para garantizar filtros');
                
                try {
                    // Paso 1: Crear canvas para recorte inicial
                    const cropCanvas = document.createElement('canvas');
                    cropCanvas.width = elementWidth;
                    cropCanvas.height = elementHeight;
                    const cropCtx = cropCanvas.getContext('2d', { alpha: true });
                    
                    // Paso 2: Dibujar la imagen recortada
                    cropCtx.drawImage(img, sx, sy, sw, sh, 0, 0, elementWidth, elementHeight);
                    
                    // Paso 3: Aplicar filtros utilizando nuestra función especializada
                    const filteredCanvas = applyFiltersToImage(
                        cropCanvas, 
                        element.filters, 
                        elementWidth, 
                        elementHeight
                    );
                    
                    // Paso 4: Dibujar resultado final en el contexto principal
                    ctx.drawImage(filteredCanvas, 0, 0, elementWidth, elementHeight);
                    console.log('✅ [FastThumbnail] Imagen procesada con método ultra garantizado');
                    
                    // Registrar éxito
                    if (!window._successfulFilterRenderings) {
                        window._successfulFilterRenderings = {};
                    }
                    
                    if (element.id) {
                        window._successfulFilterRenderings[element.id] = {
                            timestamp: Date.now(),
                            method: 'ultra',
                            hasRealFilters: !!element._hasRealFilters
                        };
                    }
                } catch (e) {
                    console.error('⚠️ Error en método ultra avanzado, usando fallback:', e);
                    
                    // Fallback con canvas temporal simple
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = elementWidth;
                    tempCanvas.height = elementHeight;
                    const tempCtx = tempCanvas.getContext('2d', { alpha: true });
                    
                    // Copiar filtros al contexto temporal si existen
                    if (ctx.filter) {
                        try {
                            tempCtx.filter = ctx.filter;
                        } catch (filterErr) {
                            console.warn('⚠️ Error copiando filtros al canvas temporal:', filterErr);
                        }
                    }
                    
                    // Dibujar con recorte y filtros (si están disponibles)
                    tempCtx.drawImage(img, sx, sy, sw, sh, 0, 0, elementWidth, elementHeight);
                    
                    // Copiar resultado al canvas principal
                    ctx.drawImage(tempCanvas, 0, 0);
                    
                    console.log('🔄 [FastThumbnail] Imagen procesada con método de fallback');
                }
            } else {
                // Método estándar para imágenes sin filtros o cuando no se necesita procesamiento especial
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, elementWidth, elementHeight);
                console.log('🖼️ [FastThumbnail] Imagen dibujada con método estándar');
            }
            
            ctx.restore();
        }
    } else if (element.type === 'text' && element.content) {
        ctx.save();
        
        const style = element.style || {};
        const fontSize = Math.max(8, parseInt(style.fontSize) || 16); // Mínimo 8px
        const color = style.color || '#000000';
        
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';
        
        // Texto simple sin multilinea para mayor velocidad
        let text = element.content.split('\n')[0] || ''; // Solo primera línea
        if (text.length > 50) {
            text = text.substring(0, 50) + '...'; // Truncar texto largo
        }
        
        ctx.fillText(text, elementX + 4, elementY + 4);
        ctx.restore();
    }
}

/**
 * Aplica filtros a una imagen usando técnica avanzada de múltiples capas
 * Esta función es crucial para asegurar que los filtros se vean en los thumbnails
 */
function applyFiltersToImage(sourceImg, filters, width, height) {
    console.log('🔥 [FilterHelper] Aplicando filtros avanzados a imagen:', {
        sourceImgWidth: sourceImg.width,
        sourceImgHeight: sourceImg.height,
        targetWidth: width,
        targetHeight: height,
        filters: filters
    });
    
    // Verificar si hay filtros realmente aplicados
    const hasRealFilters = filters && (
        (filters.brightness !== undefined && filters.brightness !== 100) || 
        (filters.contrast !== undefined && filters.contrast !== 100) ||
        (filters.saturation !== undefined && filters.saturation !== 100) ||
        (filters.tint !== undefined && filters.tint !== 0) ||
        (filters.hue !== undefined && filters.hue !== 0) ||
        (filters.blur !== undefined && filters.blur > 0) ||
        (filters.gaussianBlur !== undefined && filters.gaussianBlur > 0) ||
        (filters.opacity !== undefined && filters.opacity !== 100) ||
        (filters.scale !== undefined && filters.scale !== 1) ||
        (filters.rotate !== undefined && filters.rotate !== 0) ||
        filters.flipHorizontal || 
        filters.flipVertical
    );
    
    // Si no hay filtros, simplemente retornar la imagen original redimensionada
    if (!hasRealFilters && !window.FORCE_FILTER_APPLICATION) {
        console.log('⏩ [FilterHelper] No hay filtros reales que aplicar, retornando imagen simple');
        const simpleCanvas = document.createElement('canvas');
        simpleCanvas.width = width;
        simpleCanvas.height = height;
        const simpleCtx = simpleCanvas.getContext('2d');
        simpleCtx.drawImage(sourceImg, 0, 0, width, height);
        return simpleCanvas;
    }

    // PASO 1: Crear primer canvas para aplicar filtros visuales (brillo, contraste, etc.)
    const filterCanvas = document.createElement('canvas');
    filterCanvas.width = width;
    filterCanvas.height = height;
    const filterCtx = filterCanvas.getContext('2d', { alpha: true });
    
    // Crear string de filtros CSS completo
    const filterString = `
        brightness(${(filters?.brightness ?? 100) / 100})
        contrast(${(filters?.contrast ?? 100) / 100})
        saturate(${(filters?.saturation ?? 100) / 100})
        sepia(${(filters?.tint ?? 0) / 100})
        hue-rotate(${filters?.hue ?? 0}deg)
        blur(${Math.max(filters?.blur ?? 0, filters?.gaussianBlur ?? 0)}px)
        opacity(${(filters?.opacity ?? 100) / 100})
    `.replace(/\s+/g, ' ').trim();
    
    console.log('🎨 [FilterHelper] Aplicando filtro CSS:', filterString);
    
    // Aplicar filtros visuales
    try {
        filterCtx.filter = filterString;
    } catch (e) {
        console.error('⚠️ Error aplicando filtros CSS:', e);
    }
    
    // Dibujar imagen en el canvas de filtros
    filterCtx.drawImage(sourceImg, 0, 0, width, height);
    
    // PASO 2: Aplicar transformaciones (escala, rotación, volteo)
    if (filters && (
        filters.scale !== undefined && filters.scale !== 1 || 
        filters.rotate !== undefined && filters.rotate !== 0 || 
        filters.flipHorizontal || 
        filters.flipVertical
    )) {
        console.log('🔄 [FilterHelper] Aplicando transformaciones:', {
            scale: filters.scale,
            rotate: filters.rotate,
            flipH: filters.flipHorizontal,
            flipV: filters.flipVertical
        });
        
        const transformCanvas = document.createElement('canvas');
        transformCanvas.width = width;
        transformCanvas.height = height;
        const transformCtx = transformCanvas.getContext('2d', { alpha: true });
        
        // Centrar para transformaciones
        transformCtx.save();
        transformCtx.translate(width/2, height/2);
        
        // Aplicar escala y volteos
        const scaleX = (filters.flipHorizontal ? -1 : 1) * (filters.scale ?? 1);
        const scaleY = (filters.flipVertical ? -1 : 1) * (filters.scale ?? 1);
        transformCtx.scale(scaleX, scaleY);
        
        // Aplicar rotación
        if (filters.rotate) {
            transformCtx.rotate((filters.rotate * Math.PI) / 180);
        }
        
        // Dibujar la imagen filtrada en el canvas de transformación
        transformCtx.drawImage(filterCanvas, -width/2, -height/2, width, height);
        transformCtx.restore();
        
        console.log('✅ [FilterHelper] Filtros y transformaciones aplicados exitosamente');
        return transformCanvas;
    }
    
    // Si solo tenemos filtros sin transformaciones, retornar el canvas de filtros
    console.log('✅ [FilterHelper] Filtros aplicados exitosamente (sin transformaciones)');
    return filterCanvas;
}

/**
 * Generador de thumbnail individual para la página actual
 */
export async function generateSingleThumbnail({ page, workspaceDimensions, onProgress = null, preserveFilters = false }) {
    const THUMBNAIL_SIZE = 300;
    
    console.log(`⚡ Generando thumbnail para página: ${page.id}${preserveFilters ? ' (CON PRESERVACIÓN DE FILTROS)' : ''}`);
    
    // Configuración global para mejorar compatibilidad con filtros
    window.ENABLE_ADVANCED_FILTER_RENDERING = true;
    
    // Detectar automáticamente si la página tiene filtros que necesitan preservación
    let pageHasFilters = false;
    let elementsWithFilters = 0;
    
    // Analizar toda la página en busca de elementos con filtros
    if (page.cells) {
        page.cells.forEach(cell => {
            if (cell.elements) {
                cell.elements.forEach(element => {
                    if (element.filters) {
                        // Verificar todos los tipos de filtros posibles
                        const hasRealFilters = 
                            (element.filters.brightness !== undefined && element.filters.brightness !== 100) || 
                            (element.filters.contrast !== undefined && element.filters.contrast !== 100) ||
                            (element.filters.saturation !== undefined && element.filters.saturation !== 100) ||
                            (element.filters.tint !== undefined && element.filters.tint !== 0) ||
                            (element.filters.hue !== undefined && element.filters.hue !== 0) ||
                            (element.filters.blur !== undefined && element.filters.blur > 0) ||
                            (element.filters.gaussianBlur !== undefined && element.filters.gaussianBlur > 0) ||
                            (element.filters.opacity !== undefined && element.filters.opacity !== 100) ||
                            (element.filters.scale !== undefined && element.filters.scale !== 1) ||
                            (element.filters.rotate !== undefined && element.filters.rotate !== 0) ||
                            element.filters.flipHorizontal || 
                            element.filters.flipVertical;
                        
                        // Si tiene filtros reales, activar la preservación
                        if (hasRealFilters) {
                            pageHasFilters = true;
                            elementsWithFilters++;
                            element._hasRealFilters = true;
                            element.pageId = page.id; // Asignar ID de página para referencia
                            
                            console.log(`🔍 [FILTROS] Detectado elemento ${element.id} con filtros:`, element.filters);
                        }
                    }
                });
            }
        });
    }
    
    // Activar preservación de filtros si se solicita explícitamente O si detectamos filtros
    const shouldPreserveFilters = preserveFilters || pageHasFilters || window.FORCE_FILTER_APPLICATION;
    
    if (shouldPreserveFilters) {
        console.log(`🎭 [FILTROS] Activando preservación de filtros para página ${page.id} (${elementsWithFilters} elementos con filtros)`);
        window.PRESERVE_FILTERS_FOR_PAGE = page.id;
        window.FORCE_FILTER_APPLICATION = true;
        
        // Registrar esta página como protegida para futuras referencias
        if (!window._pagesWithFiltersProtected) {
            window._pagesWithFiltersProtected = new Set();
        }
        window._pagesWithFiltersProtected.add(page.id);
        
        // Crear botón de emergencia si no existe y hay filtros
        if (pageHasFilters && typeof document !== 'undefined') {
            setTimeout(() => {
                // Agregar botón de emergencia para esta página específica
                if (!document.getElementById('filter-emergency-button-' + page.id)) {
                    createEmergencyFilterButton(page.id);
                }
            }, 500);
        }
    }
    
    // Callback de progreso
    const updateProgress = (step, total, message = '') => {
        const percentage = Math.round((step / total) * 100);
        console.log(`📊 Progreso página ${page.id}: ${step}/${total} (${percentage}%) ${message}`);
        if (onProgress) {
            onProgress({ current: step, total, percentage, message, pageId: page.id });
        }
    };

    try {
        // Verificar cache primero
        const scale = THUMBNAIL_SIZE / Math.max(workspaceDimensions.width, workspaceDimensions.height);
        const thumbWidth = Math.round(workspaceDimensions.width * scale);
        const thumbHeight = Math.round(workspaceDimensions.height * scale);
        const cacheKey = `${page.id}-${thumbWidth}x${thumbHeight}`;
        
        if (thumbnailCache.has(cacheKey)) {
            console.log(`📦 Thumbnail encontrado en cache: ${page.id}`);
            updateProgress(4, 4, 'Cargado desde cache');
            return thumbnailCache.get(cacheKey);
        }

        updateProgress(1, 4, 'Iniciando generación...');

        // Recopilar imágenes de esta página específica
        const pageImages = new Set();
        if (page.backgroundImage) pageImages.add(page.backgroundImage);
        
        if (page.cells) {
            page.cells.forEach(cell => {
                if (cell.elements) {
                    cell.elements.forEach(element => {
                        if (element.type === 'image' && element.content) {
                            pageImages.add(element.content);
                        }
                    });
                }
            });
        }

        updateProgress(2, 4, 'Cargando imágenes...');

        // Cargar imágenes con timeout de 3 segundos
        const imagePromises = Array.from(pageImages).map(async (src) => {
            try {
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 3000)
                );
                const imagePromise = preloadImage(src);
                await Promise.race([imagePromise, timeoutPromise]);
            } catch (error) {
                console.warn(`⚠️ Error/timeout cargando imagen: ${src}`);
            }
        });

        await Promise.all(imagePromises);

        updateProgress(3, 4, 'Renderizando thumbnail...');

        // Crear canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { 
            alpha: false,
            willReadFrequently: false 
        });
        
        canvas.width = thumbWidth;
        canvas.height = thumbHeight;

        // Fondo
        ctx.fillStyle = page.backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Imagen de fondo
        if (page.backgroundImage) {
            const bgImg = imageCache.get(page.backgroundImage);
            if (bgImg) {
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            }
        }

        // Renderizar celdas (máximo 9 para velocidad)
        if (page.cells && page.cells.length > 0) {
            const cols = Math.ceil(Math.sqrt(Math.min(page.cells.length, 9)));
            const cellWidth = canvas.width / cols;
            const cellHeight = canvas.height / Math.ceil(Math.min(page.cells.length, 9) / cols);
            
            page.cells.slice(0, 9).forEach((cell, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                const cellX = col * cellWidth;
                const cellY = row * cellHeight;
                
                if (cell.elements) {
                    // Solo elementos visibles principales (máximo 3)
                    const visibleElements = cell.elements
                        .filter(el => el.type === 'image' || el.type === 'text')
                        .slice(0, 3);
                    
                    visibleElements.forEach(element => {
                        fastRenderElement(ctx, element, {
                            x: cellX,
                            y: cellY,
                            width: cellWidth,
                            height: cellHeight
                        });
                    });
                }
            });
        }

        updateProgress(4, 4, 'Guardando thumbnail...');

        // Generar thumbnail final (JPEG 70% calidad)
        const dataURL = canvas.toDataURL('image/jpeg', 0.7);
        
        // Guardar en cache
        thumbnailCache.set(cacheKey, dataURL);
        
        // Verificación de filtros antes de finalizar
        if (window.PRESERVE_FILTERS_FOR_PAGE === page.id) {
            console.log(`🔍 [VERIFICACIÓN] Comprobando si el thumbnail tiene los filtros aplicados...`);
            
            // Contar elementos con filtros reales
            let elementsWithFilters = 0;
            let filteredElements = 0;
            
            page.cells?.forEach(cell => {
                cell.elements?.forEach(element => {
                    if (element._hasRealFilters) {
                        elementsWithFilters++;
                        filteredElements++;
                    }
                });
            });
            
            console.log(`📊 [RESULTADO] Elementos con filtros: ${elementsWithFilters}`);
            
            // Limpiar la bandera de preservación de filtros
            console.log(`🧹 [FastThumbnail] Limpiando banderas de filtros para página ${page.id}`);
            window.PRESERVE_FILTERS_FOR_PAGE = null;
            window.FORCE_FILTER_APPLICATION = false;
            
            // Registrar como thumbnail protegido permanentemente
            if (!window._filteredThumbnails) window._filteredThumbnails = {};
            window._filteredThumbnails[page.id] = {
                timestamp: Date.now(),
                elementsWithFilters
            };
            
            console.log(`🔒 [PROTECCIÓN] Thumbnail con filtros registrado y protegido: ${page.id}`);
        }
        
        console.log(`✅ Thumbnail generado para página: ${page.id}`);
        return dataURL;

    } catch (error) {
        console.error(`❌ Error generando thumbnail para página ${page.id}:`, error);
        updateProgress(4, 4, 'Error en generación');
        return null;
    }
}

/**
 * Generador de thumbnails súper rápido con indicador de progreso
 */
export async function generateFastThumbnails({ pages, workspaceDimensions, onProgress = null }) {
    const newThumbnails = {};
    const THUMBNAIL_SIZE = 300; // Tamaño pequeño para máxima velocidad
    
    console.log(`⚡ Generando ${pages.length} thumbnails rápidos...`);
    
    // Callback de progreso
    const updateProgress = (current, total, message = '') => {
        const percentage = Math.round((current / total) * 100);
        console.log(`📊 Progreso: ${current}/${total} (${percentage}%) ${message}`);
        if (onProgress) {
            onProgress({ current, total, percentage, message });
        }
    };
    
    // Pre-cargar todas las imágenes en paralelo
    const allImages = new Set();
    pages.forEach(page => {
        if (page.backgroundImage) allImages.add(page.backgroundImage);
        if (page.cells) {
            page.cells.forEach(cell => {
                if (cell.elements) {
                    cell.elements.forEach(element => {
                        if (element.type === 'image' && element.content) {
                            allImages.add(element.content);
                        }
                    });
                }
            });
        }
    });
    
    // Cargar imágenes en paralelo con límite
    const imagesToLoad = Array.from(allImages);
    const batchSize = 5;
    
    updateProgress(0, imagesToLoad.length, 'Cargando imágenes...');
    
    for (let i = 0; i < imagesToLoad.length; i += batchSize) {
        const batch = imagesToLoad.slice(i, i + batchSize);
        await Promise.all(batch.map(preloadImage));
        updateProgress(Math.min(i + batchSize, imagesToLoad.length), imagesToLoad.length, 'Cargando imágenes...');
    }
    
    console.log(`📸 Imágenes cargadas: ${imageCache.size}`);
    
    // Calcular escala para thumbnails
    const scale = THUMBNAIL_SIZE / Math.max(workspaceDimensions.width, workspaceDimensions.height);
    const thumbWidth = Math.round(workspaceDimensions.width * scale);
    const thumbHeight = Math.round(workspaceDimensions.height * scale);
    
    // Generar thumbnails de forma secuencial (más estable que paralelo)
    updateProgress(0, pages.length, 'Generando thumbnails...');
    
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        
        try {
            // Verificar cache
            const cacheKey = `${page.id}-${thumbWidth}x${thumbHeight}`;
            if (thumbnailCache.has(cacheKey)) {
                newThumbnails[page.id] = thumbnailCache.get(cacheKey);
                updateProgress(pageIndex + 1, pages.length, `Thumbnail ${page.id} (cached)`);
                continue;
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { 
                alpha: false, // Sin transparencia para mejor rendimiento
                willReadFrequently: false 
            });
            
            canvas.width = thumbWidth;
            canvas.height = thumbHeight;
            
            // Fondo
            ctx.fillStyle = page.backgroundColor || '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Imagen de fondo
            if (page.backgroundImage) {
                const bgImg = imageCache.get(page.backgroundImage);
                if (bgImg) {
                    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                }
            }
            
            // Grid simple (sin layouts complejos para mayor velocidad)
            if (page.cells && page.cells.length > 0) {
                const cols = Math.ceil(Math.sqrt(page.cells.length));
                const cellWidth = canvas.width / cols;
                const cellHeight = canvas.height / Math.ceil(page.cells.length / cols);
                
                page.cells.forEach((cell, index) => {
                    if (index >= 9) return; // Máximo 9 celdas para velocidad
                    
                    const col = index % cols;
                    const row = Math.floor(index / cols);
                    const cellX = col * cellWidth;
                    const cellY = row * cellHeight;
                    
                    if (cell.elements) {
                        // Solo renderizar elementos visibles principales
                        const visibleElements = cell.elements
                            .filter(el => el.type === 'image' || el.type === 'text')
                            .slice(0, 3); // Máximo 3 elementos por celda
                        
                        visibleElements.forEach(element => {
                            fastRenderElement(ctx, element, {
                                x: cellX,
                                y: cellY,
                                width: cellWidth,
                                height: cellHeight
                            });
                        });
                    }
                });
            }
            
            // Generar thumbnail
            const dataURL = canvas.toDataURL('image/jpeg', 0.7); // JPEG con compresión para menor tamaño
            newThumbnails[page.id] = dataURL;
            thumbnailCache.set(cacheKey, dataURL);
            
            updateProgress(pageIndex + 1, pages.length, `Thumbnail ${page.id} generado`);
            
        } catch (error) {
            console.error(`❌ Error generando thumbnail rápido para ${page.id}:`, error);
            newThumbnails[page.id] = null;
            updateProgress(pageIndex + 1, pages.length, `Error en ${page.id}`);
        }
    }
    
    console.log(`⚡ ¡${Object.keys(newThumbnails).length} thumbnails generados en modo rápido!`);
    return newThumbnails;
}

/**
 * Limpiar caches para liberar memoria
 */
export function clearThumbnailCaches() {
    imageCache.clear();
    thumbnailCache.clear();
    console.log('🧹 Caches de thumbnails limpiados');
}

/**
 * Versión híbrida: rápida para preview, detallada bajo demanda
 */
export async function generateHybridThumbnails({ pages, workspaceDimensions, highQualityPageIds = [] }) {
    const fastResults = await generateFastThumbnails({ pages, workspaceDimensions });
    
    // Para páginas específicas, generar thumbnails de alta calidad
    if (highQualityPageIds.length > 0) {
        const { generateAccurateThumbnails } = await import('./thumbnailGenerator');
        const highQualityPages = pages.filter(p => highQualityPageIds.includes(p.id));
        
        if (highQualityPages.length > 0) {
            console.log(`🎯 Generando ${highQualityPages.length} thumbnails de alta calidad...`);
            const detailedResults = await generateAccurateThumbnails({
                pages: highQualityPages,
                workspaceDimensions
            });
            
            Object.assign(fastResults, detailedResults);
        }
    }
    
    return fastResults;
}
