import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import html2canvas from 'html2canvas'; // Para captura de alta calidad

// Función debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Hook personalizado para debounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

import LayerPanel from "./components/Elements/LayerPanel";
import {
    Undo2,
    Redo2,
    Trash2,
    ChevronLeft,
    ImageIcon,
    Type,
    Eye,
    Plus,
    FlipHorizontal,
    FlipVertical,
    Copy,
    Book,
    Lock,
    Pencil,
    CheckCircleIcon,
    Save,
    Zap,
    User,
    Settings,
    HelpCircle,
    LogOut,
    MoreHorizontal,
    Layers,
    Crop,
    Palette,
    Search,
    Download,
    Share,
    Grid,
    Maximize,
    Minimize,
    MousePointer,
    Shapes,
    Sticker,
    FileText,
    Layout,
    Command,
    Filter,
    Folder,
    Star,
    Move,
    RotateCcw,
} from "lucide-react";
import { saveAs } from "file-saver";

import jsPDF from "jspdf";
import { toast, Toaster } from "sonner";
import { Local } from "sode-extend-react";

import { layouts } from "./constants/layouts";
import { imageMasks } from "./constants/masks";
import { filterPresets } from "./constants/filters";
import Button from "./components/UI/Button";

import Slider from "./components/UI/Slider";
import EditableCell from "./components/Elements/EditableCell";
import LayoutSelector from "./components/Elements/LayoutSelector";
import { AdvancedSettings } from "./components/Editor/AdvancedSettings";
import { FilterPresets } from "./components/Editor/FilterPresets";
import { FilterControls } from "./components/Editor/FilterControls";

import { MaskSelector } from "./components/Elements/MaskSelector";
import TextToolbar from "./components/Elements/TextToolbar";
import WorkspaceControls from "./components/Elements/WorkspaceControls";
import BookPreviewModal from "./components/Editor/BookPreview";
import Global from "../../../Utils/Global";
import { generateAccurateThumbnails } from "./utils/thumbnailGenerator";
import { generateFastThumbnails, generateHybridThumbnails, clearThumbnailCaches, generateSingleThumbnail } from "./utils/fastThumbnailGenerator";
import { useSaveProject } from "./utils/useSaveProject";
import { useAutoSave } from "./utils/useAutoSave";
import { saveThumbnailsAsFiles } from "./utils/saveSystem";
import SaveIndicator from "./components/UI/SaveIndicator";
import ProgressRecoveryModal from "./components/UI/ProgressRecoveryModal";
import domtoimage from 'dom-to-image-more';

