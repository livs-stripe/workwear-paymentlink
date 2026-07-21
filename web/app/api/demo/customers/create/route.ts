import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
import { recordEvent } from "@/lib/events";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { name?: string };
    if (!body.name || typeof body.name !== "string") {
      return errorResponse('A "name" is required', 400);
    }

    const stripe = getStripe();
    const customer = await stripe.customers.create({
      name: body.name,
      metadata: { type: "nsw_health_purchasing_office" },
    });

    recordEvent({
      type: "customer.created",
      objectId: customer.id,
      summary: `${body.name} onboarded`,
    });

    return jsonResponse(customer);
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to create customer";
    return errorResponse(message, 500);
  }
}
