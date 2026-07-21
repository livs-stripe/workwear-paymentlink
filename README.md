# Workwear Field Pay

A React Native (TypeScript) demo app that showcases **Stripe Terminal Tap to Pay**
for in-field uniform fitting payments. Sales reps select workwear items, then take
a contactless payment directly on the phone — no external card reader hardware.

- **App:** React Native CLI (bare workflow), `@stripe/stripe-terminal-react-native`
- **Backend:** Stripe API calls run in **Vercel serverless functions** (`/api`).
  There is **no local server** — the app talks directly to your Vercel deployment.

---

## Architecture

```
React Native app  ──POST /api/connection-token───────▶  Vercel function ──▶ Stripe
                  ──POST /api/create-payment-intent──▶  Vercel function ──▶ Stripe
```

| Path                            | Purpose                                              |
| ------------------------------- | ---------------------------------------------------- |
| `/api/connection-token.ts`      | Returns a Terminal `connectionToken` secret          |
| `/api/create-payment-intent.ts` | Creates a `card_present` PaymentIntent (AUD)          |
| `/src`                          | React Native app (screens, components, hooks)        |
| `vercel.json`                   | Minimal config; Node version pinned via `engines`    |

---

## 1. Deploy the backend to Vercel

1. Push this repo to GitHub (see bottom of this file).
2. Go to [vercel.com](https://vercel.com) → **Add New… → Project** → import the repo.
3. Vercel auto-detects the `/api` folder — no build settings needed.
4. In **Project Settings → Environment Variables**, add:

   | Name                | Value                        |
   | ------------------- | ---------------------------- |
   | `STRIPE_SECRET_KEY` | `sk_test_...` (your test key) |

5. Deploy. Your API will be live at `https://<your-project>.vercel.app`.

> All secrets live in Vercel's dashboard. There is **no `.env` file** in this repo
> and none is required.

### Verify the endpoints

```bash
curl -X POST https://<your-project>.vercel.app/api/connection-token
# => {"secret":"pst_test_..."}
```

---

## 2. Point the app at your deployment

Edit **`src/constants/config.ts`** and set your Vercel URL:

```ts
// Replace with your Vercel deployment URL
export const API_BASE_URL = 'https://your-project.vercel.app';
```

This is the **only** value you must change after deploying.

---

## 3. Run the React Native app on a device

The native `ios/` and `android/` projects are committed to this repo, so you do
not need to generate them. First install dependencies and pods:

```bash
# install JS dependencies
npm install

# iOS native deps (CocoaPods required: brew install cocoapods)
cd ios && pod install && cd ..
```

> If a package's postinstall script fails on your machine (e.g. the `esbuild`
> binary used by the `@vercel/node` dev dependency gets killed on some macOS
> setups), you can install with `npm install --ignore-scripts`. That dev tool is
> only used for local Vercel emulation and is not needed to build the app.

There are **two ways to run this**, depending on whether you have a paid Apple
Developer account. Pick the one you need — the toggle is a single line in
`src/constants/config.ts`.

### Option A — Demo on a FREE Apple account (default, `SIMULATOR_MODE = true`)

This is the default in the repo. It uses the Stripe Terminal **simulated reader**
via the `bluetoothScan` discovery method, which needs **no Apple entitlement**, so
you can sign and run on your own iPhone with a **free** Apple ID. It still creates
**real PaymentIntents** on your Stripe account — only the physical card tap is
faked (the simulator presents a `4242 4242 4242 4242` test card).

1. Confirm `export const SIMULATOR_MODE = true;` in `src/constants/config.ts`.
2. `open ios/WorkwearFieldPay.xcworkspace`
3. Target **WorkwearFieldPay** → **Signing & Capabilities** → check **Automatically
   manage signing** and select your (free) personal team.
4. Set a unique **Bundle Identifier** (e.g. `com.yourname.workwearfieldpay`).
5. **Do not** add the Tap to Pay capability — the entitlements file is intentionally
   empty so free-account signing works.
6. Run on your connected iPhone:
   ```bash
   npx react-native run-ios --device
   ```
7. On the phone, trust the developer cert: **Settings → General → VPN & Device
   Management → (your Apple ID) → Trust**. Free-provisioned apps expire after ~7
   days; just re-run to reinstall.

> Still runs on a **real device**, not the iOS Simulator — the Terminal SDK needs
> a device to initialize even the simulated reader.

### Option B — Real Tap to Pay (`SIMULATOR_MODE = false`, paid account)

