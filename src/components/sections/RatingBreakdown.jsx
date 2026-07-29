export default function RatingBreakdown({
  average = 0,
  total = 0,
  distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  onFilterRating,
  activeRating = null,
}) {
  return (
    <div className="rb">
      <div className="rb-aside">
        <div className="rb-score-row">
          <span className="rb-score">{Number(average || 0).toFixed(1)}</span>
          <span className="rb-score-out">/5</span>
        </div>
        <div className="rb-stars" aria-hidden="true">
          {[1, 2, 3, 4, 5].map(n => (
            <span key={n} className={n <= Math.round(average) ? 'on' : ''}>★</span>
          ))}
        </div>
        <div className="rb-total">
          {total.toLocaleString('en-PK')} verified review{total !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="rb-bars">
        {[5, 4, 3, 2, 1].map(star => {
          const count = distribution[star] || 0
          const pct = total > 0 ? (count / total) * 100 : 0
          const isActive = activeRating === star
          const isClickable = !!onFilterRating
          return (
            <button
              key={star}
              type="button"
              className={`rb-row${isActive ? ' active' : ''}${!isClickable ? ' static' : ''}`}
              onClick={() => isClickable && onFilterRating(isActive ? null : star)}
              disabled={!isClickable}
              aria-pressed={isActive}
            >
              <span className="rb-row-label">{star}</span>
              <span className="rb-row-star" aria-hidden="true">★</span>
              <span className="rb-row-bar">
                <span className="rb-row-fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="rb-row-count">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
