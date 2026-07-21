import Stripe from "stripe";
import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
import { ENTERPRISE_SOURCE } from "@/lib/enterprise";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

/**
 * Returns a single customer together with their invoices and charges, pulled
 * live from the Stripe API.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) return errorResponse('A customer "id" is required', 400);

    const stripe = getStripe();

    const customer = await stripe.customers.retrieve(id);
    if ((customer as Stripe.DeletedCustomer).deleted) {
      return errorResponse("This customer has been deleted", 404);
    }
    const c = customer as Stripe.Customer;

    const [invoicesRes, chargesRes] = await Promise.all([
      stripe.invoices.list({ customer: id, limit: 100 }),
      stripe.charges.list({ customer: id, limit: 100 }),
    ]);

    const invoices = invoicesRes.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amount_due: inv.amount_due,
      amount_paid: inv.amount_paid,
      currency: inv.currency,
      created: inv.created,
      hosted_invoice_url: inv.hosted_invoice_url,
    }));

    const charges = chargesRes.data.map((ch) => ({
      id: ch.id,
      amount: ch.amount,
      currency: ch.currency,
      status: ch.status,
      paid: ch.paid,
      refunded: ch.refunded,
      description: ch.description,
      created: ch.created,
      payment_intent:
        typeof ch.payment_intent === "string"
          ? ch.payment_intent
          : (ch.payment_intent?.id ?? null),
    }));

    return jsonResponse({
      customer: {
        id: c.id,
        name: c.name ?? "Unnamed account",
        email: c.email ?? "",
        created: c.created,
        description: c.description ?? "",
        address: c.address ?? null,
        enterprise: c.metadata?.source === ENTERPRISE_SOURCE,
      },
      invoices,
      charges,
    });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to load customer";
    return errorResponse(message, 500);
  }
}
