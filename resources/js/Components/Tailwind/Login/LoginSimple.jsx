import { useEffect, useRef, useState } from "react";
import image from "../../../../sources/images/login.png";
import JSEncrypt from "jsencrypt";
import Global from "../../../Utils/Global";
import Swal from "sweetalert2";
import { GET } from "sode-extend-react";
import AuthClientRest from "../../../Actions/AuthClientRest";
import InputForm from "../Checkouts/Components/InputForm";
import { toast } from "sonner";

export default function LoginSimple() {
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(Global.PUBLIC_RSA_KEY);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
        setLoading(false);

        if (!result || result.status !== 200) {


            return;
        }

        window.location.href = "/";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] px-primary 2xl:px-0  ">
            <div className="2xl:max-w-7xl w-full mx-auto ">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        <div className="hidden lg:block lg:w-1/2 relative">
                            <img
                                src={`/assets/${Global.APP_CORRELATIVE}/login.png` || image}
                                alt="Imagen decorativa"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>

                        <div className="w-full lg:w-1/2 px-6 py-12 sm:px-12 lg:px-16">
                            <div className="max-w-md mx-auto">
                                <div className="text-center lg:text-left">
                                    <h5 className="customtext-primary font-medium text-lg">Hola</h5>
                                    <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Bienvenido</h1>
                                    <p className="mt-3 customtext-neutral-light">
                                        Inicia sesión para acceder a tu cuenta y seguir tus pedidos y disfrutar de una experiencia de compra extraordinaria.
                                    </p>
                                </div>

                                <form className="mt-8 space-y-6" onSubmit={onLoginSubmit}>
                                    <div className="space-y-4">
                                        <InputForm
                                            label="Email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="hola@mail.com"
                                        />

                                        <div className="space-y-2">
                                            <label
                                                className="block text-sm 2xl:text-base mb-1 customtext-neutral-dark"
                                                htmlFor="password"
                                            >
                                                Contraseña
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    value={formData.password}
                                                    onChange={handleChange}

                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    className="w-full px-4 py-3 pr-12 border customtext-neutral-dark border-neutral-ligth rounded-xl focus:ring-0 focus:outline-0 transition-all duration-300"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePasswordVisibility}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                                >
                                                    {showPassword ? (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="w-5 h-5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
                                                            />
                                                        </svg>
                                                    ) : (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="w-5 h-5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="remember"
                                                ref={rememberRef}
                                                className="h-4 w-4 rounded border-gray-300 customtext-primary focus:ring-sky-500"
                                            />
                                            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                                Guardar mis datos
                                            </label>
                                        </div>
                                        <a
                                            href="/forgot-password"
                                            className="text-sm font-semibold customtext-primary hover:text-sky-600 flex items-center gap-1"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="14"
                                                height="17"
                                                viewBox="0 0 14 17"
                                                fill="currentColor"
                                                className="w-4 h-4"
                                            >
                                                <path d="M5.79167 11H8.20833L7.75 8.3125C7.98256 8.18831 8.16569 8.00822 8.29942 7.77223C8.43314 7.53626 8.5 7.27544 8.5 6.98979C8.5 6.57993 8.35269 6.22917 8.05808 5.9375C7.76346 5.64583 7.40929 5.5 6.99558 5.5C6.58186 5.5 6.22917 5.64688 5.9375 5.94063C5.64583 6.23438 5.5 6.5875 5.5 7C5.5 7.28344 5.56686 7.54225 5.70058 7.77642C5.83431 8.01057 6.01744 8.18926 6.25 8.3125L5.79167 11ZM7 16.5C5.125 16.0417 3.57292 14.9803 2.34375 13.3158C1.11458 11.6513 0.5 9.80297 0.5 7.77083V3L7 0.5L13.5 3V7.77083C13.5 9.80297 12.8854 11.6513 11.6562 13.3158C10.4271 14.9803 8.875 16.0417 7 16.5Z" />
                                            </svg>
                                            Olvidé mi contraseña
                                        </a>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-150 ease-in-out"
                                    >
                                        {loading ? "Ingresando..." : "Ingresar"}
                                    </button>

                                    <div className="text-center mt-4">
                                        <p className="text-sm text-gray-600">
                                            ¿Eres nuevo por aquí?{" "}
                                            <a href="/crear-cuenta" className="font-medium customtext-primary hover:text-sky-600">
                                                Crea una cuenta
                                            </a>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
