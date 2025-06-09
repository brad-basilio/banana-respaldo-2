import JSEncrypt from "jsencrypt";
import { useEffect, useRef, useState } from "react";
import { GET } from "sode-extend-react";
import Global from "../../../Utils/Global";
import image from "../../../../sources/images/signup.png";
import AuthClientRest from "../../../Actions/AuthClientRest";
import Swal from "sweetalert2";

export default function SignUpSimple() {
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(Global.PUBLIC_RSA_KEY);

    // Estados
    const [loading, setLoading] = useState(false);

    const nameRef = useRef();
    const lastnameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const confirmationRef = useRef();

    useEffect(() => {
        if (GET.message)
            Swal.fire({
                icon: "info",
                title: "Mensaje",
                text: GET.message,
                showConfirmButton: false,
                timer: 3000,
            });
    }, [null]);

    const onSignUpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const name = nameRef.current.value;
        const lastname = lastnameRef.current.value;
        const confirmation = confirmationRef.current.value;
        if (password !== confirmation)
            return Swal.fire({
                icon: "error",
                title: "Error",
                text: "Las contraseñas no coinciden",
                showConfirmButton: false,
                timer: 3000,
            });

        const request = {
            email: jsEncrypt.encrypt(email),
            password: jsEncrypt.encrypt(password),
            name: jsEncrypt.encrypt(name),
            lastname: jsEncrypt.encrypt(lastname),
            confirmation: jsEncrypt.encrypt(confirmation),
        };
        const result = await AuthClientRest.signup(request);

        if (!result) return setLoading(false);

        window.location.href = "/";
    };
    return (
        <div className="w-full px-primary mx-auto py-16 bg-white">
            <div className="lg:grid grid-cols-1 lg:grid-cols-2 gap-0 bg-[#f9f9f9] rounded-xl max-w-xl lg:max-w-none mx-auto">
                <div className="flex">
                    <img
                        src={image}
                        alt="Imagen decorativa"
                        className="h-full min-h-[400px] w-full object-cover rounded-xl transform "
                    />
                </div>
                <div className="flex items-center justify-center p-8 ">
                    <div className="mx-auto w-full max-w-md space-y-6">
                        <div className="space-y-2">
                            <h5 className="font-bold font-font-general text-base lg:text-lg 2xl:text-xl customtext-primary">
                                Vamos a crear!
                            </h5>
                            <h1 className="font-semibold font-font-general tracking-tight text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl customtext-primary">
                                Crear una nueva cuenta
                            </h1>
                        </div>
                        <form className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 gap-x-3 font-font-general" onSubmit={onSignUpSubmit}>
                            <div className="space-y-1.5">
                                <label
                                    className="block text-sm 2xl:text-base customtext-neutral-dark tracking-tight opacity-65"
                                    htmlFor="name"
                                >
                                    Nombre completo
                                </label>
                                <input
                                    id="name"
                                    ref={nameRef}
                                    name="name"
                                    type="text"
                                    placeholder="Nombres"
                                    className="w-full px-4 py-3 border text-base 2xl:text-lg customtext-neutral-dark placeholder:customtext-neutral-dark  border-neutral-ligth rounded-xl focus:ring-0 focus:outline-0   transition-all duration-300"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label
                                    className="block text-sm 2xl:text-base customtext-neutral-dark tracking-tight opacity-65"
                                    htmlFor="name"
                                >
                                    Apellidos
                                </label>
                                <input
                                    id="lastname"
                                    ref={lastnameRef}
                                    name="lastname"
                                    type="text"
                                    placeholder="Apellidos"
                                    className="w-full px-4 py-3 border text-base 2xl:text-lg customtext-neutral-dark placeholder:customtext-neutral-dark  border-neutral-ligth rounded-xl focus:ring-0 focus:outline-0   transition-all duration-300"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5 lg:col-span-2">
                                <label
                                    className="block text-sm 2xl:text-base customtext-neutral-dark tracking-tight opacity-65"
                                    htmlFor="email"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    ref={emailRef}
                                    name="email"
                                    type="email"
                                    placeholder="hola@mail.com"
                                    className="w-full px-4 py-3 border text-base 2xl:text-lg customtext-neutral-dark placeholder:customtext-neutral-dark  border-neutral-ligth rounded-xl focus:ring-0 focus:outline-0   transition-all duration-300"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5 lg:col-span-2">
                                <label
                                    className="block text-sm 2xl:text-base customtext-neutral-dark tracking-tight opacity-65"
                                    htmlFor="password"
                                >
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    ref={passwordRef}
                                    name="password"
                                    type="password"
                                    placeholder="********"
                                    className="w-full px-4 py-3 border text-base 2xl:text-lg customtext-neutral-dark placeholder:customtext-neutral-dark  border-neutral-ligth rounded-xl focus:ring-0 focus:outline-0   transition-all duration-300"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5 lg:col-span-2">
                                <label
                                    className="block text-sm 2xl:text-base customtext-neutral-dark tracking-tight opacity-65"
                                    htmlFor="confirm-password"
                                >
                                    Confirmar contraseña
                                </label>
                                <input
                                    id="confirm-password"
                                    ref={confirmationRef}
                                    name="confirm-password"
                                    type="password"
                                    placeholder="********"
                                    className="w-full px-4 py-3 border text-base 2xl:text-lg customtext-neutral-dark placeholder:customtext-neutral-dark  border-neutral-ligth rounded-xl focus:ring-0 focus:outline-0   transition-all duration-300"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full lg:col-span-2 rounded-3xl font-medium mt-3 bg-primary px-4 py-3 text-white hover:opacity-90 focus:outline-none focus:ring-2 transition-all duration-300 flex justify-center items-center ${
                                    loading ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </>
                                ) : (
                                    "Crear cuenta"
                                )}
                            </button>
                            {/* <button
                                type="submit"
                                className="w-full flex flex-row justify-center items-center border border-neutral-dark gap-3 lg:col-span-2 rounded-3xl font-semibold px-4 py-3 customtext-primary hover:opacity-90 focus:outline-none focus:ring-2 transition-all duration-300"
                            >
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                        <path d="M18.8 10.707C18.8 10.057 18.7417 9.43203 18.6333 8.83203H10V12.382H14.9333C14.7167 13.5237 14.0667 14.4904 13.0917 15.1404V17.4487H16.0667C17.8 15.8487 18.8 13.4987 18.8 10.707Z" fill="#4285F4"/>
                                        <path d="M9.99974 19.6667C12.4747 19.6667 14.5497 18.85 16.0664 17.45L13.0914 15.1417C12.2747 15.6917 11.2331 16.025 9.99974 16.025C7.61641 16.025 5.59141 14.4167 4.86641 12.25H1.81641V14.6167C3.32474 17.6083 6.41641 19.6667 9.99974 19.6667Z" fill="#34A853"/>
                                        <path d="M4.86536 12.2426C4.68203 11.6926 4.5737 11.1092 4.5737 10.5009C4.5737 9.89258 4.68203 9.30924 4.86536 8.75924V6.39258H1.81536C1.19036 7.62591 0.832031 9.01758 0.832031 10.5009C0.832031 11.9842 1.19036 13.3759 1.81536 14.6092L4.19036 12.7592L4.86536 12.2426Z" fill="#FBBC05"/>
                                        <path d="M9.99974 4.98203C11.3497 4.98203 12.5497 5.4487 13.5081 6.3487L16.1331 3.7237C14.5414 2.24036 12.4747 1.33203 9.99974 1.33203C6.41641 1.33203 3.32474 3.39036 1.81641 6.39036L4.86641 8.75703C5.59141 6.59036 7.61641 4.98203 9.99974 4.98203Z" fill="#EA4335"/>
                                    </svg>
                                </span>
                                Ingresar con mi cuenta de Google
                            </button> */}
                            {/* <button
                                type="submit"
                                className="w-full flex flex-row justify-center items-center border border-neutral-dark gap-3 lg:col-span-2 rounded-3xl font-semibold px-4 py-3 customtext-primary hover:opacity-90 focus:outline-none focus:ring-2 transition-all duration-300"
                            >
                                <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M23.9727 12.5625C23.9727 6.76406 19.2711 2.0625 13.4727 2.0625C7.67422 2.0625 2.97266 6.76406 2.97266 12.5625C2.97266 17.8031 6.81172 22.147 11.832 22.9355V15.5986H9.16531V12.5625H11.832V10.2492C11.832 7.61812 13.4 6.16359 15.7981 6.16359C16.947 6.16359 18.1489 6.36891 18.1489 6.36891V8.95312H16.8242C15.5206 8.95312 15.1128 9.76219 15.1128 10.5937V12.5625H18.0247L17.5597 15.5986H15.1133V22.9364C20.1336 22.1484 23.9727 17.8045 23.9727 12.5625Z" fill="#3353DF"/>
                                </svg>
                                </span>
                                Ingresar con mi cuenta de Facebook
                            </button> */}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
