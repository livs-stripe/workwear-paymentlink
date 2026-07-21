import Stripe from "stripe";
import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
import { recordEvent } from "@/lib/events";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

// Test card tokens finance staff key in over the phone (test mode). We create a
// real PaymentMethod from the token, attach it to the customer, then confirm
// the invoice's PaymentIntent as a MOTO transaction.
const TEST_TOKENS: Record<string, string> = {
  visa: "tok_visa",
  mastercard: "tok_mastercard",
  amex: "tok_amex",
  declined: "tok_chargeDeclined",
};

/**
 * Pays a specific Stripe invoice as a MOTO (mail order / telephone order)
 * transaction. The MOTO exemption flag lives on the confirmation:
 * payment_method_options.card.moto = true. On success the invoice's own
 * PaymentIntent succeeds and the invoice flips to status "paid".
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      invoice?: string;
      card?: string;
      note?: string;
    };
    if (!body.invoice) {
      return errorResponse('An invoice "id" is required', 400);
    }

    const stripe = getStripe();
    const token = TEST_TOKENS[body.card ?? "visa"] ?? "tok_visa";

    const invoice = await stripe.invoices.retrieve(body.invoice, {
      expand: ["payment_intent"],
    });

    if (invoice.status === "paid") {
      return jsonResponse({
        invoice_id: invoice.id,
        invoice_status: "paid",
        already_paid: true,
      });
    }
    if (invoice.status !== "open") {
      return errorResponse(
        `Invoice is ${invoice.status ?? "not payable"} and cannot be charged`,
        400
      );
    }

    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : (invoice.customer?.id ?? null);
    const pi = invoice.payment_intent as Stripe.PaymentIntent | null;
    if (!pi) {
      return errorResponse("This invoice has no payment intent to confirm", 400);
    }

    // Build a PaymentMethod from the keyed-in test card and attach it.
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: { token },
    });
    if (customerId) {
      try {
        await stripe.paymentMethods.attach(paymentMethod.id, {
          customer: customerId,
        });
      } catch {
        // Non-fatal: confirmation can still proceed with the PM directly.
      }
    }

    if (body.note) {
      try {
        await stripe.paymentIntents.update(pi.id, {
          metadata: {
            channel: "moto",
            note: body.note,
            invoice: invoice.id,
          },
        });
      } catch {
        // metadata is best-effort
      }
    }

    const confirmed = await stripe.paymentIntents.confirm(pi.id, {
      payment_method: paymentMethod.id,
      payment_method_options: { card: { moto: true } },
    });

    const updated = await stripe.invoices.retrieve(body.invoice);
    const customerName =
      (typeof updated.customer_name === "string" && updated.customer_name) ||
      "customer";
    const label = updated.number ? ` (${updated.number})` : "";

    if (confirmed.status === "succeeded") {
      recordEvent({
        type: "payment_intent.succeeded",
        objectId: confirmed.id,
        summary: `Phone payment — ${customerName}${label}`,
        amount: confirmed.amount,
        currency: confirmed.currency,
      });
      if (updated.status === "paid") {
        recordEvent({
          type: "invoice.paid",
          objectId: updated.id,
          summary: `Invoice ${updated.number ?? updated.id} paid (MOTO)`,
          amount: updated.amount_paid,
          currency: updated.currency,
        });
      }
    } else {
      recordEvent({
        type: "payment_intent.failed",
        objectId: confirmed.id,
        summary: `Phone payment failed — ${customerName}${label}`,
        amount: confirmed.amount,
        currency: confirmed.currency,
      });
    }

    return jsonResponse({
      invoice_id: updated.id,
      invoice_status: updated.status,
      payment_status: confirmed.status,
      payment_intent: confirmed.id,
    });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to pay invoice";
    return errorResponse(message, 500);
  }
}
