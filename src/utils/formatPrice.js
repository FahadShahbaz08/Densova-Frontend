/**
 * Format a numeric price as USD with optional locale override.
 */
export function formatPrice(value, locale = 'en-US', currency = 'USD') {
  const number = typeof value === 'number' ? value : Number(value || 0)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)
}
