/**
 * Hook personalizado para manejar AutoSave en el editor
 * Integra el sistema de autosave con React
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { autoSaveSystem } from './autoSaveSystem';

export const useAutoSave = (projectId, editorData, options = {}) => {
    const {
        enabled = true,
        delay = 3000,
        onAutoSave = () => {},
        onError = () => {},
        onProgressLoaded = () => {}
    } = options;

    const [autoSaveStatus, setAutoSaveStatus] = useState({
        enabled: false,
        saving: false,
        lastSaved: null,
        error: null,
        pendingChanges: false
    });

    const [savedVersions, setSavedVersions] = useState([]);
    const [storageStats, setStorageStats] = useState(null);
    
    const isInitialized = useRef(false);
    const lastDataRef = useRef(null);

    // Inicializar el sistema de autosave
    useEffect(() => {
        if (projectId && !isInitialized.current) {
            console.log('🔄 Inicializando AutoSave para proyecto:', projectId);
            
            const success = autoSaveSystem.init(projectId);
            if (success) {
                autoSaveSystem.setAutoSaveEnabled(enabled);
                autoSaveSystem.setAutoSaveDelay(delay);
                isInitialized.current = true;

                // Cargar progreso previo si existe
                loadLatestProgress();
            }

            setAutoSaveStatus(prev => ({
                ...prev,
                enabled: success
            }));
        }

        return () => {
            if (isInitialized.current) {
                autoSaveSystem.destroy();
                isInitialized.current = false;
            }
        };
    }, [projectId, enabled, delay]);

    // Listener para eventos del autosave
    useEffect(() => {
        const handleAutoSaveEvent = (event, data) => {
            switch (event) {
                case 'autosave_success':
                    setAutoSaveStatus(prev => ({
                        ...prev,
                        saving: false,
                        lastSaved: data.timestamp,
                        error: null,
                        pendingChanges: false
                    }));
                    onAutoSave('success', data);
                    break;

                case 'autosave_error':
                    setAutoSaveStatus(prev => ({
                        ...prev,
                        saving: false,
                        error: data.error,
                        pendingChanges: true
                    }));
                    onError('autosave', data.error);
                    break;

                case 'manual_save_success':
                    setAutoSaveStatus(prev => ({
                        ...prev,
                        saving: false,
                        lastSaved: data.timestamp,
                        error: null,
                        pendingChanges: false
                    }));
                    onAutoSave('manual_success', data);
                    loadVersions(); // Recargar versiones
                    break;

                case 'manual_save_error':
                    setAutoSaveStatus(prev => ({
                        ...prev,
                        saving: false,
                        error: data.error
                    }));
                    onError('manual_save', data.error);
                    break;

                case 'progress_loaded':
                    onProgressLoaded(data);
                    break;

                case 'version_loaded':
                    console.log('📂 Versión cargada:', data);
                    break;

                case 'autosave_toggled':
                    setAutoSaveStatus(prev => ({
                        ...prev,
                        enabled: data.enabled
                    }));
                    break;
            }
        };

        const removeListener = autoSaveSystem.addListener(handleAutoSaveEvent);
        return removeListener;
    }, [onAutoSave, onError, onProgressLoaded]);

    // Registrar cambios cuando los datos del editor cambien
    useEffect(() => {
        if (!isInitialized.current || !editorData) return;

        const currentData = JSON.stringify(editorData);
        
        // Solo registrar si los datos han cambiado realmente
        if (lastDataRef.current !== currentData) {
            lastDataRef.current = currentData;
            
            setAutoSaveStatus(prev => ({
                ...prev,
                pendingChanges: true,
                saving: true
            }));

            autoSaveSystem.registerChange(editorData);
        }
    }, [editorData]);

    // Cargar progreso anterior
    const loadLatestProgress = useCallback(async () => {
        if (!isInitialized.current) return null;

        try {
            console.log('📂 Cargando último progreso...');
            const progress = await autoSaveSystem.loadLatestProgress();
            
            if (progress) {
                console.log('✅ Progreso cargado exitosamente');
                return progress;
            }

            return null;
        } catch (error) {
            console.error('❌ Error cargando progreso:', error);
            onError('load_progress', error.message);
            return null;
        }
    }, [onError]);

    // Guardar manualmente
    const saveManually = useCallback(async (description = '') => {
        if (!isInitialized.current || !editorData) {
            throw new Error('Sistema de guardado no inicializado o datos no disponibles');
        }

        try {
            setAutoSaveStatus(prev => ({
                ...prev,
                saving: true,
                error: null
            }));

            await autoSaveSystem.saveManually(editorData, description);
            return true;
        } catch (error) {
            setAutoSaveStatus(prev => ({
                ...prev,
                saving: false,
                error: error.message
            }));
            throw error;
        }
    }, [editorData]);

    // Cargar versiones
    const loadVersions = useCallback(async (limit = 20) => {
        if (!isInitialized.current) return [];

        try {
            const versions = await autoSaveSystem.getVersions(limit);
            setSavedVersions(versions);
            return versions;
        } catch (error) {
            console.error('❌ Error cargando versiones:', error);
            onError('load_versions', error.message);
            return [];
        }
    }, [onError]);

    // Cargar versión específica
    const loadVersion = useCallback(async (versionId) => {
        if (!isInitialized.current) {
            throw new Error('Sistema de guardado no inicializado');
        }

        try {
            return await autoSaveSystem.loadVersion(versionId);
        } catch (error) {
            onError('load_version', error.message);
            throw error;
        }
    }, [onError]);

    // Obtener estadísticas de almacenamiento
    const getStorageStats = useCallback(async () => {
        if (!isInitialized.current) return null;

        try {
            const stats = await autoSaveSystem.getStorageStats();
            setStorageStats(stats);
            return stats;
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return null;
        }
    }, []);

    // Habilitar/deshabilitar autosave
    const toggleAutoSave = useCallback((enable) => {
        if (!isInitialized.current) return;
        
        autoSaveSystem.setAutoSaveEnabled(enable);
    }, []);

    // Configurar delay del autosave
    const setAutoSaveDelay = useCallback((delayMs) => {
        if (!isInitialized.current) return;
        
        autoSaveSystem.setAutoSaveDelay(delayMs);
    }, []);

    // Forzar guardado inmediato
    const forceSave = useCallback(async () => {
        if (!isInitialized.current || !editorData) return;

        try {
            setAutoSaveStatus(prev => ({
                ...prev,
                saving: true
            }));

            await autoSaveSystem.forceSave(editorData);
        } catch (error) {
            console.error('❌ Error en guardado forzado:', error);
            onError('force_save', error.message);
        }
    }, [editorData, onError]);

    // Verificar si hay progreso guardado disponible
    const hasProgress = useCallback(async () => {
        if (!isInitialized.current) return false;

        try {
            const progress = await autoSaveSystem.loadLatestProgress();
            return !!progress;
        } catch (error) {
            return false;
        }
    }, []);

    return {
        // Estado
        autoSaveStatus,
        savedVersions,
        storageStats,
        
        // Funciones
        saveManually,
        loadLatestProgress,
        loadVersions,
        loadVersion,
        getStorageStats,
        toggleAutoSave,
        setAutoSaveDelay,
        forceSave,
        hasProgress,
        
        // Estado del sistema
        isEnabled: autoSaveStatus.enabled,
        isSaving: autoSaveStatus.saving,
        hasPendingChanges: autoSaveStatus.pendingChanges,
        lastSaved: autoSaveStatus.lastSaved,
        error: autoSaveStatus.error
    };
};
