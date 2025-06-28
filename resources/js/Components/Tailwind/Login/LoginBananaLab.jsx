import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSEncrypt from "jsencrypt";
import Global from "../../../Utils/Global";
import Swal from "sweetalert2";
import { GET } from "sode-extend-react";
import AuthClientRest from "../../../Actions/AuthClientRest";
import InputFormSF from "../Checkouts/Components/InputFormSF";

export default function LoginBananaLab() {
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(Global.PUBLIC_RSA_KEY);

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    useEffect(() => {
        if (GET.message) {
            Swal.fire({
                icon: "info",
                title: "Mensaje",
                text: GET.message,
                showConfirmButton: false,
                timer: 3000,
            });
        }
    }, []);

    const onLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const request = {
                email: jsEncrypt.encrypt(formData.email),
                password: jsEncrypt.encrypt(formData.password),
            };

            const result = await AuthClientRest.login(request);

            if (!result || result.status !== 200) {
                throw new Error(result?.message || "Credenciales incorrectas");
            }

            window.location.href = "/";
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message,
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            // Aquí debes enviar el token de Google a tu backend para autenticación
            const googleToken = await result.user.getIdToken();
            const authResult = await AuthClientRest.googleAuth(googleToken);

            if (authResult && authResult.status === 200) {
                window.location.href = "/";
            } else {
                throw new Error("Error al autenticar con Google");
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message,
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setGoogleLoading(false);
        }
    };

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const buttonHover = {
        scale: 1.02,
        boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.3 }
    };

    const buttonTap = {
        scale: 0.98
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full px-primary mx-auto py-16 font-paragraph"
        >
            <motion.div 
                className="flex items-center justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div 
                    className="w-full max-w-xl bg-sections-color space-y-6 p-8 rounded-3xl shadow-lg"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <motion.div className="space-y-2" variants={itemVariants}>
                        <h5 className="font-bold text-base lg:text-lg 2xl:text-xl customtext-neutral-dark">
                            Vamos a ingresar
                        </h5>
                        <motion.h1 
                            className="font-semibold tracking-tight text-2xl md:text-3xl lg:text-4xl customtext-neutral-dark"
                            initial={{ x: -20 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Bienvenido nuevamente
                        </motion.h1>
                    </motion.div>

                    <form 
                        className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 gap-x-3"
                        onSubmit={onLoginSubmit}
                    >
                        <motion.div className="lg:col-span-2" variants={itemVariants}>
                            <InputFormSF
                                label="Correo electrónico"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="hola@mail.com"
                                required
                            />
                        </motion.div>

                        <motion.div className="lg:col-span-2" variants={itemVariants}>
                            <InputFormSF
                                label="Contraseña"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                        </motion.div>

                        <motion.div 
                            className="flex flex-wrap gap-2 items-center justify-between py-4 lg:col-span-2"
                            variants={itemVariants}
                        >
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor="remember" className="text-sm customtext-neutral-dark font-medium">
                                    Guardar mis datos
                                </label>
                            </div>
                            <motion.a
                                href="/forgot-password"
                                className="text-sm flex gap-2 items-center justify-center customtext-primary font-semibold fill-primary"
                                whileHover={{ x: 3 }}
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
                            </motion.a>
                        </motion.div>

                        <motion.button
                            type="submit"
                            className="w-full lg:col-span-2 rounded-3xl font-medium tracking-wide mt-3 bg-primary px-4 py-3 text-white hover:opacity-90 focus:outline-none"
                            variants={itemVariants}
                            whileHover={buttonHover}
                            whileTap={buttonTap}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </span>
                            ) : (
                                "Ingresar"
                            )}
                        </motion.button>

                        <motion.div className="lg:col-span-2 flex items-center my-2" variants={itemVariants}>
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="mx-4 text-sm customtext-neutral-dark">o</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </motion.div>

                        <motion.button
                            type="button"
                           
                            className="w-full text-sm sm:text-base flex flex-row justify-center items-center border border-neutral-dark gap-2 sm:gap-3 lg:col-span-2 rounded-3xl font-semibold px-2 sm:px-4 py-3 customtext-primary hover:opacity-90 focus:outline-none"
                            variants={itemVariants}
                            whileHover={buttonHover}
                            whileTap={buttonTap}
                            disabled={googleLoading}
                        >
                            {googleLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </span>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                        <path d="M18.8 10.707C18.8 10.057 18.7417 9.43203 18.6333 8.83203H10V12.382H14.9333C14.7167 13.5237 14.0667 14.4904 13.0917 15.1404V17.4487H16.0667C17.8 15.8487 18.8 13.4987 18.8 10.707Z" fill="#4285F4"/>
                                        <path d="M9.99974 19.6667C12.4747 19.6667 14.5497 18.85 16.0664 17.45L13.0914 15.1417C12.2747 15.6917 11.2331 16.025 9.99974 16.025C7.61641 16.025 5.59141 14.4167 4.86641 12.25H1.81641V14.6167C3.32474 17.6083 6.41641 19.6667 9.99974 19.6667Z" fill="#34A853"/>
                                        <path d="M4.86536 12.2426C4.68203 11.6926 4.5737 11.1092 4.5737 10.5009C4.5737 9.89258 4.68203 9.30924 4.86536 8.75924V6.39258L1.81536C1.19036 7.62591 0.832031 9.01758 0.832031 10.5009C0.832031 11.9842 1.19036 13.3759 1.81536 14.6092L4.19036 12.7592L4.86536 12.2426Z" fill="#FBBC05"/>
                                        <path d="M9.99974 4.98203C11.3497 4.98203 12.5497 5.4487 13.5081 6.3487L16.1331 3.7237C14.5414 2.24036 12.4747 1.33203 9.99974 1.33203C6.41641 1.33203 3.32474 3.39036 1.81641 6.39036L4.86641 8.75703C5.59141 6.59036 7.61641 4.98203 9.99974 4.98203Z" fill="#EA4335"/>
                                    </svg>
                                    Ingresar con Google
                                </>
                            )}
                        </motion.button>

                        <motion.div className="lg:col-span-2 mt-4" variants={itemVariants}>
                            <div className="text-sm text-center customtext-neutral-dark">
                                <span className="text-muted font-medium">¿Eres nuevo? </span>
                                <motion.a
                                    href="/crear-cuenta"
                                    className="border-b border-primary customtext-primary hover:opacity-80"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Registrate como persona
                                </motion.a>
                               
                            </div>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}