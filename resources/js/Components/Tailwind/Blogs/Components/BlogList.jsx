import BlogPostCard from "./BlogPostCard";
import { Loading } from "../../Components/Resources/Loading";
import { NoResults } from "../../Components/Resources/NoResult";

export default function BlogList({ data, posts, postsLatest, loading, isFilter }) {
  return (
    <section
      className={`font-paragraph ${isFilter ? "pb-16" : "pb-16"}`}
    >
      <div className="px-[5%]  mx-auto">
        {!isFilter ? (
          <div>
            <h2 className="text-3xl font-bold mb-4 font-title customtext-primary">
              {
                data?.second_title ? data?.second_title : 'Últimas publicaciones'
              }
            </h2>
            {
              data?.second_description &&
              <p className="text-gray-600 mb-8">
                Nam tempor diam quis urna maximus, ac laoreet arcu
                convallis. Aenean dignissim nec sem quis consequat.
              </p>
            }
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
              {Array.isArray(postsLatest) &&
                postsLatest.length > 0 ? (
                postsLatest.map((post, index) => (
                  <BlogPostCard data={data} key={index} post={post} />
                ))
              ) : (
                <div className="col-span-3 my-8">
                  <NoResults />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {loading ? (
              <div className="col-span-3 my-8">
                <Loading />
              </div>
            ) : Array.isArray(posts) && posts.length > 0 ? (
              posts.map((post, index) => (
                <BlogPostCard data={data} key={index} post={post} />
              ))
            ) : (
              <div className="col-span-3 my-8">
                <NoResults />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
