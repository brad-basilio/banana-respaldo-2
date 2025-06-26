import { useState, useRef, useCallback, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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
} from "lucide-react";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
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
import { useSaveProject } from "./utils/useSaveProject";
import SaveIndicator from "./components/UI/SaveIndicator";

// Componente principal del editor
export default function EditorLibro() {
    // Estados para cargar datos desde el backend
    const [projectData, setProjectData] = useState(null);
    const [itemData, setItemData] = useState(null);
    const [presetData, setPresetData] = useState(null);
    const [initialProject, setInitialProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

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

                console.log('� Cargando proyecto con ID:', projectId);

                // Realizar fetch al backend para obtener los datos del proyecto
                const response = await fetch(`/api/canvas/projects/${projectId}`, {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al cargar el proyecto');
                }

                const data = await response.json();

                console.log('✅ Datos del proyecto cargados:', data);

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

    // Debug: Log de los datos cuando se cargan
    useEffect(() => {
        if (projectData && itemData && presetData) {
            console.log('🔍 Editor datos cargados exitosamente:');
            console.log('📦 project:', projectData);
            console.log('🎯 item:', itemData);
            console.log('🎨 canvasPreset:', presetData);
            console.log('📄 initialProject:', initialProject);
        }
    }, [projectData, itemData, presetData, initialProject]);

    // Actualizar estados del editor cuando se cargan los datos del proyecto
    useEffect(() => {
        if (initialProject && itemData && presetData) {
            console.log('🔄 Actualizando estados del editor con datos del proyecto');

            // En lugar de usar directamente initialProject.pages, recreamos las páginas
            // para asegurar que tengan las propiedades backgroundImage y backgroundColor correctas
            if (initialProject.pages && Array.isArray(initialProject.pages)) {
                console.log('🔧 Recreando páginas con backgrounds actualizados...');

                // Si ya hay páginas en initialProject, las usamos como base pero actualizamos los backgrounds
                const updatedPages = initialProject.pages.map(page => {
                    let backgroundImage = null;
                    let backgroundColor = presetData.background_color || '#ffffff';

                    // Aplicar la lógica de background según el tipo de página
                    if (page.type === 'cover') {
                        if (itemData.cover_image) {
                            backgroundImage = `/storage/images/item/${itemData.cover_image}`;
                            console.log('🖼️ [UPDATE] Cover page - usando cover_image:', backgroundImage);
                        } else {
                            console.log('🎨 [UPDATE] Cover page - usando background_color:', backgroundColor);
                        }
                    } else if (page.type === 'content') {
                        if (itemData.content_image) {
                            backgroundImage = `/storage/images/item/${itemData.content_image}`;
                            console.log('🖼️ [UPDATE] Content page - usando content_image:', backgroundImage);
                        } else {
                            console.log('🎨 [UPDATE] Content page - usando background_color:', backgroundColor);
                        }
                    } else if (page.type === 'final' || page.type === 'contraportada') {
                        if (itemData.back_cover_image) {
                            backgroundImage = `/storage/images/item/${itemData.back_cover_image}`;
                            console.log('🖼️ [UPDATE] Final page - usando back_cover_image:', backgroundImage);
                        } else {
                            console.log('🎨 [UPDATE] Final page - usando background_color:', backgroundColor);
                        }
                    }

                    return {
                        ...page,
                        backgroundImage,
                        backgroundColor
                    };
                });

                console.log('✅ Páginas actualizadas con backgrounds:', updatedPages);
                setPages(updatedPages);

                // Inicializar historial con las páginas actualizadas
                setHistory([JSON.stringify(updatedPages)]);
                setHistoryIndex(0);
            } else {
                // Si no hay páginas, crear páginas nuevas usando createPagesFromPreset
                console.log('🆕 No hay páginas existentes, creando nuevas...');
                const newPages = createPagesFromPreset(presetData, itemData);
                setPages(newPages);
                setHistory([JSON.stringify(newPages)]);
                setHistoryIndex(0);
            }

            if (typeof initialProject.currentPage === 'number') {
                setCurrentPage(initialProject.currentPage);
            }

            if (initialProject.workspaceSize) {
                setWorkspaceSize(initialProject.workspaceSize);
            }
        }
    }, [initialProject, itemData, presetData]);

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
    const [activeTab, setActiveTab] = useState("elements");
    const [filterTab, setFilterTab] = useState("basic");
    const [history, setHistory] = useState([JSON.stringify(pages)]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [previewMode, setPreviewMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [pageThumbnails, setPageThumbnails] = useState({});
    // Añade estos estados al principio del componente EditorLibro
    const [textToolbarVisible, setTextToolbarVisible] = useState(false);
    const [textEditingOptions, setTextEditingOptions] = useState({
        elementId: null,
        cellId: null,
    });
    const [isBookPreviewOpen, setIsBookPreviewOpen] = useState(false);

    // Save system integration
    const saveHook = useSaveProject(
        pages,
        projectData,
        itemData,
        presetData,
        { width: 800, height: 600 }, // workspaceDimensions
        pageThumbnails
    );

    // Función para obtener el storage key único basado en el proyecto
    const getStorageKey = () => {
        return `editor_progress_project_${projectData?.id}`;
    };

    // Efecto para inicializar páginas cuando se cargan los datos del proyecto
    useEffect(() => {
        if (projectData && itemData && presetData) {
            console.log('✅ Todos los datos están disponibles, inicializando editor...');
            console.log('📦 projectData:', presetData, projectData, itemData);
            // Si no hay páginas iniciales o initialProject, crear desde el preset
            if (!initialProject?.pages || initialProject.pages.length === 0) {
                console.log('📝 No hay páginas iniciales, creando desde preset...');
                createPagesFromPreset(presetData, itemData);
            }
            // Las páginas ya se configuran en el otro useEffect que maneja initialProject
        }
    }, [projectData, itemData, presetData, initialProject]);



    // Función para crear páginas basadas en el preset
    const createPagesFromPreset = (preset, item) => {
        try {
            console.log('Creating pages from preset:', preset);
            console.log('Item data:', item);

            // Debug: Mostrar las imágenes disponibles
            console.log('🖼️ Imágenes disponibles:');
            console.log('   - Portada (cover_image):', item.cover_image);
            console.log('   - Contenido (content_image):', item.content_image);
            console.log('   - Contraportada (back_cover_image):', item.back_cover_image);
            console.log('   - Color de fondo del preset:', preset.background_color);

            const newPages = [];
            const totalPages = preset.pages || item.pages || 20; // Usar páginas del preset primero

            console.log('📄 Total pages to create:', totalPages);

            // 1. PÁGINA DE PORTADA
            const coverBackgroundImage = item.cover_image ? `/storage/images/item/${item.cover_image}` : null;
            const coverBackgroundColor = !item.cover_image ? (preset.background_color || "#ffffff") : null;

            console.log('🖼️ [COVER] cover_image:', item.cover_image);
            console.log('🖼️ [COVER] backgroundImage construida:', coverBackgroundImage);
            console.log('🎨 [COVER] backgroundColor:', coverBackgroundColor);

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
                        {
                            id: "cover-title",
                            type: "text",
                            content: item.name || "Mi Álbum Personalizado",
                            position: { x: 10, y: 20 },
                            size: { width: 80, height: 15 },
                            style: {
                                fontSize: "28px",
                                fontFamily: "Arial",
                                color: "#000000",
                                fontWeight: "bold",
                                textAlign: "center",
                                backgroundColor: "transparent",
                                padding: "8px"
                            },
                            zIndex: 2
                        },
                        // Imagen del item si existe
                        ...(item.image ? [{
                            id: "cover-image",
                            type: "image",
                            content: `/storage/images/item/${item.image}`,
                            position: { x: 25, y: 40 },
                            size: { width: 50, height: 40 },
                            filters: {},
                            mask: "none",
                            zIndex: 1
                        }] : [])
                    ]
                }]
            };

            newPages.push(coverPage);

            // 2. PÁGINAS DE CONTENIDO
            const contentBackgroundImage = item.content_image ? `/storage/images/item/${item.content_image}` : null;
            const contentBackgroundColor = !item.content_image ? (preset.background_color || "#ffffff") : null;

            console.log('🖼️ [CONTENT] content_image:', item.content_image);
            console.log('🖼️ [CONTENT] backgroundImage construida:', contentBackgroundImage);
            console.log('🎨 [CONTENT] backgroundColor:', contentBackgroundColor);

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
                            // Número de página
                            {
                                id: `page-number-${i}`,
                                type: "text",
                                content: `Página ${i}`,
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
                                id: `content-area-${i}`,
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

                newPages.push(contentPage);
            }

            // 3. PÁGINA FINAL/CONTRAPORTADA
            const finalBackgroundImage = item.back_cover_image ? `/storage/images/item/${item.back_cover_image}` : null;
            const finalBackgroundColor = !item.back_cover_image ? (preset.background_color || "#ffffff") : null;

            console.log('🖼️ [FINAL] back_cover_image:', item.back_cover_image);
            console.log('🖼️ [FINAL] backgroundImage construida:', finalBackgroundImage);
            console.log('🎨 [FINAL] backgroundColor:', finalBackgroundColor);

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
                        /*{
                            id: "final-text",
                            type: "text",
                            content: "Fin del Álbum",
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
                        }*/
                    ]
                }]
            };

            newPages.push(finalPage);

            console.log('✅ Created pages:', newPages);
            setPages(newPages);
            setCurrentPage(0); // Empezar en la portada

            // Configurar dimensiones del workspace basadas en el preset
            if (preset.width && preset.height) {
                console.log('📐 Canvas dimensions found, setting workspace to preset dimensions');
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
                console.log('Elemento bloqueado, no se puede seleccionar');
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
                console.log(selectedImage);
            } else if (element?.type === "text") {
                setTextToolbarVisible(true);
                setTextEditingOptions({
                    elementId,
                    cellId: cellId || selectedCell,
                });
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

    // Actualizar el estado de las páginas y guardar en localStorage
    const updatePages = (newPages) => {
        setPages(newPages);
        // Actualizar el historial
        const newHistory = [
            ...history.slice(0, historyIndex + 1),
            JSON.stringify(newPages),
        ];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        // Guardar en localStorage
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify({
            pages: newPages,
            currentPage,
            savedAt: Date.now(),
        }));
    };

    // Guardar currentPage en localStorage cuando cambie
    useEffect(() => {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify({
            pages,
            currentPage,
            savedAt: Date.now(),
        }));
    }, [currentPage]);
    // (Opcional) Botón para limpiar progreso guardado
    const clearSavedProgress = () => {
        const storageKey = getStorageKey();
        localStorage.removeItem(storageKey);
        window.location.reload();
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
            console.log('No se puede eliminar la portada o contraportada');
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
            console.log('Solo se pueden duplicar páginas de contenido');
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

    // Añadir un elemento a una celda
    const addElementToCell = (cellId, element) => {
        console.log('[Editor] addElementToCell', { cellId, elementId: element.id });
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

    // Actualizar un elemento en una celda
    const updateElementInCell = (
        cellId,
        elementId,
        updates,
        isDuplicate = false
    ) => {
        const updatedPages = [...pages];
        const cellIndex = updatedPages[currentPage].cells.findIndex(
            (cell) => cell.id === cellId
        );

        if (cellIndex !== -1) {
            if (isDuplicate) {
                // Añadir como nuevo elemento
                updatedPages[currentPage].cells[cellIndex].elements.push({
                    ...updatedPages[currentPage].cells[cellIndex].elements.find(
                        (el) => el.id === elementId
                    ),
                    ...updates,
                });
            } else {
                // Actualizar elemento existente
                const elementIndex = updatedPages[currentPage].cells[
                    cellIndex
                ].elements.findIndex((el) => el.id === elementId);

                if (elementIndex !== -1) {
                    updatedPages[currentPage].cells[cellIndex].elements[
                        elementIndex
                    ] = {
                        ...updatedPages[currentPage].cells[cellIndex].elements[
                        elementIndex
                        ],
                        ...updates,
                    };
                }
            }
            updatePages(updatedPages);
        }
    };

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
    const handleAddText = () => {
        const newId = `text-${Date.now()}`;
        const newElement = {
            id: newId,
            type: "text",
            content: "Haz clic para editar",
            position: { x: 0.05, y: 0.05 }, // Posición en porcentajes para responsividad
            size: { width: 0.4, height: 0.15 }, // Tamaño en porcentajes para consistencia (40% y 15% de la celda)
            style: {
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
            },
        };

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

    // Estado para las dimensiones calculadas
    const [workspaceDimensions, setWorkspaceDimensions] = useState({ width: 800, height: 600 });

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

    useEffect(() => {
        const generateThumbnails = async () => {
            try {
                console.log('🔄 Iniciando generación de miniaturas...');

                // Crear una copia profunda de las páginas para evitar mutaciones
                const pagesToProcess = JSON.parse(JSON.stringify(pages));

                // Procesar cada página para asegurar el orden correcto de celdas y elementos
                const processedPages = pagesToProcess.map(page => ({
                    ...page,
                    cells: (page.cells || []).map(cell => ({
                        ...cell,
                        position: {
                            x: cell.position?.x || 0,
                            y: cell.position?.y || 0,
                            ...cell.position
                        },
                        size: {
                            width: cell.size?.width || workspaceDimensions.width,
                            height: cell.size?.height || workspaceDimensions.height,
                            ...cell.size
                        },
                        elements: (cell.elements || []).map(el => ({
                            ...el,
                            zIndex: el.zIndex || 0
                        })).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                    })).sort((a, b) => {
                        // Ordenar celdas por posición (Y, luego X)
                        const aY = a.position?.y || 0;
                        const bY = b.position?.y || 0;
                        if (aY !== bY) return aY - bY;
                        return (a.position?.x || 0) - (b.position?.x || 0);
                    })
                }));

                const thumbnails = await generateAccurateThumbnails({
                    pages: processedPages,
                    workspaceDimensions,
                    presetData
                });

                console.log('🖼️ Miniaturas generadas:', thumbnails);

                // Actualizar solo las miniaturas para las páginas que han cambiado
                setPageThumbnails(prev => {
                    const updated = {
                        ...prev,
                        ...Object.fromEntries(
                            Object.entries(thumbnails || {}).map(([pageId, thumbnail]) => [
                                pageId,
                                thumbnail || prev[pageId] // Mantener la miniatura anterior si la nueva es nula
                            ])
                        )
                    };
                    console.log('🔄 Miniaturas actualizadas:', updated);
                    return updated;
                });

            } catch (error) {
                console.error("❌ Error generando miniatura:", error);
            }
        };

        const debouncedGenerate = setTimeout(() => {
            generateThumbnails();
        }, 500);

        return () => clearTimeout(debouncedGenerate);
    }, [pages, currentPage, workspaceDimensions, presetData]);



    // --- Función para agregar álbum al carrito ---
    const addAlbumToCart = () => {
        console.log('🛒 === INICIO addAlbumToCart ===');

        try {
            console.log('📊 Estado actual:', {
                itemData: itemData,
                presetData: presetData,
                cartLength: cart?.length,
                hasItemData: !!itemData,
                hasPresetData: !!presetData,
                itemId: itemData?.id,
                presetId: presetData?.id
            });

            // Verificar que Local y Global estén disponibles PRIMERO
            console.log('🔍 Verificando dependencias...');
            console.log('Local type:', typeof Local);
            console.log('Global type:', typeof Global);
            console.log('Local object:', Local);
            console.log('Global object:', Global);

            if (typeof Local === 'undefined') {
                console.error('❌ Local no está definido');
                toast.error("Error del sistema", {
                    description: "Sistema Local no disponible.",
                    duration: 3000,
                    position: "bottom-center",
                });
                return false;
            }

            if (typeof Global === 'undefined') {
                console.error('❌ Global no está definido');
                toast.error("Error del sistema", {
                    description: "Sistema Global no disponible.",
                    duration: 3000,
                    position: "bottom-center",
                });
                return false;
            }

            // Verificar APP_CORRELATIVE
            console.log('Global.APP_CORRELATIVE:', Global.APP_CORRELATIVE);

            if (!Global.APP_CORRELATIVE) {
                console.error('❌ Global.APP_CORRELATIVE no está definido');
                toast.error("Error del sistema", {
                    description: "Configuración del sistema incompleta.",
                    duration: 3000,
                    position: "bottom-center",
                });
                return false;
            }

            // Verificar datos del item y preset
            if (!itemData) {
                console.error('❌ itemData no está disponible');
                console.log('itemData actual:', itemData);
                toast.error("Error", {
                    description: "Datos del item no disponibles.",
                    duration: 3000,
                    position: "bottom-center",
                });
                return false;
            }

            if (!presetData) {
                console.error('❌ presetData no está disponible');
                console.log('presetData actual:', presetData);
                toast.error("Error", {
                    description: "Datos del preset no disponibles.",
                    duration: 3000,
                    position: "bottom-center",
                });
                return false;
            }

            console.log('✅ Todas las verificaciones pasaron, continuando...');

            // Verificar espacio en localStorage y limpiarlo si es necesario
            console.log('🧹 Verificando espacio en localStorage...');
            try {
                // Calcular tamaño actual del localStorage
                let totalSize = 0;
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        totalSize += localStorage[key].length;
                    }
                }
                console.log('📊 Tamaño actual del localStorage:', (totalSize / 1024 / 1024).toFixed(2), 'MB');

                // Si el localStorage está muy lleno (más de 8MB), limpiar datos innecesarios
                if (totalSize > 8 * 1024 * 1024) {
                    console.log('⚠️ localStorage lleno, limpiando datos innecesarios...');

                    // Limpiar thumbnails viejos y datos temporales
                    for (let key in localStorage) {
                        if (key.includes('thumbnail') || key.includes('temp') || key.includes('cache')) {
                            localStorage.removeItem(key);
                            console.log('🗑️ Eliminado:', key);
                        }
                    }
                }
            } catch (e) {
                console.warn('⚠️ Error al verificar localStorage:', e);
            }

            // Generar ID único para el álbum que incluya timestamp para evitar duplicados
            const timestamp = Date.now();
            const albumId = `album_${itemData.id}_${timestamp}`;
            console.log('🆔 ID generado para el álbum:', albumId);

            // Obtener thumbnail de la portada si está disponible
            let albumThumbnail = presetData.cover_image;
            if (pageThumbnails && pageThumbnails['page-cover']) {
                albumThumbnail = pageThumbnails['page-cover'];
            }
            console.log('🖼️ Thumbnail del álbum:', albumThumbnail);

            // Crear el producto del álbum para el carrito
            console.log('📦 Creando producto del álbum...');

            // Optimizar los datos del álbum para reducir el tamaño del carrito
            const optimizedItemData = {
                item_id: itemData.id,
                preset_id: presetData.id,
                pages_count: pages.length,
                title: itemData.title,
                description: itemData.description?.substring(0, 200) || "", // Limitar descripción
                selected_pages: itemData.pages,
                selected_cover_type: itemData.selected_cover_type,
                selected_finish: itemData.selected_finish,
                created_at: new Date().toISOString()
            };

            // Optimizar imagen del thumbnail (reducir calidad si es base64)
            let optimizedThumbnail = albumThumbnail;
            if (albumThumbnail && albumThumbnail.startsWith('data:image/')) {
                // Si es muy grande, usar una versión más pequeña o la imagen del preset
                if (albumThumbnail.length > 100000) { // Si es mayor a ~100KB
                    console.log('🖼️ Thumbnail muy grande, usando imagen del preset');
                    optimizedThumbnail = presetData.cover_image || '/assets/img/default-album.jpg';
                }
            }
            console.log('🖼️ Thumbnail optimizado:', presetData);

            const albumProduct = {
                id: albumId, // ID único para el álbum
                name: itemData.title || `Álbum Personalizado - ${presetData.name}`,
                image: presetData?.image || optimizedThumbnail, // Usar thumbnail optimizado
                price: presetData.price || 0,
                final_price: presetData.final_price || presetData.price || 0,
                discount: presetData.discount || null,
                slug: `album-${itemData.id}-${timestamp}`,
                quantity: 1,
                type: 'custom_album', // Identificar que es un álbum personalizado
                item_data: optimizedItemData, // Datos optimizados
                preset_data: {
                    id: presetData.id,
                    name: presetData.name,
                    cover_image: presetData.cover_image,
                    price: presetData.price,
                    final_price: presetData.final_price
                }
            };

            console.log('📦 Producto del álbum creado exitosamente');
            console.log('📊 Tamaño estimado del producto:', JSON.stringify(albumProduct).length, 'caracteres');

            // Obtener carrito actual directamente de localStorage para asegurar sincronización
            console.log('🛒 Obteniendo carrito actual...');
            const cartKey = `${Global.APP_CORRELATIVE}_cart`;
            console.log('🔑 Clave del carrito:', cartKey);

            const currentCart = Local.get(cartKey) || [];
            console.log('🛒 Carrito actual desde localStorage:', currentCart);
            console.log('🛒 Longitud del carrito actual:', currentCart.length);

            // Agregar al carrito (siempre como nuevo item para álbumes personalizados)
            console.log('➕ Agregando producto al carrito...');
            let newCart = [...currentCart, albumProduct];
            console.log('🛒 Nuevo carrito:', newCart);
            console.log('🛒 Nueva longitud del carrito:', newCart.length);

            // Actualizar tanto el estado local como localStorage
            console.log('💾 Guardando en estado y localStorage...');

            let storageError = null;

            try {
                setCart(newCart);
                Local.set(cartKey, newCart);
                console.log('✅ Carrito actualizado en estado y localStorage');
            } catch (error) {
                storageError = error;
                if (error.name === 'QuotaExceededError') {
                    console.error('❌ Error de cuota de localStorage excedida');

                    // Intentar liberar espacio eliminando elementos del carrito antiguos
                    console.log('🧹 Intentando liberar espacio del carrito...');

                    try {
                        // Mantener solo los últimos 3 elementos del carrito
                        const reducedCart = currentCart.slice(-2); // Solo los últimos 2
                        const finalCart = [...reducedCart, albumProduct]; // Más el nuevo

                        console.log('📦 Carrito reducido:', finalCart);

                        setCart(finalCart);
                        Local.set(cartKey, finalCart);

                        console.log('✅ Carrito guardado con espacio reducido');

                        // Actualizar la referencia del carrito para las verificaciones
                        newCart = finalCart;

                        toast.success("Álbum agregado al carrito", {
                            description: "Se liberó espacio eliminando productos antiguos.",
                            duration: 4000,
                            position: "bottom-center",
                        });

                    } catch (secondError) {
                        console.error('❌ No se pudo liberar espacio suficiente:', secondError);

                        // Como último recurso, guardar solo la información esencial
                        try {
                            const minimalProduct = {
                                id: albumId,
                                name: albumProduct.name,
                                price: albumProduct.price,
                                final_price: albumProduct.final_price,
                                quantity: 1,
                                type: 'custom_album',
                                item_data: {
                                    item_id: itemData.id,
                                    preset_id: presetData.id,
                                    title: itemData.title
                                }
                            };

                            const minimalCart = [minimalProduct];
                            setCart(minimalCart);
                            Local.set(cartKey, minimalCart);

                            console.log('✅ Guardado con datos mínimos');
                            newCart = minimalCart;

                            toast.success("Álbum agregado al carrito", {
                                description: "Guardado con información esencial.",
                                duration: 3000,
                                position: "bottom-center",
                            });

                        } catch (finalError) {
                            console.error('❌ Error final al guardar:', finalError);
                            throw new Error('No se pudo guardar en el carrito por falta de espacio');
                        }
                    }
                } else {
                    throw error;
                }
            }

            // Verificar que se guardó correctamente
            console.log('🔍 Verificando que se guardó correctamente...');
            const verifyCart = Local.get(cartKey);
            console.log('🔍 Verificación del carrito guardado:', verifyCart);
            console.log('🔍 Longitud del carrito verificado:', verifyCart?.length);

            // Verificar que el álbum específico está en el carrito
            const albumInCart = verifyCart?.find(item => item.id === albumId);
            console.log('📦 Álbum encontrado en carrito:', albumInCart ? 'SÍ' : 'NO');
            console.log('📦 Datos del álbum en carrito:', albumInCart);

            if (!albumInCart) {
                console.error('❌ ERROR: El álbum no se encontró en el carrito después de guardarlo');
                toast.error("Error al verificar carrito", {
                    description: "El álbum no se guardó correctamente en el carrito.",
                    duration: 3000,
                    position: "bottom-center",
                });
                return false;
            }

            // Solo mostrar notificación si no se mostró antes (en caso de espacio reducido)
            if (!storageError || storageError.name !== 'QuotaExceededError') {
                // Mostrar notificación de éxito
                console.log('✅ Mostrando notificación de éxito...');
                toast.success("Álbum agregado al carrito", {
                    description: `${albumProduct.name} se ha añadido al carrito.`,
                    icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
                    duration: 3000,
                    position: "bottom-center",
                });
            }

            // Disparar evento personalizado para notificar otros componentes
            console.log('📡 Disparando evento cartUpdated...');
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: newCart, action: 'add', product: albumProduct }
            }));

            console.log('🛒 === FIN addAlbumToCart EXITOSO ===');
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
            if (!projectData?.id) {
                alert('Error: No se encontró el ID del proyecto');
                return false;
            }

            // Optimizar y comprimir los datos del diseño
            const optimizePages = (pages) => {
                return pages.map(page => ({
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
            };

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

            // Verificar el tamaño del payload
            const dataString = JSON.stringify({ design_data: designData });
            const dataSizeKB = Math.round(dataString.length / 1024);
            const dataSizeMB = Math.round(dataSizeKB / 1024 * 100) / 100;

            console.log(`Tamaño del payload: ${dataSizeKB} KB (${dataSizeMB} MB)`);

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
            console.log(`Imágenes base64 encontradas: ${base64Images}, Tamaño total: ${base64SizeMB} MB`);

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

            // Determinar la URL base correcta
            const baseUrl = window.location.origin.includes('bananalab')
                ? '/projects/bananalab/public'
                : '';

            // Enviar al backend
            const response = await fetch(`${baseUrl}/api/canvas/projects/${projectData.id}/save`, {
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

            console.log('✅ Diseño finalizado exitosamente en el servidor');
            console.log('📄 Respuesta del servidor:', result);

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

    // --- Generar PDF del álbum (fiel al render del editor) ---
    // Renderiza cada página usando el mismo componente React en un contenedor oculto
    window.generateAlbumPDF = async () => {
        // 1. Crear un contenedor oculto React en el DOM
        let hiddenContainer = document.getElementById('pdf-hidden-pages');
        if (!hiddenContainer) {
            hiddenContainer = document.createElement('div');
            hiddenContainer.id = 'pdf-hidden-pages';
            hiddenContainer.style.position = 'fixed';
            hiddenContainer.style.left = '-99999px';
            hiddenContainer.style.top = '0';
            hiddenContainer.style.width = '800px';
            hiddenContainer.style.zIndex = '-1';
            document.body.appendChild(hiddenContainer);
        }
        hiddenContainer.innerHTML = '';

        // 2. Renderizar cada página usando React (idéntico al editor)
        // Creamos un mini-app React temporal para renderizar las páginas
        const renderPage = (page, idx) => {
            const layout = layouts.find(l => l.id === page.layout) || layouts[0];
            return (
                <div
                    key={page.id}
                    id={`pdf-page-${page.id}`}
                    style={{
                        width: 800,
                        height: 600,
                        background: '#fff',
                        overflow: 'hidden',
                        position: 'relative',
                        boxSizing: 'border-box',
                        display: 'block',
                        margin: 0,
                        padding: 0,
                    }}
                >
                    <div
                        className={`grid ${layout.template}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            gap: layout.style?.gap || '16px',
                            padding: layout.style?.padding || '16px',
                            boxSizing: 'border-box',
                        }}
                    >
                        {page.cells.map((cell, cellIdx) => (
                            <div
                                key={cell.id}
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    background: '#f9fafb',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                }}
                            >
                                {cell.elements.map((element) =>
                                    element.type === 'image' ? (
                                        <div
                                            key={element.id}
                                            className={imageMasks.find(m => m.id === element.mask)?.class || ''}
                                            style={{
                                                position: 'absolute',
                                                left: element.position.x,
                                                top: element.position.y,
                                                width: '100%',
                                                height: '100%',
                                                zIndex: element.zIndex || 1,
                                            }}
                                        >
                                            <img
                                                src={element.content}
                                                alt=""
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    filter: `brightness(${(element.filters?.brightness || 100) / 100}) contrast(${(element.filters?.contrast || 100) / 100}) saturate(${(element.filters?.saturation || 100) / 100}) sepia(${(element.filters?.tint || 0) / 100}) hue-rotate(${(element.filters?.hue || 0) * 3.6}deg) blur(${element.filters?.blur || 0}px)`,
                                                    transform: `scale(${element.filters?.scale || 1}) rotate(${element.filters?.rotate || 0}deg)${element.filters?.flipHorizontal ? ' scaleX(-1)' : ''}${element.filters?.flipVertical ? ' scaleY(-1)' : ''}`,
                                                    mixBlendMode: element.filters?.blendMode || 'normal',
                                                    opacity: (element.filters?.opacity || 100) / 100,
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            key={element.id}
                                            style={{
                                                position: 'absolute',
                                                left: element.position.x,
                                                top: element.position.y,
                                                fontFamily: element.style?.fontFamily,
                                                fontSize: element.style?.fontSize,
                                                fontWeight: element.style?.fontWeight,
                                                fontStyle: element.style?.fontStyle,
                                                textDecoration: element.style?.textDecoration,
                                                color: element.style?.color,
                                                textAlign: element.style?.textAlign,
                                                background: element.style?.backgroundColor || 'transparent',
                                                padding: element.style?.padding || '8px',
                                                borderRadius: element.style?.borderRadius || '0px',
                                                border: element.style?.border || 'none',
                                                opacity: element.style?.opacity || 1,
                                            }}
                                        >
                                            {element.content}
                                        </div>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        // Renderizar usando ReactDOM
        const ReactDOM = await import('react-dom');
        await new Promise((resolve) => {
            ReactDOM.render(
                <div>
                    {pages.map((page, idx) => renderPage(page, idx))}
                </div>,
                hiddenContainer,
                resolve
            );
        });

        // 3. Capturar cada página y agregar al PDF
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 600] });
        for (let i = 0; i < pages.length; i++) {
            const pageDiv = document.getElementById(`pdf-page-${pages[i].id}`);
            const canvas = await html2canvas(pageDiv, { backgroundColor: '#fff', scale: 2 });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            if (i > 0) pdf.addPage([800, 600], 'landscape');
            pdf.addImage(imgData, 'JPEG', 0, 0, 800, 600);
        }
        pdf.save('album.pdf');
        // 4. Limpiar el DOM
        hiddenContainer.innerHTML = '';
    };

    return (
        <DndProvider backend={HTML5Backend}>
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
                <div className="h-screen w-screen overflow-hidden bg-gray-50 font-paragraph">
                    { /* Book Preview Modal */}
                    <BookPreviewModal
                        isOpen={isBookPreviewOpen}
                        onRequestClose={() => setIsBookPreviewOpen(false)}
                        pages={pages.map((page) => ({
                            ...page,
                            layout: layouts.find((l) => l.id === page.layout) || layouts[0],
                        }))}
                        workspaceDimensions={workspaceDimensions}
                        getCurrentLayout={(page) => {
                            if (!page) return layouts[0];
                            return layouts.find((l) => l.id === page.layout) || layouts[0];
                        }}
                        presetData={presetData}
                        pageThumbnails={pageThumbnails}
                        addAlbumToCart={addAlbumToCart}
                    />

                    {/* Header - Top Bar */}
                    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-primary shadow-sm flex items-center px-4 z-10">
                        <div className="container mx-auto flex items-center justify-between">
                            {/* Logo and brand */}
                            <div className="flex items-center gap-3">
                                <img
                                    src={`/assets/resources/logo.png?v=${crypto.randomUUID()}`}
                                    alt={Global.APP_NAME}
                                    className="h-7 object-contain object-center invert brightness-0"
                                />
                                <div className="h-6 w-px bg-white/20"></div>
                                <h1 className="text-lg font-bold text-white truncate hidden sm:block">
                                    {projectData?.name || "Álbum Sin Título"}
                                </h1>
                            </div>

                            {/* Page information */}
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 rounded-full px-4 py-1.5 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
                                    <p className="text-sm text-white font-medium">
                                        {getCurrentPageTitle()}
                                    </p>
                                </div>

                                <div className="text-xs text-white/70 hidden sm:block">
                                    {pages.length > 0 && `${pages.length} páginas total`}
                                </div>

                                {isCurrentPageEditable() ? (
                                    <span className="bg-white/10 text-white/80 px-2 py-2 rounded-md text-xs font-medium flex items-center gap-1">
                                        <Pencil className="h-3 w-3" />

                                    </span>
                                ) : (
                                    <span className="bg-white/10 text-white/80 px-2 py-2 rounded-md text-xs font-medium flex items-center gap-1">
                                        <Lock className="h-3 w-3" />

                                    </span>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 items-center">
                                {/* Save indicator */}
                                <SaveIndicator
                                    saveStatus={saveHook.saveStatus}
                                    lastSaved={saveHook.lastSaved}
                                    onManualSave={saveHook.manualSave}
                                />

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsBookPreviewOpen(true)}
                                    icon={<Book className="h-4 w-4" />}
                                >
                                    Vista de Álbum
                                </Button>
                                {/*  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={addAlbumToCart}
                                    icon={<Plus className="h-4 w-4" />}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Agregar al Carrito
                                </Button> */}
                                {/* Botón para limpiar progreso guardado (opcional, visible solo en desarrollo) */}
                                {process.env.NODE_ENV !== 'production' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearSavedProgress}
                                        icon={<Trash2 className="h-4 w-4" />}
                                        className="text-white hover:bg-red-500"
                                    >
                                        Limpiar progreso
                                    </Button>
                                )}
                            </div>
                        </div>
                    </header>

                    <div className="flex w-full h-full pt-16">
                        {/* Left sidebar */}
                        <aside className="w-64 bg-white border-r flex flex-col">
                            {/* Tab navigation */}
                            <div className="p-3 border-b">
                                <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
                                    <button
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${activeTab === "elements"
                                            ? "bg-white shadow-sm text-purple-700"
                                            : "customtext-neutral-dark hover:bg-white/50"
                                            }`}
                                        onClick={() => setActiveTab("elements")}
                                    >
                                        Elementos
                                    </button>
                                    <button
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${activeTab === "filters"
                                            ? "bg-white shadow-sm text-purple-700"
                                            : "customtext-neutral-dark hover:bg-white/50"
                                            }`}
                                        onClick={() => setActiveTab("filters")}
                                    >
                                        Filtros
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar content */}
                            <div className="flex-1 overflow-y-auto p-3 custom-scroll">
                                {activeTab === "elements" && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-medium text-xs uppercase customtext-neutral-dark mb-2">
                                                Layouts
                                            </h3>
                                            <LayoutSelector
                                                currentLayoutId={pages[currentPage]?.layout}
                                                onLayoutChange={changeLayout}
                                            />
                                        </div>

                                        {/*       <div>
                                            <h3 className="font-medium text-xs uppercase customtext-neutral-dark mb-2">
                                                Herramientas rápidas
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const input = document.createElement("input");
                                                        input.type = "file";
                                                        input.accept = "image/*";
                                                        input.onchange = (e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                const newId = `img-${Date.now()}`;
                                                                const newElement = {
                                                                    id: newId,
                                                                    type: "image",
                                                                    content: "",
                                                                    position: { x: 10, y: 10 },
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
                                                                    mask: "none",
                                                                };

                                                                const reader = new FileReader();
                                                                reader.onload = (e) => {
                                                                    if (e.target?.result) {
                                                                        newElement.content = e.target.result;
                                                                        if (selectedCell) {
                                                                            addElementToCell(selectedCell, newElement);
                                                                        } else {
                                                                            addElementToCell(pages[currentPage].cells[0].id, newElement);
                                                                        }
                                                                    }
                                                                };
                                                                reader.readAsDataURL(e.target.files[0]);
                                                            }
                                                        };
                                                        input.click();
                                                    }}
                                                    className="justify-start"
                                                    icon={<ImageIcon className="h-4 w-4" />}
                                                >
                                                    Imagen
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleAddText}
                                                    className="justify-start"
                                                    icon={<Type className="h-4 w-4" />}
                                                >
                                                    Texto
                                                </Button>
                                            </div>
                                        </div> */}

                                        <div>
                                            <h3 className="font-medium text-xs uppercase customtext-neutral-dark mb-2">
                                                Capas
                                            </h3>
                                            <LayerPanel
                                                elements={
                                                    pages[currentPage].cells.find(
                                                        (cell) => cell.id === selectedCell
                                                    )?.elements || []
                                                }
                                                onReorder={(reorderedElements) => {
                                                    const updatedPages = [...pages];
                                                    const cellIndex = updatedPages[currentPage].cells.findIndex(
                                                        (cell) => cell.id === selectedCell
                                                    );
                                                    if (cellIndex !== -1) {
                                                        updatedPages[currentPage].cells[cellIndex].elements = reorderedElements;
                                                        updatePages(updatedPages);
                                                    }
                                                }}
                                                onSelect={handleSelectElement}
                                                selectedElement={selectedElement}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "filters" && (
                                    <div className="space-y-3 max-h-full">
                                        {(() => {
                                            const currentElement = getSelectedElement();

                                            return currentElement ? (
                                                <>
                                                    {/* Element preview */}
                                                    {currentElement.type === "image" && (
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <ImageIcon className="h-4 w-4 text-purple-600" />
                                                                <span className="text-sm font-medium">Imagen seleccionada</span>
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

                                                    {/* Masks section for images */}
                                                    {currentElement.type === "image" && (
                                                        <div className="border-t pt-3">
                                                            <h3 className="font-medium text-xs uppercase customtext-neutral-dark mb-2">
                                                                Máscaras
                                                            </h3>
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

                                                    {/* Filters section */}
                                                    <div className="border-t pt-3">
                                                        <h3 className="font-medium text-xs uppercase customtext-neutral-dark mb-2">
                                                            Filtros y efectos
                                                        </h3>
                                                        <div className="">
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
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center py-8 px-2">
                                                    <div className="bg-gray-100 p-4 rounded-lg mb-3">
                                                        <ImageIcon className="h-6 w-6 text-gray-400 mx-auto" />
                                                    </div>
                                                    <h3 className="text-sm font-medium customtext-neutral-dark">
                                                        Selecciona un elemento
                                                    </h3>
                                                    <p className="text-xs customtext-neutral-dark mt-1">
                                                        Para aplicar filtros y efectos, primero selecciona una imagen o texto en el lienzo
                                                    </p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* Main canvas area */}
                        <main className="flex-1 flex flex-col h-full">
                            {/* Enhanced top toolbar - switches between main toolbar and text toolbar */}
                            <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
                                {textToolbarVisible ? (
                                    /* Text editing toolbar */
                                    <>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setTextToolbarVisible(false)}
                                                className="h-8 px-2"
                                                icon={<ChevronLeft className="h-4 w-4" />}
                                            >
                                                Volver
                                            </Button>
                                            <div className="h-6 w-px bg-gray-300 mx-2"></div>
                                        </div>

                                        <div className="flex-1 flex justify-start">
                                            <TextToolbar
                                                element={getSelectedElement()}
                                                onUpdate={(updates) => {
                                                    updateElementInCell(
                                                        textEditingOptions.cellId,
                                                        textEditingOptions.elementId,
                                                        updates
                                                    );
                                                }}
                                                onClose={() => setTextToolbarVisible(false)}
                                            />
                                        </div>


                                    </>
                                ) : (
                                    /* Main toolbar */
                                    <>
                                        {/* Left side - History controls */}
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={undo}
                                                    disabled={historyIndex <= 0}
                                                    className="h-8 px-2"
                                                    icon={<Undo2 className="h-4 w-4" />}
                                                >
                                                    Deshacer
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={redo}
                                                    disabled={historyIndex >= history.length - 1}
                                                    className="h-8 px-2"
                                                    icon={<Redo2 className="h-4 w-4" />}
                                                >
                                                    Rehacer
                                                </Button>
                                            </div>

                                            <div className="h-6 w-px bg-gray-300 mx-2"></div>

                                            {/* Quick add tools */}
                                            <div className="flex space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const input = document.createElement("input");
                                                        input.type = "file";
                                                        input.accept = "image/*";
                                                        input.onchange = (e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                const newId = `img-${Date.now()}`;
                                                                const newElement = {
                                                                    id: newId,
                                                                    type: "image",
                                                                    content: "",
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
                                                                    mask: "none",
                                                                };

                                                                const reader = new FileReader();
                                                                reader.onload = (e) => {
                                                                    if (e.target?.result) {
                                                                        newElement.content = e.target.result;
                                                                        if (selectedCell) {
                                                                            addElementToCell(selectedCell, newElement);
                                                                        } else if (pages[currentPage]?.cells[0]) {
                                                                            addElementToCell(pages[currentPage].cells[0].id, newElement);
                                                                        }
                                                                    }
                                                                };
                                                                reader.readAsDataURL(e.target.files[0]);
                                                            }
                                                        };
                                                        input.click();
                                                    }}
                                                    className="h-8 px-2"
                                                    icon={<ImageIcon className="h-4 w-4" />}
                                                >
                                                    Imagen
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleAddText}
                                                    className="h-8 px-2"
                                                    icon={<Type className="h-4 w-4" />}
                                                >
                                                    Texto
                                                </Button>
                                            </div>

                                            <div className="h-6 w-px bg-gray-300 mx-2"></div>

                                            {/* Element actions */}
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

                                            <div className="flex items-center space-x-2">
                                                <WorkspaceControls
                                                    currentSize={workspaceSize}
                                                    onSizeChange={setWorkspaceSize}
                                                    presetData={presetData}
                                                    workspaceDimensions={workspaceDimensions}
                                                />
                                            </div>
                                        </div>

                                        {/* Center - Page info 
                                           <div className="flex items-center space-x-4">
                                            <div className="text-sm customtext-neutral-dark">
                                                {pages[currentPage] && (
                                                    <span>
                                                        {pages[currentPage].type === "cover" && "Portada"}
                                                        {pages[currentPage].type === "content" && `Página ${pages[currentPage].pageNumber}`}
                                                        {pages[currentPage].type === "final" && "Contraportada"}
                                                    </span>
                                                )}
                                            </div>

                                            <Button
                                                variant={previewMode ? "default" : "ghost"}
                                                size="sm"
                                                onClick={togglePreview}
                                                className="h-8 px-2"
                                                icon={<Eye className="h-4 w-4" />}
                                            >
                                                {previewMode ? "Salir vista previa" : "Vista previa"}
                                            </Button>
                                        </div>*/}


                                        {/* Right side - Workspace controls 
                                         <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsBookPreviewOpen(true)}
                                                className="h-8 px-2"
                                                icon={<Book className="h-4 w-4" />}
                                            >
                                                Previsualizar libro
                                            </Button>

                                            <div className="h-6 w-px bg-gray-300 mx-2"></div>

                                            <WorkspaceControls
                                                currentSize={workspaceSize}
                                                onSizeChange={setWorkspaceSize}
                                                presetData={presetData}
                                                workspaceDimensions={workspaceDimensions}
                                            />
                                        </div>*/}

                                    </>
                                )}
                            </div>



                            {/* Canvas workspace - centered */}
                            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden bg-gray-100">
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
                                            backgroundColor: pages[currentPage]?.backgroundImage ? 'transparent' : (pages[currentPage]?.backgroundColor || '#ffffff')
                                        }}
                                    >                                        {/* Background layer */}
                                        {(() => {
                                            const page = pages[currentPage];

                                            // Debug log para verificar los datos de la página
                                            console.log('🖼️ [WORKSPACE] Renderizando background para página:', page?.type);
                                            console.log('🖼️ [WORKSPACE] backgroundImage:', page?.backgroundImage);
                                            console.log('🖼️ [WORKSPACE] backgroundColor:', page?.backgroundColor);

                                            // Debug adicional para verificar la URL completa
                                            if (page?.backgroundImage) {
                                                const fullUrl = window.location.origin + page.backgroundImage;
                                                console.log('🔗 [WORKSPACE] URL completa de la imagen:', fullUrl);
                                                console.log('🔗 [WORKSPACE] URL relativa:', page.backgroundImage);

                                                // Verificar si la imagen existe mediante fetch
                                                fetch(page.backgroundImage, { method: 'HEAD' })
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

                                            // Usar las propiedades backgroundImage y backgroundColor que ya están configuradas en la página
                                            if (page?.backgroundImage) {
                                                console.log('🎨 [WORKSPACE] Aplicando imagen de fondo:', page.backgroundImage);
                                                return (
                                                    <img
                                                        src={page.backgroundImage}
                                                        alt="background"
                                                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                                        style={{
                                                            zIndex: 1,
                                                        }}
                                                        onLoad={() => {
                                                            console.log('✅ [WORKSPACE] Imagen de fondo cargada exitosamente');
                                                            console.log('📐 [WORKSPACE] Dimensiones de la imagen cargada:', arguments[0]?.target?.naturalWidth, 'x', arguments[0]?.target?.naturalHeight);
                                                        }}
                                                        onError={(e) => {
                                                            console.error('❌ [WORKSPACE] Error cargando imagen de fondo:', e);
                                                            console.error('❌ [WORKSPACE] URL que falló:', e.target.src);
                                                            console.error('❌ [WORKSPACE] Error details:', e.target.error);
                                                        }}
                                                    />
                                                );
                                            } else if (page?.backgroundColor) {
                                                console.log('🎨 [WORKSPACE] Aplicando color de fondo:', page.backgroundColor);
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

                                            console.log('⚪ [WORKSPACE] Sin fondo personalizado, usando fondo por defecto');
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
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>

                        {/* Right sidebar - Page management */}
                        <aside className="w-52 bg-white border-l flex flex-col h-full">
                            <div className="p-4 border-b bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-sm text-gray-700 flex items-center gap-1.5">
                                        <Book className="h-4 w-4 text-purple-600" />
                                        Páginas
                                    </h3>
                                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border">
                                        {pages.length} total
                                    </span>
                                </div>

                                {/*      <div className="flex gap-1.5 mt-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={duplicateCurrentPage}
                                        disabled={pages[currentPage]?.type !== "content"}
                                        title={pages[currentPage]?.type !== "content" ? "Solo se pueden duplicar páginas de contenido" : "Duplicar página"}
                                        className="h-7 w-7 rounded-md bg-white border shadow-sm hover:bg-gray-50"
                                    >
                                        <Copy className="h-3.5 w-3.5 text-gray-600" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={deleteCurrentPage}
                                        disabled={pages.length <= 3 || pages[currentPage]?.type === "cover" || pages[currentPage]?.type === "final"}
                                        title={
                                            pages[currentPage]?.type === "cover" || pages[currentPage]?.type === "final"
                                                ? "No se puede eliminar la portada o contraportada"
                                                : pages.length <= 3
                                                    ? "Debe haber al menos una página de contenido"
                                                    : "Eliminar página"
                                        }
                                        className="h-7 w-7 rounded-md bg-white border shadow-sm hover:bg-gray-50"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 text-gray-600" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={addPage}
                                        className="flex items-center h-7 ml-auto rounded-md border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700"
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                        <span className="text-xs">Nueva página</span>
                                    </Button>
                                </div> */}
                            </div>

                            {/* Page thumbnails - scrollable */}
                            <div className="flex-1 overflow-y-auto p-3 custom-scroll">
                                {/* Sections for different page types */}
                                <div className="space-y-4">
                                    {/* Cover section */}
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></div>
                                            Portada
                                        </div>
                                        {pages.filter(page => page.type === "cover").map((page, index) => (
                                            <div
                                                key={page.id}
                                                className={`relative group flex flex-col cursor-pointer  transition-all duration-200 transform 
                            ${currentPage === pages.indexOf(page)
                                                        ? "ring-2 ring-purple-400 scale-[1.02] shadow-md"
                                                        : "hover:bg-gray-50 border border-transparent hover:border-gray-200"}
                            mb-2`}
                                                onClick={() => setCurrentPage(pages.indexOf(page))}
                                            >
                                                <div className="relative bg-purple-50  overflow-hidden border aspect-[4/3] ">
                                                    {pageThumbnails[page.id] ? (
                                                        <img
                                                            src={pageThumbnails[page.id]}
                                                            alt="Portada"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <div className="text-purple-300">
                                                                <Book className="h-8 w-8" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Overlay with info */}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 group-hover:opacity-100 opacity-80 transition-opacity">
                                                        <span className="text-[10px] text-white font-medium block">
                                                            Portada
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
                                            Páginas de contenido
                                        </div>
                                        <div className="space-y-2">
                                            {pages.filter(page => page.type === "content").map((page, index) => (
                                                <div
                                                    key={page.id}
                                                    className={`relative group flex flex-col cursor-pointer  transition-all duration-200 transform 
                                ${currentPage === pages.indexOf(page)
                                                            ? "ring-2 ring-purple-400 scale-[1.02] shadow-md"
                                                            : "hover:bg-gray-50 border border-transparent hover:border-gray-200"}
                                mb-1`}
                                                    onClick={() => setCurrentPage(pages.indexOf(page))}
                                                >
                                                    <div className="relative  overflow-hidden border aspect-[4/3]">
                                                        {pageThumbnails[page.id] ? (
                                                            <img
                                                                src={pageThumbnails[page.id]}
                                                                alt={`Página ${page.pageNumber}`}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <div
                                                                    className={`grid ${getCurrentLayout().template} gap-0.5 w-full h-full `}
                                                                >
                                                                    {Array.from({
                                                                        length: getCurrentLayout().cells,
                                                                    }).map((_, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className="bg-gray-200 rounded-sm"
                                                                        ></div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Page number badge */}
                                                        <div className="absolute top-1 left-1 bg-white/90 rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                            {page.pageNumber}
                                                        </div>

                                                        {/* Editable badge */}
                                                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full opacity-80 group-hover:opacity-100">
                                                            Editable
                                                        </div>

                                                        {/* Bottom gradient 
                                                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[10px] text-white">
                                                                    Página {page.pageNumber}
                                                                </span>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        className="text-white bg-white/20 p-0.5 rounded hover:bg-white/30"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setCurrentPage(pages.indexOf(page));
                                                                            duplicateCurrentPage();
                                                                        }}
                                                                        title="Duplicar página"
                                                                    >
                                                                        <Copy className="h-2.5 w-2.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>*/}

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Final page */}
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></div>
                                            Contraportada
                                        </div>
                                        {pages.filter(page => page.type === "final").map((page, index) => (
                                            <div
                                                key={page.id}
                                                className={`relative group flex flex-col cursor-pointer  transition-all duration-200 transform 
                            ${currentPage === pages.indexOf(page)
                                                        ? "ring-2 ring-purple-400 scale-[1.02] shadow-md"
                                                        : "hover:bg-gray-50 border border-transparent hover:border-gray-200"}
                            mb-2`}
                                                onClick={() => setCurrentPage(pages.indexOf(page))}
                                            >
                                                <div className="relative  overflow-hidden border mb-1 aspect-[4/3]">
                                                    {pageThumbnails[page.id] ? (
                                                        <img
                                                            src={pageThumbnails[page.id]}
                                                            alt="Contraportada"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <div className="text-green-300">
                                                                <Book className="h-8 w-8" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Overlay with info */}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 group-hover:opacity-100 opacity-80 transition-opacity">
                                                        <span className="text-[10px] text-white font-medium block">
                                                            Contraportada
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            )}

            {/* Toaster para notificaciones */}
            <Toaster />
        </DndProvider>
    );
}



<style jsx>{`
    .custom-scroll {
        scrollbar-width: thin;
        scrollbar-color: #c7d2fe #f5f3ff;
    }
    .custom-scroll::-webkit-scrollbar {
        height: 6px;
    }
    .custom-scroll::-webkit-scrollbar-track {
        background: #f5f3ff;
        border-radius: 3px;
    }
    .custom-scroll::-webkit-scrollbar-thumb {
        background-color: #c7d2fe;
        border-radius: 3px;
    }
`}</style>
