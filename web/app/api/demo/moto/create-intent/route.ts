import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      amountCents?: number;
      customer_name?: string;
      invoice_ref?: string;
      note?: string;
    };

    if (typeof body.amountCents !== "number" || body.amountCents <= 0) {
      return errorResponse('A positive "amountCents" is required', 400);
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(body.amountCents),
      currency: "aud",
      payment_method_types: ["card"],
      payment_method_options: { card: { moto: true } },
      confirm: false,
      metadata: {
        channel: "moto",
        customer_name: body.customer_name ?? "",
        invoice_ref: body.invoice_ref ?? "",
        note: body.note ?? "",
      },
    });

    return jsonResponse({
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
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
