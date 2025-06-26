/**
 * Generador de thumbnails que respeta EXACTAMENTE los layouts del workspace
 * Solucionando el problema de que los thumbnails no respetan la estructura de celdas CSS Grid
 */

import { layouts } from '../constants/layouts';

// Función para calcular las posiciones reales de las celdas según el layout CSS Grid
function calculateLayoutCellPositions(layout, workspaceDimensions, pageCells) {
    const cellPositions = {};
    
    if (!layout || !layout.template) {
        console.warn('⚠️ [THUMBNAIL] Layout inválido, usando posiciones fallback');
        // Fallback: posicionar todas las celdas en el mismo lugar
        pageCells.forEach(cell => {
            cellPositions[cell.id] = {
                x: 0,
                y: 0,
                width: workspaceDimensions.width,
                height: workspaceDimensions.height
            };
        });
        return cellPositions;
    }
    
    console.log('🗂️ [THUMBNAIL] Calculando posiciones para layout:', layout.template);
    
    // Parsear el template de CSS Grid
    const parseGridTemplate = (template) => {
        // Extraer cols y rows de strings como "grid-cols-2 grid-rows-3"
        const colsMatch = template.match(/grid-cols-(\d+)/);
        const rowsMatch = template.match(/grid-rows-(\d+)/);
        
        const cols = colsMatch ? parseInt(colsMatch[1]) : 1;
        const rows = rowsMatch ? parseInt(rowsMatch[1]) : 1;
        
        return { cols, rows };
    };
    
    const { cols, rows } = parseGridTemplate(layout.template);
    console.log('🗂️ [THUMBNAIL] Grid calculado:', { cols, rows });
    
    // Calcular gap y padding
    const gap = parseInt(layout.style?.gap?.replace('px', '')) || 0;
    const padding = parseInt(layout.style?.padding?.replace('px', '')) || 0;
    
    // Calcular dimensiones de las celdas
    const availableWidth = workspaceDimensions.width - (2 * padding) - (gap * (cols - 1));
    const availableHeight = workspaceDimensions.height - (2 * padding) - (gap * (rows - 1));
    
    const baseCellWidth = availableWidth / cols;
    const baseCellHeight = availableHeight / rows;
    
    console.log('📏 [THUMBNAIL] Dimensiones base de celda:', { 
        baseCellWidth, 
        baseCellHeight, 
        gap, 
        padding,
        availableWidth,
        availableHeight 
    });
    
    // Crear una matriz para colocar las celdas
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    // Función para parsear span de una celda
    const parseCellSpan = (styleStr, key, defaultVal = 1) => {
        if (!styleStr) return defaultVal;
        const regex = new RegExp(`${key}-span-(\\d+)`);
        const match = styleStr.match(regex);
        return match ? parseInt(match[1]) : defaultVal;
    };
    
    // Función para encontrar el primer lugar libre en el grid
    const findFirstFreeSpot = (grid, rows, cols, rowSpan, colSpan) => {
        for (let r = 0; r <= rows - rowSpan; r++) {
            for (let c = 0; c <= cols - colSpan; c++) {
                let canPlace = true;
                
                // Verificar si todas las celdas necesarias están libres
                for (let dr = 0; dr < rowSpan && canPlace; dr++) {
                    for (let dc = 0; dc < colSpan && canPlace; dc++) {
                        if (grid[r + dr] && grid[r + dr][c + dc] !== null) {
                            canPlace = false;
                        }
                    }
                }
                
                if (canPlace) {
                    return { row: r, col: c };
                }
            }
        }
        return { row: 0, col: 0 }; // Fallback
    };
    
    // Colocar cada celda en el grid
    pageCells.forEach((cell, index) => {
        const cellStyle = layout.cellStyles?.[index] || '';
        
        // Parsear spans
        const colSpan = parseCellSpan(cellStyle, 'col', 1);
        const rowSpan = parseCellSpan(cellStyle, 'row', 1);
        
        console.log(`🗂️ [THUMBNAIL] Celda ${index} (${cell.id}):`, { colSpan, rowSpan, cellStyle });
        
        // Encontrar posición libre
        const { row, col } = findFirstFreeSpot(grid, rows, cols, rowSpan, colSpan);
        
        // Marcar las celdas como ocupadas
        for (let dr = 0; dr < rowSpan; dr++) {
            for (let dc = 0; dc < colSpan; dc++) {
                if (grid[row + dr]) {
                    grid[row + dr][col + dc] = cell.id;
                }
            }
        }
        
        // Calcular posición y tamaño real
        const x = padding + (col * (baseCellWidth + gap));
        const y = padding + (row * (baseCellHeight + gap));
        const width = (baseCellWidth * colSpan) + (gap * (colSpan - 1));
        const height = (baseCellHeight * rowSpan) + (gap * (rowSpan - 1));
        
        cellPositions[cell.id] = { x, y, width, height };
        
        console.log(`📍 [THUMBNAIL] Celda ${cell.id} posicionada en:`, { 
            gridPos: { row, col }, 
            realPos: { x, y, width, height } 
        });
    });
    
    return cellPositions;
}

