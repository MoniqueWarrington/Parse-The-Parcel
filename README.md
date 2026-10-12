# Parse the Parcel

A small React + TypeScript app that calculates the smallest suitable shipping package for a parcel based on its dimensions and weight.

## What it does

The app accepts a parcel's length, breadth, height, and weight, then returns the smallest valid package and price, or explains why the parcel cannot be shipped.

## Prerequisites

- Node.js LTS
- npm

## Install and run

```bash
npm install
npm run dev
```

Run the tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

## Domain and UI separation

The business rules live in `src/domain/shipping.ts` and are kept pure and deterministic. The React UI in `src/App.tsx` handles form state and display only, without re-implementing the shipping logic.

## Package rules

The app enforces the following shipping table:

| Package type | Length | Breadth | Height | Price |
|---|---:|---:|---:|---:|
| Small | 200 mm | 300 mm | 150 mm | NZ$5.00 |
| Medium | 300 mm | 400 mm | 200 mm | NZ$7.50 |
| Large | 400 mm | 600 mm | 250 mm | NZ$8.50 |

Maximum parcel weight: 25 kg inclusive.

The rules are implemented as fixed application constants in the domain layer, and users cannot override them.

## Assumptions

- Rotation is allowed: dimensions are sorted before comparison.
- Package limits are inclusive: a parcel dimension equal to the limit is accepted.
- A parcel weighing exactly 25 kg is accepted if it fits dimensionally.
- Input validation happens at both the UI boundary and inside the domain function.
- If a valid parcel is both overweight and oversized, the app reports overweight first.
- Invalid input is handled separately from shipping availability.

## Why no backend?

This exercise is intentionally client-only. The calculation is local, deterministic, and has no persistence or external side effects, so no API or backend was added.

For authoritative shipping prices in production, a real system would need server-side validation and calculation using trusted package rules and validated input before charging a customer.
