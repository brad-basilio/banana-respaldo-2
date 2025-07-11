import BasicRest from "../BasicRest";

class StoresRest extends BasicRest {
    path = "admin/stores";
    hasFiles = true; // Para manejar imágenes de las tiendas
}

export default StoresRest;