// Función para dibujar imagen manteniendo la relación de aspecto
function drawImageCover(ctx, img, dx, dy, dWidth, dHeight) {
    if (!img || !ctx) {
        console.warn('⚠️ No se puede dibujar: contexto o imagen no válidos');
        return;
    }
    
    const sWidth = img.width;
    const sHeight = img.height;
    
    if (sWidth === 0 || sHeight === 0) {
        console.warn('⚠️ Imagen con dimensiones cero:', { sWidth, sHeight });
        return;
    }
    
    // Asegurarse de que las dimensiones de destino sean válidas
    if (dWidth <= 0 || dHeight <= 0) {
        console.warn('⚠️ Dimensiones de destino inválidas:', { dWidth, dHeight });
        return;
    }
    
    // Calcular relación de aspecto
    const dRatio = dWidth / dHeight;
    const sRatio = sWidth / sHeight;
    
    // Calcular el área de recorte (source) para mantener la relación de aspecto
    let sx, sy, sw, sh;
    
    if (dRatio > sRatio) {
        // La imagen es más ancha que el área de destino
        sw = sWidth;
        sh = sw / dRatio;
        sx = 0;
        sy = (sHeight - sh) / 2;
    } else {
        // La imagen es más alta que el área de destino
        sh = sHeight;
        sw = sh * dRatio;
        sx = (sWidth - sw) / 2;
        sy = 0;
    }
    
    try {
        // Dibujar la imagen con las coordenadas y dimensiones calculadas
        ctx.save();
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 
            Math.max(0, sx), 
            Math.max(0, sy), 
            Math.min(sw, sWidth - sx), 
            Math.min(sh, sHeight - sy),
            dx, 
            dy, 
            dWidth, 
            dHeight
        );
        ctx.restore();
    } catch (e) {
        console.error('❌ Error al dibujar imagen:', e);
        console.error('Detalles:', { 
            source: { x: sx, y: sy, width: sw, height: sh },
            dest: { x: dx, y: dy, width: dWidth, height: dHeight },
            imgSize: { width: sWidth, height: sHeight }
        });
    }
}

/**
 * Función principal para generar thumbnails que respetan exactamente el layout del workspace
 */
