import { Mail, Phone, Building2, Store } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import MessagesRest from "../../../Actions/MessagesRest";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Global from "../../../Utils/Global";
import { toast } from "sonner";
const messagesRest = new MessagesRest();

const ContactGrid = ({ data, contacts }) => {
    console.log(contacts);
    const getContact = (correlative) => {
        return (
            contacts.find((contact) => contact.correlative === correlative)
                ?.description || ""
        );
    };

    const location =
        contacts.find((x) => x.correlative == "location")?.description ?? "0,0";

    const locationGps = {
        lat: Number(location.split(",").map((x) => x.trim())[0]),
        lng: Number(location.split(",").map((x) => x.trim())[1]),
    };


    const nameRef = useRef();
    const phoneRef = useRef();
    const emailRef = useRef();
    const descriptionRef = useRef();

    const [sending, setSending] = useState(false);
    const [phoneValue, setPhoneValue] = useState("");
    const [phoneError, setPhoneError] = "";
    const [offices, setOffices] = useState([]);
    const [loadingOffices, setLoadingOffices] = useState(true);
    const [stores, setStores] = useState([]);
    const [loadingStores, setLoadingStores] = useState(true);

    // Cargar oficinas desde la API
    useEffect(() => {
        const loadOffices = async () => {
            try {
                setLoadingOffices(true);
                const response = await fetch('/api/stores');
                const result = await response.json();
                
                console.log('API Response:', result); // Para debug
                
                // La respuesta puede venir envuelta en un objeto con una propiedad 'data'
                let data = result;
                if (result.data) {
                    data = result.data;
                } else if (result.body) {
                    data = result.body;
                }
                
                // Verificar que data sea un array antes de filtrar
                if (Array.isArray(data)) {
                    // Filtrar solo las oficinas
                    const officesData = data.filter(store => store.type === 'oficina' && store.status !== false);
                    setOffices(officesData);
                } else {
                    console.error('API response is not an array:', result);
                    setOffices([]);
                }
            } catch (error) {
                console.error('Error loading offices:', error);
                setOffices([]);
            } finally {
                setLoadingOffices(false);
            }
        };
        
        loadOffices();
    }, []);

    // Cargar todas las tiendas para el mapa
    useEffect(() => {
        const loadStores = async () => {
            try {
                setLoadingStores(true);
                const response = await fetch('/api/stores');
                const result = await response.json();
                
                console.log('Stores API Response:', result);
                
                let data = result;
                if (result.data) {
                    data = result.data;
                } else if (result.body) {
                    data = result.body;
                }
                
                if (Array.isArray(data)) {
                    // Filtrar tiendas activas que tengan coordenadas válidas
                    const validStores = data.filter(store => 
                        store.status !== false && 
                        store.latitude && 
                        store.longitude &&
                        store.latitude !== "0" && 
                        store.longitude !== "0"
                    );
                    setStores(validStores);
                    console.log('Valid stores loaded:', validStores);
                } else {
                    console.error('Stores API response is not an array:', result);
                    setStores([]);
                }
            } catch (error) {
                console.error('Error loading stores:', error);
                setStores([]);
            } finally {
                setLoadingStores(false);
            }
        };
        
        loadStores();
    }, []);

    // Función para crear iconos personalizados según el tipo de tienda
    const getStoreIcon = (type) => {
        const iconBase = {
            url: '',
            scaledSize: { width: 40, height: 40 },
            origin: { x: 0, y: 0 },
            anchor: { x: 20, y: 40 }
        };

        switch (type?.toLowerCase()) {
            case 'tienda':
                return {
                    ...iconBase,
                    url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#10b981" stroke="#fff" stroke-width="3"/>
                            <path d="M12 18h16v12H12V18zm4-6h8v6h-8v-6z" fill="#fff"/>
                            <rect x="14" y="20" width="2" height="2" fill="#10b981"/>
                            <rect x="18" y="20" width="2" height="2" fill="#10b981"/>
                            <rect x="22" y="20" width="2" height="2" fill="#10b981"/>
                            <rect x="26" y="20" width="2" height="2" fill="#10b981"/>
                        </svg>
                    `)
                };
            case 'oficina':
                return {
                    ...iconBase,
                    url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="#fff" stroke-width="3"/>
                            <rect x="12" y="14" width="16" height="14" fill="#fff" rx="1"/>
                            <rect x="14" y="16" width="2" height="2" fill="#3b82f6"/>
                            <rect x="18" y="16" width="2" height="2" fill="#3b82f6"/>
                            <rect x="22" y="16" width="2" height="2" fill="#3b82f6"/>
                            <rect x="26" y="16" width="2" height="2" fill="#3b82f6"/>
                            <rect x="14" y="20" width="2" height="2" fill="#3b82f6"/>
                            <rect x="18" y="20" width="2" height="2" fill="#3b82f6"/>
                            <rect x="22" y="20" width="2" height="2" fill="#3b82f6"/>
                            <rect x="26" y="20" width="2" height="2" fill="#3b82f6"/>
                            <rect x="18" y="24" width="4" height="4" fill="#3b82f6"/>
                        </svg>
                    `)
                };
            case 'agencia':
                return {
                    ...iconBase,
                    url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#f59e0b" stroke="#fff" stroke-width="3"/>
                            <path d="M20 12l8 6v12h-6v-8h-4v8h-6V18l8-6z" fill="#fff"/>
                            <circle cx="20" cy="16" r="2" fill="#f59e0b"/>
                        </svg>
                    `)
                };
            case 'almacen':
                return {
                    ...iconBase,
                    url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#8b5cf6" stroke="#fff" stroke-width="3"/>
                            <rect x="10" y="16" width="20" height="12" fill="#fff" rx="1"/>
                            <rect x="12" y="18" width="4" height="3" fill="#8b5cf6"/>
                            <rect x="17" y="18" width="4" height="3" fill="#8b5cf6"/>
                            <rect x="22" y="18" width="4" height="3" fill="#8b5cf6"/>
                            <rect x="12" y="22" width="4" height="3" fill="#8b5cf6"/>
                            <rect x="17" y="22" width="4" height="3" fill="#8b5cf6"/>
                            <rect x="22" y="22" width="4" height="3" fill="#8b5cf6"/>
                            <path d="M20 10l8 4v2H12v-2l8-4z" fill="#fff"/>
                        </svg>
                    `)
                };
            default:
                return {
                    ...iconBase,
                    url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#6b7280" stroke="#fff" stroke-width="3"/>
                            <circle cx="20" cy="20" r="8" fill="#fff"/>
                            <circle cx="20" cy="20" r="4" fill="#6b7280"/>
                        </svg>
                    `)
                };
        }
    };

    // Función para obtener el color del tipo de tienda
    const getStoreTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'tienda': return '#10b981';
            case 'oficina': return '#3b82f6';
            case 'agencia': return '#f59e0b';
            case 'almacen': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    // Formatea el teléfono en formato 999 999 999
    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, "");
        const truncated = numbers.slice(0, 9);
        if (truncated.length <= 3) {
            return truncated;
        } else if (truncated.length <= 6) {
            return `${truncated.slice(0, 3)} ${truncated.slice(3)}`;
        } else {
            return `${truncated.slice(0, 3)} ${truncated.slice(3, 6)} ${truncated.slice(6)}`;
        }
    };

    // Valida el teléfono peruano
    const validatePhone = (phone) => {
        const numbers = phone.replace(/\D/g, "");
        if (numbers.length !== 9) {
            return "El teléfono debe tener 9 dígitos";
        }
        if (!numbers.startsWith("9")) {
            return "Solo se aceptan celulares peruanos (empiezan con 9)";
        }
        return "";
    };

    const handlePhoneChange = (e) => {
        const inputValue = e.target.value;
        const formattedValue = formatPhone(inputValue);
        const error = validatePhone(formattedValue);
        setPhoneValue(formattedValue);
        setPhoneError(error);
        if (phoneRef.current) {
            phoneRef.current.value = formattedValue.replace(/\D/g, "");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (sending) return;

        // Validación de teléfono
        const phoneNumbers = phoneValue.replace(/\D/g, "");
        const phoneValidationError = validatePhone(phoneValue);
        if (phoneValidationError) {
            setPhoneError(phoneValidationError);
         
            toast.error("Error de validación", {
                description: phoneValidationError,
                duration: 3000,
                position: "bottom-center",
                richColors: true
            });
            return;
        }

        setSending(true);

        const request = {
            name: nameRef.current.value,
            phone: phoneNumbers,
            email: emailRef.current.value,
            description: descriptionRef.current.value,
        };

        const result = await messagesRest.save(request);
        toast.success("Mensaje enviado", {
            description: 'Tu mensaje ha sido enviado correctamente. ¡Nos pondremos en contacto contigo pronto!',
            duration: 3000,
            position: "bottom-center",
            richColors:true
        });
        setSending(false);

        if (!result) return;

        // Limpiar campos solo después de éxito
        if (nameRef.current) nameRef.current.value = "";
        if (phoneRef.current) setPhoneValue("");
        setPhoneError("");
        if (emailRef.current) emailRef.current.value = "";
        if (descriptionRef.current) descriptionRef.current.value = "";
       
      

        if (data.redirect) {
            location.href = data.redirect;
        }
    };
    return (
        <motion.section 
            className=" bg-[#F7F9FB] py-12 px-primary "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <motion.div 
                className=" mx-auto  2xl:max-w-7xl  flex flex-col md:flex-row gap-12 bg-white rounded-xl p-4 md:px-8 md:py-8"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                {/* Contact Form */}
                <motion.div 
                    className="w-full md:w-10/12"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <motion.h2 
                        className="text-3xl font-bold mb-4 customtext-neutral-dark"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        Hablemos Hoy
                    </motion.h2>
                    <motion.p 
                        className="customtext-neutral-light mb-8"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                    >
                        Etiam ultricies sapien mauris, a consectetur sapien
                        posuere eu. Sed ac faucibus lorem. Integer sit amet
                        tempus sapien.
                    </motion.p>

                    <motion.form 
                        onSubmit={onSubmit} 
                        className="space-y-6"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.0 }}
                        >
                            <motion.input
                                ref={nameRef}
                                disabled={sending}
                                type="text"
                                name="name"
                                placeholder="Nombre completo"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                required
                                whileFocus={{ scale: 1.02, borderColor: "#3B82F6" }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                        </motion.div>
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.1 }}
                        >
                            <motion.input
                                ref={phoneRef}
                                disabled={sending}
                                type="tel"
                                name="phone"
                                placeholder="Teléfono (9 dígitos)"
                                value={phoneValue}
                                onChange={handlePhoneChange}
                                maxLength={11}
                                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${phoneError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                required
                                aria-describedby={phoneError ? "phone-error" : "phone-help"}
                                aria-invalid={phoneError ? "true" : "false"}
                                whileFocus={{ scale: 1.02, borderColor: "#3B82F6" }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                            {phoneError && (
                                <motion.span 
                                    id="phone-error" 
                                    className="text-red-500 text-xs flex items-center gap-1 mt-1" 
                                    role="alert"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {phoneError}
                                </motion.span>
                            )}
                        </motion.div>
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.2 }}
                        >
                            <motion.input
                                ref={emailRef}
                                disabled={sending}
                                type="email"
                                name="email"
                                placeholder="Correo Electrónico"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                required
                                whileFocus={{ scale: 1.02, borderColor: "#3B82F6" }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                        </motion.div>
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.3 }}
                        >
                            <motion.textarea
                                ref={descriptionRef}
                                disabled={sending}
                                name="message"
                                placeholder="Deja tu mensaje..."
                                rows="6"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                required
                                whileFocus={{ scale: 1.02, borderColor: "#3B82F6" }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            ></motion.textarea>
                        </motion.div>
                        <motion.button
                            type="submit"
                            className="bg-primary text-base font-bold text-white px-6 py-3 rounded-xl hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            disabled={sending}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.4 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {sending && (
                                <motion.svg 
                                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </motion.svg>
                            )}
                            {sending ? 'Enviando...' : 'Enviar mensaje'}
                        </motion.button>
                    </motion.form>
                </motion.div>

                {/* Contact Information */}
                <motion.div 
                    className="space-y-8"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <motion.div 
                        className="bg-[#F7F9FB] p-6 rounded-xl shadow-lg"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0 }}
                        whileHover={{ 
                            y: -5, 
                            scale: 1.02,
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)"
                        }}
                    >
                        <div className="flex items-center gap-3 customtext-primary mb-2">
                            <motion.div
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Mail className="w-5 h-5" />
                            </motion.div>
                            <h3 className="customtext-neutral-dark font-bold text-lg">
                                Email
                            </h3>
                        </div>
                        <p className="customtext-neutral-light mb-2">
                            Escríbenos para recibir atención personalizada y
                            resolver tus dudas.
                        </p>
                        <a
                            href={`mailto:${getContact('email_contact')}`}
                            className="customtext-primary font-bold hover:no-underline"
                        >
                            {getContact("email_contact")}
                        </a>
                    </motion.div>

                    <motion.div 
                        className="bg-[#F7F9FB] p-6 rounded-xl shadow-lg"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0 }}
                        whileHover={{ 
                            y: -5, 
                            scale: 1.02,
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)"
                        }}
                    >
                        <div className="flex items-center gap-3 customtext-primary mb-2">
                            <motion.div
                                whileHover={{ rotate: -15, scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Phone className="w-5 h-5" />
                            </motion.div>
                            <h3 className="customtext-neutral-dark font-bold text-lg">
                                Teléfono
                            </h3>
                        </div>
                        <p className="customtext-neutral-light mb-2">
                            Llámanos para obtener soporte inmediato y asistencia
                            profesional.
                        </p>
                        <a
                            href={`tel:${getContact("phone_contact")}`}
                            className="customtext-primary hover:no-underline font-bold"
                        >
                            {getContact("phone_contact")}
                        </a>
                    </motion.div>

                    <motion.div 
                        className="bg-[#F7F9FB] p-6 rounded-xl shadow-lg"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0 }}
                        whileHover={{ 
                            y: -8, 
                            scale: 1.02,
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                            backgroundColor: "#ffffff",
                        }}
                    >
                        <motion.div 
                            className="flex items-center gap-3 customtext-primary mb-4"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.4 }}
                        >
                            <motion.div
                                whileHover={{ rotate: 20, scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                <Building2 className="w-5 h-5" />
                            </motion.div>
                            <motion.h3 
                                className="customtext-neutral-dark font-bold text-lg"
                            >
                                Nuestras Oficinas
                            </motion.h3>
                        </motion.div>
                        
                        {loadingOffices ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2 text-sm customtext-neutral-light">Cargando oficinas...</span>
                            </div>
                        ) : offices.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.p 
                                    className="customtext-neutral-light mb-2"
                                    whileHover={{ x: 3, opacity: 0.8 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    Visítanos en nuestra oficina para conocer nuestras
                                    soluciones de tratamiento en persona.
                                </motion.p>
                                <p className="customtext-primary font-bold">
                                    {getContact("address")}
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                <motion.p 
                                    className="customtext-neutral-light mb-3"
                                    whileHover={{ x: 3, opacity: 0.8 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    Visítanos en cualquiera de nuestras oficinas para atención personalizada.
                                </motion.p>
                                
                                {offices.map((office, index) => (
                                    <motion.div
                                        key={office.id}
                                        className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.4, delay: 1.5 + (index * 0.1) }}
                                        whileHover={{ x: 2, scale: 1.01 }}
                                    >
                                        <h4 className="customtext-neutral-dark font-bold mb-2">
                                            {office.name}
                                        </h4>
                                        <p  className="customtext-primary font-bold">
                                            {office.address}
                                        </p>
                                       
                                       
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    <motion.div 
                        className="bg-[#F7F9FB] p-6 rounded-xl shadow-lg"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0}}
                        whileHover={{ 
                            y: -5, 
                            scale: 1.02,
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)"
                        }}
                    >
                        <motion.div 
                            className="flex items-center gap-3 customtext-primary mb-2"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.5 }}
                        >
                            <motion.div
                                whileHover={{ rotate: -20, scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                <Store className="w-5 h-5" />
                            </motion.div>
                            <motion.h3 
                                className="customtext-neutral-dark font-bold text-lg"
                            >
                                Tienda
                            </motion.h3>
                        </motion.div>
                        <motion.p 
                            className="customtext-primary font-bold"
                         
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {" "}
                            {getContact("address")}
                        </motion.p>
                    </motion.div>
                </motion.div>
            </motion.div>
            <motion.div 
                className="mx-auto 2xl:max-w-7xl gap-12 bg-white rounded-xl px-8 py-8"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.4 }}
            >
                <motion.div className="mb-6">
                    <motion.h3 
                        className="text-2xl font-bold customtext-neutral-dark mb-2"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 1.5 }}
                    >
                        Nuestras Ubicaciones
                    </motion.h3>
                    <motion.p 
                        className="customtext-neutral-light mb-4"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 1.6 }}
                    >
                        Encuentra nuestras tiendas, oficinas y agencias más cercanas a tu ubicación.
                    </motion.p>
                    
               
                </motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.8 }}
                    className="relative"
                >
                    {loadingStores && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="customtext-neutral-light">Cargando ubicaciones...</span>
                            </div>
                        </div>
                    )}
                    
                    <LoadScript
                        googleMapsApiKey={Global.GMAPS_API_KEY}
                        className="rounded-xl"
                    >
                        <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "500px", borderRadius: "12px" }}
                            zoom={stores.length > 0 ? 15 : 20}
                            center={stores.length > 0 ? {
                                lat: stores.reduce((sum, store) => sum + parseFloat(store.latitude), 0) / stores.length,
                                lng: stores.reduce((sum, store) => sum + parseFloat(store.longitude), 0) / stores.length
                            } : locationGps}
                            options={{
                                styles: [
                                    {
                                        featureType: "poi",
                                        elementType: "labels",
                                        stylers: [{ visibility: "off" }]
                                    }
                                ]
                            }}
                        >
                            {/* Marcadores de todas las tiendas */}
                            {stores.map((store) => (
                                <Marker
                                    key={store.id}
                                    position={{
                                        lat: parseFloat(store.latitude),
                                        lng: parseFloat(store.longitude)
                                    }}
                                    icon={getStoreIcon(store.type)}
                                    title={`${store.name} (${store.type})`}
                                    onClick={() => {
                                        // Crear un InfoWindow personalizado
                                        const infoWindow = new window.google.maps.InfoWindow({
                                            content: `
                                                <div style="padding: 10px; max-width: 250px;">
                                                    <h4 style="margin: 0 0 8px 0; color: ${getStoreTypeColor(store.type)}; font-weight: bold;">
                                                        ${store.name}
                                                    </h4>
                                                    <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 500;">
                                                        ${store.type}
                                                    </p>
                                                    <p style="margin: 0 0 8px 0; color: #374151; line-height: 1.4;">
                                                        📍 ${store.address}
                                                    </p>
                                                    ${store.phone ? `
                                                        <p style="margin: 0 0 8px 0; color: #374151;">
                                                            📞 <a href="tel:${store.phone}" style="color: ${getStoreTypeColor(store.type)}; text-decoration: none;">${store.phone}</a>
                                                        </p>
                                                    ` : ''}
                                                    ${store.schedule ? `
                                                        <p style="margin: 0; color: #6b7280; font-size: 13px;">
                                                            🕒 ${store.schedule}
                                                        </p>
                                                    ` : ''}
                                                </div>
                                            `
                                        });
                                        
                                        infoWindow.open(window.google.maps, this);
                                    }}
                                />
                            ))}
                            
                         
                        </GoogleMap>
                    </LoadScript>
                </motion.div>
            </motion.div>
        </motion.section>
    );
};

export default ContactGrid;
