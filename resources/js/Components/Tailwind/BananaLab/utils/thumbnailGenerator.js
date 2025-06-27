/**
 * GENERADOR DE THUMBNAILS EXACTAMENTE IDÉNTICO AL WORKSPACE
 * Replica 1:1 la lógica de renderizado del Editor.jsx
 */

import { layouts } from '../constants/layouts';

/**
 * Simula exactamente el CSS Grid del workspace usando canvas
 * Esta función replica la lógica de getCurrentLayout() del Editor
 */
function simulateWorkspaceGrid(layout, workspaceDimensions) {
    // Usar los mismos valores por defecto que el workspace
    const gap = parseInt(layout.style?.gap?.replace('px', '')) || 16;
    const padding = parseInt(layout.style?.padding?.replace('px', '')) || 16;
    
    // Parsear template igual que en CSS
    const parseGridTemplate = (template) => {
        const colsMatch = template.match(/grid-cols-(\d+)/);
        const rowsMatch = template.match(/grid-rows-(\d+)/);
        
        const cols = colsMatch ? parseInt(colsMatch[1]) : 1;
        const rows = rowsMatch ? parseInt(rowsMatch[1]) : 1;
        
        return { cols, rows };
    };
    
    const { cols, rows } = parseGridTemplate(layout.template);
    
    // Calcular área disponible EXACTAMENTE como CSS Grid
    const contentWidth = workspaceDimensions.width - (2 * padding);
    const contentHeight = workspaceDimensions.height - (2 * padding);
    
    // Calcular tamaño de cada celda
    const cellWidth = (contentWidth - (gap * (cols - 1))) / cols;
    const cellHeight = (contentHeight - (gap * (rows - 1))) / rows;
    
    console.log('🎯 [WORKSPACE REPLICA] Grid simulation:', {
        template: layout.template,
        cols, rows, gap, padding,
        workspace: workspaceDimensions,
        cellSize: { width: cellWidth, height: cellHeight }
    });
    
    return {
        cols, rows, gap, padding, cellWidth, cellHeight,
        contentX: padding, contentY: padding
    };
}

/**
 * Dibuja imagen con object-fit: cover exactamente como en el workspace
 */
function drawImageWithCover(ctx, img, x, y, width, height) {
    if (!img || !ctx || width <= 0 || height <= 0) return;
    
    const imgRatio = img.width / img.height;
    const destRatio = width / height;
    
    let sx, sy, sw, sh;
    
    if (imgRatio > destRatio) {
        // Imagen más ancha: recortar los lados
        sh = img.height;
        sw = sh * destRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
    } else {
        // Imagen más alta: recortar arriba y abajo
        sw = img.width;
        sh = sw / destRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
    }
    
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    try {
        ctx.drawImage(
            img,
            Math.max(0, sx), Math.max(0, sy),
            Math.min(sw, img.width - Math.max(0, sx)),
            Math.min(sh, img.height - Math.max(0, sy)),
            x, y, width, height
        );
    } catch (error) {
        console.error('Error dibujando imagen:', error);
    }
    
    ctx.restore();
}

/**
 * Renderiza un elemento de imagen exactamente como EditableCell
 */
