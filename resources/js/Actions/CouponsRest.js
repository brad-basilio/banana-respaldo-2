import { Fetch } from 'sode-extend-react';

export default class CouponsRest {
    static async validateCoupon(data) {
        try {
            const { status, result } = await Fetch('./api/coupons/validate', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            
            if (!status) {
                throw new Error(result?.message || 'Error al validar cupón');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async generateCode() {
        try {
            const { status, result } = await Fetch('./api/coupons/generate-code', {
                method: 'GET',
            });
            
            if (!status) {
                throw new Error(result?.message || 'Error al generar código');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    }
}
