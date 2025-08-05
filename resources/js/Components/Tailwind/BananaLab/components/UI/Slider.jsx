import { useEffect, useState } from "react";

const Slider = ({
    value = 50,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    onValueChange, // Mantener para compatibilidad
    label,
    unit = "%",
}) => {
    const [currentValue, setCurrentValue] = useState(value);

    // Sincronizar con el valor externo cuando cambie
    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleChange = (e) => {
        const newValue = Number.parseFloat(e.target.value);
        setCurrentValue(newValue);
        
        // Llamar ambas funciones para compatibilidad
        if (onChange) {
            onChange(newValue);
        }
        if (onValueChange) {
            onValueChange([newValue]);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
                <span className="text-sm text-gray-500">
                    {currentValue}
                    {unit}
                </span>
            </div>
            <div className="relative flex w-full touch-none select-none items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={currentValue}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 slider-thumb"
                    style={{
                        background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((currentValue - min) / (max - min)) * 100}%, #e5e7eb ${((currentValue - min) / (max - min)) * 100}%, #e5e7eb 100%)`
                    }}
                />
            </div>
        </div>
    );
};

export default Slider;
