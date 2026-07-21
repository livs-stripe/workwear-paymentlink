import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { customer?: string };
    if (!body.customer) {
      return errorResponse('A "customer" id is required', 400);
    }

    const stripe = getStripe();
    const setupIntent = await stripe.setupIntents.create({
      customer: body.customer,
      usage: "off_session",
      payment_method_types: ["card"],
    });

    return jsonResponse({
      id: setupIntent.id,
      client_secret: setupIntent.client_secret,
    });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to create setup intent";
    return errorResponse(message, 500);
  }
}
