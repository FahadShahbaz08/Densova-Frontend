import { useEffect } from 'react'
import { useLocation } from '../router'

import SEOHead from '../components/common/SEOHead'
import { useReveal } from '../hooks/useReveal'

import ScrollProgress from '../components/sections/ScrollProgress'
import AnnouncementBar from '../components/sections/AnnouncementBar'
import Navbar from '../components/sections/Navbar'
import Hero from '../components/sections/Hero'
import QuoteBand from '../components/sections/QuoteBand'
import MarqueeBand from '../components/sections/MarqueeBand'
import Collection from '../components/sections/Collection'
import Feature from '../components/sections/Feature'
import Ingredients from '../components/sections/Ingredients'
import HowToUse from '../components/sections/HowToUse'
import Purity from '../components/sections/Purity'
import Results from '../components/sections/Results'
import Reviews from '../components/sections/Reviews'
import Newsletter from '../components/sections/Newsletter'
import FAQ from '../components/sections/FAQ'
import Footer from '../components/sections/Footer'
import CartDrawer from '../components/sections/CartDrawer'
import BackToTop from '../components/sections/BackToTop'
import Toast from '../components/sections/Toast'
import WhatsAppFloat from '../components/sections/WhatsAppFloat'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5173'

export default function HomePage() {
  useReveal()
  const location = useLocation()

  // When user arrives with a #hash (e.g. coming from /shop/slug → /#shop),
  // React Router doesn't auto-scroll to the anchor. Wait one tick for sections
  // to mount, then scroll to the target element.
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    // Try a few times in case the target section is still mounting
    let attempts = 0
    const tick = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (attempts < 8) {
        attempts++
        setTimeout(tick, 80)
      }
    }
    setTimeout(tick, 60)
  }, [location.hash])

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Densova',
    url: SITE_URL,
    description: 'Advanced Herbal Hair Infusion — botanical hair rituals, slow-pressed in small batches.',
    sameAs: ['https://instagram.com/densova'],
  }

  return (
    <>
      <SEOHead
        title={null}
        description="Densova — Advanced Herbal Hair Infusion. Eight botanicals, slow-pressed in small batches. Strength, growth, repair — inspired by nature."
        url={SITE_URL}
        jsonLd={orgJsonLd}
      />

      <ScrollProgress />
      <AnnouncementBar />
      <Navbar />

      <main>
        <Hero />
        <QuoteBand />
        <MarqueeBand />
        <Collection />
        <Feature />
        <Ingredients />
        <HowToUse />
        <Purity />
        <Results />
        <Reviews />
        <Newsletter />
        <FAQ />
      </main>

      <Footer />
      <CartDrawer />
      <BackToTop />
      <Toast />
      <WhatsAppFloat />
    </>
  )
}
