import React from 'react';

export default function BlogPostCard({ data, flex = false, post, featured = false }) {

  return (
    
    <article className={`group relative font-title ${featured ? "h-full" : ""}`}>
      <a href={`/post/${post?.slug}`} className={`block ${flex && "flex gap-4 "}`}>
        <div
          className={`relative aspect-[3/2] overflow-hidden rounded-lg ${flex && "w-1/2"
            } `}
        >
          <img
            src={`/storage/images/post/${post?.image}`}
            alt={post?.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 w-full`}
          />
        </div>
        <div className={`flex flex-col justify-center py-2 space-y-1 ${flex && "w-1/2 mt-0 gap-1"}`}>
          <span className="customtext-neutral-light opacity-90 font-semibold text-base 2xl:text-lg line-clamp-1 ">
            {post?.category.name}
          </span>
          <h3 className="text-base md:text-lg xl:text-xl line-clamp-3 lg:line-clamp-4 2xl:text-2xl font-semibold customtext-neutral-dark group-hover:customtext-primary leading-tight">
            {post?.name}
          </h3>
          <p className="line-clamp-3  customtext-neutral-dark opacity-85 text-sm md:text-base font-title 2xl:text-xl !leading-snug">
            {post?.summary}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <time>{post?.post_date}</time>
            {
              data?.['bool:show_seen'] && <>
                <i className="mdi mdi-circle-medium"></i>
                <span>Leído hace 5 minutos</span>
              </>
            }
          </div>
        </div>
      </a>
    </article>
  );
}
