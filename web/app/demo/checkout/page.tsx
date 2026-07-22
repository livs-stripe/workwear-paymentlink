"use client";

import { useMemo, useRef, useState } from "react";
import ProductImage from "@/components/ProductImage";
import PaymentElementForm from "@/components/PaymentElementForm";
import StripeChip from "@/components/StripeChip";
import StatusBadge from "@/components/StatusBadge";
import CustomerSelect, {
  type EnterpriseCustomer,
} from "@/components/CustomerSelect";
import { PRODUCTS, type Product } from "@/lib/inventory";
import { formatAud } from "@/lib/data";

type BuyerType = "card" | "net30";

interface CartEntry {
  product: Product;
  qty: number;
}

const BUYERS: Record<
  BuyerType,
  { company: string; label: string; description: string }
> = {
  card: {
    company: "Broadspectrum Facilities",
    label: "Pay by card at checkout",
    description: "Standard business account — pays per order.",
  },
  net30: {
    company: "John Holland Group",
    label: "NET 30 account (invoice on account)",
    description: "Approved credit terms — orders are invoiced, not charged.",
  },
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [buyerType, setBuyerType] = useState<BuyerType>("card");
  const [netCustomer, setNetCustomer] = useState<EnterpriseCustomer | null>(
    null
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [order, setOrder] = useState<{ id: string } | null>(null);
  const [invoiceResult, setInvoiceResult] = useState<{
    id: string;
    number?: string;
    hosted_invoice_url?: string;
    amount_due: number;
  } | null>(null);

  // Reuse ONE PaymentIntent per session: guard against duplicate creation
  // (double-click / StrictMode) and update the amount if the cart total changes
  // rather than minting a new Incomplete PI.
  const piIdRef = useRef<string | null>(null);
  const piAmountRef = useRef<number>(0);
  const creatingRef = useRef<boolean>(false);

  const entries: CartEntry[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const product = PRODUCTS.find((p) => p.id === id);
          return product ? { product, qty } : null;
        })
        .filter((e): e is CartEntry => e !== null),
    [cart]
  );

  const subtotal = entries.reduce(
    (sum, e) => sum + e.product.priceCents * e.qty,
    0
  );
  const itemCount = entries.reduce((sum, e) => sum + e.qty, 0);
  const checkoutOpen = clientSecret || order || invoiceResult;

  function addToCart(id: string) {
    if (checkoutOpen) return;
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }

  function setQty(id: string, qty: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  async function beginCheckout() {
    if (subtotal <= 0) return;
    setBusy(true);
    setError(null);
    try {
      if (buyerType === "card") {
        // Reuse the session's PaymentIntent if one already exists; only update
        // its amount when the cart total changed. Never create a second PI.
        if (creatingRef.current) return;
        if (piIdRef.current) {
          if (piAmountRef.current !== subtotal) {
            const res = await fetch("/api/demo/checkout/update-intent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentIntentId: piIdRef.current,
                amountCents: subtotal,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed");
            piAmountRef.current = subtotal;
            if (data.client_secret) setClientSecret(data.client_secret);
          } else if (clientSecret) {
            setClientSecret(clientSecret);
          }
        } else {
          creatingRef.current = true;
          try {
            const res = await fetch("/api/demo/checkout/create-intent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amountCents: subtotal,
                buyer: BUYERS.card.company,
                cart: entries.map((e) => ({
                  name: e.product.name,
                  sku: e.product.sku,
                  amountCents: e.product.priceCents,
                  quantity: e.qty,
                })),
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed");
            piIdRef.current = data.id;
            piAmountRef.current = subtotal;
            setClientSecret(data.client_secret);
          } finally {
            creatingRef.current = false;
          }
        }
      } else {
        const res = await fetch("/api/demo/invoices/create-full", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: netCustomer?.id,
            customerName:
              netCustomer?.name ?? `${BUYERS.net30.company} — B2B Portal`,
            collection_method: "send_invoice",
            days_until_due: 30,
            lineItems: entries.map((e) => ({
              description: `${e.product.brand} ${e.product.name} (${e.product.sku})`,
              amountCents: e.product.priceCents,
              quantity: e.qty,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed");
        setInvoiceResult(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  async function onPaid(id: string) {
    setOrder({ id });
    setClientSecret(null);
    // PI is consumed; a subsequent order starts a fresh one.
    piIdRef.current = null;
    piAmountRef.current = 0;
    try {
      await fetch("/api/demo/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      /* event recording is best-effort */
    }
  }

  function resetDemo() {
    setCart({});
    setBuyerType("card");
    setNetCustomer(null);
    setClientSecret(null);
    setOrder(null);
    setInvoiceResult(null);
    setError(null);
    // New session → allow a fresh PaymentIntent for the next cart.
    piIdRef.current = null;
    piAmountRef.current = 0;
    creatingRef.current = false;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            B2B Portal Checkout
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase tracking-[0.02em] text-charcoal heading-din">
            Portal Checkout
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-charcoal-light">
            The Workwear Group B2B web portal storefront. Buyers pay by card at
            checkout; NET-terms accounts are invoiced on account instead.
          </p>
        </div>
        <button
          onClick={resetDemo}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Storefront */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Workwear Group Catalogue
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {PRODUCTS.map((p) => (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-xl border border-wwgBorder bg-white shadow-sm"
              >
                <div className="aspect-[4/3] w-full">
                  <ProductImage product={p} />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-wwgGrey">
                    {p.brand}
                  </span>
                  <h3 className="mt-1 text-sm font-bold leading-snug text-charcoal">
                    {p.name}
                  </h3>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-charcoal-light">
                    {p.description}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-wwgGrey">
                    {p.sku}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-charcoal">
                      {formatAud(p.priceCents)}
                    </span>
                    <button
                      onClick={() => addToCart(p.id)}
                      disabled={Boolean(checkoutOpen)}
                      className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart / checkout */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl border border-wwgBorder bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center justify-between text-sm font-semibold uppercase tracking-wider text-gray-500">
              <span>Cart</span>
              <span className="rounded-full bg-wwgSurface px-2 py-0.5 text-xs text-charcoal">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </h2>

            {entries.length === 0 ? (
              <p className="text-sm text-gray-400">
                Add products from the catalogue to build an order.
              </p>
            ) : (
              <div className="space-y-3">
                {entries.map((e) => (
                  <div
                    key={e.product.id}
                    className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                      <ProductImage product={e.product} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-charcoal">
                        {e.product.name}
                      </p>
                      <p className="text-xs text-charcoal-light">
                        {formatAud(e.product.priceCents)} each
                      </p>
                    </div>
                    {checkoutOpen ? (
                      <span className="text-sm font-medium text-charcoal">
                        ×{e.qty}
                      </span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        value={e.qty}
                        onChange={(ev) =>
                          setQty(e.product.id, Number(ev.target.value) || 0)
                        }
                        className="w-14 rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {entries.length > 0 && (
              <div className="mt-4 space-y-1 border-t border-gray-200 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Subtotal (incl. GST)</span>
                  <span className="font-bold text-charcoal">
                    {formatAud(subtotal)}
                  </span>
                </div>
              </div>
            )}

            {/* Buyer / account type */}
            {entries.length > 0 && !checkoutOpen && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Account type
                </p>
                <div className="space-y-2">
                  {(Object.keys(BUYERS) as BuyerType[]).map((key) => {
                    const b = BUYERS[key];
                    const active = buyerType === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setBuyerType(key)}
                        className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          active
                            ? "border-brand bg-brand-light ring-1 ring-brand/30"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-charcoal">
                          {b.label}
                        </span>
                        <span className="block text-xs text-charcoal-light">
                          {b.company} · {b.description}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {buyerType === "net30" && (
                  <div className="mt-4">
                    <CustomerSelect
                      value={netCustomer?.id ?? null}
                      onChange={setNetCustomer}
                      label="Invoice account"
                    />
                  </div>
                )}

                <button
                  onClick={beginCheckout}
                  disabled={busy || subtotal <= 0}
                  className="mt-4 w-full rounded-lg bg-brand px-4 py-2.5 font-semibold uppercase tracking-wide text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy
                    ? "Working…"
                    : buyerType === "card"
                      ? "Checkout"
                      : "Place order on account"}
                </button>
              </div>
            )}

            {/* Card payment element */}
            {clientSecret && !order && (
              <div className="mt-5 border-t border-gray-200 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Payment
                </p>
                <PaymentElementForm
                  clientSecret={clientSecret}
                  mode="payment"
                  submitLabel={`Pay ${formatAud(subtotal)}`}
                  onSuccess={onPaid}
                />
              </div>
            )}

            {/* Card success */}
            {order && (
              <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-4">
                <p className="text-base font-bold text-green-800">
                  Order confirmed
                </p>
                <p className="mt-1 text-sm text-green-700">
                  {formatAud(subtotal)} paid by card. A confirmation has been
                  sent to the buyer.
                </p>
                <div className="mt-3">
                  <StripeChip id={order.id} type="payment_intent" />
                </div>
              </div>
            )}

            {/* NET 30 invoice branch */}
            {invoiceResult && (
              <div className="mt-5 rounded-lg border border-wwgOrange/40 bg-wwgOrange/5 px-4 py-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status="open" label="Invoiced on account" />
                </div>
                <p className="mt-2 text-sm text-charcoal">
                  This order will be invoiced on your{" "}
                  <span className="font-semibold">NET 30 terms</span>. No card is
                  charged at checkout — the invoice and payment link are emailed
                  to accounts payable.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StripeChip id={invoiceResult.id} type="invoice" />
                  {invoiceResult.hosted_invoice_url && (
                    <a
                      href={invoiceResult.hosted_invoice_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-brand underline"
                    >
                      View hosted invoice →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
