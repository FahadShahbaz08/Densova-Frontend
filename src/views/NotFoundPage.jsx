import SEOHead from '../components/common/SEOHead'

export default function NotFoundPage() {
  return (
    <>
      <SEOHead title="404 — Page Not Found" noIndex />
      <section className="section" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <div className="container-sm">
          <div className="eyebrow" style={{ justifyContent: 'center', marginBottom: 24 }}>
            <span className="line" />Error 404<span className="line" />
          </div>
          <h1 className="section-title" style={{ marginBottom: 24 }}>
            Lost in the <em>garden</em>
          </h1>
          <p style={{ color: 'var(--muted)', marginBottom: 32 }}>
            This page doesn’t exist — or has wandered off to bloom elsewhere.
          </p>
          <a href="/" className="btn btn-gold">
            Back to Home
            <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    </>
  )
}
