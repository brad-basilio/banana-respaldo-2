// 🚀 NUEVO SISTEMA OPTIMIZADO - Solo procesa thumbnail de página actual
// Usar esto en lugar del anterior que procesaba TODOS los thumbnails

/**
 * Función optimizada para guardar thumbnail de una sola página
 * Llamar solo cuando cambie la página actual
 */
async function saveCurrentPageThumbnail(projectId, pageId, thumbnailBase64) {
    try {
        console.log(`🔄 Guardando thumbnail solo para página ${pageId}`);
        
        const response = await fetch(`/api/thumbnails/${projectId}/page/${pageId}/single`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({
                thumbnail: thumbnailBase64
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log(`✅ Thumbnail WebP generado para página ${pageId}:`, result.files_generated);
            return result.thumbnail_url;
        } else {
            console.error(`❌ Error guardando thumbnail página ${pageId}:`, result.error);
            return null;
        }

    } catch (error) {
        console.error(`❌ Error de red guardando thumbnail:`, error);
        return null;
    }
}

/**
 * Función para verificar estado de thumbnails de una página
 */
async function checkPageThumbnailStatus(projectId, pageId) {
    try {
        const response = await fetch(`/api/thumbnails/${projectId}/page/${pageId}/status`);
        const status = await response.json();
        
        console.log(`📊 Estado página ${pageId}:`, {
            webp: status.files.pdf_webp.exists ? '✅' : '❌',
            thumbnail: status.files.thumbnail.exists ? '✅' : '❌',
            quality: status.quality_level
        });
        
        return status;
    } catch (error) {
        console.error('Error verificando estado:', error);
        return null;
    }
}

/**
 * EJEMPLO DE USO - En tu componente Editor
 * Reemplaza la función actual que guarda todos los thumbnails
 */

// ❌ ANTES (malo - procesa todos):
// const thumbnails = getAllPageThumbnails(); // Genera todos
// await fetch('/api/canvas/save', { thumbnails }); // Procesa todos

// ✅ AHORA (bueno - procesa solo actual):
const currentPageThumbnail = generateCurrentPageThumbnail();
await saveCurrentPageThumbnail(projectId, currentPageId, currentPageThumbnail);

/**
 * Integración con el Editor
 * Llamar en estos momentos específicos:
 */

// 1. Cuando cambia de página
function onPageChange(newPageId) {
    const thumbnail = generateThumbnailForPage(newPageId);
    saveCurrentPageThumbnail(projectId, newPageId, thumbnail);
}

// 2. Cuando hace auto-save (solo página actual)
function onAutoSave() {
    if (hasChangesOnCurrentPage) {
        const thumbnail = generateThumbnailForPage(currentPageId);
        saveCurrentPageThumbnail(projectId, currentPageId, thumbnail);
    }
}

// 3. Al salir de una página
function onPageExit(exitingPageId) {
    const thumbnail = generateThumbnailForPage(exitingPageId);
    saveCurrentPageThumbnail(projectId, exitingPageId, thumbnail);
}

/**
 * VENTAJAS DEL NUEVO SISTEMA:
 * ✅ Solo procesa 1 thumbnail vs todos
 * ✅ Respuesta inmediata (no espera a procesar 25 páginas)
 * ✅ Menor uso de CPU y memoria
 * ✅ Genera WebP de alta calidad automáticamente
 * ✅ No bloquea la interfaz
 * ✅ Escalable (funciona igual con 5 o 100 páginas)
 */

export { saveCurrentPageThumbnail, checkPageThumbnailStatus };
