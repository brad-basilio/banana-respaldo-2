import { Fetch } from "sode-extend-react";

class ProjectsRest {
    path = "customer/albums";

    // Método para paginación
    paginate = async (request) => {
        try {
            const { status, result } = await Fetch(
                `/api/customer/canvas-projects/paginate`,
                {
                    method: "POST",
                    body: JSON.stringify(request),
                }
            );
            if (!status) {
                throw new Error(
                    result?.message ?? "Error al obtener los proyectos"
                );
            }
            return result;
        } catch (error) {
            console.error("Error paginating projects:", error);
            throw error;
        }
    };

    // Método para obtener un proyecto específico
    get = async (id) => {
        try {
            const { status, result } = await Fetch(
                `/api/customer/canvas-projects/${id}`,
                {
                    method: "GET",
                }
            );
            if (!status) {
                throw new Error(
                    result?.message ?? "Error al obtener el proyecto"
                );
            }
            return result;
        } catch (error) {
            console.error("Error getting project:", error);
            throw error;
        }
    };

    // Método para actualizar un proyecto
    save = async (request) => {
        try {
            const { status, result } = await Fetch(
                `/api/customer/canvas-projects/save`,
                {
                    method: "POST",
                    body: JSON.stringify(request),
                }
            );
            if (!status) {
                throw new Error(
                    result?.message ?? "Error al actualizar el proyecto"
                );
            }
            return result;
        } catch (error) {
            console.error("Error saving project:", error);
            throw error;
        }
    };

    // Método para eliminar un proyecto
    delete = async (id) => {
        try {
            const { status, result } = await Fetch(
                `/api/customer/canvas-projects/${id}`,
                {
                    method: "DELETE",
                }
            );
            if (!status) {
                throw new Error(
                    result?.message ?? "Error al eliminar el proyecto"
                );
            }
            return result;
        } catch (error) {
            console.error("Error deleting project:", error);
            throw error;
        }
    };

    // Método para crear un proyecto de canvas
    createCanvasProject = async (request) => {
        try {
            const { status, result } = await Fetch(
                `/api/customer/canvas-projects/create`,
                {
                    method: "POST",
                    body: JSON.stringify(request),
                }
            );
            if (!status) {
                throw new Error(
                    result?.message ??
                        "Ocurrió un error al crear el proyecto"
                );
            }
            return result.data ?? null;
        } catch (error) {
            console.error("Error creating canvas project:", error);
            throw error;
        }
    };
}

export default ProjectsRest;
