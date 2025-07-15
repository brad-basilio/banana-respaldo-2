import React, { useState, useEffect, useRef } from "react";
import Global from "../../../Utils/Global";
import ItemsRest from "../../../Actions/ItemsRest";
import Number2Currency from "../../../Utils/Number2Currency";


const itemsRest = new ItemsRest()

const HeaderSimple = ({ data, cart, setCart, pages, generals }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchModalRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const totalCount = cart.reduce((acc, item) => {
    return Number(acc) + Number(item.quantity)
  }, 0)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchModalRef.current && !searchModalRef.current.contains(event.target)) {
        setSearchModalOpen(false);
      }
    };

    if (searchModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchModalOpen]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      itemsRest.paginate({
        filter: [
          ['name', 'contains', searchQuery], 'or',
          ['summary', 'contains', searchQuery], 'or',
          ['description', 'contains', searchQuery]
        ]
      })
        .then(({ data }) => {
          if (!data) return setSearchResults([])
          setSearchResults(data)
        })
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery('')
  }, [searchModalOpen])

  const getContact = (correlative) => {
    return (
        contacts.find((contact) => contact.correlative === correlative)
            ?.description || ""
      );
  };

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
                  className="text-white hover:text-orange-400 font-title transition-colors duration-200 text-sm md:text-base 2xl:text-xl font-medium border-b-[3px] border-transparent hover:border-b-orange-400"
                >
                  {page.name}
                </a>
              ))}
          </nav>


          {/* Action Icons */}
          <div className="flex items-center space-x-3">
            
            {/* Icon mail */}
            <a href="mailto:{getContact('email_contact')}" >
              <button className="hidden lg:flex bg-orange-500 hover:bg-orange-600 rounded-full w-10 h-10 items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M1.66699 5L7.42784 8.26414C9.55166 9.4675 10.449 9.4675 12.5728 8.26414L18.3337 5" stroke="white" stroke-width="1.25" stroke-linejoin="round"/>
                  <path d="M1.68013 11.23C1.73461 13.7847 1.76185 15.0619 2.70446 16.0082C3.64706 16.9543 4.95893 16.9872 7.58268 17.0532C9.19974 17.0938 10.8009 17.0938 12.418 17.0532C15.0417 16.9872 16.3536 16.9543 17.2962 16.0082C18.2388 15.0619 18.2661 13.7847 18.3205 11.23C18.3381 10.4086 18.3381 9.59208 18.3205 8.77066C18.2661 6.21604 18.2388 4.93873 17.2962 3.99254C16.3536 3.04635 15.0417 3.01339 12.418 2.94747C10.8009 2.90683 9.19974 2.90683 7.58268 2.94746C4.95893 3.01338 3.64706 3.04633 2.70445 3.99253C1.76184 4.93873 1.73461 6.21603 1.68013 8.77066C1.66261 9.59208 1.66262 10.4086 1.68013 11.23Z" stroke="white" stroke-width="1.25" stroke-linejoin="round"/>
                </svg>
              </button>
            </a>

            {/* Icon phone*/}
            <a href="tel:{getContact('phone_contact')}" >
              <button className="hidden lg:flex bg-orange-500 hover:bg-orange-600 rounded-full w-10 h-10  items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.63188 4.76019L7.29633 4.00521C7.07693 3.51157 6.96723 3.26473 6.80317 3.07584C6.59756 2.83912 6.32956 2.66495 6.02973 2.57321C5.79049 2.5 5.52038 2.5 4.98017 2.5C4.18992 2.5 3.7948 2.5 3.46311 2.65191C3.07239 2.83085 2.71953 3.2194 2.57894 3.6255C2.45959 3.97024 2.49378 4.32453 2.56215 5.03308C3.28992 12.5752 7.42485 16.7101 14.9669 17.4378C15.6755 17.5062 16.0298 17.5404 16.3745 17.4211C16.7806 17.2805 17.1691 16.9276 17.3481 16.5369C17.5 16.2052 17.5 15.8101 17.5 15.0198C17.5 14.4796 17.5 14.2095 17.4268 13.9702C17.335 13.6704 17.1609 13.4024 16.9241 13.1968C16.7353 13.0327 16.4885 12.9231 15.9948 12.7037L15.2398 12.3681C14.7052 12.1305 14.4379 12.0117 14.1663 11.9859C13.9063 11.9612 13.6442 11.9977 13.4009 12.0924C13.1466 12.1914 12.922 12.3787 12.4725 12.7532C12.0251 13.126 11.8015 13.3124 11.5281 13.4122C11.2858 13.5007 10.9655 13.5336 10.7103 13.4959C10.4224 13.4535 10.202 13.3358 9.76105 13.1001C8.38938 12.3671 7.63294 11.6107 6.89989 10.2389C6.66428 9.79808 6.54648 9.57758 6.50406 9.28975C6.46645 9.0345 6.49923 8.71417 6.58775 8.47192C6.6876 8.19857 6.87401 7.97488 7.24682 7.5275C7.62135 7.07807 7.80861 6.85335 7.90762 6.59909C8.00237 6.35578 8.03885 6.09367 8.01412 5.83373C7.98828 5.5621 7.86948 5.2948 7.63188 4.76019Z" stroke="white" stroke-width="1.25" stroke-linecap="round"/>
                </svg>
              </button>
            </a>

            {/* Icon search */}
            <button
              className="relative bg-orange-500 hover:bg-orange-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              onClick={() => setSearchModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.167 14.167L17.5003 17.5003" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667Z" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
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

       {/* Modal de búsqueda */}
       {searchModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div ref={searchModalRef} className="bg-white w-full max-w-xl rounded-lg shadow-xl mx-4">
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Estoy buscando (mínimo 2 caracteres)..."
                className="w-full p-3 px-4 bg-transparent focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <i className="mdi mdi-close text-xl"></i>
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {searchResults.map((result) => (
                <a
                  href={`/${data?.path_product}/${result.slug}`}
                  key={result.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-2 items-center border-t"
                >
                  <img
                    src={`/storage/images/item/${result.image}`}
                    className="h-10 aspect-[4/3] rounded"
                    alt={result.name}
                    onError={e => e.target.src = '/api/cover/thumbnail/null'} />
                  <div className="w-[calc(100%-60px)]">
                    <h3 className="font-bold truncate w-full">{result.name}</h3>
                    <h3 className="text-nowrap text-sm font-bold">
                      S/ {Number2Currency(result.final_price)}
                      {result?.discount_percent > 0 && <span className="ms-1 line-through text-gray-500 font-normal text-xs">{result.price}</span>}
                    </h3>
                    <p className="text-sm text-gray-600">{result.summary}</p>
                  </div>
                </a>
              ))}

              {searchQuery.length > 2 && searchResults.length === 0 && (
                <div className="p-4 text-center text-gray-500 border-t">
                  No se encontraron resultados para "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default HeaderSimple
