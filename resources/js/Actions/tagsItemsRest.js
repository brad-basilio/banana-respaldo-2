import { Fetch } from "sode-extend-react";


const tagsItemsRest = {
    async getTags() {
        try {
            const response = await Fetch.get('/items/tags');
            return response;
        } catch (error) {
            console.error('Error getting tags:', error);
            return null;
        }
    }
};

export default tagsItemsRest;
