'use client'

import { Provider } from 'react-redux'
import { useEffect } from 'react'
import { hydrateStoreFromStorage, store } from '@/src/store'

export default function Providers({ children }) {
  useEffect(() => {
    hydrateStoreFromStorage()
  }, [])

  return <Provider store={store}>{children}</Provider>
}
