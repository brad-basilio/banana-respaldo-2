import { Cookies, Fetch, Notify } from "sode-extend-react";
import { toast } from "sonner";
import Global from "../Utils/Global";
class AuthClientRest {
    static login = async (request) => {
        console.log(request);
        try {
            const { status, result } = await Fetch("./api/login-client", {
                method: "POST",

                body: JSON.stringify(request),
            });

            if (!status || result.status !== 200) {
                toast.error("Error al iniciar sesión", {
                    description: result.message || "Ocurrió un error inesperado.",
                    duration: 3000,
                    position: "top-right",
                    richColors: true,
                });
                return false;
            }


            toast.success("¡Inicio de sesión exitoso!", {
                description: `Bienvenido${result?.data?.name ? `, ${result.data.name}` : ""} a ${Global.APP_NAME}.`,
                duration: 3000,
                position: "top-right",
                richColors: true,
            });

            return result; // Devuelve el resultado para que el frontend decida qué hacer
        } catch (error) {

            toast.error("Error al iniciar sesión", {
                description: error.message || "Ocurrió un error inesperado.",
                duration: 3000,
                position: "top-right",
                richColors: true,
            });


            return false;
        }
    };

    static signup = async (request) => {
        try {
            const { status, result } = await Fetch("./api/signup-client", {
                method: "POST",
                body: JSON.stringify(request),
            });
            if (!status)
                throw new Error(
                    result?.message || "Error al registrar el usuario"
                );


            toast.success("¡Registro exitoso!", {
                description: `Bienvenido${result?.data?.name ? `, ${result.data.name}` : ""} a ${Global.APP_NAME}. Tu cuenta ha sido creada correctamente.`,
                duration: 3000,
                position: "top-right",
                richColors: true,
            });

            return result.data;
        } catch (error) {
            toast.error("¡Registro fallido!", {
                description: error.message || "Ocurrió un error inesperado.",
                duration: 3000,
                position: "top-right",
                richColors: true,
            });

            return null;
        }
    };

    static forgotPassword = async (request) => {
        try {
            const { status, result } = await Fetch(
                "./api/forgot-password-client",
                {
                    method: "POST",
                    body: JSON.stringify(request),
                }
            );
            
            if (!status) {
                throw new Error(
                    result?.message ||
                    "Error al solicitar el restablecimiento de contraseña"
                );
            }
            
            // Verificar si el usuario existe según la respuesta del backend
            if (result.data && result.data.user_exists === false) {
                // Usuario no existe - mostrar toast de advertencia y opciones
                toast.warning("Cuenta no encontrada", {
                    description: "No tienes una cuenta registrada con este correo. ¿Deseas crear una cuenta?",
                    duration: 5000,
                    position: "top-right",
                    richColors: true,
                    action: {
                        label: "Crear cuenta",
                        onClick: () => {
                            window.location.href = "/register";
                        }
                    },
                });
                
                // Devolver información específica para el frontend
                return {
                    success: false,
                    user_exists: false,
                    message: "Email no registrado"
                };
            }
            
            // Usuario existe - mostrar éxito
            toast.success("¡Correo enviado!", {
                description: `Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.`,
                duration: 3000,
                position: "top-right",
                richColors: true,
            });

            return {
                success: true,
                user_exists: true,
                message: result.message
            };
        } catch (error) {
            toast.error("Error al solicitar el restablecimiento de contraseña", {
                description: error.message || "Ocurrió un error inesperado.",
                duration: 3000,
                position: "top-right",
                richColors: true,
            });
            return {
                success: false,
                user_exists: null,
                message: error.message
            };
        }
    };

    static resetPassword = async (request) => {
        try {
            const { status, result } = await Fetch(
                "./api/reset-password-client",
                {
                    method: "POST",
                    body: JSON.stringify(request),
                }
            );
            if (!status)
                throw new Error(
                    result?.message || "Error al restablecer la contraseña"
                );
            toast.success("¡Contraseña restablecida!", {
                description: `Tu contraseña ha sido restablecida correctamente. Puedes iniciar sesión con tu nueva contraseña.`,
                duration: 3000,
                position: "top-right",
                richColors: true,
            });
            return true;
        } catch (error) {
            toast.error("Error al restablecer la contraseña", {
                description: error.message || "Ocurrió un error inesperado.",
                duration: 3000,
                position: "top-right",
                richColors: true,
            });
            return false;
        }
    };
}

export default AuthClientRest;
