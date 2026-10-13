import { describe, expect, it } from 'vitest'

import { calculateShipping, type ParcelInput } from './shipping'

describe('calculateShipping', () => {
  describe('package selection', () => {
    it('selects Small when the parcel fits Small', () => {
      const result = calculateShipping({ lengthMm: 100, breadthMm: 200, heightMm: 150, weightKg: 5 })

      expect(result).toMatchObject({ status: 'success', package: { type: 'Small', priceCents: 500 } })
    })

    it('selects Medium when the parcel exceeds Small', () => {
      const result = calculateShipping({ lengthMm: 250, breadthMm: 350, heightMm: 180, weightKg: 10 })

      expect(result).toMatchObject({ status: 'success', package: { type: 'Medium', priceCents: 750 } })
    })

    it('selects Large when the parcel exceeds Medium', () => {
      const result = calculateShipping({ lengthMm: 350, breadthMm: 500, heightMm: 240, weightKg: 20 })

      expect(result).toMatchObject({ status: 'success', package: { type: 'Large', priceCents: 850 } })
    })

    it('selects the smallest package when multiple packages fit', () => {
      const result = calculateShipping({ lengthMm: 200, breadthMm: 300, heightMm: 150, weightKg: 12 })

      expect(result).toMatchObject({ status: 'success', package: { type: 'Small', priceCents: 500 } })
    })

    it('allows rotation when comparing dimensions', () => {
      const result = calculateShipping({ lengthMm: 150, breadthMm: 300, heightMm: 200, weightKg: 8 })

      expect(result).toMatchObject({ status: 'success', package: { type: 'Small', priceCents: 500 } })
    })

    it('accepts dimensions exactly at package limits', () => {
      const result = calculateShipping({ lengthMm: 200, breadthMm: 300, heightMm: 150, weightKg: 12 })

      expect(result).toMatchObject({ status: 'success', package: { type: 'Small', priceCents: 500 } })
    })

    it('accepts decimal dimensions when the parcel fits', () => {
      const result = calculateShipping({ lengthMm: 150.5, breadthMm: 200, heightMm: 149.9, weightKg: 6.5 })

      expect(result).toMatchObject({ status: 'success', package: { type: 'Small', priceCents: 500 } })
    })
  })

  describe('shipping eligibility', () => {
    it('accepts a parcel weighing exactly 25 kg', () => {
      const result = calculateShipping({ lengthMm: 150, breadthMm: 200, heightMm: 150, weightKg: 25 })

      expect(result).toMatchObject({ status: 'success', package: { type: 'Small', priceCents: 500 } })
    })

    it('rejects a parcel weighing more than 25 kg', () => {
      const result = calculateShipping({ lengthMm: 100, breadthMm: 200, heightMm: 150, weightKg: 25.01 })

      expect(result).toEqual({ status: 'unavailable', reason: 'overweight' })
    })

    it.each([
      [251, 400, 600],
      [250, 401, 600],
      [250, 400, 601],
    ])(
      'rejects dimensions %i × %i × %i when they exceed the Large limits',
      (lengthMm, breadthMm, heightMm) => {
        const result = calculateShipping({ lengthMm, breadthMm, heightMm, weightKg: 10 })

        expect(result).toEqual({ status: 'unavailable', reason: 'oversized' })
      },
    )

    it('prioritises overweight when a parcel is also oversized', () => {
      const result = calculateShipping({ lengthMm: 500, breadthMm: 700, heightMm: 300, weightKg: 40 })

      expect(result).toEqual({ status: 'unavailable', reason: 'overweight' })
    })
  })

  describe('input validation', () => {
    const validInput: ParcelInput = {
      lengthMm: 100,
      breadthMm: 200,
      heightMm: 150,
      weightKg: 10,
    }
    const fields: Array<keyof ParcelInput> = ['lengthMm', 'breadthMm', 'heightMm', 'weightKg']
    const expectedErrors: Record<keyof ParcelInput, string> = {
      lengthMm: 'Please enter a valid length greater than 0 mm.',
      breadthMm: 'Please enter a valid breadth greater than 0 mm.',
      heightMm: 'Please enter a valid height greater than 0 mm.',
      weightKg: 'Please enter a valid weight greater than 0 kg.',
    }
    const invalidValues = [
      { label: 'zero', value: 0 },
      { label: 'negative', value: -1 },
      { label: 'NaN', value: Number.NaN },
      { label: 'positive infinity', value: Number.POSITIVE_INFINITY },
      { label: 'negative infinity', value: Number.NEGATIVE_INFINITY },
    ]
    const invalidInputs = fields.flatMap((field) =>
      invalidValues.map(({ label, value }) => ({
        field,
        label,
        input: { ...validInput, [field]: value },
      })),
    )

    it.each(invalidInputs)('rejects $label $field values with a helpful message', ({ field, input }) => {
      const result = calculateShipping(input)

      expect(result.status).toBe('invalid-input')

      if (result.status !== 'invalid-input') {
        throw new Error('Expected invalid input result')
      }

      expect(result.errors).toEqual([expectedErrors[field]])
    })

    it('rejects a missing measurement with a helpful message', () => {
      // @ts-expect-error Runtime validation must handle missing measurements.
      const result = calculateShipping({ ...validInput, breadthMm: undefined })

      expect(result).toEqual({
        status: 'invalid-input',
        errors: [expectedErrors.breadthMm],
      })
    })
  })
})
