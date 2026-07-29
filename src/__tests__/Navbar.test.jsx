import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from './helpers/renderWithProviders'
import Navbar from '../components/sections/Navbar'

describe('Navbar', () => {
  it('renders brand name', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByText('Densova')).toBeInTheDocument()
  })

  it('renders main nav links', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('link', { name: /shop/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /the ritual/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ingredients/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /reviews/i })).toBeInTheDocument()
  })

  it('shows cart badge with item count', () => {
    renderWithProviders(<Navbar />, {
      preloadedState: {
        cart: { items: [{ id: 1, qty: 3, price: 10, name: 'X', slug: 'x' }] },
      },
    })
    const cartButton = screen.getByRole('button', { name: /^cart$/i })
    expect(cartButton).toHaveTextContent('3')
    expect(cartButton.querySelector('.cart-badge')).toHaveClass('active')
  })

  it('does NOT show badge when cart is empty', () => {
    renderWithProviders(<Navbar />)
    const cartButton = screen.getByRole('button', { name: /^cart$/i })
    expect(cartButton).toHaveTextContent('0')
    expect(cartButton.querySelector('.cart-badge')).not.toHaveClass('active')
  })
})
