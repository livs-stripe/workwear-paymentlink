import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

/**
 * Creates a Stripe Terminal connection token for the Tap to Pay mobile app.
 * Uses the same server Stripe client (STRIPE_SECRET_KEY) as the rest of /web so
 * mobile and web share ONE Stripe account. Permissive CORS + OPTIONS preflight
 * are handled via lib/cors (allows the x-vercel-protection-bypass header the RN
 * app sends cross-origin).
 */
export async function POST() {
  try {
    const stripe = getStripe();
    const connectionToken = await stripe.terminal.connectionTokens.create();
    return jsonResponse({ secret: connectionToken.secret });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to create connection token";
    return errorResponse(message, 500);
  }
}
