import { useDrop } from "react-dnd";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import ImageElement from "./ImageElement";
import TextElement from "./TextElement";

export default function EditableCell({
    id,
    elements = [],
    selectedElement,
    onSelectElement,
    onAddElement,
    onUpdateElement,
    onDeleteElement,
    availableMasks = [],
    workspaceSize = { width: 800, height: 600 }, // Tamaño del workspace completo
    cellSize = "auto", // Tamaño específico de esta celda si se necesita
    cellStyle = "", // Estilo dinámico del layout
    projectData = null, // Datos del proyecto para upload
}) {
    // Función para subir imagen al servidor
    const uploadImageToServer = async (file) => {
        if (!projectData?.id) {
            toast.error('Error: No se puede cargar la imagen sin un proyecto activo');
            return null;
        }

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
                return result.url;
            } else {
                toast.error(result.message || 'Error al subir la imagen');
                return null;
            }
        } catch (error) {
            console.error('Error subiendo la imagen:', error);
            toast.error('Error de red al subir la imagen');
            return null;
        }
    };

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ["IMAGE_FILE", "TEXT_ELEMENT", "IMAGE_ELEMENT", "PROJECT_IMAGE"],
        drop: async (item) => {
            if (item.files) {
                const file = item.files[0];
                const imageUrl = await uploadImageToServer(file);
                
                if (imageUrl) {
                    const newElement = {
                        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        type: "image",
                        content: imageUrl,
                        position: { x: 0.05, y: 0.05 }, // Posición en porcentajes
                        size: { width: 0.3, height: 0.3 }, // Tamaño relativo
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
                        zIndex: elements.length + 1, // Z-index automático
                    };
                    onAddElement(newElement, id);
                    console.log('[EditableCell] onAddElement', { cellId: id, elementId: newElement.id });
                    onSelectElement(newElement.id, id);
                    toast.success('Imagen subida correctamente');
                }
            } else if (item.type === "PROJECT_IMAGE") {
                // Manejar drag & drop desde la galería de imágenes del proyecto
                const newElement = {
                    id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: "image",
                    content: item.imageUrl,
                    position: { x: 0.05, y: 0.05 }, // Posición en porcentajes
                    size: { width: 0.3, height: 0.3 }, // Tamaño relativo
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
                    zIndex: elements.length + 1, // Z-index automático
                };
                onAddElement(newElement, id);
                console.log('[EditableCell] onAddElement from gallery', { cellId: id, elementId: newElement.id });
                onSelectElement(newElement.id, id);
                toast.success('Imagen añadida desde la galería');
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver({ shallow: true }),
        }),
    }));

    const openFileExplorer = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = true; // Permitir múltiples archivos
        input.onchange = async (e) => {
            if (e.target.files) {
                const files = Array.from(e.target.files);
                
                for (const file of files) {
                    const imageUrl = await uploadImageToServer(file);
                    
                    if (imageUrl) {
                        const newElement = {
                            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            type: "image",
                            content: imageUrl,
                            position: { x: 0.05, y: 0.05 }, // Posición en porcentajes
                            size: { width: 0.3, height: 0.3 }, // Tamaño relativo
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
                            zIndex: elements.length + 1, // Z-index automático
                        };
                        onAddElement(newElement, id);
                        console.log('[EditableCell] onAddElement', { cellId: id, elementId: newElement.id });
                        onSelectElement(newElement.id, id);
                        toast.success('Imagen subida correctamente');
                    }
                }
            }
        };
        input.click();
    };

    // Definir las clases de tamaño (mantenidas para compatibilidad)
    const sizeClasses = {
        square: "aspect-square", // 1:1
        landscape: "aspect-video", // 16:9
        portrait: "aspect-[3/4]", // 3:4
        wide: "aspect-[2/1]", // 2:1
        tall: "aspect-[9/16]", // 9:16
        custom: "h-[500px]", // tamaño personalizado
        auto: "w-full h-full", // Ocupa todo el espacio disponible en el grid
    };

    // Determinar si la celda tiene contenido para aplicar el border correcto
    const hasContent = elements.length > 0;

    return (
        <div
            ref={drop}
            className={`relative w-full h-full ${cellStyle || 'rounded-lg overflow-hidden'} ${
                isOver ? "ring-2 ring-purple-500 bg-transparent" : ""
            } ${
                !hasContent 
                    ? "border-2 border-dashed border-gray-300 bg-transparent hover:border-gray-400 hover:bg-transparent hover:text-white" 
                    : "bg-transparent"
            }`}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onSelectElement(null, id);
                }
            }}
            style={{
                isolation: "isolate",
                background: hasContent ? "transparent" : undefined,
                minHeight: "120px", // Altura mínima para celdas muy pequeñas
            }}
        >
            {elements.length === 0 ? (
                <div
                    className="absolute group inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        openFileExplorer();
                    }}
                >
                    <Upload className="h-8 w-8 text-gray-300 group-hover:text-white" />
                    <p className="text-sm text-gray-400 group-hover:text-white">
                        Haz clic o arrastra una imagen
                    </p>
                </div>
            ) : (
                elements.map((element) => (
                    <div
                        key={element.id}
                        className="absolute inset-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {element.type === "image" ? (
                            <ImageElement
                                element={element}
                                isSelected={selectedElement === element.id}
                                onSelect={() => onSelectElement(element.id, id)}
                                onUpdate={(updates) =>
                                    onUpdateElement(element.id, updates)
                                }
                                onDelete={() => onDeleteElement(element.id)}
                                availableMasks={availableMasks}
                                workspaceSize={workspaceSize}
                            />
                        ) : (
                            <TextElement
                                element={element}
                                workspaceSize={workspaceSize}
                                isSelected={selectedElement === element.id}
                                onSelect={() => onSelectElement(element.id, id)}
                                onUpdate={(updates) =>
                                    onUpdateElement(element.id, updates)
                                }
                                onDelete={() => onDeleteElement(element.id)}
                            />
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
