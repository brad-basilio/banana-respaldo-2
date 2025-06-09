import React from "react";

const BlogSimple = React.lazy(() => import("./Blogs/BlogSimple"));
const BlogCarousel = React.lazy(() => import("./Blogs/BlogCarousel"));
const BlogCarruselBananaLab = React.lazy(() => import("./Blogs/BlogCarruselBananaLab"));
const BlogSectionMakita = React.lazy(() => import("./Blogs/BlogSectionMakita"));

const Blog = ({
    data,
    items,
    which,
    headerPosts,
    filteredData,
    postsLatest,
}) => {
    const getBlog = () => {
        switch (which) {
            case "BlogSimple":
                return <BlogSimple data={data} headerPosts={headerPosts} postsLatest={postsLatest} filteredData={filteredData} />
            case "BlogCarousel":
                return <BlogCarousel data={data} items={items} />;
            case "BlogCarruselBananaLab":
                return <BlogCarruselBananaLab data={data} items={items} />
           case "BlogSectionMakita":
                return <BlogSectionMakita data={data} items={items} />
                default:
                return <div>No hay componente {which}</div>;
        }
    };

    return getBlog();
};

export default Blog;
