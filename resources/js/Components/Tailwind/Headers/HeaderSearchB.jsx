import { useEffect, useRef, useState } from "react";
import Global from "../../../Utils/Global";
import {
    CircleUser,
    DoorClosed,
    Search,
    ShoppingCart,
    XIcon,
    User,
    Settings,
    CreditCard,
} from "lucide-react";
import CartModal from "../Components/CartModal";
import Logout from "../../../Actions/Logout";
import MobileMenu from "./Components/MobileMenu";
import { motion, AnimatePresence } from "framer-motion";

const HeaderSearchB = ({
    items,
    data,
    cart,
    setCart,
    isUser,
    pages,
    generals = [],
}) => {
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

    const menuRef = useRef(null);
    const searchRef = useRef(null);
    const mobileSearchInputRef = useRef(null);
    const desktopSearchInputRef = useRef(null);

    const totalCount = cart.reduce((acc, item) => Number(acc) + Number(item.quantity), 0);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            // Mejorar el manejo del click outside para la búsqueda móvil
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                // Solo cerrar si no se está escribiendo activamente
                if (!search.trim()) {
                    setSearchMobile(false);
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside); // Para dispositivos táctiles
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [search]); // Agregar search como dependencia

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsFixed(true);
            } else {
                setIsFixed(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // useEffect para manejar el escape en la búsqueda móvil
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Escape' && searchMobile) {
                setSearchMobile(false);
                setSearch("");
            }
        };

        if (searchMobile) {
            document.addEventListener("keydown", handleKeyPress);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [searchMobile]);

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

    // Función para manejar el submit del form (mejorada)
    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (search.trim()) {
            const trimmedSearch = search.trim();
            window.location.href = `/catalogo?search=${encodeURIComponent(trimmedSearch)}`;
        }
        return false; // Prevenir comportamiento por defecto adicional
    };

    // Función específica para el input móvil
    const handleMobileSearch = (event) => {
        event.preventDefault();
        if (search.trim()) {
            const trimmedSearch = search.trim();
            setSearchMobile(false); // Cerrar el input móvil
            window.location.href = `/catalogo?search=${encodeURIComponent(trimmedSearch)}`;
        }
        return false;
    };

    // Función para manejar el Enter y el icono de búsqueda del teclado móvil
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (search.trim()) {
                const trimmedSearch = search.trim();
                setSearchMobile(false); // Cerrar el input móvil si está abierto
                window.location.href = `/catalogo?search=${encodeURIComponent(trimmedSearch)}`;
            }
        }
    };

    return (
        <header className={`w-full top-0 left-0 z-50 transition-all duration-300 ${isFixed ? "fixed bg-white shadow-lg" : "relative bg-white"}`}>
            <div className="px-primary  bg-white 2xl:px-0 2xl:max-w-7xl mx-auto py-4 font-font-secondary text-base font-semibold">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 z-[51]">
                        <img
                            src={`/assets/resources/logo.png?v=${crypto.randomUUID()}`}
                            alt={Global.APP_NAME}
                            className="h-14 object-contain object-center"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/img/logo-bk.svg";
                            }}
                        />
                    </a>
                    {data?.showLoginCart && (
                        <div className="flex gap-8 lg:hidden">
                            <div className={`${searchMobile ? "hidden" : "flex"} items-center gap-4`}>
                                {isUser ? (
                                    <div ref={menuRef} className="relative">
                                        <button
                                            aria-label="user"
                                            className="flex items-center gap-2 hover:customtext-primary transition-colors duration-300"
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        >
                                            <CircleUser className="customtext-primary" width="1.5rem" />
                                        </button>

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
                                                            {menuItems.map((item, index) => (
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
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <a href="/iniciar-sesion" className="flex items-center">
                                        <CircleUser className="customtext-primary" width="1.5rem" />
                                    </a>
                                )}

                                <button
                                    aria-label=""
                                    onClick={() => setModalOpen(true)}
                                    className="flex items-center relative"
                                >
                                    <ShoppingCart className="customtext-primary" width="1.5rem" />
                                    <span className="absolute -right-2 -top-2 inline-flex items-center justify-center w-4 h-4 bg-primary text-white rounded-full text-[8px]">
                                        {totalCount}
                                    </span>
                                </button>
                            </div>
                            <button
                                aria-label="Menú"
                                onClick={() => setOpenMenu(!openMenu)}

                                className="flex md:hidden items-center justify-center bg-primary rounded-lg w-auto h-auto p-2 text-white fill-white transition-all duration-300 "
                            >
                                {!openMenu ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M10 5H20"
                                            stroke="white"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M4 12H20"
                                            stroke="white"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M4 19H14"
                                            stroke="white"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                ) : (
                                    <XIcon />
                                )}
                            </button>
                        </div>
                    )}

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:block relative w-full max-w-xl mx-auto">
                        <form onSubmit={handleFormSubmit} role="search">
                            <input
                                ref={desktopSearchInputRef}
                                type="search"
                                name="search"
                                placeholder="Buscar productos"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full pr-14 py-4 pl-4 border rounded-full focus:ring-0 focus:outline-none"
                                enterKeyHint="search"
                                inputMode="search"
                                autoComplete="off"
                                role="searchbox"
                                aria-label="Buscar productos"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                aria-label="Buscar"
                            >
                                <Search />
                            </button>
                        </form>
                    </div>

                    {/* Account and Cart */}
                    {data?.showLoginCart ? (
                        <div className="hidden md:flex items-center gap-4 relative text-sm">
                            <div ref={menuRef}>
                                {isUser ? (
                                    <button
                                        aria-label="user"
                                        className="customtext-neutral-dark flex items-center gap-2 hover:customtext-primary pr-6 transition-colors duration-300"
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    >
                                        <CircleUser className="customtext-primary" />
                                        <span className="hidden md:inline">{isUser.name}</span>
                                    </button>
                                ) : (
                                    <a href="/iniciar-sesion" className="flex items-center gap-2 text-sm hover:customtext-primary transition-colors duration-300">
                                        <CircleUser className="customtext-primary" />
                                        <span className="hidden md:inline">Iniciar Sesión</span>
                                    </a>
                                )}

                                <AnimatePresence>
                                    {isMenuOpen && (
                                        <motion.div
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            variants={menuVariants}
                                            className="absolute z-50 top-full left-0 bg-white shadow-xl border-t rounded-xl w-48 mt-2"
                                        >
                                            <div className="p-4">
                                                <ul className="space-y-3">
                                                    {menuItems.map((item, index) => (
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
                                                    ))}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                aria-label="cart"
                                onClick={() => setModalOpen(true)}
                                className="flex items-center gap-2 text-sm relative hover:customtext-primary transition-colors duration-300"
                            >
                                <div className="customtext-primary">
                                    <ShoppingCart />
                                </div>
                                <span className="hidden md:inline">Mi Carrito</span>
                                <span className="absolute -right-6 -top-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-primary text-white rounded-full">
                                    {totalCount}
                                </span>
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Desktop: botón "Haz tu Pedido" */}
                            <a
                                aria-label="primary-button"
                                className="hidden lg:block px-4 py-3 bg-primary text-white rounded-full hover:brightness-125 transition-colors duration-300"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={
                                    phoneWhatsapp && messageWhatsapp
                                        ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneWhatsapp)}&text=${encodeURIComponent(messageWhatsapp)}`
                                        : "#"
                                }
                            >
                                Haz tu Pedido
                            </a>
                            {/* Mobile: búsqueda expandible */}
                            <div className="md:hidden relative w-full max-w-xl mx-auto">
                                {!searchMobile ? (
                                    <button
                                        aria-label="Buscar productos"
                                        onClick={() => {
                                            setSearchMobile(true);
                                            // Pequeño delay para asegurar que el input se renderice antes del focus
                                            setTimeout(() => {
                                                if (mobileSearchInputRef.current) {
                                                    mobileSearchInputRef.current.focus();
                                                }
                                            }, 100);
                                        }}
                                        className="flex items-center justify-end w-full px-0 py-3"
                                    >
                                        <Search className="customtext-primary" size={28} />
                                    </button>
                                ) : (
                                    <div className="relative w-full">
                                        <form onSubmit={handleMobileSearch} role="search">
                                            <input
                                                ref={mobileSearchInputRef}
                                                type="search"
                                                name="search"
                                                placeholder="Buscar productos"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                className="w-full pr-14 py-4 pl-4 border rounded-full focus:ring-0 focus:outline-none"
                                                autoFocus
                                                enterKeyHint="search"
                                                inputMode="search"
                                                autoComplete="off"
                                                role="searchbox"
                                                aria-label="Buscar productos"
                                                onBlur={() => {
                                                    // Solo cerrar si no hay búsqueda activa
                                                    setTimeout(() => {
                                                        if (!search.trim()) {
                                                            setSearchMobile(false);
                                                        }
                                                    }, 200);
                                                }}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearch("");
                                                        setSearchMobile(false);
                                                    }}
                                                    className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                                                    aria-label="Cerrar búsqueda"
                                                >
                                                    <XIcon size={16} />
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                                    aria-label="Buscar"
                                                >
                                                    <Search size={16} />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* NUEVA SECCIÓN MÓVIL*/}
                   {data?.mobileSearch && (
                <div className="block md:hidden mt-6 space-y-4">
                  
                    {/* Tercera fila móvil: Barra de búsqueda completa */}
                 
                        <div className="w-full ">
                            <form onSubmit={handleMobileSearch} role="search" className="relative w-full">
                                <input
                                    type="search"
                                    name="search"
                                    placeholder="Buscar productos..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleKeyDown}
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
                        </div>
                   
                </div>
                )} 
            </div>

            <AnimatePresence>
                {openMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden bg-transparent text-textWhite shadow-lg w-full min-h-screen absolute z-10 top-20"
                    >
                        <MobileMenu
                            search={search}
                            setSearch={setSearch}
                            pages={pages}
                            items={items}
                            onClose={() => setOpenMenu(!openMenu)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <CartModal
                data={data}
                cart={cart}
                setCart={setCart}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
            />

            <div className="flex justify-end w-full mx-auto z-[100] relative">
                <div className="hidden lg:block fixed bottom-6 sm:bottom-[2rem] lg:bottom-[4rem] z-20 cursor-pointer">
                    <a
                        target="_blank"
                        id="whatsapp-toggle"
                        href={`https://api.whatsapp.com/send?phone=${phoneWhatsapp}&text=${messageWhatsapp}`}
                    >
                        <img
                            src="/assets/img/whatsapp.svg"
                            alt="whatsapp"
                            className="mr-3 w-16 h-16 md:w-[80px] md:h-[80px] animate-bounce duration-300"
                        />
                    </a>
                </div>
            </div>
        </header>
    );
};


export default HeaderSearchB;