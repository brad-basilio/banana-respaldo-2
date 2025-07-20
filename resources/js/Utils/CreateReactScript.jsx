import { createInertiaApp } from '@inertiajs/react'
import { Cookies, FetchParams } from 'sode-extend-react'
import Global from './Global';
import 'swiper/css'
import 'tippy.js/dist/tippy.css'
import General from './General';
import LaravelSession from './LaravelSession';

let roles = [];
export const hasRole = (...rolesIn) => {
  const roles2validate = []
  if (Array.isArray(rolesIn)) {
    roles2validate.push(...rolesIn)
  } else {
    roles2validate.push(rolesIn)
  }
  return Boolean(roles.find(x => roles2validate.includes(x.name)))
}

const CreateReactScript = (render) => {

  createInertiaApp({
    resolve: name => `/${name}.jsx`,
    setup: ({ el, props }) => {
      const properties = props.initialPage.props
      if (properties?.global) {
        for (const name in properties.global) {
          Global.set(name, properties.global[name])
        }
      }
      if (properties?.generals) {
        for (const key in properties.generals) {
          const { correlative, description } = properties.generals[key]
          General.set(correlative, description)
        }
      }
      const session = { ...properties?.session }
      for (const key in session) {
        LaravelSession.set(`${key}`, session[key])
      }
      const can = (page, ...keys) => {
        const keys2validate = []
        if (Array.isArray(page)) {
          for (const p of page) {
            keys2validate.push(...keys.map(x => `${p}.${x}`))
          }
        } else {
          keys2validate.push(...keys.map(x => `${page}.${x}`))
        }
        if (properties?.session?.permissions?.find(x => keys2validate.includes(x.name) || x.name == 'general.root')) return true
        const roles = properties?.session?.roles ?? []
        for (const rol of roles) {
          if (rol?.permissions?.find(x => keys2validate.includes(x.name) || x.name == 'general.root')) return true
        }
        return false
      }

      roles = properties?.session?.roles ?? []

      // const hasRole = (...rolesIn) => {
      //   const roles2validate = []
      //   if (Array.isArray(rolesIn)) {
      //     roles2validate.push(...rolesIn)
      //   } else {
      //     roles2validate.push(rolesIn)
      //   }
      //   const roles = properties?.session?.roles ?? []
      //   return Boolean(roles.find(x => roles2validate.includes(x.name)))
      // }

      FetchParams.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Xsrf-Token': decodeURIComponent(Cookies.get('XSRF-TOKEN'))
      }
      render(el, { ...properties, can, hasRole })

      if (Global.APP_ENV === 'local') {
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => {
          console.log(backdrop);
          if (!backdrop.textContent) {
            backdrop.remove();
          }
        });
      }
    },
  });
}

export default CreateReactScript