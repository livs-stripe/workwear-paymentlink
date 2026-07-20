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

## Push to GitHub

```bash
git add .
git commit -m "Workwear Field Pay demo"
git push
```
