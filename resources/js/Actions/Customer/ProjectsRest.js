import { Fetch } from "sode-extend-react";
import BasicRest from "../BasicRest";

class ProjectsRest extends BasicRest {
    path = "customer/albums";


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
