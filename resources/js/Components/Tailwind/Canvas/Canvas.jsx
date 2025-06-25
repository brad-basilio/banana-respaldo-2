import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    ImageIcon, 
    FileText,
    Brush,
    Settings,
    ArrowLeft,
    Save,
    Download,
    Eye,
    Trash2,
    Copy,
    Cog
} from 'lucide-react';

// Componentes específicos para el editor
import CanvasToolbar from './CanvasToolbar';
import PagesSidebar from './PagesSidebar';
import ElementsPanel from './ElementsPanel';
import PropertiesPanel from './PropertiesPanel';

export default function Canvas({ 
    item, 
    canvasPreset, 
    onSave, 
    onExit, 
    user,
    initialProject = null 
}) {
    // Estados principales
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [canvasSettings, setCanvasSettings] = useState({
        width: canvasPreset?.width || 800,
        height: canvasPreset?.height || 600,
        dpi: canvasPreset?.dpi || 300,
        backgroundColor: canvasPreset?.background_color || '#ffffff'
    });
    
    // Estados de la interfaz
    const [activePanel, setActivePanel] = useState('elements'); // elements, properties, settings
    const [zoom, setZoom] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const [showRulers, setShowRulers] = useState(true);
    
    // Referencias
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Inicializar páginas basado en el preset
    useEffect(() => {
        initializePages();
    }, [canvasPreset]);

    const initializePages = () => {
        const pageCount = canvasPreset?.pages || item?.pages || 1;
        const initialPages = [];
        
        for (let i = 0; i < pageCount; i++) {
            initialPages.push({
                id: `page-${i}`,
                elements: [],
                background: canvasSettings.backgroundColor,
                thumbnail: null
            });
        }
        
        setPages(initialPages);
    };

    // Tipos de elementos que se pueden agregar
    const elementTypes = {
        text: { 
            icon: FileText, 
            label: 'Texto',
            default: { 
                type: 'text', 
                content: 'Texto de ejemplo', 
                x: 100, 
                y: 100, 
                width: 200, 
                height: 50,
                fontSize: 16,
                fontFamily: 'Arial',
                color: '#000000',
                fontWeight: 'normal',
                textAlign: 'left'
            }
        },
        image: { 
            icon: ImageIcon, 
            label: 'Imagen',
            default: { 
                type: 'image', 
                src: '', 
                x: 100, 
                y: 100, 
                width: 200, 
                height: 200,
                opacity: 1,
                rotation: 0
            }
        },
        shape: { 
            icon: Brush, 
            label: 'Forma',
            default: { 
                type: 'shape', 
                shape: 'rectangle', 
                x: 100, 
                y: 100, 
                width: 100, 
                height: 100,
                fill: '#3B82F6',
                stroke: '#000000',
                strokeWidth: 1
            }
        }
    };

    // Funciones principales
    const addElement = (elementType) => {
        const newElement = {
            ...elementTypes[elementType].default,
            id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        
        const updatedPages = [...pages];
        updatedPages[currentPage].elements.push(newElement);
        setPages(updatedPages);
        setSelectedElement(newElement.id);
    };

    const updateElement = (elementId, updates) => {
        const updatedPages = [...pages];
        const elementIndex = updatedPages[currentPage].elements.findIndex(el => el.id === elementId);
        if (elementIndex !== -1) {
            updatedPages[currentPage].elements[elementIndex] = {
                ...updatedPages[currentPage].elements[elementIndex],
                ...updates
            };
            setPages(updatedPages);
        }
    };

    const deleteElement = (elementId) => {
        const updatedPages = [...pages];
        updatedPages[currentPage].elements = updatedPages[currentPage].elements.filter(
            el => el.id !== elementId
        );
        setPages(updatedPages);
        if (selectedElement === elementId) {
            setSelectedElement(null);
        }
    };

    const duplicateElement = (elementId) => {
        const element = pages[currentPage].elements.find(el => el.id === elementId);
        if (element) {
            const duplicated = {
                ...element,
                id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                x: element.x + 20,
                y: element.y + 20
            };
            
            const updatedPages = [...pages];
            updatedPages[currentPage].elements.push(duplicated);
            setPages(updatedPages);
            setSelectedElement(duplicated.id);
        }
    };

    const addPage = () => {
        const newPage = {
            id: `page-${pages.length}`,
            elements: [],
            background: canvasSettings.backgroundColor,
            thumbnail: null
        };
        setPages([...pages, newPage]);
    };

    const deletePage = (pageIndex) => {
        if (pages.length > 1) {
            const updatedPages = pages.filter((_, index) => index !== pageIndex);
            setPages(updatedPages);
            if (currentPage >= updatedPages.length) {
                setCurrentPage(updatedPages.length - 1);
            }
        }
    };

    const duplicatePage = (pageIndex) => {
        const pageToDuplicate = pages[pageIndex];
        const duplicatedPage = {
            ...pageToDuplicate,
            id: `page-${pages.length}`,
            elements: pageToDuplicate.elements.map(el => ({
                ...el,
                id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }))
        };
        setPages([...pages, duplicatedPage]);
    };

    const handleImageUpload = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageElement = {
                    ...elementTypes.image.default,
                    id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    src: e.target.result
                };
                
                const updatedPages = [...pages];
                updatedPages[currentPage].elements.push(imageElement);
                setPages(updatedPages);
                setSelectedElement(imageElement.id);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveProject = async () => {
        setIsLoading(true);
        try {
            const projectData = {
                item_id: item.id,
                canvas_preset_id: canvasPreset?.id,
                pages: pages,
                settings: canvasSettings,
                type: canvasPreset?.type || 'other'
            };
            
            if (onSave) {
                await onSave(projectData);
            }
        } catch (error) {
            console.error('Error saving project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const exportProject = () => {
        // Implementar exportación a PDF/imagen
        console.log('Exporting project...', { pages, settings: canvasSettings });
    };

    // Obtener el elemento seleccionado actual
    const getCurrentSelectedElement = () => {
        if (!selectedElement) return null;
        return pages[currentPage]?.elements.find(el => el.id === selectedElement);
    };

    return (
        <div className="h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onExit}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver</span>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold">{item?.name}</h1>
                        <p className="text-sm text-gray-500">
                            {canvasPreset?.name} - {canvasPreset?.type}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                            className="px-2 py-1 text-sm hover:bg-white rounded"
                        >
                            -
                        </button>
                        <span className="px-2 py-1 text-sm min-w-[60px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                            className="px-2 py-1 text-sm hover:bg-white rounded"
                        >
                            +
                        </button>
                    </div>
                    
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2 rounded-lg transition-colors ${
                            showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                        }`}
                        title="Mostrar/Ocultar Cuadrícula"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    
                    <button
                        onClick={exportProject}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Exportar</span>
                    </button>
                    
                    <button
                        onClick={saveProject}
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        <span>{isLoading ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Tools */}
                <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                    <CanvasToolbar 
                        activePanel={activePanel}
                        setActivePanel={setActivePanel}
                        elementTypes={elementTypes}
                        onAddElement={addElement}
                        onImageUpload={handleImageUpload}
                        fileInputRef={fileInputRef}
                    />
                    
                    <div className="flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            {activePanel === 'elements' && (
                                <ElementsPanel 
                                    key="elements"
                                    elementTypes={elementTypes}
                                    onAddElement={addElement}
                                    onImageUpload={handleImageUpload}
                                    fileInputRef={fileInputRef}
                                />
                            )}
                            {activePanel === 'properties' && (
                                <PropertiesPanel 
                                    key="properties"
                                    selectedElement={getCurrentSelectedElement()}
                                    onUpdateElement={updateElement}
                                    onDeleteElement={deleteElement}
                                    onDuplicateElement={duplicateElement}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                        <div 
                            className="bg-white shadow-lg relative"
                            style={{
                                width: canvasSettings.width * zoom,
                                height: canvasSettings.height * zoom,
                                transform: `scale(${zoom})`,
                                transformOrigin: 'center'
                            }}
                        >
                            {/* Grid overlay */}
                            {showGrid && (
                                <div 
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: `
                                            linear-gradient(to right, #000 1px, transparent 1px),
                                            linear-gradient(to bottom, #000 1px, transparent 1px)
                                        `,
                                        backgroundSize: '20px 20px'
                                    }}
                                />
                            )}
                            
                            {/* Canvas Content */}
                            <div 
                                ref={canvasRef}
                                className="w-full h-full relative cursor-crosshair"
                                style={{ backgroundColor: pages[currentPage]?.background }}
                                onClick={() => setSelectedElement(null)}
                            >
                                {pages[currentPage]?.elements.map((element) => (
                                    <CanvasElement
                                        key={element.id}
                                        element={element}
                                        isSelected={selectedElement === element.id}
                                        onSelect={() => setSelectedElement(element.id)}
                                        onUpdate={(updates) => updateElement(element.id, updates)}
                                        zoom={zoom}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Pages */}
                <div className="w-80 bg-white border-l border-gray-200">
                    <PagesSidebar 
                        pages={pages}
                        currentPage={currentPage}
                        onPageSelect={setCurrentPage}
                        onAddPage={addPage}
                        onDeletePage={deletePage}
                        onDuplicatePage={duplicatePage}
                        canvasSettings={canvasSettings}
                    />
                </div>
            </div>
            
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                        handleImageUpload(e.target.files[0]);
                    }
                }}
            />
        </div>
    );
}

// Componente para renderizar elementos en el canvas
function CanvasElement({ element, isSelected, onSelect, onUpdate, zoom }) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        e.stopPropagation();
        onSelect();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - element.x * zoom,
            y: e.clientY - element.y * zoom
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        const newX = (e.clientX - dragStart.x) / zoom;
        const newY = (e.clientY - dragStart.y) / zoom;
        
        onUpdate({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart, zoom]);

    const elementStyle = {
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #3B82F6' : '2px solid transparent',
        borderRadius: '2px'
    };

    const renderElement = () => {
        switch (element.type) {
            case 'text':
                return (
                    <div
                        style={{
                            ...elementStyle,
                            fontSize: element.fontSize,
                            fontFamily: element.fontFamily,
                            color: element.color,
                            fontWeight: element.fontWeight,
                            textAlign: element.textAlign,
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                        }}
                        onMouseDown={handleMouseDown}
                    >
                        {element.content}
                    </div>
                );
                
            case 'image':
                return (
                    <div
                        style={elementStyle}
                        onMouseDown={handleMouseDown}
                    >
                        {element.src ? (
                            <img 
                                src={element.src} 
                                alt=""
                                className="w-full h-full object-cover"
                                style={{ 
                                    opacity: element.opacity,
                                    transform: `rotate(${element.rotation || 0}deg)`
                                }}
                                draggable={false}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                    </div>
                );
                
            case 'shape':
                return (
                    <div
                        style={{
                            ...elementStyle,
                            backgroundColor: element.fill,
                            border: `${element.strokeWidth}px solid ${element.stroke}`,
                            borderRadius: element.shape === 'circle' ? '50%' : '0'
                        }}
                        onMouseDown={handleMouseDown}
                    />
                );
                
            default:
                return null;
        }
    };

    return renderElement();
}
