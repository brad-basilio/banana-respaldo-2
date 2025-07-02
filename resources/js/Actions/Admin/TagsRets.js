import BasicRest from "../BasicRest";

class TagsRest extends BasicRest {
  path = 'admin/tags'
  hasFiles = true; // Para manejar imágenes de las etiquetas
}

export default TagsRest