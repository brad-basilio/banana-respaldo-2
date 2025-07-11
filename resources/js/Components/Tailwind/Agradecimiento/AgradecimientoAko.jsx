import React, { useRef, useState } from "react"
import Global from "../../../Utils/Global";
import Tippy from "@tippyjs/react";

const AgradecimientoAko = ({ data, contacts, items = [] }) => {
  // const navigate = useNavigate()
  const getContact = (correlative) => {
    return (
        contacts.find((contact) => contact.correlative === correlative)
            ?.description || ""
    );
  };

  return <div className="bg-white">
            <main className="w-11/12 mx-auto max-w-[868px]">
                <div className="flex flex-col gap-10 pt-10 ">
                    
                    {/* <div className="flex justify-center items-center -mb-10">
                        <img src={`/assets/resources/icon.png?v=${crypto.randomUUID()}`} alt={Global.APP_NAME} className="h-40 object-cover object-center" onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/assets/img/logo-bk.svg';
                                }} />
                    </div> */}
                    
                    <div className="flex flex-col gap-2 customtext-primary bg-[#F2F2F2] p-3 sm:p-5 lg:p-10 xl:p-14 rounded-xl lg:rounded-2xl 2xl:rounded-3xl">
                        <h2 className="font-title text-3xl xl:text-5xl font-semibold text-center leading-tight">
                            ¡Gracias por confiar en nosotros!
                        </h2>

                        <p className="text-[#1d1d1d] font-title font-normal text-center text-base xl:text-xl">
                             Hemos recibido tus datos correctamente.
                        </p>

                        <p className="text-[#1d1d1d] font-title font-normal text-center text-base xl:text-xl mt-5">
                            Muy pronto nos pondremos en contacto contigo para brindarte toda la información que necesitas. Mientras tanto, te invitamos a seguirnos en nuestras redes sociales y mantenerte al tanto de nuestras novedades.
                        </p>

                        <a
                            href="/"
                            className="max-w-xl mx-auto mt-5 bg-accent transition-all duration-300 text-white border-none items-center px-10 py-3 text-base rounded-lg font-medium cursor-pointer hover:opacity-90"
                        >
                            Volver al inicio
                        </a>

                        <div className="flex flex-row justify-center items-center gap-2 mt-5">
                            <ul className="flex text-white gap-2">
                            {items.map((social, index) => (
                                <Tippy key={index} content={`Ver ${social.name} en ${social.description}`}>
                                <a href={social.link} className={`text-base flex bg-white customtext-accent ${social.icon} w-8
                                            h-8 pt-0.5 items-center justify-center rounded-full`} />
                                </Tippy>
                            ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </main>
  </div>
}

export default AgradecimientoAko