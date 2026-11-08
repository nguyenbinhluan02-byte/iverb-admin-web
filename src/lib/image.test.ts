import { describe, expect, it } from 'vitest'
import { fitSize } from './image'

describe('fitSize', () => {
  it('scales the long edge down to 1600, keeping the ratio', () => {
    expect(fitSize(4000, 2500)).toEqual({ width: 1600, height: 1000 })
    expect(fitSize(3000, 4000)).toEqual({ width: 1200, height: 1600 })
  })
  it('never upscales', () => {
    expect(fitSize(800, 500)).toEqual({ width: 800, height: 500 })
  })
})
