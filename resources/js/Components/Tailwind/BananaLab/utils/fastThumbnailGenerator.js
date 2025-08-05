/**
 * GENERADOR DE THUMBNAILS OPTIMIZADO PARA VELOCIDAD
 * Version ultra-rápida con técnicas de optimización avanzadas
 */

// Cache global de imágenes para evitar recargas
const imageCache = new Map();
const thumbnailCache = new Map();

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
    
    // Calcular posición del elemento
    const posX = element.position?.x || 0;
    const posY = element.position?.y || 0;
    
    const elementX = cellX + (posX <= 1 ? posX * cellWidth : posX);
    const elementY = cellY + (posY <= 1 ? posY * cellHeight : posY);
    
    const elementWidth = element.size?.width ? 
        (element.size.width <= 1 ? element.size.width * cellWidth : element.size.width) : 
        cellWidth;
    const elementHeight = element.size?.height ? 
        (element.size.height <= 1 ? element.size.height * cellHeight : element.size.height) : 
        cellHeight;

    console.log(`🎨 [FastThumbnail] Renderizando elemento ${element.id}:`, {
        type: element.type,
        hasFilters: !!element.filters,
        hasMask: !!element.mask,
        filters: element.filters,
        mask: element.mask
    });

    if (element.type === 'image' && element.content) {
        const img = imageCache.get(element.content);
        if (img) {
            ctx.save();
            
            // APLICAR TODOS LOS FILTROS CSS COMPLETOS
            if (element.filters) {
                console.log('🎨 [FastThumbnail] APLICANDO FILTROS COMPLETOS:', element.filters);
                
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
                ctx.filter = filterString;
                
                // Aplicar transformaciones si existen
                if (element.filters.scale !== undefined || 
                    element.filters.rotate !== undefined || 
                    element.filters.flipHorizontal || 
                    element.filters.flipVertical) {
                    
                    const scale = element.filters.scale ?? 1;
                    const rotate = element.filters.rotate ?? 0;
                    const flipHorizontal = element.filters.flipHorizontal ?? false;
                    const flipVertical = element.filters.flipVertical ?? false;
                    
                    ctx.translate(elementX + elementWidth/2, elementY + elementHeight/2);
                    ctx.scale(
                        scale * (flipHorizontal ? -1 : 1), 
                        scale * (flipVertical ? -1 : 1)
                    );
                    ctx.rotate((rotate * Math.PI) / 180);
                    ctx.translate(-elementWidth/2, -elementHeight/2);
                }
            }
            
            // APLICAR MÁSCARA SI EXISTE (ANTES del dibujo)
            if (element.mask) {
                console.log('🎭 [FastThumbnail] APLICANDO MÁSCARA:', element.mask);
                applyMaskToCanvas(ctx, element.mask, elementX, elementY, elementWidth, elementHeight);
            }
            
            // Dibujo con object-fit cover
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
            
            ctx.drawImage(img, sx, sy, sw, sh, elementX, elementY, elementWidth, elementHeight);
            console.log('🖼️ [FastThumbnail] Imagen dibujada con filtros y máscaras');
            
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
 * Generador de thumbnail individual para la página actual
 */
export async function generateSingleThumbnail({ page, workspaceDimensions, onProgress = null }) {
    const THUMBNAIL_SIZE = 300;
    
    console.log(`⚡ Generando thumbnail para página: ${page.id}`);
    
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
