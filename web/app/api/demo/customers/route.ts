import Stripe from "stripe";
import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
import { ENTERPRISE_SOURCE } from "@/lib/enterprise";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  created: number;
  enterprise: boolean;
}

function toRow(c: Stripe.Customer): CustomerRow {
  return {
    id: c.id,
    name: c.name ?? "Unnamed account",
    email: c.email ?? "",
    created: c.created,
    enterprise: c.metadata?.source === ENTERPRISE_SOURCE,
  };
}

/**
 * Lists Workwear Group customers (real Stripe Customer objects).
 * By default returns the seeded enterprise accounts (metadata.source =
 * "workwear_portal"). Pass ?all=1 to list every customer in the account.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all =
      searchParams.get("all") === "1" || searchParams.get("scope") === "all";

    const stripe = getStripe();
    const byId = new Map<string, Stripe.Customer>();

    if (all) {
      for await (const c of stripe.customers.list({ limit: 100 })) {
        byId.set(c.id, c);
      }
    } else {
      try {
        const res = await stripe.customers.search({
          query: `metadata["source"]:"${ENTERPRISE_SOURCE}"`,
          limit: 100,
        });
        for (const c of res.data) byId.set(c.id, c);
      } catch {
        // Search unavailable — fall back to a list scan.
      }
      if (byId.size === 0) {
        for await (const c of stripe.customers.list({ limit: 100 })) {
          if (c.metadata?.source === ENTERPRISE_SOURCE) byId.set(c.id, c);
        }
      }
    }

    const customers = Array.from(byId.values())
      .map(toRow)
      // Enterprise accounts first, then most recently created.
      .sort((a, b) => {
        if (a.enterprise !== b.enterprise) return a.enterprise ? -1 : 1;
        return b.created - a.created;
      });

    return jsonResponse({ customers });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to list customers";
    return errorResponse(message, 500);
  }
}