// 🚀 OPTIMIZACIÓN: Componente ThumbnailImage mejorado con lazy loading y cache
const ThumbnailImage = React.memo(({ pageId, thumbnail, altText, type }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (thumbnail && !imageError) {
        return (
            <div className="relative w-full h-full">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    </div>
                )}
                <img
                    src={thumbnail}
                    alt={altText}
                    className={`w-full h-full object-contain transition-opacity duration-200 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    loading="lazy"
                    decoding="async"
                    style={{
                        imageRendering: 'optimizeQuality'
                    }}
                />
            </div>
        );
    }

    // Fallback placeholder
    const PlaceholderIcon = type === 'cover' || type === 'final' ? Book :
        () => (
            <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-gray-300 rounded-sm"></div>
                ))}
            </div>
        );

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400">
                <PlaceholderIcon className="w-8 h-8 mx-auto mb-1" />
                <span className="text-xs">Generando...</span>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // 🚀 OPTIMIZACIÓN: Comparación personalizada para evitar re-renders innecesarios
    return prevProps.pageId === nextProps.pageId && 
           prevProps.thumbnail === nextProps.thumbnail &&
           prevProps.altText === nextProps.altText &&
           prevProps.type === nextProps.type;
});

// Componente para mostrar imágenes del proyecto con drag & drop
const ProjectImageGallery = React.memo(({ images, onImageSelect, isLoading }) => {
    const ImageItem = React.memo(({ image }) => {
        const [imageLoaded, setImageLoaded] = useState(false);
        const [imageError, setImageError] = useState(false);
        const [dragStarted, setDragStarted] = useState(false);

        const [{ isDragging }, drag] = useDrag(() => ({
            type: 'PROJECT_IMAGE',
            item: { type: 'PROJECT_IMAGE', imageUrl: image.url },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
            end: () => {
                // Reset drag state after a short delay
                setTimeout(() => setDragStarted(false), 100);
            }
        }));

        // Usar miniatura si está disponible, sino usar imagen original
        const displayImage = image.thumbnail_url || image.url;
        const fullImage = image.url;

        // 🚀 Handler para detectar inicio de drag vs click
        const handleMouseDown = (e) => {
            setDragStarted(true);
            // Reset after a longer delay to ensure drag detection
            setTimeout(() => setDragStarted(false), 500);
        };

        const handleClick = (e) => {
            // Prevent click if drag was initiated recently or if currently dragging
            if (dragStarted || isDragging) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            // Solo ejecutar si es un click genuino (no parte de drag)
            onImageSelect(fullImage);
        };

        return (
            <div
                ref={drag}
                className={`relative group cursor-pointer bg-gray-50 rounded-lg overflow-hidden border-2 border-transparent hover:border-[#af5cb8] transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : ''
                    }`}
                onMouseDown={handleMouseDown}
                onClick={handleClick}
            >
                <div className="aspect-square relative">
                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#af5cb8] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {imageError ? (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                                <p className="text-xs">Error al cargar</p>
                            </div>
                        </div>
                    ) : (
                        <img
                            src={displayImage}
                            alt={image.filename || 'Project image'}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                            loading="lazy"
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                        />
                    )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white rounded-full p-2 shadow-md">
                            <Plus className="h-4 w-4 text-[#af5cb8]" />
                        </div>
                    </div>
                </div>
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {image.has_thumbnail ? 'Optimizada' : 'Arrastra o haz clic'}
                </div>
                {/* Indicador de miniatura */}
                {image.has_thumbnail && (
                    <div className="absolute top-2 left-2 bg-green-500 rounded-full w-2 h-2"></div>
                )}
            </div>
        );
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">No hay imágenes en este proyecto</p>
                <p className="text-xs text-gray-500">Sube una imagen para empezar</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                    <ImageItem key={`${image.id || image.url}-${index}`} image={image} />
                ))}
            </div>

            {/* Información adicional */}
            <div className="text-center">
                <p className="text-xs text-gray-500">
                    {images.filter(img => img.has_thumbnail).length} de {images.length} imágenes optimizadas
                </p>
            </div>
        </div>
    );
});

// Componente principal del editor
export default function EditorLibro() {
    // Estados para cargar datos desde el backend
    const [projectData, setProjectData] = useState(null);
    const [itemData, setItemData] = useState(null);
    const [presetData, setPresetData] = useState(null);
    const [initialProject, setInitialProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    // Estado para auto-guardado inteligente
    const [autoSaveState, setAutoSaveState] = useState({
        hasUnsavedChanges: false,
        lastEditTime: null,
        isSaving: false
    });

    // Estado para rastrear cambios por página
    const [pageChanges, setPageChanges] = useState(new Map());
    
    // Cola de guardado en segundo plano
    const [saveQueue, setSaveQueue] = useState([]);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);

    // Referencias para acceder a los valores actuales sin dependencias
    const saveQueueRef = useRef(saveQueue);
    const pageChangesRef = useRef(pageChanges);
    const processingTimerRef = useRef(null);
    const loadingTimeoutRef = useRef(null); // 🚀 Timeout para loading states
    const thumbnailLoadTimeoutRef = useRef(null); // 🛡️ Timeout para debounce de carga de thumbnails
    
    // Actualizar refs cuando cambien los valores
    useEffect(() => {
        saveQueueRef.current = saveQueue;
    }, [saveQueue]);
    
    useEffect(() => {
        pageChangesRef.current = pageChanges;
    }, [pageChanges]);

    // Efecto para cargar datos desde la URL
    useEffect(() => {
        const loadProjectData = async () => {
            try {
                // Obtener el parámetro project de la URL
                const urlParams = new URLSearchParams(window.location.search);
                const projectId = urlParams.get('project');

                if (!projectId) {
                    setLoadError('No se encontró el ID del proyecto en la URL');
                    setIsLoading(false);
                    return;
                }


                // Realizar fetch al backend para obtener los datos del proyecto
                const response = await fetch(`/api/canvas/projects/${projectId}`, {
                    method: 'GET',
                    credentials: 'include', // Incluir cookies de sesión
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al cargar el proyecto');
                }

                const data = await response.json();


                // Establecer los datos en el estado
                setProjectData(data.project);
                setItemData(data.item);
                setPresetData(data.canvasPreset);
                setInitialProject(data.initialProject);

                setIsLoading(false);

            } catch (error) {
                console.error('❌ Error cargando proyecto:', error);
                setLoadError(error.message);
                setIsLoading(false);
            }
        };

        loadProjectData();
    }, []);

    // Estado del carrito - igual que en System.jsx
    const [cart, setCart] = useState(
        Local.get(`${Global.APP_CORRELATIVE}_cart`) ?? []
    );

    // Sincronizar carrito con localStorage
    useEffect(() => {
        Local.set(`${Global.APP_CORRELATIVE}_cart`, cart);
    }, [cart]);

    // Estado inicial de páginas - viene desde initialProject
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [workspaceSize, setWorkspaceSize] = useState("preset");

    const [selectedElement, setSelectedElement] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [activeTab, setActiveTab] = useState("pages");
    const [filterTab, setFilterTab] = useState("basic");
    const [history, setHistory] = useState([JSON.stringify(pages)]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [previewMode, setPreviewMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [pageThumbnails, setPageThumbnails] = useState({});
    const [isPDFGenerating, setIsPDFGenerating] = useState(false);
    const [projectImages, setProjectImages] = useState([]); // Nueva: imágenes del proyecto
    const [projectImagesLoading, setProjectImagesLoading] = useState(false);
    const [imageCache, setImageCache] = useState(new Map()); // Cache para evitar re-renders
    const [imageBlobCache, setImageBlobCache] = useState(() => new Map()); // 🚀 Cache de blobs optimizado
    const [thumbnailProgress, setThumbnailProgress] = useState(null); // ⚡ Estado de progreso de thumbnails
    const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false); // 🛡️ Control de llamadas en progreso

    // ✅ MONITOREO: Sistema de filtros corregido
    useEffect(() => {
        console.log('✅ [FILTERS] Tab actual:', activeTab);
    }, [activeTab]);

    // 🛡️ Función controlada para cambiar activeTab con logging
    const setActiveTabControlled = useCallback((newTab, reason = 'manual') => {
        console.log(`🔄 [ACTIVE_TAB] Cambiando de "${activeTab}" a "${newTab}" - Razón: ${reason}`);
        if (newTab === 'filters' && reason !== 'manual') {
            console.warn('🚨 [ACTIVE_TAB] Cambio automático a filters bloqueado!');
            return;
        }
        setActiveTab(newTab);
    }, [activeTab]);
    console.log('🎉 [FILTERS FIX] Editor cargado - Fix del problema de filtros ACTIVADO');
    
    // 🚀 Estado para control de inicialización de progreso
    const [hasInitializedProgress, setHasInitializedProgress] = useState(false);

    // Referencias y timeouts para manejo de miniaturas
    const thumbnailTimeout = useRef();

    // Estado para las dimensiones calculadas
    const [workspaceDimensions, setWorkspaceDimensions] = useState({ width: 800, height: 600 });

    // 🖼️ Función para cargar thumbnails guardados desde la base de datos (OPCIONAL)
    const loadStoredThumbnails = useCallback(async () => {
        if (!projectData?.id) return;

        try {
            // Usar el endpoint original primero para verificar si hay thumbnails
            const response = await fetch(`/api/thumbnails/${projectData.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.thumbnails && data.thumbnails.length > 0) {
                    // Solo actualizar si hay thumbnails guardados
                    const thumbnailsObject = {};
                    data.thumbnails.forEach(thumbnail => {
                        if (thumbnail.page_id && thumbnail.thumbnail_url) {
                            thumbnailsObject[thumbnail.page_id] = thumbnail.thumbnail_url;
                        }
                    });

                    // Solo actualizar si encontramos thumbnails guardados
                    if (Object.keys(thumbnailsObject).length > 0) {
                        setPageThumbnails(prev => ({
                            ...prev, // Mantener thumbnails locales existentes
                            ...thumbnailsObject // Sobrescribir con los guardados
                        }));
                        console.log('✅ Thumbnails cargados desde storage:', Object.keys(thumbnailsObject).length);
                    } else {
                        console.log('ℹ️ No hay thumbnails guardados, usando generación local');
                    }
                } else {
                    console.log('ℹ️ No hay thumbnails guardados para este proyecto');
                }
            }
        } catch (error) {
            console.warn('⚠️ Error cargando thumbnails guardados (usando locales):', error);
        }
    }, [projectData?.id]);

    // ⚡ NUEVA FUNCIÓN: Generar thumbnail solo de la página actual
    const generateCurrentPageThumbnail = useCallback(async () => {
        if (!pages[currentPage] || !workspaceDimensions) return;
        
        const page = pages[currentPage];
        
        // Si ya existe el thumbnail, no generar
        if (pageThumbnails[page.id]) {
            console.log(`✅ Thumbnail ya existe para página: ${page.id}`);
            return;
        }

        if (thumbnailGenerating.current) {
            console.log('⏳ Ya se está generando un thumbnail...');
            return;
        }

        thumbnailGenerating.current = true;

        try {
            console.log(`📸 Generando thumbnail para página actual: ${page.id}`);

            const thumbnailData = await generateSingleThumbnail({
                page,
                workspaceDimensions,
                onProgress: (progress) => {
                    setThumbnailProgress(progress);
                }
            });

            if (thumbnailData) {
                setPageThumbnails(prev => ({
                    ...prev,
                    [page.id]: thumbnailData
                }));
                console.log(`✅ Thumbnail generado para página: ${page.id}`);
            }
        } catch (error) {
            console.warn('⚠️ Error generando thumbnail de página actual:', error);
        } finally {
            thumbnailGenerating.current = false;
            setThumbnailProgress(null);
        }
    }, [pages, currentPage, workspaceDimensions, pageThumbnails]);

    // 🖼️ Función para generar thumbnails locales usando la función importada (OPTIMIZADA)
    const generateLocalThumbnails = useCallback(
        debounce(async () => {
            if (!pages?.length || !workspaceDimensions) return;

            // 🚀 OPTIMIZACIÓN: Evitar regeneración si ya están generando
            if (thumbnailGenerating.current) {
                console.log('⏳ Thumbnails ya se están generando, saltando...');
                return;
            }

            thumbnailGenerating.current = true;

            try {
                // 🚀 OPTIMIZACIÓN: Generar solo thumbnails que no existen
                const missingThumbnails = pages.filter(page => !pageThumbnails[page.id]);
                
                if (missingThumbnails.length === 0) {
                    console.log('✅ Todos los thumbnails ya existen');
                    return;
                }

                console.log(`📸 Generando ${missingThumbnails.length} thumbnails rápidos...`);

                // ⚡ NUEVA OPTIMIZACIÓN: Usar generador rápido con progreso
                const thumbnailsObject = await generateFastThumbnails({
                    pages: missingThumbnails,
                    workspaceDimensions,
                    onProgress: (progress) => {
                        setThumbnailProgress(progress);
                    }
                });

                if (thumbnailsObject && Object.keys(thumbnailsObject).length > 0) {
                    setPageThumbnails(prev => ({
                        ...prev,
                        ...thumbnailsObject
                    }));
                    console.log('✅ Thumbnails rápidos generados:', Object.keys(thumbnailsObject).length);
                }
            } catch (error) {
                console.warn('⚠️ Error generando thumbnails rápidos:', error);
            } finally {
                thumbnailGenerating.current = false;
                setThumbnailProgress(null);
            }
        }, 300), // Reducido el debounce para mayor responsividad
        [pages, workspaceDimensions, pageThumbnails]
    );

    // 🚀 OPTIMIZACIÓN: Ref para controlar generación de thumbnails
    const thumbnailGenerating = useRef(false);

    // ⚡ NUEVA FUNCIÓN: Generar thumbnails con prioridades
    const generatePriorityThumbnails = useCallback(async (priorityPageIds = []) => {
        if (thumbnailGenerating.current) return;
        
        try {
            thumbnailGenerating.current = true;
            
            // Si hay páginas específicas con prioridad, generarlas primero
            if (priorityPageIds.length > 0) {
                const priorityPages = pages.filter(p => priorityPageIds.includes(p.id));
                if (priorityPages.length > 0) {
                    console.log(`🎯 Generando ${priorityPages.length} thumbnails prioritarios...`);
                    
                    const priorityThumbnails = await generateFastThumbnails({
                        pages: priorityPages,
                        workspaceDimensions
                    });
                    
                    if (priorityThumbnails && Object.keys(priorityThumbnails).length > 0) {
                        setPageThumbnails(prev => ({
                            ...prev,
                            ...priorityThumbnails
                        }));
                    }
                }
            }
            
            // Luego generar el resto de forma silenciosa
            // DESHABILITADO: Solo generar por página individual
            // setTimeout(() => {
            //     generateLocalThumbnails();
            // }, 100);
            
        } catch (error) {
            console.warn('⚠️ Error en generación prioritaria:', error);
        } finally {
            thumbnailGenerating.current = false;
        }
    }, [pages, workspaceDimensions, generateLocalThumbnails]);
    
    // 🚀 OPTIMIZACIÓN: Pre-cache de imágenes en background
    const preloadImageCache = useCallback((imageUrl) => {
        if (imageBlobCache.has && imageBlobCache.has(imageUrl)) return;
        
        // Crear versión optimizada de la imagen en background
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Solo comprimir si la imagen es muy grande
            const shouldCompress = img.width > 1200 || img.height > 1200;
            
            if (shouldCompress) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calcular nuevo tamaño manteniendo aspect ratio
                const maxSize = 1200;
                const ratio = Math.min(maxSize / img.width, maxSize / img.height);
                const newWidth = img.width * ratio;
                const newHeight = img.height * ratio;
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                
                // Usar filtro para mejor calidad
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        setImageBlobCache(prev => {
                            const newCache = new Map(prev);
                            newCache.set(imageUrl, url);
                            
                            // Limpiar cache si es muy grande
                            if (newCache.size > 15) {
                                const firstKey = newCache.keys().next().value;
                                const firstUrl = newCache.get(firstKey);
                                URL.revokeObjectURL(firstUrl);
                                newCache.delete(firstKey);
                            }
                            
                            return newCache;
                        });
                    }
                }, 'image/webp', 0.85);
            }
        };
        img.onerror = () => {
            console.warn('❌ Error pre-cargando imagen:', imageUrl);
        };
        img.src = imageUrl;
    }, []); // Remove imageBlobCache dependency

    // 🚀 OPTIMIZACIÓN: Precargar imágenes del proyecto en background
    useEffect(() => {
        if (projectImages.length > 0) {
            // Precargar solo las primeras 10 imágenes para no sobrecargar
            const imagesToPreload = projectImages.slice(0, 10);
            imagesToPreload.forEach((image, index) => {
                setTimeout(() => {
                    preloadImageCache(image.url);
                }, index * 100); // Stagger la carga
            });
        }
    }, [projectImages, preloadImageCache]);

    // 🚀 OPTIMIZACIÓN: Limpiar cache de blobs al desmontar
    useEffect(() => {
        return () => {
            if (imageBlobCache && imageBlobCache.forEach) {
                imageBlobCache.forEach(url => URL.revokeObjectURL(url));
            }
        };
    }, []); // Empty dependency array - cleanup only on unmount

    // 🚀 OPTIMIZACIÓN: Limpiar caches de thumbnails rápidos al desmontar
    useEffect(() => {
        return () => {
            clearThumbnailCaches();
        };
    }, []);

    // 🖼️ Función para cargar thumbnails con nueva estructura después de generarlos
    const loadThumbnailsWithNewStructure = useCallback(async () => {
        if (!projectData?.id || !pages?.length) return;
        
        // 🛡️ Evitar llamadas múltiples simultáneas
        if (isLoadingThumbnails) {
            console.log('⏳ Ya hay una carga de thumbnails en progreso, omitiendo...');
            return;
        }

        try {
            setIsLoadingThumbnails(true);
            console.log('🔄 Iniciando carga de thumbnails existentes...');
            
            // 🔄 NUEVA ESTRUCTURA: Cargar thumbnails existentes desde archivos
            const response = await fetch(`/api/thumbnails/${projectData.id}/existing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                credentials: 'include',
                body: JSON.stringify({ pages })
            });

            if (response.ok) {
                const existingThumbnails = await response.json();

                if (existingThumbnails && Object.keys(existingThumbnails).length > 0) {
                    setPageThumbnails(prev => ({
                        ...prev,
                        ...existingThumbnails
                    }));
                    console.log('✅ Thumbnails existentes cargados:', Object.keys(existingThumbnails).length);
                } else {
                    console.log('📸 No hay thumbnails existentes, generando para página actual...');
                    // Solo generar thumbnail de la página actual
                    setTimeout(() => generateCurrentPageThumbnail(), 200);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error cargando thumbnails existentes:', error);
            // Fallback: generar thumbnail solo de la página actual
            setTimeout(() => generateCurrentPageThumbnail(), 200);
        } finally {
            setIsLoadingThumbnails(false);
        }
    }, [projectData?.id, pages, generateCurrentPageThumbnail, isLoadingThumbnails]);

    // 🖼️ Función para generar y guardar thumbnails en la base de datos
    const generateAndSavePageThumbnails = useCallback(async () => {
        if (!projectData?.id || !pages?.length) return;

        try {
            // Solo generar thumbnail para la página actual
            const currentPageData = pages[currentPage];
            if (!currentPageData) return;

            const response = await fetch(`/api/thumbnails/${projectData.id}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    pages: [currentPageData], // Solo la página actual
                    width: workspaceDimensions.width,
                    height: workspaceDimensions.height,
                    quality: 95,
                    scale: 4,
                    dpi: 300
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.thumbnails) {
                    // Actualizar thumbnails locales
                    const thumbnailsObject = {};
                    data.thumbnails.forEach(thumbnail => {
                        if (thumbnail.page_id && thumbnail.thumbnail_url) {
                            thumbnailsObject[thumbnail.page_id] = thumbnail.thumbnail_url;
                        }
                    });

                    setPageThumbnails(prev => ({
                        ...prev,
                        ...thumbnailsObject
                    }));

                    console.log('✅ Thumbnail generado y guardado en storage para página actual:', data.thumbnails.length);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error generando thumbnail:', error);
        }
    }, [projectData?.id, pages, currentPage, workspaceDimensions]);

    // Función para generar thumbnails de TODAS las páginas (solo para guardado final)
    const generateAllPageThumbnails = useCallback(async () => {
        if (!projectData?.id || !pages?.length) return;

        try {
            const response = await fetch(`/api/thumbnails/${projectData.id}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    pages: pages, // Todas las páginas
                    width: workspaceDimensions.width,
                    height: workspaceDimensions.height,
                    quality: 95,
                    scale: 4,
                    dpi: 300
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.thumbnails) {
                    // Actualizar thumbnails locales
                    const thumbnailsObject = {};
                    data.thumbnails.forEach(thumbnail => {
                        if (thumbnail.page_id && thumbnail.thumbnail_url) {
                            thumbnailsObject[thumbnail.page_id] = thumbnail.thumbnail_url;
                        }
                    });

                    setPageThumbnails(prev => ({
                        ...prev,
                        ...thumbnailsObject
                    }));

                    console.log('✅ Todos los thumbnails generados y guardados en storage:', data.thumbnails.length);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error generando todos los thumbnails:', error);
        }
    }, [projectData?.id, pages, workspaceDimensions]);

    // 🚀 NUEVA FUNCIÓN: Cargar thumbnails PDF existentes para el modal (sin generar nuevos)
    const loadExistingPDFThumbnails = useCallback(async (onProgress = null) => {
        if (!projectData?.id || !pages?.length) return {};

        try {
            console.log('📖 [ALBUM-MODAL] Cargando thumbnails PDF existentes...');
            
            // Crear objeto con las URLs de los thumbnails PDF que deberían existir
            const pdfThumbnails = {};
            const verifiedThumbnails = {};
            let loadedCount = 0;
            
            // Función para verificar si existe un thumbnail
            const verifyThumbnailExists = async (url, pageId) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        verifiedThumbnails[pageId] = url;
                        loadedCount++;
                        onProgress?.(loadedCount, pages.length);
                        resolve(true);
                    };
                    img.onerror = () => {
                        console.warn(`⚠️ [ALBUM-MODAL] Thumbnail no encontrado: ${url}`);
                        loadedCount++;
                        onProgress?.(loadedCount, pages.length);
                        resolve(false);
                    };
                    img.src = url;
                });
            };

            // Crear todas las promesas de verificación
            const verificationPromises = pages.map(async (page, index) => {
                const pdfUrl = `/storage/images/thumbnails/${projectData.id}/page-${index}-pdf.png`;
                const pageId = page.id || `page-${index}`;
                pdfThumbnails[pageId] = pdfUrl;
                return verifyThumbnailExists(pdfUrl, pageId);
            });

            // Ejecutar todas las verificaciones en paralelo
            await Promise.all(verificationPromises);

            console.log(`✅ [ALBUM-MODAL] Thumbnails verificados: ${Object.keys(verifiedThumbnails).length}/${pages.length}`);
            
            // Retornar todos los URLs (existentes y faltantes) para que el modal maneje los placeholders
            return pdfThumbnails;

        } catch (error) {
            console.warn('⚠️ [ALBUM-MODAL] Error cargando thumbnails PDF:', error);
            return {};
        }
    }, [projectData?.id, pages]);


    // Actualizar estados del editor cuando se cargan los datos del proyecto
    useEffect(() => {
        if (initialProject && itemData && presetData) {

            // En lugar de usar directamente initialProject.pages, recreamos las páginas
            // para asegurar que tengan las propiedades backgroundImage y backgroundColor correctas
            if (initialProject.pages && Array.isArray(initialProject.pages)) {

                // Si ya hay páginas en initialProject, las usamos como base pero actualizamos los backgrounds
                const updatedPages = initialProject.pages.map(page => {
                    let backgroundImage = null;
                    let backgroundColor = presetData.background_color || '#ffffff';

                    // Aplicar la lógica de background según el tipo de página
                    if (page.type === 'cover') {
                        if (itemData.cover_image) {
                            backgroundImage = `/storage/images/item/${itemData.cover_image}`;
                        }
                    } else if (page.type === 'content') {
                        if (itemData.content_image) {
                            backgroundImage = `/storage/images/item/${itemData.content_image}`;
                        }
                    } else if (page.type === 'final' || page.type === 'contraportada') {
                        if (itemData.back_cover_image) {
                            backgroundImage = `/storage/images/item/${itemData.back_cover_image}`;
                        }
                    }

                    return {
                        ...page,
                        backgroundImage,
                        backgroundColor
                    };
                });

                // 🚀 PROTECCIÓN: Solo actualizar si no hay páginas ya cargadas o si es la carga inicial
                setPages(prevPages => {
                    // Si ya hay páginas con contenido, no sobrescribir
                    if (prevPages.length > 0) {
                        console.log('⚠️ Páginas ya existentes, preservando cambios del usuario');
                        // Mergear solo los backgrounds sin perder elementos del usuario
                        return prevPages.map((existingPage, index) => {
                            const newPageData = updatedPages[index];
                            if (newPageData) {
                                return {
                                    ...existingPage,
                                    // Solo actualizar backgrounds si no se han modificado
                                    backgroundImage: existingPage.backgroundImage || newPageData.backgroundImage,
                                    backgroundColor: existingPage.backgroundColor || newPageData.backgroundColor
                                };
                            }
                            return existingPage;
                        });
                    }
                    
                    // Primera carga: usar las páginas de la DB
                    console.log('📄 Carga inicial de páginas desde la base de datos');
                    return updatedPages;
                });

                // Solo inicializar historial si está vacío
                setHistory(prevHistory => {
                    if (prevHistory.length <= 1) {
                        return [JSON.stringify(updatedPages)];
                    }
                    return prevHistory;
                });
                
                setHistoryIndex(prevIndex => {
                    if (prevIndex === 0 && history.length <= 1) {
                        return 0;
                    }
                    return prevIndex;
                });

                // 🖼️ Cargar thumbnails guardados después de inicializar páginas
                setTimeout(() => {
                    loadStoredThumbnails();
                }, 100);
            } else {
                // Si no hay páginas, crear páginas nuevas usando createPagesFromPreset
                const newPages = createPagesFromPreset(presetData, itemData);
                setPages(newPages);
                setHistory([JSON.stringify(newPages)]);
                setHistoryIndex(0);

                // 🖼️ Cargar thumbnails guardados después de crear páginas
                setTimeout(() => {
                    loadStoredThumbnails();
                }, 100);
            }

            if (typeof initialProject.currentPage === 'number') {
                setCurrentPage(initialProject.currentPage);
            }

            if (initialProject.workspaceSize) {
                setWorkspaceSize(initialProject.workspaceSize);
            }
        }
    }, [initialProject, itemData, presetData, loadStoredThumbnails]);

    // 💾 Inicializar hook de auto-guardado con todos los parámetros necesarios
    const autoSave = useAutoSave(pages, projectData, itemData, presetData, workspaceDimensions, pageThumbnails);

    // Función para obtener las dimensiones del área de trabajo
    const getWorkspaceDimensions = () => {
        // Si hay preset con dimensiones, usar esas dimensiones
        if (presetData?.width && presetData?.height) {
            // Las dimensiones vienen en centímetros desde la base de datos
            let widthCm = presetData.width;
            let heightCm = presetData.height;
            let widthPx = widthCm * 37.8; // Conversión aproximada cm a px (300 DPI)
            let heightPx = heightCm * 37.8;

            if (widthPx && heightPx) {
                const maxScreenWidth = window.innerWidth * 0.6; // 60% del ancho de pantalla
                const maxScreenHeight = window.innerHeight * 0.7; // 70% del alto de pantalla

                // Calcular escala para que quepa en pantalla manteniendo proporción
                const scaleX = maxScreenWidth / widthPx;
                const scaleY = maxScreenHeight / heightPx;
                const scale = Math.min(scaleX, scaleY, 1); // No agrandar más del tamaño original

                return {
                    width: Math.round(widthPx * scale),
                    height: Math.round(heightPx * scale),
                    originalWidth: widthCm,
                    originalHeight: heightCm,
                    scale: scale,
                    unit: 'cm',
                    originalWidthPx: Math.round(widthPx),
                    originalHeightPx: Math.round(heightPx)
                };
            }
        }

        // Fallback si hay canvas_config en extra_settings
        if (presetData?.extra_settings) {
            try {
                const extraSettings = typeof presetData.extra_settings === 'string'
                    ? JSON.parse(presetData.extra_settings)
                    : presetData.extra_settings;

                if (extraSettings?.canvas_config) {
                    const canvasConfig = extraSettings.canvas_config;
                    let widthCm = canvasConfig.width;
                    let heightCm = canvasConfig.height;
                    let widthPx = widthCm * 37.8;
                    let heightPx = heightCm * 37.8;

                    if (widthPx && heightPx) {
                        const maxScreenWidth = window.innerWidth * 0.6;
                        const maxScreenHeight = window.innerHeight * 0.7;
                        const scaleX = maxScreenWidth / widthPx;
                        const scaleY = maxScreenHeight / heightPx;
                        const scale = Math.min(scaleX, scaleY, 1);

                        return {
                            width: Math.round(widthPx * scale),
                            height: Math.round(heightPx * scale),
                            originalWidth: widthCm,
                            originalHeight: heightCm,
                            scale: scale,
                            unit: 'cm',
                            originalWidthPx: Math.round(widthPx),
                            originalHeightPx: Math.round(heightPx)
                        };
                    }
                }
            } catch (e) {
                console.warn('Error parsing extra_settings:', e);
            }
        }

        // Fallback a tamaños predefinidos
        const predefinedSizes = {
            "square": { width: 600, height: 600 },
            "landscape": { width: 1280, height: 720 },
            "portrait": { width: 600, height: 800 },
            "wide": { width: 1200, height: 600 },
            "tall": { width: 540, height: 960 },
            "preset": { width: 800, height: 600 } // Default si no hay preset
        };

        const size = predefinedSizes[workspaceSize] || predefinedSizes.preset;

        // Aplicar escalado también a tamaños predefinidos
        const maxScreenWidth = window.innerWidth * 0.6;
        const maxScreenHeight = window.innerHeight * 0.7;

        const scaleX = maxScreenWidth / size.width;
        const scaleY = maxScreenHeight / size.height;
        const scale = Math.min(scaleX, scaleY, 1);

        return {
            width: Math.round(size.width * scale),
            height: Math.round(size.height * scale),
            originalWidth: size.width,
            originalHeight: size.height,
            scale: scale,
            unit: 'px'
        };
    };

    // Función para capturar el workspace actual con alta calidad y sin bordes
    const captureCurrentWorkspace = useCallback(async (options = { type: 'thumbnail' }) => {
        if (!pages[currentPage]) return null;

        try {
            // CORRECCIÓN THUMBNAIL: Buscar específicamente el elemento de la página que tiene las dimensiones correctas de la BD
            let workspaceElement = document.querySelector(`#page-${pages[currentPage].id}`);

            if (!workspaceElement) {
                console.warn('❌ THUMBNAIL: No se encontró el elemento de página específico');
                return null;
            }



            // Debug adicional para la página actual
            const currentPageData = pages[currentPage];


            // Configuración según el tipo de captura (thumbnail vs PDF)
            const isPDF = options.type === 'pdf';
            // �️ IMPRESIÓN PROFESIONAL: Escalado optimizado para 300 DPI
            const scaleFactor = isPDF ? 11.81 : 3; // 11.81x para 300 DPI exacto (300/25.4 ≈ 11.81), 3x para thumbnails
            const quality = 1.0; // Calidad máxima sin compresión

            // CORRECCIÓN THUMBNAIL: Obtener las dimensiones reales del workspace de la BD
            const workspaceStyle = getComputedStyle(workspaceElement);

            // CORRECCIÓN THUMBNAIL: Determinar el color de fondo correcto del workspace/página
            let workspaceBackground = currentPageData?.backgroundColor || '#ffffff'; // Default a blanco

            // Si el elemento de página tiene un background específico, usarlo
            if (workspaceStyle.backgroundColor && workspaceStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                workspaceBackground = workspaceStyle.backgroundColor;
            }


            // 🖨️ OPCIONES PROFESIONALES: Configuración especial para PDF vs Thumbnails
            const captureOptions = {
                scale: scaleFactor, // 11.81x para PDF 300 DPI exacto, 3x para thumbnails
                useCORS: true,
                allowTaint: false,
                backgroundColor: workspaceBackground,
                width: workspaceDimensions.width,
                height: workspaceDimensions.height,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                // 🖨️ Configuración específica para PDF de impresión profesional
                foreignObjectRendering: isPDF ? true : false, // Mejor renderizado para PDF
                removeContainer: false,
                logging: false,
                imageTimeout: isPDF ? 60000 : 15000, // 60s para PDF de alta calidad
                pixelRatio: isPDF ? 3 : (window.devicePixelRatio || 1), // Triple pixel ratio para PDF
                // 🖨️ CONFIGURACIÓN CRÍTICA para impresión profesional
                canvas: isPDF ? document.createElement('canvas') : null,
                windowWidth: isPDF ? workspaceDimensions.width * scaleFactor : null,
                windowHeight: isPDF ? workspaceDimensions.height * scaleFactor : null,
                onclone: async (clonedDoc) => {

                    // CORRECCIÓN THUMBNAIL: Limpiar elementos de UI que no pertenecen al workspace
                    const excludedSelectors = [
                        '.toolbar',
                        '.ui-element',
                        '.floating',
                        '.overlay',
                        '.modal',
                        '.popover',
                        '.text-toolbar',
                        '.element-selector',
                        '.element-controls',
                        '.resize-handle',
                        '.resize-control-handle',
                        '.resize-manipulation-indicator',
                        '.sidebar',
                        '.panel',
                        '.btn',
                        '.button',
                        '.control',
                        '.menu',
                        '.dropdown',
                        '.tooltip',
                        '.pointer-events-none',
                        '[data-exclude-thumbnail="true"]'
                    ];

                    excludedSelectors.forEach(selector => {
                        try {
                            const elements = clonedDoc.querySelectorAll(selector);
                            elements.forEach(el => el.remove());
                        } catch (e) {
                            console.warn('Error removing selector:', selector, e);
                        }
                    });

                    // CORRECCIÓN THUMBNAIL: Configurar específicamente el elemento de página clonado
                    try {
                        const clonedPageElement = clonedDoc.querySelector(`#page-${pages[currentPage].id}`);


                        if (clonedPageElement) {
                            // CORRECCIÓN THUMBNAIL: Asegurar dimensiones exactas del workspace de la BD
                            clonedPageElement.style.width = workspaceDimensions.width + 'px';
                            clonedPageElement.style.height = workspaceDimensions.height + 'px';
                            clonedPageElement.style.position = 'relative';
                            clonedPageElement.style.overflow = 'hidden';

                            // Aplicar backgrounds de la página si existen
                            if (currentPageData?.backgroundImage) {
                                clonedPageElement.style.backgroundImage = `url(${currentPageData.backgroundImage})`;
                                clonedPageElement.style.backgroundSize = 'cover';
                                clonedPageElement.style.backgroundPosition = 'center';
                                clonedPageElement.style.backgroundRepeat = 'no-repeat';
                            }

                            if (currentPageData?.backgroundColor) {
                                clonedPageElement.style.backgroundColor = currentPageData.backgroundColor;
                            }


                        }
                    } catch (e) {
                        console.error('❌ [THUMBNAIL-FIX] Error configurando elemento de página:', e);
                    }

                    // 🚀 SOLUCIÓN AVANZADA SENIOR: PRE-PROCESAMIENTO DE IMÁGENES PARA html2canvas
                    try {

                        // 1. CAPTURAR DATOS ORIGINALES DE IMÁGENES ANTES DEL CLONADO
                        const originalImageData = new Map();
                        const originalImages = workspaceElement.querySelectorAll('[data-element-type="image"] img, .workspace-image, img');

                        originalImages.forEach((img, index) => {
                            if (img.complete && img.naturalWidth > 0) {
                                const container = img.closest('[data-element-type="image"]') || img.parentElement;
                                const containerRect = container.getBoundingClientRect();
                                const imgRect = img.getBoundingClientRect();

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

                        // 2. FUNCIÓN AVANZADA PARA SIMULAR object-fit: cover MANUALMENTE
                        const simulateObjectFitCover = async (img, containerWidth, containerHeight, naturalWidth, naturalHeight) => {
                            return new Promise((resolve) => {
                                try {
                                    // Calcular las dimensiones para object-fit: cover
                                    const containerAspect = containerWidth / containerHeight;
                                    const imageAspect = naturalWidth / naturalHeight;

                                    let cropWidth, cropHeight, cropX, cropY;
                                    let displayWidth, displayHeight;

                                    if (imageAspect > containerAspect) {
                                        // Imagen más ancha que el contenedor - recortar por los lados
                                        displayHeight = containerHeight;
                                        displayWidth = containerHeight * imageAspect;
                                        cropHeight = naturalHeight;
                                        cropWidth = naturalHeight * containerAspect;
                                        cropX = (naturalWidth - cropWidth) / 2;
                                        cropY = 0;
                                    } else {
                                        // Imagen más alta que el contenedor - recortar por arriba/abajo
                                        displayWidth = containerWidth;
                                        displayHeight = containerWidth / imageAspect;
                                        cropWidth = naturalWidth;
                                        cropHeight = naturalWidth / containerAspect;
                                        cropX = 0;
                                        cropY = (naturalHeight - cropHeight) / 2;
                                    }

                                    // Crear canvas temporal para el recorte
                                    const tempCanvas = clonedDoc.createElement('canvas');
                                    tempCanvas.width = containerWidth;
                                    tempCanvas.height = containerHeight;
                                    const tempCtx = tempCanvas.getContext('2d');

                                    // Crear nueva imagen para el canvas
                                    const tempImg = new Image();
                                    tempImg.crossOrigin = 'anonymous';

                                    tempImg.onload = () => {
                                        try {
                                            // Dibujar la imagen recortada simulando object-fit: cover
                                            tempCtx.drawImage(
                                                tempImg,
                                                cropX, cropY, cropWidth, cropHeight,  // Source rectangle (crop)
                                                0, 0, containerWidth, containerHeight  // Destination rectangle
                                            );

                                            // 🚀 Convertir a máxima calidad 4K
                                            const croppedDataUrl = tempCanvas.toDataURL('image/png', 1.0);

                                            // Aplicar la imagen pre-procesada
                                            img.src = croppedDataUrl;
                                            img.style.objectFit = 'fill'; // Cambiar a fill ya que ya está recortada
                                            img.style.objectPosition = 'center';
                                            img.style.width = '100%';
                                            img.style.height = '100%';

                                            resolve();
                                        } catch (e) {
                                            console.warn('⚠️ [ADVANCED-THUMBNAIL] Error en canvas processing:', e);
                                            resolve(); // Continuar aunque falle
                                        }
                                    };

                                    tempImg.onerror = () => {
                                        console.warn('⚠️ [ADVANCED-THUMBNAIL] Error cargando imagen temporal');
                                        resolve(); // Continuar aunque falle
                                    };

                                    tempImg.src = img.src;

                                } catch (e) {
                                    console.warn('⚠️ [ADVANCED-THUMBNAIL] Error en simulateObjectFitCover:', e);
                                    resolve();
                                }
                            });
                        };

                        // 3. PROCESAR TODAS LAS IMÁGENES EN EL DOCUMENTO CLONADO
                        const clonedImages = clonedDoc.querySelectorAll('[data-element-type="image"] img, .workspace-image, img');
                        const imageProcessingPromises = [];

                        clonedImages.forEach((img, index) => {
                            if (img.src && originalImageData.has(img.src)) {
                                const data = originalImageData.get(img.src);
                                const container = img.closest('[data-element-type="image"]') || img.parentElement;

                                // Asegurar que el contenedor tenga las dimensiones correctas
                                if (container) {
                                    container.style.overflow = 'hidden';
                                    container.style.position = 'relative';
                                }

                                // Solo procesar si la imagen necesita object-fit: cover
                                if (data.objectFit === 'cover' || img.classList.contains('object-cover') || img.classList.contains('workspace-image')) {

                                    const promise = simulateObjectFitCover(
                                        img,
                                        data.containerWidth,
                                        data.containerHeight,
                                        data.naturalWidth,
                                        data.naturalHeight
                                    );

                                    imageProcessingPromises.push(promise);
                                } else {
                                    // Para imágenes que no necesitan cover, mantener comportamiento normal
                                    img.style.width = '100%';
                                    img.style.height = '100%';
                                    img.style.objectFit = 'fill';
                                }
                            }
                        });

                        // 4. ESPERAR A QUE TODAS LAS IMÁGENAS SE PROCESEN
                        if (imageProcessingPromises.length > 0) {
                            await Promise.all(imageProcessingPromises);
                        }


                        // 5. CSS SIMPLIFICADO PARA IMÁGENES PRE-PROCESADAS
                        const style = clonedDoc.createElement('style');
                        style.textContent = `
                            /* CORRECCIÓN THUMBNAIL: Estructura del elemento de página */
                            #page-${pages[currentPage].id} {
                                width: ${workspaceDimensions.width}px !important;
                                height: ${workspaceDimensions.height}px !important;
                                position: relative !important;
                                overflow: hidden !important;
                                box-sizing: border-box !important;
                            }
                            
                            /* 🖨️ IMÁGENES PROFESIONALES: Optimizada para PDF vs Thumbnails */
                            img {
                                width: 100% !important;
                                height: 100% !important;
                                object-fit: fill !important; /* fill porque ya están recortadas */
                                object-position: center !important;
                                display: block !important;
                                ${isPDF ? `
                                /* 🖨️ IMPRESIÓN PROFESIONAL 300 DPI */
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
                                ` : `
                                /* Thumbnails optimizados */
                                image-rendering: -webkit-optimize-contrast !important;
                                image-rendering: crisp-edges !important;
                                image-rendering: high-quality !important;
                                `}
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
                            
                            /* Backgrounds de página */
                            #page-${pages[currentPage].id} {
                                background-size: cover !important;
                                background-position: center !important;
                                background-repeat: no-repeat !important;
                            }
                            
                            /* 🖨️ OPTIMIZACIONES GENERALES PARA PDF DE IMPRESIÓN */
                            ${isPDF ? `
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
                            ` : ''}
                            
                            /* Resetear estilos que puedan interferir */
                            img {
                                max-width: none !important;
                                max-height: none !important;
                                border: none !important;
                                outline: none !important;
                            }
                        `;
                        clonedDoc.head.appendChild(style);


                    } catch (e) {
                        console.error('❌ [ADVANCED-THUMBNAIL] Error en pre-procesamiento avanzado:', e);

                        // Fallback: CSS básico si falla el pre-procesamiento
                        const fallbackStyle = clonedDoc.createElement('style');
                        fallbackStyle.textContent = `
                            img { object-fit: cover !important; object-position: center !important; }
                            [data-element-type="image"] { overflow: hidden !important; }
                        `;
                        clonedDoc.head.appendChild(fallbackStyle);
                    }

                }
            };


            // 🖨️ CAPTURA PROFESIONAL: html2canvas con configuración optimizada
            const canvas = await html2canvas(workspaceElement, captureOptions);

            // 🖨️ POST-PROCESAMIENTO para PDF de impresión profesional
            if (isPDF && canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Mejorar el contraste y nitidez para impresión
                    ctx.imageSmoothingEnabled = false; // Desactivar suavizado para máxima nitidez
                    ctx.imageSmoothingQuality = 'high';

                    // Aplicar filtros de mejora de calidad si es necesario
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Ligero aumento de contraste para impresión
                    for (let i = 0; i < data.length; i += 4) {
                        // Ajuste sutil de contraste (factor 1.05)
                        data[i] = Math.min(255, data[i] * 1.05);     // R
                        data[i + 1] = Math.min(255, data[i + 1] * 1.05); // G
                        data[i + 2] = Math.min(255, data[i + 2] * 1.05); // B
                        // Alpha se mantiene igual (data[i + 3])
                    }

                    ctx.putImageData(imageData, 0, 0);
                }
            }

            if (!canvas) {
                throw new Error('html2canvas no devolvió un canvas válido para el elemento de página');
            }

            // CORRECCIÓN THUMBNAIL: Verificar que el canvas tenga las dimensiones correctas del workspace
            if (canvas.width === 0 || canvas.height === 0) {
                throw new Error('Canvas del elemento de página tiene dimensiones inválidas');
            }

            // Convertir a dataURL con la calidad apropiada
            const dataUrl = canvas.toDataURL('image/png', quality);

            if (!dataUrl || dataUrl === 'data:,') {
                throw new Error('No se pudo generar dataURL del elemento de página');
            }



            return isPDF ? canvas : dataUrl; // Retornar canvas para PDF, dataURL para thumbnail

        } catch (error) {
            console.error('❌ [THUMBNAIL-FIX] Error capturando elemento de página:', error);

            // Fallback: crear thumbnail con las dimensiones exactas del workspace de la BD
            try {
                const canvas = document.createElement('canvas');
                const scaleFactor = options.type === 'pdf' ? 11.81 : 1; // 🖨️ 11.81x para PDF 300 DPI exacto
                canvas.width = workspaceDimensions.width * scaleFactor;
                canvas.height = workspaceDimensions.height * scaleFactor;
                const ctx = canvas.getContext('2d');

                // CORRECCIÓN THUMBNAIL: Aplicar background del elemento de página en fallback
                const bgColor = workspaceBackground || currentPageData?.backgroundColor || '#ffffff';
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Texto indicativo
                ctx.fillStyle = bgColor === '#ffffff' || bgColor.includes('white') ? '#374151' : '#666666';
                ctx.font = `${14 * scaleFactor}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText('Página ' + (currentPage + 1), canvas.width / 2, canvas.height / 2);



                if (options.type === 'pdf') {
                    return canvas;
                } else {
                    const fallbackDataUrl = canvas.toDataURL('image/png', 1.0); // 🚀 Máxima calidad
                    return fallbackDataUrl;
                }
            } catch (fallbackError) {
                return null;
            }
        }
    }, [currentPage, pages]);

    // Generar miniatura para la página actual (optimizada)
    const generateCurrentThumbnail = useCallback(async () => {
        if (!pages[currentPage]) return;

        const thumbnail = await captureCurrentWorkspace({ type: 'thumbnail' });
        if (thumbnail) {
            setPageThumbnails(prev => ({
                ...prev,
                [pages[currentPage].id]: thumbnail
            }));
        }
    }, [captureCurrentWorkspace, currentPage, pages]);

    // ⚡ Regeneración de thumbnail optimizada para cambios en página actual
    const scheduleThumbnailGeneration = useCallback(() => {
        clearTimeout(thumbnailTimeout.current);
        thumbnailTimeout.current = setTimeout(() => {
            // Regenerar thumbnail de la página actual cuando hay cambios
            if (pages[currentPage]) {
                // Limpiar thumbnail existente para forzar regeneración
                setPageThumbnails(prev => {
                    const updated = { ...prev };
                    delete updated[pages[currentPage].id];
                    return updated;
                });
                
                // Generar nuevo thumbnail después de un pequeño delay
                setTimeout(() => {
                    generateCurrentPageThumbnail();
                }, 200);
            }
        }, 1000); // 1 segundo para evitar regeneración excesiva durante edición
    }, [pages, currentPage, generateCurrentPageThumbnail]);

    // ⚡ Función para regenerar thumbnail de página actual inmediatamente
    const generateImmediateThumbnail = useCallback(() => {
        if (pages[currentPage]) {
            // Limpiar thumbnail existente para forzar regeneración
            setPageThumbnails(prev => {
                const updated = { ...prev };
                delete updated[pages[currentPage].id];
                return updated;
            });
            
            setTimeout(() => {
                generateCurrentPageThumbnail();
            }, 300);
        }
    }, [pages, currentPage, generateCurrentPageThumbnail]);

    // Función para generar thumbnail de alta calidad para una página específica
    const generateHighQualityThumbnail = useCallback(async (pageIndex = currentPage, size = { width: 800, height: 600 }) => {
        if (!pages[pageIndex]) return null;

        try {

            // Cambiar temporalmente a la página requerida
            const originalPage = currentPage;
            if (pageIndex !== currentPage) {
                setCurrentPage(pageIndex);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const workspaceElement = document.querySelector(`#page-${pages[pageIndex].id}`);
            if (!workspaceElement) {
                console.warn('Workspace element not found for page:', pages[pageIndex].id);
                return null;
            }

            // Opciones para thumbnail de alta calidad
            const options = {
                scale: 4, // 🚀 4x para alta calidad eficiente
                useCORS: true,
                allowTaint: false,
                backgroundColor: pages[pageIndex]?.backgroundColor || '#ffffff',
                width: workspaceElement.offsetWidth,
                height: workspaceElement.offsetHeight,
                removeContainer: true,
                logging: false,
                onclone: (clonedDoc) => {
                    // Limpiar elementos de UI
                    const excludedSelectors = [
                        '.toolbar', '.ui-element', '.floating',
                        '.overlay', '.modal', '.popover',
                        '.text-toolbar', '.element-selector',
                        '.element-controls', '.resize-handle',
                        '.resize-control-handle',
                        '.resize-manipulation-indicator',
                        '.sidebar', '.panel', '.btn', '.button',
                        '.control', '.menu', '.dropdown',
                        '.tooltip', '.pointer-events-none',
                        '[data-exclude-thumbnail="true"]'
                    ];

                    excludedSelectors.forEach(selector => {
                        const elements = clonedDoc.querySelectorAll(selector);
                        elements.forEach(el => el.remove());
                    });

                    // CRÍTICO: Encontrar el elemento workspace en el clon y asegurar background correcto
                    const clonedWorkspace = clonedDoc.querySelector(`#page-${pages[pageIndex].id}`);
                    if (clonedWorkspace) {
                        const pageData = pages[pageIndex];

                        // Forzar background-image si existe
                        if (pageData?.backgroundImage) {
                            clonedWorkspace.style.backgroundImage = `url(${pageData.backgroundImage})`;
                            clonedWorkspace.style.backgroundSize = 'cover';
                            clonedWorkspace.style.backgroundPosition = 'center';
                            clonedWorkspace.style.backgroundRepeat = 'no-repeat';
                        }

                        // Aplicar backgroundColor si existe
                        if (pageData?.backgroundColor) {
                            clonedWorkspace.style.backgroundColor = pageData.backgroundColor;
                        }
                    }

                    // Mantener object-fit: cover para imágenes con preservación de estilos originales
                    try {
                        // CRÍTICO: Capturar y preservar los estilos de las imágenes del workspace original
                        const originalImages = workspaceElement.querySelectorAll('img');
                        const imageStyles = new Map();

                        originalImages.forEach((img, index) => {
                            const computedStyle = getComputedStyle(img);
                            imageStyles.set(index, {
                                objectFit: computedStyle.objectFit,
                                objectPosition: computedStyle.objectPosition,
                                width: computedStyle.width,
                                height: computedStyle.height,
                                borderRadius: computedStyle.borderRadius,
                                transform: computedStyle.transform
                            });
                        });

                        // Aplicar los estilos preservados a las imágenes clonadas
                        const clonedImages = clonedDoc.querySelectorAll('img');
                        clonedImages.forEach((img, index) => {
                            const styles = imageStyles.get(index);
                            if (styles) {
                                img.style.objectFit = styles.objectFit || 'cover';
                                img.style.objectPosition = styles.objectPosition || 'center';
                                img.style.width = styles.width;
                                img.style.height = styles.height;
                                img.style.borderRadius = styles.borderRadius;
                                img.style.transform = styles.transform;


                            }
                        });
                    } catch (e) {
                        console.warn('Error preservando estilos de imágenes:', e);

                        // Fallback básico
                        const images = clonedDoc.querySelectorAll('img');
                        images.forEach(img => {
                            img.style.objectFit = 'cover';
                            img.style.objectPosition = 'center';
                            if (!img.style.width) img.style.width = '100%';
                            if (!img.style.height) img.style.height = '100%';
                        });
                    }

                    // CRÍTICO: Preservar las fuentes originales del workspace de manera simplificada
                    // Intentar preservar fuentes de los elementos clonados directamente
                    const textElements = clonedDoc.querySelectorAll('[class*="text-"], p, span, div, h1, h2, h3, h4, h5, h6, [contenteditable]');
                    textElements.forEach(el => {
                        // Preservar las clases originales que pueden contener información de fuentes
                        const originalClasses = el.className;
                        if (originalClasses) {
                            el.className = originalClasses;
                        }

                        // Mantener las fuentes inline si existen
                        const computedStyle = getComputedStyle ? getComputedStyle(el) : null;
                        if (computedStyle) {
                            if (computedStyle.fontFamily && computedStyle.fontFamily !== 'Arial') {
                                el.style.fontFamily = computedStyle.fontFamily;
                            }
                            if (computedStyle.fontSize) {
                                el.style.fontSize = computedStyle.fontSize;
                            }
                            if (computedStyle.fontWeight) {
                                el.style.fontWeight = computedStyle.fontWeight;
                            }
                            if (computedStyle.fontStyle) {
                                el.style.fontStyle = computedStyle.fontStyle;
                            }
                        }
                    });

                    // CSS adicional para asegurar backgrounds y fuentes
                    const style = clonedDoc.createElement('style');
                    style.textContent = `
                        /* Preservar fuentes originales y NO forzar Arial */
                        * { 
                            -webkit-font-smoothing: antialiased !important;
                            -moz-osx-font-smoothing: grayscale !important;
                        }
                        
                        /* CRÍTICO: Asegurar que las imágenes mantengan cover + CALIDAD HD */
                        img {
                            object-fit: cover !important;
                            object-position: center !important;
                            image-rendering: -webkit-optimize-contrast !important;
                            image-rendering: crisp-edges !important;
                            image-rendering: high-quality !important;
                        }
                        
                        /* CRÍTICO: Asegurar que los backgrounds de página se mantengan en cover */
                        [id^="page-"] {
                            background-size: cover !important;
                            background-position: center !important;
                            background-repeat: no-repeat !important;
                        }
                        
                        /* Asegurar que los elementos de texto mantengan sus fuentes */
                        [class*="text-"], p, span, div, h1, h2, h3, h4, h5, h6 {
                            font-family: inherit !important;
                        }
                    `;
                    clonedDoc.head.appendChild(style);
                }
            };

            // Capturar con html2canvas
            const canvas = await html2canvas(workspaceElement, options);

            // Redimensionar si es necesario
            if (size.width !== canvas.width || size.height !== canvas.height) {
                const resizeCanvas = document.createElement('canvas');
                resizeCanvas.width = size.width;
                resizeCanvas.height = size.height;
                const ctx = resizeCanvas.getContext('2d');

                // Calcular dimensiones manteniendo aspecto
                const aspect = canvas.width / canvas.height;
                const targetAspect = size.width / size.height;

                let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

                if (aspect > targetAspect) {
                    drawWidth = size.width;
                    drawHeight = size.width / aspect;
                    offsetY = (size.height - drawHeight) / 2;
                } else {
                    drawHeight = size.height;
                    drawWidth = size.height * aspect;
                    offsetX = (size.width - drawWidth) / 2;
                }

                // Fondo
                ctx.fillStyle = pages[pageIndex]?.backgroundColor || '#ffffff';
                ctx.fillRect(0, 0, size.width, size.height);

                // Dibujar imagen redimensionada
                ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);

                const dataUrl = resizeCanvas.toDataURL('image/png', 1.0); // 🚀 Máxima calidad

                // Restaurar página original
                if (pageIndex !== originalPage) {
                    setCurrentPage(originalPage);
                }

                return dataUrl;
            }

            // Restaurar página original
            if (pageIndex !== originalPage) {
                setCurrentPage(originalPage);
            }

            return canvas.toDataURL('image/png', 1.0); // 🚀 Máxima calidad

        } catch (error) {
            console.error('❌ Error generando thumbnail de alta calidad:', error);
            return null;
        }
    }, [pages, currentPage, setCurrentPage]);

    // Actualizar dimensiones cuando cambie el preset o el tamaño del workspace
    useEffect(() => {
        const dimensions = getWorkspaceDimensions();
        setWorkspaceDimensions(dimensions);
    }, [presetData, workspaceSize]);

    // Actualizar dimensiones cuando cambie el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => {
            const dimensions = getWorkspaceDimensions();
            setWorkspaceDimensions(dimensions);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [presetData, workspaceSize]);

    // ⚡ useEffect optimizado para generar thumbnail de página actual
    useEffect(() => {
        if (pages[currentPage] && !pageThumbnails[pages[currentPage].id]) {
            // Generar thumbnail solo de la página actual con delay para estabilidad
            const timeoutId = setTimeout(() => {
                generateCurrentPageThumbnail();
            }, 500); // Delay para asegurar que el DOM se haya actualizado

            return () => clearTimeout(timeoutId);
        }
    }, [currentPage, pages, pageThumbnails, generateCurrentPageThumbnail]);

    // useEffect para verificar imagen de fondo (solo cuando cambia la página o la imagen)
    useEffect(() => {
        const currentPageData = pages[currentPage];

        if (currentPageData?.backgroundImage) {
            // Verificar si la imagen existe mediante fetch (solo una vez por imagen)
            fetch(currentPageData.backgroundImage, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        console.log('✅ [WORKSPACE] Imagen existe en el servidor');
                    } else {
                        console.error('❌ [WORKSPACE] Imagen NO existe en el servidor. Status:', response.status);
                    }
                })
                .catch(error => {
                    console.error('❌ [WORKSPACE] Error verificando imagen:', error);
                });
        }
    }, [currentPage, pages[currentPage]?.backgroundImage]);

    // useEffect para limpiar miniaturas cuando cambian dimensiones significativamente
    useEffect(() => {
        const dimensionsKey = `${workspaceDimensions.width}x${workspaceDimensions.height}`;
        const lastDimensionsKey = sessionStorage.getItem('lastWorkspaceDimensions');

        if (lastDimensionsKey && lastDimensionsKey !== dimensionsKey && pages.length > 0) {
            setPageThumbnails({});

            // Generar nueva miniatura para la página actual después de un delay
            setTimeout(() => {
                if (pages[currentPage]) {
                    generateImmediateThumbnail();
                }
            }, 800);
        }

        sessionStorage.setItem('lastWorkspaceDimensions', dimensionsKey);
    }, [workspaceDimensions.width, workspaceDimensions.height]);

    // 🚀 Sistema de guardado inteligente en segundo plano
    useEffect(() => {
        if (!projectData?.id || pages.length === 0) return;

        let autoSaveTimer;
        let lastActivityTime = Date.now();
        let hasUnsavedChanges = false;

        // Función para detectar cambios en el proyecto
        const detectChanges = () => {
            hasUnsavedChanges = true;
            lastActivityTime = Date.now();
        };

        // Función de guardado silencioso en segundo plano
        const performSilentAutoSave = async () => {
            if (!hasUnsavedChanges) return;

            try {
                console.log('🔄 [AUTO-SAVE] Iniciando guardado silencioso en segundo plano...');

                // Actualizar estado de guardado
                setAutoSave(prev => ({ ...prev, saveStatus: 'saving' }));

                // Realizar guardado usando la API directamente (sin depender de autoSaveToDatabase)
                const response = await fetch(`/api/projects/${projectData.id}/save`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({
                        pages: pages,
                        force: false // Guardado ligero
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Marcar como guardado
                    hasUnsavedChanges = false;
                    setAutoSaveState(prev => ({
                        ...prev,
                        saveStatus: 'saved',
                        lastAutoSaved: new Date(),
                        hasUnsavedChanges: false
                    }));

                    console.log('✅ [AUTO-SAVE] Guardado silencioso completado');
                } else {
                    throw new Error('Guardado falló');
                }

            } catch (error) {
                console.error('❌ [AUTO-SAVE] Error en guardado silencioso:', error);
                setAutoSaveState(prev => ({
                    ...prev,
                    saveStatus: 'error',
                    saveError: error.message
                }));
            }
        };

        // Configurar timer de guardado automático (cada 3 minutos si hay cambios)
        const startAutoSaveTimer = () => {
            autoSaveTimer = setInterval(() => {
                const timeSinceLastActivity = Date.now() - lastActivityTime;

                // Solo guardar si:
                // 1. Hay cambios sin guardar
                // 2. Han pasado al menos 1 minuto desde la última actividad (usuario no está editando activamente)
                // 3. No hay un guardado en progreso
                if (hasUnsavedChanges &&
                    timeSinceLastActivity > 60000) {

                    console.log('⏰ [AUTO-SAVE] Condiciones cumplidas para guardado automático');
                    performSilentAutoSave();
                }
            }, 3 * 60 * 1000); // 3 minutos
        };

        // Detectar cambios en pages, currentPage, o elementos
        const pagesString = JSON.stringify(pages);
        const currentPageData = pages[currentPage];

        // Marcar que hay cambios cuando se detecten
        detectChanges();

        // Iniciar el timer de guardado automático
        startAutoSaveTimer();

        // Cleanup
        return () => {
            if (autoSaveTimer) {
                clearInterval(autoSaveTimer);
            }
        };
    }, [pages, currentPage, projectData?.id]); // Removemos autoSaveToDatabase para evitar error de inicialización

    // Detectar cambios específicos en elementos de la página actual
    useEffect(() => {
        if (!pages[currentPage]) return;

        const currentPageElements = pages[currentPage].cells?.flatMap(cell => cell.elements) || [];
        const elementsString = JSON.stringify(currentPageElements);

        // Actualizar estado de cambios sin guardar
        setAutoSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));

    }, [pages[currentPage]?.cells, currentPage]);

    // Añade estos estados al principio del componente EditorLibro
    const [textToolbarVisible, setTextToolbarVisible] = useState(false);
    const [textEditingOptions, setTextEditingOptions] = useState({
        elementId: null,
        cellId: null,
    });
    const [isBookPreviewOpen, setIsBookPreviewOpen] = useState(false);
    const [showProgressRecovery, setShowProgressRecovery] = useState(false);
    const [savedProgress, setSavedProgress] = useState(null);
    
    // 🚀 NUEVOS ESTADOS: Para animación de carga del modal de álbum
    const [albumLoadingState, setAlbumLoadingState] = useState({
        isLoading: false,
        loadedImages: 0,
        totalImages: 0,
        message: ''
    });

    // 🎭 NUEVO ESTADO: Modal de preparación con experiencia única
    const [albumPreparationModal, setAlbumPreparationModal] = useState({
        isOpen: false,
        phase: 'preparing', // 'preparing', 'processing', 'finalizing', 'ready'
        progress: 0,
        message: 'Iniciando experiencia de álbum...',
        subMessage: 'Preparando tu vista previa personalizada'
    });

    // Estado para el input de carga de imágenes
    const imageInputRef = useRef(null);

    // Función para añadir un elemento de imagen al lienzo
    const addImageElement = (imageUrl) => {
        const targetCell = selectedCell || pages[currentPage]?.cells[0]?.id;
        if (!targetCell) return;

        const newElement = {
            id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'image',
            content: imageUrl,
            position: { x: 0.1, y: 0.1 },
            size: { width: 0.3, height: 0.3 },
            filters: {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                tint: 0,
                hue: 0,
                blur: 0,
                scale: 1,
                rotate: 0,
                opacity: 100,
                blendMode: "normal",
            },
            mask: 'none',
            zIndex: (pages[currentPage].cells.find(cell => cell.id === targetCell)?.elements?.length || 0) + 1,
        };

        addElementToCell(targetCell, newElement);
        toast.success('Imagen añadida correctamente');

        // NO recargar imágenes del proyecto aquí para evitar re-renders innecesarios
    };

    // Función para cargar las imágenes del proyecto con throttling (ULTRA OPTIMIZADA)
    const loadProjectImages = useCallback(
        debounce(async (forceRefresh = false) => {
            if (!projectData?.id) return;

            // 🚀 OPTIMIZACIÓN: Verificar cache primero
            const cachedImages = imageCache.get(projectData.id);
            if (!forceRefresh && cachedImages && cachedImages.length > 0) {
                console.log('🔄 Usando imágenes desde cache');
                if (projectImages.length === 0) {
                    setProjectImages(cachedImages);
                }
                return;
            }

            // 🚀 OPTIMIZACIÓN: Evitar múltiples cargas simultáneas
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }

            if (projectImagesLoading && !forceRefresh) {
                console.log('⏳ Carga de imágenes ya en progreso');
                return;
            }

            setProjectImagesLoading(true);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                const response = await fetch(`/api/canvas/projects/${projectData.id}/images`, {
                    method: 'GET',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();

                if (result.success) {
                    const images = result.images || [];
                    
                    // 🚀 OPTIMIZACIÓN: Solo actualizar si hay cambios reales
                    const currentImagesStr = JSON.stringify(projectImages);
                    const newImagesStr = JSON.stringify(images);
                    
                    if (currentImagesStr !== newImagesStr) {
                        setProjectImages(images);
                        
                        // 🚀 OPTIMIZACIÓN: Actualizar cache de forma eficiente
                        setImageCache(prevCache => {
                            const newCache = new Map(prevCache);
                            newCache.set(projectData.id, images);
                            
                            // Limpiar cache viejo si hay más de 5 proyectos
                            if (newCache.size > 5) {
                                const oldestKey = newCache.keys().next().value;
                                newCache.delete(oldestKey);
                            }
                            
                            return newCache;
                        });
                    }
                } else {
                    console.error('Error cargando imágenes:', result.message);
                    toast.error('Error cargando galería de imágenes');
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.warn('⚠️ Carga de imágenes cancelada por timeout');
                } else {
                    console.error('Error cargando imágenes del proyecto:', error);
                    toast.error('Error de conexión al cargar imágenes');
                }
            } finally {
                setProjectImagesLoading(false);
            }
        }, 200), // 200ms debounce para evitar spam
        [projectData?.id, imageCache, projectImages, projectImagesLoading]
    );

    // Función para manejar la carga de imágenes (OPTIMIZADA)
    const handleImageUpload = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file || !projectData?.id) return;

        // 🚀 OPTIMIZACIÓN: Mostrar feedback inmediato
        const loadingToast = toast.loading('Subiendo imagen...', {
            description: 'Procesando imagen, esto puede tomar unos segundos'
        });

        // 🚀 OPTIMIZACIÓN: Crear imagen local optimizada inmediatamente
        const imageUrl = URL.createObjectURL(file);
        const tempImage = {
            id: `temp-${Date.now()}`,
            filename: file.name,
            url: imageUrl,
            thumbnail_url: imageUrl,
            has_thumbnail: false,
            size: file.size,
            last_modified: Date.now() / 1000,
            created_at: new Date().toISOString(),
            isTemporary: true
        };

        // 🚀 OPTIMIZACIÓN: Añadir imagen temporalmente al estado para feedback inmediato
        setProjectImages(prev => [tempImage, ...prev]);
        
        // 🚀 OPTIMIZACIÓN: Añadir al canvas inmediatamente para mejor UX
        addImageElement(imageUrl);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('projectId', projectData.id);

        try {
            const response = await fetch('/api/canvas/editor/upload-image', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                // 🚀 OPTIMIZACIÓN: Reemplazar imagen temporal con la real
                const finalImage = {
                    id: result.id || Date.now(),
                    filename: file.name,
                    url: result.url,
                    thumbnail_url: result.thumbnail_url || result.url,
                    has_thumbnail: result.has_thumbnail || false,
                    size: file.size,
                    last_modified: Date.now() / 1000,
                    created_at: new Date().toISOString()
                };

                setProjectImages(prev => [
                    finalImage,
                    ...prev.filter(img => img.id !== tempImage.id)
                ]);

                // 🚀 OPTIMIZACIÓN: Actualizar el elemento en el canvas con la URL final
                setTimeout(() => {
                    setPages(prevPages => {
                        const updatedPages = [...prevPages];
                        const currentPageData = updatedPages[currentPage];
                        
                        // Buscar y actualizar el elemento con la imagen temporal
                        currentPageData.cells.forEach(cell => {
                            cell.elements.forEach(element => {
                                if (element.type === 'image' && element.content === imageUrl) {
                                    element.content = result.url;
                                }
                            });
                        });
                        
                        return updatedPages;
                    });
                }, 100);

                toast.dismiss(loadingToast);
                toast.success(result.has_thumbnail ? 
                    'Imagen subida y optimizada correctamente' : 
                    'Imagen subida correctamente'
                );

                // 🚀 OPTIMIZACIÓN: Refresh de galería en background sin bloquear UI
                setTimeout(() => {
                    loadProjectImages(true);
                }, 2000);
            } else {
                // 🚀 OPTIMIZACIÓN: Limpiar imagen temporal en caso de error
                setProjectImages(prev => prev.filter(img => img.id !== tempImage.id));
                URL.revokeObjectURL(imageUrl);
                
                toast.dismiss(loadingToast);
                toast.error(result.message || 'Error al subir la imagen');
            }
        } catch (error) {
            console.error('Error subiendo la imagen:', error);
            
            // 🚀 OPTIMIZACIÓN: Limpiar imagen temporal en caso de error
            setProjectImages(prev => prev.filter(img => img.id !== tempImage.id));
            URL.revokeObjectURL(imageUrl);
            
            toast.dismiss(loadingToast);
            toast.error('Error de red al subir la imagen');
        }
    }, [projectData?.id, currentPage, addImageElement, loadProjectImages]);

    // Cargar imágenes cuando se carga el proyecto (con debounce)
    useEffect(() => {
        if (projectData?.id) {
            // Primero verificar si tenemos imágenes en cache
            const cachedImages = imageCache.get(projectData.id);
            if (cachedImages && cachedImages.length > 0) {
                setProjectImages(cachedImages);
                return;
            }

            loadingTimeoutRef.current = setTimeout(() => {
                loadProjectImages(false); // No forzar refresh inicial
            }, 150); // Pequeño delay para evitar múltiples cargas

            return () => {
                if (loadingTimeoutRef.current) {
                    clearTimeout(loadingTimeoutRef.current);
                }
            };
        }
    }, [projectData?.id, imageCache]);

    // Cleanup effect para evitar memory leaks
    useEffect(() => {
        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
    }, []);

    // 🚀 Añadir elemento sin seleccionarlo automáticamente (para galería de imágenes)
    const addElementToCellWithoutSelection = (cellId, element) => {
        console.log('🖼️ [ADD-IMAGE] Agregando imagen sin selección automática');
        
        // 🚀 PROTECCIÓN: Asegurar que tenemos páginas válidas
        if (!pages || pages.length === 0 || !pages[currentPage]) {
            console.error('❌ [ADD-IMAGE] No hay páginas válidas para agregar imagen');
            return;
        }
        
        // 🚀 PROTECCIÓN: Crear una copia profunda para evitar mutaciones
        const updatedPages = JSON.parse(JSON.stringify(pages));
        
        // Encontrar y actualizar solo la celda correcta
        let cellFound = false;
        for (let i = 0; i < updatedPages[currentPage].cells.length; i++) {
            if (updatedPages[currentPage].cells[i].id === cellId) {
                updatedPages[currentPage].cells[i].elements.push(element);
                cellFound = true;
                console.log('✅ [ADD-IMAGE] Imagen agregada a la celda:', cellId);
                break;
            }
        }
        
        if (!cellFound) {
            console.error('❌ [ADD-IMAGE] Celda no encontrada:', cellId);
            return;
        }
        
        // 🚀 PROTECCIÓN: Usar setTimeout para evitar conflictos de estado
        setTimeout(() => {
            updatePages(updatedPages);
            console.log('✅ [ADD-IMAGE] Estado actualizado sin selección automática');
        }, 0);
    };

    // Función para añadir imagen desde la galería
    const addImageFromGallery = useCallback((imageUrl) => {
        console.log('🖼️ [ADD-FROM-GALLERY] Iniciando proceso de agregar imagen:', imageUrl);
        
        // 🚀 PROTECCIÓN CRÍTICA: Bloquear temporalmente el sistema de recuperación
        const originalProgress = hasInitializedProgress;
        setHasInitializedProgress(true);
        
        // 🚀 PROTECCIÓN: No cambiar de tab si ya estamos en 'images'
        const wasInImagesTab = activeTab === 'images';
        
        const targetCell = selectedCell || pages[currentPage]?.cells[0]?.id;
        if (!targetCell) {
            console.error('❌ [ADD-FROM-GALLERY] No hay celda disponible');
            toast.error('No hay celda disponible para agregar la imagen');
            setHasInitializedProgress(originalProgress); // Restaurar estado
            return;
        }

        // 🚀 PROTECCIÓN: Validar que la imagen URL es válida
        if (!imageUrl || typeof imageUrl !== 'string') {
            console.error('❌ [ADD-FROM-GALLERY] URL de imagen inválida');
            toast.error('URL de imagen no válida');
            setHasInitializedProgress(originalProgress); // Restaurar estado
            return;
        }

        // 🚀 PROTECCIÓN: Crear una copia profunda de las páginas actuales ANTES de modificar
        const currentPagesSnapshot = JSON.parse(JSON.stringify(pages));
        console.log('📸 [ADD-FROM-GALLERY] Snapshot del estado actual capturado');

        const newElement = {
            id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'image',
            content: imageUrl,
            position: { x: 0.1, y: 0.1 },
            size: { width: 0.3, height: 0.3 },
            filters: {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                tint: 0,
                hue: 0,
                blur: 0,
                scale: 1,
                rotate: 0,
                opacity: 100,
                blendMode: "normal",
            },
            mask: 'none',
            zIndex: (currentPagesSnapshot[currentPage].cells.find(cell => cell.id === targetCell)?.elements?.length || 0) + 1,
        };

        console.log('📝 [ADD-FROM-GALLERY] Elemento creado:', newElement);

        // 🚀 PROTECCIÓN: Usar setTimeout múltiples para evitar conflictos de estado
        setTimeout(() => {
            // Primer paso: Agregar elemento sin seleccionarlo
            addElementToCellWithoutSelection(targetCell, newElement);
            
            setTimeout(() => {
                // Segundo paso: Restaurar tab si es necesario
                if (wasInImagesTab) {
                    setActiveTab('images');
                    console.log('🔄 [ADD-FROM-GALLERY] Tab restaurado a images');
                }
                
                setTimeout(() => {
                    // Tercer paso: Restaurar protección y mostrar éxito
                    setHasInitializedProgress(originalProgress);
                    toast.success('✅ Imagen añadida desde la galería');
                    console.log('✅ [ADD-FROM-GALLERY] Proceso completado exitosamente');
                }, 50);
            }, 50);
        }, 50);
    }, [activeTab, selectedCell, pages, currentPage, hasInitializedProgress, addElementToCellWithoutSelection]);



    // �️ FUNCIÓN PARA PROCESAR Y GUARDAR IMÁGENES EN EL SERVIDOR
    const processAndSaveImages = useCallback(async (pages, projectId) => {
        const processedPages = [];
        const imagesToUpload = [];

        for (const page of pages) {
            const processedPage = { ...page };

            if (page.cells) {
                processedPage.cells = [];

                for (const cell of page.cells) {
                    const processedCell = { ...cell };

                    if (cell.elements) {
                        processedCell.elements = [];

                        for (const element of cell.elements) {
                            if (element.type === 'image' && element.content?.startsWith('data:image/')) {
                                // Detectar imagen en base64
                                const imageId = `${element.id}_${Date.now()}`;
                                const filename = `${imageId}.png`;

                                // Extraer el tipo de imagen y los datos
                                const matches = element.content.match(/^data:image\/([^;]+);base64,(.+)$/);
                                if (matches) {
                                    const imageType = matches[1];
                                    const imageData = matches[2];
                                    const extension = imageType === 'jpeg' ? 'jpg' : imageType;
                                    const finalFilename = `${imageId}.${extension}`;

                                    // Agregar a la lista de imágenes para subir
                                    imagesToUpload.push({
                                        filename: finalFilename,
                                        data: imageData,
                                        type: imageType,
                                        elementId: element.id
                                    });

                                    // Reemplazar el contenido por una ruta temporal (se actualizará después)
                                    processedCell.elements.push({
                                        ...element,
                                        content: element.content, // Mantener base64 temporalmente
                                        _wasBase64: true,
                                        _originalSize: element.content.length,
                                        _elementId: element.id // Para mapear después
                                    });

                                } else {
                                    // Si no coincide el patrón, mantener como está
                                    processedCell.elements.push(element);
                                }
                            } else {
                                // Elemento que no es imagen base64, mantener como está
                                processedCell.elements.push(element);
                            }
                        }
                    }

                    processedPage.cells.push(processedCell);
                }
            }

            processedPages.push(processedPage);
        }

        // 🚀 SUBIR TODAS LAS IMÁGENES AL SERVIDOR
        if (imagesToUpload.length > 0) {

            try {
                const uploadResponse = await fetch(`/api/canvas/projects/${projectId}/upload-images`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        images: imagesToUpload
                    })
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();

                    // 🔄 ACTUALIZAR LAS URLs CON LAS RESPUESTAS DEL SERVIDOR
                    if (uploadResult.uploadedImages) {
                        // Crear mapa de elementId -> URL del servidor
                        const elementToUrlMap = new Map();
                        uploadResult.uploadedImages.forEach(uploadedImg => {
                            elementToUrlMap.set(uploadedImg.elementId, uploadedImg.url);
                        });

                        // Actualizar las páginas procesadas con las URLs del servidor
                        for (const page of processedPages) {
                            if (page.cells) {
                                for (const cell of page.cells) {
                                    if (cell.elements) {
                                        for (const element of cell.elements) {
                                            if (element._wasBase64 && element._elementId && elementToUrlMap.has(element._elementId)) {
                                                element.content = elementToUrlMap.get(element._elementId);
                                                // Limpiar propiedades temporales
                                                delete element._elementId;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    const errorData = await uploadResponse.json().catch(() => ({ message: 'Error desconocido en upload' }));
                    console.error('❌ [IMAGE-UPLOAD] Error subiendo imágenes:', errorData);

                    // En caso de error, conservar las imágenes base64 originales
                    return pages; // Retornar páginas originales sin procesar
                }
            } catch (uploadError) {
                console.error('❌ [IMAGE-UPLOAD] Error de red subiendo imágenes:', uploadError);
                return pages; // Retornar páginas originales sin procesar
            }
        }

        return processedPages;
    }, []);

    // 💾 SISTEMA DE GUARDADO AUTOMÁTICO OPTIMIZADO - Con procesamiento de imágenes
    const autoSaveToDatabase = useCallback(async (pagesToSave = pages, force = false) => {
        if (!projectData?.id || (!force && pagesToSave.length === 0)) return;

        try {

            // 🖼️ PASO 1: Procesar y subir imágenes al servidor
            const optimizedPages = await processAndSaveImages(pagesToSave, projectData.id);

            // CORRECCIÓN: Preparar datos según la estructura que espera ProjectSaveController
            const designData = {
                pages: optimizedPages,
                currentPage: currentPage,
                workspaceDimensions: workspaceDimensions,
                workspaceSize: workspaceSize,
                selectedElement: selectedElement,
                selectedCell: selectedCell,
                history: history.slice(-5), // Mantener más historial ya que las imágenes están optimizadas
                historyIndex: Math.min(historyIndex, 4),
                timestamp: new Date().toISOString(),
                version: '2.0', // Nueva versión con imágenes en servidor
                project: {
                    id: projectData.id,
                    name: itemData?.name || 'Álbum Personalizado',
                    item_id: itemData?.id,
                    preset_id: presetData?.id
                }
            };

            // CORRECCIÓN: Enviar thumbnails base64 al backend para que los convierta a archivos
            const requestData = {
                design_data: designData,
                thumbnails: pageThumbnails // Enviar thumbnails base64 para conversión
            };

            // 📊 Calcular tamaño final (debería ser mucho menor ahora)
            const finalDataSize = JSON.stringify(requestData).length;
            const finalDataSizeMB = finalDataSize / (1024 * 1024);



            // 🚀 Enviar datos optimizados (sin verificación de tamaño extrema ya que están optimizados)
            const response = await fetch(`/api/canvas/projects/${projectData.id}/save-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                const result = await response.json();

                // Limpiar localStorage después de guardar en BD
                const storageKey = `editor_progress_project_${projectData.id}`;
                localStorage.removeItem(storageKey);

                // Limpiar cambios de todas las páginas que se guardaron exitosamente
                setPageChanges(prev => {
                    const newMap = new Map(prev);
                    // Si guardamos todas las páginas (force = true), limpiar todos los cambios
                    if (force) {
                        newMap.clear();
                    } else {
                        // Limpiar solo la página actual
                        newMap.delete(currentPage);
                    }
                    return newMap;
                });

                // 🖼️ Regenerar thumbnail de la página actual después de guardar
                if (pages && pages.length > 0) {
                    setTimeout(() => {
                        generateCurrentPageThumbnail().catch(error => {
                            console.warn('⚠️ Error regenerando thumbnail de página actual:', error);
                        });
                    }, 300);
                }

                return true;
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                console.error('❌ [AUTO-SAVE] Error guardando en BD:', errorData);
                return false;
            }

        } catch (error) {
            console.error('❌ [AUTO-SAVE] Error en auto-save con procesamiento de imágenes:', error);
            return false;
        }
    }, [pages, currentPage, workspaceDimensions, workspaceSize, selectedElement, selectedCell, history, historyIndex, projectData?.id, itemData?.name, itemData?.id, presetData?.id, pageThumbnails, processAndSaveImages, generateLocalThumbnails]);

    // 💾 Auto-save de respaldo cada 5 minutos (solo como respaldo)
    useEffect(() => {
        if (!projectData?.id) return;

        const backupAutoSaveInterval = setInterval(() => {
            if (pages.length > 0) {
                autoSaveToDatabase(pages, false);
            }
        }, 5 * 60 * 1000); // 5 minutos = 300,000ms

        return () => clearInterval(backupAutoSaveInterval);
    }, [autoSaveToDatabase, pages, projectData?.id]);

    // 🚫 DESHABILITADO: Auto-save automático cuando cambian las páginas
    // Ahora solo guardado manual + respaldo cada 5 minutos
    /*
    const debouncedAutoSave = useCallback(
        debounce(() => {
            if (pages.length > 0 && projectData?.id) {
                console.log('🔄 [AUTO-SAVE] Cambios detectados, guardando...');
                autoSaveToDatabase(pages, false);
            }
        }, 3000), // 3 segundos después del último cambio
        [autoSaveToDatabase, pages, projectData?.id]
    );

    useEffect(() => {
        debouncedAutoSave();
    }, [pages, debouncedAutoSave]);
    */

    // �️ Función para capturar thumbnails de todas las páginas
    const captureAllPageThumbnails = useCallback(async () => {
        if (!pages.length) return {};

        console.log('📸 [THUMBNAILS] Capturando thumbnails de todas las páginas...');
        const thumbnails = {};
        const originalPage = currentPage;

        try {
            // Capturar thumbnail de cada página
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                if (!page?.id) continue;

                try {
                    // Cambiar a la página para capturar su thumbnail
                    if (i !== currentPage) {
                        setCurrentPage(i);
                        // Esperar a que se renderice la página
                        await new Promise(resolve => setTimeout(resolve, 300));
                    }

                    // Capturar thumbnail de la página actual
                    const thumbnail = await captureCurrentWorkspace({ type: 'thumbnail' });
                    if (thumbnail) {
                        thumbnails[page.id] = thumbnail;
                        console.log(`✅ [THUMBNAILS] Thumbnail capturado para página ${i + 1}: ${page.id}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ [THUMBNAILS] Error capturando thumbnail para página ${page.id}:`, error);
                    // Mantener el thumbnail existente si hay error
                    if (pageThumbnails[page.id]) {
                        thumbnails[page.id] = pageThumbnails[page.id];
                    }
                }
            }

            // Regresar a la página original
            if (originalPage !== currentPage) {
                setCurrentPage(originalPage);
            }

            console.log(`✅ [THUMBNAILS] Capturados ${Object.keys(thumbnails).length} thumbnails de ${pages.length} páginas`);
            return thumbnails;

        } catch (error) {
            console.error('❌ [THUMBNAILS] Error capturando thumbnails:', error);
            // Regresar a la página original en caso de error
            if (originalPage !== currentPage) {
                setCurrentPage(originalPage);
            }
            return pageThumbnails; // Retornar thumbnails existentes
        }
    }, [pages, currentPage, setCurrentPage, captureCurrentWorkspace, pageThumbnails]);

    // �💾 FUNCIÓN DE GUARDADO MANUAL
    const saveProgressManually = useCallback(async () => {
        if (!projectData?.id || pages.length === 0) {
            toast.error('No hay datos para guardar');
            return false;
        }

        try {
            // 🖼️ PASO 1: Asegurar que la página actual tenga thumbnail
            console.log('📸 [SAVE] Generando thumbnail de página actual...');
            await generateCurrentPageThumbnail();

            // �️ PASO 2: Cargar thumbnails con nueva estructura
            await loadThumbnailsWithNewStructure();

            // �💾 PASO 3: Guardar el proyecto
            const success = await autoSaveToDatabase(pages, true); // force = true para guardado manual

            if (success) {
                toast.success('Progreso guardado exitosamente');
                return true;
            } else {
                toast.error('Error al guardar el progreso');
                return false;
            }
        } catch (error) {
            console.error('❌ [SAVE] Error al guardar el progreso:', error);
            toast.error('Error al guardar el progreso');
            return false;
        }
    }, [autoSaveToDatabase, pages, projectData?.id, workspaceDimensions, presetData, generateLocalThumbnails]);

    // Función simplificada para guardado desde la cola (con menos dependencias)
    const saveFromQueue = useCallback(async (pagesToSave) => {
        console.log('💾 [QUEUE-SAVE] Iniciando guardado desde cola...');
        console.log('🔍 [QUEUE-SAVE] Datos disponibles:', {
            projectId: projectData?.id,
            pagesCount: pagesToSave?.length,
            currentPage,
            hasDimensions: !!workspaceDimensions,
            hasThumbnails: !!pageThumbnails
        });

        if (!projectData?.id) {
            console.error('❌ [QUEUE-SAVE] No hay project ID');
            return false;
        }

        if (!pagesToSave || pagesToSave.length === 0) {
            console.error('❌ [QUEUE-SAVE] No hay páginas para guardar');
            return false;
        }

        try {
            // Preparar datos básicos para el guardado
            const designData = {
                pages: pagesToSave,
                currentPage: currentPage,
                workspaceDimensions: workspaceDimensions,
                timestamp: new Date().toISOString(),
                version: '2.0'
            };

            const requestData = {
                design_data: designData,
                thumbnails: pageThumbnails
            };

            console.log('📤 [QUEUE-SAVE] Enviando petición al servidor...');

            const response = await fetch(`/api/canvas/projects/${projectData.id}/save-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            console.log('📥 [QUEUE-SAVE] Respuesta del servidor:', response.status, response.statusText);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ [QUEUE-SAVE] Guardado exitoso desde cola:', result);
                return true;
            } else {
                const errorText = await response.text();
                console.error('❌ [QUEUE-SAVE] Error en respuesta del servidor:', response.status, errorText);
                return false;
            }
        } catch (error) {
            console.error('❌ [QUEUE-SAVE] Error guardando desde cola:', error);
            return false;
        }
    }, [projectData?.id, currentPage, workspaceDimensions, pageThumbnails]);

    // Función para procesar la cola de guardado en segundo plano (versión corregida)
    const processSaveQueue = useCallback(async () => {
        console.log('🔍 [SAVE-QUEUE] Verificando condiciones de procesamiento...', {
            isProcessingQueue,
            saveQueueLength: saveQueue.length
        });

        if (isProcessingQueue) {
            console.log('⚠️ [SAVE-QUEUE] Ya se está procesando, saltando...');
            return;
        }

        if (saveQueue.length === 0) {
            console.log('⚠️ [SAVE-QUEUE] Cola vacía, no hay nada que procesar');
            return;
        }

        console.log('🚀 [SAVE-QUEUE] Iniciando procesamiento de cola...');
        setIsProcessingQueue(true);
        
        try {
            // Capturar la cola actual ANTES de limpiarla
            const currentQueue = saveQueue.slice();
            console.log('� [SAVE-QUEUE] Cola capturada para procesamiento:', currentQueue.length, 'elementos');
            
            // Ahora sí limpiar la cola
            setSaveQueue([]);
            console.log('🧹 [SAVE-QUEUE] Cola limpiada');
            
            for (const saveTask of currentQueue) {
                console.log('💾 [SAVE-QUEUE] Guardando página:', saveTask.pageIndex);
                
                const success = await saveFromQueue(saveTask.pages);
                
                if (success) {
                    // Marcar la página como guardada
                    setPageChanges(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(saveTask.pageIndex);
                        return newMap;
                    });
                    console.log('✅ [SAVE-QUEUE] Página guardada exitosamente:', saveTask.pageIndex);
                } else {
                    console.error('❌ [SAVE-QUEUE] Error guardando página:', saveTask.pageIndex);
                    // En caso de error, re-agregar a la cola para reintentar
                    setSaveQueue(prev => [...prev, saveTask]);
                }
            }
            
            console.log('✅ [SAVE-QUEUE] Cola de guardado procesada completamente');
        } catch (error) {
            console.error('❌ [SAVE-QUEUE] Error procesando cola:', error);
        } finally {
            setIsProcessingQueue(false);
            console.log('🔓 [SAVE-QUEUE] Procesamiento finalizado, isProcessingQueue = false');
        }
    }, [isProcessingQueue, saveQueue, saveFromQueue]);

    // Sistema simplificado de procesamiento automático
    useEffect(() => {
        // Solo procesar si hay elementos en la cola y no se está procesando
        console.log('🔄 [SAVE-QUEUE] useEffect trigger:', {
            saveQueueLength: saveQueue.length,
            isProcessingQueue,
            shouldProcess: saveQueue.length > 0 && !isProcessingQueue
        });

        if (saveQueue.length > 0 && !isProcessingQueue) {
            console.log('⏰ [SAVE-QUEUE] Cola detectada, procesando inmediatamente...');
            
            // Pequeño delay para evitar condiciones de carrera
            setTimeout(() => {
                processSaveQueue();
            }, 100);
        }
    }, [saveQueue.length, isProcessingQueue, processSaveQueue]);

    // Debug: Efecto para monitorear cambios en la cola
    useEffect(() => {
        console.log('📊 [SAVE-QUEUE] Estado de cola actualizado:', {
            longitud: saveQueue.length,
            elementos: saveQueue.map(item => `página ${item.pageIndex}`),
            procesando: isProcessingQueue
        });
    }, [saveQueue, isProcessingQueue]);

    // Función para agregar una página a la cola de guardado
    const addToSaveQueue = useCallback((pageIndex, pagesData) => {
        console.log('🔍 [SAVE-QUEUE] Intentando agregar página a cola:', pageIndex);
        
        // Usar función de estado para verificar cambios sin dependencias
        setPageChanges(currentPageChanges => {
            const changedPages = Array.from(currentPageChanges.keys());
            console.log('🔍 [SAVE-QUEUE] Cambios actuales:', changedPages.join(', ') || 'ninguno');
            
            if (!currentPageChanges.has(pageIndex)) {
                console.log('⚠️ [SAVE-QUEUE] No hay cambios para la página:', pageIndex, '- No se agregará a cola');
                return currentPageChanges; // Solo guardar si hay cambios
            }

            console.log('✅ [SAVE-QUEUE] Página tiene cambios, agregando a cola:', pageIndex);
            
            setSaveQueue(prev => {
                console.log('🔍 [SAVE-QUEUE] Cola actual antes de agregar:', prev.length, 'elementos');
                
                // Evitar duplicados
                const existingIndex = prev.findIndex(item => item.pageIndex === pageIndex);
                if (existingIndex !== -1) {
                    // Actualizar el elemento existente
                    const newQueue = [...prev];
                    newQueue[existingIndex] = { pageIndex, pages: pagesData, timestamp: Date.now() };
                    console.log('🔄 [SAVE-QUEUE] Actualizando elemento existente en cola');
                    return newQueue;
                } else {
                    // Agregar nuevo elemento
                    const newQueue = [...prev, { pageIndex, pages: pagesData, timestamp: Date.now() }];
                    console.log('➕ [SAVE-QUEUE] Agregando nuevo elemento a cola. Nueva longitud:', newQueue.length);
                    return newQueue;
                }
            });
            
            console.log('📤 [SAVE-QUEUE] Página agregada a cola:', pageIndex);
            return currentPageChanges; // Retornar sin cambios
        });
    }, []);

    // Función para cambiar de página con guardado automático
    const handlePageChange = useCallback(async (newPageIndex) => {
        console.log('🔄 [PAGE-CHANGE] Iniciando cambio de página de', currentPage, 'a', newPageIndex);
        
        if (newPageIndex === currentPage) {
            console.log('⚠️ [PAGE-CHANGE] Misma página, no se hace nada');
            return; // No hacer nada si es la misma página
        }

        // Verificar si la página actual tiene cambios sin guardar usando función de estado
        setPageChanges(currentPageChanges => {
            console.log('🔍 [PAGE-CHANGE] Verificando cambios en página actual:', currentPage);
            const changedPages = Array.from(currentPageChanges.keys());
            console.log('🔍 [PAGE-CHANGE] Páginas con cambios:', changedPages.join(', ') || 'ninguna');
            
            if (currentPageChanges.has(currentPage)) {
                console.log('💾 [PAGE-CHANGE] ✅ Página actual tiene cambios, guardando antes del cambio:', currentPage);
                
                // Agregar la página actual a la cola de guardado
                addToSaveQueue(currentPage, pages);
            } else {
                console.log('ℹ️ [PAGE-CHANGE] No hay cambios en la página actual:', currentPage);
            }
            return currentPageChanges; // Retornar sin cambios
        });

        // Cambiar directamente a la nueva página
        setCurrentPage(newPageIndex);
        console.log('📄 [PAGE-CHANGE] ✅ Página cambiada a:', newPageIndex);

    }, [currentPage, pages, addToSaveQueue]);

    // Función para obtener el storage key único basado en el proyecto
    const getStorageKey = () => {
        return `editor_progress_project_${projectData?.id}`;
    };

    // Función para verificar y cargar progreso guardado al inicializar
    const checkAndLoadSavedProgress = useCallback(async () => {
        if (!projectData?.id) return;

        // 🚀 PROTECCIÓN: No ejecutar si ya hay elementos en el workspace
        const hasWorkspaceContent = pages.some(page => 
            page.cells?.some(cell => 
                cell.elements?.length > 0
            )
        );
        
        if (hasWorkspaceContent) {
            console.log('⚠️ [RECOVERY] Ya hay contenido en el workspace, saltando recuperación automática');
            return;
        }

        try {
            // 1. Verificar localStorage primero
            const localProgress = autoSave.loadFromLocalStorage();

            // 2. Verificar base de datos
            const response = await fetch(`/api/canvas/projects/${projectData.id}/load-progress`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            let serverProgress = null;
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data?.design_data) {
                    serverProgress = result.data;
                }
            }

            // Determinar qué progreso usar (el más reciente)
            let progressToUse = null;

            if (localProgress && serverProgress) {
                const localTime = new Date(localProgress.savedAt).getTime();
                const serverTime = new Date(serverProgress.saved_at).getTime();
                progressToUse = localTime > serverTime ? localProgress : serverProgress;
            } else if (localProgress) {
                progressToUse = localProgress;
            } else if (serverProgress) {
                progressToUse = serverProgress;
            }

            // 🚀 CARGA AUTOMÁTICA: Cargar automáticamente el progreso más reciente sin modal
            if (progressToUse &&
                (progressToUse.pages?.length > 0 || progressToUse.design_data?.pages?.length > 0)) {

                // Verificar si el progreso es realmente más nuevo que el workspace actual
                const progressTime = new Date(progressToUse.savedAt || progressToUse.saved_at).getTime();
                const now = Date.now();
                const timeDiff = now - progressTime;
                
                // Solo cargar si el progreso es de los últimos 30 minutos
                if (timeDiff < 30 * 60 * 1000) {
                    console.log('🔄 [AUTO-RECOVERY] Cargando automáticamente el progreso más reciente');
                    toast.info('🔄 Cargando progreso guardado automáticamente...');
                    // Cargar automáticamente sin mostrar modal
                    handleLoadProgress(progressToUse);
                } else {
                    console.log('📅 [RECOVERY] Progreso muy antiguo, ignorando automáticamente');
                }
            }

        } catch (error) {
            console.error('❌ [RECOVERY] Error verificando progreso guardado:', error);
        }
    }, [projectData?.id, autoSave, pages]);

    // Cargar progreso guardado
    const handleLoadProgress = useCallback(async (progress) => {
        try {

            let pagesToLoad = [];

            // Determinar el formato del progreso
            if (progress.pages) {
                // Formato localStorage
                pagesToLoad = progress.pages;
            } else if (progress.design_data?.pages) {
                // Formato base de datos
                pagesToLoad = progress.design_data.pages;
            }

            if (pagesToLoad.length > 0) {
                setPages(pagesToLoad);

                // Actualizar el historial
                const newHistory = [JSON.stringify(pagesToLoad)];
                setHistory(newHistory);
                setHistoryIndex(0);

                // Regenerar thumbnails para las páginas cargadas
                setTimeout(() => {
                    setPageThumbnails({});
                }, 100);

                toast.success('✅ Progreso cargado exitosamente');
                
                // Cerrar el modal automáticamente si estaba abierto
                setShowProgressRecovery(false);
            }

        } catch (error) {
            console.error('❌ [RECOVERY] Error cargando progreso:', error);
            toast.error('Error al cargar el progreso guardado');
        }
    }, [setPages, setHistory, setHistoryIndex, setPageThumbnails]);

    // Descartar progreso guardado
    const handleDiscardProgress = useCallback(async () => {
        try {

            // Limpiar localStorage
            const storageKey = autoSave.getStorageKey();
            localStorage.removeItem(storageKey);

            toast.success('Progreso anterior eliminado');

        } catch (error) {
            console.error('❌ [RECOVERY] Error descartando progreso:', error);
        }
    }, [autoSave]);

    // Efecto para inicializar páginas cuando se cargan los datos del proyecto
    useEffect(() => {
        if (projectData && itemData && presetData) {
            // Si no hay páginas iniciales o initialProject, crear desde el preset
            if (!initialProject?.pages || initialProject.pages.length === 0) {
                createPagesFromPreset(presetData, itemData);
            }
            // Las páginas ya se configuran en el otro useEffect que maneja initialProject
        }
    }, [projectData, itemData, presetData, initialProject]);

    // Verificar progreso guardado cuando se cargan los datos del proyecto
    useEffect(() => {
        // 🚀 PROTECCIÓN: Solo ejecutar UNA VEZ al inicio, no cada vez que cambian las páginas
        if (projectData?.id && !isLoading && pages.length === 0 && !hasInitializedProgress) {
            setHasInitializedProgress(true);
            // Añadir un pequeño delay para asegurar que el componente esté completamente montado
            setTimeout(() => {
                checkAndLoadSavedProgress();
            }, 500);
        }
    }, [projectData?.id, isLoading, pages.length, checkAndLoadSavedProgress, hasInitializedProgress]);

    // Cargar thumbnails existentes cuando las páginas se cargan
    useEffect(() => {
        // Limpiar timeout anterior si existe
        if (thumbnailLoadTimeoutRef.current) {
            clearTimeout(thumbnailLoadTimeoutRef.current);
        }

        if (projectData?.id && pages.length > 0) {
            // Debounce de 500ms para evitar llamadas excesivas
            thumbnailLoadTimeoutRef.current = setTimeout(() => {
                loadThumbnailsWithNewStructure();
            }, 500);
        }

        // Cleanup al desmontar o cambiar dependencias
        return () => {
            if (thumbnailLoadTimeoutRef.current) {
                clearTimeout(thumbnailLoadTimeoutRef.current);
            }
        };
    }, [projectData?.id, pages.length]); // Removed loadThumbnailsWithNewStructure to avoid infinite loop

    // Función para crear páginas basadas en el preset
    const createPagesFromPreset = (preset, item) => {
        try {

            const newPages = [];
            const totalPages = item.pages || preset.pages || 20; // Usar páginas del preset primero


            // 1. PÁGINA DE PORTADA
            const coverBackgroundImage = item.cover_image ? `/storage/images/item/${item.cover_image}` : null;
            const coverBackgroundColor = !item.cover_image ? (preset.background_color || "#ffffff") : null;

            const coverPage = {
                id: "page-cover",
                type: "cover",
                layout: "layout-1",
                backgroundImage: coverBackgroundImage,
                backgroundColor: coverBackgroundColor,
                cells: [{
                    id: "cell-cover-1",
                    elements: [
                        // Título del álbum
                      
                    ]
                }]
            };

            newPages.push(coverPage);

            // 2. PÁGINAS DE CONTENIDO
            const contentBackgroundImage = item.content_image ? `/storage/images/item/${item.content_image}` : null;
            const contentBackgroundColor = !item.content_image ? (preset.background_color || "#ffffff") : null;


            for (let i = 1; i <= totalPages; i++) {
                const contentPage = {
                    id: `page-content-${i}`,
                    type: "content",
                    pageNumber: i,
                    layout: "layout-1",
                    backgroundImage: contentBackgroundImage,
                    backgroundColor: contentBackgroundColor,
                    cells: [{
                        id: `cell-content-${i}-1`,
                        elements: [

                        ]
                    }]
                };

                newPages.push(contentPage);
            }

            // 3. PÁGINA FINAL/CONTRAPORTADA
            const finalBackgroundImage = item.back_cover_image ? `/storage/images/item/${item.back_cover_image}` : null;
            const finalBackgroundColor = !item.back_cover_image ? (preset.background_color || "#ffffff") : null;

            const finalPage = {
                id: "page-final",
                type: "final",
                layout: "layout-1",
                backgroundImage: finalBackgroundImage,
                backgroundColor: finalBackgroundColor,
                cells: [{
                    id: "cell-final-1",
                    elements: [
                        // Texto de cierre
                        {
                            id: "final-text",
                            type: "text",
                            content: " ",
                            position: { x: 30, y: 45 },
                            size: { width: 40, height: 10 },
                            style: {
                                fontSize: "20px",
                                fontFamily: "Arial",
                                color: "#000000",
                                fontWeight: "bold",
                                textAlign: "center"
                            },
                            zIndex: 1
                        }
                    ]
                }]
            };

            newPages.push(finalPage);

            setPages(newPages);
            setCurrentPage(0); // Empezar en la portada

            // Configurar dimensiones del workspace basadas en el preset
            if (preset.width && preset.height) {
                setWorkspaceSize("preset");
            }

        } catch (error) {
            console.error('❌ Error creating pages:', error);
            setLoadError(error.message);
        }
    };

    // Función para obtener el título de la página actual
    const getCurrentPageTitle = () => {
        if (pages.length === 0) return "Cargando...";

        const page = pages[currentPage];
        if (!page) return "Página";
        switch (page.type) {
            case "cover":
                return "Portada";
            case "content":
                return `Página ${page.pageNumber}`;
            case "final":
                return "Contraportada";
            default:
                return `Página ${currentPage + 1}`;
        }
    };

    // Función para verificar si la página actual es editable
    const isCurrentPageEditable = () => {
        if (pages.length === 0) return false;
        const page = pages[currentPage];
        // La portada y contraportada tienen elementos bloqueados, pero se pueden agregar elementos
        return page?.type === "content";
    };

    // Memoize categorized pages for sidebar rendering to avoid re-filtering on every render
    const categorizedPages = useMemo(() => {
        return {
            cover: pages.filter(page => page.type === "cover"),
            content: pages.filter(page => page.type === "content"),
            final: pages.filter(page => page.type === "final")
        };
    }, [pages]);

    // Modifica la función getSelectedElement para que use useCallback
    const getSelectedElement = useCallback(() => {
        if (!selectedElement || !selectedCell || pages.length === 0) return null;

        const currentPageData = pages[currentPage];
        if (!currentPageData) return null;

        const cell = currentPageData.cells.find(
            (cell) => cell.id === selectedCell
        );
        if (!cell) return null;
        return cell.elements.find((el) => el.id === selectedElement);
    }, [selectedElement, selectedCell, pages, currentPage]);

    // Añade esta función para manejar la selección de elementos
    const handleSelectElement = (elementId, cellId) => {
        // Verificar si el elemento está bloqueado
        if (cellId) {
            const cell = pages[currentPage].cells.find(cell => cell.id === cellId);
            const element = cell?.elements.find(el => el.id === elementId);

            if (element?.locked) {
                // Mostrar mensaje temporal (opcional)
                const message = document.createElement('div');
                message.className = 'fixed top-4 right-4 bg-amber-100 border border-amber-400 text-amber-700 px-4 py-2 rounded-lg z-50';
                message.textContent = 'Este elemento es parte del diseño base y no se puede editar';
                document.body.appendChild(message);
                setTimeout(() => {
                    if (document.body.contains(message)) {
                        document.body.removeChild(message);
                    }
                }, 3000);
                return;
            }
        }

        // Siempre actualizar la celda seleccionada si se proporciona
        if (cellId) {
            setSelectedCell(cellId);
        }

        // Actualizar el elemento seleccionado
        setSelectedElement(elementId);

        // Manejo del toolbar
        if (elementId) {
            const cell = pages[currentPage].cells.find(
                (cell) => cell.id === (cellId || selectedCell)
            );
            const element = cell?.elements.find((el) => el.id === elementId);

            if (element?.type === "image") {
                setSelectedImage(element);
                // ✅ COMPLETAMENTE BLOQUEADO - NUNCA cambiar automáticamente a filtros
                // ✅ Solo establecer la imagen seleccionada para que esté disponible cuando vaya a filtros
                console.log('🖼️ Imagen seleccionada:', element.id, '- Tab actual mantenido:', activeTab);
                
                // 🛡️ ASEGURAR que NO se cambie a filtros automáticamente
                if (activeTab === 'filters') {
                    console.log('✅ Usuario ya está en filtros, manteniendo');
                } else {
                    console.log('✅ Imagen seleccionada, pero manteniendo tab actual:', activeTab);
                }
            } else if (element?.type === "text") {
                setTextToolbarVisible(true);
                setTextEditingOptions({
                    elementId,
                    cellId: cellId || selectedCell,
                });
                // Solo cambiar a text si no estamos ya en una sección específica
                if (activeTab !== 'filters' && activeTab !== 'images') {
                    setActiveTab('text');
                }
            } else {
                setTextToolbarVisible(false);
            }
        } else {
            setTextToolbarVisible(false);
            setSelectedImage(null);
        }
    };

    // Obtener el layout actual
    const getCurrentLayout = () => {
        if (pages.length === 0) return layouts[0];

        const currentPageData = pages[currentPage];
        if (!currentPageData) return layouts[0];

        return (
            layouts.find((layout) => layout.id === currentPageData.layout) ||
            layouts[0]
        );
    };

    // 🚀 OPTIMIZACIÓN: Función debounced para localStorage
    const debouncedSaveToLocalStorage = useCallback(
        debounce((pages) => {
            try {
                const storageKey = getStorageKey();
                const dataToSave = {
                    pages,
                    currentPage,
                    savedAt: Date.now(),
                };

                const dataString = JSON.stringify(dataToSave);
                const dataSizeKB = Math.round(dataString.length / 1024);

                if (dataSizeKB < 2048) {
                    localStorage.setItem(storageKey, dataString);
                } else {
                    console.warn(`⚠️ Datos demasiado grandes para localStorage (${dataSizeKB} KB)`);
                    localStorage.removeItem(storageKey);
                }
            } catch (error) {
                console.error('❌ Error guardando en localStorage:', error);
                if (error.name === 'QuotaExceededError') {
                    try {
                        localStorage.removeItem(getStorageKey());
                    } catch (cleanError) {
                        console.error('Error limpiando localStorage:', cleanError);
                    }
                }
            }
        }, 300), // 300ms debounce para evitar spam
        [currentPage, getStorageKey]
    );

    // Actualizar el estado de las páginas y guardar en localStorage (ULTRA OPTIMIZADO)
    const updatePages = useCallback((newPages) => {
        // 🚀 OPTIMIZACIÓN: Evitar actualizaciones innecesarias si las páginas son idénticas
        setPages(prevPages => {
            // 🚀 OPTIMIZACIÓN: Comparación rápida por referencia primero
            if (prevPages === newPages) {
                return prevPages;
            }
            
            // 🚀 OPTIMIZACIÓN: Comparación por contenido solo si es necesario
            const prevPagesStr = JSON.stringify(prevPages);
            const newPagesStr = JSON.stringify(newPages);
            
            if (prevPagesStr === newPagesStr) {
                console.log('🔄 [UPDATE-PAGES] Sin cambios, evitando actualización');
                return prevPages;
            }
            
            console.log('📝 [UPDATE-PAGES] Aplicando cambios...');
            
            // 🚀 OPTIMIZACIÓN: Usar requestAnimationFrame para operaciones no críticas
            requestAnimationFrame(() => {
                // Marcar la página actual como modificada
                setPageChanges(prev => {
                    const newMap = new Map(prev);
                    newMap.set(currentPage, Date.now());
                    return newMap;
                });
                
                // 🚀 OPTIMIZACIÓN: Invalidar thumbnail solo si hay cambios visuales reales
                if (newPages[currentPage]) {
                    const currentPageId = newPages[currentPage].id;
                    setPageThumbnails(prev => {
                        if (prev[currentPageId]) {
                            const updated = { ...prev };
                            delete updated[currentPageId];
                            return updated;
                        }
                        return prev;
                    });
                }
            });
            
            // 🚀 OPTIMIZACIÓN: Diferir operaciones de historial y localStorage
            setTimeout(() => {
                // Actualizar el historial de forma más eficiente
                setHistory(prevHistory => {
                    const newHistory = [
                        ...prevHistory.slice(0, historyIndex + 1),
                        newPagesStr,
                    ];
                    
                    // 🚀 OPTIMIZACIÓN: Limitar historial para evitar uso excesivo de memoria
                    if (newHistory.length > 50) {
                        return newHistory.slice(-50);
                    }
                    
                    return newHistory;
                });
                
                setHistoryIndex(prevIndex => {
                    const newIndex = prevIndex + 1;
                    return newIndex > 50 ? 49 : newIndex;
                });
            }, 0);
            
            return newPages;
        });
        
        // 🚀 OPTIMIZACIÓN: Guardar en localStorage con debounce agresivo
        debouncedSaveToLocalStorage(newPages);
    }, [currentPage, historyIndex, debouncedSaveToLocalStorage]);

    // Guardar currentPage en localStorage cuando cambie (con manejo de errores)
    useEffect(() => {
        try {
            const storageKey = getStorageKey();
            const dataToSave = {
                pages,
                currentPage,
                savedAt: Date.now(),
            };

            const dataString = JSON.stringify(dataToSave);
            const dataSizeKB = Math.round(dataString.length / 1024);

            if (dataSizeKB < 2048) {
                localStorage.setItem(storageKey, dataString);
            } else {
                console.warn(`⚠️ Datos demasiado grandes para localStorage (${dataSizeKB} KB), saltando guardado`);
            }
        } catch (error) {
            console.error('❌ Error guardando currentPage en localStorage:', error);
            if (error.name === 'QuotaExceededError') {
                try {
                    const storageKey = getStorageKey();
                    localStorage.removeItem(storageKey);
                } catch (cleanError) {
                    console.error('Error limpiando localStorage:', cleanError);
                }
            }
        }
    }, [currentPage, pages, getStorageKey]);
    // Función para exportar el proyecto como PDF usando el backend optimizado
    const handleExportPDF = async () => {
        if (!projectData?.id) {
            toast.error('No se ha cargado ningún proyecto.');
            return;
        }

        // Evitar múltiples ejecuciones simultáneas
        if (isPDFGenerating) {
            toast.warning('⏳ Ya se está generando un PDF. Por favor espera...');
            return;
        }

        // Activar estado de loading
        setIsPDFGenerating(true);

        // Mostrar loading con mensaje específico y información útil
        const loadingToast = toast.loading('🖨️ Generando PDF de alta calidad (300 DPI)...\n⏱️ Este proceso puede tomar varios minutos\n📁 El archivo se descargará automáticamente', {
            duration: 0 // No auto-dismiss
        });

        try {
            // Primero validar que el proyecto tenga contenido
            if (!pages || pages.length === 0) {
                toast.dismiss(loadingToast);
                toast.error('El proyecto no tiene páginas para exportar.');
                return;
            }

            // Verificar que las páginas tengan contenido real
            const pagesWithContent = pages.filter(page =>
                page.cells &&
                page.cells.length > 0 &&
                page.cells.some(cell =>
                    cell.elements &&
                    cell.elements.length > 0
                )
            );

            if (pagesWithContent.length === 0) {
                toast.dismiss(loadingToast);
                toast.error('Las páginas del proyecto están vacías. Agrega contenido antes de generar el PDF.');
                return;
            }



            // Configuración optimizada para PDFs grandes
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 300000); // 5 minutos de timeout

            const requestConfig = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    'Accept': 'application/pdf',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'same-origin',
                signal: controller.signal,
                body: JSON.stringify({
                    quality: 'high',
                    dpi: 300,
                    includeBackgrounds: true,
                    optimize: true,
                    pages: pagesWithContent,  // Enviar los datos completos de las páginas
                    projectData: {
                        id: projectData.id,
                        name: projectData.name,
                        design_data: {
                            pages: pagesWithContent
                        }
                    }
                })
            };

            // Actualizar mensaje de progreso
            toast.loading('📊 Procesando ' + pagesWithContent.length + ' páginas...\n⏱️ Por favor mantén esta pestaña abierta', {
                id: loadingToast
            });

            // Intentar la ruta de test que sabemos que funciona
            let response;

            // Usar URL absoluta para asegurar que vaya al servidor Laravel correcto
            const baseUrl = window.location.hostname === 'localhost' && window.location.port === '5174'
                ? 'http://127.0.0.1:8000'  // Si estamos en Vite dev server, usar Laravel server
                : '';  // Si estamos en servidor normal, usar ruta relativa



            try {
                response = await fetch(`${baseUrl}/api/test/projects/${projectData.id}/export/pdf`, requestConfig);

            } catch (networkError) {
                console.error('🚨 [PDF-EXPORT] Error de red:', {
                    error: networkError,
                    message: networkError.message,
                    name: networkError.name
                });

                if (networkError.name === 'AbortError') {
                    throw new Error('Timeout: El PDF está tardando demasiado en generarse. Intenta con menos páginas.');
                }

                console.warn('⚠️ [PDF-EXPORT] Error en ruta de test, intentando ruta autenticada...');
                // Si falla, intentar la ruta principal autenticada
                try {
                    response = await fetch(`${baseUrl}/api/customer/projects/${projectData.id}/export/pdf`, requestConfig);
                } catch (fallbackError) {
                    if (fallbackError.name === 'AbortError') {
                        throw new Error('Timeout: El PDF está tardando demasiado en generarse. Intenta con menos páginas.');
                    }

                    console.error('❌ [PDF-EXPORT] Todas las rutas fallaron:', fallbackError);
                    throw new Error(`Error de conexión al generar el PDF: ${fallbackError.message}`);
                }
            }

            // Limpiar timeout
            clearTimeout(timeoutId);

            // Si la ruta de test da 401 o 404, intentar ruta autenticada
            if (!response.ok && (response.status === 401 || response.status === 404)) {
                console.warn('⚠️ [PDF-EXPORT] Ruta de test falló, intentando ruta autenticada...');
                try {
                    const fallbackConfig = { ...requestConfig };
                    delete fallbackConfig.signal; // Nuevo request sin el signal anterior

                    response = await fetch(`${baseUrl}/api/customer/projects/${projectData.id}/export/pdf`, fallbackConfig);

                } catch (fallbackError) {
                    console.error('❌ [PDF-EXPORT] Ruta autenticada también falló:', fallbackError);
                    throw new Error('Error de conexión al generar el PDF. Verifica tu conexión a internet.');
                }
            }

            if (response.ok) {
                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('application/pdf')) {
                    // Actualizar mensaje de progreso para descarga
                    toast.loading('📦 Descargando PDF...\n⏬ Preparando archivo', {
                        id: loadingToast
                    });

                    try {
                        // Usar blob() directamente para evitar ERR_CONTENT_LENGTH_MISMATCH
                        const blob = await response.blob();

                        if (blob.size > 0) {
                            const fileName = `${projectData.name || 'proyecto'}_${new Date().toISOString().split('T')[0]}.pdf`;
                            const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);

                            // Disparar descarga
                            saveAs(blob, fileName);

                            // Limpiar loading toast y mostrar éxito
                            toast.dismiss(loadingToast);
                            toast.success(`✅ PDF descargado exitosamente!\n📄 Archivo: ${fileName}\n📦 Tamaño: ${fileSizeMB} MB\n📁 Ubicación: Carpeta de Descargas`, {
                                duration: 8000
                            });


                        } else {
                            console.error('❌ [PDF-EXPORT] PDF blob está vacío');
                            toast.dismiss(loadingToast);
                            toast.error('El PDF generado está vacío. Verifica que el proyecto tenga contenido.');
                        }
                    } catch (blobError) {
                        console.error('❌ [PDF-EXPORT] Error al procesar blob:', blobError);
                        toast.dismiss(loadingToast);
                        toast.error(`Error al procesar el PDF: ${blobError.message}`);
                    }
                } else {
                    // La respuesta no es un PDF, probablemente un error JSON
                    const errorData = await response.json();
                    const errorMessage = errorData.message || 'Error desconocido al generar el PDF.';
                    toast.dismiss(loadingToast);
                    toast.error(`❌ ${errorMessage}`);
                    console.error('❌ [PDF-EXPORT] Error del servidor:', errorData);
                }
            } else {
                // Error HTTP
                try {
                    const errorData = await response.json();
                    const errorMessage = errorData.message || `Error HTTP ${response.status}`;

                    toast.dismiss(loadingToast);

                    // Manejo específico para errores de autenticación
                    if (response.status === 401) {
                        toast.error('❌ Sesión expirada. Por favor, inicia sesión nuevamente.');
                    } else if (response.status === 403) {
                        toast.error('❌ No tienes permisos para exportar este proyecto.');
                    } else if (response.status === 404) {
                        toast.error('❌ Proyecto no encontrado. Verifica que el proyecto exista.');
                    } else if (response.status === 413) {
                        toast.error('❌ El proyecto es demasiado grande para generar PDF. Intenta reducir el número de páginas o imágenes.');
                    } else if (response.status === 500) {
                        toast.error('❌ Error del servidor. El proyecto puede ser demasiado complejo o grande.');
                    } else {
                        toast.error(`❌ ${errorMessage}`);
                    }

                    console.error('❌ [PDF-EXPORT] Error HTTP:', {
                        status: response.status,
                        error: errorData
                    });
                } catch (parseError) {
                    toast.dismiss(loadingToast);

                    // El servidor devolvió HTML en lugar de JSON (típico en páginas de error)
                    if (response.status === 404) {
                        toast.error('❌ Endpoint de PDF no encontrado. Verifica la configuración del servidor.');
                    } else if (response.status === 401) {
                        toast.error('❌ Sesión expirada. Por favor, inicia sesión nuevamente.');
                    } else if (response.status === 413) {
                        toast.error('❌ El proyecto es demasiado grande. Intenta reducir el contenido.');
                    } else {
                        toast.error(`❌ Error del servidor (${response.status}). El proyecto puede ser demasiado grande o complejo.`);
                    }
                    console.error('❌ [PDF-EXPORT] Error parseando respuesta de error:', parseError);
                }
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('❌ [PDF-EXPORT] Error de red:', error);

            if (error.message.includes('Timeout')) {
                toast.error('⏱️ ' + error.message);
            } else if (error.name === 'AbortError') {
                toast.error('❌ Operación cancelada. El PDF tardó demasiado en generarse.');
            } else {
                toast.error('❌ Error de conexión al generar el PDF. Verifica tu conexión a internet.');
            }
        } finally {
            // Desactivar estado de loading
            setIsPDFGenerating(false);
        }
    };

    // PDF RÁPIDO con thumbnails del backend
    const handleExportPDFFromBackendThumbnails = async () => {
        if (!projectData?.id) {
            toast.error('No se ha cargado ningún proyecto.');
            return;
        }

        if (isPDFGenerating) {
            toast.warning('⏳ Ya se está generando un PDF. Por favor espera...');
            return;
        }

        setIsPDFGenerating(true);
        const loadingToast = toast.loading('⚡ Generando PDF rápido...', { duration: 0 });

        try {


            // Opción 1: Intentar usar thumbnails existentes del frontend
            const hasExistingThumbnails = Object.keys(pageThumbnails).length > 0;

            if (hasExistingThumbnails) {

                // Crear PDF con thumbnails existentes
                const pdf = new jsPDF({
                    orientation: workspaceDimensions.width > workspaceDimensions.height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [workspaceDimensions.width, workspaceDimensions.height]
                });

                let pagesAdded = 0;
                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    const thumbnailUrl = pageThumbnails[page.id];

                    if (thumbnailUrl) {
                        try {
                            const img = new Image();
                            img.crossOrigin = 'anonymous';

                            await new Promise((resolve, reject) => {
                                img.onload = () => {
                                    resolve();
                                };
                                img.onerror = (error) => {
                                    reject(error);
                                };
                                img.src = thumbnailUrl;
                            });

                            if (pagesAdded > 0) pdf.addPage();
                            pdf.addImage(img, 'PNG', 0, 0, workspaceDimensions.width, workspaceDimensions.height);
                            pagesAdded++;

                        } catch (imgError) {
                            console.error(`❌ Error procesando página ${i + 1}:`, imgError);
                        }
                    } else {
                        console.warn(`⚠️ No hay thumbnail para página ${i + 1} (ID: ${page.id})`);
                    }
                }

                if (pagesAdded > 0) {
                    const fileName = `${projectData.name || 'proyecto'}_rapido_${new Date().toISOString().split('T')[0]}.pdf`;
                    pdf.save(fileName);

                    toast.dismiss(loadingToast);
                    toast.success(`⚡ PDF rápido generado: ${fileName} (${pagesAdded} páginas)`);
                    return;
                } else {
                    throw new Error('No se pudo procesar ninguna página');
                }
            }


            const response = await fetch(`/api/thumbnails/${projectData.id}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    pages: pages.map(page => ({
                        id: page.id,
                        type: page.type,
                        cells: page.cells,
                        layout: page.layout,
                        backgroundColor: page.backgroundColor,
                        backgroundImage: page.backgroundImage
                    })),
                    workspaceDimensions: workspaceDimensions,
                    quality: 300
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', errorText);
                throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (!data.thumbnails || Object.keys(data.thumbnails).length === 0) {
                throw new Error('El backend no devolvió thumbnails');
            }

            // Crear PDF con thumbnails del backend
            const pdf = new jsPDF({
                orientation: workspaceDimensions.width > workspaceDimensions.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [workspaceDimensions.width, workspaceDimensions.height]
            });

            let pagesAdded = 0;
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const thumbnailUrl = data.thumbnails[page.id];

                if (thumbnailUrl) {
                    try {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';

                        await new Promise((resolve, reject) => {
                            img.onload = () => {
                                resolve();
                            };
                            img.onerror = (error) => {
                                console.error(`❌ Error cargando imagen backend página ${i + 1}:`, error);
                                reject(error);
                            };
                            img.src = thumbnailUrl;
                        });

                        if (pagesAdded > 0) pdf.addPage();
                        pdf.addImage(img, 'PNG', 0, 0, workspaceDimensions.width, workspaceDimensions.height);
                        pagesAdded++;

                    } catch (imgError) {
                        console.error(`❌ Error procesando página ${i + 1}:`, imgError);
                    }
                } else {
                    console.warn(`⚠️ No hay thumbnail del backend para página ${i + 1} (ID: ${page.id})`);
                }
            }

            if (pagesAdded === 0) {
                throw new Error('No se pudo procesar ninguna página');
            }

            const fileName = `${projectData.name || 'proyecto'}_rapido_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            toast.dismiss(loadingToast);
            toast.success(`⚡ PDF rápido generado: ${fileName} (${pagesAdded} páginas)`);

        } catch (error) {
            console.error('❌ [PDF-THUMBNAILS] Error completo:', error);
            toast.dismiss(loadingToast);
            toast.error('❌ Error al generar PDF rápido: ' + error.message);
        } finally {
            setIsPDFGenerating(false);
        }
    };





    // Cambiar el layout de la página actual
    const changeLayout = (layoutId) => {
        const selectedLayout = layouts.find((l) => l.id === layoutId);
        if (!selectedLayout) return;

        const updatedPages = [...pages];
        const currentPageData = updatedPages[currentPage];

        // Crear nuevas celdas basadas en el layout seleccionado
        const newCells = Array.from({ length: selectedLayout.cells }).map(
            (_, index) => {
                const existingCell = currentPageData.cells[index];
                return (
                    existingCell || {
                        id: `cell-${currentPageData.id}-${index + 1}`,
                        elements: [],
                    }
                );
            }
        );

        updatedPages[currentPage] = {
            ...currentPageData,
            layout: layoutId,
            cells: newCells,
        };

        updatePages(updatedPages);
        setSelectedElement(null);
        setSelectedCell(null);
    };

    // Añadir una nueva página de contenido
    const addPage = () => {
        if (!presetData) return;

        // Encontrar el último número de página de contenido
        const contentPages = pages.filter(p => p.type === "content");
        const lastPageNumber = contentPages.length > 0
            ? Math.max(...contentPages.map(p => p.pageNumber))
            : 0;

        const newPageNumber = lastPageNumber + 1;
        const newPageId = `page-content-${newPageNumber}`;

        const newPage = {
            id: newPageId,
            type: "content",
            pageNumber: newPageNumber,
            layout: "layout-1",
            backgroundImage: itemData?.content_image ? `/storage/images/item/${itemData.content_image}` : null,
            backgroundColor: !itemData?.content_image ? (presetData?.background_color || "#ffffff") : null,
            cells: [{
                id: `cell-content-${newPageNumber}-1`,
                elements: [
                    // Número de página
                    {
                        id: `page-number-${newPageNumber}`,
                        type: "text",
                        content: `Página ${newPageNumber}`,
                        position: { x: 5, y: 5 },
                        size: { width: 20, height: 8 },
                        style: {
                            fontSize: "14px",
                            fontFamily: "Arial",
                            color: "#666666",
                            textAlign: "left"
                        },
                        zIndex: 1
                    },
                    // Área de contenido editable
                    {
                        id: `content-area-${newPageNumber}`,
                        type: "text",
                        content: "Haz clic para agregar contenido...",
                        position: { x: 10, y: 20 },
                        size: { width: 80, height: 60 },
                        style: {
                            fontSize: "16px",
                            fontFamily: "Arial",
                            color: "#999999",
                            textAlign: "center"
                        },
                        zIndex: 1
                    }
                ]
            }]
        };

        // Insertar antes de la página final
        const updatedPages = [...pages];
        const finalPageIndex = updatedPages.findIndex(p => p.type === "final");

        if (finalPageIndex > -1) {
            updatedPages.splice(finalPageIndex, 0, newPage);
        } else {
            updatedPages.push(newPage);
        }

        updatePages(updatedPages);

        // Navegar a la nueva página
        const newPageIndex = updatedPages.findIndex(p => p.id === newPageId);
        setCurrentPage(newPageIndex);
    };

    // Eliminar la página actual (solo páginas de contenido)
    const deleteCurrentPage = () => {
        if (pages.length <= 3) return; // Mínimo: portada + 1 contenido + final

        const currentPageData = pages[currentPage];

        // No permitir borrar portada ni contraportada
        if (currentPageData.type === "cover" || currentPageData.type === "final") {
            return;
        }

        // Confirmar eliminación
        if (!confirm(`¿Estás seguro de eliminar la ${currentPageData.type === "content" ? `página ${currentPageData.pageNumber}` : "página"}?`)) {
            return;
        }

        const updatedPages = pages.filter((_, index) => index !== currentPage);
        updatePages(updatedPages);
        setCurrentPage(Math.min(currentPage, updatedPages.length - 1));
    };

    // Duplicar la página actual (solo páginas de contenido)
    const duplicateCurrentPage = () => {
        const currentPageData = pages[currentPage];

        // Solo duplicar páginas de contenido
        if (currentPageData.type !== "content") {
            return;
        }

        // Crear una copia de la página actual
        const lastPageNumber = Math.max(...pages.filter(p => p.type === "content").map(p => p.pageNumber));
        const newPageNumber = lastPageNumber + 1;

        const newPage = {
            ...JSON.parse(JSON.stringify(currentPageData)),
            id: `page-content-${newPageNumber}`,
            pageNumber: newPageNumber,
            cells: currentPageData.cells.map(cell => ({
                ...cell,
                id: `cell-content-${newPageNumber}-${cell.id.split('-').pop()}`,
                elements: cell.elements.map(element => ({
                    ...element,
                    id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                }))
            }))
        };

        // Insertar antes de la página final
        const updatedPages = [...pages];
        const finalPageIndex = updatedPages.findIndex(p => p.type === "final");

        if (finalPageIndex > -1) {
            updatedPages.splice(finalPageIndex, 0, newPage);
        } else {
            updatedPages.push(newPage);
        }

        updatePages(updatedPages);

        // Navegar a la nueva página
        const newPageIndex = updatedPages.findIndex(p => p.id === newPage.id);
        setCurrentPage(newPageIndex);
    };

    // Añadir una nueva página de contenido
    const addNewPage = () => {
        const contentPages = pages.filter(p => p.type === "content");
        const newPageNumber = contentPages.length > 0 ? Math.max(...contentPages.map(p => p.pageNumber)) + 1 : 2;

        const newPageId = `page-content-${Date.now()}`;
        const newPage = {
            id: newPageId,
            type: 'content',
            pageNumber: newPageNumber,
            backgroundColor: presetData?.background_color || '#ffffff',
            backgroundImage: itemData?.content_image ? `/storage/images/item/${itemData.content_image}` : null,
            layout: 'double',
            cells: [
                {
                    id: `cell-${Date.now()}-1`,
                    position: { x: 0.05, y: 0.05 },
                    size: { width: 0.4, height: 0.9 },
                    elements: []
                },
                {
                    id: `cell-${Date.now()}-2`,
                    position: { x: 0.55, y: 0.05 },
                    size: { width: 0.4, height: 0.9 },
                    elements: []
                }
            ]
        };

        // Insertar antes de la página final
        const updatedPages = [...pages];
        const finalPageIndex = updatedPages.findIndex(p => p.type === "final");

        if (finalPageIndex > -1) {
            updatedPages.splice(finalPageIndex, 0, newPage);
        } else {
            updatedPages.push(newPage);
        }

        updatePages(updatedPages);

        // Navegar a la nueva página
        const newPageIndex = updatedPages.findIndex(p => p.id === newPage.id);
        setCurrentPage(newPageIndex);
    };

    // Añadir un elemento a una celda
    const addElementToCell = (cellId, element) => {
        const updatedPages = [...pages];
        // Asegurarse de que solo se agrega a la celda correcta
        for (let i = 0; i < updatedPages[currentPage].cells.length; i++) {
            if (updatedPages[currentPage].cells[i].id === cellId) {
                updatedPages[currentPage].cells[i].elements.push(element);
            }
        }
        updatePages(updatedPages);
        setSelectedElement(element.id);
        setSelectedCell(cellId);
    };

    // 🚀 OPTIMIZACIÓN: Función debounced para updatePages en cambios no críticos
    const debouncedUpdatePages = useCallback(
        debounce(() => {
            setPageChanges(prev => {
                const newMap = new Map(prev);
                newMap.set(currentPage, Date.now());
                return newMap;
            });
        }, 100),
        [currentPage]
    );

    // Actualizar un elemento en una celda (OPTIMIZADA para redimensionamiento fluido)
    const updateElementInCell = useCallback((
        cellId,
        elementId,
        updates,
        isDuplicate = false
    ) => {
        // 🚀 OPTIMIZACIÓN: Usar función de callback para evitar re-renders innecesarios
        setPages(prevPages => {
            const updatedPages = [...prevPages];
            const cellIndex = updatedPages[currentPage].cells.findIndex(
                (cell) => cell.id === cellId
            );

            if (cellIndex === -1) return prevPages; // Celda no encontrada

            if (isDuplicate) {
                // Añadir como nuevo elemento
                const sourceElement = updatedPages[currentPage].cells[cellIndex].elements.find(
                    (el) => el.id === elementId
                );
                
                if (!sourceElement) return prevPages;
                
                updatedPages[currentPage].cells[cellIndex].elements.push({
                    ...sourceElement,
                    ...updates,
                });
            } else {
                // 🚀 OPTIMIZACIÓN: Actualizar elemento existente de forma más eficiente
                const elementIndex = updatedPages[currentPage].cells[cellIndex].elements.findIndex(
                    (el) => el.id === elementId
                );

                if (elementIndex === -1) return prevPages; // Elemento no encontrado

                const currentElement = updatedPages[currentPage].cells[cellIndex].elements[elementIndex];
                
                // 🚀 OPTIMIZACIÓN: Solo actualizar si hay cambios reales
                const hasChanges = Object.keys(updates).some(key => {
                    const currentValue = currentElement[key];
                    const newValue = updates[key];
                    
                    // Comparación profunda para objetos anidados (como style, position, size)
                    if (typeof newValue === 'object' && typeof currentValue === 'object') {
                        return JSON.stringify(currentValue) !== JSON.stringify(newValue);
                    }
                    
                    return currentValue !== newValue;
                });

                if (!hasChanges) {
                    return prevPages; // No hay cambios reales
                }

                updatedPages[currentPage].cells[cellIndex].elements[elementIndex] = {
                    ...currentElement,
                    ...updates,
                };
            }
            
            return updatedPages;
        });
        
        // 🚀 OPTIMIZACIÓN: Usar requestAnimationFrame para updatePages en operaciones de drag/resize
        if (updates.position || updates.size) {
            // Para operaciones de redimensionamiento/movimiento, usar RAF para mejor fluidez
            requestAnimationFrame(() => {
                // Marcar página como modificada de forma eficiente
                setPageChanges(prev => {
                    if (prev.has(currentPage)) return prev;
                    const newMap = new Map(prev);
                    newMap.set(currentPage, Date.now());
                    return newMap;
                });
            });
        } else {
            // Para otros cambios, usar el sistema normal
            debouncedUpdatePages();
        }
    }, [currentPage, debouncedUpdatePages]);

    // Eliminar un elemento de una celda
    const deleteElementFromCell = (cellId, elementId) => {
        const updatedPages = [...pages];
        const cellIndex = updatedPages[currentPage].cells.findIndex(
            (cell) => cell.id === cellId
        );

        if (cellIndex !== -1) {
            updatedPages[currentPage].cells[cellIndex].elements = updatedPages[
                currentPage
            ].cells[cellIndex].elements.filter((el) => el.id !== elementId);
            updatePages(updatedPages);

            if (selectedElement === elementId) {
                setSelectedElement(null);
            }
        }
    };

    // Mover un elemento hacia arriba o abajo en el z-index
    const moveElementInCell = (cellId, elementId, direction) => {
        const updatedPages = [...pages];
        const cellIndex = updatedPages[currentPage].cells.findIndex(
            (cell) => cell.id === cellId
        );

        if (cellIndex !== -1) {
            const elements = updatedPages[currentPage].cells[cellIndex].elements;
            const elementIndex = elements.findIndex((el) => el.id === elementId);

            if (elementIndex !== -1) {
                const newIndex = direction === 'up' ? elementIndex + 1 : elementIndex - 1;

                // Verificar límites
                if (newIndex >= 0 && newIndex < elements.length) {
                    // Intercambiar elementos
                    const temp = elements[elementIndex];
                    elements[elementIndex] = elements[newIndex];
                    elements[newIndex] = temp;

                    updatePages(updatedPages);
                }
            }
        }
    };

    // Deshacer
    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setPages(JSON.parse(history[historyIndex - 1]));
            setSelectedElement(null);
            setSelectedCell(null);
        }
    };

    // Rehacer
    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setPages(JSON.parse(history[historyIndex + 1]));
            setSelectedElement(null);
            setSelectedCell(null);
        }
    };

    // Vista previa de la página actual
    const togglePreview = () => {
        setPreviewMode(!previewMode);
    };

    // Añadir texto desde el botón
    const handleAddText = (textType = 'body') => {
        const newId = `text-${Date.now()}`;

        // Definir estilos específicos para cada tipo de texto
        const textStyles = {
            heading: {
                fontSize: "32px",
                fontFamily: "Arial",
                color: "#000000",
                fontWeight: "bold",
                fontStyle: "normal",
                textDecoration: "none",
                textAlign: "left",
                backgroundColor: "transparent",
                padding: "12px",
                borderRadius: "0px",
                border: "none",
                opacity: 1,
            },
            subheading: {
                fontSize: "24px",
                fontFamily: "Arial",
                color: "#333333",
                fontWeight: "600",
                fontStyle: "normal",
                textDecoration: "none",
                textAlign: "left",
                backgroundColor: "transparent",
                padding: "10px",
                borderRadius: "0px",
                border: "none",
                opacity: 1,
            },
            body: {
                fontSize: "16px",
                fontFamily: "Arial",
                color: "#000000",
                fontWeight: "normal",
                fontStyle: "normal",
                textDecoration: "none",
                textAlign: "left",
                backgroundColor: "transparent",
                padding: "8px",
                borderRadius: "0px",
                border: "none",
                opacity: 1,
            }
        };

        // Definir contenido y tamaño según el tipo
        const textContent = {
            heading: "Título Principal",
            subheading: "Subtítulo",
            body: "Haz clic para editar"
        };

        const textSizes = {
            heading: { width: 0.8, height: 0.2 },
            subheading: { width: 0.6, height: 0.15 },
            body: { width: 0.4, height: 0.15 }
        };

        const newElement = {
            id: newId,
            type: "text",
            content: textContent[textType],
            position: { x: 0.05, y: 0.05 }, // Posición en porcentajes para responsividad
            size: textSizes[textType], // Tamaño específico según el tipo
            style: textStyles[textType]
        }

        if (selectedCell) {
            // Añadir a la celda seleccionada
            addElementToCell(selectedCell, newElement);
        } else {
            // Si no hay celda seleccionada, no hacer nada o mostrar un mensaje
            console.log("Selecciona una celda primero");
        }
    };

    // Aplicar filtro predefinido
    const applyFilterPreset = (preset) => {
        if (!selectedElement || !selectedCell) return;

        updateElementInCell(selectedCell, selectedElement, {
            filters: {
                ...getSelectedElement()?.filters,
                ...preset,
            },
        });
    };

    // Sistema optimizado de miniaturas usando useMemo para detectar cambios específicos por página
    const thumbnailGenerationKey = useMemo(() => {
        // Crear una clave específica para la página actual
        const currentPageData = pages[currentPage];
        if (!currentPageData) return null;

        // Generar un hash más ligero del contenido
        const allElements = currentPageData.cells?.flatMap(cell => cell.elements || []) || [];
        const contentHash = allElements.map(el => {
            // Solo incluir propiedades esenciales para el hash
            return {
                id: el.id,
                type: el.type,
                position: el.position,
                size: el.size
            };
        });

        const key = {
            pageId: currentPageData.id,
            elementsCount: allElements.length,
            contentHash: JSON.stringify(contentHash).substring(0, 100), // Limitar tamaño del hash
            backgroundImage: currentPageData.backgroundImage,
            backgroundColor: currentPageData.backgroundColor,
            layout: currentPageData.layout
            // NO incluir timestamp para evitar regeneración constante
        };

        return key;
    }, [pages, currentPage]);

    // useEffect optimizado que regenera thumbnails cuando cambia el contenido
    useEffect(() => {
        if (pages.length === 0 || isLoading || !thumbnailGenerationKey) {
            return;
        }

        let isCancelled = false;

        const generateThumbnailForCurrentPage = async () => {
            try {
                const currentPageData = pages[currentPage];
                if (!currentPageData || !currentPageData.id) {
                    return;
                }

                const pageId = currentPageData.id;

                // Eliminar thumbnail existente antes de generar uno nuevo
                setPageThumbnails(prev => {
                    const updated = { ...prev };
                    delete updated[pageId];
                    return updated;
                });

                // Esperar un poco para que el DOM se estabilice y el thumbnail se elimine
                await new Promise(resolve => setTimeout(resolve, 100));

                if (isCancelled) {
                    return;
                }

                const thumbnail = await captureCurrentWorkspace();

                if (thumbnail && !isCancelled) {
                    setPageThumbnails(prev => ({
                        ...prev,
                        [pageId]: thumbnail
                    }));
                } else {
                    console.warn('⚠️ [DEBUG] No se pudo generar miniatura para:', pageId);
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error("❌ [DEBUG] Error regenerando miniatura:", error);
                }
            }
        };

        // Debounce para evitar generar thumbnails muy seguido
        const timeoutId = setTimeout(() => {
            generateThumbnailForCurrentPage();
        }, 500); // Reduzco el tiempo para testing

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };
    }, [currentPage, thumbnailGenerationKey, isLoading, captureCurrentWorkspace]);

    // Generación de miniaturas en segundo plano (solo para páginas que no tienen miniatura)
    useEffect(() => {
        if (pages.length === 0 || isLoading) return;

        const generateBackgroundThumbnails = async () => {
            // Encontrar páginas sin miniatura
            const pagesWithoutThumbnails = pages.filter(page => !pageThumbnails[page.id]);

            if (pagesWithoutThumbnails.length === 0) return;


            // Generar una por una con pausa entre cada una
            for (const page of pagesWithoutThumbnails) {
                try {
                    // Crear elemento temporal simplificado para la miniatura
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 150;
                    const ctx = canvas.getContext('2d');

                    // Fondo
                    ctx.fillStyle = page.backgroundColor || '#ffffff';
                    ctx.fillRect(0, 0, 200, 150);

                    // Imagen de fondo si existe
                    if (page.backgroundImage) {
                        try {
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            await new Promise((resolve, reject) => {
                                img.onload = resolve;
                                img.onerror = reject;
                                img.src = page.backgroundImage;
                            });
                            ctx.drawImage(img, 0, 0, 200, 150);
                        } catch (imgError) {
                            console.warn('No se pudo cargar imagen de fondo para miniatura:', imgError);
                        }
                    }

                    // Elementos básicos (simplified)
                    if (page.cells) {
                        page.cells.forEach(cell => {
                            if (cell.elements) {
                                cell.elements.forEach(element => {
                                    if (element.type === 'text' && element.content) {
                                        ctx.fillStyle = element.style?.color || '#000000';
                                        ctx.font = '12px Arial';
                                        ctx.fillText(
                                            element.content.substring(0, 20) + (element.content.length > 20 ? '...' : ''),
                                            10, 30
                                        );
                                    }
                                });
                            }
                        });
                    }

                    const thumbnail = canvas.toDataURL('image/jpeg', 0.7);

                    setPageThumbnails(prev => ({
                        ...prev,
                        [page.id]: thumbnail
                    }));


                    // Pausa entre generaciones
                    await new Promise(resolve => setTimeout(resolve, 300));

                } catch (error) {
                    console.error('❌ Error generando miniatura de fondo para:', page.id, error);
                }
            }
        };

        // Ejecutar después de un delay para no interferir con la página actual
        const backgroundTimeoutId = setTimeout(() => {
            generateBackgroundThumbnails();
        }, 2000);

        return () => clearTimeout(backgroundTimeoutId);
    }, [pages, pageThumbnails, isLoading]);

    // Efecto para manejar beforeunload y limpieza
    useEffect(() => {
        // Función para manejar beforeunload (antes de cerrar la ventana)
        const handleBeforeUnload = (event) => {
            // Usar refs para acceder a los valores actuales sin dependencias
            const currentSaveQueue = saveQueueRef.current;
            const currentPageChanges = pageChangesRef.current;
            
            if (currentSaveQueue.length > 0 || currentPageChanges.size > 0) {
                // Mostrar mensaje de advertencia
                event.preventDefault();
                event.returnValue = 'Hay cambios sin guardar. ¿Estás seguro de que quieres salir?';
                return event.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []); // Sin dependencias para evitar el bucle

    // Efecto de limpieza separado que solo se ejecuta al desmontar
    useEffect(() => {
        return () => {
            // Solo limpiar al desmontar, sin setState que cause bucles
            console.log('🧹 [CLEANUP] Componente desmontado');
        };
    }, []);

    // --- Función para agregar álbum al carrito CON BACKEND PDF ---
    const addAlbumToCart = async () => {

        try {


            if (!itemData || !presetData || !projectData?.id) {

                return false;
            }

            // Paso 1: GUARDAR PROGRESO FINAL EN BASE DE DATOS
            const savedSuccessfully = await autoSaveToDatabase(pages, true); // Force save

            if (!savedSuccessfully) {
                console.warn('⚠️ No se pudo guardar el progreso, pero continuando...');
            }

            // Paso 2: Preparar datos para generación de PDF en backend
            const pdfData = {
                design_data: {
                    id: projectData.id,
                    title: itemData?.name || 'Álbum Personalizado',
                    pages: pages,
                    workspace_dimensions: workspaceDimensions,
                    created_at: new Date().toISOString()
                },
                item_data: {
                    id: itemData?.id,
                    name: itemData?.name || itemData?.title,
                    price: itemData?.price,
                    user_id: itemData?.user_id,
                    width: itemData?.width,
                    height: itemData?.height
                },
                preset_data: {
                    id: presetData?.id,
                    width: presetData?.width,
                    height: presetData?.height,
                    cover_image: presetData?.cover_image,
                    content_layer_image: presetData?.content_layer_image,
                    final_layer_image: presetData?.final_layer_image
                },
                dimensions: {
                    width_mm: presetData?.width || itemData?.width || 210,
                    height_mm: presetData?.height || itemData?.height || 297,
                    workspace_width: workspaceDimensions?.width || 800,
                    workspace_height: workspaceDimensions?.height || 600
                }
            };

            // Paso 3: Marcar proyecto como listo para PDF backend
            try {
                const completeResponse = await fetch(`/api/canvas-projects/save`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        id: projectData.id,
                        status: 'ready_for_pdf',
                        pdf_data: pdfData,
                        completed_at: new Date().toISOString()
                    })
                });

                if (completeResponse.ok) {
                    const completeResult = await completeResponse.json();
                } else {
                    console.warn('⚠️ Error marcando proyecto como completado');
                }
            } catch (completeError) {
                console.warn('⚠️ Error en marcado de completado:', completeError);
            }

            // Paso 3: Generar un project_id único para el carrito
            const timestamp = Date.now();
            const cartProjectId = projectData.id; // Usar el ID del proyecto de BD

            // Establecer el project_id globalmente para uso posterior
            window.currentProjectId = cartProjectId;
            window.albumProjectId = cartProjectId;

            // Paso 4: Crear el producto del álbum para el carrito

            // Obtener thumbnail de la portada si está disponible
            let albumThumbnail = presetData.cover_image;
            if (pageThumbnails && pageThumbnails['page-cover']) {
                albumThumbnail = pageThumbnails['page-cover'];
            }

            // Optimizar imagen del thumbnail (reducir calidad si es base64)
            let optimizedThumbnail = albumThumbnail;
            if (albumThumbnail && albumThumbnail.startsWith('data:image/')) {
                if (albumThumbnail.length > 100000) { // Si es mayor a ~100KB
                    optimizedThumbnail = presetData.cover_image || '/assets/img/default-album.jpg';
                }
            }

            // Crear el producto siguiendo la estructura de itemData
            const albumProduct = {
                ...itemData, // Incluir todos los campos de itemData
                project_id: cartProjectId, // El project_id que se guardará en colors
                canvas_project_id: projectData.id, // ID del proyecto en canvas_projects
                quantity: 1,
                type: 'custom_album',
                // Metadatos adicionales para el PDF backend
                pdf_metadata: {
                    width_mm: presetData.width,
                    height_mm: presetData.height,
                    pages_count: pages.length,
                    workspace_dimensions: workspaceDimensions,
                    requires_pdf_generation: true
                }
            };


            // Paso 5: Agregar al carrito usando el patrón correcto

            const newCart = structuredClone(cart);
            const index = newCart.findIndex((x) => x.id == albumProduct.id);

            if (index == -1) {
                // Producto nuevo - agregarlo
                newCart.push({ ...albumProduct, quantity: 1 });
            } else {
                // Producto existente - incrementar cantidad
                newCart[index].quantity++;
            }

            // Actualizar estado del carrito
            setCart(newCart);

            // Mostrar notificación de éxito
            toast.success("Álbum agregado al carrito", {
                description: `${albumProduct.name} se ha añadido al carrito. El PDF se generará en el backend.`,
                icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
                duration: 4000,
                position: "bottom-center",
            });

            // Disparar evento personalizado para notificar otros componentes
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: newCart, action: 'add', product: albumProduct }
            }));

            return true;

        } catch (error) {
            console.error('❌ === ERROR EN addAlbumToCart ===');
            console.error('Error completo:', error);
            console.error('Stack trace:', error.stack);
            console.error('Mensaje del error:', error.message);

            toast.error("Error al agregar al carrito", {
                description: `Error específico: ${error.message}`,
                duration: 5000,
                position: "bottom-center",
            });
            return false;
        }
    };


    // --- Finalizar diseño del álbum ---
    // Guarda el estado completo del diseño en la base de datos (optimizado)
    window.finalizeAlbumDesign = async () => {

        try {
            if (!pages || pages.length === 0) {
                throw new Error('No hay páginas para finalizar');
            }

            // Función para optimizar páginas y reducir el tamaño de los datos
            const optimizePages = (pages) => pages.map(page => ({
                id: page.id,
                type: page.type,
                pageNumber: page.pageNumber,
                layout: page.layout,
                cells: page.cells.map(cell => ({
                    id: cell.id,
                    elements: cell.elements.map(element => {
                        const optimizedElement = {
                            id: element.id,
                            type: element.type,
                            position: element.position,
                            zIndex: element.zIndex || 1
                        };

                        // Solo incluir propiedades necesarias según el tipo
                        if (element.type === 'image') {
                            // Para imágenes base64, guardar solo un hash o identificador
                            if (element.content.startsWith('data:image/')) {
                                // Crear un hash simple de la imagen para identificarla
                                const imageHash = btoa(element.content.substring(0, 100)).substring(0, 20);
                                optimizedElement.content = `[BASE64_IMAGE_${imageHash}]`;
                                optimizedElement.contentType = element.content.split(';')[0].split(':')[1];
                                optimizedElement.originalSize = element.content.length;
                            } else {
                                optimizedElement.content = element.content;
                            }

                            // Solo incluir filtros no vacíos
                            if (element.filters) {
                                const activeFilters = Object.entries(element.filters)
                                    .filter(([key, value]) => value !== 0 && value !== false && value !== null)
                                    .reduce((acc, [key, value]) => {
                                        acc[key] = value;
                                        return acc;
                                    }, {});

                                if (Object.keys(activeFilters).length > 0) {
                                    optimizedElement.filters = activeFilters;
                                }
                            }

                            if (element.mask && element.mask !== 'none') {
                                optimizedElement.mask = element.mask;
                            }
                            if (element.size) {
                                optimizedElement.size = element.size;
                            }
                            if (element.locked) {
                                optimizedElement.locked = element.locked;
                            }
                        } else if (element.type === 'text') {
                            optimizedElement.content = element.content;
                            if (element.style) {
                                // Solo incluir estilos no por defecto
                                const nonDefaultStyles = Object.entries(element.style)
                                    .filter(([key, value]) => {
                                        // Filtrar valores por defecto comunes
                                        if (key === 'fontSize' && value === '16px') return false;
                                        if (key === 'color' && value === '#000000') return false;
                                        if (key === 'fontFamily' && value === 'Arial') return false;
                                        return true;
                                    })
                                    .reduce((acc, [key, value]) => {
                                        acc[key] = value;
                                        return acc;
                                    }, {});

                                if (Object.keys(nonDefaultStyles).length > 0) {
                                    optimizedElement.style = nonDefaultStyles;
                                }
                            }
                        }

                        return optimizedElement;
                    })
                }))
            }));

            // Preparar los datos del diseño optimizados
            const designData = {
                pages: optimizePages(pages),
                projectInfo: {
                    id: projectData?.id,
                    item_id: itemData?.id,
                    title: itemData?.title,
                    preset_id: presetData?.id
                },
                presetInfo: {
                    id: presetData?.id,
                    name: presetData?.name,
                    cover_image: presetData?.cover_image,
                    content_image: presetData?.content_image,
                    back_cover_image: presetData?.back_cover_image
                },
                workspace: {
                    width: workspaceDimensions.width,
                    height: workspaceDimensions.height,
                    scale: workspaceDimensions.scale
                },
                meta: {
                    finalizedAt: new Date().toISOString(),
                    version: '1.3'
                }
            };

            // Preparar datos para enviar
            const requestData = {
                design_data: designData,
                thumbnails: Object.fromEntries(
                    Object.entries(pageThumbnails).map(([pageId, thumbnail]) => [pageId, thumbnail])
                )
            };

            // Verificar el tamaño del payload
            const dataString = JSON.stringify(requestData);
            const dataSizeKB = Math.round(dataString.length / 1024);
            const dataSizeMB = Math.round(dataSizeKB / 1024 * 100) / 100;


            // Mostrar información detallada sobre el contenido
            let base64Images = 0;
            let totalBase64Size = 0;

            pages.forEach(page => {
                page.cells?.forEach(cell => {
                    cell.elements?.forEach(element => {
                        if (element.type === 'image' && element.content && element.content.startsWith('data:image/')) {
                            base64Images++;
                            totalBase64Size += element.content.length;
                        }
                    });
                });
            });

            const base64SizeMB = Math.round(totalBase64Size / (1024 * 1024) * 100) / 100;

            // Advertir si el payload es muy grande
            if (dataSizeKB > 1024) { // Más de 1MB
                const proceed = confirm(
                    `El diseño contiene ${base64Images} imágenes (${base64SizeMB} MB en imágenes). ` +
                    `Payload completo: ${dataSizeMB} MB. ` +
                    `Esto podría causar problemas al guardarlo. ` +
                    `¿Desea continuar de todos modos?`
                );
                if (!proceed) {
                    return false;
                }
            }

            // Enviar al backend
            const response = await fetch(`/api/canvas/projects/${projectData.id}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: dataString
            });

            if (!response.ok) {
                let errorMessage = 'Error al finalizar el diseño';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Si no se puede parsear la respuesta como JSON
                    if (response.status === 413) {
                        errorMessage = 'El diseño es demasiado grande para ser guardado. Intente simplificar las imágenes.';
                    } else if (response.status >= 500) {
                        errorMessage = 'Error del servidor. Intente nuevamente más tarde.';
                    }
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            return true;

        } catch (error) {
            console.error('Error al finalizar diseño:', error);
            let userMessage = error.message;

            // Mejorar mensajes de error específicos
            if (error.message.includes('Failed to fetch')) {
                userMessage = 'Error de conexión. Verifique su conexión a internet e intente nuevamente.';
            } else if (error.message.includes('NetworkError') || error.message.includes('net::')) {
                userMessage = 'Error de red. Intente nuevamente más tarde.';
            }

            alert('Error al finalizar el diseño: ' + userMessage);
            return false;
        }
    };

    // --- Generar PDF del álbum con calidad de impresión 300 DPI ---
    // Renderiza cada página usando el mismo componente React con alta resolución
    const generateAlbumPDF = useCallback(async () => {

        try {
            // Importar jsPDF dinámicamente
            const { jsPDF } = await import('jspdf');

            // 🖨️ DIMENSIONES PROFESIONALES: Con sangrado para impresión
            let pageWidthCm = presetData?.width || 21; // A4 por defecto
            let pageHeightCm = presetData?.height || 29.7;

            // Agregar sangrado de 3mm (0.3cm) en cada lado para impresión profesional
            const bleedCm = 0.3; // 3mm de sangrado estándar
            const printWidthCm = pageWidthCm + (bleedCm * 2);
            const printHeightCm = pageHeightCm + (bleedCm * 2);

            // Convertir a puntos (1 cm = 28.35 puntos)
            const pageWidthPt = printWidthCm * 28.35;
            const pageHeightPt = printHeightCm * 28.35;



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
                document.getElementById('pdf-progress-bar').style.width = `${percentage}%`;
                document.getElementById('current-page').textContent = current;
            };

            // 🖨️ GUARDAR PÁGINA ORIGINAL antes del loop
            const originalCurrentPage = currentPage;

            // Procesar cada página
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];

                // Cambiar a la página actual temporalmente para capturarla
                setCurrentPage(i);

                // Esperar un momento para que se renderice
                await new Promise(resolve => setTimeout(resolve, 500));

                try {
                    // Capturar la página con alta calidad para PDF
                    const canvas = await captureCurrentWorkspace({ type: 'pdf' });

                    if (canvas) {
                        // Calcular dimensiones para mantener aspecto y llenar la página
                        const canvasAspect = canvas.width / canvas.height;
                        const pageAspect = pageWidthPt / pageHeightPt;

                        let imgWidth, imgHeight, offsetX = 0, offsetY = 0;

                        if (canvasAspect > pageAspect) {
                            // La imagen es más ancha, ajustar por ancho
                            imgWidth = pageWidthPt;
                            imgHeight = pageWidthPt / canvasAspect;
                            offsetY = (pageHeightPt - imgHeight) / 2;
                        } else {
                            // La imagen es más alta, ajustar por alto
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

            // Restaurar página original
            setCurrentPage(originalCurrentPage);

            // Generar nombre del archivo
            const fileName = `${itemData?.name || 'album'}_${new Date().toISOString().split('T')[0]}.pdf`;

            // Descargar el PDF
            pdf.save(fileName);

            // Remover progreso
            document.body.removeChild(progressContainer);


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

            return fileName;

        } catch (error) {
            console.error('❌ Error generando PDF:', error);

            // Remover progreso si existe
            const progressElement = document.getElementById('pdf-progress');
            if (progressElement) {
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
            }, 7000);

            throw error;
        }
    }, [pages, currentPage, setCurrentPage, captureCurrentWorkspace, presetData, itemData]);

    // Exponer funciones útiles globalmente para uso externo
    window.generateAlbumPDF = generateAlbumPDF;
    window.generateHighQualityThumbnail = generateHighQualityThumbnail;
    window.captureCurrentWorkspace = captureCurrentWorkspace;

    return (
        <DndProvider backend={HTML5Backend} className="!h-screen !w-screen overflow-hidden">
            {isLoading ? (
                <div className="h-screen bg-gray-100 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold customtext-neutral-dark mb-2">Cargando Editor</h2>
                        <p className="customtext-neutral-dark">Preparando tu álbum personalizado...</p>
                    </div>
                </div>
            ) : loadError ? (
                <div className="h-screen bg-gray-100 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                        <p className="customtext-neutral-dark mb-4">
                            {loadError}
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Reintentar
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                </div>
            ) : pages.length === 0 ? (
                <div className="h-screen bg-gray-100 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                        <h2 className="text-xl font-semibold customtext-neutral-dark mb-2">Inicializando Editor</h2>
                        <p className="customtext-neutral-dark mb-4">
                            Generando páginas del álbum...
                        </p>
                        <div className="animate-pulse flex space-x-4">
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded"></div>
                                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-screen w-screen overflow-hidden bg-[#141b34] font-sans">
                    {/* Book Preview Modal */}
                    <BookPreviewModal
                        isOpen={isBookPreviewOpen}
                        onRequestClose={() => {
                            setIsBookPreviewOpen(false);
                            // 🚀 RESET: Limpiar estados al cerrar modal
                            setAlbumLoadingState({
                                isLoading: false,
                                loadedImages: 0,
                                totalImages: 0,
                                message: ''
                            });
                            // 🎭 RESET: Limpiar modal de preparación
                            setAlbumPreparationModal({
                                isOpen: false,
                                phase: 'preparing',
                                progress: 0,
                                message: '',
                                subMessage: ''
                            });
                        }}
                        pages={pages.map((page) => ({
                            ...page,
                            layout: layouts.find((l) => l.id === page.layout) || layouts[0],
                        }))}
                        pageThumbnails={pageThumbnails}
                        workspaceDimensions={workspaceDimensions}
                        getCurrentLayout={(page) => {
                            if (!page) return layouts[0];
                            return layouts.find((l) => l.id === page.layout) || layouts[0];
                        }}
                        presetData={presetData}
                        addAlbumToCart={addAlbumToCart}
                        projectData={projectData}
                        itemData={itemData}
                        // 🚀 NUEVO: Estado de carga para mostrar animación
                        albumLoadingState={albumLoadingState}
                    />

                    {/* 🎭 MODAL DE PREPARACIÓN: Experiencia única para el cliente */}
                    {albumPreparationModal.isOpen && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-500">
                            <div className="bg-white rounded-3xl shadow-2xl p-8 min-w-96 max-w-96 mx-4 text-center relative overflow-hidden animate-in zoom-in duration-500">
                                {/* Fondo animado con partículas flotantes */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 opacity-60"></div>
                                
                                {/* Efectos de partículas flotantes */}
                                <div className="absolute inset-0">
                                    <div className="absolute top-4 left-4 w-2 h-2 bg-purple-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s' }}></div>
                                    <div className="absolute top-8 right-6 w-1 h-1 bg-blue-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
                                    <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
                                    <div className="absolute bottom-4 right-4 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1.5s' }}></div>
                                </div>
                                
                                {/* Contenido */}
                                <div className="relative z-10">
                                    {/* Icono principal animado con glow effect */}
                                    <div className="mb-6 relative">
                                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl relative">
                                            {/* Glow effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-ping opacity-20"></div>
                                            <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                                            
                                            {/* Icono del libro */}
                                            <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        
                                        {/* Anillo de progreso mejorado */}
                                        <div className="absolute inset-0 w-24 h-24 mx-auto">
                                            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                                                <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200" />
                                                <circle 
                                                    cx="48" cy="48" r="44" 
                                                    stroke="url(#progressGradient)" 
                                                    strokeWidth="4" 
                                                    fill="none" 
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${2 * Math.PI * 44}`}
                                                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - albumPreparationModal.progress / 100)}`}
                                                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                                                />
                                                <defs>
                                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                                                        <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Mensaje principal con efecto de typing */}
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 animate-pulse">
                                        {albumPreparationModal.message}
                                    </h2>
                                    
                                    {/* Submensaje */}
                                    <p className="text-gray-600 mb-6 text-base leading-relaxed">
                                        {albumPreparationModal.subMessage}
                                    </p>

                                    {/* Barra de progreso con glow */}
                                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
                                        <div 
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 ease-out relative"
                                            style={{ width: `${albumPreparationModal.progress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer"></div>
                                        </div>
                                    </div>

                                    {/* Porcentaje con animación */}
                                    <p className="text-lg font-bold text-purple-600 mb-4">
                                        {albumPreparationModal.progress}%
                                    </p>

                                
                                </div>
                                
                                {/* CSS para efectos adicionales */}
                                <style jsx>{`
                                    @keyframes shimmer {
                                        0% { transform: translateX(-100%) skewX(-12deg); }
                                        100% { transform: translateX(200%) skewX(-12deg); }
                                    }
                                    .animate-shimmer {
                                        animation: shimmer 2s infinite;
                                    }
                                `}</style>
                            </div>
                        </div>
                    )}

                    {/* ✅ Navigation Bar (Header) */}
                    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-lg flex items-center px-6 z-20 border-b border-gray-200">
                        <div className="w-full flex items-center justify-between">
                            {/* Left section */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => window.history.back()}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-[#040404]"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                    <span className="font-medium">Volver</span>
                                </button>

                                <div className="h-6 w-px bg-gray-300"></div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={undo}
                                        disabled={historyIndex <= 0}
                                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Undo2 className="h-4 w-4 text-[#040404]" />
                                    </button>
                                    <button
                                        onClick={redo}
                                        disabled={historyIndex >= history.length - 1}
                                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Redo2 className="h-4 w-4 text-[#040404]" />
                                    </button>
                                </div>
                            </div>

                            {/* Center section */}
                            <div className="flex-1 max-w-md mx-8">
                                <input
                                    type="text"
                                    value={projectData?.name || "Álbum Sin Título"}
                                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                                    className="w-full text-center text-lg font-bold text-[#040404] bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-[#af5cb8] focus:bg-white rounded-lg px-4 py-2 transition-all"
                                    placeholder="Nombre del diseño"
                                />
                            </div>

                            {/* Right section */}
                            <div className="flex items-center gap-4">
                                {/* Cola de guardado indicator */}
                                {(saveQueue.length > 0 || isProcessingQueue) && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                                        {isProcessingQueue ? (
                                            <>
                                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                                <span>Guardando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-2 w-2 bg-blue-600 rounded-full" />
                                                <span>Cola: {saveQueue.length}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                                
                                <SaveIndicator
                                    saveStatus={autoSave.saveStatus}
                                    lastSaved={autoSave.lastSaved}
                                    lastAutoSaved={autoSave.lastAutoSaved}
                                    hasUnsavedChanges={autoSaveState.hasUnsavedChanges || Boolean(pageChanges instanceof Map && pageChanges.has(currentPage))}
                                    isOnline={autoSave.isOnline}
                                    saveError={autoSave.saveError}
                                    onManualSave={saveProgressManually}
                                    saveQueueSize={saveQueue.length}
                                    isProcessingQueue={isProcessingQueue}
                                    pageChangesCount={pageChanges instanceof Map ? pageChanges.size : 0}
                                />

                                {/* Debug: Botón para procesar cola manualmente */}
                                {saveQueue.length > 0 && (
                                    <button
                                        onClick={() => {
                                            console.log('🔧 [DEBUG] Procesando cola manualmente');
                                            processSaveQueue();
                                        }}
                                        className="flex items-center gap-2 text-xs text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Save className="h-3 w-3" />
                                        Procesar Cola
                                    </button>
                                )}
{/*
                              
                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    P{currentPage}: {(pageChanges instanceof Map && pageChanges.has(currentPage)) ? '🔴' : '🟢'}
                                </div>

                            
                                <button
                                    onClick={() => {
                                        console.log('🔧 [DEBUG] Marcando página actual como modificada');
                                        setPageChanges(prev => {
                                            const newMap = new Map(prev);
                                            newMap.set(currentPage, Date.now());
                                            return newMap;
                                        });
                                    }}
                                    className="text-xs text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded"
                                >
                                    Marcar Modificada
                                </button> */}

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={async (e) => {
                                        // �️ PREVENIR RECARGA: Evitar comportamiento por defecto
                                        e.preventDefault();
                                        e.stopPropagation();
                                        
                                        try {
                                            console.log('🎭 [ALBUM-EXPERIENCE] Iniciando experiencia única de álbum...');
                                            
                                            // 🎭 FASE 1: Mostrar modal de preparación
                                            setAlbumPreparationModal({
                                                isOpen: true,
                                                phase: 'preparing',
                                                progress: 0,
                                                message: '✨ Creando tu experiencia',
                                                subMessage: 'Preparando la magia de tu álbum personalizado...'
                                            });

                                            // 🎭 FASE 2: Simular preparación (0-30%)
                                            for (let i = 0; i <= 30; i += 5) {
                                                await new Promise(resolve => setTimeout(resolve, 100));
                                                setAlbumPreparationModal(prev => ({
                                                    ...prev,
                                                    progress: i,
                                                    message: '🔧 Construyendo previsualización',
                                                    subMessage: 'Optimizando cada detalle para ti...'
                                                }));
                                            }

                                            // 🎭 FASE 3: Cargar thumbnails en background (30-80%)
                                            setAlbumPreparationModal(prev => ({
                                                ...prev,
                                                phase: 'processing',
                                                message: 'Cargando el proyecto',
                                                subMessage: 'Procesando cada página con calidad profesional...'
                                            }));

                                            const pdfThumbnails = await loadExistingPDFThumbnails((loaded, total) => {
                                                const loadProgress = 30 + (loaded / total) * 50; // 30% a 80%
                                                setAlbumPreparationModal(prev => ({
                                                    ...prev,
                                                    progress: Math.round(loadProgress),
                                                    subMessage: `Procesando imagen ${loaded} de ${total}...`
                                                }));
                                            });

                                            // 🎭 FASE 4: Finalizando (80-100%)
                                            setAlbumPreparationModal(prev => ({
                                                ...prev,
                                                phase: 'finalizing',
                                                message: '🎨 Aplicando toques finales',
                                                subMessage: 'Perfeccionando tu vista previa...'
                                            }));

                                            for (let i = 80; i <= 100; i += 4) {
                                                await new Promise(resolve => setTimeout(resolve, 80));
                                                setAlbumPreparationModal(prev => ({
                                                    ...prev,
                                                    progress: i
                                                }));
                                            }

                                            // � FASE 5: ¡Listo! (100%)
                                            setAlbumPreparationModal(prev => ({
                                                ...prev,
                                                phase: 'ready',
                                                progress: 100,
                                                message: '🎉 ¡Tu álbum está listo!',
                                                subMessage: 'Experiencia premium creada especialmente para ti'
                                            }));

                                            // Esperar un momento para que se vea el 100%
                                            await new Promise(resolve => setTimeout(resolve, 1000));

                                            // 🎭 FASE 6: Cerrar modal de preparación y abrir álbum
                                            setAlbumPreparationModal(prev => ({
                                                ...prev,
                                                isOpen: false
                                            }));

                                            // Actualizar thumbnails y abrir modal del álbum
                                            setPageThumbnails(prev => ({
                                                ...prev,
                                                ...pdfThumbnails
                                            }));

                                            // Pequeño delay para transición suave
                                            setTimeout(() => {
                                                setIsBookPreviewOpen(true);
                                                console.log('✅ [ALBUM-EXPERIENCE] Experiencia única completada');
                                            }, 300);
                                            
                                        } catch (error) {
                                            console.error('❌ [ALBUM-EXPERIENCE] Error en experiencia:', error);
                                            
                                            // Mostrar error en el modal de preparación
                                            setAlbumPreparationModal(prev => ({
                                                ...prev,
                                                message: '⚠️ Ups, algo salió mal',
                                                subMessage: 'Intentando nuevamente...',
                                                progress: 0
                                            }));

                                            // Cerrar después de un momento
                                            setTimeout(() => {
                                                setAlbumPreparationModal(prev => ({
                                                    ...prev,
                                                    isOpen: false
                                                }));
                                            }, 2000);
                                        }
                                    }}
                                    disabled={albumPreparationModal.isOpen}
                                    icon={<Book className="h-4 w-4" />}
                                >
                                    {albumPreparationModal.isOpen ? 'Creando experiencia...' : 'Vista de Álbum'}
                                </Button>
                                {/*  <button
                                    onClick={handleExportPDF}
                                    disabled={isPDFGenerating}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        isPDFGenerating 
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                            : 'bg-[#af5cb8] text-white hover:bg-[#5f2e61] shadow-md hover:shadow-lg'
                                    }`}
                                >
                                    {isPDFGenerating ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {isPDFGenerating ? 'Guardando...' : 'Guardar'}
                                </button> */}

                               
                            </div>
                        </div>
                    </header>


                    {/* Main Layout */}
                    <div className={`flex h-full ${selectedElement ? 'pt-[60px]' : 'pt-16'}`}>
                        {/* ✅ Left Sidebar - Vertical Canva Style */}
                        <div className="flex">
                            {/* Icon Navigation */}
                            <div className="w-20 bg-[#f7edfa] border-r border-gray-200 flex flex-col items-center py-6 space-y-2">
                                <button
                                    onClick={() => setActiveTab('pages')}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all w-16 h-16 ${activeTab === 'pages'
                                        ? 'bg-[#af5cb8] text-white shadow-md'
                                        : 'text-[#040404] hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    <Book className="h-6 w-6" />
                                    <span className="text-xs font-medium">Páginas</span>
                                </button>


                                <button
                                    onClick={() => setActiveTab('templates')}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all w-16 h-16 ${activeTab === 'templates'
                                        ? 'bg-[#af5cb8] text-white shadow-md'
                                        : 'text-[#040404] hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    <Layout className="h-6 w-6" />
                                    <span className="text-xs font-medium">Diseños</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('panel')}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all w-16 h-16 ${activeTab === 'panel'
                                        ? 'bg-[#af5cb8] text-white shadow-md'
                                        : 'text-[#040404] hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    <Layers className="h-6 w-6" />
                                    <span className="text-xs font-medium">Capas</span>
                                </button>



                             {/*   <button
                                    onClick={() => setActiveTab('images')}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all w-16 h-16 ${activeTab === 'images'
                                        ? 'bg-[#af5cb8] text-white shadow-md'
                                        : 'text-[#040404] hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    <ImageIcon className="h-6 w-6" />
                                    <span className="text-xs font-medium">Imagenes</span>
                                </button> */}

                                <button
                                    onClick={() => setActiveTab('text')}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all w-16 h-16 ${activeTab === 'text'
                                        ? 'bg-[#af5cb8] text-white shadow-md'
                                        : 'text-[#040404] hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    <Type className="h-6 w-6" />
                                    <span className="text-xs font-medium">Textos</span>
                                </button>

                             

                                <button
                                    onClick={() => setActiveTab('filters')}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all w-16 h-16 ${activeTab === 'filters'
                                        ? 'bg-[#af5cb8] text-white shadow-md'
                                        : 'text-[#040404] hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    <Filter className="h-6 w-6" />
                                    <span className="text-xs font-medium">Filtros</span>
                                </button>

                            </div>

                            {/* Content Panel */}
                            <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
                                {/* Panel Header */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-[#040404] capitalize">
                                                {activeTab === 'templates' && 'Templates'}
                                                {activeTab === 'images' && 'Images'}
                                                {activeTab === 'text' && 'Text'}
                                                {activeTab === 'shapes' && 'Shapes'}
                                                {activeTab === 'stickers' && 'Stickers'}
                                                {activeTab === 'pages' && 'Pages'}
                                                {activeTab === 'panel' && 'Layers Panel'}
                                                {activeTab === 'filters' && 'Filtros'}
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                {activeTab === 'templates' && 'Choose a template to get started'}
                                                {activeTab === 'images' && 'Search for images'}
                                                {activeTab === 'text' && 'Add and edit text'}
                                                {activeTab === 'shapes' && 'Add shapes and graphics'}
                                                {activeTab === 'stickers' && 'Add fun stickers'}
                                                {activeTab === 'pages' && 'Manage your pages'}
                                                {activeTab === 'panel' && 'Organize layers and z-index'}
                                                {activeTab === 'filters' && 'Aplicar efectos y filtros a elementos'}
                                            </p>
                                        </div>
                                        <button className="p-1 hover:bg-gray-100 rounded">
                                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>



                                {/* Panel Content */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    {activeTab === 'templates' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Layout className="h-5 w-5 text-[#af5cb8]" />
                                                <h3 className="font-semibold text-[#040404]">Page Layouts</h3>
                                            </div>
                                            <LayoutSelector
                                                currentLayoutId={pages[currentPage]?.layout}
                                                onLayoutChange={changeLayout}
                                            />
                                        </div>
                                    )}





                                    {activeTab === 'images' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <ImageIcon className="h-5 w-5 text-[#af5cb8]" />
                                                <h3 className="font-semibold text-[#040404]">Imágenes del Proyecto</h3>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    {projectImages.length} imagen{projectImages.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <ProjectImageGallery
                                                images={projectImages}
                                                onImageSelect={addImageFromGallery}
                                                isLoading={projectImagesLoading}
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'text' && (
                                        <div className="space-y-6">


                                            {/* Text Type Buttons */}
                                            <div className="space-y-2">
                                                {/* Heading Button */}
                                                <button
                                                    onClick={() => handleAddText('heading')}
                                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-[#af5cb8] hover:bg-gray-50 transition-all duration-200 text-left group"
                                                >
                                                    <div className="flex items-center gap-3">

                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-900 text-2xl leading-tight">Título Principal</p>
                                                            <p className="text-gray-500 text-xs mt-1">32px, Bold</p>
                                                        </div>
                                                        <div className="text-gray-400 group-hover:text-[#af5cb8] transition-colors">
                                                            <Plus className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Subheading Button */}
                                                <button
                                                    onClick={() => handleAddText('subheading')}
                                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-[#af5cb8] hover:bg-gray-50 transition-all duration-200 text-left group"
                                                >
                                                    <div className="flex items-center gap-3">

                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-800 text-lg leading-tight">Subtítulo</p>
                                                            <p className="text-gray-500 text-xs mt-1">24px, Semi-bold</p>
                                                        </div>
                                                        <div className="text-gray-400 group-hover:text-[#af5cb8] transition-colors">
                                                            <Plus className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Body Text Button */}
                                                <button
                                                    onClick={() => handleAddText('body')}
                                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-[#af5cb8] hover:bg-gray-50 transition-all duration-200 text-left group"
                                                >
                                                    <div className="flex items-center gap-3">

                                                        <div className="flex-1">
                                                            <p className="font-normal text-gray-900 text-base leading-tight">Texto Normal</p>
                                                            <p className="text-gray-500 text-xs mt-1">16px, Normal</p>
                                                        </div>
                                                        <div className="text-gray-400 group-hover:text-[#af5cb8] transition-colors">
                                                            <Plus className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Text Editing Section */}
                                            {activeTab === "text" && selectedElement && getSelectedElement()?.type === "text" && (
                                                <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="h-10 w-10 bg-[#af5cb8] rounded-xl flex items-center justify-center">
                                                            <Pencil className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-[#040404] text-lg">Editar Texto</h4>
                                                            <p className="text-gray-600 text-sm">Personaliza el formato y estilo</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {/* Quick Format Buttons */}
                                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm font-medium text-gray-700 mr-2">Formato:</span>
                                                            <button
                                                                onClick={() => {
                                                                    const element = getSelectedElement();
                                                                    updateElementInCell(selectedCell, selectedElement, {
                                                                        style: {
                                                                            ...element.style,
                                                                            fontWeight: element.style.fontWeight === 'bold' ? 'normal' : 'bold'
                                                                        }
                                                                    });
                                                                }}
                                                                className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${getSelectedElement()?.style?.fontWeight === 'bold'
                                                                    ? 'bg-[#af5cb8] text-white'
                                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                B
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const element = getSelectedElement();
                                                                    updateElementInCell(selectedCell, selectedElement, {
                                                                        style: {
                                                                            ...element.style,
                                                                            fontStyle: element.style.fontStyle === 'italic' ? 'normal' : 'italic'
                                                                        }
                                                                    });
                                                                }}
                                                                className={`px-3 py-1.5 rounded-md text-sm italic transition-colors ${getSelectedElement()?.style?.fontStyle === 'italic'
                                                                    ? 'bg-[#af5cb8] text-white'
                                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                I
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const element = getSelectedElement();
                                                                    updateElementInCell(selectedCell, selectedElement, {
                                                                        style: {
                                                                            ...element.style,
                                                                            textDecoration: element.style.textDecoration === 'underline' ? 'none' : 'underline'
                                                                        }
                                                                    });
                                                                }}
                                                                className={`px-3 py-1.5 rounded-md text-sm underline transition-colors ${getSelectedElement()?.style?.textDecoration === 'underline'
                                                                    ? 'bg-[#af5cb8] text-white'
                                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                U
                                                            </button>
                                                        </div>

                                                        {/* Font Family */}
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm font-medium text-gray-700 block mb-2">Tipografía:</span>
                                                            <div className="relative">
                                                                <select
                                                                    value={getSelectedElement()?.style?.fontFamily || 'Arial'}
                                                                    onChange={(e) => {
                                                                        const element = getSelectedElement();
                                                                        updateElementInCell(selectedCell, selectedElement, {
                                                                            style: {
                                                                                ...element.style,
                                                                                fontFamily: e.target.value
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#af5cb8] focus:border-transparent appearance-none cursor-pointer hover:border-[#af5cb8] transition-colors"
                                                                >
                                                                    <option value="Arial">Arial</option>
                                                                    <option value="Times New Roman">Times New Roman</option>
                                                                    <option value="Helvetica">Helvetica</option>
                                                                    <option value="Georgia">Georgia</option>
                                                                    <option value="Verdana">Verdana</option>
                                                                    <option value="Courier New">Courier New</option>
                                                                    <option value="Impact">Impact</option>
                                                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                                                    <option value="Trebuchet MS">Trebuchet MS</option>
                                                                    <option value="Tahoma">Tahoma</option>
                                                                    <option value="Palatino">Palatino</option>
                                                                    <option value="Garamond">Garamond</option>
                                                                    <option value="Bookman">Bookman</option>
                                                                    <option value="Avant Garde">Avant Garde</option>
                                                                    <option value="Calibri">Calibri</option>
                                                                    <option value="Cambria">Cambria</option>
                                                                    <option value="Candara">Candara</option>
                                                                    <option value="Century Gothic">Century Gothic</option>
                                                                    <option value="Franklin Gothic">Franklin Gothic</option>
                                                                    <option value="Futura">Futura</option>
                                                                    <option value="Gill Sans">Gill Sans</option>
                                                                    <option value="Lucida Grande">Lucida Grande</option>
                                                                    <option value="Optima">Optima</option>
                                                                    <option value="Segoe UI">Segoe UI</option>
                                                                    <option value="Roboto">Roboto</option>
                                                                    <option value="Open Sans">Open Sans</option>
                                                                    <option value="Lato">Lato</option>
                                                                    <option value="Montserrat">Montserrat</option>
                                                                    <option value="Poppins">Poppins</option>
                                                                    <option value="Nunito">Nunito</option>
                                                                    <option value="Inter">Inter</option>
                                                                </select>
                                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Font Size */}
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm font-medium text-gray-700 block mb-2">Tamaño:</span>
                                                            <div className="relative">
                                                                <select
                                                                    value={getSelectedElement()?.style?.fontSize || '16px'}
                                                                    onChange={(e) => {
                                                                        const element = getSelectedElement();
                                                                        updateElementInCell(selectedCell, selectedElement, {
                                                                            style: {
                                                                                ...element.style,
                                                                                fontSize: e.target.value
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#af5cb8] focus:border-transparent appearance-none cursor-pointer hover:border-[#af5cb8] transition-colors"
                                                                >
                                                                    <option value="8px">8px</option>
                                                                    <option value="10px">10px</option>
                                                                    <option value="12px">12px</option>
                                                                    <option value="14px">14px</option>
                                                                    <option value="16px">16px</option>
                                                                    <option value="18px">18px</option>
                                                                    <option value="20px">20px</option>
                                                                    <option value="22px">22px</option>
                                                                    <option value="24px">24px</option>
                                                                    <option value="28px">28px</option>
                                                                    <option value="32px">32px</option>
                                                                    <option value="36px">36px</option>
                                                                    <option value="40px">40px</option>
                                                                    <option value="44px">44px</option>
                                                                    <option value="48px">48px</option>
                                                                    <option value="56px">56px</option>
                                                                    <option value="64px">64px</option>
                                                                    <option value="72px">72px</option>
                                                                    <option value="80px">80px</option>
                                                                    <option value="96px">96px</option>
                                                                </select>
                                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Text Color */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                                <span className="text-sm font-medium text-gray-700 block mb-2">Color:</span>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="color"
                                                                        value={getSelectedElement()?.style?.color || '#000000'}
                                                                        onChange={(e) => {
                                                                            const element = getSelectedElement();
                                                                            updateElementInCell(selectedCell, selectedElement, {
                                                                                style: {
                                                                                    ...element.style,
                                                                                    color: e.target.value
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer hover:border-[#af5cb8] transition-colors"
                                                                    />
                                                                    <span className="text-xs text-gray-600 font-mono">
                                                                        {getSelectedElement()?.style?.color || '#000000'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Background Color */}
                                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                                <span className="text-sm font-medium text-gray-700 block mb-2">Fondo:</span>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="color"
                                                                        value={getSelectedElement()?.style?.backgroundColor || '#ffffff'}
                                                                        onChange={(e) => {
                                                                            const element = getSelectedElement();
                                                                            updateElementInCell(selectedCell, selectedElement, {
                                                                                style: {
                                                                                    ...element.style,
                                                                                    backgroundColor: e.target.value
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer hover:border-[#af5cb8] transition-colors"
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            const element = getSelectedElement();
                                                                            updateElementInCell(selectedCell, selectedElement, {
                                                                                style: {
                                                                                    ...element.style,
                                                                                    backgroundColor: 'transparent'
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                                                                    >
                                                                        🚫
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Text Alignment */}
                                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm font-medium text-gray-700 w-20">Alinear:</span>
                                                            <div className="flex gap-1">
                                                                {['left', 'center', 'right', 'justify'].map((align) => (
                                                                    <button
                                                                        key={align}
                                                                        onClick={() => {
                                                                            const element = getSelectedElement();
                                                                            updateElementInCell(selectedCell, selectedElement, {
                                                                                style: {
                                                                                    ...element.style,
                                                                                    textAlign: align
                                                                                }
                                                                            });
                                                                        }}
                                                                        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${getSelectedElement()?.style?.textAlign === align
                                                                            ? 'bg-[#af5cb8] text-white'
                                                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                                                            }`}
                                                                    >
                                                                        {align === 'left' && '⬅'}
                                                                        {align === 'center' && '⬌'}
                                                                        {align === 'right' && '➡'}
                                                                        {align === 'justify' && '⬍'}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Line Height */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                                <span className="text-sm font-medium text-gray-700 block mb-2">Espaciado:</span>
                                                                <div className="relative">
                                                                    <select
                                                                        value={getSelectedElement()?.style?.lineHeight || '1.5'}
                                                                        onChange={(e) => {
                                                                            const element = getSelectedElement();
                                                                            updateElementInCell(selectedCell, selectedElement, {
                                                                                style: {
                                                                                    ...element.style,
                                                                                    lineHeight: e.target.value
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#af5cb8] focus:border-transparent appearance-none cursor-pointer hover:border-[#af5cb8] transition-colors"
                                                                    >
                                                                        <option value="1">1.0</option>
                                                                        <option value="1.1">1.1</option>
                                                                        <option value="1.2">1.2</option>
                                                                        <option value="1.3">1.3</option>
                                                                        <option value="1.4">1.4</option>
                                                                        <option value="1.5">1.5</option>
                                                                        <option value="1.6">1.6</option>
                                                                        <option value="1.8">1.8</option>
                                                                        <option value="2">2.0</option>
                                                                        <option value="2.2">2.2</option>
                                                                        <option value="2.5">2.5</option>
                                                                        <option value="3">3.0</option>
                                                                    </select>
                                                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Letter Spacing */}
                                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                                <span className="text-sm font-medium text-gray-700 block mb-2">Letras:</span>
                                                                <div className="relative">
                                                                    <select
                                                                        value={getSelectedElement()?.style?.letterSpacing || 'normal'}
                                                                        onChange={(e) => {
                                                                            const element = getSelectedElement();
                                                                            updateElementInCell(selectedCell, selectedElement, {
                                                                                style: {
                                                                                    ...element.style,
                                                                                    letterSpacing: e.target.value
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#af5cb8] focus:border-transparent appearance-none cursor-pointer hover:border-[#af5cb8] transition-colors"
                                                                    >
                                                                        <option value="-3px">-3px</option>
                                                                        <option value="-2px">-2px</option>
                                                                        <option value="-1px">-1px</option>
                                                                        <option value="normal">Normal</option>
                                                                        <option value="0.5px">0.5px</option>
                                                                        <option value="1px">1px</option>
                                                                        <option value="1.5px">1.5px</option>
                                                                        <option value="2px">2px</option>
                                                                        <option value="3px">3px</option>
                                                                        <option value="4px">4px</option>
                                                                        <option value="5px">5px</option>
                                                                    </select>
                                                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Text Effects */}
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm font-medium text-gray-700 block mb-2">Efectos:</span>
                                                            <div className="flex gap-2 flex-wrap">

                                                                <button
                                                                    onClick={() => {
                                                                        const element = getSelectedElement();
                                                                        updateElementInCell(selectedCell, selectedElement, {
                                                                            style: {
                                                                                ...element.style,
                                                                                textTransform: element.style.textTransform === 'uppercase' ? 'none' : 'uppercase'
                                                                            }
                                                                        });
                                                                    }}
                                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${getSelectedElement()?.style?.textTransform === 'uppercase'
                                                                        ? 'bg-[#af5cb8] text-white shadow-sm'
                                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-[#af5cb8]'
                                                                        }`}
                                                                >
                                                                    <span className="text-xs font-black">AA</span>
                                                                    MAYÚS
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const element = getSelectedElement();
                                                                        updateElementInCell(selectedCell, selectedElement, {
                                                                            style: {
                                                                                ...element.style,
                                                                                textTransform: element.style.textTransform === 'lowercase' ? 'none' : 'lowercase'
                                                                            }
                                                                        });
                                                                    }}
                                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${getSelectedElement()?.style?.textTransform === 'lowercase'
                                                                        ? 'bg-[#af5cb8] text-white shadow-sm'
                                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-[#af5cb8]'
                                                                        }`}
                                                                >
                                                                    <span className="text-xs font-normal">aa</span>
                                                                    minús
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Opacity */}
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium text-gray-700">Opacidad:</span>
                                                                <span className="text-sm font-bold text-[#af5cb8]">
                                                                    {Math.round((getSelectedElement()?.style?.opacity || 1) * 100)}%
                                                                </span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.1"
                                                                value={getSelectedElement()?.style?.opacity || '1'}
                                                                onChange={(e) => {
                                                                    const element = getSelectedElement();
                                                                    updateElementInCell(selectedCell, selectedElement, {
                                                                        style: {
                                                                            ...element.style,
                                                                            opacity: e.target.value
                                                                        }
                                                                    });
                                                                }}
                                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#af5cb8] slider"
                                                                style={{
                                                                    background: `linear-gradient(to right, #af5cb8 0%, #af5cb8 ${(getSelectedElement()?.style?.opacity || 1) * 100}%, #e5e7eb ${(getSelectedElement()?.style?.opacity || 1) * 100}%, #e5e7eb 100%)`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                
                                    {activeTab === 'pages' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Book className="h-5 w-5 text-[#af5cb8]" />
                                                    <h3 className="font-semibold text-[#040404]">Pages</h3>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {pages.length} total
                                                    </span>
                                                </div>
                                              
                                            </div>

                                            {/* ⚡ Indicador de progreso de thumbnail individual */}
                                            {thumbnailProgress && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                        <span className="text-sm font-medium text-blue-800">
                                                            Generando thumbnail...
                                                        </span>
                                                        <span className="text-xs text-blue-600">
                                                            {thumbnailProgress.percentage}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${thumbnailProgress.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-blue-700 mt-1">
                                                        {thumbnailProgress.message || `Página: ${thumbnailProgress.pageId || 'actual'}`}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Mostrar estado de carga si las páginas aún no se han cargado */}
                                            {pages.length === 0 ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="text-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                                                        <p className="text-sm text-gray-500">Cargando páginas...</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* Cover section */}
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></div>
                                                            Cover
                                                        </div>
                                                        {categorizedPages.cover.map((page, index) => (
                                                            <div
                                                                key={page.id}
                                                                className={`relative group flex flex-col cursor-pointer transition-all duration-200 transform 
                                                                ${currentPage === pages.indexOf(page)
                                                                        ? "ring-2 ring-purple-400 scale-[1.02] shadow-md"
                                                                        : "hover:bg-gray-50 border border-transparent hover:border-gray-200"}
                                                                mb-2`}
                                                                onClick={() => handlePageChange(pages.indexOf(page))}
                                                            >
                                                                <div className="relative bg-purple-50 overflow-hidden border aspect-[4/3] rounded-lg">
                                                                    <ThumbnailImage
                                                                        pageId={page.id}
                                                                        thumbnail={pageThumbnails[page.id]}
                                                                        altText="Cover"
                                                                        type="cover"
                                                                    />
                                                                    {/* Indicador de cambios sin guardar */}
                                                                    {(pageChanges instanceof Map && pageChanges.has && pageChanges.has(pages.indexOf(page))) && (
                                                                        <div className="absolute top-1 right-1 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full shadow-sm">
                                                                            •
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 group-hover:opacity-100 opacity-80 transition-opacity">
                                                                        <span className="text-[10px] text-white font-medium block">
                                                                            Cover
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Content pages */}
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></div>
                                                            Content Pages
                                                        </div>
                                                        <div className="space-y-2">
                                                            {categorizedPages.content.map((page, index) => (
                                                                <div
                                                                    key={page.id}
                                                                    className={`relative group flex flex-col cursor-pointer transition-all duration-200 transform 
                                                                    ${currentPage === pages.indexOf(page)
                                                                            ? "ring-2 ring-purple-400 scale-[1.02] shadow-md"
                                                                            : "hover:bg-gray-50 border border-transparent hover:border-gray-200"}
                                                                    mb-1`}
                                                                    onClick={() => handlePageChange(pages.indexOf(page))}
                                                                >
                                                                    <div className="relative overflow-hidden border aspect-[4/3] rounded-lg">
                                                                        <ThumbnailImage
                                                                            pageId={page.id}
                                                                            thumbnail={pageThumbnails[page.id]}
                                                                            altText={`Page ${page.pageNumber}`}
                                                                            type="content"
                                                                        />
                                                                        <div className="absolute top-1 left-1 bg-white/90 rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                                            {page.pageNumber}
                                                                        </div>
                                                                        {/* Indicador de cambios sin guardar */}
                                                                        {(pageChanges instanceof Map && pageChanges.has && pageChanges.has(pages.indexOf(page))) ? (
                                                                            <div className="absolute top-1 right-1 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full shadow-sm">
                                                                                Sin guardar
                                                                            </div>
                                                                        ) : (
                                                                            <div className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full opacity-80 group-hover:opacity-100">
                                                                                Editable
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Final page */}
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></div>
                                                            Back Cover
                                                        </div>
                                                        {categorizedPages.final.map((page, index) => (
                                                            <div
                                                                key={page.id}
                                                                className={`relative group flex flex-col cursor-pointer transition-all duration-200 transform 
                                                                ${currentPage === pages.indexOf(page)
                                                                        ? "ring-2 ring-purple-400 scale-[1.02] shadow-md"
                                                                        : "hover:bg-gray-50 border border-transparent hover:border-gray-200"}
                                                                mb-2`}
                                                                onClick={() => handlePageChange(pages.indexOf(page))}
                                                            >
                                                                <div className="relative overflow-hidden border mb-1 aspect-[4/3] rounded-lg">
                                                                    <ThumbnailImage
                                                                        pageId={page.id}
                                                                        thumbnail={pageThumbnails[page.id]}
                                                                        altText="Back Cover"
                                                                        type="final"
                                                                    />
                                                                    {/* Indicador de cambios sin guardar */}
                                                                    {(pageChanges instanceof Map && pageChanges.has && pageChanges.has(pages.indexOf(page))) && (
                                                                        <div className="absolute top-1 right-1 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full shadow-sm">
                                                                            •
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 group-hover:opacity-100 opacity-80 transition-opacity">
                                                                        <span className="text-[10px] text-white font-medium block">
                                                                            Back Cover
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'panel' && (
                                        <div className="space-y-4">


                                            <LayerPanel
                                                pages={pages}
                                                currentPage={currentPage}
                                                selectedCell={selectedCell}
                                                selectedElement={selectedElement}
                                                onSelectCell={setSelectedCell}
                                                onSelectElement={setSelectedElement}
                                                onUpdateElement={(cellId, elementId, updates) => {
                                                    updateElementInCell(cellId, elementId, updates);
                                                }}
                                                onDeleteElement={(cellId, elementId) => {
                                                    deleteElementFromCell(cellId, elementId);
                                                }}
                                                onMoveElement={(cellId, elementId, direction) => {
                                                    moveElementInCell(cellId, elementId, direction);
                                                }}
                                            />
                                        </div>
                                    )}



                                    {activeTab === "filters" && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Filter className="h-5 w-5 text-[#af5cb8]" />
                                                <h3 className="font-semibold text-[#040404]">Filters</h3>
                                            </div>

                                            {(() => {
                                                const currentElement = getSelectedElement();
                                                return currentElement && currentElement.type === "image" ? (
                                                    <>
                                                        {currentElement.type === "image" && (
                                                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <ImageIcon className="h-4 w-4 text-[#af5cb8]" />
                                                                    <span className="text-sm font-medium">Selected Image</span>
                                                                </div>
                                                                <div className="w-full h-16 rounded-md overflow-hidden bg-gray-200">
                                                                    <img
                                                                        src={currentElement.content}
                                                                        alt=""
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {currentElement.type === "image" && (
                                                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                                <h4 className="font-medium text-[#040404] mb-3">Masks</h4>
                                                                <MaskSelector
                                                                    selectedMask={currentElement.mask || "none"}
                                                                    onSelect={(maskId) => {
                                                                        updateElementInCell(
                                                                            selectedCell,
                                                                            selectedElement,
                                                                            { mask: maskId }
                                                                        );
                                                                    }}
                                                                    availableMasks={imageMasks.map(m => m.id)}
                                                                    selectedImage={currentElement}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                            <h4 className="font-medium text-[#040404] mb-3">Filters & Effects</h4>
                                                            <FilterControls
                                                                filters={currentElement.filters || {}}
                                                                onFilterChange={(newFilters) => {
                                                                    updateElementInCell(
                                                                        selectedCell,
                                                                        selectedElement,
                                                                        { filters: newFilters }
                                                                    );
                                                                }}
                                                                selectedElement={currentElement}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center py-8 px-4 bg-white rounded-lg border border-gray-200">
                                                        <div className="bg-gray-100 p-4 rounded-lg mb-3 inline-block">
                                                            <ImageIcon className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                        <h4 className="text-sm font-medium text-[#040404] mb-2">
                                                            Select an image to apply filters
                                                        </h4>
                                                        <p className="text-xs text-gray-600">
                                                            {getSelectedElement() ? 
                                                                'Filters are only available for image elements' : 
                                                                'Click on an image element in your canvas to access filters and effects'
                                                            }
                                                        </p>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}


                                </div>
                            </div>
                        </div>

                        {/* Main canvas area */}
                        <main className="flex-1 flex flex-col h-full">

                            <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
                               
                                
                                    <>
                                        {/* Left side - History controls */}
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-1">
                                                {/* Botones de control de página */}

                                                <button
                                                    onClick={() => setActiveTab('templates')}
                                                    className="bg-white/90 hover:bg-white text-gray-700 px-3 py-1.5 rounded-lg shadow-md text-sm font-medium flex items-center gap-1.5 transition-all duration-200 hover:shadow-lg"
                                                >
                                                    <Layout className="h-4 w-4" />
                                                    Diseño de página
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('panel')}
                                                    className="bg-white/90 hover:bg-white text-gray-700 px-3 py-1.5 rounded-lg shadow-md text-sm font-medium flex items-center gap-1.5 transition-all duration-200 hover:shadow-lg"
                                                >
                                                    <Layers className="h-4 w-4" />
                                                    Superponer objetos
                                                </button>

                                            </div>

                                            <div className="h-6 w-px bg-gray-300 mx-2"></div>

                                            {/* Quick add tools */}
                                            <div className="flex space-x-1">
                                              
                                                <Button
                                                    variant="ghost"
                                                    tooltip="Añadir Imagen"
                                                    onClick={() => imageInputRef.current && imageInputRef.current.click()}
                                                >
                                                    <ImageIcon className="w-5 h-5" />
                                                </Button>

                                                <input
                                                    type="file"
                                                    ref={imageInputRef}
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    accept="image/*"
                                                />

                                                
                                            </div>

                                              {selectedElement && (
                                                <div className="flex space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (selectedElement && selectedCell) {
                                                                const element = getSelectedElement();
                                                                if (element) {
                                                                    const duplicateElement = {
                                                                        ...element,
                                                                        id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                                                        position: {
                                                                            x: element.position.x + 0.05,
                                                                            y: element.position.y + 0.05
                                                                        }
                                                                    };
                                                                    addElementToCell(selectedCell, duplicateElement);
                                                                }
                                                            }
                                                        }}
                                                        className="h-8 px-2"
                                                        icon={<Copy className="h-4 w-4" />}
                                                    >
                                                        Duplicar
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (selectedElement && selectedCell) {
                                                                deleteElementFromCell(selectedCell, selectedElement);
                                                            }
                                                        }}
                                                        className="h-8 px-2 text-red-600 hover:text-white"
                                                        icon={<Trash2 className="h-4 w-4" />}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            )}


                       
                                           
                                        </div>

                                      



                                    </>
                               
                            </div>


                            {/* Canvas workspace - centered */}
                            <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden bg-gray-100">


                                {previewMode ? (
                                    <div className="bg-white rounded-lg shadow-lg">
                                        <div
                                            className="overflow-hidden"
                                            style={{
                                                width: workspaceDimensions.width,
                                                height: workspaceDimensions.height,
                                            }}
                                        >
                                            <div
                                                id={`page-${pages[currentPage].id}`}
                                                className={`grid ${getCurrentLayout().template} gap-6`}
                                                style={{ width: '100%', height: '100%' }}
                                            >
                                                {pages[currentPage].cells.map((cell, idx) => {
                                                    return (
                                                        <EditableCell
                                                            key={cell.id}
                                                            id={cell.id}
                                                            elements={cell.elements.filter(el => !el.locked)}
                                                            workspaceSize={workspaceDimensions}
                                                            cellStyle={getCurrentLayout().cellStyles?.[pages[currentPage].cells.indexOf(cell)]}
                                                            selectedElement={selectedCell === cell.id ? selectedElement : null}
                                                            onSelectElement={handleSelectElement}
                                                            onAddElement={(element, cellId) => addElementToCell(cellId, element)}
                                                            onUpdateElement={(elementId, updates, isDuplicate) =>
                                                                updateElementInCell(cell.id, elementId, updates, isDuplicate)}
                                                            onDeleteElement={(elementId) => deleteElementFromCell(cell.id, elementId)}
                                                            availableMasks={getCurrentLayout().maskCategories.flatMap((cat) => cat.masks)}
                                                            projectData={projectData}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        id={`page-${pages[currentPage].id}`}
                                        className=" shadow-xl overflow-hidden"
                                        style={{
                                            width: workspaceDimensions.width,
                                            height: workspaceDimensions.height,
                                            position: 'relative',
                                            backgroundColor: pages[currentPage]?.backgroundColor || '#ffffff',
                                            backgroundImage: pages[currentPage]?.backgroundImage ? `url(${pages[currentPage].backgroundImage})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                    >


                                        {/* Background layer */}
                                        {(() => {
                                            const page = pages[currentPage];

                                            // Usar las propiedades backgroundImage y backgroundColor que ya están configuradas en la página
                                            if (page?.backgroundImage) {
                                                return (
                                                    <img
                                                        src={page.backgroundImage}
                                                        alt="background"
                                                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                                        style={{
                                                            zIndex: 1,
                                                        }}

                                                    />
                                                );
                                            } else if (page?.backgroundColor) {
                                                return (
                                                    <div
                                                        className="absolute inset-0 w-full h-full pointer-events-none"
                                                        style={{
                                                            backgroundColor: page.backgroundColor,
                                                            zIndex: 1,
                                                        }}
                                                    />
                                                );
                                            }

                                            return null;
                                        })()}

                                        {/* Editable cells layer */}
                                        <div
                                            className={`grid ${getCurrentLayout().template}`}
                                            style={{
                                                position: 'relative',
                                                zIndex: 10,
                                                width: '100%',
                                                height: '100%',
                                                boxSizing: 'border-box',
                                                gap: getCurrentLayout().style?.gap || '16px',
                                                padding: getCurrentLayout().style?.padding || '16px'
                                            }}
                                        >
                                            {pages[currentPage].cells.map((cell) => (
                                                <EditableCell
                                                    key={cell.id}
                                                    id={cell.id}
                                                    elements={cell.elements.filter(el => !el.locked)}
                                                    workspaceSize={workspaceDimensions}
                                                    cellStyle={getCurrentLayout().cellStyles?.[pages[currentPage].cells.indexOf(cell)]}
                                                    selectedElement={selectedCell === cell.id ? selectedElement : null}
                                                    onSelectElement={handleSelectElement}
                                                    onAddElement={(element, cellId) => addElementToCell(cellId, element)}
                                                    onUpdateElement={(elementId, updates, isDuplicate) =>
                                                        updateElementInCell(cell.id, elementId, updates, isDuplicate)}
                                                    onDeleteElement={(elementId) => deleteElementFromCell(cell.id, elementId)}
                                                    availableMasks={getCurrentLayout().maskCategories.flatMap((cat) => cat.masks)}
                                                    projectData={projectData}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            )}

            {/* Toaster para notificaciones */}
            <Toaster />

            {/* Modal de recuperación de progreso - DESHABILITADO: Carga automática */}
            {/* 
            <ProgressRecoveryModal
                isOpen={showProgressRecovery}
                onClose={() => setShowProgressRecovery(false)}
                savedProgress={savedProgress}
                onLoadProgress={handleLoadProgress}
                onDiscardProgress={handleDiscardProgress}
            />
            */}
        </DndProvider>
    );
}
