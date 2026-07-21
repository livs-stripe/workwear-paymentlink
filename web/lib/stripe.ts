import Stripe from "stripe";

/**
 * Server-side Stripe client. Reads STRIPE_SECRET_KEY from the environment.
 * Route handlers should call getStripe() so a missing key produces a clear
 * 500 error rather than an opaque crash at import time.
 */
let cached: Stripe | null = null;

export class MissingStripeKeyError extends Error {
  constructor() {
    super("STRIPE_SECRET_KEY is not configured");
    this.name = "MissingStripeKeyError";
  }
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new MissingStripeKeyError();
  }
  if (!cached) {
    cached = new Stripe(key, {
      apiVersion: "2024-06-20",
      appInfo: { name: "Workwear Demo Portal", version: "1.0.0" },
    });
  }
  return cached;
}
