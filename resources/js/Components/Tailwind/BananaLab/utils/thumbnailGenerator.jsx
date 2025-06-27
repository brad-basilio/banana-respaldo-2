/**
 * 📸 GENERADOR DE THUMBNAILS CON SCREENSHOT REAL
 * Usa html2canvas para capturar el workspace exacto como aparece en pantalla
 */

import html2canvas from 'html2canvas';

/**
 * 🎯 FUNCIÓN PRINCIPAL - Screenshot real del workspace usando html2canvas
 */
export async function generateAccurateThumbnails(pages, workspaceDimensions = { width: 1200, height: 800 }) {
    const thumbnails = {};
    
    console.log(`📸 [REAL SCREENSHOT] Generando ${pages.length} thumbnails con html2canvas...`);
    
    try {
        // Buscar el contenedor del workspace en el DOM
        const workspaceContainer = document.querySelector('.workspace-container') || 
                                 document.querySelector('[data-workspace]') ||
                                 document.querySelector('.grid-container') ||
                                 document.querySelector('.editor-workspace');
        
        if (!workspaceContainer) {
            console.warn('⚠️ No se encontró contenedor del workspace, usando screenshot de documento completo');
        }
        
        const targetElement = workspaceContainer || document.body;
        
        // Configuración optimizada para html2canvas
        const html2canvasOptions = {
            allowTaint: true,
            useCORS: true,
            scale: 1, // Escala 1:1 para máxima calidad
            backgroundColor: null, // Preservar transparencias
            removeContainer: true,
            imageTimeout: 15000,
            logging: false, // Desactivar logs de html2canvas
            width: workspaceDimensions.width,
            height: workspaceDimensions.height,
            scrollX: 0,
            scrollY: 0,
            windowWidth: workspaceDimensions.width,
            windowHeight: workspaceDimensions.height,
            // Configuraciones adicionales para mejor calidad
            foreignObjectRendering: true,
            ignoreElements: (element) => {
                // Ignorar elementos que no queremos en el screenshot
                return element.classList.contains('ui-overlay') ||
                       element.classList.contains('toolbar') ||
                       element.classList.contains('sidebar') ||
                       element.classList.contains('modal') ||
                       element.classList.contains('tooltip');
            }
        };
        
        // Para cada página, generar screenshot
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            
            try {
                console.log(`📸 [REAL SCREENSHOT] Procesando página ${i + 1}/${pages.length}: ${page.id}`);
                
                // Si tenemos un mecanismo para cambiar la página visible, usarlo
                // Esto depende de cómo funciona tu editor
                if (typeof window.setCurrentPageForScreenshot === 'function') {
                    await window.setCurrentPageForScreenshot(i);
                    await new Promise(resolve => setTimeout(resolve, 100)); // Esperar renderizado
                }
                
                // Capturar screenshot del workspace actual
                const canvas = await html2canvas(targetElement, html2canvasOptions);
                
                // Crear thumbnail escalado manteniendo proporción
                const thumbnailCanvas = document.createElement('canvas');
                const thumbnailCtx = thumbnailCanvas.getContext('2d');
                
                // Tamaño del thumbnail (ajustable)
                const maxThumbnailSize = 300;
                const aspectRatio = canvas.width / canvas.height;
                
                let thumbnailWidth, thumbnailHeight;
                
                if (aspectRatio >= 1) {
                    // Landscape o cuadrado
                    thumbnailWidth = maxThumbnailSize;
                    thumbnailHeight = maxThumbnailSize / aspectRatio;
                } else {
                    // Portrait
                    thumbnailWidth = maxThumbnailSize * aspectRatio;
                    thumbnailHeight = maxThumbnailSize;
                }
                
                thumbnailCanvas.width = Math.round(thumbnailWidth);
                thumbnailCanvas.height = Math.round(thumbnailHeight);
                
                // Configurar calidad de escalado
                thumbnailCtx.imageSmoothingEnabled = true;
                thumbnailCtx.imageSmoothingQuality = 'high';
                
                // Escalar el canvas original al thumbnail
                thumbnailCtx.drawImage(
                    canvas,
                    0, 0, canvas.width, canvas.height,
                    0, 0, thumbnailCanvas.width, thumbnailCanvas.height
                );
                
                // Convertir a DataURL con alta calidad
                const thumbnailDataURL = thumbnailCanvas.toDataURL('image/png', 0.9);
                
                // Guardar thumbnail
                thumbnails[page.id] = thumbnailDataURL;
                
                console.log(`✅ [REAL SCREENSHOT] Thumbnail generado para ${page.id}: ${thumbnailCanvas.width}x${thumbnailCanvas.height}`);
                
                // Pequeña pausa entre capturas para evitar sobrecarga
                await new Promise(resolve => setTimeout(resolve, 50));
                
            } catch (pageError) {
                console.error(`❌ [REAL SCREENSHOT] Error en página ${page.id}:`, pageError);
                
                // Crear thumbnail de error
                const errorCanvas = document.createElement('canvas');
                errorCanvas.width = 300;
                errorCanvas.height = 200;
                const errorCtx = errorCanvas.getContext('2d');
                
                errorCtx.fillStyle = '#f3f4f6';
                errorCtx.fillRect(0, 0, 300, 200);
                errorCtx.fillStyle = '#6b7280';
                errorCtx.font = '16px Arial';
                errorCtx.textAlign = 'center';
                errorCtx.fillText('Error capturando', 150, 90);
                errorCtx.fillText('screenshot', 150, 110);
                
                thumbnails[page.id] = errorCanvas.toDataURL('image/png');
            }
        }
        
        console.log(`🎉 [REAL SCREENSHOT] ¡${Object.keys(thumbnails).length} thumbnails generados con screenshot real!`);
        
        return thumbnails;
        
    } catch (error) {
        console.error('❌ [REAL SCREENSHOT] Error general:', error);
        
        // Fallback: generar thumbnails de error para todas las páginas
        const fallbackThumbnails = {};
        
        pages.forEach(page => {
            const errorCanvas = document.createElement('canvas');
            errorCanvas.width = 300;
            errorCanvas.height = 200;
            const errorCtx = errorCanvas.getContext('2d');
            
            errorCtx.fillStyle = '#f3f4f6';
            errorCtx.fillRect(0, 0, 300, 200);
            errorCtx.fillStyle = '#6b7280';
            errorCtx.font = '16px Arial';
            errorCtx.textAlign = 'center';
            errorCtx.fillText('Error generando', 150, 85);
            errorCtx.fillText('thumbnail', 150, 105);
            errorCtx.fillText(page.type || 'página', 150, 125);
            
            fallbackThumbnails[page.id] = errorCanvas.toDataURL('image/png');
        });
        
        return fallbackThumbnails;
    }
}

