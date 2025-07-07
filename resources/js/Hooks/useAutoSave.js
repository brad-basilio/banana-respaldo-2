import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook personalizado para auto-guardado automático de proyectos
 * @param {Array} pages - Páginas del proyecto
 * @param {Object} projectData - Datos del proyecto
 * @param {Object} itemData - Datos del item
 * @param {Object} presetData - Datos del preset
 * @param {Object} workspaceDimensions - Dimensiones del workspace
 * @param {Array} pageThumbnails - Miniaturas de las páginas
 * @returns {Function} - Función para guardar manualmente
 */
export const useAutoSave = (pages, projectData, itemData, presetData, workspaceDimensions, pageThumbnails) => {
    const intervalRef = useRef(null);
    const lastSaveRef = useRef(Date.now());
    const saveIntervalMs = 30000; // 30 segundos

    // Función para guardar el proyecto
    const saveProject = useCallback(async () => {
        if (!projectData?.id || !pages || pages.length === 0) {
            console.log('⏸️ Auto-save: No hay datos suficientes para guardar');
            return false;
        }

        try {
            console.log('💾 Auto-save: Guardando proyecto...');
            
            const saveData = {
                pages: pages,
                project_data: projectData,
                item_data: itemData,
                preset_data: presetData,
                workspace_dimensions: workspaceDimensions,
                page_thumbnails: pageThumbnails || [],
                last_saved: new Date().toISOString()
            };

            const response = await fetch(`/api/canvas-projects/${projectData.id}/auto-save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(saveData)
            });

            if (response.ok) {
                lastSaveRef.current = Date.now();
                console.log('✅ Auto-save: Proyecto guardado correctamente');
                return true;
            } else {
                console.error('❌ Auto-save: Error al guardar proyecto:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ Auto-save: Error de red:', error);
            return false;
        }
    }, [pages, projectData, itemData, presetData, workspaceDimensions, pageThumbnails]);

    // Función para guardar manualmente
    const manualSave = useCallback(() => {
        console.log('🔄 Save manual iniciado...');
        return saveProject();
    }, [saveProject]);

    // Efecto para configurar el auto-guardado
    useEffect(() => {
        // Limpiar intervalo anterior si existe
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Solo configurar auto-guardado si hay datos del proyecto
        if (projectData?.id && pages && pages.length > 0) {
            console.log('⚡ Auto-save: Configurando auto-guardado cada 30 segundos');
            
            intervalRef.current = setInterval(() => {
                saveProject();
            }, saveIntervalMs);
        }

        // Cleanup al desmontar
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [saveProject, projectData?.id, pages?.length]);

    // Cleanup al desmontar el componente
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return manualSave;
};

export default useAutoSave;
