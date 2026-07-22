import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

/**
 * Updates the amount on an existing (unconfirmed) checkout PaymentIntent when
 * the cart total changes, so the portal reuses ONE PaymentIntent per session
 * instead of minting a new Incomplete PI on every change. The client_secret is
 * unchanged by an amount update, but we return it for convenience.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      paymentIntentId?: string;
      amountCents?: number;
    };

    if (!body.paymentIntentId) {
      return errorResponse('A "paymentIntentId" is required', 400);
    }
    if (typeof body.amountCents !== "number" || body.amountCents <= 0) {
      return errorResponse('A positive "amountCents" is required', 400);
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.update(
      body.paymentIntentId,
      { amount: Math.round(body.amountCents) }
    );

    return jsonResponse({
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
    });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to update payment intent";
    return errorResponse(message, 500);
  }
}
