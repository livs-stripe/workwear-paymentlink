import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

/**
 * Lists the outstanding (open) invoices for a customer, live from Stripe.
 * Used by the MOTO terminal to show payable invoices for the selected account.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customer = searchParams.get("customer");
    if (!customer) {
      return errorResponse('A "customer" id is required', 400);
    }

    const stripe = getStripe();
    const res = await stripe.invoices.list({
      customer,
      status: "open",
      limit: 100,
    });

    const invoices = res.data
      .map((inv) => ({
        id: inv.id,
        number: inv.number,
        amount_due: inv.amount_due,
        currency: inv.currency,
        due_date: inv.due_date,
        created: inv.created,
        hosted_invoice_url: inv.hosted_invoice_url,
      }))
      .sort((a, b) => (a.due_date ?? a.created) - (b.due_date ?? b.created));

    return jsonResponse({ invoices });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to list invoices";
    return errorResponse(message, 500);
  }
}
