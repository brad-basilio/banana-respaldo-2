import { Fetch } from "sode-extend-react";
import BasicRest from "../BasicRest";

class ItemsRest extends BasicRest {
    path = "admin/items";
    hasFiles = true;

    importData = async (request) => {
        console.log("FormData recibido en importData:", [...request.entries()]);

        try {
            const response = await fetch(`/api/unified-import`, {
                method: "POST",
                body: request,
            });

            const result = await response.json();
            console.log("Respuesta del servidor:", result);

            if (!response.ok) {
                throw new Error(
                    result?.error ??
                        result?.message ??
                        "Error en la importación"
                );
            }

            return result;
        } catch (error) {
            console.error("Error en importData:", error.message);
            throw error; // ✅ Lanza el error para que `handleUpload()` lo capture
        }
    };
}

export default ItemsRest;
