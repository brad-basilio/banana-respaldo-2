import React, { lazy } from "react";

const BannerSimple = lazy(() => import("./Banners/BannerSimple"));
const BannerAd = lazy(() => import("./Banners/BannerAd"));
const BannerFullWidth = lazy(() => import("./Banners/BannerFullWidth"));
const BannerFlex = lazy(() => import("./Banners/BannerFlex"));
const BannerPublicitario = lazy(() => import("./Banners/BannerPublicitario"));
const BannerPostSuscriptionPaani = lazy(() => import("./Banners/BannerPostSuscriptionPaani"));
const BannerStatic = lazy(() => import("./Banners/BannerStatic"));
const BannerStaticSecond = lazy(() => import("./Banners/BannerStaticSecond"));
const BannerSimpleSF = lazy(() => import("./Banners/BannerSimpleSF"));
const BannerBananaLab = lazy(() => import("./Banners/BannerBananaLab"));
const BannerCTAMakita = lazy(() => import("./Banners/BannerCTAMakita"));
const BannerContactMakita = lazy(() => import("./Banners/BannerContactMakita"));
const Banner = ({ which, data, items }) => {
    const getBanner = () => {
        switch (which) {
            case "BannerSimple":
                return <BannerSimple data={data} />;
            case "BannerAd":
                return <BannerAd data={data} />;
            case "BannerPublicitario":
                return <BannerPublicitario data={data} />;
            case "BannerPostSuscriptionPaani":
                return <BannerPostSuscriptionPaani data={data} items={items} />;
            case "BannerFullWidth":
                return <BannerFullWidth data={data} />;
            case "BannerFlex":
                return <BannerFlex data={data} />;
            case "BannerStatic":
                return <BannerStatic data={data} items={items} />;
            case "BannerSimpleSF":
                return <BannerSimpleSF data={data} />;
            case "BannerBananaLab":
                return <BannerBananaLab data={data} />;
            case "BannerCTAMakita":
                return <BannerCTAMakita data={data} items={items} />;
            case "BannerContactMakita":
                return <BannerContactMakita data={data} />;
            case "BannerStaticSecond":
                return <BannerStaticSecond data={data} items={items} />;


            default:
                return (
                    <div className="w-full px-[5%] replace-max-w-here p-4 mx-auto">
                        - No Hay componente <b>{which}</b> -
                    </div>
                );
        }
    };
    return getBanner();
};

export default Banner;
