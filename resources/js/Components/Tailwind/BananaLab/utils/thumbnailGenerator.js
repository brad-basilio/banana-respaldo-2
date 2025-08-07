import html2canvas from 'html2canvas';

/**
 * Generador de thumbnails optimizado para layouts de BananaLab
 * Maneja correctamente CSS Grid y layouts complejos
 */

// Configuración optimizada para diferentes tipos de captura
const THUMBNAIL_CONFIGS = {
    preview: {
        scale: 0.5,
        width: 200,
        height: 150,
        quality: 0.8
    },
    high_quality: {
        scale: 2,
        width: 800,
        height: 600,
        quality: 1.0
    },
    pdf: {
        scale: 3,
        width: 1200,
        height: 900,
        quality: 1.0
    }
};

/**
 * Espera a que todos los elementos estén completamente renderizados
 */
const waitForRender = (element, timeout = 2000) => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const checkRender = () => {
            const computedStyle = getComputedStyle(element);
            const hasGridTemplate = computedStyle.gridTemplateColumns !== 'none';
            const hasContent = element.children.length > 0;
            const isVisible = element.offsetWidth > 0 && element.offsetHeight > 0;
            
            if ((hasGridTemplate || hasContent) && isVisible) {
                // Esperar un frame adicional para asegurar el renderizado completo
                requestAnimationFrame(() => resolve(true));
            } else if (Date.now() - startTime > timeout) {
                console.warn('⚠️ Timeout esperando renderizado completo');
                resolve(false);
            } else {
                requestAnimationFrame(checkRender);
            }
        };
        
        checkRender();
    });
};

/**
 * Prepara el elemento para captura optimizando el layout
 */
const prepareElementForCapture = (element, layout) => {
    const originalStyles = {};
    
    // Guardar estilos originales
    originalStyles.position = element.style.position;
    originalStyles.transform = element.style.transform;
    originalStyles.zIndex = element.style.zIndex;
    
    // Aplicar estilos temporales para mejor captura
    element.style.position = 'relative';
    element.style.transform = 'translateZ(0)'; // Forzar compositing layer
    element.style.zIndex = '1';
    
    // Asegurar que el grid layout esté aplicado correctamente
    if (layout && layout.template) {
        element.style.display = 'grid';
        element.style.gridTemplateColumns = layout.template.includes('grid-cols-1') ? '1fr' :
                                           layout.template.includes('grid-cols-2') ? '1fr 1fr' :
                                           layout.template.includes('grid-cols-3') ? '1fr 1fr 1fr' :
                                           layout.template.includes('grid-cols-4') ? '1fr 1fr 1fr 1fr' :
                                           layout.template.includes('grid-cols-5') ? '1fr 1fr 1fr 1fr 1fr' : '1fr';
        
        element.style.gridTemplateRows = layout.template.includes('grid-rows-1') ? '1fr' :
                                        layout.template.includes('grid-rows-2') ? '1fr 1fr' :
                                        layout.template.includes('grid-rows-3') ? '1fr 1fr 1fr' : '1fr';
        
        if (layout.style?.gap) {
            element.style.gap = layout.style.gap;
        }
        
        if (layout.style?.padding) {
            element.style.padding = layout.style.padding;
        }
    }
    
    return originalStyles;
};

/**
 * Restaura los estilos originales del elemento
 */
const restoreElementStyles = (element, originalStyles) => {
    Object.keys(originalStyles).forEach(property => {
        if (originalStyles[property]) {
            element.style[property] = originalStyles[property];
        } else {
            element.style.removeProperty(property);
        }
    });
};

/**
 * Procesa imágenes para simular object-fit: cover correctamente
 * html2canvas no siempre respeta object-fit, así que lo simulamos manualmente
 */