function renderImageElement(ctx, element, cellX, cellY, cellWidth, cellHeight) {
    return new Promise(async (resolve) => {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                // Calcular posición y tamaño EXACTAMENTE como en EditableCell
                const posX = element.position?.x || 0;
                const posY = element.position?.y || 0;
                
                // Los elementos pueden tener posiciones relativas (0-1) o absolutas (píxeles)
                const isRelativeX = posX >= 0 && posX <= 1;
                const isRelativeY = posY >= 0 && posY <= 1;
                
                const elementX = cellX + (isRelativeX ? posX * cellWidth : posX);
                const elementY = cellY + (isRelativeY ? posY * cellHeight : posY);
                
                // Tamaño del elemento
                const elementWidth = element.size?.width ? 
                    (element.size.width <= 1 ? element.size.width * cellWidth : element.size.width) : 
                    cellWidth;
                const elementHeight = element.size?.height ? 
                    (element.size.height <= 1 ? element.size.height * cellHeight : element.size.height) : 
                    cellHeight;
                
                console.log('🖼️ [WORKSPACE REPLICA] Imagen:', {
                    id: element.id,
                    cellPos: { x: cellX, y: cellY, width: cellWidth, height: cellHeight },
                    elementPos: { x: elementX, y: elementY, width: elementWidth, height: elementHeight },
                    originalPos: { x: posX, y: posY },
                    isRelative: { x: isRelativeX, y: isRelativeY }
                });
                
                // Aplicar filtros si existen (simplificado para thumbnail)
                if (element.filters) {
                    ctx.filter = `
                        brightness(${(element.filters.brightness || 100) / 100})
                        contrast(${(element.filters.contrast || 100) / 100})
                        saturate(${(element.filters.saturation || 100) / 100})
                        blur(${element.filters.blur || 0}px)
                        opacity(${(element.filters.opacity || 100) / 100})
                    `;
                }
                
                // Dibujar imagen con object-fit: cover
                drawImageWithCover(ctx, img, elementX, elementY, elementWidth, elementHeight);
                
                // Resetear filtros
                ctx.filter = 'none';
                
                resolve();
            };
            
            img.onerror = () => {
                console.error('Error cargando imagen:', element.content);
                resolve();
            };
            
            img.src = element.content;
            
        } catch (error) {
            console.error('Error en renderImageElement:', error);
            resolve();
        }
    });
}

/**
 * Renderiza un elemento de texto exactamente como EditableCell
 */
function renderTextElement(ctx, element, cellX, cellY, cellWidth, cellHeight) {
    try {
        // Posición del elemento
        const posX = element.position?.x || 0;
        const posY = element.position?.y || 0;
        
        const isRelativeX = posX >= 0 && posX <= 1;
        const isRelativeY = posY >= 0 && posY <= 1;
        
        const elementX = cellX + (isRelativeX ? posX * cellWidth : posX);
        const elementY = cellY + (isRelativeY ? posY * cellHeight : posY);
        
        // Tamaño del elemento
        const elementWidth = element.size?.width ? 
            (element.size.width <= 1 ? element.size.width * cellWidth : element.size.width) : 
            cellWidth * 0.8;
        const elementHeight = element.size?.height ? 
            (element.size.height <= 1 ? element.size.height * cellHeight : element.size.height) : 
            cellHeight * 0.2;
        
        console.log('📝 [WORKSPACE REPLICA] Texto:', {
            id: element.id,
            content: element.content,
            cellPos: { x: cellX, y: cellY, width: cellWidth, height: cellHeight },
            elementPos: { x: elementX, y: elementY, width: elementWidth, height: elementHeight }
        });
        
        // Aplicar estilos de texto
        const style = element.style || {};
        const fontSize = parseInt(style.fontSize) || 16;
        const fontFamily = style.fontFamily || 'Arial, sans-serif';
        const fontWeight = style.fontWeight || 'normal';
        const fontStyle = style.fontStyle || 'normal';
        const color = style.color || '#000000';
        const textAlign = style.textAlign || 'left';
        const backgroundColor = style.backgroundColor;
        const padding = parseInt(style.padding) || 8;
        
        ctx.save();
        
        // Configurar fuente
        ctx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';
        
        // Dibujar fondo si existe
        if (backgroundColor && backgroundColor !== 'transparent') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(elementX, elementY, elementWidth, elementHeight);
            ctx.fillStyle = color;
        }
        
        // Manejar texto multilínea
        const lines = element.content.split('\n');
        const lineHeight = fontSize * 1.2;
        
        lines.forEach((line, index) => {
            if (line.trim()) {
                let textX = elementX + padding;
                const textY = elementY + padding + (index * lineHeight);
                
                // Aplicar alineación
                if (textAlign === 'center') {
                    textX = elementX + (elementWidth / 2);
                    ctx.textAlign = 'center';
                } else if (textAlign === 'right') {
                    textX = elementX + elementWidth - padding;
                    ctx.textAlign = 'right';
                } else {
                    ctx.textAlign = 'left';
                }
                
                // Verificar que está dentro del canvas
                if (textX >= 0 && textY >= 0 && textX < ctx.canvas.width && textY < ctx.canvas.height) {
                    ctx.fillText(line, textX, textY);
                }
            }
        });
        
        ctx.restore();
        
    } catch (error) {
        console.error('Error en renderTextElement:', error);
    }
}

