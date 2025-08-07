/**
 * SISTEMA OPTIMIZADO VPS DE FORZADO DE FILTROS EN THUMBNAILS
 * Versión optimizada para VPS con menor consumo de memoria
 */

// 🚀 VPS OPTIMIZATION: Detectar ambiente y optimizar logging
const isVPS = typeof window !== 'undefined' && 
    (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost');
const log = isVPS ? () => {} : console.log;
const warn = isVPS ? () => {} : console.warn;
const error = console.error; // Errores siempre visibles

log('🔥 [FORCE FILTER RENDERER] Sistema radical cargado' + (isVPS ? ' (VPS mode)' : ''));

/**
 * Aplica filtros usando manipulación directa de píxeles (método infalible optimizado VPS)
 */
function applyFiltersDirectly(canvas, filters) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    log('🎨 [PIXEL MANIPULATION] Aplicando filtros directamente a píxeles:', filters);
    log('🔍 [DEBUGGING] Valores exactos recibidos:', {
        brightness: filters.brightness,
        contrast: filters.contrast,
        saturation: filters.saturation,
        hue: filters.hue,
        tint: filters.tint,
        opacity: filters.opacity
    });
    
    // Convertir filtros a valores normalizados CON VALIDACIÓN
    const brightness = Math.max(0, Math.min(10, (filters.brightness ?? 100) / 100)); // 0-10 range
    const contrast = Math.max(0, Math.min(10, (filters.contrast ?? 100) / 100));     // 0-10 range
    const saturation = Math.max(0, Math.min(10, (filters.saturation ?? 100) / 100)); // 0-10 range
    const hue = ((filters.hue ?? 0) % 360) * Math.PI / 180; // Convert to radians, wrap at 360
    const tint = Math.max(0, Math.min(1, (filters.tint ?? 0) / 100));               // 0-1 range
    const opacity = Math.max(0, Math.min(1, (filters.opacity ?? 100) / 100));       // 0-1 range
    
    log('⚙️ [NORMALIZED VALUES] Valores normalizados para aplicar:', {
        brightness: brightness,
        contrast: contrast,
        saturation: saturation,
        hue: hue + ' rad (' + ((filters.hue ?? 0)) + '°)',
        tint: tint,
        opacity: opacity
    });
    
    // Función para convertir RGB a HSL
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h, s, l];
    }
    
    // Función para convertir HSL a RGB
    function hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    
    // Procesar cada píxel
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        let a = data[i + 3];
        
        // Aplicar brillo
        r = Math.min(255, Math.max(0, r * brightness));
        g = Math.min(255, Math.max(0, g * brightness));
        b = Math.min(255, Math.max(0, b * brightness));
        
        // Aplicar contraste
        r = Math.min(255, Math.max(0, ((r / 255 - 0.5) * contrast + 0.5) * 255));
        g = Math.min(255, Math.max(0, ((g / 255 - 0.5) * contrast + 0.5) * 255));
        b = Math.min(255, Math.max(0, ((b / 255 - 0.5) * contrast + 0.5) * 255));
        
        // Aplicar saturación y hue
        if (saturation !== 1 || hue !== 0) {
            const [h, s, l] = rgbToHsl(r, g, b);
            let newH = h + hue / (2 * Math.PI);
            if (newH > 1) newH -= 1;
            if (newH < 0) newH += 1;
            
            const newS = Math.min(1, Math.max(0, s * saturation));
            const [newR, newG, newB] = hslToRgb(newH, newS, l);
            r = newR;
            g = newG;
            b = newB;
        }
        
        // Aplicar tinte sepia
        if (tint > 0) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = Math.min(255, gray + tint * 100);
            g = Math.min(255, gray + tint * 50);
            b = Math.min(255, gray);
        }
        
        // Aplicar opacidad
        if (filters.opacity !== undefined && filters.opacity !== 100) {
            a = Math.min(255, Math.max(0, a * (filters.opacity / 100)));
        }
        
        data[i] = Math.round(r);
        data[i + 1] = Math.round(g);
        data[i + 2] = Math.round(b);
        data[i + 3] = Math.round(a);
    }
    
    ctx.putImageData(imageData, 0, 0);
    console.log('✅ [PIXEL MANIPULATION] Filtros aplicados directamente a píxeles');
}

/**
 * Renderiza un elemento con filtros garantizados usando múltiples técnicas
 */
