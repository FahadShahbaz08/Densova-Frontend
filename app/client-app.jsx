'use client'

import App from '@/src/App'

export default function ClientApp({ initialProduct = null, initialReviewsData = null }) {
  return <App initialProduct={initialProduct} initialReviewsData={initialReviewsData} />
}
