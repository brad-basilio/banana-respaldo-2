import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, X, Edit, Eye, Trash2, Clock, CheckCircle, AlertCircle } from "lucide-react";
import AuthClientRest from "../../../Actions/AuthClientRest";
import Swal from "sweetalert2";

// Animaciones configuradas
const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      y: -5,
      scale: 1.03,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  },
  modal: {
    overlay: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
    },
    content: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: { 
        scale: 1, 
        opacity: 1,
        transition: { type: "spring", damping: 25 }
      },
      exit: { scale: 0.9, opacity: 0 }
    }
  },
  button: {
    hover: { x: -3 },
    tap: { scale: 0.95 }
  },
  title: {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }
};

const CardProyecto = ({ proyecto, onEdit, onView, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determinar el estado del proyecto
  const isFinalized = ['completed', 'exported', 'ordered'].includes(proyecto.status);
  const canEdit = proyecto.status === 'draft';
  
  // Obtener el ícono de estado
  const getStatusIcon = () => {
    switch (proyecto.status) {
      case 'completed':
      case 'exported':
      case 'ordered':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'draft':
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  // Obtener el texto del estado
  const getStatusText = () => {
    switch (proyecto.status) {
      case 'completed':
        return 'Completado';
      case 'exported':
        return 'Exportado';
      case 'ordered':
        return 'Pedido realizado';
      case 'draft':
        return 'Borrador';
      default:
        return 'Desconocido';
    }
  };

  return (
    <motion.div
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer relative"
      variants={animations.item}
      whileHover={{
        scale: 1.02,
        boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Etiqueta de estado */}
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        <motion.span 
          className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium ${
            isFinalized 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {getStatusIcon()}
          {getStatusText()}
        </motion.span>
      </div>

      {/* Imagen del proyecto */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <motion.img 
          src={proyecto.thumbnail || "/assets/img/backgrounds/resources/default-image.png"} 
          alt={proyecto.name || 'Proyecto sin título'}
          className="w-full h-full object-cover"
          initial={{ scale: 1 }}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          onError={(e) => e.target.src = "/assets/img/backgrounds/resources/default-image.png"}
        />

        {/* Efectos hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Botón Ver */}
              <motion.button 
                onClick={(e) => {
                  e.stopPropagation();
                  onView(proyecto);
                }}
                className="bg-white text-gray-700 rounded-full p-3 shadow-lg hover:bg-gray-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Ver proyecto"
              >
                <Eye size={20} />
              </motion.button>

              {/* Botón Editar (solo si no está finalizado) */}
              {canEdit && (
                <motion.button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(proyecto);
                  }}
                  className="bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Editar proyecto"
                >
                  <Edit size={20} />
                </motion.button>
              )}

              {/* Botón Eliminar (solo si no está finalizado) */}
              {canEdit && (
                <motion.button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(proyecto);
                  }}
                  className="bg-red-500 text-white rounded-full p-3 shadow-lg hover:bg-red-600"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Eliminar proyecto"
                >
                  <Trash2 size={20} />
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
          {proyecto.name || 'Proyecto sin título'}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-2">
          {proyecto.description || 'Sin descripción'}
        </p>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Creado: {new Date(proyecto.created_at).toLocaleDateString()}</span>
          <span>Modificado: {new Date(proyecto.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

const ProyectoModal = ({ proyecto, onClose }) => {
  if (!proyecto) return null;

  const isFinalized = ['completed', 'exported', 'ordered'].includes(proyecto.status);

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      variants={animations.modal.overlay}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        variants={animations.modal.content}
      >
        {/* Header del modal */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">{proyecto.name || 'Proyecto sin título'}</h2>
          <motion.button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vista previa del proyecto */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                <img 
                  src={proyecto.thumbnail || "/assets/img/backgrounds/resources/default-image.png"} 
                  alt={proyecto.name || 'Proyecto sin título'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Detalles del proyecto */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-600 mb-1">Descripción</h3>
                <p className="text-gray-800">{proyecto.description || 'Sin descripción'}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-600 mb-1">Estado</h3>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  isFinalized 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {isFinalized ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {proyecto.status === 'draft' ? 'Borrador' : 
                   proyecto.status === 'completed' ? 'Completado' :
                   proyecto.status === 'exported' ? 'Exportado' :
                   proyecto.status === 'ordered' ? 'Pedido realizado' : 'Desconocido'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-600 mb-1">Fecha de creación</h3>
                  <p className="text-gray-800">{new Date(proyecto.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600 mb-1">Última modificación</h3>
                  <p className="text-gray-800">{new Date(proyecto.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3 pt-4">
                {!isFinalized && (
                  <motion.a
                    href={`/canva2?project=${proyecto.id}`}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-600"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit size={18} />
                    Continuar editando
                  </motion.a>
                )}
                
                <motion.button
                  onClick={onClose}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cerrar
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function MisProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState('todos'); // todos, en_progreso, finalizado

  // Cargar proyectos del usuario
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // Aquí deberías hacer la llamada a tu API para obtener los proyectos del usuario
      const response = await AuthClientRest.get('/api/customer/projects');
      if (response.status === 200) {
        setProyectos(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los proyectos',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (proyecto) => {
    window.location.href = `/canva2?project=${proyecto.id}`;
  };

  const handleView = (proyecto) => {
    setSelectedProject(proyecto);
  };

  const handleDelete = async (proyecto) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await AuthClientRest.delete(`/api/customer/projects/${proyecto.id}`);
        await loadProjects(); // Recargar la lista
        Swal.fire('¡Eliminado!', 'El proyecto ha sido eliminado.', 'success');
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el proyecto', 'error');
      }
    }
  };

  // Filtrar proyectos
  const proyectosFiltrados = proyectos.filter(proyecto => {
    if (filter === 'todos') return true;
    if (filter === 'finalizado') return ['completed', 'exported', 'ordered'].includes(proyecto.status);
    if (filter === 'en_progreso') return proyecto.status === 'draft';
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 max-w-7xl font-paragraph"
      initial="hidden"
      animate="visible"
      variants={animations.container}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <motion.a 
          href="/"
          className="flex items-center customtext-primary"
          variants={animations.button}
          whileHover="hover"
          whileTap="tap"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="ml-1">Regresar</span>
        </motion.a>
      </div>

      {/* Título y filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold"
          variants={animations.title}
        >
          Mis Proyectos
        </motion.h1>

        {/* Filtros */}
        <div className="flex gap-2">
          <motion.button
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'todos' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Todos ({proyectos.length})
          </motion.button>
          <motion.button
            onClick={() => setFilter('en_progreso')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'en_progreso' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            En progreso ({proyectos.filter(p => p.status === 'draft').length})
          </motion.button>
          <motion.button
            onClick={() => setFilter('finalizado')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'finalizado' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Finalizados ({proyectos.filter(p => ['completed', 'exported', 'ordered'].includes(p.status)).length})
          </motion.button>
        </div>
      </div>

      {/* Botón crear nuevo proyecto */}
      <div className="mb-8">
        <motion.a
          href="/canva1"
          className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Edit size={18} />
          Crear nuevo proyecto
        </motion.a>
      </div>

      {/* Grid de proyectos */}
      {proyectosFiltrados.length === 0 ? (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {filter === 'todos' ? 'No tienes proyectos aún' : `No tienes proyectos ${filter === 'finalizado' ? 'finalizados' : 'en progreso'}`}
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === 'todos' ? 'Comienza creando tu primer proyecto' : 'Cambia el filtro para ver otros proyectos'}
          </p>
          {filter === 'todos' && (
            <motion.a
              href="/canva1"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit size={18} />
              Crear mi primer proyecto
            </motion.a>
          )}
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={animations.container}
        >
          <AnimatePresence>
            {proyectosFiltrados.map((proyecto) => (
              <motion.div
                key={proyecto.id}
                variants={animations.item}
                layoutId={`project-${proyecto.id}`}
              >
                <CardProyecto 
                  proyecto={proyecto} 
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal de proyecto */}
      <AnimatePresence>
        {selectedProject && (
          <ProyectoModal 
            proyecto={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
