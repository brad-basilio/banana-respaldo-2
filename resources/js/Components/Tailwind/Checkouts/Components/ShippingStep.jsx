import { useCallback, useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import Number2Currency from "../../../../Utils/Number2Currency";
import DeliveryPricesRest from "../../../../Actions/DeliveryPricesRest";
import CouponsRest from "../../../../Actions/CouponsRest";
import { processCulqiPayment } from "../../../../Actions/culqiPayment";
import ButtonPrimary from "./ButtonPrimary";
import ButtonSecondary from "./ButtonSecondary";
import InputForm from "./InputForm";
import SelectForm from "./SelectForm";
import OptionCard from "./OptionCard";
import FreeItemsDisplay from "./FreeItemsDisplay";
import StorePickupSelector from "./StorePickupSelector";
import { InfoIcon, UserRoundX, XCircle, XOctagonIcon } from "lucide-react";
import { Notify } from "sode-extend-react";
import { debounce } from "lodash";
import { toast } from "sonner";

export default function ShippingStep({
    cart,
    setSale,
    setCode,
    setDelivery,
    setCart,
    onContinue,
    noContinue,
    subTotal,
    igv,
    totalFinal,
    user,
    setEnvio,
    envio,
    ubigeos = [],
    openModal,
    setCouponDiscount: setParentCouponDiscount,
    setCouponCode: setParentCouponCode,
    automaticDiscounts = [], // Se usará como reglas, no como descuentos ya calculados
    automaticDiscountTotal = 0,
    totalWithoutDiscounts,
    conversionScripts,
    setConversionScripts,
    onPurchaseComplete,
}) {
    const [selectedUbigeo, setSelectedUbigeo] = useState(null);
    const [defaultUbigeoOption, setDefaultUbigeoOption] = useState(null);
    

    // Estados para los descuentos automáticos calculados
    const [autoDiscounts, setAutoDiscounts] = useState([]);
    const [autoDiscountTotal, setAutoDiscountTotal] = useState(0);

    // Get free items from automatic discounts calculados
    const freeItems = autoDiscounts.reduce((items, discount) => {
        if (discount.free_items && Array.isArray(discount.free_items)) {
            return [...items, ...discount.free_items];
        }
        return items;
    }, []);

    // Función para calcular todos los descuentos automáticos
    const calculateAutomaticDiscounts = (cart, rules) => {
        let discounts = [];
        let totalDiscount = 0;

        for (const rule of rules) {
            switch (rule.type) {
                case 'buy_x_get_y': {
                    // Ejemplo: compra 2 lleva 1 gratis
                    cart.forEach(item => {
                        if (rule.product_ids?.includes(item.id)) {
                            const sets = Math.floor(item.quantity / (rule.buy + rule.get));
                            if (sets > 0 && rule.get > 0) {
                                const freeQty = sets * rule.get;
                                const discount = freeQty * item.final_price;
                                discounts.push({
                                    name: rule.name,
                                    amount: discount,
                                    description: rule.description,
                                    free_items: [{ ...item, quantity: freeQty }],
                                });
                                totalDiscount += discount;
                            }
                        }
                    });
                    break;
                }
                case 'quantity_discount': {
                    // Ejemplo: 2x1, 3x2 (paga menos por comprar más)
                    cart.forEach(item => {
                        if (rule.product_ids?.includes(item.id)) {
                            const sets = Math.floor(item.quantity / rule.buy);
                            if (sets > 0 && rule.pay < rule.buy) {
                                const discount = sets * (rule.buy - rule.pay) * item.final_price;
                                discounts.push({
                                    name: rule.name,
                                    amount: discount,
                                    description: rule.description,
                                });
                                totalDiscount += discount;
                            }
                        }
                    });
                    break;
                }
                case 'tiered_discount': {
                    // Ejemplo: compra 5 lleva 6 (1 gratis por cada 5)
                    cart.forEach(item => {
                        if (rule.product_ids?.includes(item.id)) {
                            const sets = Math.floor(item.quantity / rule.tier);
                            if (sets > 0 && rule.free > 0) {
                                const freeQty = sets * rule.free;
                                const discount = freeQty * item.final_price;
                                discounts.push({
                                    name: rule.name,
                                    amount: discount,
                                    description: rule.description,
                                    free_items: [{ ...item, quantity: freeQty }],
                                });
                                totalDiscount += discount;
                            }
                        }
                    });
                    break;
                }
                case 'category_discount': {
                    // Descuento por categoría
                    cart.forEach(item => {
                        if (rule.category_ids?.includes(item.category_id)) {
                            const discount = item.final_price * item.quantity * (rule.percent / 100);
                            if (discount > 0) {
                                discounts.push({
                                    name: rule.name,
                                    amount: discount,
                                    description: rule.description,
                                });
                                totalDiscount += discount;
                            }
                        }
                    });
                    break;
                }
                case 'cart_discount': {
                    // Descuento por total del carrito
                    const cartTotal = cart.reduce((sum, item) => sum + item.final_price * item.quantity, 0);
                    if (cartTotal >= (rule.min_total || 0)) {
                        const discount = rule.percent ? cartTotal * (rule.percent / 100) : (rule.amount || 0);
                        if (discount > 0) {
                            discounts.push({
                                name: rule.name,
                                amount: discount,
                                description: rule.description,
                            });
                            totalDiscount += discount;
                        }
                    }
                    break;
                }
                case 'bundle_discount': {
                    // Descuento por paquete/combo
                    const hasAll = rule.product_ids?.every(pid => cart.some(item => item.id === pid));
                    if (hasAll && rule.amount > 0) {
                        discounts.push({
                            name: rule.name,
                            amount: rule.amount,
                            description: rule.description,
                        });
                        totalDiscount += rule.amount;
                    }
                    break;
                }
                default:
                    break;
            }
        }
        return { discounts, totalDiscount };
    };

    // Recalcular descuentos automáticos cuando cambie el carrito o las reglas
    useEffect(() => {
        if (automaticDiscounts && Array.isArray(automaticDiscounts) && automaticDiscounts.length > 0) {
            const { discounts, totalDiscount } = calculateAutomaticDiscounts(cart, automaticDiscounts);
            setAutoDiscounts(discounts);
            setAutoDiscountTotal(totalDiscount);
        } else {
            setAutoDiscounts([]);
            setAutoDiscountTotal(0);
        }
    }, [cart, automaticDiscounts]);
    
    // Tipos de documentos como en ComplaintStech
    const typesDocument = [
        { value: "dni", label: "DNI" },
        { value: "ruc", label: "RUC" },
        { value: "ce", label: "CE" },
        { value: "pasaporte", label: "Pasaporte" },
    ];
    
    const [formData, setFormData] = useState({
        name: user?.name || "",
        lastname: user?.lastname || "",
        email: user?.email || "",
        phone: user?.phone || "",
        documentType:user?.document_type || "", // Tipo de documento obligatorio, por defecto DNI (en minúsculas como ComplaintStech)
        document: user?.document_number || "", // Número de documento (obligatorio)
        department: user?.department || "",
        province: user?.province || "",
        district: user?.district || "",
        address: user?.address || "",
        number: user?.number || "",
        comment: "",
        reference: user?.reference || "",
        ubigeo: user?.ubigeo || null,
    });
   
    useEffect(() => {
        if (user?.ubigeo && user?.district && user?.province && user?.department) {
          const defaultOption = {
            value: user.ubigeo,
            label: `${user.district}, ${user.province}, ${user.department}`,
            data: {
              reniec: user.ubigeo,
              departamento: user.department,
              provincia: user.province,
              distrito: user.district
            }
          };
          setDefaultUbigeoOption(defaultOption);
          setSelectedUbigeo(defaultOption); // Actualiza el estado del ubigeo seleccionado
          handleUbigeoChange(defaultOption);
        }
      }, [user]);

    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [costsGet, setCostsGet] = useState(null);
    const [errors, setErrors] = useState({});
    const [searchInput, setSearchInput] = useState("");
    const [expandedCharacteristics, setExpandedCharacteristics] = useState(false);
    
    
    // Estados para cupones
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    // El descuento del cupón se calcula sobre el total real, no solo el subtotal
    const [couponDiscount, setCouponDiscount] = useState(0); // solo para compatibilidad visual
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");

    // Estados para retiro en tienda
    const [selectedStore, setSelectedStore] = useState(null);
    const [showStoreSelector, setShowStoreSelector] = useState(false);

    // Función de validación mejorada con alertas específicas
    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{9}$/; // Validar que sea exactamente 9 dígitos

        if (!formData.name.trim()) {
            newErrors.name = "Nombre es requerido";
            toast.error("Campo requerido", {
                description: "Por favor ingrese su nombre",
                 icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        }
        if (!formData.lastname.trim()) {
            newErrors.lastname = "Apellido es requerido";
            toast.error("Campo requerido", {
                description: "Por favor ingrese su apellido",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        }
        if (!formData.documentType.trim()) {
            newErrors.documentType = "Tipo de documento es requerido";
            toast.error("Campo requerido", {
                description: "Por favor seleccione el tipo de documento",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        }
        if (!formData.document.trim()) {
            newErrors.document = "Número de documento es requerido";
            toast.error("Campo requerido", {
                description: "Por favor ingrese su número de documento",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email es requerido";
            toast.error("Campo requerido", {
                description: "Por favor ingrese su correo electrónico",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email inválido";
            toast.error("Email inválido", {
                description: "Por favor ingrese un correo electrónico válido",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        }
        if (!formData.phone.trim()) {
            newErrors.phone = "Teléfono es requerido";
            toast.error("Campo requerido", {
                description: "Por favor ingrese su número de teléfono",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        } else if (!phoneRegex.test(formData.phone.trim())) {
            newErrors.phone = "Teléfono debe tener exactamente 9 dígitos";
            toast.error("Teléfono inválido", {
                description: "El teléfono debe tener exactamente 9 dígitos",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        }
        if (!formData.ubigeo) {
            newErrors.ubigeo = "Ubicación es requerida";
            toast.error("Campo requerido", {
                description: "Por favor seleccione su ubicación de entrega",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        }
        if (!formData.address) {
            newErrors.address = "Dirección es requerida";
            toast.error("Campo requerido", {
                description: "Por favor ingrese su dirección de entrega",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        }
        if (!selectedOption) {
            newErrors.shipping = "Seleccione un método de envío";
            toast.error("Método de envío requerido", {
                description: "Por favor seleccione un método de envío",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        }
        
        // Validar tienda seleccionada si es retiro en tienda
        if (selectedOption === "store_pickup" && !selectedStore) {
            newErrors.store = "Seleccione una tienda para el retiro";
            toast.error("Tienda requerida", {
                description: "Por favor seleccione una tienda para retirar su pedido",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Función para manejar la selección de tienda
    const handleStoreSelect = (store) => {
        setSelectedStore(store);
        setErrors(prev => ({ ...prev, store: "" }));
    };

    // Función para enfocar el primer campo con error y hacer scroll suave
    const focusFirstError = (errors) => {
        const errorOrder = ['name', 'lastname', 'documentType', 'document', 'email', 'phone', 'ubigeo', 'address', 'shipping'];
        
        for (const fieldName of errorOrder) {
            if (errors[fieldName]) {
                let targetElement = null;
                let shouldFocus = false;

                if (fieldName === 'ubigeo') {
                    // Para el select de ubicación, buscar el contenedor del react-select
                    targetElement = document.querySelector('[name="ubigeo"]')?.parentElement?.parentElement || 
                                   document.querySelector('.css-1s2u09g-control') || 
                                   document.querySelector('[class*="react-select"]');
                } else if (fieldName === 'shipping') {
                    // Para la sección de métodos de envío, buscar el contenedor de radio buttons
                    targetElement = document.querySelector('input[name="shipping"]')?.closest('.space-y-4') ||
                                   document.querySelector('.space-y-4 h3') ||
                                   document.querySelector('h3');
                } else {
                    // Para campos normales (input, textarea)
                    targetElement = document.querySelector(`[name="${fieldName}"]`);
                    shouldFocus = true;
                }

                if (targetElement) {
                    // Hacer scroll suave al elemento
                    targetElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "nearest"
                    });

                    // Si es un campo que se puede enfocar, hacerlo después del scroll
                    if (shouldFocus) {
                        setTimeout(() => {
                            try {
                                targetElement.focus();
                                // Opcional: seleccionar el texto si es un input
                                if (targetElement.tagName === 'INPUT' && targetElement.type === 'text') {
                                    targetElement.select();
                                }
                            } catch (error) {
                                console.warn('No se pudo enfocar el elemento:', error);
                            }
                        }, 600); // Tiempo suficiente para completar el scroll
                    }

                    // Agregar efecto visual de resaltado
                    highlightElement(targetElement);

                    break; // Solo enfocar el primer error
                }
            }
        }
    };

    // Función auxiliar para agregar efecto visual temporal a un elemento
    const highlightElement = (element) => {
        if (!element) return;
        
        // Crear un div de overlay temporal para el efecto de resaltado
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 2px solid #ef4444;
            border-radius: 8px;
            pointer-events: none;
            z-index: 1000;
            animation: pulse 0.6s ease-in-out;
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
        `;
        
        // Agregar keyframes para la animación si no existen
        if (!document.querySelector('#error-highlight-styles')) {
            const style = document.createElement('style');
            style.id = 'error-highlight-styles';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.02); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Posicionar el elemento padre como relative si no lo está
        const originalPosition = element.style.position;
        if (!originalPosition || originalPosition === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(overlay);
        
        // Remover el overlay después de la animación
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
                // Restaurar posición original si fue cambiada
                if (!originalPosition || originalPosition === 'static') {
                    element.style.position = originalPosition;
                }
            }
        }, 1200);
    };

    const handleUbigeoChange = async (selected) => {
        if (!selected) return;
        
        setErrors(prev => ({ ...prev, ubigeo: "" }));
        const { data } = selected;

        setFormData(prev => ({
            ...prev,
            department: data.departamento,
            province: data.provincia,
            district: data.distrito,
            ubigeo: data.reniec,
        }));

        setLoading(true);
        try {
            const response = await DeliveryPricesRest.getShippingCost({
                ubigeo: data.reniec,
            });

            const options = [];
            let hasStorePickup = false;

            if (response.data.is_free) {
                options.push({
                    type: "free",
                    price: 0,
                    description: response.data.standard.description,
                    deliveryType: response.data.standard.type,
                    characteristics: response.data.standard.characteristics,
                });

                if (response.data.express.price > 0) {
                    options.push({
                        type: "express",
                        price: response.data.express.price,
                        description: response.data.express.description,
                        deliveryType: response.data.express.type,
                        characteristics: response.data.express.characteristics,
                    });
                }

                // Si hay delivery gratis, forzar retiro en tienda
                hasStorePickup = true;
            } else if (response.data.is_agency) {
                options.push({
                    type: "agency",
                    price: 0,
                    description: response.data.agency.description,
                    deliveryType: response.data.agency.type,
                    characteristics: response.data.agency.characteristics,
                });
            } else if (response.data.is_store_pickup) {
                // Retiro en tienda como opción principal
                hasStorePickup = true;
            } else {
                options.push({
                    type: "standard",
                    price: response.data.standard.price,
                    description: response.data.standard.description,
                    deliveryType: response.data.standard.type,
                    characteristics: response.data.standard.characteristics,
                });
            }

            // Si hay retiro en tienda disponible, agregar la opción usando los datos que ya vienen en la respuesta
            if (hasStorePickup || response.data.is_store_pickup) {
                // Evitar duplicados si ya existe la opción
                const alreadyHasStorePickup = options.some(opt => opt.type === "store_pickup");
                if (!alreadyHasStorePickup) {
                    // Usar los datos que ya vienen en la respuesta de DeliveryPricesRest.getShippingCost()
                    if (response.data.store_pickup) {
                        options.push({
                            type: "store_pickup",
                            price: response.data.store_pickup.price,
                            description: response.data.store_pickup.description,
                            deliveryType: response.data.store_pickup.type,
                            characteristics: response.data.store_pickup.characteristics,
                        });
                    } else {
                        // Si no hay datos específicos de store_pickup, usar valores por defecto
                        options.push({
                            type: "store_pickup",
                            price: 0,
                            description: "Retira tu pedido en una de nuestras tiendas",
                            deliveryType: "Retiro en Tienda",
                            characteristics: ["Sin costo de envío", "Horarios flexibles", "Atención personalizada"],
                        });
                    }
                }
                setShowStoreSelector(true);
            } else {
                setShowStoreSelector(false);
                setSelectedStore(null);
            }

            setShippingOptions(options);
            setSelectedOption(options[0]?.type || null);
            setEnvio(options[0]?.price || 0);
            setExpandedCharacteristics(false); // Reset expansion state when location changes
        } catch (error) {
            //console.error("Error al obtener precios de envío:", error);
            toast.error("Sin cobertura", {
                description: `No realizamos envíos a esta ubicación.`,
                icon: <XOctagonIcon className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "bottom-center",
            });
          
            setShippingOptions([]);
            setSelectedOption(null);
            setEnvio(0);
            setExpandedCharacteristics(false); // Reset expansion state on error
        }
        setLoading(false);
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        // Prevenir múltiples clicks
        if (paymentLoading) return;

        if (!user) {
            toast.error("Acceso requerido", {
                description: `Debe iniciar sesión para continuar.`,
                icon: <UserRoundX className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "bottom-center",
            });
            return;
        }

        const currentErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{9}$/;

        // Validación sin mostrar toast aún
        if (!formData.name.trim()) currentErrors.name = "Nombre es requerido";
        if (!formData.lastname.trim()) currentErrors.lastname = "Apellido es requerido";
        if (!formData.documentType.trim()) currentErrors.documentType = "Tipo de documento es requerido";
        if (!formData.document.trim()) currentErrors.document = "Número de documento es requerido";
        if (!formData.email.trim()) {
            currentErrors.email = "Email es requerido";
        } else if (!emailRegex.test(formData.email)) {
            currentErrors.email = "Email inválido";
        }
        if (!formData.phone.trim()) {
            currentErrors.phone = "Teléfono es requerido";
        } else if (!phoneRegex.test(formData.phone.trim())) {
            currentErrors.phone = "Teléfono debe tener exactamente 9 dígitos";
        }
        if (!formData.ubigeo) currentErrors.ubigeo = "Ubicación es requerida";
        if (!formData.address) currentErrors.address = "Dirección es requerida";
        if (!selectedOption) currentErrors.shipping = "Seleccione un método de envío";

        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
            
            // Mostrar toast específico para el primer error
            const firstErrorKey = Object.keys(currentErrors)[0];
            const errorMessages = {
                name: "Por favor ingrese su nombre",
                lastname: "Por favor ingrese su apellido",
                documentType: "Por favor seleccione el tipo de documento",
                document: "Por favor ingrese su número de documento",
                email: currentErrors.email?.includes("inválido") ? "Por favor ingrese un correo electrónico válido" : "Por favor ingrese su correo electrónico",
                phone: currentErrors.phone?.includes("9 dígitos") ? "El teléfono debe tener exactamente 9 dígitos" : "Por favor ingrese su número de teléfono",
                ubigeo: "Por favor seleccione su ubicación de entrega",
                address: "Por favor ingrese su dirección de entrega",
                shipping: "Por favor seleccione un método de envío"
            };

            toast.error("Complete el campo requerido", {
                description: errorMessages[firstErrorKey],
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 4000,
                position: "top-center",
            });

            // Enfocar el primer campo con error y hacer scroll suave
            focusFirstError(currentErrors);
            return;
        }

        setPaymentLoading(true);

        try {
            const request = {
                user_id: user.id,
                ...formData,
                fullname: `${formData.name} ${formData.lastname}`,
                country: "Perú",
                document_type: formData.documentType, // Cambiar a document_type para que coincida con lo que espera el backend
                amount: roundToTwoDecimals(finalTotalWithCoupon),
                delivery: roundToTwoDecimals(envio),
                delivery_type: selectedOption, // Agregar tipo de entrega
                store_id: selectedOption === "store_pickup" ? selectedStore?.id : null, // ID de tienda si es retiro en tienda
                cart: cart,
                // Información del cupón - todos redondeados a 2 decimales
                coupon_id: appliedCoupon?.id || null,
                coupon_code: appliedCoupon?.code || null,
                coupon_discount: roundToTwoDecimals(couponDiscount || 0),
                // Información de promociones automáticas
                applied_promotions: automaticDiscounts || [],
                promotion_discount: roundToTwoDecimals(automaticDiscountTotal || 0),
            };

            console.log("📦 Request completo a enviar:", request);
            console.log("💰 Monto final con cupón:", finalTotalWithCoupon);
            console.log("🎟️ Descuento del cupón:", couponDiscount);
            console.log("🚚 Costo de envío:", envio);

            const response = await processCulqiPayment(request);

            if (response.status) {
                setSale(response.sale);
                setDelivery(response.delivery);
                setCode(response.code);
                
                // Capturar scripts de conversión si están disponibles
                if (response.conversion_scripts) {
                    console.log('Scripts de conversión recibidos:', response.conversion_scripts);
                    setConversionScripts(response.conversion_scripts);
                    
                    // Llamar al callback de compra completada si está disponible
                    if (onPurchaseComplete) {
                        onPurchaseComplete(response.sale_id, response.conversion_scripts);
                    }
                }
                
                setCart([]);
                onContinue();
            } else {
                toast.error("Error en el pago", {
                    description: response.message || "Pago rechazado",
                    icon: <XOctagonIcon className="h-5 w-5 text-red-500" />,
                    duration: 3000,
                    position: "bottom-center",
                });
            }
        } catch (error) {
            toast.error("Lo sentimos, no puede continuar con la compra", {
                description: `Ocurrió un error al procesar el pedido.`,
                icon: <XOctagonIcon className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "bottom-center",
            });
        } finally {
            setPaymentLoading(false);
        }
    };

    const loadOptions = useCallback(
        debounce((inputValue, callback) => {
            if (inputValue.length < 3) {
                callback([]);
                return;
            }

            fetch(`/api/ubigeo/search?q=${encodeURIComponent(inputValue)}`)
                .then((response) => {
                    if (!response.ok) throw new Error("Error en la respuesta");
                    return response.json();
                })
                .then((data) => {
                    const options = data.map((item) => ({
                        value: item.reniec,
                        label: `${item.distrito}, ${item.provincia}, ${item.departamento}`,
                        data: {
                            inei: item.inei,
                            reniec: item.reniec,
                            departamento: item.departamento,
                            provincia: item.provincia,
                            distrito: item.distrito,
                        },
                    }));
                    callback(options);
                })
                .catch((error) => {
                   // console.error("Error:", error);
                    callback([]);
                });
        }, 300),
        []
    );

    useEffect(() => {
        // Limpiar errores cuando los campos son modificados y validar en tiempo real
        setErrors(prev => {
            const newErrors = { ...prev };
            
            // Limpiar errores de campos que ahora tienen valores válidos
            if (formData.name.trim()) delete newErrors.name;
            if (formData.lastname.trim()) delete newErrors.lastname;
            if (formData.documentType.trim()) delete newErrors.documentType;
            if (formData.document.trim()) delete newErrors.document;
            if (formData.email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(formData.email)) delete newErrors.email;
            }
            if (formData.phone.trim()) {
                const phoneRegex = /^[0-9]{9}$/;
                if (phoneRegex.test(formData.phone.trim())) delete newErrors.phone;
            }
            if (formData.address.trim()) delete newErrors.address;
            if (formData.ubigeo) delete newErrors.ubigeo;
            if (selectedOption) delete newErrors.shipping;
            
            return newErrors;
        });
    }, [formData, selectedOption]);

    const selectStyles = (hasError) => ({
        control: (base) => ({
            ...base,
            border: `1px solid ${hasError ? '#ef4444' : '#e5e7eb'}`, // Added default border color
            boxShadow: 'none',
            minHeight: '50px',
            '&:hover': { borderColor: hasError ? '#ef4444' : '#6b7280' },
            borderRadius: '0.75rem',
            padding: '2px 8px',
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
            marginTop: '4px',
            borderRadius: '8px',
        }),
        option: (base) => ({
            ...base,
            color: '#1f2937',
            backgroundColor: 'white',
            '&:hover': { backgroundColor: '#f3f4f6' },
            padding: '12px 16px',
        }),
    });

    // Función para validar cupón
    const validateCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError("Ingrese un código de cupón");
            return;
        }

        setCouponLoading(true);
        setCouponError("");

        try {
            // Obtener IDs de categorías y productos del carrito
            const categoryIds = [...new Set(cart.map(item => item.category_id).filter(Boolean))];
            const productIds = cart.map(item => item.id);

            console.log("Validando cupón:", {
                code: couponCode.trim(),
                cart_total: subTotal,
                category_ids: categoryIds,
                product_ids: productIds
            });

            const response = await CouponsRest.validateCoupon({
                code: couponCode.trim(),
                cart_total: subTotal,
                category_ids: categoryIds,
                product_ids: productIds
            });

            console.log("Respuesta del cupón:", response);

            // Manejar diferentes estructuras de respuesta
            const data = response.data || response; // response.data para nueva estructura, response para estructura anterior
            
            if (data && data.valid) {
                setAppliedCoupon(data.coupon);
                // Redondear el descuento a 2 decimales para evitar problemas de precisión
                const roundedDiscount = Math.round(data.discount * 100) / 100;
                setCouponDiscount(roundedDiscount);
                
                // Actualizar el estado del componente padre
                if (setParentCouponDiscount) {
                    setParentCouponDiscount(roundedDiscount);
                }
                if (setParentCouponCode) {
                    setParentCouponCode(data.coupon?.code || couponCode.trim());
                }
                
                toast.success("Cupón aplicado", {
                    description: data.message || "Cupón aplicado correctamente",
                    duration: 3000,
                    position: "top-center",
                });
            } else {
                const errorMessage = data?.message || "Cupón no válido";
                setCouponError(errorMessage);
                toast.error("Cupón no válido", {
                    description: errorMessage,
                    icon: <XCircle className="h-5 w-5 text-red-500" />,
                    duration: 3000,
                    position: "top-center",
                });
            }
        } catch (error) {
            console.error("Error al validar cupón:", error);
            setCouponError("Error al validar el cupón");
            toast.error("Error", {
                description: error.message || "No se pudo validar el cupón. Intente nuevamente.",
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "top-center",
            });
        } finally {
            setCouponLoading(false);
        }
    };

    // Función para remover cupón
    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponCode("");
        setCouponError("");
        
        // Limpiar el estado del componente padre
        if (setParentCouponDiscount) {
            setParentCouponDiscount(0);
        }
        if (setParentCouponCode) {
            setParentCouponCode("");
        }
        
        toast.success("Cupón removido", {
            description: "El cupón ha sido removido de su pedido",
            duration: 2000,
            position: "top-center",
        });
    };

    // Función auxiliar para redondear valores monetarios con mayor precisión
    const roundToTwoDecimals = (num) => {
        // Convertir a número si es string
        const number = typeof num === 'string' ? parseFloat(num) : num;
        // Usar toFixed para evitar problemas de precisión de punto flotante
        return parseFloat(number.toFixed(2));
    };

    // Calcular el total base antes de cupón
    const totalBase = roundToTwoDecimals(subTotal) + roundToTwoDecimals(igv) + roundToTwoDecimals(envio) - roundToTwoDecimals(autoDiscountTotal);

    // Calcular el descuento del cupón sobre el total base
    let calculatedCouponDiscount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage' || appliedCoupon.type === 'percent') {
            calculatedCouponDiscount = (totalBase * Number(appliedCoupon.value)) / 100;
        } else if (appliedCoupon.type === 'fixed') {
            calculatedCouponDiscount = Number(appliedCoupon.value);
        }
    }
    // Sincronizar el estado para mantener compatibilidad visual
    useEffect(() => {
        setCouponDiscount(roundToTwoDecimals(calculatedCouponDiscount));
        if (setParentCouponDiscount) setParentCouponDiscount(roundToTwoDecimals(calculatedCouponDiscount));
    }, [appliedCoupon, subTotal, igv, envio, autoDiscountTotal]);

    const finalTotalWithCoupon = Math.max(0, roundToTwoDecimals(totalBase - calculatedCouponDiscount));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 md:gap-8">
            <div className="lg:col-span-3">
                <form className="space-y-4 md:space-y-6 bg-white p-4 md:p-6 rounded-xl shadow-sm" onSubmit={handlePayment}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputForm
                            name="name"
                            label="Nombres"
                            value={formData.name}
                            error={errors.name}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, name: e.target.value }));
                                // Limpiar error inmediatamente si el campo ya no está vacío
                                if (e.target.value.trim() && errors.name) {
                                    setErrors(prev => ({ ...prev, name: '' }));
                                }
                            }}
                            required
                            className={`border-gray-200 ${errors.name ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        <InputForm
                            name="lastname"
                            label="Apellidos"
                            value={formData.lastname}
                            error={errors.lastname}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, lastname: e.target.value }));
                                if (e.target.value.trim() && errors.lastname) {
                                    setErrors(prev => ({ ...prev, lastname: '' }));
                                }
                            }}
                            required
                            className={`border-gray-200 ${errors.lastname ? 'border-red-500 bg-red-50' : ''}`}
                        />
                    </div>

                    {/* Campos de documento en una fila */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <SelectForm
                                label="Tipo de documento"
                                options={typesDocument}
                                placeholder="Selecciona tu documento"
                                labelClass="block text-sm 2xl:!text-base mb-1 customtext-neutral-dark"
                                value={formData.documentType}
                                error={errors.documentType}
                                onChange={(value) => {
                                    setFormData(prev => ({ ...prev, documentType: value }));
                                    if (value && errors.documentType) {
                                        setErrors(prev => ({ ...prev, documentType: '' }));
                                    }
                                }}
                                required
                            />
                        </div>
                        <InputForm
                            name="document"
                            label="Número de documento"
                            value={formData.document}
                            error={errors.document}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, document: e.target.value }));
                                if (e.target.value.trim() && errors.document) {
                                    setErrors(prev => ({ ...prev, document: '' }));
                                }
                            }}
                            placeholder="Ej: 12345678"
                            required
                            className={`border-gray-200 ${errors.document ? 'border-red-500 bg-red-50' : ''}`}
                        />
                    </div>

                    <InputForm
                        name="email"
                        label="Correo electrónico"
                        type="email"
                        value={formData.email}
                        error={errors.email}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, email: e.target.value }));
                            if (e.target.value.trim() && errors.email) {
                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                if (emailRegex.test(e.target.value)) {
                                    setErrors(prev => ({ ...prev, email: '' }));
                                }
                            }
                        }}
                        required
                        className={`border-gray-200 ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
                    />

                    <InputForm
                        name="phone"
                        label="Teléfono"
                        type="tel"
                        value={formData.phone}
                        error={errors.phone}
                        onChange={(e) => {
                            // Solo permitir números
                            const value = e.target.value.replace(/\D/g, '');
                            setFormData(prev => ({ ...prev, phone: value }));
                            // Validar inmediatamente
                            if (value.length === 9 && errors.phone) {
                                setErrors(prev => ({ ...prev, phone: '' }));
                            }
                        }}
                        maxLength="9"
                        placeholder="Ej: 987654321"
                        required
                        className={`border-gray-200 ${errors.phone ? 'border-red-500 bg-red-50' : ''}`}
                    />

                    <div className="form-group">
                        <label className="block text-sm 2xl:text-base mb-2 font-medium customtext-neutral-dark">
                        Distrito / Provincia / Departamento (Ubicación de entrega)<span className="text-red-500 ml-1">*</span>
                        </label>
                        <AsyncSelect
                            name="ubigeo"
                            cacheOptions
                            value={selectedUbigeo}
                            loadOptions={loadOptions}
                            onChange={(selected) => {
                                setSelectedUbigeo(selected);
                                handleUbigeoChange(selected);
                                setSearchInput(""); // Limpiar input al seleccionar
                            }}
                            inputValue={searchInput}
                            onInputChange={(value, { action }) => {
                                if (action === "input-change") setSearchInput(value);
                            }}
                            onFocus={() => {
                                setSelectedUbigeo(null); // Limpiar selección al enfocar
                                setSearchInput("");      // Limpiar input de búsqueda
                            }}
                            onMenuOpen={() => {
                                if (selectedUbigeo) {
                                    setSelectedUbigeo(null);
                                    setSearchInput("");
                                }
                            }}
                            placeholder="Buscar por Distrito ..."
                            loadingMessage={() => "Buscando ubicaciones..."}
                            noOptionsMessage={({ inputValue }) =>
                                inputValue.length < 3
                                    ? "Buscar por Distrito ..."
                                    : "No se encontraron resultados"
                            }
                            isLoading={loading}
                            styles={selectStyles(!!errors.ubigeo)}
                            formatOptionLabel={({ data }) => (
                                <div className="text-sm py-1">
                                    <div className="font-medium">{data.distrito}</div>
                                    <div className="text-gray-500">
                                        {data.provincia}, {data.departamento}
                                    </div>
                                </div>
                            )}
                            className="w-full rounded-xl transition-all duration-300"
                            menuPortalTarget={document.body}
                            isClearable={true}
                        />
                        {errors.ubigeo && <div className="text-red-500 text-sm mt-1">{errors.ubigeo}</div>}
                    </div>

                    <InputForm
                        name="address"
                        label="Dirección "
                        value={formData.address}
                        error={errors.address}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, address: e.target.value }));
                            if (e.target.value.trim() && errors.address) {
                                setErrors(prev => ({ ...prev, address: '' }));
                            }
                        }}
                        required
                        className={`border-gray-200 ${errors.address ? 'border-red-500 bg-red-50' : ''}`}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputForm
                            label="Número"
                            value={formData.number}
                            onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                            className="border-gray-200"
                        />
                        <InputForm
                            label="Referencia"
                            value={formData.reference}
                            onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                            className="border-gray-200"
                        />
                    </div>

                    {shippingOptions.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Método de envío</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {shippingOptions.map((option) => (
                                    <OptionCard
                                        key={option.type}
                                        title={option.deliveryType}
                                        price={option.price}
                                        description={option.description}
                                        selected={selectedOption === option.type}
                                        onSelect={() => {
                                            setSelectedOption(option.type);
                                            setEnvio(option.price);
                                            setErrors(prev => ({ ...prev, shipping: '', store: '' }));
                                            setExpandedCharacteristics(false); // Reset expansion when changing shipping option
                                            
                                            // Reset tienda seleccionada si no es retiro en tienda
                                            if (option.type !== "store_pickup") {
                                                setSelectedStore(null);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                            {selectedOption && shippingOptions.length > 0 && (
                                <div className="space-y-3 mt-4">
                                    {(() => {
                                        const characteristics = shippingOptions
                                            .find((o) => o.type === selectedOption)
                                            ?.characteristics || [];
                                        
                                        const shouldShowButton = characteristics.length > 1;
                                        const displayedCharacteristics = shouldShowButton && !expandedCharacteristics 
                                            ? characteristics.slice(0, 1) 
                                            : characteristics;

                                        return (
                                            <>
                                                {displayedCharacteristics.map((char, index) => (
                                                    <div key={`char-${index}`} className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                                                        <div className="w-5 flex-shrink-0">
                                                            <InfoIcon className="customtext-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium customtext-neutral-dark">{char}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                
                                                {shouldShowButton && (
                                                    <div className="flex justify-center mt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedCharacteristics(!expandedCharacteristics)}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium customtext-primary hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                                        >
                                                            <span>
                                                                {expandedCharacteristics 
                                                                    ? 'Ver menos información' 
                                                                    : `Ver más información (${characteristics.length - 1} más)`}
                                                            </span>
                                                            <svg 
                                                                className={`w-4 h-4 transition-transform duration-200 ${expandedCharacteristics ? 'rotate-180' : ''}`} 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Selector de tienda para retiro en tienda */}
                    {selectedOption === "store_pickup" && showStoreSelector && (
                        <div className="space-y-4 mt-6">
                            <StorePickupSelector 
                                ubigeoCode={formData.ubigeo}
                                onStoreSelect={handleStoreSelect}
                                selectedStore={selectedStore}
                                className="border border-gray-200 rounded-xl p-4"
                            />
                            {errors.store && (
                                <div className="text-red-500 text-sm mt-2 flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    {errors.store}
                                </div>
                            )}
                        </div>
                    )}

                    {!noContinue && (
                        <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4 mt-6">
                            <ButtonSecondary type="button" onClick={() => window.history.back()} className="w-full md:w-auto">
                                Regresar
                            </ButtonSecondary>
                            <ButtonPrimary type="submit" loading={loading} className="w-full md:w-auto">
                                Continuar
                            </ButtonPrimary>
                        </div>
                    )}
                </form>
            </div>

            {/* Resumen de compra */}
            <div className="bg-[#F7F9FB] rounded-xl shadow-lg p-6 col-span-2 h-max">
                <h3 className="text-2xl font-bold pb-6">Resumen</h3>

                <div className="space-y-4 border-b-2 pb-6">
                    {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                            <img
                                src={`/storage/images/item/${item.image}`}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) =>
                                    (e.target.src =
                                        "/api/cover/thumbnail/null")
                                }
                            />
                            <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                                <p className="text-sm text-gray-600">S/ {Number2Currency(item.final_price)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 mt-6">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>S/ {Number2Currency(roundToTwoDecimals(subTotal))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>IGV (18%):</span>
                        <span>S/ {Number2Currency(roundToTwoDecimals(igv))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Envío:</span>
                        <span>S/ {Number2Currency(roundToTwoDecimals(envio))}</span>
                    </div>

                    {/* Sección de cupón */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium customtext-neutral-dark">
                                ¿Tienes un cupón de descuento?
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Ingresa tu código de cupón"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className={`w-full px-4 py-3 border customtext-neutral-dark  border-gray-100 rounded-xl focus:ring-0 focus:outline-0   transition-all duration-300 ${
                                            couponError
                                                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-200'
                                                : appliedCoupon
                                                ? 'border-gray-200 bg-white customtext-neutral-dark focus:ring-blue-200'
                                                : ' bg-white border-neutral-light focus:ring-0 focus:outline-0'
                                        } `}
                                        disabled={!!appliedCoupon || couponLoading}
                                    />
                                    {couponLoading && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                {!appliedCoupon ? (
                                    <button
                                        type="button"
                                        onClick={validateCoupon}
                                        disabled={couponLoading || !couponCode.trim()}
                                        className="px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
                                    >
                                        {couponLoading ? "Validando..." : "Aplicar"}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={removeCoupon}
                                        className="px-4 py-3 bg-gray-200 customtext-neutral-dark text-sm rounded-xl hover:bg-gray-300 transition-colors duration-200"
                                        title="Remover cupón"
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            
                            {couponError && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                    <XCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{couponError}</span>
                                </div>
                            )}
                            
                            {appliedCoupon && (
                                <div className="bg-gray-50 border-2  rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 w-8/12">
                                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="customtext-primary font-semibold text-sm">
                                                    Descto. {appliedCoupon.type === 'percentage' 
                                                        ? `${appliedCoupon.value}%` 
                                                        : `S/${Number2Currency(appliedCoupon.value)}`}
                                                </p>
                                                <p className="customtext-primary text-xs mt-1">
                                                    {appliedCoupon.code}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right w-4/12">
                                            <span className="customtext-primary font-bold text-base">
                                                -S/ {Number2Currency(roundToTwoDecimals(couponDiscount))}
                                            </span>
                                           {/* <p className="customtext-primary text-xs">Descuento aplicado</p> */}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección de descuentos automáticos */}
                    {autoDiscounts && autoDiscounts.length > 0 && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="space-y-3">
                                <div className="text-sm font-medium customtext-neutral-dark mb-2">
                                    🎉 Descuentos automáticos aplicados:
                                </div>
                                {autoDiscounts.map((discount, index) => (
                                    <div key={index} className=" border-2  rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 w-8/12">
                                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="customtext-neutral-dark font-semibold text-sm">
                                                        {discount.name}
                                                    </p>
                                                    {discount.description && (
                                                        <p className="customtext-neutral-dark text-xs mt-1">
                                                            {discount.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right w-4/12">
                                                <span className="customtext-neutral-dark font-bold text-base">
                                                    -S/ {Number2Currency(discount.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {autoDiscountTotal > 0 && (
                                    <div className="l p-3">
                                        <div className="flex justify-between items-center">
                                            <span className="customtext-neutral-dark font-semibold">Total descuentos automáticos:</span>
                                            <span className="customtext-neutral-dark font-bold text-lg">
                                                -S/ {Number2Currency(autoDiscountTotal)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Productos gratuitos {freeItems.length > 0 && (
                        <FreeItemsDisplay freeItems={freeItems} />
                    )} */}
                    
                  

                    <div className="pt-4 border-t-2">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>S/ {Number2Currency(roundToTwoDecimals(finalTotalWithCoupon))}</span>
                        </div>
                    </div>

                    <ButtonPrimary 
                        onClick={handlePayment} 
                        className="w-full mt-6"
                        disabled={paymentLoading}
                        loading={paymentLoading}
                    >
                        {paymentLoading ? "Procesando..." : `Pagar S/ ${Number2Currency(roundToTwoDecimals(finalTotalWithCoupon))}`}
                    </ButtonPrimary>

                    <p className="text-xs md:text-sm customtext-neutral-dark">
                            Al realizar tu pedido, aceptas los <a href="#" onClick={() => openModal(1)} className="customtext-primary font-bold">Términos y Condiciones</a>, y que nosotros usaremos sus datos personales de acuerdo con nuestra <a href="#" onClick={() => openModal(0)} className="customtext-primary font-bold">Política de Privacidad</a>.
                        </p>
                </div>
            </div>
        </div>
    );
}