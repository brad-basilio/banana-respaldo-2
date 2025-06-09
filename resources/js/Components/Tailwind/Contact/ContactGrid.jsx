import { Mail, Phone, Building2, Store } from "lucide-react";
import { useRef, useState } from "react";
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
       
      

        if (data.redirect) {
            location.href = data.redirect;
        }
    };
    return (
        <section section className=" bg-[#F7F9FB] py-12 px-primary ">
            <div className=" mx-auto  2xl:max-w-7xl  flex flex-col md:flex-row gap-12 bg-white rounded-xl p-4 md:px-8 md:py-8">
                {/* Contact Form */}
                <div className="w-full md:w-10/12">
                    <h2 className="text-3xl font-bold mb-4 customtext-neutral-dark">
                        Hablemos Hoy
                    </h2>
                    <p className="customtext-neutral-light mb-8">
                        Etiam ultricies sapien mauris, a consectetur sapien
                        posuere eu. Sed ac faucibus lorem. Integer sit amet
                        tempus sapien.
                    </p>

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <input
                                ref={nameRef}
                                disabled={sending}
                                type="text"
                                name="name"
                                placeholder="Nombre completo"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>
                        <div>
                            <input
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
                            />
                            {phoneError && (
                                <span id="phone-error" className="text-red-500 text-xs flex items-center gap-1 mt-1" role="alert">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {phoneError}
                                </span>
                            )}
                          
                        </div>
                        <div>
                            <input
                                ref={emailRef}
                                disabled={sending}
                                type="email"
                                name="email"
                                placeholder="Correo Electrónico"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>
                        <div>
                            <textarea
                                ref={descriptionRef}
                                disabled={sending}
                                name="message"
                                placeholder="Deja tu mensaje..."
                                rows="6"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="bg-primary text-base font-bold text-white px-6 py-3 rounded-xl hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            disabled={sending}
                        >
                            {sending && (
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {sending ? 'Enviando...' : 'Enviar mensaje'}
                        </button>
                    </form>
                </div>

                {/* Contact Information */}
                <div className="space-y-8">
                    <div className="bg-[#F7F9FB] p-6 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3 customtext-primary mb-2">
                            <Mail className="w-5 h-5" />
                            <h3 className=" customtext-neutral-dark font-bold text-lg">
                                Email
                            </h3>
                        </div>
                        <p className="customtext-neutral-light mb-2">
                            Escríbenos para recibir atención personalizada y
                            resolver tus dudas.
                        </p>
                        <a
                            href="mailto:{getContact('email_contact')}"
                            className="customtext-primary font-bold hover:no-underline"
                        >
                            {getContact("email_contact")}
                        </a>
                    </div>

                    <div className="bg-[#F7F9FB] p-6 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3 customtext-primary mb-2">
                            <Phone className="w-5 h-5" />
                            <h3 className="customtext-neutral-dark font-bold text-lg">
                                Teléfono
                            </h3>
                        </div>
                        <p className="customtext-neutral-light mb-2">
                            Llámanos para obtener soporte inmediato y asistencia
                            profesional.
                        </p>
                        <a
                            href="tel:+51987456324"
                            className="customtext-primary hover:no-underline font-bold"
                        >
                            {getContact("phone_contact")}
                        </a>
                    </div>

                    <div className="bg-[#F7F9FB] p-6 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3 customtext-primary mb-2">
                            <Building2 className="w-5 h-5" />
                            <h3 className="customtext-neutral-dark font-bold text-lg">
                                Oficinas
                            </h3>
                        </div>
                        <p className="customtext-neutral-light mb-2">
                            Visítanos en nuestra oficina para conocer nuestras
                            soluciones de tratamiento en persona.
                        </p>
                        <p className="customtext-primary font-bold">
                            {" "}
                            {getContact("address")}
                        </p>
                    </div>

                    <div className="bg-[#F7F9FB] p-6 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3 customtext-primary mb-2">
                            <Store className="w-5 h-5" />
                            <h3 className="customtext-neutral-dark font-bold text-lg">
                                Tienda
                            </h3>
                        </div>
                        <p className="customtext-primary font-bold">
                            {" "}
                            {getContact("address")}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mx-auto 2xl:max-w-7xl   gap-12 bg-white rounded-xl px-8 py-8">
                {console.log(getContact("location"))}
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
            </div>
        </section>
    );
};

export default ContactGrid;
