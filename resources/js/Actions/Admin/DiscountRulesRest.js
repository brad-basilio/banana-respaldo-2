import BasicRest from '../BasicRest';

export default class DiscountRulesRest extends BasicRest {
    constructor() {
        super();
        this.path = 'admin/discount-rules';
    }    async toggleActive(id, active) {
        try {
            const result = await this.simpleGet(`/api/${this.path}/${id}/toggle-active`, {
                method: 'PATCH',
                body: JSON.stringify({ active })
            });
            
            return result;
        } catch (error) {
            console.error('Error toggling active status:', error);
            return false;
        }
    }

    async duplicate(id) {
        try {
            const result = await this.simpleGet(`/api/${this.path}/${id}/duplicate`, {
                method: 'POST'
            });
            
            return result;
        } catch (error) {
            console.error('Error duplicating rule:', error);
            return false;
        }
    }    async getProducts() {
        try {
            const result = await this.simpleGet(`/api/${this.path}/products`);
            return result?.data || result || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    async getCategories() {
        try {
            const result = await this.simpleGet(`/api/${this.path}/categories`);
            return result?.data || result || [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    async getRuleTypes() {
        try {
            const result = await this.simpleGet(`/api/${this.path}/rule-types`);
            return result?.data || result || {};
        } catch (error) {
            console.error('Error fetching rule types:', error);
            return {};
        }
    }

    async getUsageStats(id) {
        try {
            return await this.simpleGet(`/api/${this.path}/${id}/usage-stats`);
        } catch (error) {
            console.error('Error fetching usage stats:', error);
            return null;
        }
    }
}
