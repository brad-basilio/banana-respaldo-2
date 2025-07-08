import React, { useRef, useState } from "react"
import Global from "../../../Utils/Global";

const AgradecimientoAko = ({ data, contacts }) => {
  // const navigate = useNavigate()
  const getContact = (correlative) => {
    return (
        contacts.find((contact) => contact.correlative === correlative)
            ?.description || ""
    );
  };

  return <div className="bg-white">
            <main className="w-11/12 mx-auto max-w-[868px] pb-16">
                <div className="flex flex-col gap-10 py-10 ">
                    
                    <div className="flex justify-center items-center -mb-10">
                        <img src={`/assets/resources/icon.png?v=${crypto.randomUUID()}`} alt={Global.APP_NAME} className="h-40 object-cover object-center" onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/assets/img/logo-bk.svg';
                                }} />
                    </div>
                    
                    <div className="flex flex-col gap-2 customtext-primary">
                        <h2 className="font-font-general text-3xl xl:text-6xl font-bold text-center leading-tight">
                            ¡Gracias por contactarnos!
                        </h2>

                        <p className="text-[#1d1d1d] font-font-general font-normal text-center text-base xl:text-xl">
                            Un asesor comercial pronto se comunicará contigo
                            para brindarte toda la información necesaria.
                        </p>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex justify-center items-center">
                            <a href="/"
                                className="text-white font-font-general font-bold text-base py-3 px-6 bg-primary rounded-full">Seguir
                                navegando</a>
                        </div>
                    </div>
                </div>
            </main>
  </div>
}

export default AgradecimientoAko