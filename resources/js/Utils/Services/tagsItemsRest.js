import { Fetch } from "sode-extend-react";
import BasicRest from "../../Actions/BasicRest";

class TagsItemsRest extends BasicRest {
    path = "items";

    getTags = async () => {
        try {
            const { status, result } = await Fetch(
                `/api/${this.path}/tags`,
                {
                    method: "GET",
                }
            );
            if (!status)
                throw new Error(
                    result?.message ??
                        "Ocurrió un error al consultar los tags"
                );
            return result;
        } catch (error) {
            console.error('Error getting tags:', error);
            return { data: [] };
        }
    };
}

export default new TagsItemsRest();
