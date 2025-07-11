import { useEffect, useRef, useState } from "react";
import image from "../../../../sources/images/reset-password.png";
import JSEncrypt from "jsencrypt";
import Global from "../../../Utils/Global";
import Swal from "sweetalert2";
import { GET } from "sode-extend-react";
import AuthClientRest from "../../../Actions/AuthClientRest";

export default function ResetPasswordSimple() {
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(Global.PUBLIC_RSA_KEY);

    // Estados
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordRef = useRef();
    const confirmationRef = useRef();
    const tokenRef = useRef();
    const emailRef = useRef();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
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

    useEffect(() => {
        // Obtener los parámetros de la URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const email = params.get("email");

        // Asignar el token al tokenRef usando .current
        if (token) {
            tokenRef.current = token;
            emailRef.current = email;
        } else {
            console.error("No se encontró el token en la URL.");
        }
    }, []);

    const onResetSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const password = passwordRef.current.value;
        const token = tokenRef.current;
        const confirmation = confirmationRef.current.value;
        const email = emailRef.current;
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
            token: token,
            confirmation: jsEncrypt.encrypt(confirmation),
        };
        const result = await AuthClientRest.resetPassword(request);

        if (!result) return setLoading(false);

        window.location.href = "/";
    };
    return (
        <div className="py-8 lg:py-0 lg:min-h-screen flex items-center justify-center bg-[#F7F9FB] px-primary 2xl:px-0  ">
            <div className="2xl:max-w-7xl w-full mx-auto ">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:min-h-[600px] ">
                        <div className="hidden lg:block lg:w-1/2 relative">
                            <img
                                src={`/assets/${Global.APP_CORRELATIVE}/restore.png` || image}
                                alt="Imagen decorativa"
                                className="absolute inset-0 w-full  h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>


                        <div className="w-full lg:w-1/2 px-6 py-12 sm:px-12 lg:px-16">
                            <div className="max-w-md mx-auto h-full flex flex-col justify-center">
                                <div className="space-y-2">
                                    <h5 className="customtext-primary font-medium">
                                        Nueva contraseña
                                    </h5>
                                    <h1 className="text-3xl font-bold">
                                        Restaurar contraseña
                                    </h1>
                                    <p className="customtext-neutral-light">
                                        Class aptent taciti sociosqu ad litora torquent
                                        per conubia nostra, per inceptos himenaeos.
                                    </p>
                                </div>
                                <form className="space-y-4 mt-4" onSubmit={onResetSubmit}>
                                    <div className="space-y-2">
                                        <label
                                            className="block text-sm mb-1 customtext-neutral-dark"
                                            htmlFor="password"
                                        >
                                            Contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                name="password"
                                                ref={passwordRef}
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
                                    <div className="space-y-2">
                                        <label
                                            className="block text-sm mb-1 customtext-neutral-dark"
                                            htmlFor="confirm-password"
                                        >
                                            Confirmar contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="confirm-password"
                                                name="confirm-password"
                                                ref={confirmationRef}
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="w-full px-4 py-3 pr-12 border customtext-neutral-dark border-neutral-ligth rounded-xl focus:ring-0 focus:outline-0 transition-all duration-300"
                                                required
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleConfirmPasswordVisibility}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                                disabled={loading}
                                            >
                                                {showConfirmPassword ? (
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
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full rounded-xl font-semibold  bg-primary px-4 py-3 text-white hover:opacity-90 focus:outline-none focus:ring-2 transition-all duration-300 flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                            </svg>
                                        ) : null}
                                        {loading ? "Procesando..." : "Restablecer contraseña"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