const processImagesWithCover = async (clonedDoc, originalElement) => {
    const originalImages = originalElement.querySelectorAll('img');
    const clonedImages = clonedDoc.querySelectorAll('img');
    
    console.log(`🖼️ [COVER-FIX] Procesando ${clonedImages.length} imágenes para simular object-fit: cover`);
    
    if (originalImages.length !== clonedImages.length) {
        console.warn(`⚠️ [COVER-FIX] Mismatch: ${originalImages.length} originales vs ${clonedImages.length} clonadas`);
    }
    
    // Crear un mapa de imágenes originales para obtener sus estilos computados
    const imageStylesMap = new Map();
    originalImages.forEach((img, index) => {
        const computedStyle = getComputedStyle(img);
        const container = img.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        imageStylesMap.set(index, {
            objectFit: computedStyle.objectFit,
            objectPosition: computedStyle.objectPosition,
            containerWidth: containerRect.width,
            containerHeight: containerRect.height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            src: img.src
        });
    });
    
    // Procesar cada imagen clonada
    for (let i = 0; i < clonedImages.length; i++) {
        const clonedImg = clonedImages[i];
        const originalData = imageStylesMap.get(i);
        
        if (!originalData) continue;
        
        try {
            // Detectar si la imagen necesita tratamiento cover
            const needsCoverTreatment = 
                originalData.objectFit === 'cover' || 
                clonedImg.classList.contains('object-cover') ||
                clonedImg.className.includes('object-cover') ||
                clonedImg.style.objectFit === 'cover' ||
                // Detectar imágenes dentro de elementos con clases específicas
                clonedImg.closest('[data-element-type="image"]') ||
                clonedImg.closest('.workspace-image') ||
                clonedImg.closest('.element-image');
            
            if (needsCoverTreatment) {
                console.log(`🔧 [COVER-FIX] Procesando imagen ${i} con object-fit: cover`);
                
                await simulateObjectFitCover(clonedImg, originalData, clonedDoc);
            } else {
                // Para otras imágenes, asegurar que tengan estilos básicos
                clonedImg.style.imageRendering = 'optimizeQuality';
                clonedImg.style.width = '100%';
                clonedImg.style.height = '100%';
                
                if (originalData.objectFit && originalData.objectFit !== 'fill') {
                    clonedImg.style.objectFit = originalData.objectFit;
                }
                if (originalData.objectPosition) {
                    clonedImg.style.objectPosition = originalData.objectPosition;
                }
            }
        } catch (error) {
            console.warn(`⚠️ [COVER-FIX] Error procesando imagen ${i}:`, error);
            // Fallback: aplicar estilos básicos
            clonedImg.style.imageRendering = 'optimizeQuality';
            clonedImg.style.objectFit = 'cover';
            clonedImg.style.width = '100%';
            clonedImg.style.height = '100%';
        }
    }
};

/**
 * Simula object-fit: cover creando un canvas con la imagen recortada correctamente
 */
const simulateObjectFitCover = async (img, originalData, clonedDoc) => {
    return new Promise((resolve) => {
        try {
            const { containerWidth, containerHeight, naturalWidth, naturalHeight } = originalData;
            
            // Validar dimensiones
            if (!containerWidth || !containerHeight || !naturalWidth || !naturalHeight) {
                console.warn('⚠️ [COVER-FIX] Dimensiones inválidas:', originalData);
                img.style.objectFit = 'cover';
                img.style.width = '100%';
                img.style.height = '100%';
                resolve();
                return;
            }
            
            // Calcular las dimensiones para simular cover
            const containerAspect = containerWidth / containerHeight;
            const imageAspect = naturalWidth / naturalHeight;
            
            let sourceX = 0, sourceY = 0, sourceWidth = naturalWidth, sourceHeight = naturalHeight;
            
            if (imageAspect > containerAspect) {
                // Imagen más ancha - recortar por los lados
                sourceWidth = naturalHeight * containerAspect;
                sourceX = (naturalWidth - sourceWidth) / 2;
            } else {
                // Imagen más alta - recortar por arriba/abajo  
                sourceHeight = naturalWidth / containerAspect;
                sourceY = (naturalHeight - sourceHeight) / 2;
            }
            
            // Crear canvas temporal para el recorte
            const canvas = clonedDoc.createElement('canvas');
            canvas.width = containerWidth;
            canvas.height = containerHeight;
            const ctx = canvas.getContext('2d');
            
            // Crear imagen temporal para el canvas
            const tempImg = new Image();
            tempImg.crossOrigin = 'anonymous';
            
            tempImg.onload = () => {
                try {
                    // Dibujar la imagen recortada simulando object-fit: cover
                    ctx.drawImage(
                        tempImg,
                        sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle (crop)
                        0, 0, containerWidth, containerHeight         // Destination rectangle
                    );
                    
                    // Convertir a data URL y reemplazar la imagen original
                    const dataUrl = canvas.toDataURL('image/png', 1.0);
                    img.src = dataUrl;
                    
                    // Aplicar estilos para que se muestre correctamente
                    img.style.objectFit = 'fill'; // Cambiar a fill porque ya está recortada
                    img.style.objectPosition = 'center';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.imageRendering = 'optimizeQuality';
                    
                    console.log(`✅ [COVER-FIX] Imagen simulada con object-fit: cover exitosamente`);
                    resolve();
                } catch (canvasError) {
                    console.warn('⚠️ [COVER-FIX] Error en canvas processing:', canvasError);
                    // Fallback: usar object-fit normal
                    img.style.objectFit = 'cover';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    resolve();
                }
            };
            
            tempImg.onerror = () => {
                console.warn('⚠️ [COVER-FIX] Error cargando imagen temporal');
                // Fallback: usar object-fit normal
                img.style.objectFit = 'cover';
                img.style.width = '100%';
                img.style.height = '100%';
                resolve();
            };
            
            tempImg.src = img.src;
            
        } catch (error) {
            console.warn('⚠️ [COVER-FIX] Error en simulateObjectFitCover:', error);
            // Fallback: usar object-fit normal
            img.style.objectFit = 'cover';
            img.style.width = '100%';
            img.style.height = '100%';
            resolve();
        }
    });
};

