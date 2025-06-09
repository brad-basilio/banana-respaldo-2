import React from "react";

const technologies = [
  {
    id: "xgt",
    title: "Litio-ion XGT",
    logo: "/assets/img/brands/makita/xgt_logo.png",
    image: "/assets/img/brands/makita/xgt_tool.png",
    description: "Duis dapibus congue velit, lobortis mollis nisi volutpat quis. Nulla facilisi. Sed efficitur, eros ut tincidunt sagittis, magna sem mollis elit, ac dapibus diam ipsum scelerisque enim."
  },
  {
    id: "xpt",
    title: "Tecnología de protección extrema",
    logo: "/assets/img/brands/makita/xpt_logo.png",
    image: "/assets/img/brands/makita/xpt_tool.png",
    description: "Duis dapibus congue velit, lobortis mollis nisi volutpat quis. Nulla facilisi. Sed efficitur, eros ut tincidunt sagittis, magna sem mollis elit, ac dapibus diam ipsum scelerisque enim."
  },
  {
    id: "adt",
    title: "Tecnología de torque automático",
    logo: "/assets/img/brands/makita/adt_logo.png",
    image: "/assets/img/brands/makita/adt_tool.png",
    description: "Duis dapibus congue velit, lobortis mollis nisi volutpat quis. Nulla facilisi. Sed efficitur, eros ut tincidunt sagittis, magna sem mollis elit, ac dapibus diam ipsum scelerisque enim."
  },
  {
    id: "aft",
    title: "Función inteligente para minimizar el daño por kick-back",
    logo: "/assets/img/brands/makita/aft_logo.png",
    image: "/assets/img/brands/makita/aft_tool.png",
    description: "Duis dapibus congue velit, lobortis mollis nisi volutpat quis. Nulla facilisi. Sed efficitur, eros ut tincidunt sagittis, magna sem mollis elit, ac dapibus diam ipsum scelerisque enim."
  }
];

const BrandMakita = ({ data }) => {
  return (
    <section className="w-full bg-[#1e1e1e] text-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-[5%]">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            {data?.title || "Nuestras tecnologías de punto"}
          </h2>
          
          {/* View More Button */}
          <a 
            href={data?.link_catalog || "#tecnologias"} 
            className="inline-block bg-[#0e6984] hover:bg-[#095973] text-white text-base font-medium py-3 px-6 rounded-md transition-all duration-300"
          >
            {data?.button_text || "Ver más tecnologías"}
          </a>
        </div>
        
        {/* Technologies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {technologies.map((tech) => (
            <div key={tech.id} className="flex flex-col items-center">
              {/* Technology Title */}
              <h3 className="text-xl font-semibold mb-5 text-center">
                {tech.title}
              </h3>
              
              {/* Technology Logo */}
              <div className="mb-6 h-16 flex items-center">
                <img 
                  src={tech.logo} 
                  alt={`${tech.id} logo`} 
                  className="h-auto max-h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    if (tech.id === "xgt") {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='60' viewBox='0 0 180 60'%3E%3Cpath d='M30,15 L60,15 L45,45 L15,45 Z' fill='white'/%3E%3Ctext x='37.5' y='35' font-family='Arial' font-size='14' font-weight='bold' text-anchor='middle' fill='black'%3EXGT%3C/text%3E%3C/svg%3E";
                    } else if (tech.id === "xpt") {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='60' viewBox='0 0 180 60'%3E%3Cpath d='M15,15 L165,15 L150,45 L0,45 Z' fill='white'/%3E%3Ctext x='85' y='35' font-family='Arial' font-size='14' font-weight='bold' text-anchor='middle' fill='black'%3EXPT%3C/text%3E%3C/svg%3E";
                    } else if (tech.id === "adt") {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='60' viewBox='0 0 180 60'%3E%3Ctext x='90' y='35' font-family='Arial' font-size='24' font-weight='bold' text-anchor='middle' fill='white'%3EADT%3C/text%3E%3C/svg%3E";
                    } else {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='60' viewBox='0 0 180 60'%3E%3Ctext x='90' y='35' font-family='Arial' font-size='24' font-weight='bold' text-anchor='middle' fill='white'%3EAFT%3C/text%3E%3C/svg%3E";
                    }
                  }}
                />
              </div>
              
              {/* Product Image */}
              <div className="mb-6 h-48 flex items-center">
                <img 
                  src={tech.image} 
                  alt={`${tech.title} herramienta`}
                  className="h-auto max-h-full" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/img/noimage/no_img.jpg";
                  }}
                />
              </div>
              
              {/* Description */}
              <p className="text-sm text-center mb-6">
                {tech.description}
              </p>
              
              {/* View More Link */}
              <a 
                href={`#${tech.id}`} 
                className="inline-block bg-[#0e9cb5] hover:bg-[#0b8a9f] text-white text-sm font-medium py-2 px-4 rounded-md transition-all duration-300 mt-auto"
              >
                Ver más
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandMakita;
