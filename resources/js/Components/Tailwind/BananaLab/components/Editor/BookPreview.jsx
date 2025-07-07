import { useState, useRef, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Global from "../../../../../Utils/Global";
import { layouts } from '../../constants/layouts';

// Estilos para el modal
const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        padding: "0",
        border: "none",
        background: "none",
        overflow: "visible",
    },
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 1000,
    },
};

// Estilos CSS adicionales para eliminar márgenes del flipbook y mantener nitidez nativa
const flipbookStyles = `
    .stf__wrapper {
        margin: 0 !important;
        padding: 0 !important;
    }
    .stf__block {
        margin: 0 !important;
        padding: 0 !important;
    }
    .stf__page {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
    }
    .page-container img {
        display: block;
        margin: 0;
        padding: 0;
        border: none;
        outline: none;
        image-rendering: -webkit-optimize-contrast !important;
        image-rendering: high-quality !important;
        -webkit-backface-visibility: hidden !important;
        backface-visibility: hidden !important;
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;
        -ms-interpolation-mode: bicubic !important;
    }
    .page-container {
        -webkit-font-smoothing: subpixel-antialiased !important;
        -moz-osx-font-smoothing: auto !important;
    }
`;

Modal.setAppElement('#app'); // Configurar elemento raíz para accesibilidad