export function renderElementWithForcedFilters(ctx, element, bounds) {
    console.log('🚀 [FORCE RENDERER] Renderizando elemento con filtros forzados:', element.id);
    console.log('🔍 [ELEMENT DEBUG] Datos completos del elemento:', {
        id: element.id,
        type: element.type,
        filters: element.filters,
        position: element.position,
        size: element.size
    });
    
    const { x, y, width, height } = bounds;
    
    if (element.type !== 'image' || !element.content) {
        console.log('⏩ [FORCE RENDERER] Elemento no es imagen, saltando');
        return Promise.resolve(false);
    }
    
    // Verificar si hay filtros reales con logging detallado
    const filters = element.filters || {};
    console.log('🎛️ [FILTER ANALYSIS] Analizando filtros del elemento:', filters);
    
    // 🔍 DETECCIÓN MEJORADA: Soporte para valores normalizados (0-1) y porcentaje (0-100)
    const hasFilters = 
        (filters.brightness !== undefined && filters.brightness !== 100 && filters.brightness !== 1) ||
        (filters.contrast !== undefined && filters.contrast !== 100 && filters.contrast !== 1) ||
        (filters.saturation !== undefined && filters.saturation !== 100 && filters.saturation !== 1) ||
        (filters.tint !== undefined && filters.tint !== 0) ||
        (filters.hue !== undefined && filters.hue !== 0) ||
        (filters.opacity !== undefined && filters.opacity !== 100 && filters.opacity !== 1) ||
        (filters.blur !== undefined && filters.blur > 0) ||
        (filters.scale !== undefined && filters.scale !== 1) ||
        (filters.rotate !== undefined && filters.rotate !== 0) ||
        filters.flipHorizontal || 
        filters.flipVertical;
    
    console.log('🔍 [FILTER CHECK] ¿Tiene filtros reales?', hasFilters);
    console.log('🔍 [FILTER DETAILS] Detalles de cada filtro (predefinidos compatible):', {
        brightness: `${filters.brightness} (¿≠100&≠1? ${filters.brightness !== 100 && filters.brightness !== 1})`,
        contrast: `${filters.contrast} (¿≠100&≠1? ${filters.contrast !== 100 && filters.contrast !== 1})`,
        saturation: `${filters.saturation} (¿≠100&≠1? ${filters.saturation !== 100 && filters.saturation !== 1})`,
        tint: `${filters.tint} (¿≠0? ${filters.tint !== 0})`,
        hue: `${filters.hue} (¿≠0? ${filters.hue !== 0})`,
        opacity: `${filters.opacity} (¿≠100&≠1? ${filters.opacity !== 100 && filters.opacity !== 1})`,
        detectedFormat: filters.brightness > 2 ? 'percentage (0-100)' : 'normalized (0-1)'
    });
    
    if (!hasFilters) {
        console.log('⏩ [FORCE RENDERER] Sin filtros reales que aplicar');
        return Promise.resolve(false);
    }
    
    console.log('🎯 [FORCE RENDERER] Filtros detectados, aplicando método radical con valores:', filters);
    
    // Obtener la imagen
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
        img.onload = () => {
            try {
                // MÉTODO 1: Canvas temporal con filtros
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const tempCtx = tempCanvas.getContext('2d', { alpha: true });
                
                // Calcular dimensiones de recorte
                const imgRatio = img.width / img.height;
                const destRatio = width / height;
                
                let sx = 0, sy = 0, sw = img.width, sh = img.height;
                if (imgRatio > destRatio) {
                    sw = img.height * destRatio;
                    sx = (img.width - sw) / 2;
                } else {
                    sh = img.width / destRatio;
                    sy = (img.height - sh) / 2;
                }
                
                // Dibujar imagen base
                tempCtx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
                
                // MÉTODO RADICAL: Aplicar filtros directamente a píxeles
                applyFiltersDirectly(tempCanvas, filters);
                
                // Aplicar transformaciones si existen
                if (filters.scale !== 1 || filters.rotate !== 0 || filters.flipHorizontal || filters.flipVertical) {
                    const transformCanvas = document.createElement('canvas');
                    transformCanvas.width = width;
                    transformCanvas.height = height;
                    const transformCtx = transformCanvas.getContext('2d', { alpha: true });
                    
                    transformCtx.save();
                    transformCtx.translate(width/2, height/2);
                    
                    // Escala y volteos
                    const scaleX = (filters.flipHorizontal ? -1 : 1) * (filters.scale || 1);
                    const scaleY = (filters.flipVertical ? -1 : 1) * (filters.scale || 1);
                    transformCtx.scale(scaleX, scaleY);
                    
                    // Rotación
                    if (filters.rotate) {
                        transformCtx.rotate((filters.rotate * Math.PI) / 180);
                    }
                    
                    transformCtx.drawImage(tempCanvas, -width/2, -height/2);
                    transformCtx.restore();
                    
                    // Dibujar resultado final
                    ctx.drawImage(transformCanvas, x, y);
                } else {
                    // Dibujar resultado sin transformaciones
                    ctx.drawImage(tempCanvas, x, y);
                }
                
                console.log('✅ [FORCE RENDERER] Filtros aplicados exitosamente con manipulación de píxeles');
                resolve(true);
                
            } catch (error) {
                console.error('❌ [FORCE RENDERER] Error aplicando filtros:', error);
                resolve(false);
            }
        };
        
        img.onerror = () => {
            console.error('❌ [FORCE RENDERER] Error cargando imagen:', element.content);
            resolve(false);
        };
        
        // Timeout para evitar cuelgues
        setTimeout(() => {
            console.warn('⏰ [FORCE RENDERER] Timeout cargando imagen');
            resolve(false);
        }, 5000);
        
        img.src = element.content;
    });
}

