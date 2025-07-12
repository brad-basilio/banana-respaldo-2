import { Cookies, Fetch } from "sode-extend-react";
import { toast } from "sonner";

class BasicRest {
    is_use_notify = true;
    path = null;
    hasFiles = false;
    controller = null;
    constructor() {
        this.controller = new AbortController();
    }

    simpleGet = async (url, params, notify = true) => {
        try {
            const { status, result } = await Fetch(url, params);
            if (!status)
                throw new Error(
                    result?.message || "Ocurrio un error inesperado"
                );
            return result.data ?? true;
        } catch (error) {

            if (notify) toast.error("¡Error!", {
                description: error.message,
                duration: 3000,
                position: "bottom-center",
                richColors: true
            });
            return null;
        }
    };

    paginate = async (params) => {
        this.controller.abort("Nothing");
        this.controller = new AbortController();
        const signal = this.controller.signal;
        const res = await fetch(`/api/${this.path}/paginate`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-Xsrf-Token": decodeURIComponent(Cookies.get("XSRF-TOKEN")),
            },
            body: JSON.stringify(params),
            signal,
        });
        return await res.json();
    };

    save = async (request, callback = () => { }) => {
        try {
            let status = false;
            let result = {};
            if (this.hasFiles) {
                const res = await fetch(`/api/${this.path}`, {
                    method: "POST",
                    headers: {
                        "X-Xsrf-Token": decodeURIComponent(
                            Cookies.get("XSRF-TOKEN")
                        ),
                    },
                    body: request,
                });
                status = res.ok;
                result = JSON.parseable(await res.text());
            } else {
                const fetchRes = await Fetch(`/api/${this.path}`, {
                    method: "POST",
                    body: JSON.stringify(request),
                });
                status = fetchRes.status;
                result = fetchRes.result;
            }

            if (!status)
                throw new Error(
                    result?.message || "Ocurrio un error inesperado"
                );

            if (this.is_use_notify) {
                toast.success("¡Excelente!", {
                    description: result.message,

                    duration: 3000,
                    position: "bottom-center",
                    richColors: true
                });
            }


            callback?.();
            return result?.data ?? true;
        } catch (error) {

            toast.error("¡Error!", {
                description: error.message,

                duration: 3000,
                position: "bottom-center",
                richColors: true
            });
            return null;
        }
    };

    status = async ({ id, status }) => {
        try {
            const { status: fetchStatus, result } = await Fetch(
                `/api/${this.path}/status`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ id, status }),
                }
            );
            if (!fetchStatus)
                throw new Error(
                    result?.message ?? "Ocurrio un error inesperado"
                );

            toast.success("¡Excelente!", {
                description: result.message,

                duration: 3000,
                position: "bottom-center",
                richColors: true
            });

            return true;
        } catch (error) {
            toast.error("¡Error!", {
                description: error.message,

                duration: 3000,
                position: "bottom-center",
                richColors: true
            });

            return false;
        }
    };

    boolean = async ({ id, field, value }) => {
        try {
            const { status: fetchStatus, result } = await Fetch(
                `/api/${this.path}/boolean`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ id, field, value }),
                }
            );
            if (!fetchStatus)
                throw new Error(
                    result?.message ?? "Ocurrio un error inesperado"
                );

            toast.success("¡Excelente!", {
                description: result.message,

                duration: 3000,
                position: "bottom-center",
                richColors: true
            });

            return true;
        } catch (error) {
            toast.error("¡Error!", {
                description: error.message,

                duration: 3000,
                position: "bottom-center",
                richColors: true
            });

            return false;
        }
    };

    delete = async (id) => {
        try {
            const { status: fetchStatus, result } = await Fetch(
                `/api/${this.path}/${id}`,
                {
                    method: "DELETE",
                }
            );
            if (!fetchStatus)
                throw new Error(
                    result?.message ?? "Ocurrio un error inesperado"
                );

            toast.success("¡Excelente!", {
                description: result.message,

                duration: 3000,
                position: "bottom-center",
                richColors: true
            });

            return true;
        } catch (error) {
            toast.error("¡Error!", {
                description: error.message,

                duration: 3000,
                position: "bottom-center",
                richColors: true
            });

            return false;
        }
    };

    // Método para obtener datos con soporte para relaciones
    get = async (idOrParams = {}, withRelations = []) => {
        try {
            let url = `/api/${this.path}`;
            if (
                typeof idOrParams === "string" ||
                typeof idOrParams === "number"
            ) {
                // Si es un ID, construir la URL con el ID
                url += `/${idOrParams}`;
            } else if (
                typeof idOrParams === "object" &&
                Object.keys(idOrParams).length > 0
            ) {
                // Si son parámetros, agregarlos como query string
                const queryParams = new URLSearchParams(idOrParams).toString();
                url += `?${queryParams}`;
            }

            // Agregar relaciones si se especifican
            if (withRelations.length > 0) {
                const withParam = withRelations.join(",");
                url += `${url.includes("?") ? "&" : "?"}with=${withParam}`;
            }

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Xsrf-Token": decodeURIComponent(
                        Cookies.get("XSRF-TOKEN")
                    ),
                },
            });

            if (!response.ok) {
                throw new Error(
                    `Error ${response.status}: ${response.statusText}`
                );
            }

            return await response.json();
        } catch (error) {
            toast.error("¡Error!", {
                description: error.message,

                duration: 3000,
                position: "bottom-center",
                richColors: true
            });
            return null;
        }
    };
}

export default BasicRest;
