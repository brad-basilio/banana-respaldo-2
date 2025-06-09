import React from "react";

const benefits = [
  "Lubricación automática de la cadena.",
  "La ventana de visualización del aceite de la cadena permite al operario comprobar fácilmente el nivel de aceite.",
  "Tecnología de protección extrema (XPT) diseñada para ofrecer una mayor resistencia al polvo y al agua en las duras condiciones del lugar de trabajo.",
  "Palanca de bloqueo accesible desde ambos lados.",
  "Freno eléctrico para máxima productividad y mayor seguridad del operador"
];

const BannerContactMakita = ({ data }) => {
  return (
    <section className="relative w-full bg-[#0e6984] text-white overflow-hidden">
      <div className="container mx-auto px-[5%] py-16 md:py-24 flex flex-col md:flex-row md:items-center">
        {/* Left side with product image */}
        <div className="w-full md:w-1/3 mb-8 md:mb-0 relative z-10 flex items-center justify-center">
          <img 
            src={data?.image || "/assets/img/productos/taladro-makita.png"} 
            alt="Herramienta Makita"
            className="max-w-full h-auto"
          />
        </div>
        
        {/* Right side with text content */}
        <div className="w-full md:w-2/3 md:pl-10 relative z-10 ">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {data?.title || "Venta y asistencia técnica"}
          </h2>
          
          <p className="text-lg mb-8 max-w-2xl">
            {data?.description || "Duis dapibus congue velit, lobortis mollis nisi volutpat quis. Nulla facilisi. Sed efficitur, eros ut tincidunt sagittis, magna sem mollis elit."}
          </p>
          
        
        </div>
        <div>
            <a 
            href={data?.button_link || "#contacto"}
            className="inline-block bg-[#2dccd3] hover:bg-[#25b5bb] text-white font-medium py-3 px-8 rounded-lg transition-all duration-300"
          >
            {data?.button_text || "Ponerme en contacto"}
          </a>
        </div>
      </div>
      
      {/* Optional overlay texture/gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#095973] to-transparent opacity-50"></div>
    </section>
  );
};



export default BannerContactMakita;
