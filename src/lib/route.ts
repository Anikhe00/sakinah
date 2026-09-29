import { useEffect, useState } from 'react'

export type Route = { name: 'today' } | { name: 'log' } | { name: 'entry'; id: string }

function parse(hash: string): Route {
  const path = hash.replace(/^#/, '')
  const entry = /^\/log\/(.+)$/.exec(path)
  if (entry) return { name: 'entry', id: decodeURIComponent(entry[1]) }
  if (path === '/log') return { name: 'log' }
  return { name: 'today' }
}

export function hrefFor(route: Route): string {
  switch (route.name) {
    case 'today':
      return '#/'
    case 'log':
      return '#/log'
    case 'entry':
      return `#/log/${encodeURIComponent(route.id)}`
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
