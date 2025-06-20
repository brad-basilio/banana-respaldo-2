import React from "react";

const ProductCarousel = React.lazy(() => import("./Products/ProductCarousel"));
const ProductList = React.lazy(() => import("./Products/ProductList"));
const ProductSlider = React.lazy(() => import("./Products/ProductSlider"));
const ProductInfinite = React.lazy(() => import("./Products/ProductInfinite"));
const ProductNavigation = React.lazy(() => import("./Products/ProductNavigation"));
const ProductNavigationSwiper = React.lazy(() => import("./Products/ProductNavigationSwiper"));
const ProductNavigationSwiperSimple = React.lazy(() => import("./Products/ProductNavigationSwiperSimple"));
const ProductFeaturedSwiper = React.lazy(() => import("./Products/ProductFeaturedSwiper"));
const ProductBananaLab = React.lazy(() => import("./Products/ProductBananaLab"));
const ScrapingSimple = React.lazy(() => import("./Scraping/ScrapingSimple"));
const ProductMakita = React.lazy(() => import("./Products/ProductMakita"));

const Product = ({
    which,
    data,
    items,
    cart,
    setCart,
    pages,
    filteredData,
    favorites,
    setFavorites,
}) => {
    const getProduct = () => {
        switch (which) {
            case "Carousel":
                return (
                    <ProductCarousel
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                    />
                );
            case "List":
                return (
                    <ProductList
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                    />
                );
            case "ProductSlider":
                return (
                    <ProductSlider
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                    />
                );
            case "ProductInfinite":
                return (
                    <ProductInfinite
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                    />
                );
            case "ProductNavigation":
                return (
                    <ProductNavigation
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                    />
                );
            case "ProductNavigationSwiper":
                return (
                    <ProductNavigationSwiper
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                    />
                );
            case "ProductNavigationSwiperSimple":
                return (
                    <ProductNavigationSwiperSimple
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                    />
                );
            case "ProductFeaturedSwiper":
                return (
                    <ProductFeaturedSwiper
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                    />
                );
            case "ProductBananaLab":
                return (
                    <ProductBananaLab
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        favorites={favorites}   
                        setFavorites={setFavorites}
                    />
                );
            case "Scraping":
                return (
                    <ScrapingSimple
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
                        pages={pages}
                        filteredData={filteredData}
                    />
                );
            case "ProductMakita":
                return (
                    <ProductMakita
                        data={data}
                        items={items}
                        cart={cart}
                        setCart={setCart}
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
    return getProduct();
};

export default Product;
