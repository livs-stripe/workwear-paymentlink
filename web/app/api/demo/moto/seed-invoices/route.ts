import Stripe from "stripe";
import { getStripe, MissingStripeKeyError } from "@/lib/stripe";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
import { recordEvent } from "@/lib/events";
import { INVOICE_FOOTER } from "@/lib/data";
import {
  ENTERPRISE_CLIENTS,
  ENTERPRISE_SOURCE,
  ENTERPRISE_TYPE,
  clientEmail,
} from "@/lib/enterprise";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

// Marks invoices created by this seeder so re-runs can detect them and avoid
// duplicating outstanding invoices for a customer.
const MOTO_SEED_CHANNEL = "moto_seed";
const TARGET_OPEN_INVOICES = 3;

interface InvoiceItemSpec {
  description: string;
  amountCents: number;
  quantity: number;
}

// Realistic bulk workwear order bundles. Each entry becomes one open invoice.
const INVOICE_TEMPLATES: InvoiceItemSpec[][] = [
  [
    {
      description: "Hard Yakka Foundations Drill Cargo Pant (Black)",
      amountCents: 5995,
      quantity: 48,
    },
    {
      description: "Hard Yakka Hi-Vis 2 Tone LS Shirt (Orange/Navy)",
      amountCents: 7495,
      quantity: 36,
    },
  ],
  [
    {
      description: "KingGee Workcool 2 Ripstop LS Shirt (Khaki)",
      amountCents: 5995,
      quantity: 60,
    },
    {
      description: "KingGee Workcool Cargo Pant (Navy)",
      amountCents: 6995,
      quantity: 45,
    },
  ],
  [
    {
      description: "NNT Poly Cotton End On End Tunic (Navy)",
      amountCents: 4995,
      quantity: 40,
    },
  ],
  [
    {
      description: "KingGee Workcool Pro Stretch Cargo (Navy)",
      amountCents: 8995,
      quantity: 30,
    },
    {
      description: "NNT Antibacterial Scrub Pant (Black)",
      amountCents: 6995,
      quantity: 24,
    },
  ],
  [
    {
      description: "Hard Yakka Heritage Hoodie (Navy)",
      amountCents: 5995,
      quantity: 50,
    },
  ],
];

async function ensureCustomers(stripe: Stripe): Promise<Stripe.Customer[]> {
  const byName = new Map<string, Stripe.Customer>();
  try {
    const res = await stripe.customers.search({
      query: `metadata["source"]:"${ENTERPRISE_SOURCE}"`,
      limit: 100,
    });
    for (const c of res.data) if (c.name) byName.set(c.name, c);
  } catch {
    // Search unavailable — fall back to a list scan.
  }
  if (byName.size === 0) {
    for await (const c of stripe.customers.list({ limit: 100 })) {
      if (c.metadata?.source === ENTERPRISE_SOURCE && c.name)
        byName.set(c.name, c);
    }
  }

  const customers: Stripe.Customer[] = [];
  for (const client of ENTERPRISE_CLIENTS) {
    const found = byName.get(client.name);
    if (found) {
      customers.push(found);
      continue;
    }
    const created = await stripe.customers.create({
      name: client.name,
      email: clientEmail(client),
      address: client.address,
      description: `${client.name} — Workwear Group enterprise account`,
      metadata: { type: ENTERPRISE_TYPE, source: ENTERPRISE_SOURCE },
    });
    recordEvent({
      type: "customer.created",
      objectId: created.id,
      summary: `${client.name} enterprise account onboarded`,
    });
    customers.push(created);
  }
  return customers;
}

function acceptsCard(inv: Stripe.Invoice): boolean {
  return (
    inv.payment_settings?.payment_method_types?.includes("card") ?? false
  );
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reset = searchParams.get("reset") === "1" ||
      searchParams.get("reset") === "true";

    const stripe = getStripe();
    const customers = await ensureCustomers(stripe);

    let createdCount = 0;
    let voidedCount = 0;

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];

      const open = await stripe.invoices.list({
        customer: customer.id,
        status: "open",
        limit: 100,
      });
      let existingSeeded = open.data.filter(
        (inv) => inv.metadata?.channel === MOTO_SEED_CHANNEL
      );

      // Reset/clean-up: void legacy seeded invoices whose PaymentIntent wasn't
      // pinned to card (they can't be paid as a single MOTO record) so the
      // re-seed below replaces them with clean card-enabled invoices.
      if (reset) {
        for (const inv of existingSeeded) {
          if (!acceptsCard(inv)) {
            try {
              await stripe.invoices.voidInvoice(inv.id);
              voidedCount += 1;
            } catch {
              // best-effort
            }
          }
        }
        existingSeeded = existingSeeded.filter(acceptsCard);
      }

      // Idempotency: skip customers that already have outstanding (open)
      // card-enabled seeded invoices so re-running never duplicates.
      if (existingSeeded.length >= 1) continue;

      for (let k = 0; k < TARGET_OPEN_INVOICES; k++) {
        const template =
          INVOICE_TEMPLATES[(i + k) % INVOICE_TEMPLATES.length];

        // Create the pending invoice items, then create + finalize the invoice
        // (pending_invoice_items_behavior: include pulls them onto this draft).
        for (const item of template) {
          await stripe.invoiceItems.create({
            customer: customer.id,
            currency: "aud",
            unit_amount: item.amountCents,
            quantity: item.quantity,
            description: item.description,
          });
        }

        const draft = await stripe.invoices.create({
          customer: customer.id,
          collection_method: "send_invoice",
          days_until_due: 21,
          auto_advance: false,
          footer: INVOICE_FOOTER,
          pending_invoice_items_behavior: "include",
          // Pin the invoice's PaymentIntent to card so it can be confirmed as a
          // MOTO transaction (payment_method_options.card.moto). Without this the
          // PI uses dynamic/automatic payment methods and rejects card.moto with
          // "Received unknown parameter: payment_method_options[card][moto]".
          payment_settings: { payment_method_types: ["card"] },
          metadata: {
            channel: MOTO_SEED_CHANNEL,
            source: ENTERPRISE_SOURCE,
          },
        });

        const finalized = await stripe.invoices.finalizeInvoice(draft.id);
        recordEvent({
          type: "invoice.finalized",
          objectId: finalized.id,
          summary: `Invoice ${finalized.number ?? finalized.id} finalized — ${customer.name}`,
          amount: finalized.amount_due,
          currency: finalized.currency,
        });
        createdCount += 1;
      }
    }

    return jsonResponse({ created: createdCount, voided: voidedCount });
  } catch (err) {
    if (err instanceof MissingStripeKeyError) {
      return errorResponse(err.message, 500);
    }
    const message =
      err instanceof Error ? err.message : "Failed to seed invoices";
    return errorResponse(message, 500);
  }
}
