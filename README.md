# Idempotent & Resilient Payment Checkout System
> **Engineering Assessment Submission:** `FE-02`

A production-grade, idempotent checkout infrastructure built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. Engineered to withstand slow 3G networks, client drop-offs, rapid double-clicks, and browser tab refreshes without ever charging a customer twice.

---

## 📌 Assessment ID

- **Assessment ID:** `FE-02`
- **Candidate Track:** Frontend Engineering (React / TypeScript / Next.js)
- **Core Topic:** Idempotent Checkout Flow with Double-Payment Prevention

---

## 🚀 Setup and Execution Instructions

### Prerequisites
- **Node.js:** v18.17+ or v20+ recommended
- **npm:** v9+ or compatible package manager

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
- **Product Landing Page:** [http://localhost:3000](http://localhost:3000) (Click *"Open Payment Page"* to launch live orders)
- **Primary Checkout Route:** [http://localhost:3000/checkout/order_149900](http://localhost:3000/checkout/order_149900)

### 3. Run Unit Tests (Vitest)
Runs 14 automated unit tests covering the **Luhn algorithm**, **UPI VPA format checks**, **Card Expiry boundary rules**, and **CVV validation**:
```bash
npm test
```

### 4. Run End-to-End Tests (Playwright)
Validates double-click prevention, button disabling in-flight, and single idempotent network dispatch:
```bash
npx playwright install --with-deps  # If running Playwright for the first time
npm run test:e2e
```

### 5. Build for Production
To verify production optimization and static pre-rendering:
```bash
npm run build
npm start
```

---

## 💭 Assumptions Made During Implementation

1. **Paise-Native Integer Architecture:**
   - Per Indian banking guidelines (RBI / NPCI), all monetary values are stored and transmitted as exact 64-bit integer paise (`149900` paise = `₹1,499.00`). No floating-point values are passed over network payloads to completely eliminate IEEE-754 precision and rounding discrepancies.
2. **Idempotency Key Lifecycle & Scoping:**
   - A unique UUID v4 idempotency key is generated on the client per checkout attempt.
   - For network dropouts, 3G delays, or in-flight retries of the *same payment intent*, the client reuses the exact same key.
   - If the payment encounters a terminal decline (`FAILED`) or the customer explicitly restarts checkout via *"Try Again"*, a brand new idempotency key is provisioned.
3. **Session Reconciliation Across Tab Drops / Refreshes:**
   - If a customer closes their browser tab mid-authorization or refreshes during a pending state, the server keeps record of the ongoing payment attempt.
   - Upon revisiting `/checkout/[orderId]`, the client fetches `/api/orders/[orderId]`, detects the existing attempt, and restores polling or receipt state. The user is **never** re-presented with an empty payment form asking them to pay again.
4. **3D Secure Two-Factor Authentication:**
   - In compliance with Indian RBI regulations for digital card transactions, card payments require 2-Factor Authentication (OTP). We simulate this with an interactive OTP modal (mock code: `123456`) directly triggered upon card submission.
5. **2-Step Transparent Checkout Journey:**
   - Checkout is split into two logical steps:
     - **Step 1 (Products Detail):** Transparent line-item breakdown (shirt, tote bag, shipping) and order total.
     - **Step 2 (Payment Page):** Clean payment terminal with UPI & 3D metallic card switcher.
6. **In-Flight Atomic Locking:**
   - Both client-side React `useRef` submission locks and server-side in-flight locks reject concurrent duplicate calls within millisecond windows, returning `409 Conflict` or replaying cached payment responses.

---

##  Answers to Assessment Questions

1. Why is disabling the button not enough on its own to prevent double payments?
Disabling the UI button is not enough because a tech-savvy user can still bypass client-side restrictions and send duplicate requests directly using network tools, Postman, or automated scripts. Additionally, network retries, browser quirks, or rapid keyboard shortcuts can trigger multiple requests in the background. Implementing backend idempotency ensures that even if duplicate requests reach the server, they all resolve to a single, consistent payment record.

2. What should the page show if the user closes the tab during processing and comes back?
When the user closes the tab and returns later, the page should check local storage or query the backend to retrieve the active payment's current status (GET /api/payments/[paymentId]). If the payment is still in a PENDING state, the UI should immediately restore the "We are confirming your payment" status view and resume polling. This prevents the app from accidentally initiating a new payment and ensures the user sees the accurate, ongoing status of their transaction.

## 📋 Completed Tasks, Incomplete Tasks & Potential Improvements

### Completed Scope (100% of Mandatory + Bonus Features)

- [x] **Currency in Paise:** Stored as integers in API (`149900` = `₹1,499`), rendered with clean Indian currency formatting (`₹`).
- [x] **Next.js App Router + TypeScript + Tailwind CSS:** Clean architectural layout with modern styling.
- [x] **Route `/checkout/[orderId]`:** Live order summary from mock route handler.
- [x] **Two Payment Methods:**
  - UPI ID with regex format check and quick-fill suggestions.
  - Card with Luhn check, expiry `MM/YY` relative to current month/year, and CVV checks.
- [x] **Mock Payment API:**
  - `POST /api/payments` with `Idempotency-Key` requirement, 1.5s latency, random status (`SUCCESS`, `FAILED`, `PENDING`), and in-memory replay.
  - `GET /api/payments/[paymentId]` with ~5s deterministic transition from `PENDING` to final status.
- [x] **Double-Payment Prevention:**
  - Button disabled during flight.
  - Client-side attempt key reuse for the same attempt.
- [x] **Bonus 1 — Unit Tests:** 14 Vitest unit tests covering Luhn algorithm, UPI format validation, Card Expiry, and CVV checks (`npm test`).
- [x] **Bonus 2 — Tab Refresh Session Recovery:** Session recovery and server reconciliation resume polling on reload rather than initiating a new charge.
- [x] **Bonus 3 — Card 3D-Secure OTP Step:** Simulated bank authorization modal with mock OTP `123456`.
- [x] **Bonus 4 — Playwright E2E Tests:** Double-click assertion script in `e2e/double-click.spec.ts`.
- [x] **Bonus 5 — Payments Audit Ledger:** Header button opens full transactions ledger modal to inspect live idempotency keys and statuses.

### Potential Improvements with Additional Time (Production Roadmap)


 1. **Server-Sent Events (SSE) or WebSockets:**
   - Replace client polling (`setInterval` on `GET /api/payments/[paymentId]`) with a push-based SSE connection connected directly to bank webhook events.
2. **Biometric WebAuthn / Passkey Support:**
   - Integrate native browser passkeys (Touch ID / Face ID) for 1-tap authenticated card checkout without manual CVV entry.
3. **Persistent Transaction Database:**
   - Store order snapshots and immutable payment ledgers in PostgreSQL with ACID transactions and cryptographic hash signatures.

---

## 🛠️ Architecture & Project Directory Structure

```text
assignment/
├── e2e/
│   └── double-click.spec.ts        # Playwright test for double-click idempotency
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── orders/[orderId]/   # Mock order route handler (returns paise)
│   │   │   └── payments/           # POST /api/payments & GET /api/payments/[paymentId]
│   │   ├── checkout/[orderId]/     # Core dynamic checkout page (2-step flow)
│   │   ├── globals.css             # Tailwind v4 configuration & ambient design
│   │   ├── layout.tsx              # Root HTML & body shell with metadata
│   │   └── page.tsx                # Fintech product landing page
│   ├── components/
│   │   ├── Header.tsx              # SSL & PCI-DSS branding header with home link
│   │   ├── ProductDetailsStep.tsx  # Step 1: Transparent items and pricing review
│   │   ├── OrderSummary.tsx        # Item breakdown & INR currency conversion
│   │   ├── PaymentMethodSelector.tsx# Accessible tabs (UPI vs Card)
│   │   ├── UPIPaymentForm.tsx      # UPI input with regex validator & shortcuts
│   │   ├── CardPaymentForm.tsx     # Card input with Luhn check, 3D card preview & auto-formatting
│   │   ├── OtpModal.tsx            # Bonus: 3D-Secure OTP modal (mock 123456)
│   │   ├── PaymentStatusView.tsx   # Processing, Pending (polling), Success & Failure
│   │   ├── TransactionHistoryModal.tsx # Full payments ledger audit modal
│   │   └── DemoToolbar.tsx         # Reviewer toolbar to force outcomes
│   ├── lib/
│   │   ├── currency.ts             # Paise to INR formatting (Intl.NumberFormat)
│   │   ├── idempotency.ts          # Attempt key generator & tab session recovery
│   │   ├── mock-db.ts              # In-memory store for orders and payments
│   │   └── validators.ts           # Luhn algorithm, UPI regex, expiry, CVV
│   ├── types/
│   │   └── checkout.ts             # TypeScript definitions
│   └── __tests__/
│       └── validators.test.ts      # Vitest test suite (14 unit tests)
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── vitest.config.mts
```

---

## 🧪 Testing with the Built-in Reviewer Toolbar

A floating **Reviewer Controls** toolbar is included at the bottom right corner of the checkout screen:
- **Random:** Default realistic behavior (random distribution of SUCCESS, PENDING, and FAILED).
- **Force Pending:** Causes the mock API to return `PENDING`. This lets you observe the ~5 second automatic status transition into final resolution and test tab refreshes.
- **Force Success / Force Failed:** Directly tests the final confirmation receipt or failure message and *"Try Again"* state.
