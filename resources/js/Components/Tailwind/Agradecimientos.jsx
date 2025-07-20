import React from "react"

const AgradecimientoSF = React.lazy(() => import('./Agradecimiento/AgradecimientoSF'))
const AgradecimientoAko = React.lazy(() => import('./Agradecimiento/AgradecimientoAko'))

const Agradecimientos = ({ data, which, items, contacts }) => {
    const getAgradecimiento = () => {
        switch (which) {
            case 'AgradecimientoSF':
                return <AgradecimientoSF data={data} contacts={contacts} items={items} />
            case 'AgradecimientoAko':
                return <AgradecimientoAko data={data} contacts={contacts} items={items} />

            default:
                return <div className="w-full px-[5%] replace-max-w-here p-4 mx-auto">- No Hay componente <b>{which}</b> -</div>
        }
    }
    return getAgradecimiento()
}

export default Agradecimientos;