import { useState } from "react";
import { imageMasks } from "../../constants/masks";

export const MaskSelector = ({
    selectedMask,
    onSelect,
    availableMasks = [],
    selectedImage,
}) => {
    const [activeCategory, setActiveCategory] = useState("Básicas");

    const categories = {};
    imageMasks.forEach((mask) => {
        if (!categories[mask.category]) categories[mask.category] = [];
        if (availableMasks.includes(mask.id) || mask.id === "none") {
            categories[mask.category].push(mask);
        }
    });

    return (
        <div className="space-y-3">
            {/* Pestañas - formato compacto */}
            <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg">
                {Object.keys(categories).slice(0, 2).map(
                    (category) =>
                        categories[category].length > 0 && (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`py-1.5 px-2 text-xs rounded-md transition font-medium ${
                                    activeCategory === category
                                        ? "bg-white text-purple-700 shadow-sm"
                                        : "text-gray-600 hover:text-purple-600"
                                }`}
                            >
                                {category}
                            </button>
                        )
                )}
            </div>

            {/* Cuadrícula de máscaras - compacta */}
            <div className="grid grid-cols-3 gap-2">
                {categories[activeCategory]?.slice(0, 6).map((mask) => (
                    <div
                        key={mask.id}
                        onClick={() => onSelect(mask.id)}
                        className={`cursor-pointer border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${
                            selectedMask === mask.id
                                ? "ring-2 ring-purple-500 border-purple-300"
                                : "border-gray-200"
                        }`}
                    >
                        <div className="aspect-square bg-white flex items-center justify-center p-1 relative overflow-hidden">
                            {selectedImage?.content ? (
                                <div style={{
                                    width: '100%', 
                                    height: '100%', 
                                    overflow: 'hidden',
                                    clipPath: mask.id === 'circle' ? 'circle(50%)' : 
                                              mask.id === 'rounded' ? 'inset(0 round 8%)' : 
                                              mask.id === 'rounded-sm' ? 'inset(0 round 8%)' : 
                                              mask.id === 'rounded-lg' ? 'inset(0 round 16%)' : 
                                              mask.id === 'rounded-rect' ? 'inset(0 round 12%)' : 
                                              mask.id === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 
                                              mask.id === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : 
                                              mask.id === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 
                                              mask.id === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 
                                              mask.id === 'polaroid' ? 'inset(5% 5% 15% 5% round 2%)' : 
                                              mask.id === 'vintage' ? 'inset(5% round 5% 5% 10% 5%)' : 
                                              mask.id === 'diagonal' ? 'polygon(0 0, 100% 0, 100% 80%, 0 100%)' : 
                                              mask.id === 'frame' ? 'inset(10% round 10%)' : 
                                              mask.id === 'blob1' ? 'path("M10,0 C15,0 20,5 20,10 C20,15 15,20 10,20 C5,20 0,15 0,10 C0,5 5,0 10,0 Z")' : 
                                              mask.id === 'blob2' ? 'path("M10,0 C15,5 20,10 15,15 C10,20 5,15 0,10 C5,5 5,5 10,0 Z")' : 
                                              mask.id === 'blob3' ? 'path("M10,0 C15,0 20,5 15,10 C20,15 15,20 10,15 C5,20 0,15 5,10 C0,5 5,0 10,0 Z")' : 'none'
                                }}>
                                    <img
                                        src={selectedImage.content}
                                        alt={mask.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div style={{
                                    width: '100%', 
                                    height: '100%', 
                                    overflow: 'hidden',
                                    background: '#d1d5db', /* gray-300 */
                                    clipPath: mask.id === 'circle' ? 'circle(50%)' : 
                                              mask.id === 'rounded' ? 'inset(0 round 8%)' : 
                                              mask.id === 'rounded-sm' ? 'inset(0 round 8%)' : 
                                              mask.id === 'rounded-lg' ? 'inset(0 round 16%)' : 
                                              mask.id === 'rounded-rect' ? 'inset(0 round 12%)' : 
                                              mask.id === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 
                                              mask.id === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : 
                                              mask.id === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 
                                              mask.id === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 
                                              mask.id === 'polaroid' ? 'inset(5% 5% 15% 5% round 2%)' : 
                                              mask.id === 'vintage' ? 'inset(5% round 5% 5% 10% 5%)' : 
                                              mask.id === 'diagonal' ? 'polygon(0 0, 100% 0, 100% 80%, 0 100%)' : 
                                              mask.id === 'frame' ? 'inset(10% round 10%)' : 
                                              mask.id === 'blob1' ? 'path("M10,0 C15,0 20,5 20,10 C20,15 15,20 10,20 C5,20 0,15 0,10 C0,5 5,0 10,0 Z")' : 
                                              mask.id === 'blob2' ? 'path("M10,0 C15,5 20,10 15,15 C10,20 5,15 0,10 C5,5 5,5 10,0 Z")' : 
                                              mask.id === 'blob3' ? 'path("M10,0 C15,0 20,5 15,10 C20,15 15,20 10,15 C5,20 0,15 5,10 C0,5 5,0 10,0 Z")' : 'none'
                                }} />
                            )}
                        </div>
                        <p className="text-center text-[10px] text-gray-700 p-1 truncate">
                            {mask.name}
                        </p>
                    </div>
                ))}
            </div>
            
            {/* Ver más opciones */}
            {categories[activeCategory]?.length > 6 && (
                <button className="w-full py-2 text-xs text-purple-600 hover:text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition">
                    Ver más máscaras ({categories[activeCategory].length - 6} más)
                </button>
            )}
        </div>
    );
};
