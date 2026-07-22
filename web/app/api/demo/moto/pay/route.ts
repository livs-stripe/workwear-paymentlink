import Stripe from "stripe";
import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
import { recordEvent } from "@/lib/events";
import { ENTERPRISE_SOURCE } from "@/lib/enterprise";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

const MOTO_SEED_CHANNEL = "moto_seed";

/**
 * True when a Stripe error is about the card/moto payment_method_options path
 * being unsupported on the target call — i.e. the invoice's PaymentIntent was
 * created with dynamic/automatic payment methods (no explicit `card` type).
 * These invoices can't be confirmed with card.moto and are re-issued as a
 * card-enabled invoice. A genuine decline is NOT this error and must surface.
 */
function isCardConfigOrMotoError(err: unknown): boolean {
  if (err instanceof Stripe.errors.StripeError) {
    const msg = (err.message || "").toLowerCase();
    const param = (err.param || "").toLowerCase();
    return (
      msg.includes("payment_method_options") ||
      msg.includes("moto") ||
      param.includes("payment_method_options") ||
      param.includes("moto")
    );
  }
  return false;
}

/**
 * Legacy invoices were seeded before payment_settings pinned the PaymentIntent
 * to card, so their PI rejects card.moto. To keep exactly ONE payment record
 * per invoice we DON'T charge a standalone PI + mark paid out of band (that
 * produced a duplicate). Instead we re-issue the same amount as a fresh
 * card-enabled invoice, confirm ITS own PaymentIntent with card.moto, and void
 * the legacy invoice — a single succeeded PI, no duplicate.
 */
async function reissueAndPay(
  stripe: Stripe,
  oldInvoice: Stripe.Invoice,
  paymentMethodId: string,
  note?: string
): Promise<{ confirmed: Stripe.PaymentIntent; invoice: Stripe.Invoice }> {
  const customerId =
    typeof oldInvoice.customer === "string"
      ? oldInvoice.customer
      : (oldInvoice.customer?.id ?? null);
  if (!customerId) {
    throw new Error("Invoice has no customer to re-issue against");
  }

  // Recreate the same line items (fall back to a single balance line).
  const lines = oldInvoice.lines?.data ?? [];
  if (lines.length === 0) {
    await stripe.invoiceItems.create({
      customer: customerId,
      currency: oldInvoice.currency,
      amount: oldInvoice.amount_due,
      description: `Outstanding balance (was ${oldInvoice.number ?? oldInvoice.id})`,
    });
  } else {
    for (const line of lines) {
      await stripe.invoiceItems.create({
        customer: customerId,
        currency: oldInvoice.currency,
        amount: line.amount,
        description: line.description ?? "Workwear order",
      });
    }
  }

  const draft = await stripe.invoices.create({
    customer: customerId,
    collection_method: "send_invoice",
    days_until_due: 21,
    auto_advance: false,
    pending_invoice_items_behavior: "include",
    payment_settings: { payment_method_types: ["card"] },
    metadata: {
      channel: MOTO_SEED_CHANNEL,
      source: ENTERPRISE_SOURCE,
      reissued_from: oldInvoice.id,
    },
  });
  const finalized = await stripe.invoices.finalizeInvoice(draft.id, {
    expand: ["payment_intent"],
  });
  const newPi = finalized.payment_intent as Stripe.PaymentIntent | null;
  if (!newPi) {
    throw new Error("Re-issued invoice has no payment intent to confirm");
  }
  if (note) {
    try {
      await stripe.paymentIntents.update(newPi.id, {
        metadata: { channel: "moto", note, invoice: finalized.id },
      });
    } catch {
      // metadata is best-effort
    }
  }

  let confirmed: Stripe.PaymentIntent;
  try {
    confirmed = await stripe.paymentIntents.confirm(newPi.id, {
      payment_method: paymentMethodId,
      payment_method_options: { card: { moto: true } },
    });
  } catch (err) {
    // Payment failed (e.g. MOTO not enabled, or decline). Void the freshly
    // created invoice so we don't leave an extra open one, and keep the
    // original intact. No charge occurred, so no duplicate record.
    try {
      await stripe.invoices.voidInvoice(finalized.id);
    } catch {
      // best-effort cleanup
    }
    throw err;
  }

  // Paid successfully → void the legacy invoice so only the paid re-issue
  // remains outstanding-free.
  try {
    await stripe.invoices.voidInvoice(oldInvoice.id);
  } catch {
    // best-effort
  }

  return { confirmed, invoice: finalized };
}

/**
 * Pays a specific Stripe invoice as a MOTO (mail order / telephone order)
 * transaction, producing exactly ONE payment record.
 *
 * Primary path: confirm the invoice's OWN PaymentIntent with
 * payment_method_options.card.moto = true. On success the invoice's PI succeeds
 * and Stripe transitions the invoice to "paid" automatically.
 *
 * Legacy path: if the invoice's PI can't accept card.moto (seeded before the
 * card payment_settings fix), re-issue the amount as a card-enabled invoice and
 * pay that one instead — still a single succeeded PI.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      invoice?: string;
      payment_method?: string;
      note?: string;
    };
    if (!body.invoice) {
      return errorResponse('An invoice "id" is required', 400);
    }
    if (!body.payment_method) {
      return errorResponse('A "payment_method" id is required', 400);
    }

    const stripe = getStripe();
    const paymentMethodId = body.payment_method;

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
    const invoicePi = invoice.payment_intent as Stripe.PaymentIntent | null;

    // The PaymentMethod was tokenized client-side via Stripe.js (raw PAN never
    // reaches our server). Attach it to the customer so it's usable for
    // confirmation and reusable for future auto-charges.
    if (customerId) {
      try {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });
      } catch {
        // Non-fatal: already attached, or confirmation can proceed with the PM.
      }
    }

    let confirmed: Stripe.PaymentIntent;
    let resultInvoiceId = invoice.id;

    if (invoicePi) {
      if (body.note) {
        try {
          await stripe.paymentIntents.update(invoicePi.id, {
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
      try {
        // Primary: confirm the invoice's OWN PaymentIntent with card.moto.
        confirmed = await stripe.paymentIntents.confirm(invoicePi.id, {
          payment_method: paymentMethodId,
          payment_method_options: { card: { moto: true } },
        });
      } catch (primaryErr) {
        // Genuine declines / other errors must surface to the operator.
        if (!isCardConfigOrMotoError(primaryErr)) throw primaryErr;
        // Legacy PI can't accept card.moto → re-issue as a card invoice + pay.
        const reissued = await reissueAndPay(
          stripe,
          invoice,
          paymentMethodId,
          body.note
        );
        confirmed = reissued.confirmed;
        resultInvoiceId = reissued.invoice.id;
      }
    } else {
      // Open invoice without a PaymentIntent (unusual) → re-issue + pay.
      const reissued = await reissueAndPay(
        stripe,
        invoice,
        paymentMethodId,
        body.note
      );
      confirmed = reissued.confirmed;
      resultInvoiceId = reissued.invoice.id;
    }

    const updated = await stripe.invoices.retrieve(resultInvoiceId);
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
