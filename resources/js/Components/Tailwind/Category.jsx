import React from "react"


const CategorySimple = React.lazy(() => import('./Categories/CategorySimple'))
const CategoryOneLine = React.lazy(() => import('./Categories/CategoryOneLine'))
const CategoryPrettyGrid = React.lazy(() => import('./Categories/CategoryPrettyGrid'))
const CategoryCarousel = React.lazy(() => import('./Categories/CategoryCarousel'))
const InfiniteCategory = React.lazy(() => import('./Categories/InfiniteCategory'))
const PaginationCategory = React.lazy(() => import('./Categories/PaginationCategory'))
const CategoryFlex = React.lazy(() => import('./Categories/CategoryFlex'))
const CategoryGridInfinite = React.lazy(() => import('./Categories/CategoryGridInfinite'))
const CategoriesScraping = React.lazy(() => import('./Scraping/Components/CategoriesScraping'))
const CategoryBoxSwiper = React.lazy(() => import('./Categories/CategoryBoxSwiper'))

const Category = ({ which, data, items }) => {
  const getCategory = () => {
    switch (which) {
      case 'CategorySimple':
        return <CategorySimple data={data} items={items} />
      case 'CategoryOneLine':
        return <CategoryOneLine data={data} items={items} />
      case 'CategoryPrettyGrid':
        return <CategoryPrettyGrid data={data} items={items} />
      case 'CategoryCarousel':
        return <CategoryCarousel data={data} items={items} />
      case 'InfiniteCategory':
        return <InfiniteCategory data={data} items={items} />
      case 'PaginationCategory':
        return <PaginationCategory data={data} items={items} />
      case 'CategoryFlex':
        return <CategoryFlex data={data} items={items} />
      case 'CategoryGridInfinite':
        return <CategoryGridInfinite data={data} items={items} />
      case 'CategoriesScraping':
        return <CategoriesScraping data={data} items={items} />
      case 'CategoryBoxSwiper':
        return <CategoryBoxSwiper data={data} items={items} />
      default:
        return <div className="w-full px-[5%] replace-max-w-here p-4 mx-auto">- No Hay componente <b>{which}</b> -</div>
    }
  }
  return getCategory()
}

export default Category