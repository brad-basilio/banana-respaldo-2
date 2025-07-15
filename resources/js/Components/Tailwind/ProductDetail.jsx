import React from "react"



const ProductDetailSimple = React.lazy(() => import('./ProductDetails/ProductDetailSimple'))
const ProductDetailB = React.lazy(() => import('./ProductDetails/ProductDetailB'))
const ScrapingProductDetail = React.lazy(() => import('./Scraping/ScrapingProductDetail'))
const ProductDetailSF = React.lazy(() => import('./ProductDetails/ProductDetailSF'))
const ProductDetailBananaLab = React.lazy(() => import('./ProductDetails/ProductDetailBananaLab'))
const ProductDetailKuchara = React.lazy(() => import('./ProductDetails/ProductDetailKuchara'))
const ProductDetailPaani = React.lazy(() => import('./ProductDetails/ProductDetailPaani'))
const ProductDetailAko = React.lazy(() => import('./ProductDetails/ProductDetailAko'))

const ProductDetail = ({ which, item, cart, setCart,data, generals = [],favorites,setFavorites, textstatic, contacts }) => {
  
  const getProductDetail = () => {
    switch (which) {
      case 'ProductDetailSimple':
        return <ProductDetailSimple item={item} cart={cart} setCart={setCart} />
      case 'ProductDetailB':
        return <ProductDetailB item={item} cart={cart} setCart={setCart} data={data} generals={generals} />
      case 'ScrapingProductDetail':
        return <ScrapingProductDetail cart={cart} setCart={setCart} />
      case 'ProductDetailSF':
        return <ProductDetailSF item={item} cart={cart} setCart={setCart} textstatic={textstatic} contacts={contacts} />
      case 'ProductDetailBananaLab':
          return <ProductDetailBananaLab item={item} cart={cart} setCart={setCart} />
      case 'ProductDetailKuchara':
          return <ProductDetailKuchara item={item} cart={cart} setCart={setCart} />
      case 'ProductDetailPaani':
          return <ProductDetailPaani item={item} cart={cart} setCart={setCart} generals={generals} favorites={favorites} setFavorites={setFavorites} />
      case 'ProductDetailAko':
          return <ProductDetailAko item={item} cart={cart} setCart={setCart} textstatic={textstatic} contacts={contacts} />
      default:
        return <div className="w-full px-[5%] replace-max-w-here p-4 mx-auto">- No Hay componente <b>{which}</b> -</div>
    }
  }
  return getProductDetail()
}

export default ProductDetail