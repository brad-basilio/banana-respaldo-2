
const benefits = [
  "Lubricación automática de la cadena.",
  "La ventana de visualización del aceite de la cadena permite al operario comprobar fácilmente el nivel de aceite.",
  "Tecnología de protección extrema (XPT) diseñada para ofrecer una mayor resistencia al polvo y al agua en las duras condiciones del lugar de trabajo.",
  "Palanca de bloqueo accesible desde ambos lados.",
  "Freno eléctrico para máxima productividad y mayor seguridad del operador"
];

const BannerCTAMakita = ({data,items}) => {
  return (
    <div className="bg-secondary w-full min-h-screen flex items-center justify-center ">
      <div className="px-primary 2xl:max-w-7xl 2xl:px-0 w-full flex flex-col md:flex-row gap-12 md:gap-16 items-center justify-center py-16">
        {/* Left: Video/Image with Play Button */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-square rounded-xl overflow-hidden shadow-lg">
            <img
              src={`/storage/images/system/${data?.image}`}
              alt="Makita tool"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              fetchPriority="high"
              onError={(e) => {
                e.target.src = "/api/cover/thumbnail/null";
              }}
            />
          {/*  <button
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition group"
              aria-label="Reproducir video"
            >
              <span className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white/70 group-hover:bg-white/90 transition shadow-lg">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="24" fill="#fff" fillOpacity="0.0" />
                  <polygon points="20,16 34,24 20,32" fill="#282828" />
                </svg>
              </span>
            </button> */}
          </div>
        </div>

        {/* Right: Content */}
        <div className="w-full md:w-1/2 text-white flex flex-col justify-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            {data?.name}
          </h1>
          <p className="text-base md:text-lg mb-6">
            {data?.description}
          </p>
          <h2 className="text-xl font-bold mb-2">Beneficios</h2>
          <ul className="mb-8 space-y-3">
            {items.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 customtext-primary">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#06b6d4"/><path d="M8 12.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span>{b?.description}</span>
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="bg-primary hover:brightness-125 text-white font-bold px-8 py-3 rounded-lg transition w-max shadow-md"
          >
           {data?.button_text || "Contactar"}
          </a>
        </div>
      </div>
    </div>
  );
};

export default BannerCTAMakita;
