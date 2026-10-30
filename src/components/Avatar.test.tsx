import { fireEvent, render } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('shows initials without a photo', () => {
    const { container } = render(<Avatar name="Minh Anh" />)
    expect(container).toHaveTextContent('MA')
    expect(container.querySelector('img')).toBeNull()
  })

  it('shows the photo, and initials when it fails to load', () => {
    const { container } = render(<Avatar name="Minh Anh" src="https://example.com/a.png" />)
    const img = container.querySelector('img')!
    expect(img).toHaveAttribute('src', 'https://example.com/a.png')
    expect(container).not.toHaveTextContent('MA')

    fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    expect(container).toHaveTextContent('MA')
  })
})
