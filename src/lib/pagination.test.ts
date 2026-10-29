import { pageCount, pageItems, rangeLabel } from './pagination'

describe('pagination', () => {
  it('shows first, last and current ±1 with gaps', () => {
    expect(pageItems(1, 1)).toEqual([1])
    expect(pageItems(1, 4)).toEqual([1, 2, 'gap', 4])
    expect(pageItems(5, 12)).toEqual([1, 'gap', 4, 5, 6, 'gap', 12])
    expect(pageItems(3, 5)).toEqual([1, 2, 3, 4, 5])
    expect(pageItems(12, 12)).toEqual([1, 'gap', 11, 12])
  })

  it('page count and range', () => {
    expect(pageCount(0, 8)).toBe(1)
    expect(pageCount(17, 8)).toBe(3)
    expect(rangeLabel(1, 8, 42)).toBe('Showing 1–8 of 42')
    expect(rangeLabel(6, 8, 42)).toBe('Showing 41–42 of 42')
  })
})
