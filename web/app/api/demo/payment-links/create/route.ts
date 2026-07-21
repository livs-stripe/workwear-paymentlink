import Stripe from "stripe";
import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
import { recordEvent } from "@/lib/events";
import { recordPaymentLink } from "@/lib/payment-links";

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
      lineItems?: LineItemInput[];
    };

    if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
      return errorResponse("At least one line item is required", 400);
    }

    for (const item of body.lineItems) {
      if (
        typeof item.amountCents !== "number" ||
        item.amountCents <= 0 ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0
      ) {
        return errorResponse(
          "Each line item needs a positive amountCents and quantity",
          400
        );
      }
    }

    const customerName = body.customerName?.trim() || "Enterprise Client";
    const stripe = getStripe();

    // Payment Links require line_items[].price to be a Price ID — they do NOT
    // accept inline price_data. So create a Product + Price per line item.
    const lineItems: Stripe.PaymentLinkCreateParams.LineItem[] = [];
    let amountTotalCents = 0;

    for (const item of body.lineItems) {
      const product = await stripe.products.create({
        name: item.description,
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(item.amountCents),
        currency: "aud",
      });
      lineItems.push({ price: price.id, quantity: item.quantity });
      amountTotalCents += Math.round(item.amountCents) * item.quantity;
    }

    const paymentLink = await stripe.paymentLinks.create({
      line_items: lineItems,
      metadata: {
        channel: "payment_link",
        brand: "workwear_demo",
        customer_name: customerName,
      },
    });

    recordEvent({
      type: "payment_link.created",
      objectId: paymentLink.id,
      summary: `Payment link created — ${customerName}`,
      amount: amountTotalCents,
      currency: "aud",
    });

    recordPaymentLink({
      id: paymentLink.id,
      url: paymentLink.url,
      customerName,
      amountTotalCents,
      timestamp: Date.now(),
    });

    return jsonResponse({
      id: paymentLink.id,
      url: paymentLink.url,
      amountTotalCents,
    });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to create payment link";
    return errorResponse(message, 500);
  }
}
