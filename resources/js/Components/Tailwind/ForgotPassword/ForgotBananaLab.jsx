import AuthClientRest from "../../../Actions/AuthClientRest";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import JSEncrypt from "jsencrypt";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { GET } from "sode-extend-react";
import Global from "../../../Utils/Global";

export default function ForgotBananaLab() {
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(Global.PUBLIC_RSA_KEY);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const emailRef = useRef();

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                when: "beforeChildren"
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

    const cardHover = {
        y: -5,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        transition: { type: "spring", stiffness: 300 }
    };

    const buttonHover = {
        scale: 1.02,
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)"
    };

    const buttonTap = {
        scale: 0.98
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

    const onForgotSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const email = emailRef.current.value;
            const request = {
                email: jsEncrypt.encrypt(email),
            };

            const result = await AuthClientRest.forgotPassword(request);

            setLoading(false);

            if (!result || !result.success) {
                // Si user_exists es false, el toast ya se mostró en AuthClientRest
                if (result && result.user_exists === false) {
                    // Opcional: agregar un botón para ir al login también
                    setTimeout(() => {
                        toast.info("¿Ya tienes cuenta?", {
                            description: "Puedes intentar iniciar sesión aquí",
                            duration: 4000,
                            position: "top-right",
                            action: {
                                label: "Ir al login",
                                onClick: () => {
                                    window.location.href = "/login";
                                }
                            },
                        });
                    }, 2000);
                }
                return;
            }

            // Si el usuario existe y el correo se envió exitosamente
            setSuccess(true);
            toast.success("¡Revisa tu correo!", {
                description: "Te hemos enviado las instrucciones para restablecer tu contraseña.",
                duration: 4000,
                position: "top-right",
                action: {
                    label: "Ir al login",
                    onClick: () => {
                        window.location.href = "/login";
                    }
                },
            });

            // Redirigir automáticamente después de unos segundos
            setTimeout(() => {
                window.location.href = "/login";
            }, 4000);

        } catch (error) {
            toast.error("Error inesperado", {
                description: error.message || "Ocurrió un error al procesar tu solicitud",
                duration: 3000,
                position: "top-right",
            });
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full px-primary mx-auto py-16"
        >
            <motion.div 
                className="flex items-center justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div 
                    className="mx-auto w-full max-w-md bg-sections-color rounded-3xl p-8 space-y-6 shadow-lg"
                    variants={itemVariants}
                    whileHover={cardHover}
                >
                    <motion.div className="space-y-2" variants={itemVariants}>
                        <motion.h5 
                            className="customtext-primary font-medium"
                            initial={{ x: -10 }}
                            animate={{ x: 0 }}
                        >
                            Restaurar contraseña
                        </motion.h5>
                        <motion.h1 
                            className="text-3xl font-bold customtext-neutral-dark"
                            initial={{ y: 10 }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            Ops, olvidé mi contraseña
                        </motion.h1>
                        <motion.p 
                            className="customtext-neutral-light"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </motion.p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.form 
                                className="space-y-4"
                                onSubmit={onForgotSubmit}
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                variants={itemVariants}
                            >
                                <motion.div className="space-y-2" variants={itemVariants}>
                                    <label
                                        className="block text-sm mb-1 customtext-neutral-dark"
                                        htmlFor="email"
                                    >
                                        Email
                                    </label>
                                    <motion.input
                                        id="email"
                                        ref={emailRef}
                                        name="email"
                                        type="email"
                                        placeholder="hola@mail.com"
                                        className="w-full px-4 py-3 border customtext-neutral-dark border-neutral-ligth rounded-xl focus:ring-0 focus:outline-0 transition-all duration-300"
                                        required
                                        whileFocus={{ 
                                            borderColor: "#3B82F6",
                                            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)"
                                        }}
                                    />
                                </motion.div>

                                <motion.button
                                    type="submit"
                                    className="w-full rounded-xl font-semibold bg-primary px-4 py-3 text-white hover:opacity-90 focus:outline-none"
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
                                            Enviando...
                                        </span>
                                    ) : (
                                        "Enviar enlace de recuperación"
                                    )}
                                </motion.button>
                            </motion.form>
                        ) : (
                            <motion.div 
                                className="text-center py-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.div 
                                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                                <h3 className="text-xl font-bold customtext-neutral-dark mb-2">¡Correo enviado!</h3>
                                <p className="customtext-neutral-light mb-6">Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.</p>
                                <motion.a
                                    href="/iniciar-sesion"
                                    className="inline-block customtext-primary font-medium border-b border-primary"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Volver al inicio de sesión
                                </motion.a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}