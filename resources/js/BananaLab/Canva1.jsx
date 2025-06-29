import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import CreateReactScript from "../Utils/CreateReactScript";

// Componente de carga
const LoadingFallback = () => (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-white/90 backdrop-blur-sm z-50">
        <div className="animate-bounce">
            <img
                src={`/assets/resources/logo.png?v=${crypto.randomUUID()}`}
                alt="BananaLab"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/img/logo-bk.svg";
                }}
                className="w-64 lg:w-96 transition-all duration-300 transform hover:scale-105"
            />
        </div>
    </div>
);

// Importación lazy del componente Canva1
const Canva1 = React.lazy(() => import("../Components/Tailwind/BananaLab/Canva1"));

const Canva1App = (props) => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Canva1 {...props} />
        </Suspense>
    );
};

CreateReactScript((el, properties) => {
    createRoot(el).render(<Canva1App {...properties} />);
});
