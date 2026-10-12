import { useState } from 'react'

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

const formatPrice = (cents: number): string => `NZ$${(cents / 100).toFixed(2)}`

function App() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [result, setResult] = useState<ShippingResult | null>(null)

  const parseNumber = (value: string): number => {
    const trimmed = value.trim()

    if (trimmed === '') {
      return Number.NaN
    }

    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : Number.NaN
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const textFields = [
    { id: 'length', label: 'Length (mm)', name: 'length' },
    { id: 'breadth', label: 'Breadth (mm)', name: 'breadth' },
    { id: 'height', label: 'Height (mm)', name: 'height' },
    { id: 'weight', label: 'Weight (kg)', name: 'weight' },
  ] as const

  const renderField = ({ id, label, name }: (typeof textFields)[number]) => (
    <div className="field" key={id}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={form[name]}
        onChange={handleChange}
        required
      />
    </div>
  )

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextResult = calculateShipping({
      lengthMm: parseNumber(form.length),
      breadthMm: parseNumber(form.breadth),
      heightMm: parseNumber(form.height),
      weightKg: parseNumber(form.weight),
    })

    setResult(nextResult)
  }

  const renderResult = () => {
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

  return (
    <main className="app-shell">
      <section className="app-card" aria-labelledby="page-title">
        <header className="page-header">
          <p className="eyebrow">Parcel shipping</p>
          <h1 id="page-title">Parse the Parcel</h1>
          <p className="subtitle">Enter your parcel details to find the smallest suitable shipping package.</p>
        </header>

        <form className="shipping-form" onSubmit={handleSubmit} noValidate>
          <div className="field-grid">{textFields.map(renderField)}</div>

          <button type="submit" className="submit-button">
            Calculate shipping
          </button>
        </form>

        {renderResult()}
      </section>
    </main>
  )
}

export default App