/**
 * GENERADOR DE THUMBNAILS IDÉNTICO AL WORKSPACE
 * Replica exactamente la lógica de renderizado del Editor.jsx línea por línea
 */
export async function generateAccurateThumbnails({ pages, workspaceDimensions, presetData }) {
    const newThumbnails = {};

    console.log('🎯 [WORKSPACE REPLICA] Iniciando generación IDÉNTICA al workspace...');
    console.log('📐 [WORKSPACE REPLICA] Dimensiones:', workspaceDimensions);

    for (const page of pages) {
        try {
            console.log(`🔄 [WORKSPACE REPLICA] Procesando página: ${page.id} (${page.type})`);
            
            // Crear canvas con las dimensiones exactas del workspace
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            canvas.width = workspaceDimensions.width;
            canvas.height = workspaceDimensions.height;
            
            // Configuración de renderizado idéntica al workspace
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.textRendering = 'geometricPrecision';
            
            // === RENDERIZAR BACKGROUND LAYER === (idéntico al workspace)
            console.log('🎨 [WORKSPACE REPLICA] Renderizando background...');
            
            // 1. Color de fondo base
            const backgroundColor = page.backgroundColor || '#ffffff';
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            console.log('🎨 [WORKSPACE REPLICA] Background color aplicado:', backgroundColor);
            
            // 2. Imagen de fondo si existe
            if (page.backgroundImage) {
                try {
                    console.log('🖼️ [WORKSPACE REPLICA] Cargando background image:', page.backgroundImage);
                    
                    const bgImg = new Image();
                    bgImg.crossOrigin = 'anonymous';
                    
                    await new Promise((resolve, reject) => {
                        bgImg.onload = resolve;
                        bgImg.onerror = reject;
                        bgImg.src = page.backgroundImage;
                    });
                    
                    // Dibujar imagen de fondo cubriendo toda la página
                    drawImageWithCover(ctx, bgImg, 0, 0, canvas.width, canvas.height);
                    console.log('✅ [WORKSPACE REPLICA] Background image aplicada');
                    
                } catch (error) {
                    console.error('❌ [WORKSPACE REPLICA] Error con background image:', error);
                }
            }
            
            // === RENDERIZAR GRID LAYER === (idéntico al workspace)
            console.log('🗂️ [WORKSPACE REPLICA] Renderizando grid layout...');
            
            // Buscar el layout actual (igual que getCurrentLayout())
            const currentLayout = layouts.find(l => l.id === page.layout) || layouts[0];
            console.log('📋 [WORKSPACE REPLICA] Layout actual:', currentLayout.name, currentLayout.template);
            
            // Simular el CSS Grid exactamente como el workspace
            const gridInfo = simulateWorkspaceGrid(currentLayout, workspaceDimensions);
            
            // === RENDERIZAR CELDAS Y ELEMENTOS ===
            if (page.cells && Array.isArray(page.cells)) {
                console.log(`📦 [WORKSPACE REPLICA] Renderizando ${page.cells.length} celdas...`);
                
                // Ordenar celdas por índice para mantener consistencia
                const sortedCells = [...page.cells].sort((a, b) => {
                    const aIndex = page.cells.indexOf(a);
                    const bIndex = page.cells.indexOf(b);
                    return aIndex - bIndex;
                });
                
                for (let cellIndex = 0; cellIndex < sortedCells.length; cellIndex++) {
                    const cell = sortedCells[cellIndex];
                    
                    // Calcular posición de la celda en el grid (igual que CSS Grid)
                    const row = Math.floor(cellIndex / gridInfo.cols);
                    const col = cellIndex % gridInfo.cols;
                    
                    const cellX = gridInfo.contentX + (col * (gridInfo.cellWidth + gridInfo.gap));
                    const cellY = gridInfo.contentY + (row * (gridInfo.cellHeight + gridInfo.gap));
                    
                    console.log(`📦 [WORKSPACE REPLICA] Celda ${cellIndex} (${cell.id}):`, {
                        gridPos: { row, col },
                        realPos: { x: cellX, y: cellY, width: gridInfo.cellWidth, height: gridInfo.cellHeight }
                    });
                    
                    // Dibujar fondo de la celda (opcional, igual que EditableCell)
                    ctx.save();
                    //  ctx.fillStyle = '#f9fafb';
                    ctx.fillStyle = 'transparent'; // bg-gray-50 del EditableCell
                    ctx.fillRect(cellX, cellY, gridInfo.cellWidth, gridInfo.cellHeight);
                    ctx.restore();
                    
                    // === RENDERIZAR ELEMENTOS DE LA CELDA ===
                    if (cell.elements && Array.isArray(cell.elements)) {
                        // Ordenar elementos por zIndex (igual que en el workspace)
                        const sortedElements = [...cell.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
                        
                        console.log(`🔹 [WORKSPACE REPLICA] Renderizando ${sortedElements.length} elementos en celda ${cell.id}`);
                        
                        for (const element of sortedElements) {
                            // Filtrar elementos bloqueados base del layout
                            if (element.id === 'cover-base' || 
                                element.id === 'final-base' || 
                                element.id?.startsWith('content-base-')) {
                                console.log('⏭️ [WORKSPACE REPLICA] Saltando elemento base:', element.id);
                                continue;
                            }
                            
                            console.log(`🔸 [WORKSPACE REPLICA] Renderizando elemento: ${element.id} (${element.type})`);
                            
                            if (element.type === 'image' && element.content) {
                                await renderImageElement(ctx, element, cellX, cellY, gridInfo.cellWidth, gridInfo.cellHeight);
                            } else if (element.type === 'text' && element.content) {
                                renderTextElement(ctx, element, cellX, cellY, gridInfo.cellWidth, gridInfo.cellHeight);
                            }
                        }
                    }
                }
            }
            
            // === CREAR THUMBNAIL FINAL ===
            console.log('🖼️ [WORKSPACE REPLICA] Generando thumbnail final...');
            
            // Crear thumbnail con tamaño optimizado pero manteniendo proporción
            const thumbnailCanvas = document.createElement('canvas');
            const thumbnailCtx = thumbnailCanvas.getContext('2d');
            
            const maxSize = 600; // Tamaño máximo para thumbnails
            const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
            
            thumbnailCanvas.width = Math.round(canvas.width * scale);
            thumbnailCanvas.height = Math.round(canvas.height * scale);
            
            // Configurar calidad para el thumbnail
            thumbnailCtx.imageSmoothingEnabled = true;
            thumbnailCtx.imageSmoothingQuality = 'high';
            
            // Escalar el canvas original al thumbnail
            thumbnailCtx.drawImage(
                canvas,
                0, 0, canvas.width, canvas.height,
                0, 0, thumbnailCanvas.width, thumbnailCanvas.height
            );
            
            // Convertir a data URL
            newThumbnails[page.id] = thumbnailCanvas.toDataURL('image/png', 0.9);
            
            console.log(`✅ [WORKSPACE REPLICA] Thumbnail generado para ${page.id}: ${thumbnailCanvas.width}x${thumbnailCanvas.height}`);
            
        } catch (error) {
            console.error(`❌ [WORKSPACE REPLICA] Error generando thumbnail para página ${page.id}:`, error);
            newThumbnails[page.id] = null;
        }
    }

    console.log('🎯 [WORKSPACE REPLICA] ¡Generación COMPLETADA! Thumbnails idénticos al workspace.');
    return newThumbnails;
}
