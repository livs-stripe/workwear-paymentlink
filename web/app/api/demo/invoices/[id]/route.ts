import Stripe from "stripe";
import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return errorResponse("An invoice id is required", 400);
    }

    const stripe = getStripe();
    const invoice = await stripe.invoices.retrieve(id, {
      expand: ["payment_intent", "charge"],
    });

    const paymentIntent =
      invoice.payment_intent && typeof invoice.payment_intent !== "string"
        ? (invoice.payment_intent as Stripe.PaymentIntent)
        : null;
    const charge =
      invoice.charge && typeof invoice.charge !== "string"
        ? (invoice.charge as Stripe.Charge)
        : null;

    return jsonResponse({
      id: invoice.id,
      status: invoice.status,
      hosted_invoice_url: invoice.hosted_invoice_url,
      payment_intent: paymentIntent
        ? { id: paymentIntent.id, status: paymentIntent.status }
        : null,
      charge: charge ? { id: charge.id, status: charge.status } : null,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      number: invoice.number,
    });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to retrieve invoice";
    return errorResponse(message, 500);
  }
}
