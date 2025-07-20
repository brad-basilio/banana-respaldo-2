import React from 'react';

export const FilterControls = ({ filters = {}, onFilterChange, selectedElement }) => {
    const updateFilter = (filterName, value) => {
        const newFilters = { ...filters, [filterName]: value };
        onFilterChange(newFilters);
    };

    const resetFilters = () => {
        const resetValues = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            hue: 0,
            blur: 0,
            scale: 1,
            rotate: 0
        };
        onFilterChange(resetValues);
    };

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        const defaultValues = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            hue: 0,
            blur: 0,
            scale: 1,
            rotate: 0
        };
        return value !== defaultValues[key];
    });

    return (
        <div className="space-y-4">
            {/* Header con botón reset */}
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">Controles</h4>
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        Resetear
                    </button>
                )}
            </div>

            {/* Brillo */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-600">Brillo</label>
                    <span className="text-xs text-[#af5cb8] font-bold">
                        {filters.brightness || 100}%
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.brightness || 100}
                    onChange={(e) => updateFilter('brightness', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple"
                />
            </div>

            {/* Contraste */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-600">Contraste</label>
                    <span className="text-xs text-[#af5cb8] font-bold">
                        {filters.contrast || 100}%
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.contrast || 100}
                    onChange={(e) => updateFilter('contrast', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple"
                />
            </div>

            {/* Saturación */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-600">Saturación</label>
                    <span className="text-xs text-[#af5cb8] font-bold">
                        {filters.saturation || 100}%
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.saturation || 100}
                    onChange={(e) => updateFilter('saturation', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple"
                />
            </div>

            {/* Matiz */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-600">Matiz</label>
                    <span className="text-xs text-[#af5cb8] font-bold">
                        {filters.hue || 0}°
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={filters.hue || 0}
                    onChange={(e) => updateFilter('hue', parseInt(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Desenfoque */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-600">Desenfoque</label>
                    <span className="text-xs text-[#af5cb8] font-bold">
                        {filters.blur || 0}px
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="20"
                    value={filters.blur || 0}
                    onChange={(e) => updateFilter('blur', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple"
                />
            </div>

            {/* Transformaciones */}
            <div className="pt-3 border-t border-gray-200 space-y-3">
                <h5 className="text-sm font-medium text-gray-700">Transformaciones</h5>
                
                {/* Escala */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm text-gray-600">Escala</label>
                        <span className="text-xs text-[#af5cb8] font-bold">
                            {(filters.scale || 1).toFixed(1)}x
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={filters.scale || 1}
                        onChange={(e) => updateFilter('scale', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple"
                    />
                </div>

                {/* Rotación */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm text-gray-600">Rotación</label>
                        <span className="text-xs text-[#af5cb8] font-bold">
                            {filters.rotate || 0}°
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={filters.rotate || 0}
                        onChange={(e) => updateFilter('rotate', parseInt(e.target.value))}
                        className="w-full h-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            {/* Presets rápidos */}
            <div className="pt-3 border-t border-gray-200 space-y-3">
                <h5 className="text-sm font-medium text-gray-700">Presets</h5>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onFilterChange({ 
                            brightness: 120, 
                            contrast: 110, 
                            saturation: 130,
                            hue: 0,
                            blur: 0,
                            scale: 1,
                            rotate: 0
                        })}
                        className="px-3 py-2 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:shadow-md transition-all"
                    >
                        ☀️ Verano
                    </button>
                    <button
                        onClick={() => onFilterChange({ 
                            brightness: 90, 
                            contrast: 120, 
                            saturation: 80,
                            hue: 0,
                            blur: 0,
                            scale: 1,
                            rotate: 0
                        })}
                        className="px-3 py-2 text-xs bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-lg hover:shadow-md transition-all"
                    >
                        🍂 Vintage
                    </button>
                </div>
            </div>
        </div>
    );
};
