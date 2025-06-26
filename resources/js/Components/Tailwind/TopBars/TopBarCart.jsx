import { useContext, useEffect, useRef, useState } from "react";
import General from "../../../Utils/General";
import { adjustTextColor } from "../../../Functions/adjustTextColor";
import { CircleUser, DoorClosed, ShoppingCart } from "lucide-react";
import Logout from "../../../Actions/Logout";
import CartModal from "../Components/CartModal";
import { hasRole } from "../../../Utils/CreateReactScript";

const TopBarCart = ({ data, cart, setCart, isUser, items }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (sectionRef.current) {
            adjustTextColor(sectionRef.current); // Llama a la función
        }
    }, []);
    const [modalOpen, setModalOpen] = useState(false);

    const totalCount = cart.reduce((acc, item) => {
        return Number(acc) + Number(item.quantity);
    }, 0);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const [search, setSearch] = useState("");

    return (
        <section
            ref={sectionRef}
            className="font-semibold text-lg bg-primary text-white font-font-general"
        >
            <div className="px-[5%] replace-max-w-here mx-auto py-3 flex flex-wrap justify-end md:justify-between items-center gap-2">
                <p className="hidden md:block ">{General.get("cintillo")}</p>
                <p className="hidden md:block text-xs">{data?.title}</p>

                {/* Account and Cart */}
                <div className="flex items-center gap-4 relative ">
                    {isUser ? (
                        <button
                            className="flex items-center gap-2 transition-colors duration-300"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="hidden md:inline">
                                Hola, {isUser.name}
                            </span>
                            <CircleUser />
                        </button>
                    ) : (
                        <a
                            href="/iniciar-sesion"
                            className="flex items-center gap-2 "
                        >
                            <span className="hidden md:inline">
                                Iniciar Sesión
                            </span>
                            <CircleUser />
                        </a>
                    )}
                    {isMenuOpen && (
                        <div className="fixed sm:absolute font-font-general customtext-primary z-50 top-10 md:top-5 left-1/2 right-0 bg-white shadow-xl border-t rounded-xl transition-all duration-300 ease-in-out w-40 sm:w-40 sm:mt-2 sm:left-auto sm:right-auto">
                            <div className="p-4">
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href={hasRole('Root', 'Admin') ? '/admin/home' : "/customer/dashboard"}
                                            className="flex items-center gap-2 text-sm transition-colors duration-300 cursor-pointer"
                                        >
                                            <CircleUser height="1rem" />
                                            <span>{hasRole('Root', 'Admin') ? 'Dashboard' : 'Mis pedidos'}</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            onClick={Logout}
                                            className="flex items-center gap-2 text-sm transition-colors duration-300 cursor-pointer"
                                        >
                                            <DoorClosed
                                                className="customtext-primary"
                                                height="1rem"
                                            />
                                            <span>Cerrar sesión</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2  relative"
                    >
                        <ShoppingCart />

                        <span className="absolute -right-2 -top-2 inline-flex items-center justify-center w-4 h-4  bg-white customtext-primary rounded-full text-[8px]">
                            {totalCount}
                        </span>
                    </button>
                </div>
            </div>
            <CartModal
                data={data}
                cart={cart}
                setCart={setCart}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
            />
        </section>
    );
};

export default TopBarCart;
