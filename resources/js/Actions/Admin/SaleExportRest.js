import BasicRest from "../BasicRest";

export default class SaleExportRest extends BasicRest {
    constructor() {
        super();
        this.path = 'admin/sales/export-data';
        this.is_use_notify = false; // Desactivar notificaciones automáticas
    }

    async exportData() {
        try {
            const response = await fetch(`/api/${this.path}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching export data:', error);
            throw error;
        }
    }
}
