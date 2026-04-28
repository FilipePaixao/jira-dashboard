import { describe, expect, it } from 'vitest'
import { medianOf, p85Of, percentileNearest } from './stat-helpers'

describe('stat-helpers', () => {
  it('mediana e P85', () => {
    expect(medianOf([1, 3, 2])).toBe(2)
    expect(percentileNearest([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 85)).not.toBeNull()
    expect(p85Of([3, 1, 2])).toBeCloseTo(2.7, 4)
  })
})
