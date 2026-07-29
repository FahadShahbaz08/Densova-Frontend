'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const RouterContext = createContext(null)

function routeStateKey(path) {
  return `densova_route_state:${String(path).split('#')[0]}`
}

function saveRouteState(path, state) {
  if (typeof window === 'undefined' || state == null) return
  try {
    sessionStorage.setItem(routeStateKey(path), JSON.stringify(state))
  } catch {
    // Navigation still works when storage is unavailable.
  }
}

export function RouterProvider({ children, params = {}, outlet = null }) {
  const pathname = usePathname() || '/'
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState(null)
  const [hash, setHash] = useState('')
  const search = searchParams?.toString()

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash)
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [pathname])

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(routeStateKey(`${pathname}${search ? `?${search}` : ''}`))
      setState(saved ? JSON.parse(saved) : null)
    } catch {
      setState(null)
    }
  }, [pathname, search])

  const navigate = useCallback((to, options = {}) => {
    if (typeof to === 'number') {
      if (to < 0) router.back()
      else if (to > 0) router.forward()
      return
    }
    setState(options.state ?? null)
    saveRouteState(to, options.state)
    if (options.replace) router.replace(to)
    else router.push(to)
  }, [router])

  const value = useMemo(() => ({
    location: {
      pathname,
      search: search ? `?${search}` : '',
      hash,
      state,
    },
    navigate,
    outlet,
    params,
    setState,
  }), [hash, navigate, outlet, params, pathname, search, state])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

function useRouterContext() {
  const value = useContext(RouterContext)
  if (!value) throw new Error('Router hooks must be used inside RouterProvider')
  return value
}

export function useNavigate() {
  return useRouterContext().navigate
}

export function useLocation() {
  return useRouterContext().location
}

export function useParams() {
  return useRouterContext().params
}

export function Outlet() {
  return useRouterContext().outlet
}

export function Navigate({ to, replace = false, state = null }) {
  const navigate = useNavigate()
  useEffect(() => navigate(to, { replace, state }), [navigate, replace, state, to])
  return null
}

export function RouterLink({ to, state, replace = false, onClick, children, ...props }) {
  const { setState } = useRouterContext()
  return (
    <Link
      href={to}
      replace={replace}
      onClick={(event) => {
        setState(state ?? null)
        saveRouteState(to, state)
        onClick?.(event)
      }}
      {...props}
    >
      {children}
    </Link>
  )
}

export function NavLink({ to, end = false, className, children, ...props }) {
  const { pathname } = useLocation()
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className
  const resolvedChildren = typeof children === 'function' ? children({ isActive }) : children
  return <RouterLink to={to} className={resolvedClassName} {...props}>{resolvedChildren}</RouterLink>
}

export { RouterLink as Link }
