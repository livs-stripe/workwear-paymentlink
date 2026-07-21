import Stripe from "stripe";
import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
import { recordEvent } from "@/lib/events";
import { INVOICE_FOOTER } from "@/lib/data";

export const runtime = "nodejs";

interface LineItemInput {
  description: string;
  amountCents: number;
  quantity: number;
}

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      customerName?: string;
      customer?: string;
      lineItems?: LineItemInput[];
      days_until_due?: number;
      collection_method?: "charge_automatically" | "send_invoice";
      default_payment_method?: string;
    };

    if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
      return errorResponse("At least one line item is required", 400);
    }

    const stripe = getStripe();

    // Use an existing customer if provided, otherwise create one.
    let customerId = body.customer;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: body.customerName ?? "Workwear Group Client",
        metadata: { type: "b2b_invoice_client" },
      });
      customerId = customer.id;
      recordEvent({
        type: "customer.created",
        objectId: customer.id,
        summary: `${customer.name} onboarded`,
      });
    }

    for (const item of body.lineItems) {
      await stripe.invoiceItems.create({
        customer: customerId,
        currency: "aud",
        unit_amount: Math.round(item.amountCents),
        quantity: item.quantity,
        description: item.description,
      });
    }

    const collectionMethod = body.collection_method ?? "charge_automatically";
    const params: Stripe.InvoiceCreateParams = {
      customer: customerId,
      collection_method: collectionMethod,
      auto_advance: false,
      footer: INVOICE_FOOTER,
      pending_invoice_items_behavior: "include",
    };
    if (collectionMethod === "charge_automatically") {
      params.default_payment_method = body.default_payment_method;
    } else {
      params.days_until_due = body.days_until_due ?? 30;
    }

    const draft = await stripe.invoices.create(params);

    let invoice = await stripe.invoices.finalizeInvoice(draft.id, {
      expand: ["payment_intent", "charge"],
    });

    recordEvent({
      type: "invoice.finalized",
      objectId: invoice.id,
      summary: `Invoice ${invoice.number ?? invoice.id} finalized`,
      amount: invoice.amount_due,
      currency: invoice.currency,
    });

    if (
      collectionMethod === "charge_automatically" &&
      body.default_payment_method &&
      invoice.status === "open"
    ) {
      try {
        invoice = await stripe.invoices.pay(invoice.id, {
          expand: ["payment_intent", "charge"],
        });
      } catch {
        // Keep the invoice open if the auto-charge attempt fails.
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
    }

    return jsonResponse({
      id: invoice.id,
      status: invoice.status,
      number: invoice.number,
      hosted_invoice_url: invoice.hosted_invoice_url,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      customer: customerId,
    });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to create invoice";
    return errorResponse(message, 500);
  }
}
