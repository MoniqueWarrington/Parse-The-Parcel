import { describe, expect, it } from 'vitest'

import { calculateShipping } from './shipping'

describe('calculateShipping', () => {
  it('returns Small for a parcel that fits the smallest package', () => {
    const result = calculateShipping({ lengthMm: 100, breadthMm: 200, heightMm: 150, weightKg: 5 })

    expect(result).toEqual({ status: 'success', package: { type: 'Small', lengthMm: 200, breadthMm: 300, heightMm: 150, priceCents: 500 } })
  })

  it('returns Medium when the small package does not fit', () => {
    const result = calculateShipping({ lengthMm: 250, breadthMm: 350, heightMm: 180, weightKg: 10 })

    expect(result).toEqual({ status: 'success', package: { type: 'Medium', lengthMm: 300, breadthMm: 400, heightMm: 200, priceCents: 750 } })
  })

  it('returns Large when larger dimensions are required', () => {
    const result = calculateShipping({ lengthMm: 350, breadthMm: 500, heightMm: 240, weightKg: 20 })

    expect(result).toEqual({ status: 'success', package: { type: 'Large', lengthMm: 400, breadthMm: 600, heightMm: 250, priceCents: 850 } })
  })

  it('chooses the smallest suitable package when multiple packages fit', () => {
    const result = calculateShipping({ lengthMm: 200, breadthMm: 300, heightMm: 150, weightKg: 12 })

    expect(result).toEqual({ status: 'success', package: { type: 'Small', lengthMm: 200, breadthMm: 300, heightMm: 150, priceCents: 500 } })
  })

  it('accepts a parcel when dimensions are presented in a different order', () => {
    const result = calculateShipping({ lengthMm: 150, breadthMm: 300, heightMm: 200, weightKg: 8 })

    expect(result).toEqual({ status: 'success', package: { type: 'Small', lengthMm: 200, breadthMm: 300, heightMm: 150, priceCents: 500 } })
  })

  it('accepts parcel dimensions equal to package limits', () => {
    const result = calculateShipping({ lengthMm: 200, breadthMm: 300, heightMm: 150, weightKg: 12 })

    expect(result).toEqual({ status: 'success', package: { type: 'Small', lengthMm: 200, breadthMm: 300, heightMm: 150, priceCents: 500 } })
  })

  it('accepts a parcel weighing exactly 25 kg when it fits', () => {
    const result = calculateShipping({ lengthMm: 150, breadthMm: 200, heightMm: 150, weightKg: 25 })

    expect(result).toEqual({ status: 'success', package: { type: 'Small', lengthMm: 200, breadthMm: 300, heightMm: 150, priceCents: 500 } })
  })

  it('handles decimal dimensions correctly', () => {
    const result = calculateShipping({ lengthMm: 150.5, breadthMm: 200, heightMm: 149.9, weightKg: 6.5 })

    expect(result).toEqual({ status: 'success', package: { type: 'Small', lengthMm: 200, breadthMm: 300, heightMm: 150, priceCents: 500 } })
  })

  it('returns oversized when any dimension exceeds all package limits', () => {
    const result = calculateShipping({ lengthMm: 401, breadthMm: 601, heightMm: 251, weightKg: 20 })

    expect(result).toEqual({ status: 'unavailable', reason: 'oversized' })
  })

  it('returns overweight when the parcel weighs more than 25 kg', () => {
    const result = calculateShipping({ lengthMm: 100, breadthMm: 200, heightMm: 150, weightKg: 25.01 })

    expect(result).toEqual({ status: 'unavailable', reason: 'overweight' })
  })

  it('returns overweight before oversized when both issues apply', () => {
    const result = calculateShipping({ lengthMm: 500, breadthMm: 700, heightMm: 300, weightKg: 40 })

    expect(result).toEqual({ status: 'unavailable', reason: 'overweight' })
  })

  it.each([
    { field: 'lengthMm', input: { lengthMm: 0, breadthMm: 200, heightMm: 150, weightKg: 10 } },
    { field: 'breadthMm', input: { lengthMm: 100, breadthMm: -1, heightMm: 150, weightKg: 10 } },
    { field: 'heightMm', input: { lengthMm: 100, breadthMm: 200, heightMm: -5, weightKg: 10 } },
    { field: 'weightKg', input: { lengthMm: 100, breadthMm: 200, heightMm: 150, weightKg: 0 } },
    { field: 'lengthMm', input: { lengthMm: Number.NaN, breadthMm: 200, heightMm: 150, weightKg: 10 } },
    { field: 'breadthMm', input: { lengthMm: 100, breadthMm: Number.POSITIVE_INFINITY, heightMm: 150, weightKg: 10 } },
    { field: 'heightMm', input: { lengthMm: 100, breadthMm: 200, heightMm: Number.NEGATIVE_INFINITY, weightKg: 10 } },
    { field: 'weightKg', input: { lengthMm: 100, breadthMm: 200, heightMm: 150, weightKg: Number.NaN } },
  ])('rejects invalid input for $field', ({ input }) => {
    const result = calculateShipping(input)

    expect(result.status).toBe('invalid-input')

    if (result.status !== 'invalid-input') {
      throw new Error('Expected invalid input result')
    }

    expect(result.errors.length).toBeGreaterThan(0)
  })
})