const BookPreviewModal = ({ 
    isOpen, 
    onRequestClose, 
    pages, 
    pageThumbnails = {}, 
    addAlbumToCart, 
    workspaceDimensions = { width: 800, height: 600 }, 
    layouts = [], 
    presetData = null,
    projectData = null,
    itemData = null
}) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [generatedThumbnails, setGeneratedThumbnails] = useState({});
    const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
    const flipBook = useRef();

    // Reemplazar la función drawImageCover por una versión fiel a object-fit: cover
    function drawImageCover(ctx, img, dx, dy, dWidth, dHeight) {
        const sWidth = img.width;
        const sHeight = img.height;
        const dRatio = dWidth / dHeight;
        const sRatio = sWidth / sHeight;
        let sx = 0, sy = 0, sw = sWidth, sh = sHeight;
        if (dRatio > sRatio) {
            // El área destino es más ancha: recorta arriba/abajo
            sh = sWidth / dRatio;
            sy = (sHeight - sh) / 2;
        } else {
            // El área destino es más alta: recorta a los lados
            sw = sHeight * dRatio;
            sx = (sWidth - sw) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dWidth, dHeight);
    }

    function parseGridTemplate(template) {
        const colsMatch = template.match(/grid-cols-(\d+)/);
        const rowsMatch = template.match(/grid-rows-(\d+)/);
        const gapMatch = template.match(/gap-(\d+)/);
        return {
            cols: colsMatch ? parseInt(colsMatch[1], 10) : 1,
            rows: rowsMatch ? parseInt(rowsMatch[1], 10) : 1,
            gap: gapMatch ? parseInt(gapMatch[1], 10) * 4 : 0 // tailwind gap-1 = 0.25rem = 4px
        };
    }

    function parseCellSpan(styleStr, key, defaultVal = 1) {
        const match = styleStr && styleStr.match(new RegExp(`${key}-span-(\\d+)`));
        return match ? parseInt(match[1], 10) : defaultVal;
    }

    function findFirstFreeSpot(grid, rows, cols, rowSpan, colSpan) {
        for (let row = 0; row <= rows - rowSpan; row++) {
            for (let col = 0; col <= cols - colSpan; col++) {
                let canPlace = true;
                for (let r = row; r < row + rowSpan; r++) {
                    for (let c = col; c < col + colSpan; c++) {
                        if (grid[r][c] !== null) {
                            canPlace = false;
                            break;
                        }
                    }
                    if (!canPlace) break;
                }
                if (canPlace) return { row, col };
            }
        }
        return null;
    }

    function getLayoutCellPositions(layout, workspaceDimensions, pageCells) {
        const { cols, rows, gap } = parseGridTemplate(layout.template);
        const padding = layout.style && layout.style.padding ? parseInt(layout.style.padding) : 0;
        const width = workspaceDimensions.width - 2 * padding;
        const height = workspaceDimensions.height - 2 * padding;
        const cellWidth = (width - gap * (cols - 1)) / cols;
        const cellHeight = (height - gap * (rows - 1)) / rows;
        const grid = Array.from({ length: rows }, () => Array(cols).fill(false));
        const positions = {};
        for (let i = 0; i < layout.cells; i++) {
            const styleStr = layout.cellStyles && layout.cellStyles[i] ? layout.cellStyles[i] : '';
            const colSpan = parseCellSpan(styleStr, 'col', 1);
            const rowSpan = parseCellSpan(styleStr, 'row', 1);
            let placed = false;
            for (let r = 0; r <= rows - rowSpan && !placed; r++) {
                for (let c = 0; c <= cols - colSpan && !placed; c++) {
                    let canPlace = true;
                    for (let rr = r; rr < r + rowSpan; rr++) {
                        for (let cc = c; cc < c + colSpan; cc++) {
                            if (grid[rr][cc]) {
                                canPlace = false;
                                break;
                            }
                        }
                        if (!canPlace) break;
                    }
                    if (canPlace) {
                        for (let rr = r; rr < r + rowSpan; rr++) {
                            for (let cc = c; cc < c + colSpan; cc++) {
                                grid[rr][cc] = true;
                            }
                        }
                        const cellId = pageCells && pageCells[i] ? pageCells[i].id : i;
                        positions[cellId] = {
                            x: padding + c * (cellWidth + gap),
                            y: padding + r * (cellHeight + gap),
                            width: cellWidth * colSpan + gap * (colSpan - 1),
                            height: cellHeight * rowSpan + gap * (rowSpan - 1)
                        };
                        console.log(`[GRID-PLACEMENT] cellId:${cellId} col-span:${colSpan} row-span:${rowSpan} => x:${positions[cellId].x} y:${positions[cellId].y} w:${positions[cellId].width} h:${positions[cellId].height}`);
                        placed = true;
                    }
                }
            }
            if (!placed) {
                const cellId = pageCells && pageCells[i] ? pageCells[i].id : i;
                console.warn(`[GRID-PLACEMENT] No se pudo ubicar la celda ${cellId}`);
                positions[cellId] = { x: 0, y: 0, width: cellWidth, height: cellHeight };
            }
        }
        return positions;
    }

    // Función para generar thumbnails de alta calidad
    const generateHighQualityThumbnails = useCallback(async () => {
        if (!pages || pages.length === 0 || !isOpen) return;
        
        console.log('🚀 Iniciando generación de thumbnails para BookPreview...');
        setIsGeneratingThumbnails(true);
        setGeneratedThumbnails({});
        
        const newThumbnails = {};
        const scale = 4; // Factor de escala para alta resolución
        
        // Función auxiliar para dibujar elementos en la posición correcta
        const drawElementInCell = (ctx, element, cellPosition, scale) => {
            if (!element || !element.image) return;
            
            const img = new Image();
            img.src = element.image;
            
            img.onload = () => {
                // Calcular posición y tamaño del elemento dentro de la celda
                const elementX = cellPosition.x + element.x * scale;
                const elementY = cellPosition.y + element.y * scale;
                const elementWidth = element.width * scale;
                const elementHeight = element.height * scale;
                
                // Dibujar imagen usando la función drawImageCover
                drawImageCover(ctx, img, elementX, elementY, elementWidth, elementHeight);
            };
        };

        // Función para generar thumbnail de una página
        const generatePageThumbnail = async (page, index) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Establecer dimensiones del canvas
            canvas.width = workspaceDimensions.width * scale;
            canvas.height = workspaceDimensions.height * scale;
            
            // Dibujar fondo de la página
            if (presetData && presetData.final_layer_image) {
                const bgImg = new Image();
                bgImg.src = presetData.final_layer_image;
                bgImg.onload = () => {
                    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                };
            }

            // Obtener posiciones de las celdas
            const layout = layouts.find(l => l.id === page.layoutId);
            if (!layout) return;
            
            const cellPositions = getLayoutCellPositions(layout, workspaceDimensions, page.cells);
            
            // Dibujar elementos en sus celdas correspondientes
            page.cells.forEach(cell => {
                const cellPosition = cellPositions[cell.id];
                if (cellPosition) {
                    cell.elements.forEach(element => {
                        drawElementInCell(ctx, element, cellPosition, scale);
                    });
                }
            });

            // Generar thumbnail
            const thumbnail = canvas.toDataURL('image/jpeg', 0.9);
            return { [index]: thumbnail };
        };

        // Generar thumbnails para todas las páginas
        const promises = pages.map((page, index) => generatePageThumbnail(page, index));
        const thumbnails = await Promise.all(promises);
        
        // Combinar todos los thumbnails
        thumbnails.forEach(thumb => {
            Object.assign(newThumbnails, thumb);
        });

        // Actualizar estado
        setGeneratedThumbnails(newThumbnails);
        setIsGeneratingThumbnails(false);
    }, [pages, isOpen, workspaceDimensions, layouts, presetData]);

    // Función para generar PDF de alta calidad usando html2canvas como en Editor.jsx
    const generatePDF = useCallback(async () => {
        if (!pages || pages.length === 0) {
            alert('No hay páginas para generar el PDF');
            return;
        }

        setIsGeneratingPDF(true);

        try {
            console.log('🚀 Iniciando generación de PDF con captura DOM...');

            // 🖨️ DIMENSIONES PROFESIONALES: Con sangrado para impresión
            let pageWidthCm = workspaceDimensions.width * 0.0264583; // Convert px to cm (96 DPI)
            let pageHeightCm = workspaceDimensions.height * 0.0264583;
            
            // Si tenemos preset data con dimensiones específicas, usar esas
            if (presetData?.width && presetData?.height) {
                pageWidthCm = presetData.width;
                pageHeightCm = presetData.height;
            }
            
            // Agregar sangrado de 3mm (0.3cm) en cada lado para impresión profesional
            const bleedCm = 0.3; // 3mm de sangrado estándar
            const printWidthCm = pageWidthCm + (bleedCm * 2);
            const printHeightCm = pageHeightCm + (bleedCm * 2);
            
            // Convertir a puntos (1 cm = 28.35 puntos)
            const pageWidthPt = printWidthCm * 28.35;
            const pageHeightPt = printHeightCm * 28.35;
            
            console.log('📏 Dimensiones PDF con sangrado profesional:', {
                originalWidthCm: pageWidthCm,
                originalHeightCm: pageHeightCm,
                printWidthCm: printWidthCm,
                printHeightCm: printHeightCm,
                widthPt: pageWidthPt,
                heightPt: pageHeightPt,
                bleedCm: bleedCm
            });

            // 🖨️ PDF PROFESIONAL: Sin compresión para máxima calidad de impresión
            const pdf = new jsPDF({
                orientation: pageWidthPt > pageHeightPt ? 'landscape' : 'portrait',
                unit: 'pt',
                format: [pageWidthPt, pageHeightPt],
                compress: false // Sin compresión para calidad profesional
            });

            // Mostrar progreso
            const totalPages = pages.length;
            let processedPages = 0;

            // Crear elemento de progreso
            const progressContainer = document.createElement('div');
            progressContainer.id = 'pdf-progress';
            progressContainer.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            progressContainer.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 class="text-lg font-semibold mb-4">Generando PDF de alta calidad...</h3>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div id="pdf-progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <p class="text-sm text-gray-600 mt-2">
                        <span id="current-page">0</span> de ${totalPages} páginas procesadas
                    </p>
                </div>
            `;
            document.body.appendChild(progressContainer);

            const updateProgress = (current) => {
                const percentage = (current / totalPages) * 100;
                const progressBar = document.getElementById('pdf-progress-bar');
                const currentPageSpan = document.getElementById('current-page');
                if (progressBar) progressBar.style.width = `${percentage}%`;
                if (currentPageSpan) currentPageSpan.textContent = current;
            };

            // Función auxiliar para capturar página usando html2canvas (igual que Editor.jsx)
            const capturePageWithDOM = async (pageIndex) => {
                try {
                    const page = pages[pageIndex];
                    const workspaceElement = document.querySelector(`#page-${page.id}`);
                    
                    if (!workspaceElement) {
                        console.warn(`❌ No se encontró elemento DOM para página ${page.id}`);
                        return null;
                    }

                    console.log(`📸 Capturando página ${pageIndex + 1} con DOM: ${page.id}`);

                    // 🖨️ CONFIGURACIÓN PROFESIONAL: Escala alta para PDF 300 DPI
                    const scaleFactor = 11.81; // 11.81x para 300 DPI exacto (300/25.4 ≈ 11.81)
                    const quality = 1.0; // Calidad máxima sin compresión

                    // Obtener background correcto de la página
                    let workspaceBackground = page?.backgroundColor || '#ffffff';
                    const workspaceStyle = getComputedStyle(workspaceElement);
                    if (workspaceStyle.backgroundColor && workspaceStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                        workspaceBackground = workspaceStyle.backgroundColor;
                    }

                    // 🖨️ OPCIONES PROFESIONALES PARA PDF
                    const captureOptions = {
                        scale: scaleFactor, // 11.81x para PDF 300 DPI exacto
                        useCORS: true,
                        allowTaint: false,
                        backgroundColor: workspaceBackground,
                        width: workspaceDimensions.width,
                        height: workspaceDimensions.height,
                        x: 0,
                        y: 0,
                        scrollX: 0,
                        scrollY: 0,
                        foreignObjectRendering: true, // Mejor renderizado para PDF
                        removeContainer: false,
                        logging: false,
                        imageTimeout: 60000, // 60s para PDF de alta calidad
                        pixelRatio: 3, // Triple pixel ratio para PDF
                        onclone: async (clonedDoc) => {
                            console.log(`🔍 Procesando clonado para página ${pageIndex + 1}...`);
                            
                            // Limpiar elementos de UI que no pertenecen al workspace
                            const excludedSelectors = [
                                '.toolbar', '.ui-element', '.floating', '.overlay', '.modal', '.popover', 
                                '.text-toolbar', '.element-selector', '.element-controls', '.resize-handle',
                                '.resize-control-handle', '.resize-manipulation-indicator',
                                '.sidebar', '.panel', '.btn', '.button', '.control', '.menu', '.dropdown',
                                '.tooltip', '.pointer-events-none', '[data-exclude-thumbnail="true"]'
                            ];
                            
                            excludedSelectors.forEach(selector => {
                                try {
                                    const elements = clonedDoc.querySelectorAll(selector);
                                    elements.forEach(el => el.remove());
                                } catch (e) {
                                    console.warn('Error removing selector:', selector, e);
                                }
                            });

                            // Configurar específicamente el elemento de página clonado
                            try {
                                const clonedPageElement = clonedDoc.querySelector(`#page-${page.id}`);
                                
                                if (clonedPageElement) {
                                    // Asegurar dimensiones exactas del workspace
                                    clonedPageElement.style.width = workspaceDimensions.width + 'px';
                                    clonedPageElement.style.height = workspaceDimensions.height + 'px';
                                    clonedPageElement.style.position = 'relative';
                                    clonedPageElement.style.overflow = 'hidden';
                                    
                                    // Aplicar backgrounds de la página
                                    if (page?.backgroundImage) {
                                        console.log(`🖼️ Aplicando backgroundImage: ${page.backgroundImage}`);
                                        clonedPageElement.style.backgroundImage = `url(${page.backgroundImage})`;
                                        clonedPageElement.style.backgroundSize = 'cover';
                                        clonedPageElement.style.backgroundPosition = 'center';
                                        clonedPageElement.style.backgroundRepeat = 'no-repeat';
                                    }
                                    
                                    if (page?.backgroundColor) {
                                        console.log(`🎨 Aplicando backgroundColor: ${page.backgroundColor}`);
                                        clonedPageElement.style.backgroundColor = page.backgroundColor;
                                    }
                                }
                            } catch (e) {
                                console.error('❌ Error configurando elemento de página:', e);
                            }

                            // Pre-procesamiento avanzado de imágenes
                            try {
                                console.log('🔧 Iniciando pre-procesamiento avanzado de imágenes...');
                                
                                // Capturar datos originales de imágenes
                                const originalImageData = new Map();
                                const originalImages = workspaceElement.querySelectorAll('[data-element-type="image"] img, .workspace-image, img');
                                
                                originalImages.forEach((img, index) => {
                                    if (img.complete && img.naturalWidth > 0) {
                                        const container = img.closest('[data-element-type="image"]') || img.parentElement;
                                        const containerRect = container.getBoundingClientRect();
                                        
                                        originalImageData.set(img.src, {
                                            src: img.src,
                                            naturalWidth: img.naturalWidth,
                                            naturalHeight: img.naturalHeight,
                                            containerWidth: containerRect.width,
                                            containerHeight: containerRect.height,
                                            objectFit: getComputedStyle(img).objectFit || 'cover',
                                            objectPosition: getComputedStyle(img).objectPosition || 'center',
                                            crossOrigin: img.crossOrigin
                                        });
                                    }
                                });

                                // Aplicar estilos CSS para imágenes optimizadas
                                const style = clonedDoc.createElement('style');
                                style.textContent = `
                                    /* Configuración de página */
                                    #page-${page.id} {
                                        width: ${workspaceDimensions.width}px !important;
                                        height: ${workspaceDimensions.height}px !important;
                                        position: relative !important;
                                        overflow: hidden !important;
                                        box-sizing: border-box !important;
                                        background-size: cover !important;
                                        background-position: center !important;
                                        background-repeat: no-repeat !important;
                                    }
                                    
                                    /* Imágenes profesionales para PDF 300 DPI */
                                    img {
                                        width: 100% !important;
                                        height: 100% !important;
                                        object-fit: cover !important;
                                        object-position: center !important;
                                        display: block !important;
                                        image-rendering: -webkit-optimize-contrast !important;
                                        image-rendering: -webkit-crisp-edges !important;
                                        image-rendering: -moz-crisp-edges !important;
                                        image-rendering: pixelated !important;
                                        image-rendering: crisp-edges !important;
                                        image-rendering: optimizeQuality !important;
                                        backface-visibility: hidden !important;
                                        transform: translateZ(0) scale(1) !important;
                                        will-change: transform !important;
                                        filter: contrast(1.02) saturate(1.05) !important;
                                        max-width: none !important;
                                        max-height: none !important;
                                        border: none !important;
                                        outline: none !important;
                                    }
                                    
                                    /* Contenedores de imagen */
                                    [data-element-type="image"] {
                                        overflow: hidden !important;
                                        position: relative !important;
                                    }
                                    
                                    [data-element-type="image"] > div {
                                        width: 100% !important;
                                        height: 100% !important;
                                        overflow: hidden !important;
                                    }
                                    
                                    /* Optimizaciones generales para PDF */
                                    * {
                                        -webkit-font-smoothing: antialiased !important;
                                        -moz-osx-font-smoothing: grayscale !important;
                                        text-rendering: optimizeLegibility !important;
                                        -webkit-backface-visibility: hidden !important;
                                        backface-visibility: hidden !important;
                                        -webkit-transform: translateZ(0) !important;
                                        transform: translateZ(0) !important;
                                    }
                                    
                                    /* Elementos de texto de alta calidad */
                                    p, span, div, h1, h2, h3, h4, h5, h6, [contenteditable] {
                                        text-rendering: optimizeLegibility !important;
                                        -webkit-font-smoothing: antialiased !important;
                                        -moz-osx-font-smoothing: grayscale !important;
                                        font-smooth: always !important;
                                    }
                                    
                                    /* Elementos vectoriales de alta calidad */
                                    svg, path, circle, rect, line {
                                        shape-rendering: geometricPrecision !important;
                                        vector-effect: non-scaling-stroke !important;
                                    }
                                `;
                                clonedDoc.head.appendChild(style);
                                console.log('✅ CSS para PDF aplicado correctamente');
                                
                            } catch (e) {
                                console.error('❌ Error en pre-procesamiento avanzado:', e);
                            }
                        }
                    };

                    // Capturar con html2canvas
                    const canvas = await html2canvas(workspaceElement, captureOptions);
                    
                    if (!canvas) {
                        throw new Error('html2canvas no devolvió un canvas válido');
                    }
                    
                    // Post-procesamiento para PDF de impresión profesional
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            // Mejorar el contraste y nitidez para impresión
                            ctx.imageSmoothingEnabled = false;
                            ctx.imageSmoothingQuality = 'high';
                            
                            // Aplicar filtros de mejora de calidad
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const data = imageData.data;
                            
                            // Ligero aumento de contraste para impresión
                            for (let i = 0; i < data.length; i += 4) {
                                data[i] = Math.min(255, data[i] * 1.05);     // R
                                data[i + 1] = Math.min(255, data[i + 1] * 1.05); // G
                                data[i + 2] = Math.min(255, data[i + 2] * 1.05); // B
                            }
                            
                            ctx.putImageData(imageData, 0, 0);
                            console.log('✅ Post-procesamiento de calidad aplicado');
                        }
                    }
                    
                    console.log(`✅ Página ${pageIndex + 1} capturada exitosamente`);
                    return canvas;
                    
                } catch (error) {
                    console.error(`❌ Error capturando página ${pageIndex + 1}:`, error);
                    return null;
                }
            };

            // Procesar cada página usando captura DOM
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                console.log(`🔄 Procesando página ${i + 1}/${totalPages}: ${page.id}`);
                
                try {
                    // Capturar página usando DOM (como en Editor.jsx)
                    const canvas = await capturePageWithDOM(i);
                    
                    if (canvas) {
                        // Calcular dimensiones para mantener aspecto y llenar la página
                        const canvasAspect = canvas.width / canvas.height;
                        const pageAspect = pageWidthPt / pageHeightPt;
                        
                        let imgWidth, imgHeight, offsetX = 0, offsetY = 0;
                        
                        if (canvasAspect > pageAspect) {
                            imgWidth = pageWidthPt;
                            imgHeight = pageWidthPt / canvasAspect;
                            offsetY = (pageHeightPt - imgHeight) / 2;
                        } else {
                            imgHeight = pageHeightPt;
                            imgWidth = pageHeightPt * canvasAspect;
                            offsetX = (pageWidthPt - imgWidth) / 2;
                        }
                        
                        // 🖨️ CALIDAD PROFESIONAL: PNG sin compresión para impresión
                        const imgData = canvas.toDataURL('image/png', 1.0);
                        
                        // Agregar página si no es la primera
                        if (i > 0) {
                            pdf.addPage([pageWidthPt, pageHeightPt]);
                        }
                        
                        // 🖨️ Agregar imagen PNG de alta calidad al PDF
                        pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight);
                        
                        console.log(`✅ Página ${i + 1} agregada al PDF`);
                    } else {
                        console.warn(`⚠️ No se pudo capturar la página ${i + 1}`);
                        
                        // Agregar página en blanco si falla la captura
                        if (i > 0) {
                            pdf.addPage([pageWidthPt, pageHeightPt]);
                        }
                        
                        // Agregar texto de error
                        pdf.setFontSize(12);
                        pdf.text(`Error al renderizar página ${i + 1}`, pageWidthPt / 2, pageHeightPt / 2, { align: 'center' });
                    }
                } catch (pageError) {
                    console.error(`❌ Error procesando página ${i + 1}:`, pageError);
                    
                    // Agregar página de error
                    if (i > 0) {
                        pdf.addPage([pageWidthPt, pageHeightPt]);
                    }
                    
                    pdf.setFontSize(12);
                    pdf.text(`Error al procesar página ${i + 1}`, pageWidthPt / 2, pageHeightPt / 2, { align: 'center' });
                }
                
                processedPages++;
                updateProgress(processedPages);
                
                // Pausa pequeña entre páginas para no sobrecargar el navegador
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // Generar nombre del archivo
            const fileName = `${itemData?.name || projectData?.name || 'album'}_${new Date().toISOString().split('T')[0]}.pdf`;
            
            // Descargar el PDF
            pdf.save(fileName);
            
            // Remover progreso
            if (document.getElementById('pdf-progress')) {
                document.body.removeChild(progressContainer);
            }
            
            console.log('✅ PDF generado exitosamente:', fileName);
            
            // Mostrar mensaje de éxito
            const successMsg = document.createElement('div');
            successMsg.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg z-50';
            successMsg.innerHTML = `
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <span>PDF de alta calidad generado: ${fileName}</span>
                </div>
            `;
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                if (document.body.contains(successMsg)) {
                    document.body.removeChild(successMsg);
                }
            }, 5000);
            
        } catch (error) {
            console.error('❌ Error generando PDF:', error);
            
            // Remover progreso si existe
            const progressElement = document.getElementById('pdf-progress');
            if (progressElement && document.body.contains(progressElement)) {
                document.body.removeChild(progressElement);
            }
            
            // Mostrar error
            const errorMsg = document.createElement('div');
            errorMsg.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg z-50';
            errorMsg.innerHTML = `
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Error al generar PDF: ${error.message}</span>
                </div>
            `;
            document.body.appendChild(errorMsg);
            
            setTimeout(() => {
                if (document.body.contains(errorMsg)) {
                    document.body.removeChild(errorMsg);
                }
            }, 5000);
        } finally {
            setIsGeneratingPDF(false);
        }
    }, [pages, workspaceDimensions, presetData, itemData, projectData]);
          

    // Funciones auxiliares


    // Efectos de React
    useEffect(() => {
        if (isOpen) {
            if (Object.keys(pageThumbnails).length === 0) {
                generateHighQualityThumbnails();
            } else {
                setGeneratedThumbnails(pageThumbnails);
            }
        }
    }, [isOpen, pageThumbnails]);

    useEffect(() => {
        if (!isOpen) {
            setGeneratedThumbnails({});
        }
    }, [isOpen]);



       

     // Función para crear un placeholder elegante para una página específica
    const createElegantPlaceholderForPage = (page, workspaceDimensions) => {
        console.log(`🎨 Creando placeholder para página ${page.id} (${page.type})`);
        
        // Calcular dimensiones del preview con la proporción exacta del workspace
        const workspaceAspectRatio = workspaceDimensions.width / workspaceDimensions.height;
        const previewBaseWidht = 800;
        const previewHeight = previewBaseWidht;
        const previewWidth = Math.round(previewHeight * workspaceAspectRatio);

        // HiDPI fix
        const ratio = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = previewWidth * ratio;
        canvas.height = previewHeight * ratio;
        canvas.style.width = `${previewWidth}px`;
        canvas.style.height = `${previewHeight}px`;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

        // Fondo blanco limpio
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, previewWidth, previewHeight);

        // Borde elegante
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, previewWidth - 40, previewHeight - 40);

        // Configuración de texto
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Información de la página
        let pageTitle = '';
        let pageIcon = '';
        let pageSubtitle = '';
        let backgroundColor = '#f8fafc';
        let iconColor = '#64748b';

        switch (page.type) {
            case 'cover':
                pageTitle = 'Portada';
                pageIcon = '📚';
                pageSubtitle = 'Página de inicio del álbum';
                backgroundColor = '#fef7ef';
                iconColor = '#ea580c';
                break;
            case 'final':
                pageTitle = 'Contraportada';
                pageIcon = '📖';
                pageSubtitle = 'Página final del álbum';
                backgroundColor = '#f0f9ff';
                iconColor = '#0284c7';
                break;
            case 'content':
                pageTitle = `Página ${page.pageNumber || 'de contenido'}`;
                pageIcon = '📄';
                pageSubtitle = 'Página de contenido';
                backgroundColor = '#f0fdf4';
                iconColor = '#16a34a';
                break;
            default:
                pageTitle = `Página ${page.pageNumber || '?'}`;
                pageIcon = '📄';
                pageSubtitle = 'Contenido del álbum';
                backgroundColor = '#f8fafc';
                iconColor = '#64748b';
        }

        // Fondo de color suave
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(40, 40, previewWidth - 80, previewHeight - 80);

        // Icono principal (emoji grande)
        ctx.font = `${Math.min(previewWidth, previewHeight) * 0.12}px Arial`;
        ctx.fillText(pageIcon, previewWidth / 2, previewHeight / 2 - 50);

        // Título de la página
        ctx.font = `bold ${Math.min(previewWidth, previewHeight) * 0.035}px Arial`;
        ctx.fillStyle = '#1e293b';
        ctx.fillText(pageTitle, previewWidth / 2, previewHeight / 2 + 15);

        // Subtítulo
        ctx.font = `${Math.min(previewWidth, previewHeight) * 0.022}px Arial`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(pageSubtitle, previewWidth / 2, previewHeight / 2 + 45);

        // Información adicional si hay layout
        if (page.layout && layouts.length > 0) {
            const layout = layouts.find(l => l.id === page.layout);
            if (layout) {
                ctx.font = `${Math.min(previewWidth, previewHeight) * 0.018}px Arial`;
                ctx.fillStyle = '#94a3b8';
                ctx.fillText(`Layout: ${layout.name || 'Personalizado'}`, previewWidth / 2, previewHeight / 2 + 75);
            }
        }

        // Decoración sutil en las esquinas
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        // Esquinas decorativas
        const cornerSize = 15;
        const margin = 30;
        
        // Esquina superior izquierda
        ctx.beginPath();
        ctx.moveTo(margin, margin + cornerSize);
        ctx.lineTo(margin, margin);
        ctx.lineTo(margin + cornerSize, margin);
        ctx.stroke();
        
        // Esquina superior derecha
        ctx.beginPath();
        ctx.moveTo(previewWidth - margin - cornerSize, margin);
        ctx.lineTo(previewWidth - margin, margin);
        ctx.lineTo(previewWidth - margin, margin + cornerSize);
        ctx.stroke();
        
        // Esquina inferior izquierda
        ctx.beginPath();
        ctx.moveTo(margin, previewHeight - margin - cornerSize);
        ctx.lineTo(margin, previewHeight - margin);
        ctx.lineTo(margin + cornerSize, previewHeight - margin);
        ctx.stroke();
        
        // Esquina inferior derecha
        ctx.beginPath();
        ctx.moveTo(previewWidth - margin - cornerSize, previewHeight - margin);
        ctx.lineTo(previewWidth - margin, previewHeight - margin);
        ctx.lineTo(previewWidth - margin, previewHeight - margin - cornerSize);
        ctx.stroke();

        return canvas.toDataURL('image/png', 1.0);
    };

    // Usar thumbnails en este orden de prioridad:
    // 1. Thumbnails proporcionados (de Editor.jsx)
    // 2. Thumbnails generados localmente
    const activeThumbnails = Object.keys(pageThumbnails).length > 0 ? 
        pageThumbnails : 
        generatedThumbnails;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={onRequestClose}
                style={customStyles}
                contentLabel="Vista previa del álbum"
                ariaHideApp={true}
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 id="modal-title" className="text-xl font-bold">Vista previa del álbum</h2>
                        <button
                            onClick={onRequestClose}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Cerrar vista previa"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <p id="modal-description" className="text-gray-600">No hay páginas disponibles para mostrar.</p>
                </div>
            </Modal>
        );
    }

    const goToPrevPage = () => {
        if (flipBook.current) {
            flipBook.current.pageFlip().flipPrev();
        }
    };
    const goToNextPage = () => {
        if (flipBook.current) {
            flipBook.current.pageFlip().flipNext();
        }
    };

    // Usar las dimensiones reales del workspace para calcular la proporción exacta
    const workspaceAspectRatio = workspaceDimensions.width / workspaceDimensions.height;

    // Tamaño base para la preview usando la proporción real del workspace
    const previewBaseWidht = 600;
    const previewHeight = previewBaseWidht;
    const previewWidth = Math.round(previewHeight * workspaceAspectRatio);

    // Función para organizar páginas como libro real con frente y reverso
    const createBookPages = () => {
        const bookPages = [];

        // Todas las páginas en orden secuencial
        const allPages = [
            ...pages.filter(page => page.type === 'cover'),
            ...pages.filter(page => page.type === 'content'),
            ...pages.filter(page => page.type === 'final')
        ];

        // Para HTMLFlipBook, necesitamos duplicar las páginas para simular frente y reverso
        // La primera página (portada) solo tiene frente
        if (allPages.length > 0) {
            bookPages.push(allPages[0]); // Portada (frente)
            bookPages.push({ ...allPages[0], isBack: true }); // Portada (reverso - blanco o info)
        }

        // Páginas de contenido - cada página es frente y reverso de una hoja
        for (let i = 1; i < allPages.length - 1; i++) {
            bookPages.push(allPages[i]); // Frente de la hoja
            if (i + 1 < allPages.length - 1) {
                bookPages.push(allPages[i + 1]); // Reverso de la hoja (siguiente página)
                i++; // Saltamos la siguiente porque ya la incluimos como reverso
            } else {
                // Si es la última página de contenido, el reverso puede estar en blanco
                bookPages.push({ ...allPages[i], isBack: true, isEmpty: true });
            }
        }

        // Contraportada (si existe)
        const finalPage = allPages.find(page => page.type === 'final');
        if (finalPage) {
            bookPages.push({ ...finalPage, isBack: true, isEmpty: true }); // Reverso blanco
            bookPages.push(finalPage); // Contraportada
        }

        return bookPages;
    };

    const bookPages = createBookPages();

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            contentLabel="Vista previa del álbum"
            ariaHideApp={true}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            {/* Inyectar estilos CSS para eliminar márgenes */}
            <style dangerouslySetInnerHTML={{ __html: flipbookStyles }} />

            {/* Overlay de carga */}
            {(isGeneratingThumbnails || isGeneratingPDF) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                        <p className="text-gray-700">
                            {isGeneratingPDF 
                                ? 'Generando PDF de alta calidad...' 
                                : 'Generando vistas previas de alta calidad...'
                            }
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Esto puede tomar unos segundos
                        </p>
                    </div>
                </div>
            )}

            <div className="relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-2xl">
               {/* Título del modal (oculto visualmente pero accesible) */}
                <h2 id="modal-title" className="sr-only">Vista previa del álbum</h2>
                <p id="modal-description" className="sr-only">
                    Navegue por las páginas de su álbum usando los controles de navegación o teclado.
                    Puede cerrar esta ventana presionando Escape o el botón de cerrar.
                </p>

                {/* Botón de cerrar */}
                <button
                    onClick={onRequestClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow z-10"
                    aria-label="Cerrar vista previa del álbum"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Controles de navegación */}
                <div className="flex items-center justify-center gap-8 mb-6 mt-2">
                    <button
                        onClick={goToPrevPage}
                        className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 shadow transition-colors"
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <span className="flex items-center text-gray-700 text-base font-medium px-4 py-2 bg-gray-50 rounded-lg" aria-live="polite">
                        {(() => {
                            const currentPageData = bookPages[currentPage];
                            if (!currentPageData) return 'Cargando...';

                            // Manejo especial para reversos y páginas en blanco
                            if (currentPageData.isBack && currentPageData.isEmpty) {
                                return 'Reverso';
                            }
                            if (currentPageData.isBack) {
                                return 'Reverso de la página';
                            }

                            if (currentPageData.type === 'cover') return 'Portada';
                            if (currentPageData.type === 'final') return 'Contraportada';
                            return `Página ${currentPageData.pageNumber || Math.ceil((currentPage + 1) / 2)}`;
                        })()}
                        <span className="mx-2 text-gray-400">•</span>
                        {Math.ceil((currentPage + 1) / 2)} / {Math.ceil(bookPages.length / 2)} hojas
                    </span>

                    <button
                        onClick={goToNextPage}
                        className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 shadow transition-colors"
                        aria-label="Página siguiente"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>

                {/* Flipbook visual: thumbnails con efecto page flip como libro real */}
                <div className="flex items-center justify-center">
                    <HTMLFlipBook
                        ref={flipBook}
                        width={previewWidth}
                        height={previewHeight}
                          size="stretch"
                        minWidth={previewWidth * 0.7}
                        maxWidth={previewWidth * 1.3}
                        minHeight={previewHeight * 0.7}
                        maxHeight={previewHeight * 1.3}
                        maxShadowOpacity={0.3}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={(e) => setCurrentPage(e.data)}
                        className="shadow-xl"
                        usePortrait={false}
                        startPage={0}
                        drawShadow={true}
                        flippingTime={600}
                        useMouseEvents={true}
                        swipeDistance={50}
                        showPageCorners={true}
                        disableFlipByClick={false}
                        style={{
                            margin: 0,
                            padding: 0
                        }}
                    >
                        {bookPages.map((page, pageIdx) => (
                            <div
                                key={`page-${pageIdx}`}
                                id={`page-${page.id}`}
                                className="page-container"
                                style={{
                                    width: previewWidth,
                                    height: previewHeight,
                                    margin: 0,
                                    padding: 0,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#ffffff'
                                }}
                            >
                                {/* Página individual con manejo de reversos */}
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {page.isEmpty || page.isBack ? (
                                        // Página en blanco (reverso)
                                        <div
                                            className="flex items-center justify-center text-gray-300 text-xs"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #f0f0f0'
                                            }}
                                        >
                                            {page.isBack ? 'Reverso' : ''}
                                        </div>
                                    ) : activeThumbnails[page.id] ? (
                                        // Página con contenido usando thumbnails disponibles
                                        <img
                                            src={activeThumbnails[page.id]}
                                            alt={`${page.type === 'cover' ? 'Portada' : page.type === 'final' ? 'Contraportada' : `Página ${page.pageNumber || pageIdx + 1}`}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                margin: 0,
                                                padding: 0,
                                                border: 'none',
                                                imageRendering: 'auto',
                                                backgroundColor: '#ffffff',
                                                WebkitBackfaceVisibility: 'hidden',
                                                backfaceVisibility: 'hidden',
                                                WebkitTransform: 'translateZ(0)',
                                                transform: 'translateZ(0)'
                                            }}
                                        />
                                    ) : (
                                        // Placeholder inline si no hay thumbnail
                                        <InlinePlaceholder page={page} pageIdx={pageIdx} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </HTMLFlipBook>
                </div>
            </div>
 {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-2xl mx-auto">
                {/* Botón Descargar PDF */}
                <button
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold shadow transition flex items-center justify-center ${
                        isGeneratingPDF
                            ? 'bg-blue-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    onClick={generatePDF}
                    disabled={isGeneratingPDF || isProcessing}
                >
                    {isGeneratingPDF ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generando PDF...
                        </>
                    ) : (
                        <>
                            <Download className="h-5 w-5 mr-2" />
                            Descargar PDF
                        </>
                    )}
                </button>

                {/* Botón Comprar ahora */}
                <button
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold shadow transition flex items-center justify-center ${isProcessing
                            ? 'bg-purple-400 text-white cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                    onClick={async () => {
                        if (isProcessing) return;

                        setIsProcessing(true);
                        console.log('🚀 === INICIO PROCESO COMPRA (SIN PDF FRONTEND) ===');

                        try {
                            console.log('🔍 Verificando función addAlbumToCart...');
                            console.log('addAlbumToCart type:', typeof addAlbumToCart);
                            console.log('addAlbumToCart value:', addAlbumToCart);

                            // Verificar que la función addAlbumToCart esté disponible
                            if (typeof addAlbumToCart !== 'function') {
                                console.error('❌ addAlbumToCart no es una función');
                                alert('Error: Función de carrito no disponible. Inténtelo nuevamente.');
                                setIsProcessing(false);
                                return;
                            }

                            // Paso 1: Agregar al carrito (esto guarda en BD y marca proyecto como listo para PDF backend)
                            console.log('🛒 Agregando álbum al carrito y preparando para PDF backend...');
                            let addedToCart;
                            try {
                                // Verificar si addAlbumToCart devuelve una promesa
                                const cartResult = addAlbumToCart();
                                if (cartResult && typeof cartResult.then === 'function') {
                                    // Es una promesa, esperarla
                                    addedToCart = await cartResult;
                                } else {
                                    // No es una promesa, usar el resultado directamente
                                    addedToCart = cartResult;
                                }
                                console.log('✅ Resultado de addAlbumToCart:', addedToCart);
                            } catch (cartError) {
                                console.error('❌ Error en addAlbumToCart:', cartError);
                                alert('Error al agregar al carrito: ' + cartError.message);
                                setIsProcessing(false);
                                return;
                            }

                            if (!addedToCart) {
                                console.error('❌ No se pudo agregar al carrito');
                                alert('Error al agregar el álbum al carrito. Revise la consola para más detalles.');
                                setIsProcessing(false);
                                return;
                            }

                            console.log('✅ Álbum agregado al carrito exitosamente');
                            console.log('📄 El PDF se generará automáticamente en el backend con dimensiones exactas de BD');

                            // Opcional: Verificar que el proyecto tiene datos para PDF
                            try {
                                const cartKey = `${window.Global?.APP_CORRELATIVE || 'bananalab'}_cart`;
                                const currentCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
                                const latestItem = currentCart.find(item => 
                                    item.type === 'custom_album' && 
                                    item.project_id && 
                                    item.pdf_data
                                );
                                
                                if (latestItem) {
                                    console.log('📄 Datos para PDF backend confirmados:', {
                                        project_id: latestItem.project_id,
                                        has_pdf_data: !!latestItem.pdf_data,
                                        dimensions: latestItem.pdf_data?.dimensions
                                    });
                                } else {
                                    console.warn('⚠️ No se encontraron datos de PDF en el carrito');
                                }
                            } catch (verificationError) {
                                console.warn('⚠️ Error verificando datos de PDF:', verificationError);
                            }

                            // Paso 2: Redirigir al carrito (SIEMPRE ejecutar)
                            console.log('🔄 Iniciando redirección al carrito...');
                            try {
                                // Esperar un poco para asegurar que el localStorage se actualice
                                console.log('⏱️ Esperando 1 segundo para asegurar persistencia...');
                                await new Promise(resolve => setTimeout(resolve, 1000));

                                // Verificar múltiples veces que el álbum esté en el carrito
                                let verifyCart = [];
                                for (let attempts = 0; attempts < 3; attempts++) {
                                    verifyCart = JSON.parse(localStorage.getItem(`${window.Global?.APP_CORRELATIVE || 'bananalab'}_cart`) || '[]');
                                    console.log(`🔍 Verificación ${attempts + 1}/3 del carrito:`, verifyCart.length, 'items');
                                    
                                    if (verifyCart.length > 0) {
                                        break; // Carrito tiene items, proceder
                                    }
                                    
                                    // Esperar un poco más en cada intento
                                    if (attempts < 2) {
                                        console.log('⏱️ Esperando 500ms más...');
                                        await new Promise(resolve => setTimeout(resolve, 500));
                                    }
                                }

                                // Forzar un último save del localStorage si es necesario
                                if (verifyCart.length === 0) {
                                    console.warn('⚠️ Carrito sigue vacío, intentando forzar adición...');
                                    
                                    // Intentar agregar al carrito una vez más como fallback
                                    try {
                                        const cartResult = addAlbumToCart();
                                        if (cartResult && typeof cartResult.then === 'function') {
                                            await cartResult;
                                        }
                                        await new Promise(resolve => setTimeout(resolve, 500));
                                        verifyCart = JSON.parse(localStorage.getItem(`${window.Global?.APP_CORRELATIVE || 'bananalab'}_cart`) || '[]');
                                        console.log('🔍 Verificación después de adición forzada:', verifyCart.length, 'items');
                                    } catch (forceError) {
                                        console.error('❌ Error en adición forzada:', forceError);
                                    }
                                }

                                // Redirigir al carrito independientemente del estado
                                const cartUrl = `${Global.APP_URL}/cart`;
                                console.log('🔄 Redirigiendo a:', cartUrl);
                                console.log('🔄 Estado final del carrito:', verifyCart.length, 'items');

                                // Forzar la redirección usando múltiples métodos como respaldo
                                try {
                                    window.location.href = cartUrl;
                                } catch (locationError) {
                                    console.error('❌ Error con window.location.href:', locationError);
                                    try {
                                        window.location.replace(cartUrl);
                                    } catch (replaceError) {
                                        console.error('❌ Error con window.location.replace:', replaceError);
                                        window.open(cartUrl, '_self');
                                    }
                                }

                            } catch (redirectError) {
                                console.error('❌ Error durante redirección:', redirectError);
                                
                                // Redirección de emergencia ultra-simple
                                const cartUrl = `${Global.APP_URL}/cart`;
                                console.log('🔄 Redirección de emergencia a:', cartUrl);
                                
                                // Múltiples métodos de respaldo
                                setTimeout(() => {
                                    try {
                                        window.location.href = cartUrl;
                                    } catch (e) {
                                        window.location = cartUrl;
                                    }
                                }, 100);
                            }

                        } catch (error) {
                            console.error('❌ === ERROR GENERAL ===');
                            console.error('Tipo:', error.name);
                            console.error('Mensaje:', error.message);
                            console.error('Stack:', error.stack);

                            // Intentar redirigir de todas formas si hay items en el carrito
                            try {
                                const verifyCart = JSON.parse(localStorage.getItem(`${window.Global?.APP_CORRELATIVE || 'bananalab'}_cart`) || '[]');
                                if (verifyCart.length > 0) {
                                    console.log('✅ Hay items en carrito, redirigiendo...');
                                    window.location.href = `${Global.APP_URL}/cart`;
                                    return;
                                }
                            } catch (recoveryError) {
                                console.error('❌ Error en recuperación:', recoveryError);
                            }

                            alert(`Error: ${error.message}. Si el álbum se agregó, puede ir manualmente al carrito.`);
                        } finally {
                            // IMPORTANTE: Siempre desbloquear el botón con timeout adicional
                            console.log('🔄 Desbloqueando botón...');
                            setIsProcessing(false);
                            
                            // Timeout adicional como respaldo para asegurar que el botón se desbloquee
                            setTimeout(() => {
                                console.log('🔄 Timeout: Desbloqueando botón (respaldo)...');
                                setIsProcessing(false);
                            }, 2000);
                        }
                    }}
                    disabled={isProcessing || isGeneratingPDF}
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                        </>
                    ) : (
                        'Comprar ahora'
                    )}
                </button>
                <button
                    className="flex-1 py-3 px-4 rounded-lg bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 transition"
                    onClick={onRequestClose}
                    disabled={isProcessing || isGeneratingPDF}
                >
                    Continuar editando
                </button>
            </div>        </Modal>
    );
};

// Componente para placeholder inline simple
const InlinePlaceholder = ({ page, pageIdx }) => {
    let pageTitle = '';
    let pageIcon = '';

    switch (page.type) {
        case 'cover':
            pageTitle = 'Portada';
            pageIcon = '📚';
            break;
        case 'final':
            pageTitle = 'Contraportada';
            pageIcon = '📖';
            break;
        case 'content':
            pageTitle = `Página ${page.pageNumber || pageIdx + 1}`;
            pageIcon = '📄';
            break;
        default:
            pageTitle = `Página ${pageIdx + 1}`;
            pageIcon = '📄';
    }

    return (
        <div
            className="flex flex-col items-center justify-center w-full h-full bg-gray-50 border-2 border-gray-200 rounded-lg"
            style={{ minHeight: '400px' }}
        >
            <div className="text-6xl mb-4">{pageIcon}</div>
            <div className="text-lg font-semibold text-gray-700 mb-2">{pageTitle}</div>
            <div className="text-sm text-gray-500">Vista previa</div>
            {page.layout && (
                <div className="text-xs text-gray-400 mt-2">
                    Layout: {page.layout.name || 'Personalizado'}
                </div>
            )}
        </div>
    );
};

// --- INICIO: Función exportable para thumbnails fieles ---
async function generateHighQualityThumbnails({ pages, workspaceDimensions, presetData }) {
    const newThumbnails = {};
    const scale = 2; // Reducir la escala para mejor rendimiento
    
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
    for (const page of pages) {
        try {
            const customCanvas = document.createElement('canvas');
            const customCtx = customCanvas.getContext('2d', { willReadFrequently: true });
            
            // Calcular dimensiones del canvas basadas en el workspace
            // Usar escala 1:1 para evitar problemas de redondeo
            customCanvas.width = workspaceDimensions.width;
            customCanvas.height = workspaceDimensions.height;
            
            // No aplicar escala aquí, manejaremos el escalado después
            customCtx.scale(1, 1);
            customCtx.imageSmoothingEnabled = true;
            customCtx.imageSmoothingQuality = 'high';
            customCtx.textRendering = 'geometricPrecision';
            customCtx.webkitImageSmoothingEnabled = true;
            customCtx.mozImageSmoothingEnabled = true;
            customCtx.msImageSmoothingEnabled = true;
            
            // --- Renderizar background layer igual que en el workspace ---
            let bgUrl = null;
            if (page.type === 'cover' && presetData?.cover_image) {
                bgUrl = presetData.cover_image.startsWith('http')
                    ? presetData.cover_image
                    : `/storage/images/item_preset/${presetData.cover_image}`;
            } else if (page.type === 'content' && presetData?.content_layer_image) {
                bgUrl = presetData.content_layer_image.startsWith('http')
                    ? presetData.content_layer_image
                    : `/storage/images/item_preset/${presetData.content_layer_image}`;
            } else if (page.type === 'final' && presetData?.final_layer_image) {
                bgUrl = presetData.final_layer_image.startsWith('http')
                    ? presetData.final_layer_image
                    : `/storage/images/item_preset/${presetData.final_layer_image}`;
            }
            
            // Si no hay fondo, usar blanco
            if (!bgUrl) {
                customCtx.fillStyle = '#ffffff';
                customCtx.fillRect(0, 0, workspaceDimensions.width, workspaceDimensions.height);
            }
            if (bgUrl) {
                const bgImg = new window.Image();
                bgImg.crossOrigin = 'anonymous';
                bgImg.src = bgUrl;
                await new Promise((resolve, reject) => {
                    if (bgImg.complete) return resolve();
                    bgImg.onload = resolve;
                    bgImg.onerror = reject;
                });
                drawImageCover(customCtx, bgImg, 0, 0, workspaceDimensions.width, workspaceDimensions.height);
            } else {
                // Si no hay background, fondo blanco
                customCtx.fillStyle = '#ffffff';
                customCtx.fillRect(0, 0, workspaceDimensions.width, workspaceDimensions.height);
            }
            // --- Fin background layer ---
            if (page.cells && Array.isArray(page.cells)) {
                // Ordenar celdas por posición (Y, luego X) para renderizado consistente
                const sortedCells = [...page.cells].sort((a, b) => {
                    const aY = a.position?.y || 0;
                    const bY = b.position?.y || 0;
                    if (aY !== bY) return aY - bY;
                    return (a.position?.x || 0) - (b.position?.x || 0);
                });

                for (const cell of sortedCells) {
                    if (!cell || !cell.elements) continue;
                    
                    // Calcular dimensiones de la celda
                    const cellWidth = cell.size?.width || workspaceDimensions.width;
                    const cellHeight = cell.size?.height || workspaceDimensions.height;
                    const cellX = cell.position?.x || 0;
                    const cellY = cell.position?.y || 0;

                    if (!cell.size) {
                        console.warn('⚠️ cell.size no definido, usando tamaño workspace', cell);
                    }

                    // Ordenar elementos por zIndex
                    const sortedElements = [...(cell.elements || [])].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

                    for (const element of sortedElements) {
                        // Filtro robusto: ignorar imágenes base del layout (background duplicado)
                        if (
                            element.type === 'image' && (
                                element.id === 'cover-base' ||
                                element.id === 'final-base' ||
                                (typeof element.id === 'string' && element.id.startsWith('content-base-'))
                            )
                        ) {
                            continue;
                        }

                        // Solo renderizar elementos de tipo 'image' y 'text'
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

                                // Calcular posición y tamaño relativos a la celda
                                // Las posiciones y tamaños pueden venir en píxeles o como fracción (0-1)
                                const isRelativeX = element.position?.x !== undefined && Math.abs(element.position.x) <= 1;
                                const isRelativeY = element.position?.y !== undefined && Math.abs(element.position.y) <= 1;
                                const isRelativeWidth = element.size?.width !== undefined && element.size.width <= 1;
                                const isRelativeHeight = element.size?.height !== undefined && element.size.height <= 1;

                                // Calcular posición absoluta en píxeles
                                const elX = isRelativeX ? element.position.x * cellWidth : (element.position?.x || 0);
                                const elY = isRelativeY ? element.position.y * cellHeight : (element.position?.y || 0);
                                
                                // Calcular dimensiones en píxeles
                                const elW = isRelativeWidth ? element.size.width * cellWidth : (element.size?.width || cellWidth);
                                const elH = isRelativeHeight ? element.size.height * cellHeight : (element.size?.height || cellHeight);

                                // Posición absoluta en la página (ajustada por la posición de la celda)
                                const dx = cellX + elX;
                                const dy = cellY + elY;

                                console.log('📐 Renderizando elemento:', {
                                    elementId: element.id,
                                    cellId: cell.id,
                                    cellPosition: { x: cellX, y: cellY, width: cellWidth, height: cellHeight },
                                    elementPosition: { x: elX, y: elY, width: elW, height: elH },
                                    finalPosition: { dx, dy },
                                    isRelative: { x: isRelativeX, y: isRelativeY, w: isRelativeWidth, h: isRelativeHeight },
                                    elementData: element
                                });

                                // Dibujar la imagen con las coordenadas y dimensiones calculadas
                                drawImageCover(customCtx, img, dx, dy, elW, elH);
                                
                            } catch (error) {
                                console.error('Error al cargar imagen:', error, element);
                            }
                        }
                    }
                }
            }
            // Crear el thumbnail con tamaño fijo manteniendo relación de aspecto
            const thumbnailCanvas = document.createElement('canvas');
            const thumbnailCtx = thumbnailCanvas.getContext('2d');
            
            // Tamaño máximo del thumbnail
            const maxThumbnailSize = 900;
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
        } catch (error) {
            console.error(`❌ Error generando thumbnail para página ${page.id}:`, error);
            newThumbnails[page.id] = null;
        }
    }
    return newThumbnails;
}
// --- FIN: Función exportable para thumbnails fieles ---

export { generateHighQualityThumbnails };
export default BookPreviewModal;