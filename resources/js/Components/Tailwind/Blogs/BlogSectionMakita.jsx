import React from "react";
import { motion } from "framer-motion";

const BlogSectionMakita = ({ data, items }) => {
    // Función para truncar texto
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    };

    // Preparar contenido HTML para extraer texto plano
    const getTextFromHTML = (html) => {
        if (!html) return '';
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    return (
        <section className="bg-white py-16 md:py-20">
            <div className="container mx-auto px-4 md:px-[5%]">
                {/* Center aligned header */}
                <div className="text-center mb-10 md:mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                        {data?.title || "Noticias sobre Makita"}
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">
                        {data?.description || "Duis dapibus congue velit, lobortis mollis nisi volutpat quis."}
                    </p>
                    <a 
                        href={data?.link_blog || "#blog"} 
                        className="inline-block bg-[#26a7b9] hover:bg-[#218999] text-white font-medium py-3 px-8 rounded-md transition-all duration-300"
                    >
                        {data?.button_text || "Ver blog"}
                    </a>
                </div>

                {/* Blog posts grid - 2x2 on desktop, 1 column on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    {items && items.slice(0, 4).map((post, index) => (
                        <article 
                            key={index}
                            className="flex flex-col md:flex-row gap-6 bg-white"
                        >
                            {/* Image container */}
                            <div className="w-full md:w-1/3">
                                <img
                                    src={`/storage/images/post/${post?.image}`}
                                    onError={e => e.target.src = '/assets/img/noimage/no_img.jpg'}
                                    alt={post?.name}
                                    className="w-full aspect-square object-cover"
                                />
                            </div>
                            
                            {/* Content */}
                            <div className="w-full md:w-2/3">
                                <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2">
                                    {post?.name || "Todo lo que puedes hacxer con tu Rotomartillo Inalámbrico"}
                                </h3>
                                
                                <p className="text-gray-600 line-clamp-3">
                                    {truncateText(getTextFromHTML(post?.description), 120) || 
                                    "Duis dapibus congue velit, lobortis mollis nisi volutpat quis. Nulla facilisi. Sed efficitur, eros ut tincidunt sagittis, magna sem mollis elit."}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogSectionMakita;