import {
    Menu,
    X,
    Search,
    User,
    Heart,
    ShoppingCart,
    UserRound,
    UserCircle,
    DoorClosed,
    Settings,
    Home,
    BookHeart,
    XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Global from "../../../Utils/Global";
import CartModal from "../Components/CartModal";
import AuthRest from "../../../Actions/AuthRest";
import Logout from "../../../Actions/Logout";
import CartModalBananaLab from "../Components/CartModalBananaLab";
import MobileMenu from "./Components/MobileMenu";
import ProfileImage from "./Components/ProfileImage";

const HeaderBananaLab = ({
    items,
    data,
    cart,
    setCart,
    isUser,
    pages,
    generals = [],
}) => {
    const menuVariants = {
        hidden: {
            opacity: 0,
            y: -10,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: {
                duration: 0.15
            }
        }
    };
    const menuItems = [
        {
            icon: <User size={16} />,
            label: "Mi Perfil",
            href: "/profile"
        },
        {
            icon: <ShoppingCart size={16} />,
            label: "Mis Pedidos",
            href: "/customer/dashboard"
        },
        {
            icon: <BookHeart size={16} />,
            label: "Mis Projectos",
            href: "/customer/albums"
        },
        {
            icon: <Settings size={16} />,
            label: "Configuración",
            href: "/account"
        },
        {
            icon: <DoorClosed size={16} />,
            label: "Cerrar Sesión",
            onClick: Logout
        }
    ];


    const phoneWhatsappObj = generals.find(
        (item) => item.correlative === "phone_whatsapp"
    );
    const messageWhatsappObj = generals.find(
        (item) => item.correlative === "message_whatsapp"
    );

    const phoneWhatsapp = phoneWhatsappObj?.description ?? null;
    const messageWhatsapp = messageWhatsappObj?.description ?? null;

    const [modalOpen, setModalOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    const [searchMobile, setSearchMobile] = useState(false);
    const [search, setSearch] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFixed, setIsFixed] = useState(false);

    // Estados para búsqueda predictiva
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const suggestionItemsRef = useRef([]); // Ref para elementos de sugerencia

    const menuRef = useRef(null);
    const userMenuRef = useRef(null);
    const searchRef = useRef(null);
    const mobileSearchInputRef = useRef(null);
    const desktopSearchInputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // refs para scroll automático en sugerencias
    const suggestionRefs = useRef([]);

    const totalCount = cart.reduce((acc, item) => {
        return Number(acc) + Number(item.quantity);
    }, 0);
    const totalPrice = cart.reduce((acc, item) => {
        const finalPrice = item.discount ? item.discount : item.price;
        return acc + Number(item.quantity) * finalPrice;
    }, 0);

    // Función para verificar si estamos en rutas donde no queremos mostrar la búsqueda móvil
    const shouldHideMobileSearch = () => {
        try {
            const currentPath = window.location.pathname || '';
            const hiddenRoutes = ['/cart', '/checkout'];
            return hiddenRoutes.some(route => currentPath.includes(route));
        } catch (error) {
            console.warn('Error checking path:', error);
            return false;
        }
    };

    // Función para obtener sugerencias de búsqueda
    const fetchSearchSuggestions = async (query) => {
        if (!query.trim() || query.length < 2) {
            setSearchSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoadingSuggestions(true);

        try {
            const response = await fetch('/api/items/paginate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    take: 8,
                    skip: 0,
                    filter: [
                        ['name', 'contains', query],
                        'or',
                        ['summary', 'contains', query],
                        'or',
                        ['description', 'contains', query]
                    ],
                    sort: [{ selector: 'name', desc: false }],
                    requireTotalCount: false,
                    with: 'category,brand'
                })
            });

            if (!response.ok) {
                throw new Error('Error en la búsqueda');
            }

            const data = await response.json();

            if (data.status === 200 && Array.isArray(data.data)) {
                setSearchSuggestions(data.data);
                setShowSuggestions(data.data.length > 0);
            } else {
                setSearchSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (error) {
            console.error('Error fetching search suggestions:', error);
            setSearchSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    // Función para manejar cambios en el input de búsqueda
    const handleSearchChange = (value) => {
        setSearch(value);
        setSelectedSuggestionIndex(-1);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            fetchSearchSuggestions(value);
        }, 300);
    };

    // Función para limpiar sugerencias
    const clearSuggestions = () => {
        setShowSuggestions(false);
        setSearchSuggestions([]);
        setSelectedSuggestionIndex(-1);
    };

    // Función para seleccionar una sugerencia
    const selectSuggestion = (suggestion) => {
        if (!suggestion) return;

        setShowSuggestions(false);
        setSearchMobile(false);

        const url = suggestion.slug
            ? `/product/${suggestion.slug}`
            : `/catalogo?search=${encodeURIComponent(suggestion.name)}`;

        window.location.href = url;
    };

    // Cerrar menús al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            // Mejorar el manejo del click outside para la búsqueda móvil
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                if (!search.trim()) {
                    setSearchMobile(false);
                }
            }
            // Manejar click fuera de las sugerencias
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                !desktopSearchInputRef.current?.contains(event.target) &&
                !mobileSearchInputRef.current?.contains(event.target)) {
                clearSuggestions();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [search]);

    useEffect(() => {
        let scrollTimer = null;
        const handleScroll = () => {
            if (scrollTimer !== null) {
                clearTimeout(scrollTimer);
            }
            scrollTimer = setTimeout(() => {
                if (window.scrollY > 10) {
                    setIsFixed(true);
                } else {
                    setIsFixed(false);
                }
            }, 10); // Pequeño debounce para suavizar la transición
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimer !== null) {
                clearTimeout(scrollTimer);
            }
        };
    }, []);

    // useEffect para manejar el escape en la búsqueda móvil
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Escape') {
                if (showSuggestions) {
                    clearSuggestions();
                } else if (searchMobile) {
                    setSearchMobile(false);
                    setSearch("");
                }
            }
        };

        if (searchMobile || showSuggestions) {
            document.addEventListener("keydown", handleKeyPress);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [searchMobile, showSuggestions]);

    // Cleanup timeout en unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Efecto para scroll automático al seleccionar sugerencias
    useEffect(() => {
        if (
            selectedSuggestionIndex >= 0 &&
            suggestionRefs.current[selectedSuggestionIndex] &&
            suggestionsRef.current
        ) {
            suggestionRefs.current[selectedSuggestionIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }
    }, [selectedSuggestionIndex]);

    const isCustomer = isUser && Array.isArray(isUser.roles) && isUser.roles.some(role => role.name === 'Customer');

    // Función para manejar el submit del form
    const handleFormSubmit = (event) => {
        event.preventDefault();
        clearSuggestions();
        if (search.trim()) {
            const trimmedSearch = search.trim();
            window.location.href = `/catalogo?search=${encodeURIComponent(trimmedSearch)}`;
        }
        return false;
    };

    // Función específica para el input móvil
    const handleMobileSearch = (event) => {
        event.preventDefault();
        clearSuggestions();
        if (search.trim()) {
            const trimmedSearch = search.trim();
            setSearchMobile(false);
            window.location.href = `/catalogo?search=${encodeURIComponent(trimmedSearch)}`;
        }
        return false;
    };

    // Función para scroll inteligente en sugerencias
    function scrollToSuggestion(index) {
        const container = suggestionsRef.current;
        const el = suggestionItemsRef.current[index];
        if (!container || !el) return;
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        if (elRect.top < containerRect.top) {
            container.scrollTop -= (containerRect.top - elRect.top);
        } else if (elRect.bottom > containerRect.bottom) {
            container.scrollTop += (elRect.bottom - containerRect.bottom);
        }
    }

    // Handler de teclado
    const handleKeyDown = (e) => {
        if (!showSuggestions || searchSuggestions.length === 0) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestionIndex(prev => {
                    const next = prev < searchSuggestions.length - 1 ? prev + 1 : prev;
                    setTimeout(() => scrollToSuggestion(next), 0);
                    return next;
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestionIndex(prev => {
                    const next = prev > 0 ? prev - 1 : 0;
                    setTimeout(() => scrollToSuggestion(next), 0);
                    return next;
                });
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < searchSuggestions.length) {
                    selectSuggestion(searchSuggestions[selectedSuggestionIndex]);
                } else if (search.trim()) {
                    handleFormSubmit(e);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
            default:
                break;
        }
    };

    // Componente de sugerencias de búsqueda
    const SearchSuggestions = ({ suggestions, isLoading, onSelect, selectedIndex }) => {
        if (!showSuggestions) return null;
        return (
            <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] max-h-80 overflow-y-auto mt-1"
            >
                {isLoading ? (
                    <div className="p-4 text-center customtext-neutral-dark">
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
                                            <div className="w-full h-full flex items-center justify-center customtext-neutral-dark">
                                                <Search size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium customtext-neutral-dark truncate">
                                            {suggestion.name}
                                        </div>
                                        {suggestion.category && (
                                            <div className="text-sm customtext-neutral-dark truncate">
                                                {suggestion.category.name}
                                            </div>
                                        )}
                                        {suggestion.final_price && (
                                            <div className="text-sm font-semibold customtext-primary">
                                                S/ {parseFloat(suggestion.final_price).toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-4 text-center customtext-neutral-dark">
                        No se encontraron productos
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <>
            {isFixed && <div className="h-20 lg:h-16 w-full"></div>}
            <motion.nav
                className={`bg-[#F8F9FA] shadow-md fonts-paragraph w-full top-0 left-0 z-[99] transition-all duration-300 ${isFixed ? "fixed shadow-lg" : "relative"}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
            {/* Desktop HeaderBananaLab */}
            <div className="max-w-7xl mx-auto px-primary lg:px-0">
                <div className="flex w-full items-center justify-between h-20 lg:h-16">
                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        

                        <motion.button
                            aria-label="Menú"
                            onClick={() => setOpenMenu(!openMenu)}
                            className="flex  md:hidden items-center justify-center bg-primary rounded-lg w-auto h-auto p-2 text-white fill-white transition-all duration-300"
                            whileTap={{ scale: 0.9 }}
                        >
                            {!openMenu ? (
                                <Menu className="h-6 w-6" />
                            ) : (
                                <X className="h-6 w-6" />
                            )}
                        </motion.button>
                    </div>

                    {/* Logo */}
                    <motion.a
                        href="/"
                        className="flex-shrink-0"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <img
                            className="h-6 lg:h-8 w-auto"
                            src={`/assets/resources/logo.png?v=${crypto.randomUUID()}`}
                            alt={Global.APP_NAME}
                            onError={(e) =>
                                (e.target.src = "/api/thumbnail/null")
                            }
                        />
                    </motion.a>

                    {/* Mobile search button */}
                    <div className="md:hidden ">
                    <div className={`${searchMobile ? "hidden" : "flex"} items-center gap-4`}>
                            {isUser ? (
                                <div ref={userMenuRef} className="relative">
                                    <motion.button
                                        aria-label="user"
                                        className="flex items-center gap-2 hover:customtext-primary transition-all duration-300 relative group"
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <div className="relative transform group-hover:scale-105 transition-transform duration-200">
                                            {isUser.uuid ? (
                                                <div className="relative">
                                                    <ProfileImage
                                                        uuid={isUser.uuid}
                                                        name={isUser.name}
                                                        lastname={isUser.lastname}
                                                        className="!w-6 !h-6 rounded-full object-cover border-2 border-primary ring-secondary transition-all duration-300"
                                                    />
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary border-2 border-white rounded-full animate-pulse">
                                                        <div className="w-full h-full bg-primary rounded-full animate-ping opacity-75 absolute"></div>
                                                        <div className="w-full h-full bg-primary rounded-full"></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <UserCircle
                                                        className="customtext-primary border-2 border-primary rounded-full ring-secondary transition-all duration-300"
                                                        width="1.5rem"
                                                    />
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary border-2 border-white rounded-full animate-pulse">
                                                        <div className="w-full h-full bg-primary rounded-full animate-ping opacity-75 absolute"></div>
                                                        <div className="w-full h-full bg-primary rounded-full"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>

                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <motion.div
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={menuVariants}
                                                className="absolute z-50 top-full -left-20 bg-white shadow-xl border-t rounded-xl w-48 mt-2"
                                            >
                                                <div className="p-4">
                                                    <ul className="space-y-3">
                                                        {isCustomer ? (
                                                            menuItems.map((item, index) => (
                                                                <li key={index}>
                                                                    {item.onClick ? (
                                                                        <button
                                                                            aria-label="menu-items"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setIsMenuOpen(false);
                                                                                setTimeout(() => {
                                                                                    item.onClick();
                                                                                }, 150);
                                                                            }}
                                                                            className="flex w-full items-center gap-3 customtext-neutral-dark text-sm hover:customtext-primary hover:bg-gray-50 transition-all duration-300 p-2 rounded-lg"
                                                                        >
                                                                            {item.icon}
                                                                            <span>{item.label}</span>
                                                                        </button>
                                                                    ) : (
                                                                        <a
                                                                            href={item.href}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setIsMenuOpen(false);
                                                                            }}
                                                                            className="flex items-center gap-3 customtext-neutral-dark text-sm hover:customtext-primary hover:bg-gray-50 transition-all duration-300 p-2 rounded-lg"
                                                                        >
                                                                            {item.icon}
                                                                            <span>{item.label}</span>
                                                                        </a>
                                                                    )}
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <>
                                                                <li>
                                                                    <a
                                                                        href="/admin/home"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setIsMenuOpen(false);
                                                                        }}
                                                                        className="flex items-center gap-3 customtext-neutral-dark text-sm hover:customtext-primary hover:bg-gray-50 transition-all duration-300 p-2 rounded-lg"
                                                                    >
                                                                        <Home size={16} />
                                                                        <span>Dashboard</span>
                                                                    </a>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setIsMenuOpen(false);
                                                                            setTimeout(() => {
                                                                                Logout();
                                                                            }, 150);
                                                                        }}
                                                                        className="flex w-full items-center gap-3 customtext-neutral-dark text-sm hover:customtext-primary hover:bg-gray-50 transition-all duration-300 p-2 rounded-lg"
                                                                    >
                                                                        <DoorClosed size={16} />
                                                                        <span>Cerrar Sesión</span>
                                                                    </button>
                                                                </li>
                                                            </>
                                                        )}
                                                    </ul>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <a href="/iniciar-sesion" className="flex items-center">
                                    <UserCircle className="customtext-primary" width="1.5rem" />
                                </a>
                            )}

                            <motion.button
                                aria-label="cart"
                                onClick={() => setModalOpen(true)}
                                className="flex items-center relative"
                                whileTap={{ scale: 0.9 }}
                            >
                                <ShoppingCart className="customtext-primary" width="1.5rem" />
                                <span className="absolute -right-2 -top-2 inline-flex items-center justify-center w-4 h-4 bg-secondary text-white rounded-full text-[8px]">
                                    {totalCount}
                                </span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <motion.div
                                className="relative w-[450px] mx-auto"
                                whileHover={{ scale: 1.01 }}
                            >
                                <form onSubmit={handleFormSubmit} role="search">
                                    <input
                                        ref={desktopSearchInputRef}
                                        type="search"
                                        name="search"
                                        placeholder="Buscar productos"
                                        value={search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => {
                                            if (search.trim().length >= 2) {
                                                fetchSearchSuggestions(search);
                                            }
                                        }}
                                        className="w-full pr-14 py-3 pl-4 border-0 rounded-full focus:ring-0 focus:outline-none ring-0 bg-sections-color"
                                        enterKeyHint="search"
                                        inputMode="search"
                                        autoComplete="on"
                                        role="searchbox"
                                        aria-label="Buscar productos"
                                    />
                                    <motion.button
                                        type="submit"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 customtext-neutral-dark rounded-lg hover:customtext-primary transition-colors"
                                        aria-label="Buscar"
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Search />
                                    </motion.button>
                                </form>

                                <AnimatePresence>
                                    <SearchSuggestions
                                        suggestions={searchSuggestions}
                                        isLoading={isLoadingSuggestions}
                                        onSelect={selectSuggestion}
                                        selectedIndex={selectedSuggestionIndex}
                                    />
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </div>

                    {/* Desktop Right Icons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="relative" ref={userMenuRef}>
                            {isUser ? (
                                <motion.button
                                    className="customtext-neutral-light flex gap-2 hover:customtext-primary transition-colors duration-200 relative group"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <div className="relative transform group-hover:scale-105 transition-transform duration-200">
                                        {isUser.uuid ? (
                                            <div className="relative">
                                                <ProfileImage
                                                    uuid={isUser.uuid}
                                                    name={isUser.name}
                                                    lastname={isUser.lastname}
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-primary ring-secondary transition-all duration-300"
                                                />
                                                <div className="absolute -bottom-[-0.115rem] -right-0.5 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full animate-pulse">
                                                    <div className="w-full h-full bg-primary rounded-full animate-ping opacity-75 absolute"></div>
                                                    <div className="w-full h-full bg-primary rounded-full"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <UserCircle className="customtext-primary border-2 border-primary rounded-full ring-secondary group-hover:ring-green-300 transition-all duration-300" />
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full animate-pulse">
                                                    <div className="w-full h-full bg-primary rounded-full animate-ping opacity-75 absolute"></div>
                                                    <div className="w-full h-full bg-primary rounded-full"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <span className="hidden md:inline">
                                        {isUser.name}
                                    </span>
                                </motion.button>
                            ) : (
                                <motion.a
                                    href="/iniciar-sesion"
                                    className="customtext-neutral-light hover:customtext-primary transition-colors duration-200 flex items-center gap-2"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <UserCircle className="h-5 w-5" />
                                    <span className="hidden md:inline">Iniciar Sesión</span>
                                </motion.a>
                            )}

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={menuVariants}
                                        className="absolute z-50 top-full right-0 bg-white shadow-xl border-t rounded-xl w-48 mt-2"
                                    >
                                        <div className="p-4">
                                            <ul className="space-y-3">
                                                {isCustomer ? (
                                                    menuItems.map((item, index) => (
                                                        <li key={index}>
                                                            {item.onClick ? (
                                                                <button
                                                                    aria-label="menu-items"
                                                                    onClick={item.onClick}
                                                                    className="flex w-full items-center gap-3 customtext-neutral-dark text-sm hover:customtext-primary transition-colors duration-300"
                                                                >
                                                                    {item.icon}
                                                                    <span>{item.label}</span>
                                                                </button>
                                                            ) : (
                                                                <a
                                                                    href={item.href}
                                                                    className="flex items-center gap-3 customtext-neutral-dark text-sm hover:customtext-primary transition-colors duration-300"
                                                                >
                                                                    {item.icon}
                                                                    <span>{item.label}</span>
                                                                </a>
                                                            )}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <>
                                                        <li>
                                                            <a
                                                                href="/admin/home"
                                                                className="flex items-center gap-3 customtext-neutral-dark text-sm hover:customtext-primary transition-colors duration-300"
                                                            >
                                                                <Home size={16} />
                                                                <span>Dashboard</span>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                href="#"
                                                                onClick={Logout}
                                                                className="flex items-center gap-3 customtext-neutral-dark text-sm hover:customtext-primary transition-colors duration-300"
                                                            >

                                                                <DoorClosed size={16} />
                                                                <span>Cerrar Sesión</span>
                                                            </a>
                                                        </li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/*   <motion.button 
                            className="relative customtext-neutral-light hover:customtext-primary transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Heart className="h-5 w-5" />
                            <motion.span 
                                className="h-3 w-3 bg-secondary absolute -top-1 -right-2 text-[10px] flex items-center justify-center text-white rounded-full"
                                whileHover={{ scale: 1.2 }}
                            >
                                0
                            </motion.span>
                        </motion.button> */}

                        <motion.button
                            onClick={() => setModalOpen(true)}
                            className="relative customtext-neutral-light hover:customtext-primary transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <motion.span
                                className="h-3 w-3 bg-secondary absolute -top-1 -right-2 text-[10px] flex items-center justify-center text-white rounded-full"
                                animate={totalCount > 0 ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                {totalCount}
                            </motion.span>
                        </motion.button>

                        <div className="hidden md:block ml-2 text-left">
                            <p className="text-xs font-medium">Tu carrito</p>
                            <p className="text-sm font-bold">
                                S/ {totalPrice.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>



            {/* Mobile menu */}
            <AnimatePresence>
                {openMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-transparent text-textWhite shadow-lg w-full min-h-screen absolute z-[999] top-20"
                        ref={menuRef}
                    >
                        <MobileMenu
                            search={search}
                            setSearch={setSearch}
                            pages={[]} // Pasamos array vacío para que empiece desde categorías
                            items={items}
                            onClose={() => setOpenMenu(!openMenu)}
                            startFromCategories={true} // Nueva prop para indicar que empiece desde categorías
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <CartModalBananaLab
                data={data}
                cart={cart}
                setCart={setCart}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
            />

        </motion.nav>
        </>
    );
};

export default HeaderBananaLab;