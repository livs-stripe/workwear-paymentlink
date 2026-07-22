import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

/**
 * Creates a card_present PaymentIntent for the Tap to Pay mobile app. Mirrors
 * the root /api/create-payment-intent function but runs on the same server
 * Stripe client (STRIPE_SECRET_KEY) as the rest of /web, so mobile charges land
 * on the SAME Stripe account as the web app and show in the same dashboard.
 * Permissive CORS + OPTIONS preflight handled via lib/cors.
 */
export async function POST(req: Request) {
  try {
    const stripe = getStripe();

    const body = (await req.json().catch(() => ({}))) as {
      amount?: number;
      currency?: string;
      metadata?: Record<string, unknown>;
      company?: unknown;
      site?: unknown;
      contact?: unknown;
      po_number?: unknown;
    };

    const { amount, currency, metadata, company, site, contact, po_number } =
      body;

    if (typeof amount !== "number" || amount <= 0) {
      return errorResponse(
        'A positive integer "amount" (in cents) is required',
        400
      );
    }

    // Whitelist caller-supplied metadata to non-empty strings, capped to
    // Stripe's per-value length limit. Accepts both a `metadata` object and
    // explicit company/site/contact/po_number fields.
    const extraMetadata: Record<string, string> = {};
    const addMeta = (key: string, value: unknown) => {
      if (typeof value === "string" && value.trim().length > 0) {
        extraMetadata[key] = value.trim().slice(0, 500);
      }
    };
    if (metadata && typeof metadata === "object") {
      for (const [key, value] of Object.entries(metadata)) {
        addMeta(key, value);
      }
    }
    addMeta("company", company);
    addMeta("site", site);
    addMeta("contact", contact);
    addMeta("po_number", po_number);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency ?? "aud",
      payment_method_types: ["card_present"],
      capture_method: "automatic",
      metadata: {
        channel: "tap_to_pay",
        brand: "workwear_demo",
        location: "field_sales",
        ...extraMetadata,
      },
    });

    return jsonResponse({
      client_secret: paymentIntent.client_secret,
      id: paymentIntent.id,
      livemode: paymentIntent.livemode,
    });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to create payment intent";
    return errorResponse(message, 500);
  }
}
