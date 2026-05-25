import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartProvider, useCart } from './CartProvider'

function TestConsumer() {
  const { items, addItem, removeItem, total, count } = useCart()
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      <span data-testid="qty">{count}</span>
      <span data-testid="total">{total}</span>
      <button onClick={() => addItem({ id: 'p1', name: 'Test', price: 5, image: '', size: 'A4' })}>add</button>
      <button onClick={() => removeItem('p1', 'A4')}>remove</button>
    </div>
  )
}

describe('CartProvider', () => {
  it('starts empty', () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('adds an item', async () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    await userEvent.click(screen.getByText('add'))
    expect(screen.getByTestId('count').textContent).toBe('1')
  })

  it('removes an item', async () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    await userEvent.click(screen.getByText('add'))
    await userEvent.click(screen.getByText('remove'))
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('calculates total correctly', async () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    await userEvent.click(screen.getByText('add'))
    expect(screen.getByTestId('total').textContent).toBe('5')
  })

  it('increments qty when same id+size added twice', async () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    await userEvent.click(screen.getByText('add'))
    await userEvent.click(screen.getByText('add'))
    expect(screen.getByTestId('count').textContent).toBe('1') // still 1 unique item
    expect(screen.getByTestId('qty').textContent).toBe('2')   // but qty is 2
  })
})
