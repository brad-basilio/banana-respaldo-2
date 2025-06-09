import React from "react";

const FooterSimple = React.lazy(() => import("./Footer/FooterSimple"));
const FooterSimpleCallToAction = React.lazy(() =>
    import("./Footer/FooterSimpleCallToAction")
);
const FooterCallToAction = React.lazy(() =>
    import("./Footer/FooterCallToAction")
);
const FooterPaani = React.lazy(() => import("./Footer/FooterPaani"));
const FooterB = React.lazy(() => import("./Footer/FooterB"));
const FooterTermsCTASocials = React.lazy(() => import("./Footer/FooterTermsCTASocials"));
const FooterSalaFabulosa = React.lazy(() => import("./Footer/FooterSalaFabulosa"));
const FooterBananaLab = React.lazy(() => import("./Footer/FooterBananaLab"));
const FooterPideloPe = React.lazy(() => import("./Footer/FooterPideloPe"));
const FooterMakita = React.lazy(() => import("./Footer/FooterMakita"));

const Footer = ({ data, which, items, pages, generals, contacts }) => {
    const getFooter = () => {
        switch (which) {
            case "FooterSimpleCallToAction":
                return (
                    <FooterSimpleCallToAction
                        socials={items}
                        pages={pages}
                        generals={generals}
                    />
                );
            case "FooterCallToAction":
                return (
                    <FooterCallToAction
                        socials={items}
                        pages={pages}
                        generals={generals}
                    />
                );
            case "FooterSimple":
                return (
                    <FooterSimple
                        socials={items}
                        pages={pages}
                        generals={generals}
                    />
                );
            case "FooterB":
                return (
                    <FooterB
                        socials={items}
                        pages={pages}
                        generals={generals}
                    />
                );
                case "FooterPaani":
                return (
                    <FooterPaani
                    data={data}
                        socials={items}
                        pages={pages}
                        generals={generals}
                    />
                );
            case "FooterTermsCTASocials":
                return (
                    <FooterTermsCTASocials
                    data={data}
                        socials={items}
                        pages={pages}
                        generals={generals}
                    />
                );
            case "FooterSalaFabulosa":
                return (
                    <FooterSalaFabulosa
                        socials={items}
                        pages={pages}
                        generals={generals}
                        contacts={contacts}
                    />
                );
            case "FooterPideloPe":
                return (
                    <FooterPideloPe
                        socials={items}
                        pages={pages}
                        generals={generals}
                    />
                );
            case "FooterBananaLab":
                return (
                    <FooterBananaLab
                        socials={items}
                        pages={pages}
                        generals={generals}
                        contacts={contacts}
                    />
                );
            case "FooterMakita":
                return (
                    <FooterMakita
                        socials={items}
                        pages={pages}
                        generals={generals}
                    />
                );
            default:
                return (
                    <div className="w-full px-[5%] replace-max-w-here p-4 mx-auto">
                        - No Hay componente <b>{which}</b> -
                    </div>
                );
        }
    };
    return getFooter();
};

export default Footer;
