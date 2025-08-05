import { filterPresets } from "../../constants/filters";
import { Sparkles } from "lucide-react"; // Ícono amigable para representar filtros

export const FilterPresets = ({ onSelectPreset, selectedImage }) => {
    const getFilterStyle = (filters) => {
        const style = {
            filter: `
                brightness(${(filters.brightness ?? 100) / 100})
                contrast(${(filters.contrast ?? 100) / 100})
                saturate(${(filters.saturation ?? 100) / 100})
                sepia(${(filters.tint ?? 0) / 100})
                hue-rotate(${(filters.hue ?? 0)}deg)
                blur(${filters.blur ?? 0}px)
            `.replace(/\s+/g, ' ').trim(),
            transform: `scale(${filters.scale ?? 1}) rotate(${
                filters.rotate ?? 0
            }deg) ${filters.flipHorizontal ? "scaleX(-1)" : ""} ${
                filters.flipVertical ? "scaleY(-1)" : ""
            }`.replace(/\s+/g, ' ').trim(),
            mixBlendMode: filters.blendMode ?? "normal",
            opacity: (filters.opacity ?? 100) / 100,
        };
        
        console.log('🎨 [FilterPresets] Aplicando filtro:', filters.name || 'unknown', {
            filters,
            generatedStyle: style
        });
        
        return style;
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
                Filtros predefinidos
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {filterPresets.map((preset) => (
                    <div
                        key={preset.name}
                        className="relative group cursor-pointer rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition duration-300"
                        onClick={() => {
                            console.log('🎯 [FilterPresets] Aplicando preset:', preset.name, preset.filters);
                            onSelectPreset(preset.filters);
                        }}
                    >
                        {/* Imagen con estilo */}
                        <div className="aspect-square bg-gray-100 overflow-hidden">
                            {selectedImage ? (
                                <img
                                    src={selectedImage.content}
                                    alt={`Previsualización de ${preset.name}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    style={getFilterStyle({...preset.filters, name: preset.name})}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-sm text-center px-2">
                                        Selecciona una imagen
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Nombre del filtro */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                            <p className="text-white text-sm font-medium">
                                {preset.name}
                            </p>
                        </div>

                        {/* Hover con ícono intuitivo */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-white rounded-full p-2 shadow-md">
                                <Sparkles className="w-5 h-5 customtext-primary" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
