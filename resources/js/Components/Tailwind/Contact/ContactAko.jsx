import { Mail, Phone, Building2, Store } from "lucide-react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import MessagesRest from "../../../Actions/MessagesRest";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Global from "../../../Utils/Global";
import { toast } from "sonner";
import TextWithHighlight from "../../../Utils/TextWithHighlight";

const messagesRest = new MessagesRest();

const ContactAko = ({ data, contacts }) => {

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
    const [phoneError, setPhoneError] = useState("");

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
       
        if (data.redirect !== undefined && data.redirect !== "") {
            window.location.href = data.redirect;
        }
    };
    return (
        <motion.section 
            className="py-10 px-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <motion.div 
                className="flex flex-col md:flex-row md:justify-between gap-12 bg-white rounded-xl md:py-8"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                {/* Contact Form */}
                <motion.div 
                    className="w-full max-w-2xl 2xl:max-w-3xl"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <motion.h2 
                        className="text-3xl 2xl:text-4xl font-semibold mb-4 customtext-neutral-dark"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <TextWithHighlight text={data?.title} />
                    </motion.h2>
                    <motion.p 
                        className="customtext-neutral-dark mb-8 text-base 2xl:text-lg max-w-lg 2xl:max-w-xl"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                    >
                        {data?.description}
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
                                className="w-full px-4 py-3 rounded-lg border border-gray-300   outline-none"
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
                                className={`w-full px-4 py-3 rounded-lg border    outline-none ${phoneError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
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
                                className="w-full px-4 py-3 rounded-lg border border-gray-300    outline-none"
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
                                className="w-full px-4 py-3 rounded-lg border border-gray-300    outline-none resize-none"
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
                        className="bg-[#F2F2F2] p-6 rounded-xl"
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
                                <Mail className="w-5 h-5 customtext-secondary" />
                            </motion.div>
                            <h3 className="customtext-secondary font-semibold text-lg">
                                Email
                            </h3>
                        </div>
                        <p className="customtext-neutral-dark mb-2">
                            Escríbenos para recibir atención personalizada y
                            resolver tus dudas.
                        </p>
                        <a
                            href="mailto:{getContact('email_contact')}"
                            className="customtext-primary font-semibold hover:no-underline"
                        >
                            {getContact("email_contact")}
                        </a>
                    </motion.div>

                    <motion.div 
                        className="bg-[#F2F2F2] p-6 rounded-xl"
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
                                <Phone className="w-5 h-5 customtext-secondary" />
                            </motion.div>
                            <h3 className="customtext-secondary font-semibold text-lg">
                                Teléfono
                            </h3>
                        </div>
                        <p className="customtext-neutral-dark mb-2">
                            Llámanos para obtener soporte inmediato y asistencia
                            profesional.
                        </p>
                        <a
                            href="tel:+51987456324"
                            className="customtext-primary font-semibold hover:no-underline"
                        >
                            {getContact("phone_contact")}
                        </a>
                    </motion.div>

                    <motion.div 
                        className="bg-[#F2F2F2] p-6 rounded-xl"
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
                            className="flex items-center gap-3 customtext-primary mb-2"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.4 }}
                        >
                            <motion.div
                                whileHover={{ rotate: 20, scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                <Building2 className="w-5 h-5 customtext-secondary" />
                            </motion.div>
                            <motion.h3 
                                className="customtext-secondary font-semibold text-lg"
                            >
                                Oficinas
                            </motion.h3>
                        </motion.div>
                        <motion.p 
                            className="customtext-neutral-dark mb-2"
                            whileHover={{ x: 3, opacity: 0.8 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            Visítanos en nuestra oficina para conocer nuestras
                            soluciones de tratamiento en persona.
                        </motion.p>
                        <p className="customtext-primary font-semibold">
                            {" "}
                            {getContact("address")}
                        </p>
                    </motion.div>

                    <motion.div 
                        className="bg-[#F2F2F2] p-6 rounded-xl"
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
                                <Store className="w-5 h-5 customtext-secondary" />
                            </motion.div>
                            <motion.h3 
                                className="customtext-secondary font-semibold text-lg"
                            >
                                Tienda
                            </motion.h3>
                        </motion.div>
                        <motion.p 
                            className="customtext-primary font-semibold"
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {" "}
                            {getContact("address")}
                        </motion.p>
                    </motion.div>
                </motion.div>
            </motion.div>
            
            <motion.div 
                className="gap-12 bg-white rounded-xl px-8 py-8"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.4 }}
            >
                {console.log(getContact("location"))}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                >
                    <LoadScript
                        googleMapsApiKey={Global.GMAPS_API_KEY}
                        className="rounded-xl"
                    >
                        <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "400px" }}
                            zoom={10}
                            center={locationGps}
                        >
                            <Marker position={locationGps} />
                        </GoogleMap>
                    </LoadScript>
                </motion.div>
            </motion.div>
        </motion.section>
    );
};

export default ContactAko;
