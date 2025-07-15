import React from "react";

const HeaderContact = React.lazy(() => import("./Headers/HeaderContact"));
const HeaderSearchContact = React.lazy(() =>
    import("./Headers/HeaderSearchContact")
);
const HeaderSearch = React.lazy(() => import("./Headers/HeaderSearch"));
const HeaderSimple = React.lazy(() => import("./Headers/HeaderSimple"));
const HeaderSearchB = React.lazy(() => import("./Headers/HeaderSearchB"));
const HeaderBananaLab = React.lazy(() => import("./Headers/HeaderBananaLab"));
const HeaderSearchMenu = React.lazy(() => import("./Headers/HeaderSearchMenu"));
const HeaderSearchMenuSF = React.lazy(() =>
    import("./Headers/HeaderSearchMenuSF")
);
const HeaderScraping = React.lazy(() =>
    import("./Scraping/Components/HeaderScraping")
);
const HeaderMakita = React.lazy(() => import("./Headers/HeaderMakita"));

const Header = ({
    data,
    which,
    items,
    generals = [],
    cart,
    setCart,
    pages,
    isUser,
    headerPosts,
    contacts,
}) => {
    const getHeader = () => {
        switch (which) {
            case "HeaderContact":
                return (
                    <HeaderContact
                        items={items}
                        generals={generals}
                        cart={cart}
                        setCart={setCart}
                        pages={pages}
                    />
                );
            case "HeaderSearch":
                return (
                    <HeaderSearch
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        pages={pages}
                    />
                );
            case "HeaderSearchContact":
                return (
                    <HeaderSearchContact
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        pages={pages}
                    />
                );
            case "HeaderSearchB":
                return (
                    <HeaderSearchB
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        pages={pages}
                        isUser={isUser}
                        generals={generals}
                    />
                );
             case "HeaderMakita":
                return (
                    <HeaderMakita
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        pages={pages}
                        isUser={isUser}
                        generals={generals}
                    />
                );
            case "HeaderBananaLab":
                return (
                    <HeaderBananaLab
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        pages={pages}
                        isUser={isUser}
                        generals={generals}
                    />
                );
            case "HeaderSearchMenu":
                return (
                    <HeaderSearchMenu
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        pages={pages}
                        isUser={isUser}
                    />
                );
            case "HeaderSearchMenuSF":
                return (
                    <HeaderSearchMenuSF
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        pages={pages}
                        isUser={isUser}
                        headerPosts={headerPosts}
                        contacts={contacts}
                    />
                );
            case "HeaderScraping":
                return (
                    <HeaderScraping
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        pages={pages}
                        isUser={isUser}
                    />
                );
            case "HeaderSimple":
                return (
                    <HeaderSimple
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        pages={pages}
                        isUser={isUser}
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
    return getHeader();
};

export default Header;
