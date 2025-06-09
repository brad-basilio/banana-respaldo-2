import { useEffect, useRef, useState } from "react";
import image from "../../../../sources/images/login.png";
import JSEncrypt from "jsencrypt";
import Global from "../../../Utils/Global";
import Swal from "sweetalert2";
import { GET } from "sode-extend-react";
import AuthClientRest from "../../../Actions/AuthClientRest";
import InputFormSF from "../Checkouts/Components/InputFormSF";
export default function LoginSimpleSF() {
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(Global.PUBLIC_RSA_KEY);

    // Estados
    const [loading, setLoading] = useState(true);

    const emailRef = useRef();
    const passwordRef = useRef();
    const rememberRef = useRef();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: "",
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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

    const onLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const email = formData?.email;
        const password = formData?.password;

        const request = {
            email: jsEncrypt.encrypt(email),
            password: jsEncrypt.encrypt(password),
        };

        const result = await AuthClientRest.login(request);

        setLoading(false); // Deja de mostrar el loading

        // 🔴 Verifica si la autenticación fue exitosa antes de redirigir
        if (!result || result.status !== 200) {
            Notify.add({
                icon: "/assets/img/icon.svg",
                title: "Error",
                body: result?.message || "Credenciales incorrectas",
                type: "danger",
            });
            return; // 🔴 DETIENE la redirección
        }

        // ✅ Si el login fue exitoso, redirige
        window.location.href = "/";
    };

    return (
        <div className=" w-full px-primary mx-auto py-16 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-[#f9f9f9] rounded-xl max-w-xl lg:max-w-none mx-auto">
                <div className="flex">
                    <img
                        src={image}
                        alt="Imagen decorativa"
                        className="h-full min-h-[400px] w-full object-cover rounded-xl transform "
                    />
                </div>
                <div className="flex items-center justify-center px-5 py-8 sm:p-8">
                    <div className="mx-auto w-full max-w-md space-y-6">
                        <div className="space-y-2">
                            <h5 className="font-bold font-font-general text-base lg:text-lg 2xl:text-xl customtext-primary">Hola</h5>
                            <h1 className="font-semibold font-font-general tracking-tight text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl customtext-primary">Bienvenido de nuevo</h1>
                        </div>
                        <form className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 gap-x-3 font-font-general" onSubmit={onLoginSubmit}>
                            <div className="lg:col-span-2">
                                <InputFormSF
                                    label="Correo electronico"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="hola@mail.com"
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <InputFormSF
                                    label="Contraseña"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="********"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 items-center justify-between py-4 lg:col-span-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        ref={rememberRef}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label
                                        htmlFor="remember"
                                        className="text-sm customtext-neutral-dark font-medium font-font-general"
                                    >
                                        Guardar mis datos
                                    </label>
                                </div>
                                <a
                                    href="/forgot-password"
                                    className="text-sm flex gap-2
                                    items-center justify-center font-font-general customtext-primary font-semibold  fill-primary"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="17"
                                        viewBox="0 0 14 17"
                                        fill="current"
                                    >
                                        <path
                                            d="M5.79167 11H8.20833L7.75 8.3125C7.98256 8.18831 8.16569 8.00822 8.29942 7.77223C8.43314 7.53626 8.5 7.27544 8.5 6.98979C8.5 6.57993 8.35269 6.22917 8.05808 5.9375C7.76346 5.64583 7.40929 5.5 6.99558 5.5C6.58186 5.5 6.22917 5.64688 5.9375 5.94063C5.64583 6.23438 5.5 6.5875 5.5 7C5.5 7.28344 5.56686 7.54225 5.70058 7.77642C5.83431 8.01057 6.01744 8.18926 6.25 8.3125L5.79167 11ZM7 16.5C5.125 16.0417 3.57292 14.9803 2.34375 13.3158C1.11458 11.6513 0.5 9.80297 0.5 7.77083V3L7 0.5L13.5 3V7.77083C13.5 9.80297 12.8854 11.6513 11.6562 13.3158C10.4271 14.9803 8.875 16.0417 7 16.5ZM7 14.9375C8.44444 14.4896 9.63889 13.5938 10.5833 12.25C11.5278 10.9062 12 9.41319 12 7.77083V4.02083L7 2.10417L2 4.02083V7.77083C2 9.41319 2.47222 10.9062 3.41667 12.25C4.36111 13.5938 5.55556 14.4896 7 14.9375Z"
                                            fill="current"
                                        />
                                    </svg>
                                    Olvidé mi contraseña
                                </a>
                            </div>
                            <button
                                type="submit"
                                className="w-full lg:col-span-2 rounded-3xl font-medium tracking-wide mt-3 bg-primary px-4 py-3 text-white hover:opacity-90 focus:outline-none focus:ring-2 transition-all duration-300"
                            >
                                Ingresar
                            </button>
                            {/* <button
                                type="submit"
                                className="w-full text-sm sm:text-base flex flex-row justify-center items-center border border-neutral-dark gap-2 sm:gap-3 lg:col-span-2 rounded-3xl font-semibold px-2 sm:px-4 py-3 customtext-primary hover:opacity-90 focus:outline-none focus:ring-2 transition-all duration-300"
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
                                className="w-full text-sm sm:text-base flex flex-row justify-center items-center border border-neutral-dark gap-2 sm:gap-3 lg:col-span-2 rounded-3xl font-semibold px-2 sm:px-4 py-3 customtext-primary hover:opacity-90 focus:outline-none focus:ring-2 transition-all duration-300"
                            >
                                <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M23.9727 12.5625C23.9727 6.76406 19.2711 2.0625 13.4727 2.0625C7.67422 2.0625 2.97266 6.76406 2.97266 12.5625C2.97266 17.8031 6.81172 22.147 11.832 22.9355V15.5986H9.16531V12.5625H11.832V10.2492C11.832 7.61812 13.4 6.16359 15.7981 6.16359C16.947 6.16359 18.1489 6.36891 18.1489 6.36891V8.95312H16.8242C15.5206 8.95312 15.1128 9.76219 15.1128 10.5937V12.5625H18.0247L17.5597 15.5986H15.1133V22.9364C20.1336 22.1484 23.9727 17.8045 23.9727 12.5625Z" fill="#3353DF"/>
                                </svg>
                                </span>
                                Ingresar con mi cuenta de Facebook
                            </button> */}

                            <div className="lg:col-span-2">
                                
                                <div className="row mt-3">
                                    <div className="text-sm text-center customtext-neutral-dark">
                                        <a
                                            href="/crear-cuenta"
                                            className="text-muted font-medium font-font-general"
                                        >¿Eres nuevo?
                                            <span className="border-b border-[#F93232] text-[#F93232]"> Registrate </span> 
                                            {/* o
                                            <span className="border-b border-[#F93232] text-[#F93232]"> Registrate como comerciante </span> */}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
