import React from "react"

const PartnerSimple = React.lazy(() => import('./Partner/PartnerSimple'))

const Partner = ({ 
  which, 
  items,  
  data 
}) => {
  const getPartner = () => {
    switch (which) {
      case 'PartnerSimple':
        return <PartnerSimple data={data} items={items} />
      default:
        return <div className="w-full px-[5%] replace-max-w-here p-4 mx-auto">- No Hay componente <b>{which}</b> -</div>
    }
  }
  return getPartner()
}

export default Partner;