Real Tap to Pay requires a **physical iPhone XS or newer, iOS 16.7+**, a **paid
Apple Developer account**, and the **Apple-approved Tap to Pay entitlement**
(request it at
<https://developer.apple.com/contact/request/tap-to-pay-on-iphone/>).

1. Set `export const SIMULATOR_MODE = false;` in `src/constants/config.ts`.
2. `open ios/WorkwearFieldPay.xcworkspace` → **Signing & Capabilities**, select your
   paid **Team** and a unique bundle ID.
3. Click **+ Capability → Tap to Pay on iPhone**. This adds the
   `com.apple.developer.proximity-reader.payment.acceptance` entitlement (the
   entitlements file has a commented template). Your account must be approved.
4. ```bash
   npx react-native run-ios --device
   ```

For Android, run on a supported physical device with NFC (`minSdkVersion` is 26):

```bash
npx react-native run-android
```

> **iOS deployment target:** the Podfile pins `platform :ios, '16.0'` because
> Tap to Pay on iPhone requires iOS 16.7+.

---

## 4. The simulator toggle

One line in **`src/constants/config.ts`** switches between the two modes above:

```ts
export const SIMULATOR_MODE = true;   // Option A: simulated reader, free account
// export const SIMULATOR_MODE = false; // Option B: real Tap to Pay, paid account
```

Internally this selects the discovery method: `bluetoothScan` (simulated, no
entitlement) vs. `tapToPay` (real). No other code changes are needed.

---

## 5. Test cards

Use Stripe's Terminal test cards / simulated card presentment:

- <https://docs.stripe.com/terminal/references/testing>

When `SIMULATOR_MODE = true`, the simulated reader presents a test card
automatically when you tap **Tap to Pay**.

---

## Screens

- **ProductScreen** — grid of workwear items + custom amount + quantity stepper.
- **PaymentScreen** — order summary, reader status chip, large **Tap to Pay** button.
- **SuccessScreen** — checkmark, amount, card last 4, timestamp.
- **ErrorScreen** — error message + retry.

## Branding

`#FF6B00` Workwear orange · `#1A1A1A` dark text · white backgrounds · system sans-serif.

---

## B2B Demo Portal (`/web`)

A separate **Next.js 14 (App Router, TypeScript, Tailwind)** web app lives in
[`/web`](./web). It is a client-facing B2B payments portal for Workwear Group
and is completely independent of the React Native app and the `/api` functions —
it has its **own `package.json`** and deploys as a **separate Vercel project**.

The portal is served under **`/demo`**, i.e. the live URL is
`https://<new-project>.vercel.app/demo`.

### Pages

| Path                | Purpose                                                        |
| ------------------- | ------------------------------------------------------------- |
| `/demo`             | Hub landing with four demo cards                              |
| `/demo/nsw-gov`     | NSW Gov vCard — onboard office, store vCard, auto-charge      |
| `/demo/invoicing`   | Full invoice lifecycle (auto-charge, BECS, hosted invoice/QR) |
| `/demo/moto`        | MOTO terminal — finance staff take card payments by phone     |
| `/demo/events`      | Live Stripe event stream (terminal aesthetic)                 |

API route handlers live under `/web/app/api/demo/*` (customers, setup-intent,
invoices create/finalize/[id]/create-full, moto create-intent/confirm, events,
seed-events, reset). They use an **in-memory event store** (no Vercel KV, no
webhooks) so the Live Event Stream reflects real activity from the demo itself.

### Environment variables (set in the NEW Vercel project)

| Name                                 | Value            |
| ------------------------------------ | ---------------- |
| `STRIPE_SECRET_KEY`                  | `sk_test_...`    |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...`    |

Both are **test-mode** keys. See [`web/.env.local.example`](./web/.env.local.example).

### Deploy to Vercel (separate project)

1. In Vercel, **Add New… → Project** and import **this same repo**.
2. Set **Root Directory = `web`** (this is what keeps it separate from `/api`).
3. Framework preset auto-detects **Next.js**.
4. Add the two env vars above (Production + Preview).
5. Deploy. The portal is live at `https://<new-project>.vercel.app/demo`.

### Local development

```bash
cd web
npm install          # use --ignore-scripts if a postinstall fails
cp .env.local.example .env.local   # then fill in your test keys
npm run dev          # http://localhost:3000/demo
```

### Recommended demo run order (for the meeting)

Open the **Event Stream in a second window** first so live activity shows as you
go, then run:

1. **NSW Gov** (`/demo/nsw-gov`) — onboard an office, store the vCard, generate
   and finalize an invoice, watch it auto-charge to Paid.
2. **Invoicing** (`/demo/invoicing`) — build & send an invoice, show the three
   collection paths and the hosted-invoice QR code.
3. **MOTO** (`/demo/moto`) — look up a customer, take a card payment by phone.
4. **Event Stream** (`/demo/events`) — point back to the live feed showing every
   object created during the walkthrough.

### Resetting between runs

Every page has a **Reset Demo** button that clears its local state; on the NSW
Gov and Event Stream pages it also calls `POST /api/demo/reset` to clear the
in-memory event store. The Event Stream re-seeds realistic historical events on
next load if empty.

### Stripe test cards

- **`4242 4242 4242 4242`** · Exp `12/26` · CVC `123` — successful payment.
- **`4000 0000 0000 0002`** — declined card (useful to show an error path in MOTO).

The test card values are shown on-screen next to every Payment Element (the
Stripe Payment Element cannot be pre-filled programmatically).

---

## Push to GitHub

```bash
git add .
git commit -m "Workwear Field Pay demo"
git push
```