/**
 * 🔄 VERSIÓN AVANZADA - Screenshot con renderizado de página específica
 */
export async function generateThumbnailForSpecificPage(pageIndex, pages, changePageCallback) {
    console.log(`📸 [SPECIFIC SCREENSHOT] Generando thumbnail para página ${pageIndex}`);
    
    try {
        // Cambiar a la página específica
        if (typeof changePageCallback === 'function') {
            await changePageCallback(pageIndex);
            // Esperar a que se complete el cambio de página
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Buscar contenedor del workspace
        const workspaceContainer = document.querySelector('.workspace-container') || 
                                 document.querySelector('[data-workspace]') ||
                                 document.querySelector('.grid-container') ||
                                 document.querySelector('.editor-workspace') ||
                                 document.body;
        
        // Configuración para screenshot
        const options = {
            allowTaint: true,
            useCORS: true,
            scale: 0.8, // Escala menor para mejor rendimiento
            backgroundColor: null,
            removeContainer: true,
            logging: false,
            ignoreElements: (element) => {
                return element.classList.contains('ui-overlay') ||
                       element.classList.contains('toolbar') ||
                       element.classList.contains('sidebar') ||
                       element.classList.contains('modal');
            }
        };
        
        // Capturar screenshot
        const canvas = await html2canvas(workspaceContainer, options);
        
        // Crear thumbnail
        const thumbnailCanvas = document.createElement('canvas');
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        
        const maxSize = 250;
        const aspectRatio = canvas.width / canvas.height;
        
        thumbnailCanvas.width = aspectRatio >= 1 ? maxSize : maxSize * aspectRatio;
        thumbnailCanvas.height = aspectRatio >= 1 ? maxSize / aspectRatio : maxSize;
        
        thumbnailCtx.imageSmoothingEnabled = true;
        thumbnailCtx.imageSmoothingQuality = 'high';
        
        thumbnailCtx.drawImage(
            canvas,
            0, 0, canvas.width, canvas.height,
            0, 0, thumbnailCanvas.width, thumbnailCanvas.height
        );
        
        const dataURL = thumbnailCanvas.toDataURL('image/png', 0.85);
        
        console.log(`✅ [SPECIFIC SCREENSHOT] Thumbnail generado: ${thumbnailCanvas.width}x${thumbnailCanvas.height}`);
        
        return dataURL;
        
    } catch (error) {
        console.error('❌ [SPECIFIC SCREENSHOT] Error:', error);
        return null;
    }
}

/**
 * 🎨 VERSIÓN OPTIMIZADA - Para generar thumbnails al cambiar de página
 */
export async function generateThumbnailOnPageChange(currentPageIndex, pages, workspaceRef) {
    try {
        // Si tenemos referencia al workspace, usarla
        const targetElement = workspaceRef?.current || 
                             document.querySelector('.workspace-container') || 
                             document.querySelector('[data-workspace]');
        
        if (!targetElement) {
            console.warn('⚠️ No se encontró referencia al workspace');
            return null;
        }
        
        // Screenshot rápido con configuración optimizada
        const canvas = await html2canvas(targetElement, {
            allowTaint: true,
            useCORS: true,
            scale: 0.6, // Escala reducida para velocidad
            backgroundColor: null,
            logging: false,
            width: targetElement.offsetWidth,
            height: targetElement.offsetHeight
        });
        
        // Thumbnail pequeño para lista de páginas
        const thumbnailCanvas = document.createElement('canvas');
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        
        thumbnailCanvas.width = 120;
        thumbnailCanvas.height = 80;
        
        thumbnailCtx.drawImage(
            canvas,
            0, 0, canvas.width, canvas.height,
            0, 0, 120, 80
        );
        
        return thumbnailCanvas.toDataURL('image/jpeg', 0.7);
        
    } catch (error) {
        console.error('❌ Error generando thumbnail rápido:', error);
        return null;
    }
}

export default generateAccurateThumbnails;
