import React from "react";

const TopBarSimple = React.lazy(() => import("./TopBars/TopBarSimple"));
const TopBarSocials = React.lazy(() => import("./TopBars/TopBarSocials"));
const TopBarCart = React.lazy(() => import("./TopBars/TopBarCart"));
const TopBarCopyright = React.lazy(() => import("./TopBars/TopBarCopyright"));
const TopBarCopyrightSocials = React.lazy(() =>
    import("./TopBars/TopBarCopyrightSocials")
);

const TopBar = ({ data, which, items, setCart, cart, isUser }) => {
    const getTopBar = () => {
        switch (which) {
            case "TopBarSimple":
                return <TopBarSimple key="TopBarSimple" data={data}/>;
            case "TopBarSocials":
                return <TopBarSocials key="TopBarSocials" items={items} data={data}/>;
            case "TopBarCart":
                return (
                    <TopBarCart
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        isUser={isUser}
                    />
                );
            case "TopBarCopyright":
                return (
                    <TopBarCopyright
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        isUser={isUser}
                    />
                );
            case "TopBarCopyrightSocials":
                return (
                    <TopBarCopyrightSocials
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        isUser={isUser}
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
    return getTopBar();
};

export default TopBar;
