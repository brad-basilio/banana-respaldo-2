import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FloatingSearchButton = ({
    search,
    setSearch,
    searchSuggestions,
    setSearchSuggestions,
    showSuggestions,
    setShowSuggestions,
    isLoadingSuggestions,
    setIsLoadingSuggestions,
    selectedSuggestionIndex,
    setSelectedSuggestionIndex,
    fetchSearchSuggestions,
    handleSearchChange,
    selectSuggestion,
    clearSuggestions,
    handleKeyDown,
    shouldHideMobileSearch
}) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const suggestionItemsRef = useRef([]);

    // Función para manejar el submit del form móvil
    const handleMobileSearch = (event) => {
        event.preventDefault();
        clearSuggestions();
        if (search.trim()) {
            const trimmedSearch = search.trim();
            setIsSearchOpen(false);
            window.location.href = `/catalogo?search=${encodeURIComponent(trimmedSearch)}`;
        }
        return false;
    };

    // Abrir/cerrar búsqueda
    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else {
            setSearch("");
            clearSuggestions();
        }
    };

    // Cerrar con escape
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false);
                setSearch("");
                clearSuggestions();
            }
        };

        if (isSearchOpen) {
            document.addEventListener("keydown", handleKeyPress);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [isSearchOpen]);

    // Componente de sugerencias de búsqueda
    const SearchSuggestions = ({ suggestions, isLoading, onSelect, selectedIndex }) => {
        if (!showSuggestions) return null;
        return (
            <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[70] max-h-80 overflow-y-auto"
            >
                {isLoading ? (
                    <div className="p-4 text-center text-gray-600">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            Buscando...
                        </div>
                    </div>
                ) : suggestions.length > 0 ? (
                    <ul className="py-2">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={suggestion.id}
                                ref={el => suggestionItemsRef.current[index] = el}
                            >
                                <button
                                    data-suggestion-button
                                    onMouseDown={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setTimeout(() => onSelect(suggestion), 0);
                                    }}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 ${index === selectedIndex ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
                                    type="button"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                        {suggestion.image ? (
                                            <img
                                                src={`/api/items/media/${suggestion.image}`}
                                                alt={suggestion.name}
                                                className="w-full h-full object-cover"
                                                onError={e => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Search size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-800 truncate">
                                            {suggestion.name}
                                        </div>
                                        {suggestion.category && (
                                            <div className="text-sm text-gray-600 truncate">
                                                {suggestion.category.name}
                                            </div>
                                        )}
                                        {suggestion.final_price && (
                                            <div className="text-sm font-semibold text-primary">
                                                S/ {parseFloat(suggestion.final_price).toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-4 text-center text-gray-600">
                        No se encontraron productos
                    </div>
                )}
            </motion.div>
        );
    };

    if (shouldHideMobileSearch()) {
        return null;
    }

    return (
        <>
            {/* Botón flotante - posicionado 10px arriba del botón de WhatsApp */}
            <div className="md:hidden fixed bottom-[5.5rem] right-3 z-[60] ">
                <motion.button
                    onClick={toggleSearch}
                    className="w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Buscar productos"
                >
                    <Search size={20} />
                </motion.button>
            </div>

            {/* Modal de búsqueda */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-start justify-center"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-[90%] max-w-md bg-white rounded-2xl mt-20 p-4 relative shadow-xl"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header del modal */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Buscar productos</h3>
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                    aria-label="Cerrar búsqueda"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Formulario de búsqueda */}
                            <div className="relative">
                                <form onSubmit={handleMobileSearch} role="search" className="relative w-full">
                                    <input
                                        ref={searchInputRef}
                                        type="search"
                                        name="search"
                                        placeholder="Buscar productos..."
                                        value={search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => {
                                            if (search.trim().length >= 2) {
                                                fetchSearchSuggestions(search);
                                            }
                                        }}
                                        className="w-full pr-14 py-3 font-normal pl-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none bg-gray-50"
                                        enterKeyHint="search"
                                        inputMode="search"
                                        autoComplete="off"
                                        role="searchbox"
                                        aria-label="Buscar productos"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                        aria-label="Buscar"
                                    >
                                        <Search size={18} />
                                    </button>
                                </form>

                                <AnimatePresence>
                                    <SearchSuggestions
                                        suggestions={searchSuggestions}
                                        isLoading={isLoadingSuggestions}
                                        onSelect={(suggestion) => {
                                            selectSuggestion(suggestion);
                                            setIsSearchOpen(false);
                                        }}
                                        selectedIndex={selectedSuggestionIndex}
                                    />
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingSearchButton;