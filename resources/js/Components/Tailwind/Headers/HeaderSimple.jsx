import React, { useState } from "react";
import Global from "../../../Utils/Global";


const HeaderSimple = ({ data, cart, setCart, pages }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const totalCount = cart.reduce((acc, item) => {
    return Number(acc) + Number(item.quantity)
  }, 0)

  return (
    <>
      <section className={`bg-primary text-white shadow-lg z-20 ${data?.class}`}>
        <header className="px-[5%] replace-max-w-here mx-auto flex p-4 justify-between items-center">
          {/* Logo Section */}
          <a href="/">
            <img className="h-12 md:h-14 aspect-[13/4] object-contain object-center w-auto" src={`/assets/resources/logo.png?v=${crypto.randomUUID()}`} alt={Global.APP_NAME} onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/img/logo-bk.svg';
            }} />
          </a>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-8 font-font-general">
            {pages
              .filter((x) => x.menuable)
              .map((page, index) => (
                <a
                  key={index}
                  href={page.pseudo_path || page.path}
                  className="text-white hover:text-orange-400 font-title transition-colors duration-200 text-sm font-medium border-b-[3px] border-transparent hover:border-b-orange-400"
                >
                  {page.name}
                </a>
              ))}
          </nav>


          {/* Action Icons */}
          <div className="flex items-center space-x-3">
            {/* Desktop Search Icon */}
            <button className="hidden lg:flex bg-orange-500 hover:bg-orange-600 rounded-full w-10 h-10 items-center justify-center transition-colors">
              <i className="mdi mdi-magnify text-white text-lg"></i>
            </button>

            {/* Mobile Search Icon */}
            <button className="lg:hidden bg-orange-500 hover:bg-orange-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors">
              <i className="mdi mdi-magnify text-white text-lg"></i>
            </button>

            {/* Account Icon */}
            <button className="bg-orange-500 hover:bg-orange-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors">
              <i className="mdi mdi-account-outline text-white text-lg"></i>
            </button>

            {/* Cart Icon */}
            <button
              className="relative bg-orange-500 hover:bg-orange-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              onClick={() => setModalOpen(true)}
            >
              {totalCount > 0 && (
                <span className="flex items-center justify-center absolute w-max px-1 h-4 min-w-4 -right-1 -top-1 bg-red-500 text-xs text-white rounded-full">
                  <span>{totalCount}</span>
                </span>
              )}
              <i className="mdi mdi-cart-outline text-white text-lg"></i>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden bg-gray-700 hover:bg-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={`mdi ${mobileMenuOpen ? "mdi-close" : "mdi-menu"} text-white text-lg`}></i>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 bg-gray-800">
            <nav className="px-[5%] py-4">
              {/* Mobile Menu Items */}
              <div className="flex flex-col space-y-3">
                {pages
                  .filter((x) => x.menuable)
                  .map((page, index) => (
                    <a
                      key={index}
                      href={page.pseudo_path || page.path}
                      className="font-title text-white hover:text-orange-400 transition-colors duration-200 font-medium py-2 px-2 border-l-4 border-transparent hover:border-l-orange-400"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {page.name}
                    </a>
                  ))}
              </div>
            </nav>
          </div>
        )}
      </section>
    </>
  )
}

export default HeaderSimple
