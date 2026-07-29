import ClientApp from './client-app'
import { Suspense } from 'react'

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return <Suspense fallback={null}><ClientApp /></Suspense>
}
