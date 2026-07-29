export default function StatCard({ label, value, sublabel, accent = 'forest' }) {
  const accentColor = accent === 'gold' ? 'text-gold-deep' : 'text-forest'
  return (
    <div className="bg-cream rounded-md p-6 border border-[var(--line-2)] shadow-soft-sm">
      <p className="text-[11px] tracking-[0.28em] uppercase text-muted font-medium mb-3">{label}</p>
      <p className={`font-display text-4xl font-light ${accentColor}`}>{value}</p>
      {sublabel && <p className="text-sm text-muted mt-2">{sublabel}</p>}
    </div>
  )
}
