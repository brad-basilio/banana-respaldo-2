import BasicRest from "../BasicRest";
import { toast } from "sonner";
import { Fetch } from "sode-extend-react";

export default class CouponsRest extends BasicRest {
    constructor() {
        super();
        this.path = "admin/coupons";
    }    async validate(code, cartData = {}) {
        try {
            const { status, result } = await Fetch(`/api/${this.path}/validate`, {
                method: "POST",
                body: JSON.stringify({
                    code: code,
                    cart_total: cartData.total || 0,
                    category_ids: cartData.category_ids || [],
                    product_ids: cartData.product_ids || []
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (result.valid) {
                toast.success("¡Excelente!", {
                    description: result.message,
                    duration: 3000,
                    position: "bottom-center",
                    richColors: true
                });
                return result;
            } else {
                toast.error("¡Error!", {
                    description: result.message,
                    duration: 3000,
                    position: "bottom-center",
                    richColors: true
                });
                return null;
            }
        } catch (error) {
            toast.error("¡Error!", {
                description: error.message || "Error al validar el cupón",
                duration: 3000,
                position: "bottom-center",
                richColors: true
            });
            return null;
        }
    }    async generateCode() {
        try {
            const { status, result } = await Fetch(`/api/${this.path}/generate-code`);
            if (status) {
                return result.data?.code || result.code;
            }
            return null;
        } catch (error) {
            toast.error("¡Error!", {
                description: "Error al generar código",
                duration: 3000,
                position: "bottom-center",
                richColors: true
            });
            return null;
        }
    }
}
