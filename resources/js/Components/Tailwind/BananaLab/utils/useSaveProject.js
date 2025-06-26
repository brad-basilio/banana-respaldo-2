import { useState, useEffect } from 'react';
import { saveProjectData } from './saveSystem';
import { toast } from 'sonner';

/**
 * Hook personalizado para manejar el guardado de proyectos
 */
export const useSaveProject = (pages, projectData, itemData, presetData, workspaceDimensions, pageThumbnails) => {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [saveError, setSaveError] = useState(null);

    // Función principal de guardado
    const saveProject = async (isAutoSave = false) => {
        if (isSaving) {
            console.log('⏳ [SAVE] Ya hay un guardado en progreso...');
            return false;
        }
        
        try {
            setIsSaving(true);
            setSaveError(null);
            
            const result = await saveProjectData(
                pages, 
                projectData, 
                itemData, 
                presetData, 
                workspaceDimensions, 
                pageThumbnails, 
                isAutoSave
            );
            
            if (result.success) {
                setLastSaved(new Date());
                
                if (!isAutoSave) {
                    toast.success('✅ Proyecto guardado exitosamente');
                }
            } else {
                setSaveError(result.error);
                
                if (!isAutoSave) {
                    toast.error(`❌ Error al guardar: ${result.error}`);
                }
            }
            
            return result.success;
            
        } catch (error) {
            console.error('❌ [SAVE] Error inesperado:', error);
            setSaveError(error.message);
            
            if (!isAutoSave) {
                toast.error(`❌ Error inesperado: ${error.message}`);
            }
            
            return false;
        } finally {
            setIsSaving(false);
        }
    };
    
    // Guardado manual
    const handleManualSave = () => {
        saveProject(false);
    };
    
    // Auto-guardado cada 30 segundos
    useEffect(() => {
        if (!projectData?.id || pages.length === 0) return;
        
        const autoSaveInterval = setInterval(() => {
            saveProject(true); // Auto-save
        }, 30000); // 30 segundos
        
        return () => clearInterval(autoSaveInterval);
    }, [pages, projectData?.id, workspaceDimensions]);

    return {
        isSaving,
        lastSaved,
        saveError,
        saveProject,
        handleManualSave
    };
};
