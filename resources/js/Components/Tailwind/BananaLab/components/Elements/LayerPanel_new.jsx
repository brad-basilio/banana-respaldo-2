import React, { useState } from "react";
import { 
    Image, 
    Type, 
    Eye, 
    EyeOff, 
    Trash2, 
    ArrowUp, 
    ArrowDown, 
    Layers, 
    ChevronDown, 
    ChevronRight,
    Square,
    Star,
    Circle
} from "lucide-react";

const LayerPanel = ({ 
    pages, 
    currentPage, 
    selectedCell, 
    selectedElement, 
    onSelectCell, 
    onSelectElement, 
    onUpdateElement, 
    onDeleteElement, 
    onMoveElement 
}) => {
    const currentPageData = pages[currentPage];
    const cellsWithElements = currentPageData?.cells.filter(cell => cell.elements.length > 0) || [];
    
    // Expandir todas las celdas por defecto
    const [expandedCells, setExpandedCells] = useState(() => {
        const initialExpanded = {};
        cellsWithElements.forEach(cell => {
            initialExpanded[cell.id] = true;
        });
        return initialExpanded;
    });

    const toggleCellExpansion = (cellId) => {
        setExpandedCells(prev => ({
            ...prev,
            [cellId]: !prev[cellId]
        }));
    };

    const getElementIcon = (type) => {
        switch (type) {
            case 'image':
                return <Image className="h-4 w-4" />;
            case 'text':
                return <Type className="h-4 w-4" />;
            case 'shape':
                return <Square className="h-4 w-4" />;
            case 'sticker':
                return <Star className="h-4 w-4" />;
            default:
                return <Circle className="h-4 w-4" />;
        }
    };

    const getElementName = (element, index) => {
        switch (element.type) {
            case 'text':
                return element.content ? element.content.substring(0, 20) + '...' : 'Text Layer';
            case 'image':
                return `Image ${index + 1}`;
            case 'shape':
                return element.shape || 'Shape';
            case 'sticker':
                return `Sticker ${index + 1}`;
            default:
                return `Element ${index + 1}`;
        }
    };

    const handleElementVisibility = (cellId, elementId, isVisible) => {
        onUpdateElement(cellId, elementId, { visible: isVisible });
    };

    const handleElementClick = (cellId, elementId) => {
        onSelectCell(cellId);
        onSelectElement(elementId);
    };

    return (
        <div className="space-y-2">
            {cellsWithElements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Layers className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No elements yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add elements to see them here</p>
                </div>
            ) : (
                cellsWithElements.map((cell) => (
                    <div key={cell.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Cell Header */}
                        <div 
                            className={`flex items-center p-3 cursor-pointer transition-colors ${
                                selectedCell === cell.id ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                                toggleCellExpansion(cell.id);
                                onSelectCell(cell.id);
                            }}
                        >
                            <button className="mr-2 text-gray-500 hover:text-gray-700">
                                {expandedCells[cell.id] ? 
                                    <ChevronDown className="h-4 w-4" /> : 
                                    <ChevronRight className="h-4 w-4" />
                                }
                            </button>
                            <div className="flex-1">
                                <div className="font-medium text-sm text-gray-800">
                                    Cell {cell.id}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {cell.elements.length} element{cell.elements.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">
                                {cell.x}, {cell.y}
                            </div>
                        </div>

                        {/* Elements List */}
                        {expandedCells[cell.id] && (
                            <div className="border-t border-gray-100">
                                {cell.elements.map((element, index) => (
                                    <div 
                                        key={element.id}
                                        className={`flex items-center p-2 mx-2 mb-2 rounded cursor-pointer transition-colors ${
                                            selectedElement === element.id 
                                                ? 'bg-purple-100 border border-purple-200' 
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleElementClick(cell.id, element.id)}
                                    >
                                        {/* Element Icon */}
                                        <div className="mr-2 text-gray-500">
                                            {getElementIcon(element.type)}
                                        </div>

                                        {/* Element Name */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm truncate">
                                                {getElementName(element, index)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {element.type} • Layer {index + 1}
                                            </div>
                                        </div>

                                        {/* Element Controls */}
                                        <div className="flex items-center gap-1">
                                            {/* Visibility Toggle */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleElementVisibility(cell.id, element.id, !element.visible);
                                                }}
                                                className="p-1 hover:bg-gray-200 rounded"
                                                title={element.visible ? 'Hide element' : 'Show element'}
                                            >
                                                {element.visible !== false ? (
                                                    <Eye className="h-3 w-3 text-gray-500" />
                                                ) : (
                                                    <EyeOff className="h-3 w-3 text-gray-400" />
                                                )}
                                            </button>

                                            {/* Move Up */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onMoveElement(cell.id, element.id, 'up');
                                                }}
                                                className="p-1 hover:bg-gray-200 rounded"
                                                title="Move layer up"
                                                disabled={index === cell.elements.length - 1}
                                            >
                                                <ArrowUp className="h-3 w-3 text-gray-500" />
                                            </button>

                                            {/* Move Down */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onMoveElement(cell.id, element.id, 'down');
                                                }}
                                                className="p-1 hover:bg-gray-200 rounded"
                                                title="Move layer down"
                                                disabled={index === 0}
                                            >
                                                <ArrowDown className="h-3 w-3 text-gray-500" />
                                            </button>

                                            {/* Delete */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteElement(cell.id, element.id);
                                                }}
                                                className="p-1 hover:bg-red-100 rounded text-red-500"
                                                title="Delete element"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default LayerPanel;
