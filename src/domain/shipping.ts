export type PackageType = 'Small' | 'Medium' | 'Large'

export type PackageOption = {
  type: PackageType
  lengthMm: number
  breadthMm: number
  heightMm: number
  priceCents: number
}

export type ParcelInput = {
  lengthMm: number
  breadthMm: number
  heightMm: number
  weightKg: number
}

export type ShippingResult =
  | { status: 'success'; package: PackageOption }
  | { status: 'unavailable'; reason: 'overweight' | 'oversized' }
  | { status: 'invalid-input'; errors: string[] }

export const MAX_WEIGHT_KG = 25

export const PACKAGE_OPTIONS: PackageOption[] = [
  { type: 'Small', lengthMm: 200, breadthMm: 300, heightMm: 150, priceCents: 500 },
  { type: 'Medium', lengthMm: 300, breadthMm: 400, heightMm: 200, priceCents: 750 },
  { type: 'Large', lengthMm: 400, breadthMm: 600, heightMm: 250, priceCents: 850 },
]

const sortAscending = (values: number[]): number[] => [...values].sort((a, b) => a - b)

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function validateParcelInput(input: unknown): string[] {
  const errors: string[] = []

  if (!input || typeof input !== 'object') {
    return ['Please enter your parcel details before calculating shipping.']
  }

  const parcel = input as Partial<ParcelInput>
  const checks: Array<[keyof ParcelInput, string, string]> = [
    ['lengthMm', 'length', 'mm'],
    ['breadthMm', 'breadth', 'mm'],
    ['heightMm', 'height', 'mm'],
    ['weightKg', 'weight', 'kg'],
  ]

  for (const [field, label, unit] of checks) {
    const value = parcel[field]

    if (!isPositiveFiniteNumber(value)) {
      errors.push(`Please enter a valid ${label} greater than 0 ${unit}.`)
    }
  }

  return errors
}

export function calculateShipping(input: ParcelInput): ShippingResult {
  const errors = validateParcelInput(input)

  if (errors.length > 0) {
    return { status: 'invalid-input', errors }
  }

  if (input.weightKg > MAX_WEIGHT_KG) {
    return { status: 'unavailable', reason: 'overweight' }
  }

  const sortedParcel = sortAscending([input.lengthMm, input.breadthMm, input.heightMm])

  for (const option of PACKAGE_OPTIONS) {
    const sortedOption = sortAscending([option.lengthMm, option.breadthMm, option.heightMm])
    const fits = sortedParcel.every((dimension, index) => dimension <= sortedOption[index])

    if (fits) {
      return { status: 'success', package: option }
    }
  }

  return { status: 'unavailable', reason: 'oversized' }
}
