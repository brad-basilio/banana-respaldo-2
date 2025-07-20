import { useEffect, useRef, useState } from "react";
import General from "../../../Utils/General"
import { adjustTextColor } from "../../../Functions/adjustTextColor";
import Tippy from "@tippyjs/react";
import Global from "../../../Utils/Global";


const TopBarPanni = ({ items, data }) => {
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
 
  return (
    <section
      ref={sectionRef}
      className={`${data?.background_color ? data?.background_color : "bg-primary"} text-white font-paragraph font-bold transition-all duration-300 w-full z-50 ${data?.border_color ? `border-t-2 ${data?.border_color}`:""}`}
    >
      <div className="px-primary  mx-auto pt-1 pb-1.5 flex flex-wrap justify-center md:justify-between items-center gap-2 2xl:max-w-7xl 2xl:px-0">

        <div className="flex flex-row items-center justify-start gap-5">
            
            <div className="flex flex-row items-center justify-start gap-2">
              <svg className="w-5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1.33325 3.3335L5.94193 5.94991C7.62572 6.90583 8.37412 6.90583 10.0579 5.94991L14.6666 3.3335" stroke="white" stroke-linejoin="round"/>
                <path d="M6.99992 12.9998C6.68905 12.9958 6.3778 12.9898 6.06581 12.982C3.96681 12.9292 2.91731 12.9028 2.16323 12.1454C1.40914 11.388 1.38735 10.3656 1.34377 8.32077C1.32975 7.66324 1.32975 7.00964 1.34376 6.35212C1.38735 4.30726 1.40913 3.28482 2.16322 2.52743C2.91731 1.77004 3.96681 1.74366 6.0658 1.69089C7.35945 1.65837 8.64039 1.65838 9.93405 1.6909C12.0331 1.74366 13.0825 1.77005 13.8366 2.52744C14.5907 3.28483 14.6125 4.30726 14.6561 6.35213C14.6625 6.65484 14.666 6.7975 14.6665 6.99984" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12.6667 11.3335C12.6667 11.8858 12.219 12.3335 11.6667 12.3335C11.1145 12.3335 10.6667 11.8858 10.6667 11.3335C10.6667 10.7812 11.1145 10.3335 11.6667 10.3335C12.219 10.3335 12.6667 10.7812 12.6667 11.3335ZM12.6667 11.3335V11.6668C12.6667 12.2191 13.1145 12.6668 13.6667 12.6668C14.219 12.6668 14.6667 12.2191 14.6667 11.6668V11.3335C14.6667 9.67663 13.3236 8.3335 11.6667 8.3335C10.0099 8.3335 8.66675 9.67663 8.66675 11.3335C8.66675 12.9904 10.0099 14.3335 11.6667 14.3335" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span className="font-light text-sm 2xl:text-base">info@paani.com</span>
            </div>

            <div className="flex flex-row items-center justify-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.33325 6.00016C3.33325 3.80028 3.33325 2.70033 4.01667 2.01692C4.70009 1.3335 5.80003 1.3335 7.99992 1.3335C10.1998 1.3335 11.2997 1.3335 11.9832 2.01692C12.6666 2.70033 12.6666 3.80028 12.6666 6.00016V10.0002C12.6666 12.2 12.6666 13.3 11.9832 13.9834C11.2997 14.6668 10.1998 14.6668 7.99992 14.6668C5.80003 14.6668 4.70009 14.6668 4.01667 13.9834C3.33325 13.3 3.33325 12.2 3.33325 10.0002V6.00016Z" stroke="white" stroke-linecap="round"/>
              <path d="M7.33325 12.6665H8.66659" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 1.3335L6.05933 1.68951C6.18792 2.46102 6.25221 2.84678 6.51679 3.08152C6.7928 3.32639 7.18407 3.3335 8 3.3335C8.81593 3.3335 9.2072 3.32639 9.4832 3.08152C9.7478 2.84678 9.81207 2.46102 9.94067 1.68951L10 1.3335" stroke="white" stroke-linejoin="round"/>
            </svg>
              <span className="font-light text-sm 2xl:text-base">(+51) 949 299 959</span>
            </div>

        </div>
        
        <div className="flex gap-3">
          {
            items && items.length > 0 ? items.map((social, index) => (
              <Tippy
                key={index}
                content={`Ver ${social.name || social.description || 'Red social'}`}>
                <a
                  className={`text-lg 2xl:text-xl w-8 h-8 flex flex-col items-center justify-center bg-white rounded-full p-2 ${data?.color ? data?.color : "customtext-neutral-light"} hover:scale-110 transition-transform duration-200 cursor-pointer`}
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

export default TopBarPanni;