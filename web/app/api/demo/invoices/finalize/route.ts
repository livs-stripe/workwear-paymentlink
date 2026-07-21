import Stripe from "stripe";
import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
import { recordEvent } from "@/lib/events";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { id?: string };
    if (!body.id) {
      return errorResponse('An invoice "id" is required', 400);
    }

    const stripe = getStripe();

    let invoice = await stripe.invoices.finalizeInvoice(body.id, {
      expand: ["payment_intent", "charge"],
    });

    recordEvent({
      type: "invoice.finalized",
      objectId: invoice.id,
      summary: `Invoice ${invoice.number ?? invoice.id} finalized`,
      amount: invoice.amount_due,
      currency: invoice.currency,
    });

    // For charge_automatically invoices with a default payment method Stripe
    // will attempt payment automatically, but to make the demo reliably reach
    // "paid" in test mode we force an immediate payment attempt.
    if (
      invoice.collection_method === "charge_automatically" &&
      invoice.status === "open"
    ) {
      try {
        invoice = await stripe.invoices.pay(body.id, {
          expand: ["payment_intent", "charge"],
        });
      } catch {
        // Leave the invoice open if the auto-charge can't be forced; the
        // client poll will continue to reflect the real status.
      }
    }

    if (invoice.status === "paid") {
      recordEvent({
        type: "invoice.paid",
        objectId: invoice.id,
        summary: `Invoice ${invoice.number ?? invoice.id} paid`,
        amount: invoice.amount_paid,
        currency: invoice.currency,
      });
      const pi = invoice.payment_intent as Stripe.PaymentIntent | null;
      if (pi && typeof pi !== "string") {
        recordEvent({
          type: "payment_intent.succeeded",
          objectId: pi.id,
          summary: `Payment captured for ${invoice.number ?? invoice.id}`,
          amount: pi.amount,
          currency: pi.currency,
        });
      }
    }

    return jsonResponse(invoice);
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to finalize invoice";
    return errorResponse(message, 500);
  }
}
