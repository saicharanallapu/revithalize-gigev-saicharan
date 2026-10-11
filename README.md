# Revitalize-gigev-saicharan

**GigEV — Gig Worker EV Financial Intelligence & Fleet Analytics Platform**

Built by Revitalize Mobility for Indian gig delivery workers (Zomato, Swiggy, Zepto, Blinkit, Shadowfax, Rapido, Porter) and commercial EV fleet operators.

---

## 🌟 Overview

Gig workers across India face rising petrol prices (₹94–₹105/L) and aggressive OEM marketing claims about electric vehicles. **GigEV** provides street-smart, mathematically verified financial intelligence, enabling delivery partners and commercial fleet owners to evaluate real-world EV feasibility, total cost of ownership (TCO), and payback periods.

---

## 🚀 Core Features

1. **EV Savings & TCO Calculator:**
   - Evaluates running fuel cost per km (Petrol vs Electric).
   - Monthly and annual operating cost comparisons with maintenance differences.
   - Bank/NBFC loan EMI amortization calculator and upfront capital requirements.
   - Rigorous payback analysis with graceful handling of 0 km and negative savings scenarios.

2. **EV Subsidy Explorer:**
   - Grounded in official Central PM E-DRIVE notifications and State EV policies (Delhi, Maharashtra, Karnataka, Tamil Nadu, Uttar Pradesh, Gujarat, Rajasthan, Telangana).
   - Clear distinction between direct demand purchase subsidies and road tax/registration fee waivers.
   - Official government portal source links and eligibility criteria.

3. **Multi-Vehicle Fleet Dashboard:**
   - Add, compare, and remove custom commercial EVs.
   - Side-by-side comparison of purchase price, monthly operating cost, monthly financing (EMI/lease), and net operating savings.
   - Total fleet aggregate metrics: combined monthly distance, operating expenses, and cumulative savings.
   - Form validation for negative values, exceeding down payments, and missing inputs.

4. **AI Financial Advisor:**
   - Powered by `gemini-3.8-flash` via secure server-side Express API with heuristic fallback.
   - Analyzes user's real calculator parameters and fleet metrics.
   - Compares 4 ownership models: Cash purchase, Loan EMI, Daily rental/lease, and Battery swapping (BaaS).
   - Distinguishes exact math calculations from AI advisory suggestions.

5. **Shareable Savings Report:**
   - Full summary modal with detailed breakdown of operational costs, financing, fleet metrics, and official disclaimers.
   - Working copy to clipboard, .txt report download, print/PDF dialog, and native Web Share API (with graceful clipboard fallback).

6. **Interactive Demo Mode & Onboarding:**
   - Guided onboarding walkthrough explaining core modules.
   - "Try Demo Data" loads realistic illustrative vehicles and delivery parameters.
   - Safety overwrite confirmation prevents accidental loss of custom inputs.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend:** Express, Node.js, `tsx`
- **AI Integration:** `@google/genai` (`gemini-3.8-flash` with resilient timeout & heuristic fallback)
- **Tooling:** Vite, TypeScript strict typechecking (`tsc --noEmit`)

---

## 📋 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or pnpm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/Revitalize-gigev-saicharan.git
cd Revitalize-gigev-saicharan

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Optional: Gemini API key for live AI recommendations
# In Google AI Studio, this is automatically injected
GEMINI_API_KEY="your-gemini-api-key"

# Port (defaults to 3000)
PORT=3000
```

*Note: If `GEMINI_API_KEY` is not provided or is experiencing high traffic, GigEV automatically engages its verified financial heuristic fallback engine.*

### Running Development Server

```bash
npm run dev
```

App will run on [http://localhost:3000](http://localhost:3000).

### Running Tests & Verification

```bash
npm test
```

Executes:
1. `test-calculator.ts` — 5 financial audit tests (Normal inputs, 0 km parked vehicle, negative savings, low distance EMI deficit, and input sanitization).
2. `test-subsidy-explorer.ts` — 5 subsidy verification tests (State filters, vehicle category filtering, unassisted state advisory, official government URLs, and calculator transfer).

### Production Build

```bash
npm run build
npm start
```

---

## 🔒 Security & Privacy

- **No Secrets in Client Code:** API keys and credentials are never bundled into the browser JavaScript. All AI interactions occur via the backend `/api/advisor` route.
- **Privacy by Design:** Calculator scenarios and fleet calculations are stored client-side in session/local state and are never transmitted to third parties without explicit user action.

---

## 📄 License & College Project Notice

Developed as a demonstration college engineering project by **Saicharan** for **Revitalize Mobility**.
Official subsidy data referenced from the Ministry of Heavy Industries and State Transport Departments.
