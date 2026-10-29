import { colorFor, initials } from './avatar'

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('linh tran thi')).toBe('LT')
    expect(initials('  Quân ')).toBe('Q')
  })

  it('falls back to ?', () => {
    expect(initials('')).toBe('?')
    expect(initials(null)).toBe('?')
  })
})

describe('colorFor', () => {
  it('is stable for a name', () => {
    expect(colorFor('Linh Tran')).toBe(colorFor('Linh Tran'))
  })

  it('matches the design prototype', () => {
    expect(colorFor('')).toBe('#F2711C')
    expect(colorFor('A')).toBe('#1FA971') // 65 % 8 = 1
  })
})
