"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import StatusBadge, { type Status } from "@/components/StatusBadge";
import StripeChip from "@/components/StripeChip";
import CustomerSelect, {
  type EnterpriseCustomer,
} from "@/components/CustomerSelect";
import {
  INVOICING_LINE_ITEMS,
  formatAud,
  lineItemsSubtotal,
  type LineItem,
} from "@/lib/data";

const TERMS = [
  { label: "NET 14", value: 14 },
  { label: "NET 30", value: 30 },
  { label: "NET 60", value: 60 },
];

const GST_RATE = 0.1;

export default function InvoicingPage() {
  const [customer, setCustomer] = useState<EnterpriseCustomer | null>(null);
  const customerName = customer?.name ?? "the client";
  const [items, setItems] = useState<LineItem[]>(INVOICING_LINE_ITEMS);
  const [days, setDays] = useState(30);
  const [collection, setCollection] = useState<
    "charge_automatically" | "send_invoice"
  >("charge_automatically");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<{
    id: string;
    number?: string;
    hosted_invoice_url?: string;
    status: string;
    amount_due: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const locked = Boolean(invoice);
  const subtotal = lineItemsSubtotal(items);
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { description: "", amountCents: 0, quantity: 1 },
    ]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function createAndSend() {
    setBusy(true);
    setError(null);
    setInvoice(null);
    try {
      const lineItems = items.filter(
        (it) => it.description.trim() !== "" && it.quantity > 0
      );
      if (lineItems.length === 0) {
        throw new Error("Add at least one line item with a description.");
      }
      const res = await fetch("/api/demo/invoices/create-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customer?.id,
          customerName: customer?.name,
          lineItems,
          days_until_due: days,
          collection_method: collection,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setInvoice(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create invoice");
    } finally {
      setBusy(false);
    }
  }

  function resetInvoice() {
    setInvoice(null);
    setItems(INVOICING_LINE_ITEMS);
    setError(null);
  }

  async function copyUrl() {
    if (!invoice?.hosted_invoice_url) return;
    try {
      await navigator.clipboard.writeText(invoice.hosted_invoice_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Enterprise Accounts Receivable
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase tracking-[0.02em] text-charcoal heading-din">
            B2B Invoicing
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-charcoal-light">
            Build and send invoices to enterprise clients ordering in bulk —
            emailed with a payment link and a hosted invoice page.
          </p>
        </div>
        <button
          onClick={resetInvoice}
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

      {/* Builder */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold uppercase tracking-wide text-charcoal heading-din">
          Invoice Builder
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CustomerSelect
            value={customer?.id ?? null}
            onChange={setCustomer}
            label="Customer"
            disabled={locked}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Payment terms
              </label>
              <select
                value={days}
                disabled={locked}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              >
                {TERMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Collection method
              </label>
              <select
                value={collection}
                disabled={locked}
                onChange={(e) =>
                  setCollection(
                    e.target.value as "charge_automatically" | "send_invoice"
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              >
                <option value="charge_automatically">Auto-charge on file</option>
                <option value="send_invoice">Email invoice</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="mt-6">
          <div className="mb-2 grid grid-cols-12 gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-wwgGrey">
            <span className="col-span-6">Description</span>
            <span className="col-span-2 text-right">Qty</span>
            <span className="col-span-2 text-right">Unit price</span>
            <span className="col-span-2 text-right">Amount</span>
          </div>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center gap-2 text-sm"
              >
                <input
                  value={it.description}
                  disabled={locked}
                  placeholder="Item description"
                  onChange={(e) =>
                    updateItem(i, { description: e.target.value })
                  }
                  className="col-span-6 rounded border border-gray-300 px-2 py-1.5 disabled:bg-gray-100"
                />
                <input
                  type="number"
                  min={0}
                  value={it.quantity}
                  disabled={locked}
                  onChange={(e) =>
                    updateItem(i, { quantity: Number(e.target.value) || 0 })
                  }
                  className="col-span-2 rounded border border-gray-300 px-2 py-1.5 text-right disabled:bg-gray-100"
                />
                <div className="col-span-2 flex items-center rounded border border-gray-300 px-2 py-1.5 disabled:bg-gray-100">
                  <span className="mr-1 text-gray-400">$</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={(it.amountCents / 100).toString()}
                    disabled={locked}
                    onChange={(e) =>
                      updateItem(i, {
                        amountCents: Math.round(
                          (Number(e.target.value) || 0) * 100
                        ),
                      })
                    }
                    className="w-full bg-transparent text-right outline-none disabled:bg-gray-100"
                  />
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className="font-medium tabular-nums">
                    {formatAud(it.amountCents * it.quantity)}
                  </span>
                  {!locked && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      aria-label="Remove item"
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-brand-light hover:text-brand"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!locked && (
            <button
              type="button"
              onClick={addItem}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-sm font-medium text-charcoal-light transition-colors hover:border-brand hover:text-brand"
            >
              <span className="text-base leading-none">+</span> Add item
            </button>
          )}
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-1.5 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal-light">Subtotal</span>
            <span className="font-medium tabular-nums">
              {formatAud(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal-light">GST (10%)</span>
            <span className="font-medium tabular-nums">{formatAud(gst)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-1.5">
            <span className="font-semibold uppercase tracking-wide text-charcoal">
              Total
            </span>
            <span className="text-lg font-bold tabular-nums text-charcoal">
              {formatAud(total)}
            </span>
          </div>
        </div>

        <button
          onClick={createAndSend}
          disabled={busy || locked}
          className="mt-5 w-full rounded-lg bg-brand px-4 py-2.5 font-semibold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {busy ? "Creating & sending…" : "Create & Send Invoice"}
        </button>

        {invoice && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <StripeChip id={invoice.id} type="invoice" />
            <StatusBadge
              status={(invoice.status as Status) ?? "open"}
              label={invoice.status}
            />
          </div>
        )}
      </div>

      {/* Sent-to-client + prominent hosted invoice page */}
      {invoice && (
        <div className="mt-6 overflow-hidden rounded-xl border border-wwgBorder bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-wwgBorder bg-wwgSurface px-6 py-4">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge status="confirmed" label="Sent to client ✓" />
                {invoice.number && (
                  <span className="text-sm font-semibold text-charcoal">
                    {invoice.number}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-charcoal-light">
                Invoice emailed to {customerName} with a secure payment link —
                the hosted invoice page below.
              </p>
            </div>
            {invoice.hosted_invoice_url && (
              <div className="flex gap-2">
                <a
                  href={invoice.hosted_invoice_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-brand-dark"
                >
                  View hosted invoice →
                </a>
                <button
                  onClick={copyUrl}
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {copied ? "Copied ✓" : "Copy URL"}
                </button>
              </div>
            )}
          </div>
          {invoice.hosted_invoice_url && (
            <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-[160px_1fr]">
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg border border-wwgBorder bg-white p-2">
                  <QRCodeCanvas
                    value={invoice.hosted_invoice_url}
                    size={128}
                    fgColor="#2F3540"
                  />
                </div>
                <span className="text-xs text-charcoal-light">
                  Scan to open
                </span>
              </div>
              <iframe
                src={invoice.hosted_invoice_url}
                title="Hosted invoice"
                className="h-[420px] w-full rounded-lg border border-wwgBorder bg-white"
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
