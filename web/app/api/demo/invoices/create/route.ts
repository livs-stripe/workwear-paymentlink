import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
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
      customer?: string;
      default_payment_method?: string;
      lineItems?: LineItemInput[];
      days_until_due?: number;
      collection_method?: "charge_automatically" | "send_invoice";
    };

    if (!body.customer) {
      return errorResponse('A "customer" id is required', 400);
    }
    if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
      return errorResponse("At least one line item is required", 400);
    }

    const stripe = getStripe();

    // Create pending invoice items for the customer first. When we then create
    // the invoice (without specifying line items), Stripe pulls all pending
    // invoice items for that customer onto the invoice.
    for (const item of body.lineItems) {
      await stripe.invoiceItems.create({
        customer: body.customer,
        currency: "aud",
        unit_amount: Math.round(item.amountCents),
        quantity: item.quantity,
        description: item.description,
      });
    }

    const collectionMethod = body.collection_method ?? "charge_automatically";

    const params: import("stripe").Stripe.InvoiceCreateParams = {
      customer: body.customer,
      collection_method: collectionMethod,
      auto_advance: false,
      footer: INVOICE_FOOTER,
      pending_invoice_items_behavior: "include",
    };
    if (collectionMethod === "charge_automatically") {
      // days_until_due is only valid for send_invoice; the NET terms are
      // communicated via the invoice footer for auto-charge invoices.
      params.default_payment_method = body.default_payment_method;
    } else {
      params.days_until_due = body.days_until_due ?? 30;
    }

    const invoice = await stripe.invoices.create(params);

    return jsonResponse(invoice);
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to create invoice";
    return errorResponse(message, 500);
  }
}
