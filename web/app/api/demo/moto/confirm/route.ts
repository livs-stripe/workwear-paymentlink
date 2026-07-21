import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
import { recordEvent } from "@/lib/events";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

/**
 * Called by the MOTO client after it confirms the PaymentIntent in the browser.
 * We retrieve the PI server-side to confirm its real status and record the
 * appropriate event on the live stream.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { id?: string };
    if (!body.id) {
      return errorResponse('A PaymentIntent "id" is required', 400);
    }

    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(body.id);
    const customerName = pi.metadata?.customer_name || "customer";
    const invoiceRef = pi.metadata?.invoice_ref;
    const label = invoiceRef ? ` (${invoiceRef})` : "";

    if (pi.status === "succeeded") {
      recordEvent({
        type: "payment_intent.succeeded",
        objectId: pi.id,
        summary: `MOTO payment — ${customerName}${label}`,
        amount: pi.amount,
        currency: pi.currency,
      });
    } else {
      recordEvent({
        type: "payment_intent.failed",
        objectId: pi.id,
        summary: `MOTO payment failed — ${customerName}${label}`,
        amount: pi.amount,
        currency: pi.currency,
      });
    }

    return jsonResponse({ id: pi.id, status: pi.status });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to confirm payment intent";
    return errorResponse(message, 500);
  }
}
