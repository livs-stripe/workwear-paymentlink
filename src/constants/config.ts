// Mobile backend. Points at the workwear-paymentlink deployment so Tap to Pay
// PaymentIntents land on the SAME Stripe account as the web app (shared
// STRIPE_SECRET_KEY). The Next.js routes live in /web:
//   /api/connection-token, /api/create-payment-intent
export const API_BASE_URL = 'https://workwear-paymentlink.vercel.app';

// Simulator toggle (one-line switch):
//   true  = simulated reader via "bluetoothScan". Requires NO Apple Tap to Pay
//           entitlement, so it builds/runs on a device signed with a FREE Apple
//           ID. Creates real PaymentIntents; only the physical card tap is faked.
//           Use this for demos without a paid Apple Developer account.
//   false = real Tap to Pay ("tapToPay"). Requires a paid Apple Developer
//           account with the Apple-approved Tap to Pay entitlement (see README).
export const SIMULATOR_MODE = true;

// Currency used for all charges in this demo.
export const CURRENCY = 'aud';

// Vercel Deployment Protection bypass.
// If your Vercel team enforces Deployment Protection (SSO) and it can't be
// disabled, generate a "Protection Bypass for Automation" secret in
// Vercel → Settings → Deployment Protection, and paste it here. The app sends
// it as the `x-vercel-protection-bypass` header so requests skip the SSO wall.
// Leave as an empty string if protection is disabled.
export const VERCEL_PROTECTION_BYPASS = 'knBvaX6CmumR7o8olCuKgPaHR7R8ZVlx';
