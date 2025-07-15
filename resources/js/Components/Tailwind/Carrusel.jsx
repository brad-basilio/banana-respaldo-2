import React from "react";

const CarruselBenefitsInifinite = React.lazy(() =>
    import("./Carrusel/CarruselBenefitsInifinite")
);
const CarruselBenefitsInifinite2dn1 = React.lazy(() =>
    import("./Carrusel/CarruselBenefitsInifinite2dn1")
);
const CarruselBenefitsPaani = React.lazy(() =>
    import("./Carrusel/CarruselBenefitsPaani")
);
const CarruselBenefitsSimple = React.lazy(() =>
    import("./Carrusel/CarruselBenefitsSimple")
);
const CarruselBananaLab = React.lazy(() =>
    import("./Carrusel/CarruselBananaLab")
);
const CarruselBenefitsSwiper = React.lazy(() =>
    import("./Carrusel/CarruselBenefitsSwiper")
);
const Carrusel = ({ which, data, items }) => {
    const getCarrusel = () => {
        switch (which) {
            case "CarruselBenefitsInifinite":
                return <CarruselBenefitsInifinite data={data} items={items} />;
            case "CarruselBenefitsInifinite2dn1":
                return <CarruselBenefitsInifinite2dn1 data={data} items={items} />;
            case "CarruselBenefitsPaani":
                return <CarruselBenefitsPaani data={data} items={items} />;
            case "CarruselBenefitsSimple":
                return <CarruselBenefitsSimple data={data} items={items} />;
            case "CarruselBananaLab":
                return <CarruselBananaLab data={data} items={items} />;
            case "CarruselBenefitsSwiper":
                return <CarruselBenefitsSwiper data={data} items={items} />;

            default:
                return (
                    <div className="w-full px-[5%] replace-max-w-here p-4 mx-auto">
                        - No Hay componente <b>{which}</b> -
                    </div>
                );
        }
    };
    return getCarrusel();
};

export default Carrusel;