export async function generateAccurateThumbnails({ pages, workspaceDimensions, presetData }) {
    const newThumbnails = {};
    
    console.log('🚀 [THUMBNAIL] Iniciando generación de thumbnails PRECISOS...');
    console.log('📊 [THUMBNAIL] Parámetros recibidos:', { 
        pagesCount: pages.length, 
        workspaceDimensions, 
        hasPresetData: !!presetData 
    });
    
    for (const page of pages) {
        try {
            const customCanvas = document.createElement('canvas');
            const customCtx = customCanvas.getContext('2d', { willReadFrequently: true });
            
            // Calcular dimensiones del canvas basadas en el workspace (1:1 ratio)
            customCanvas.width = workspaceDimensions.width;
            customCanvas.height = workspaceDimensions.height;
            
            // Configurar calidad de renderizado
            customCtx.imageSmoothingEnabled = true;
            customCtx.imageSmoothingQuality = 'high';
            customCtx.textRendering = 'geometricPrecision';
            customCtx.webkitImageSmoothingEnabled = true;
            customCtx.mozImageSmoothingEnabled = true;
            customCtx.msImageSmoothingEnabled = true;
            
            console.log('🖼️ [THUMBNAIL] Generando miniatura para página:', page?.type);
            console.log('🖼️ [THUMBNAIL] Layout:', page?.layout);
            
            // Renderizar fondo de la página (color + imagen de fondo)
            let bgColor = page.backgroundColor || '#ffffff';
            customCtx.fillStyle = bgColor;
            customCtx.fillRect(0, 0, workspaceDimensions.width, workspaceDimensions.height);
            
            if (page.backgroundImage) {
                try {
                    const bgImg = new Image();
                    bgImg.crossOrigin = 'anonymous';
                    bgImg.src = page.backgroundImage;
                    
                    await new Promise((resolve, reject) => {
                        if (bgImg.complete) {
                            console.log('✅ [THUMBNAIL] Imagen de fondo ya cargada');
                            return resolve();
                        }
                        bgImg.onload = () => {
                            console.log('✅ [THUMBNAIL] Imagen de fondo cargada exitosamente');
                            resolve();
                        };
                        bgImg.onerror = (error) => {
                            console.error('❌ [THUMBNAIL] Error cargando imagen de fondo:', error);
                            reject(error);
                        };
                    });
                    
                    drawImageCover(customCtx, bgImg, 0, 0, workspaceDimensions.width, workspaceDimensions.height);
                    console.log('✅ [THUMBNAIL] Imagen de fondo dibujada');
                } catch (error) {
                    console.error('❌ [THUMBNAIL] Error procesando imagen de fondo:', error);
                }
            }
            
            // Procesar las celdas si existen
            if (page.cells && Array.isArray(page.cells) && page.cells.length > 0) {
                // Buscar el layout correspondiente
                const layout = layouts.find(l => l.id === page.layout);
                
                if (!layout) {
                    console.warn('⚠️ [THUMBNAIL] Layout no encontrado para:', page.layout);
                    continue;
                }
                
                console.log('🗂️ [THUMBNAIL] Layout encontrado:', layout.name);
                
                // Calcular posiciones reales de las celdas usando el layout CSS Grid
                const cellPositions = calculateLayoutCellPositions(layout, workspaceDimensions, page.cells);
                
                // Ordenar celdas por posición (Y, luego X) para renderizado consistente
                const sortedCells = [...page.cells].sort((a, b) => {
                    const posA = cellPositions[a.id];
                    const posB = cellPositions[b.id];
                    if (!posA || !posB) return 0;
                    
                    if (posA.y !== posB.y) return posA.y - posB.y;
                    return posA.x - posB.x;
                });

                for (const cell of sortedCells) {
                    if (!cell || !cell.elements) continue;
                    
                    // Obtener la posición real de la celda calculada por el layout
                    const cellPosition = cellPositions[cell.id];
                    if (!cellPosition) {
                        console.warn('⚠️ [THUMBNAIL] No se encontró posición para celda:', cell.id);
                        continue;
                    }
                    
                    const { x: cellX, y: cellY, width: cellWidth, height: cellHeight } = cellPosition;
                    
                    console.log(`🗂️ [THUMBNAIL] Procesando celda ${cell.id} en posición:`, cellPosition);

                    // Ordenar elementos por zIndex
                    const sortedElements = [...(cell.elements || [])].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

                    for (const element of sortedElements) {
                        // Filtrar elementos base del layout (evitar duplicados)
                        if (
                            element.type === 'image' && (
                                element.id === 'cover-base' ||
                                element.id === 'final-base' ||
                                (typeof element.id === 'string' && element.id.startsWith('content-base-'))
                            )
                        ) {
                            continue;
                        }

                        // Solo renderizar elementos válidos
                        if (!element || (element.type !== 'image' && element.type !== 'text') || !element.content) continue;
                        
                        if (element.type === 'image') {
                            try {
                                const img = new Image();
                                img.crossOrigin = 'anonymous';
                                
                                // Cargar la imagen
                                await new Promise((resolve, reject) => {
                                    img.onload = resolve;
                                    img.onerror = reject;
                                    img.src = element.content;
                                });

                                // En el workspace real, las imágenes SIEMPRE ocupan toda la celda
                                // Los elementos de imagen se comportan como width:100% height:100% dentro de su celda
                                
                                // Para thumbnails, simplificar: las imágenes SIEMPRE ocupan toda la celda
                                // Ignorar tamaños específicos en píxeles ya que en el workspace se comportan como 100%
                                const elX = 0;  // Posición X relativa a la celda
                                const elY = 0;  // Posición Y relativa a la celda
                                const elW = cellWidth;   // Ancho = toda la celda
                                const elH = cellHeight;  // Alto = toda la celda

                                // Posición absoluta en la página (ajustada por la posición real de la celda)
                                const dx = cellX + elX;
                                const dy = cellY + elY;

                                console.log('📐 [THUMBNAIL] Renderizando imagen (OCUPANDO TODA LA CELDA):', {
                                    elementId: element.id,
                                    cellId: cell.id,
                                    cellPosition: { x: cellX, y: cellY, width: cellWidth, height: cellHeight },
                                    elementPosition: { x: elX, y: elY, width: elW, height: elH },
                                    finalPosition: { dx, dy },
                                    note: 'Imagen ocupa toda la celda como en workspace'
                                });

                                // Dibujar la imagen con las coordenadas exactas
                                drawImageCover(customCtx, img, dx, dy, elW, elH);
                                
                            } catch (error) {
                                console.error('❌ [THUMBNAIL] Error al cargar imagen:', error, element);
                            }
                        } else if (element.type === 'text') {
                            console.log('🔤 [THUMBNAIL] Procesando elemento de texto:', element.id, element.content);
                            
                            try {
                                // Para texto, usar posicionamiento similar al workspace
                                const isRelativeX = element.position?.x !== undefined && Math.abs(element.position.x) <= 1;
                                const isRelativeY = element.position?.y !== undefined && Math.abs(element.position.y) <= 1;

                                // Para thumbnails, respetar posición relativa o usar valores por defecto
                                const elX = isRelativeX ? element.position.x * cellWidth : (element.position?.x || 10);
                                const elY = isRelativeY ? element.position.y * cellHeight : (element.position?.y || 20);
                                
                                // Calcular dimensiones
                                let elW = cellWidth * 0.8; // Default width
                                let elH = cellHeight * 0.3; // Default height
                                
                                if (element.size?.width !== undefined) {
                                    elW = element.size.width <= 1 ? element.size.width * cellWidth : element.size.width;
                                }
                                
                                if (element.size?.height !== undefined) {
                                    elH = element.size.height <= 1 ? element.size.height * cellHeight : element.size.height;
                                }

                                // Posición absoluta en la página
                                const dx = cellX + elX;
                                const dy = cellY + elY;

                                console.log('📐 [THUMBNAIL] Renderizando texto:', {
                                    elementId: element.id,
                                    content: element.content,
                                    cellPosition: { x: cellX, y: cellY, width: cellWidth, height: cellHeight },
                                    elementPosition: { x: elX, y: elY, width: elW, height: elH },
                                    finalPosition: { dx, dy },
                                    originalPosition: element.position,
                                    isRelative: { x: isRelativeX, y: isRelativeY }
                                });

                                // Obtener estilos del elemento
                                const style = element.style || {};
                                
                                // Configurar contexto de texto
                                customCtx.save();
                                
                                // Configurar fuente
                                const fontSize = parseInt(style.fontSize) || 16;
                                const fontFamily = style.fontFamily || 'Arial';
                                const fontWeight = style.fontWeight || 'normal';
                                const fontStyle = style.fontStyle || 'normal';
                                
                                customCtx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
                                customCtx.fillStyle = style.color || '#000000';
                                
                                // Configurar alineación
                                const textAlign = style.textAlign || 'left';
                                customCtx.textAlign = textAlign;
                                customCtx.textBaseline = 'top';
                                
                                // Dibujar fondo del texto si existe
                                if (style.backgroundColor && style.backgroundColor !== 'transparent') {
                                    customCtx.fillStyle = style.backgroundColor;
                                    customCtx.fillRect(dx, dy, elW, elH);
                                    customCtx.fillStyle = style.color || '#000000';
                                }
                                
                                // Manejar texto multilinea
                                const lines = element.content.split('\n');
                                const lineHeight = fontSize * 1.2;
                                const padding = parseInt(style.padding) || 8;
                                
                                lines.forEach((line, index) => {
                                    if (line.trim()) {
                                        let textX, textY;
                                        
                                        // Calcular posición Y
                                        textY = dy + (index * lineHeight) + padding;
                                        
                                        // Calcular posición X según la alineación
                                        switch (textAlign) {
                                            case 'center':
                                                textX = dx + (elW / 2);
                                                break;
                                            case 'right':
                                                textX = dx + elW - padding;
                                                break;
                                            case 'left':
                                            default:
                                                textX = dx + padding;
                                                break;
                                        }
                                        
                                        // Verificar que estamos en el canvas
                                        if (textX >= 0 && textY >= 0 && textX < workspaceDimensions.width && textY < workspaceDimensions.height) {
                                            customCtx.fillText(line, textX, textY);
                                            console.log(`✅ [THUMBNAIL] Línea "${line}" dibujada en x=${textX}, y=${textY}`);
                                        }
                                    }
                                });
                                
                                customCtx.restore();
                                console.log('✅ [THUMBNAIL] Texto renderizado exitosamente:', element.id);
                                
                            } catch (error) {
                                console.error('❌ [THUMBNAIL] Error renderizando texto:', error, element);
                            }
                        }
                    }
                }
            }
            
            // Crear el thumbnail con tamaño optimizado manteniendo relación de aspecto
            const thumbnailCanvas = document.createElement('canvas');
            const thumbnailCtx = thumbnailCanvas.getContext('2d');
            
            // Tamaño máximo del thumbnail
            const maxThumbnailSize = 800;
            let thumbWidth, thumbHeight;
            
            // Calcular dimensiones manteniendo la relación de aspecto
            if (workspaceDimensions.width > workspaceDimensions.height) {
                thumbWidth = Math.min(maxThumbnailSize, workspaceDimensions.width);
                thumbHeight = (thumbWidth / workspaceDimensions.width) * workspaceDimensions.height;
            } else {
                thumbHeight = Math.min(maxThumbnailSize, workspaceDimensions.height);
                thumbWidth = (thumbHeight / workspaceDimensions.height) * workspaceDimensions.width;
            }
            
            // Asegurar valores enteros
            thumbWidth = Math.round(thumbWidth);
            thumbHeight = Math.round(thumbHeight);
            
            // Configurar canvas del thumbnail
            thumbnailCanvas.width = thumbWidth;
            thumbnailCanvas.height = thumbHeight;
            
            // Configurar calidad de renderizado
            thumbnailCtx.imageSmoothingEnabled = true;
            thumbnailCtx.imageSmoothingQuality = 'high';
            thumbnailCtx.webkitImageSmoothingEnabled = true;
            thumbnailCtx.mozImageSmoothingEnabled = true;
            thumbnailCtx.msImageSmoothingEnabled = true;
            
            // Dibujar el contenido escalado al tamaño del thumbnail
            thumbnailCtx.drawImage(
                customCanvas,
                0, 0, customCanvas.width, customCanvas.height,
                0, 0, thumbWidth, thumbHeight
            );
            
            // Convertir a base64
            newThumbnails[page.id] = thumbnailCanvas.toDataURL('image/png', 0.92);
            console.log('✅ [THUMBNAIL] Thumbnail PRECISO generado exitosamente para página:', page.id);
            
        } catch (error) {
            console.error(`❌ Error generando thumbnail para página ${page.id}:`, error);
            newThumbnails[page.id] = null;
        }
    }
    
    console.log('🎯 [THUMBNAIL] Generación de thumbnails PRECISOS completada');
    return newThumbnails;
}
