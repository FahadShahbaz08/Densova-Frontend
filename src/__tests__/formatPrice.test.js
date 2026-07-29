import { describe, it, expect } from 'vitest'
import { formatPrice } from '../utils/formatPrice'

describe('formatPrice', () => {
  it('formats numeric values as USD by default', () => {
    expect(formatPrice(49.99)).toBe('$49.99')
    expect(formatPrice(120)).toBe('$120.00')
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('parses string numbers', () => {
    expect(formatPrice('58.50')).toBe('$58.50')
  })

  it('handles undefined/null gracefully', () => {
    expect(formatPrice(undefined)).toBe('$0.00')
    expect(formatPrice(null)).toBe('$0.00')
  })
})
