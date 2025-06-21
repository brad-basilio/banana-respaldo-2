import BasicRest from '../BasicRest';
import { Fetch } from "sode-extend-react";

export default class DiscountRulesRest extends BasicRest {
    constructor() {
        super();
        this.path = 'admin/discount-rules';
    }    async toggleActive(id, active) {
        try {
            const { status, result } = await Fetch(`/api/${this.path}/${id}/toggle-active`, {
                method: 'PATCH',
                body: JSON.stringify({ active })
            });
            
            if (!status) {
                throw new Error(result?.message || 'Error toggling active status');
            }
            
            return result;
        } catch (error) {
            console.error('Error toggling active status:', error);
            return false;
        }
    }    async duplicate(id) {
        try {
            const { status, result } = await Fetch(`/api/${this.path}/${id}/duplicate`, {
                method: 'POST'
            });
            
            if (!status) {
                throw new Error(result?.message || 'Error duplicating rule');
            }
            
            return result;
        } catch (error) {
            console.error('Error duplicating rule:', error);
            return false;
        }
    }async getProducts() {
        try {
            const result = await this.simpleGet(`/api/${this.path}/products`);
            return result?.data || result || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }    async getCategories() {
        try {
            const result = await this.simpleGet(`/api/${this.path}/categories`);
            return result?.data || result || [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }    async getProductsByIds(ids) {
        try {
            if (!ids || ids.length === 0) return [];
            console.log('Fetching products by IDs:', ids);
            const { status, result } = await Fetch(`/api/${this.path}/products/by-ids`, {
                method: 'POST',
                body: JSON.stringify({ ids })
            });
            if (!status) {
                throw new Error(result?.message || 'Error fetching products by IDs');
            }
            console.log('Products fetched by IDs result:', result);
            return result?.data || result || [];
        } catch (error) {
            console.error('Error fetching products by ids:', error);
            // Return empty array if the endpoint fails, no fallback
            return [];
        }
    }    async getCategoriesByIds(ids) {
        try {
            if (!ids || ids.length === 0) return [];
            console.log('Fetching categories by IDs:', ids);
            const { status, result } = await Fetch(`/api/${this.path}/categories/by-ids`, {
                method: 'POST',
                body: JSON.stringify({ ids })
            });
            if (!status) {
                throw new Error(result?.message || 'Error fetching categories by IDs');
            }
            console.log('Categories fetched by IDs result:', result);
            return result?.data || result || [];
        } catch (error) {
            console.error('Error fetching categories by ids:', error);
            // Return empty array if the endpoint fails, no fallback
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
