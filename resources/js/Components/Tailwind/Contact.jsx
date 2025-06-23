import React from "react"

const ContactSimple = React.lazy(() => import('./Contact/ContactSimple'))
const ContactGrid = React.lazy(() => import('./Contact/ContactGrid'))
const ContactAko = React.lazy(() => import('./Contact/ContactAko'))
const Contact = ({ which, data, contacts, setContact }) => {
  const getContact = () => {
    switch (which) {
      case 'ContactSimple':
        return <ContactSimple data={data} contacts={contacts} setContact={setContact} />
      case 'ContactGrid':
        return <ContactGrid data={data} contacts={contacts} setContact={setContact} />
      case 'ContactAko':
        return <ContactAko data={data} contacts={contacts} setContact={setContact} />
      default:
        return <div className="w-full px-[5%] replace-max-w-here p-4 mx-auto">- No Hay componente <b>{which}</b> -</div>
    }
  }
  return getContact()
}

export default Contact