import { useState, type ChangeEvent, type SubmitEvent } from 'react'

import { calculateShipping, type ShippingResult } from './domain/shipping'
import './App.css'

type FormState = {
  length: string
  breadth: string
  height: string
  weight: string
}

const initialForm: FormState = {
  length: '',
  breadth: '',
  height: '',
  weight: '',
}

const textFields = [
  { id: 'length', label: 'Length (mm)' },
  { id: 'breadth', label: 'Breadth (mm)' },
  { id: 'height', label: 'Height (mm)' },
  { id: 'weight', label: 'Weight (kg)' },
] as const

const formatPrice = (cents: number): string => `NZ$${(cents / 100).toFixed(2)}`

const parseNumber = (value: string): number => {
  const trimmed = value.trim()

  if (trimmed === '') {
    return Number.NaN
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

type ShippingResultViewProps = {
  result: ShippingResult | null
}

function ShippingResultView({ result }: ShippingResultViewProps) {
  if (!result) {
    return null
  }

  switch (result.status) {
    case 'success': {
      const selectedPackage = result.package

      return (
        <div className="result result-success" role="status" aria-live="polite">
          <h2>Shipping option available</h2>
          <p className="package-name">{selectedPackage.type} package</p>
          <p className="package-dimensions">
            {selectedPackage.lengthMm} mm × {selectedPackage.breadthMm} mm × {selectedPackage.heightMm} mm
          </p>
          <p className="package-price">{formatPrice(selectedPackage.priceCents)}</p>
        </div>
      )
    }
    case 'invalid-input':
      return (
        <div className="result result-error" role="alert">
          <h2>Invalid parcel details</h2>
          <ul>
            {result.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )
    case 'unavailable':
      if (result.reason === 'overweight') {
        return (
          <div className="result result-warning" role="alert">
            <h2>Weight limit exceeded</h2>
            <p>This parcel exceeds the 25 kg weight limit.</p>
          </div>
        )
      }

      return (
        <div className="result result-warning" role="alert">
          <h2>No package fits this parcel</h2>
          <p>None of the available shipping packages can accommodate this parcel.</p>
        </div>
      )
    default:
      return null
  }
}

function App() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [result, setResult] = useState<ShippingResult | null>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextResult = calculateShipping({
      lengthMm: parseNumber(form.length),
      breadthMm: parseNumber(form.breadth),
      heightMm: parseNumber(form.height),
      weightKg: parseNumber(form.weight),
    })

    setResult(nextResult)
  }

  return (
    <main className="app-shell">
      <section className="app-card" aria-labelledby="page-title">
        <header className="page-header">
          <p className="eyebrow">Parcel shipping</p>
          <h1 id="page-title">Parse the Parcel</h1>
          <p className="subtitle">Enter your parcel details to find the smallest suitable shipping package.</p>
        </header>

        <form className="shipping-form" onSubmit={handleSubmit}>
          <div className="field-grid">
            {textFields.map(({ id, label }) => (
              <div className="field" key={id}>
                <label htmlFor={id}>{label}</label>
                <input
                  id={id}
                  name={id}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form[id]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
          </div>

          <button type="submit" className="submit-button">
            Calculate shipping
          </button>
        </form>

        <ShippingResultView result={result} />
      </section>
    </main>
  )
}

export default App