/**
 * Genera thumbnail de una página específica
 */
export const generatePageThumbnail = async (pageId, layout, options = {}) => {
    const config = THUMBNAIL_CONFIGS[options.type || 'preview'];
    
    try {
        // Buscar el elemento de la página
        const pageElement = document.querySelector(`#page-${pageId}`);
        if (!pageElement) {
            console.error(`❌ No se encontró el elemento de página: #page-${pageId}`);
            return null;
        }
        
        console.log(`📸 Generando thumbnail para página ${pageId} con layout:`, layout?.id);
        
        // Preparar elemento para captura
        const originalStyles = prepareElementForCapture(pageElement, layout);
        
        // Esperar a que el renderizado esté completo
        await waitForRender(pageElement);
        
        // Configuración de html2canvas optimizada para layouts
        const html2canvasOptions = {
            allowTaint: true,
            useCORS: true,
            scale: config.scale,
            width: pageElement.offsetWidth,
            height: pageElement.offsetHeight,
            backgroundColor: null, // Permitir transparencia
            logging: false,
            imageTimeout: 15000,
            removeContainer: true,
            onclone: async (clonedDoc) => {
                // Optimizar el documento clonado
                const clonedElement = clonedDoc.querySelector(`#page-${pageId}`);
                if (clonedElement && layout) {
                    // Asegurar que el layout esté aplicado en el clon
                    clonedElement.className = `${clonedElement.className} grid ${layout.template}`;
                    
                    // Aplicar estilos del layout
                    if (layout.style) {
                        Object.keys(layout.style).forEach(property => {
                            clonedElement.style[property] = layout.style[property];
                        });
                    }
                    
                    // Aplicar estilos de celda si existen
                    if (layout.cellStyles) {
                        const cells = clonedElement.children;
                        Object.keys(layout.cellStyles).forEach(index => {
                            if (cells[index]) {
                                cells[index].className += ` ${layout.cellStyles[index]}`;
                            }
                        });
                    }
                }
                
                // Remover elementos que pueden causar problemas
                const problematicElements = clonedDoc.querySelectorAll('script, iframe, video, audio');
                problematicElements.forEach(el => el.remove());
                
                // 🖼️ SOLUCIÓN AVANZADA: Simular object-fit: cover manualmente
                await processImagesWithCover(clonedDoc, pageElement);
                
                // Agregar CSS adicional para asegurar que las imágenes se muestren correctamente
                const style = clonedDoc.createElement('style');
                style.textContent = `
                    /* Asegurar que las imágenes mantengan sus proporciones */
                    img {
                        image-rendering: optimizeQuality !important;
                        image-rendering: -webkit-optimize-contrast !important;
                        image-rendering: crisp-edges !important;
                    }
                    
                    /* Contenedores de imagen */
                    [data-element-type="image"] {
                        overflow: hidden !important;
                        position: relative !important;
                    }
                    
                    [data-element-type="image"] img,
                    .workspace-image,
                    .element-image {
                        width: 100% !important;
                        height: 100% !important;
                        display: block !important;
                    }
                    
                    /* Grid layout específico */
                    .grid {
                        display: grid !important;
                    }
                `;
                clonedDoc.head.appendChild(style);
            }
        };
        
        // Capturar con html2canvas
        const canvas = await html2canvas(pageElement, html2canvasOptions);
        
        // Restaurar estilos originales
        restoreElementStyles(pageElement, originalStyles);
        
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            throw new Error('Canvas inválido generado');
        }
        
        // Redimensionar si es necesario
        let finalCanvas = canvas;
        if (config.width && config.height && 
            (canvas.width !== config.width || canvas.height !== config.height)) {
            
            finalCanvas = document.createElement('canvas');
            finalCanvas.width = config.width;
            finalCanvas.height = config.height;
            
            const ctx = finalCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Calcular dimensiones manteniendo aspecto
            const sourceAspect = canvas.width / canvas.height;
            const targetAspect = config.width / config.height;
            
            let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
            
            if (sourceAspect > targetAspect) {
                drawWidth = config.width;
                drawHeight = config.width / sourceAspect;
                offsetY = (config.height - drawHeight) / 2;
            } else {
                drawHeight = config.height;
                drawWidth = config.height * sourceAspect;
                offsetX = (config.width - drawWidth) / 2;
            }
            
            // Fondo blanco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, config.width, config.height);
            
            // Dibujar imagen redimensionada
            ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);
        }
        
        // Convertir a data URL
        const dataUrl = finalCanvas.toDataURL('image/png', config.quality);
        
        console.log(`✅ Thumbnail generado exitosamente para página ${pageId}`);
        return dataUrl;
        
    } catch (error) {
        console.error(`❌ Error generando thumbnail para página ${pageId}:`, error);
        return null;
    }
};

