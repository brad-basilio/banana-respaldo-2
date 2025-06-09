import React from "react";

const BrandMakita = React.lazy(() => import("./Brands/BrandMakita"));

const Brands = ({
    data,
    items,
    which,
    headerPosts,
    filteredData,
    postsLatest,
}) => {
    const getBrand = () => {
        switch (which) {
            case "BrandMakita":
                return <BrandMakita data={data} headerPosts={headerPosts} postsLatest={postsLatest} filteredData={filteredData} />
           
            default:
                return <div>No hay componente {which}</div>;
        }
    };

    return getBrand();
};

export default Brands;
