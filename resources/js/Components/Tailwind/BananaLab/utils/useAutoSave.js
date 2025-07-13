/**
 * Hook profesional para auto-guardado con detección inteligente de cambios
 * y sistema de respaldo múltiple (localStorage + base de datos)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { saveProjectData } from './saveSystem';
import { toast } from 'sonner';

export const useAutoSave = (pages, projectData, itemData, presetData, workspaceDimensions, pageThumbnails) => {
    // Estados del sistema de guardado
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error', 'pending'
    const [lastSaved, setLastSaved] = useState(null);
    const [lastAutoSaved, setLastAutoSaved] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Referencias para control de intervalos y debounce
    const autoSaveIntervalRef = useRef(null);
    const debounceTimeoutRef = useRef(null);
    const lastChangeHashRef = useRef(null);
    const saveInProgressRef = useRef(false);
    const retryTimeoutRef = useRef(null);

    // Configuración
    const AUTO_SAVE_INTERVAL = 15000; // 15 segundos
    const DEBOUNCE_DELAY = 2000; // 2 segundos después del último cambio
    const RETRY_DELAY = 5000; // 5 segundos para reintentar
    const MAX_RETRIES = 3;

    // Generar hash del contenido para detectar cambios reales
    const generateContentHash = useCallback((pages, workspace) => {
        try {
            const contentForHash = {
                pages: pages.map(page => ({
                    id: page.id,
                    layout: page.layout,
                    cells: page.cells?.map(cell => ({
                        id: cell.id,
                        elements: cell.elements?.map(element => ({
                            id: element.id,
                            type: element.type,
                            content: element.type === 'image' && element.content?.startsWith('data:image/') 
                                ? `[IMAGE_${element.content.length}]` // Simplificar hash para imágenes base64
                                : element.content,
                            position: element.position,
                            size: element.size,
                            style: element.style,
                            filters: element.filters,
                            rotation: element.rotation
                        })) || []
                    })) || []
                })) || [],
                workspace: {
                    width: workspace?.width,
                    height: workspace?.height
                }
            };
            
            return btoa(JSON.stringify(contentForHash)).substring(0, 32);
        } catch (error) {
            console.warn('⚠️ [AUTO-SAVE] Error generando hash:', error);
            return Date.now().toString();
        }
    }, []);

    // Obtener clave de localStorage para el proyecto
    const getStorageKey = useCallback(() => {
        return `album_editor_autosave_${projectData?.id || 'draft'}`;
    }, [projectData?.id]);

    // Guardar en localStorage como respaldo inmediato
    const saveToLocalStorage = useCallback((data) => {
        try {
            const storageKey = getStorageKey();
            const saveData = {
                ...data,
                savedAt: Date.now(),
                version: '2.1'
            };
            
            localStorage.setItem(storageKey, JSON.stringify(saveData));
            console.log('💾 [AUTO-SAVE] Guardado en localStorage');
            return true;
        } catch (error) {
            console.error('❌ [AUTO-SAVE] Error guardando en localStorage:', error);
            return false;
        }
    }, [getStorageKey]);

    // Cargar desde localStorage
    const loadFromLocalStorage = useCallback(() => {
        try {
            const storageKey = getStorageKey();
            const savedData = localStorage.getItem(storageKey);
            
            if (savedData) {
                const parsed = JSON.parse(savedData);
                console.log('📂 [AUTO-SAVE] Datos encontrados en localStorage:', {
                    pages: parsed.pages?.length,
                    savedAt: new Date(parsed.savedAt).toLocaleString()
                });
                return parsed;
            }
        } catch (error) {
            console.error('❌ [AUTO-SAVE] Error cargando desde localStorage:', error);
        }
        return null;
    }, [getStorageKey]);

    // Función principal de auto-guardado
    const performAutoSave = useCallback(async (force = false) => {
        if (saveInProgressRef.current && !force) {
            console.log('⏳ [AUTO-SAVE] Guardado en progreso, saltando...');
            return;
        }

        if (!projectData?.id || !pages || pages.length === 0) {
            console.log('⚠️ [AUTO-SAVE] Datos insuficientes para guardar');
            return;
        }

        // Verificar si hay cambios reales
        const currentHash = generateContentHash(pages, workspaceDimensions);
        if (!force && currentHash === lastChangeHashRef.current) {
            console.log('📊 [AUTO-SAVE] Sin cambios detectados, saltando guardado');
            return;
        }

        try {
            saveInProgressRef.current = true;
            setSaveStatus('saving');
            setSaveError(null);

            // Preparar datos para guardar
            const saveData = {
                pages,
                projectInfo: {
                    id: projectData.id,
                    item_id: itemData?.id,
                    title: itemData?.title,
                    preset_id: presetData?.id
                },
                workspace: workspaceDimensions,
                meta: {
                    savedAt: new Date().toISOString(),
                    version: '2.1',
                    contentHash: currentHash
                }
            };

            // 1. Guardar inmediatamente en localStorage como respaldo
            saveToLocalStorage(saveData);

            // 2. Intentar guardar en base de datos si estamos online
            if (isOnline) {
                const result = await saveProjectData(
                    pages, 
                    projectData, 
                    itemData, 
                    presetData, 
                    workspaceDimensions, 
                    pageThumbnails, 
                    true // isAutoSave
                );

                if (result.success) {
                    lastChangeHashRef.current = currentHash;
                    setLastAutoSaved(new Date());
                    setSaveStatus('saved');
                    setHasUnsavedChanges(false);
                    
                    console.log('✅ [AUTO-SAVE] Guardado exitoso en base de datos');
                } else {
                    throw new Error(result.error);
                }
            } else {
                console.log('� [AUTO-SAVE] Sin conexión, solo guardado en localStorage');
                setSaveStatus('pending');
                setHasUnsavedChanges(true);
            }

        } catch (error) {
            console.error('❌ [AUTO-SAVE] Error:', error);
            setSaveError(error.message);
            setSaveStatus('error');
            
            // Programar reintento si estamos online
            if (isOnline) {
                retryTimeoutRef.current = setTimeout(() => {
                    console.log('🔄 [AUTO-SAVE] Reintentando guardado...');
                    performAutoSave(true);
                }, RETRY_DELAY);
            }
        } finally {
            saveInProgressRef.current = false;
        }
    }, [pages, projectData, itemData, presetData, workspaceDimensions, pageThumbnails, generateContentHash, saveToLocalStorage, isOnline]);

    // Guardado manual
    const saveManually = useCallback(async () => {
        try {
            setSaveStatus('saving');
            
            const result = await saveProjectData(
                pages, 
                projectData, 
                itemData, 
                presetData, 
                workspaceDimensions, 
                pageThumbnails, 
                false // isAutoSave = false para guardado manual
            );

            if (result.success) {
                const currentHash = generateContentHash(pages, workspaceDimensions);
                lastChangeHashRef.current = currentHash;
                setLastSaved(new Date());
                setSaveStatus('saved');
                setHasUnsavedChanges(false);
                
                toast.success('💾 Proyecto guardado exitosamente');
                console.log('✅ [MANUAL-SAVE] Guardado manual exitoso');
            } else {
                setSaveError(result.error);
                setSaveStatus('error');
                toast.error(`❌ Error al guardar: ${result.error}`);
            }

            return result.success;
        } catch (error) {
            console.error('❌ [MANUAL-SAVE] Error:', error);
            setSaveError(error.message);
            setSaveStatus('error');
            toast.error(`❌ Error inesperado: ${error.message}`);
            return false;
        }
    }, [pages, projectData, itemData, presetData, workspaceDimensions, pageThumbnails, generateContentHash]);

    // Detectar cambios y programar auto-save
    useEffect(() => {
        if (!projectData?.id || !pages || pages.length === 0) return;

        const currentHash = generateContentHash(pages, workspaceDimensions);
        
        if (lastChangeHashRef.current && currentHash !== lastChangeHashRef.current) {
            console.log('🔄 [AUTO-SAVE] Cambios detectados, programando guardado...');
            setHasUnsavedChanges(true);
            setSaveStatus('pending');

            // Cancelar timeout anterior
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // Programar auto-save con debounce
            debounceTimeoutRef.current = setTimeout(() => {
                performAutoSave();
            }, DEBOUNCE_DELAY);
        } else if (!lastChangeHashRef.current) {
            // Primera carga
            lastChangeHashRef.current = currentHash;
        }

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [pages, workspaceDimensions, projectData?.id, generateContentHash, performAutoSave]);

    // Auto-save periódico
    useEffect(() => {
        if (!projectData?.id) return;

        // Limpiar intervalo anterior
        if (autoSaveIntervalRef.current) {
            clearInterval(autoSaveIntervalRef.current);
        }

        // Configurar nuevo intervalo
        autoSaveIntervalRef.current = setInterval(() => {
            if (hasUnsavedChanges) {
                console.log('⏰ [AUTO-SAVE] Auto-save periódico activado');
                performAutoSave();
            }
        }, AUTO_SAVE_INTERVAL);

        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [projectData?.id, hasUnsavedChanges, performAutoSave]);

    // Detectar estado de conexión
    useEffect(() => {
        const handleOnline = () => {
            console.log('🌐 [AUTO-SAVE] Conexión restaurada');
            setIsOnline(true);
            
            // Intentar guardar cambios pendientes
            if (hasUnsavedChanges) {
                setTimeout(() => performAutoSave(true), 1000);
            }
        };

        const handleOffline = () => {
            console.log('📴 [AUTO-SAVE] Conexión perdida');
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [hasUnsavedChanges, performAutoSave]);

    // Guardado antes de cerrar página
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                // Intentar guardado síncrono en localStorage
                const saveData = {
                    pages,
                    projectInfo: { id: projectData.id },
                    workspace: workspaceDimensions,
                    meta: { savedAt: new Date().toISOString() }
                };
                saveToLocalStorage(saveData);
                
                // Mostrar advertencia
                e.preventDefault();
                e.returnValue = '¿Estás seguro de salir? Hay cambios sin guardar.';
                return '¿Estás seguro de salir? Hay cambios sin guardar.';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges, pages, projectData?.id, workspaceDimensions, saveToLocalStorage]);

    // Limpiar timeouts al desmontar
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
            if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        };
    }, []);

    // Mejorar manejo de errores para max_allowed_packet y datos grandes
    useEffect(() => {
        if (saveError) {
            if (saveError.includes('max_allowed_packet') || saveError.includes('data_too_large')) {
                toast.error('❌ El proyecto es demasiado grande para guardar automáticamente. Reduce el número o tamaño de imágenes.');
            } else {
                toast.error(`❌ Error de auto-guardado: ${saveError}`);
            }
        }
    }, [saveError]);

    return {
        // Estados
        saveStatus,
        lastSaved,
        lastAutoSaved,
        saveError,
        hasUnsavedChanges,
        isOnline,
        
        // Funciones
        saveManually,
        performAutoSave: () => performAutoSave(true),
        loadFromLocalStorage,
        
        // Utilidades
        getStorageKey,
        
        // Información del sistema
        autoSaveInterval: AUTO_SAVE_INTERVAL,
        debounceDelay: DEBOUNCE_DELAY
    };
};