/**
 * Genera un thumbnail con filtros garantizados al 100%
 */
export async function generateThumbnailWithGuaranteedFilters(page, workspaceDimensions) {
    console.log('🔥 [GUARANTEED FILTERS] Generando thumbnail con filtros garantizados');
    
    // 🎯 DEBUGGING INICIAL: Capturar exactamente qué datos recibimos
    console.log('📥 [DATOS RECIBIDOS] Page data completa:', {
        pageId: page.id,
        totalElements: page.elements?.length || 0,
        backgroundColor: page.backgroundColor
    });
    
    // 🔍 ANÁLISIS DETALLADO: Elementos con filtros
    const elementsWithFilters = page.elements?.filter(element => {
        if (!element.filters) return false;
        return (
            (element.filters.brightness !== undefined && element.filters.brightness !== 1) ||
            (element.filters.contrast !== undefined && element.filters.contrast !== 1) ||
            (element.filters.saturation !== undefined && element.filters.saturation !== 1) ||
            (element.filters.tint !== undefined && element.filters.tint !== 0) ||
            (element.filters.hue !== undefined && element.filters.hue !== 0) ||
            (element.filters.opacity !== undefined && element.filters.opacity !== 1) ||
            (element.filters.blur !== undefined && element.filters.blur !== 0) ||
            (element.filters.scale !== undefined && element.filters.scale !== 1) ||
            (element.filters.rotate !== undefined && element.filters.rotate !== 0) ||
            element.filters.flipHorizontal || element.filters.flipVertical
        );
    }) || [];
    
    console.log('🎨 [FILTROS ENCONTRADOS] Elementos con filtros reales:', elementsWithFilters.map(el => ({
        id: el.id,
        type: el.type,
        exactFilters: {
            brightness: `${el.filters.brightness} (tipo: ${typeof el.filters.brightness})`,
            contrast: `${el.filters.contrast} (tipo: ${typeof el.filters.contrast})`,
            saturation: `${el.filters.saturation} (tipo: ${typeof el.filters.saturation})`,
            tint: `${el.filters.tint} (tipo: ${typeof el.filters.tint})`,
            hue: `${el.filters.hue} (tipo: ${typeof el.filters.hue})`,
            opacity: `${el.filters.opacity} (tipo: ${typeof el.filters.opacity})`,
            blur: `${el.filters.blur} (tipo: ${typeof el.filters.blur})`,
            scale: `${el.filters.scale} (tipo: ${typeof el.filters.scale})`,
            rotate: `${el.filters.rotate} (tipo: ${typeof el.filters.rotate})`,
            flipHorizontal: el.filters.flipHorizontal,
            flipVertical: el.filters.flipVertical
        }
    })));
    
    const THUMBNAIL_SIZE = 300;
    const scale = THUMBNAIL_SIZE / Math.max(workspaceDimensions.width, workspaceDimensions.height);
    const thumbWidth = Math.round(workspaceDimensions.width * scale);
    const thumbHeight = Math.round(workspaceDimensions.height * scale);
    
    // Crear canvas
    const canvas = document.createElement('canvas');
    canvas.width = thumbWidth;
    canvas.height = thumbHeight;
    const ctx = canvas.getContext('2d', { alpha: true });
    
    // Fondo
    ctx.fillStyle = page.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Imagen de fondo si existe
    if (page.backgroundImage) {
        try {
            const bgImg = new Image();
            bgImg.crossOrigin = 'anonymous';
            await new Promise((resolve) => {
                bgImg.onload = () => {
                    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                    resolve();
                };
                bgImg.onerror = resolve;
                bgImg.src = page.backgroundImage;
            });
        } catch (e) {
            console.warn('⚠️ Error cargando imagen de fondo:', e);
        }
    }
    
    // Procesar celdas
    if (page.cells && page.cells.length > 0) {
        const cols = Math.ceil(Math.sqrt(page.cells.length));
        const cellWidth = canvas.width / cols;
        const cellHeight = canvas.height / Math.ceil(page.cells.length / cols);
        
        for (let cellIndex = 0; cellIndex < Math.min(page.cells.length, 9); cellIndex++) {
            const cell = page.cells[cellIndex];
            const col = cellIndex % cols;
            const row = Math.floor(cellIndex / cols);
            const cellX = col * cellWidth;
            const cellY = row * cellHeight;
            
            if (cell.elements) {
                // Procesar elementos ordenados por tipo (imágenes primero, luego texto)
                const imageElements = cell.elements.filter(el => el.type === 'image' && el.content);
                const textElements = cell.elements.filter(el => el.type === 'text' && el.content);
                
                // Procesar imágenes con filtros usando el método radical
                for (const element of imageElements.slice(0, 2)) {
                    const elementBounds = {
                        x: cellX + ((element.position?.x || 0) * cellWidth),
                        y: cellY + ((element.position?.y || 0) * cellHeight),
                        width: (element.size?.width || 1) * cellWidth,
                        height: (element.size?.height || 1) * cellHeight
                    };
                    
                    // Usar el renderizador radical para elementos con filtros
                    const rendered = await renderElementWithForcedFilters(ctx, element, elementBounds);
                    
                    if (!rendered) {
                        // Fallback para elementos sin filtros especiales
                        console.log('🔄 [FALLBACK] Usando método estándar para imagen sin filtros especiales');
                        try {
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            await new Promise((resolve) => {
                                img.onload = () => {
                                    const imgRatio = img.width / img.height;
                                    const destRatio = elementBounds.width / elementBounds.height;
                                    
                                    let sx = 0, sy = 0, sw = img.width, sh = img.height;
                                    if (imgRatio > destRatio) {
                                        sw = img.height * destRatio;
                                        sx = (img.width - sw) / 2;
                                    } else {
                                        sh = img.width / destRatio;
                                        sy = (img.height - sh) / 2;
                                    }
                                    
                                    ctx.drawImage(img, sx, sy, sw, sh, 
                                        elementBounds.x, elementBounds.y, 
                                        elementBounds.width, elementBounds.height);
                                    resolve();
                                };
                                img.onerror = resolve;
                                img.src = element.content;
                            });
                        } catch (e) {
                            console.warn('⚠️ Error renderizando imagen fallback:', e);
                        }
                    }
                }
                
                // Procesar elementos de texto (máximo 1 por celda para velocidad)
                for (const element of textElements.slice(0, 1)) {
                    try {
                        const style = element.style || {};
                        const fontSize = Math.max(8, parseInt(style.fontSize) || 14);
                        const color = style.color || '#000000';
                        
                        ctx.save();
                        ctx.font = `${fontSize}px Arial, sans-serif`;
                        ctx.fillStyle = color;
                        ctx.textBaseline = 'top';
                        
                        // Texto simple truncado
                        let text = element.content.split('\n')[0] || '';
                        if (text.length > 30) {
                            text = text.substring(0, 30) + '...';
                        }
                        
                        const textX = cellX + ((element.position?.x || 0) * cellWidth) + 4;
                        const textY = cellY + ((element.position?.y || 0) * cellHeight) + 4;
                        
                        ctx.fillText(text, textX, textY);
                        ctx.restore();
                    } catch (e) {
                        console.warn('⚠️ Error renderizando texto:', e);
                    }
                }
            }
        }
    }
    
    // Generar resultado
    const dataURL = canvas.toDataURL('image/jpeg', 0.85);
    console.log('✅ [GUARANTEED FILTERS] Thumbnail generado con filtros garantizados');
    
    return dataURL;
}

// Función global para uso desde el editor
window.forceRegenerateWithGuaranteedFilters = async function() {
    console.log('🚀 [GLOBAL FORCE] Regenerando con filtros garantizados');
    
    try {
        // Obtener datos de la página actual
        const currentPageData = window._currentPageData;
        const workspaceDims = window._workspaceDimensions;
        
        if (!currentPageData || !workspaceDims) {
            console.error('❌ [GLOBAL FORCE] Datos de página no disponibles');
            return false;
        }
        
        const thumbnail = await generateThumbnailWithGuaranteedFilters(currentPageData, workspaceDims);
        
        // Actualizar thumbnail en la interfaz
        if (window._updateThumbnailInUI) {
            window._updateThumbnailInUI(currentPageData.id, thumbnail);
        }
        
        console.log('✅ [GLOBAL FORCE] Thumbnail regenerado con éxito');
        return true;
        
    } catch (error) {
        console.error('❌ [GLOBAL FORCE] Error:', error);
        return false;
    }
};

console.log('🔥 [FORCE FILTER RENDERER] Sistema listo - Usa window.forceRegenerateWithGuaranteedFilters()');
