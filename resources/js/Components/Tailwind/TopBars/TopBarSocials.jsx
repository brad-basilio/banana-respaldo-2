import { useEffect, useRef, useState } from "react";
import General from "../../../Utils/General"
import { adjustTextColor } from "../../../Functions/adjustTextColor";
import Tippy from "@tippyjs/react";
import Global from "../../../Utils/Global";


const TopBarSocials = ({ items, data }) => {
  const sectionRef = useRef(null);
  const [show, setShow] = useState(true);
  const lastScroll = useRef(0);

  useEffect(() => {
    if (sectionRef.current) {
      adjustTextColor(sectionRef.current); // Llama a la función
    }
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll.current && current > 60) {
        setShow(false); // Oculta al bajar
      } else {
        setShow(true); // Muestra al subir
      }
      lastScroll.current = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  console.log(items);
  return (
    <section
      ref={sectionRef}
      className={`${data?.background_color ? data?.background_color : "bg-primary"} text-white font-paragraph font-bold transition-all duration-300 w-full z-50`}
    >
      <div className="px-primary  mx-auto py-3 flex flex-wrap justify-center md:justify-between items-center gap-2 2xl:max-w-7xl 2xl:px-0">
        <p className="hidden md:block">{data.isCopyright ? 
       ` Copyright © ${new Date().getFullYear()} ${Global.APP_NAME}. Reservados todos los derechos.`
        : General.get('cintillo')}</p>
        <p className="hidden md:block text-xs">{data?.title}</p>
        <div className="flex gap-4">
          {
            items && items.length > 0 ? items.map((social, index) => (
              <Tippy
                key={index}
                content={`Ver ${social.name || social.description || 'Red social'}`}>
                <a
                  className={`text-xl w-8 h-8 flex items-center justify-center  rounded-full p-2 ${data?.color ? data?.color : "customtext-primary"} hover:scale-110 transition-transform duration-200 cursor-pointer`}
                  href={social.url || social.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!social.url && !social.link) {
                      e.preventDefault();
                      console.warn('URL no configurada para:', social);
                    }
                  }}
                >
                  {
                    social?.description?.toLowerCase() === 'tiktok' ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        className="w-5 h-5"
                      >
                        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z"/>
                      </svg>
                    ) : (
                      <i className={social.icon || 'fab fa-globe'} />
                    )
                  }
                </a>
              </Tippy>
            )) : (
              <span className="text-sm opacity-75">No hay redes sociales configuradas</span>
            )
          }
        </div>
      </div>
    </section>
  );
}

export default TopBarSocials;