import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import SearchProductPreview from "../../../../Actions/SearchProductPreview";

const LiveSearchBar = ({ search, setSearch }) => {
  const [filtered, setFiltered] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const containerRef = useRef();

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar productos cada vez que cambia "search"
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (search.trim().length === 0) {
      setFiltered([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);

      const formData = { query: search.trim() };
      const response = await SearchProductPreview.getProducts(formData);

      if (response && response.data?.length) {
        setFiltered(response.data);
        setShowDropdown(true);
      } else {
        setFiltered([]);
        setShowDropdown(false);
      }

      setLoading(false);
    }, 300); // 300ms debounce
  }, [search]);

  return (
    <div className="relative w-80" ref={containerRef}>
      <input
        type="search"
        placeholder="Buscar productos"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pr-14 py-4 pl-4 border rounded-full focus:ring-0 focus:outline-none placeholder:text-gray-400"
      />
      <a
        href={search.trim() ? `/catalogo?search=${encodeURIComponent(search)}` : "#"}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-white rounded-lg"
        aria-label="Buscar"
      >
        <Search />
      </a>

      {showDropdown && (
        <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-2 text-gray-500">Buscando...</div>
          ) : filtered.length > 0 ? (
            filtered.map((product) => {
              const price = parseFloat(product.price); // Asegúrate de que existe y es numérico
              const discount = parseFloat(product.discount); // Igual aquí
            
              return (
                <a
                  key={product.id}
                  href={`/item/${product.slug}`}
                  className="block px-1 py-1 hover:bg-gray-100 transition text-sm !font-font-general"
                >
                  <div className="flex items-center gap-3 px-2 py-2">
                    {/* Imagen */}
                    <div className="w-12 h-12 shrink-0">
                      <img
                        src={`/storage/images/item/${product.image}`}
                        alt={product.name}
                        onError={(e) => (e.target.src = '/assets/img/noimage/no_img.jpg')}
                        className="w-full h-full object-cover rounded"
                        loading="lazy"
                      />
                    </div>
            
                    {/* Nombre del producto */}
                    <div className="flex-1">
                      <h2 className="text-[13px] font-medium customtext-neutral-dark leading-tight line-clamp-3">
                        {product.name}
                      </h2>
                    </div>
            
                    {/* Precio */}
                    <div className="text-right text-sm min-w-[80px] customtext-neutral-dark">
                      <p className="text-primary font-semibold">
                        S/ {discount > 0 ? discount.toFixed(2) : price.toFixed(2)}
                      </p>
                      {discount > 0 && (
                        <p className="text-xs text-gray-500 line-through">
                          S/ {price.toFixed(2)}
                        </p>
                      )}
                    </div>
                    
                  </div>
                </a>
              );
            })
          ) : (
            <div className="px-4 py-2 text-gray-500">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveSearchBar;
