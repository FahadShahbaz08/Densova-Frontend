import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, makeStore } from './helpers/renderWithProviders'
import { ProductCard } from '../components/sections/Collection'

const sample = {
  id: 7,
  name: 'Herbal Growth Infusion',
  slug: 'herbal-growth-infusion',
  benefits: ['Rosemary', 'Hibiscus', 'Amla'],
  price: 5800,
  category: 'hair-care',
  is_featured: true,
}

describe('ProductCard', () => {
  it('renders the product name and benefits', () => {
    renderWithProviders(<ProductCard product={sample} />)
    expect(screen.getByText(/Herbal Growth Infusion/i)).toBeInTheDocument()
    expect(screen.getByText(/Rosemary/)).toBeInTheDocument()
  })

  it('renders formatted price', () => {
    renderWithProviders(<ProductCard product={sample} />)
    expect(screen.getByText(/Rs 5,800/)).toBeInTheDocument()
  })

  it('shows a Bestseller ribbon when product is featured', () => {
    renderWithProviders(<ProductCard product={sample} />)
    expect(screen.getByText(/Bestseller/i)).toBeInTheDocument()
  })

  it('adds the product and opens the cart drawer', async () => {
    const user = userEvent.setup()
    const store = makeStore()
    renderWithProviders(<ProductCard product={sample} />, { store })

    await user.click(screen.getByRole('button', { name: /quick add .* infusion/i }))

    const state = store.getState()
    expect(state.cart.items).toHaveLength(1)
    expect(state.cart.items[0].id).toBe(7)
    expect(state.ui.cartDrawerOpen).toBe(true)
  })
})