/**
 * Genera thumbnails para múltiples páginas
 */
export const generateMultiplePageThumbnails = async (pages, layouts, options = {}) => {
    const results = {};
    const batchSize = options.batchSize || 3; // Procesar en lotes para evitar sobrecarga
    
    for (let i = 0; i < pages.length; i += batchSize) {
        const batch = pages.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (page) => {
            const layout = layouts.find(l => l.id === page.layout);
            const thumbnail = await generatePageThumbnail(page.id, layout, options);
            return { pageId: page.id, thumbnail };
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(({ pageId, thumbnail }) => {
            if (thumbnail) {
                results[pageId] = thumbnail;
            }
        });
        
        // Pausa entre lotes para no sobrecargar el navegador
        if (i + batchSize < pages.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return results;
};

/**
 * Genera thumbnail de fallback cuando falla la captura
 */
export const generateFallbackThumbnail = (pageId, pageType, dimensions = { width: 200, height: 150 }) => {
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const ctx = canvas.getContext('2d');
    
    // Fondo según tipo de página
    const backgrounds = {
        cover: '#8B5CF6',
        content: '#3B82F6', 
        final: '#10B981'
    };
    
    ctx.fillStyle = backgrounds[pageType] || '#6B7280';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Texto indicativo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
        pageType === 'cover' ? 'Portada' :
        pageType === 'final' ? 'Contraportada' :
        'Página',
        dimensions.width / 2,
        dimensions.height / 2
    );
    
    return canvas.toDataURL('image/png', 0.8);
};

/**
 * Función de compatibilidad con la interfaz original
 * Mantiene la misma API que generateAccurateThumbnails
 */
export const generateAccurateThumbnails = async (pages, workspaceDimensions = { width: 800, height: 600 }) => {
    const results = {};
    
    console.log(`📸 [COMPAT] Generando ${pages.length} thumbnails con nueva API...`);
    
    try {
        for (const page of pages) {
            try {
                // Buscar layout por defecto si no se especifica
                const layout = {
                    id: page.layout || 'layout-1',
                    template: 'grid-cols-1 grid-rows-1',
                    cells: 1,
                    style: { gap: '0px', padding: '0px' }
                };
                
                const thumbnail = await generatePageThumbnail(page.id, layout, {
                    type: 'preview',
                    workspaceDimensions
                });
                
                if (thumbnail) {
                    results[page.id] = thumbnail;
                    console.log(`✅ [COMPAT] Thumbnail generado para página ${page.id}`);
                } else {
                    // Generar fallback si falla
                    const fallback = generateFallbackThumbnail(page.id, page.type || 'content');
                    results[page.id] = fallback;
                    console.log(`🔄 [COMPAT] Fallback generado para página ${page.id}`);
                }
            } catch (pageError) {
                console.error(`❌ [COMPAT] Error en página ${page.id}:`, pageError);
                // Generar fallback en caso de error
                const fallback = generateFallbackThumbnail(page.id, page.type || 'content');
                results[page.id] = fallback;
            }
        }
        
        console.log(`✅ [COMPAT] Proceso completado. ${Object.keys(results).length}/${pages.length} thumbnails generados`);
        return results;
        
    } catch (error) {
        console.error('❌ [COMPAT] Error general en generateAccurateThumbnails:', error);
        
        // Fallback completo: generar thumbnails básicos para todas las páginas
        for (const page of pages) {
            if (!results[page.id]) {
                results[page.id] = generateFallbackThumbnail(page.id, page.type || 'content');
            }
        }
        
        return results;
    }
};

export default {
    generatePageThumbnail,
    generateMultiplePageThumbnails,
    generateFallbackThumbnail,
    generateAccurateThumbnails,
    THUMBNAIL_CONFIGS
};

// Funciones stub para compatibilidad con imports existentes
export const generateFastThumbnails = async (pages, workspaceDimensions) => {
    console.log('🔄 [STUB] generateFastThumbnails llamada, redirigiendo a generateAccurateThumbnails');
    return generateAccurateThumbnails(pages, workspaceDimensions);
};

export const generateHybridThumbnails = async (pages, workspaceDimensions) => {
    console.log('🔄 [STUB] generateHybridThumbnails llamada, redirigiendo a generateAccurateThumbnails');
    return generateAccurateThumbnails(pages, workspaceDimensions);
};

export const generateSingleThumbnail = async (pageId, layout, options = {}) => {
    console.log(`🔄 [STUB] generateSingleThumbnail llamada para página ${pageId}`);
    return generatePageThumbnail(pageId, layout, options);
};

export const clearThumbnailCaches = () => {
    console.log('🧹 [STUB] clearThumbnailCaches llamada');
    // Implementar limpieza de cache si es necesario
};

export const generateThumbnailWithGuaranteedFilters = async (pageId, layout, options = {}) => {
    console.log(`🎨 [STUB] generateThumbnailWithGuaranteedFilters llamada para página ${pageId}`);
    return generatePageThumbnail(pageId, layout, { ...options, type: 'high_quality' });
};

// 🔍 FUNCION DE DEBUGGING PARA VERIFICAR OBJECT-FIT COVER
export const debugImageCover = (pageId) => {
    console.log(`🔍 [DEBUG] Analizando imágenes en página ${pageId}...`);
    
    const pageElement = document.querySelector(`#page-${pageId}`);
    if (!pageElement) {
        console.error(`❌ [DEBUG] No se encontró página ${pageId}`);
        return;
    }
    
    const images = pageElement.querySelectorAll('img');
    console.log(`📊 [DEBUG] Encontradas ${images.length} imágenes en página ${pageId}`);
    
    images.forEach((img, index) => {
        const computedStyle = getComputedStyle(img);
        const container = img.parentElement;
        const containerRect = container ? container.getBoundingClientRect() : null;
        
        console.log(`🖼️ [DEBUG] Imagen ${index}:`, {
            src: img.src.substring(0, 50) + '...',
            objectFit: computedStyle.objectFit,
            objectPosition: computedStyle.objectPosition,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            displayWidth: img.offsetWidth,
            displayHeight: img.offsetHeight,
            containerWidth: containerRect?.width,
            containerHeight: containerRect?.height,
            classes: img.className,
            parentClasses: container?.className,
            hasObjectCover: img.classList.contains('object-cover') || img.className.includes('object-cover'),
            computedObjectFit: computedStyle.objectFit,
            inlineObjectFit: img.style.objectFit
        });
    });
};

// Exponer función de debug globalmente
if (typeof window !== 'undefined') {
    window.debugImageCover = debugImageCover;
}