"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import StatusBadge, { type Status } from "@/components/StatusBadge";
import StripeChip from "@/components/StripeChip";
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

export default function InvoicingPage() {
  const [customerName, setCustomerName] = useState(
    "Qantas Group — Uniform Division"
  );
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

  // Column state
  const [autoCharge, setAutoCharge] = useState<Status>("processing");
  const [becs, setBecs] = useState<Status>("pending");
  const [copied, setCopied] = useState(false);

  const subtotal = lineItemsSubtotal(items);

  useEffect(() => {
    if (!invoice) return;
    // Auto-charge column animation
    setAutoCharge("processing");
    const t1 = setTimeout(() => {
      setAutoCharge(invoice.status === "paid" ? "paid" : "open");
    }, 1800);
    // BECS column simulated settlement
    setBecs("pending");
    const t2 = setTimeout(() => setBecs("confirmed"), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [invoice]);

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );
  }

  async function createAndSend() {
    setBusy(true);
    setError(null);
    setInvoice(null);
    try {
      const res = await fetch("/api/demo/invoices/create-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          lineItems: items,
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

  function resetDemo() {
    setInvoice(null);
    setItems(INVOICING_LINE_ITEMS);
    setCustomerName("Qantas Group — Uniform Division");
    setError(null);
    setAutoCharge("processing");
    setBecs("pending");
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-workwear-ink">
            B2B Invoicing
          </h1>
          <p className="text-gray-600">
            Full invoice lifecycle — build, send, and collect across three
            payment paths.
          </p>
        </div>
        <button
          onClick={resetDemo}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Reset Demo
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Builder */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-workwear-ink">Invoice Builder</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Customer
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Payment terms
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                onChange={(e) =>
                  setCollection(
                    e.target.value as "charge_automatically" | "send_invoice"
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="charge_automatically">
                  charge_automatically
                </option>
                <option value="send_invoice">send_invoice</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {items.map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-12 items-center gap-2 text-sm"
            >
              <input
                value={it.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                className="col-span-7 rounded border border-gray-300 px-2 py-1"
              />
              <input
                type="number"
                value={it.quantity}
                onChange={(e) =>
                  updateItem(i, { quantity: Number(e.target.value) || 0 })
                }
                className="col-span-2 rounded border border-gray-300 px-2 py-1"
              />
              <span className="col-span-3 text-right font-medium">
                {formatAud(it.amountCents * it.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold">{formatAud(subtotal)}</span>
        </div>

        <button
          onClick={createAndSend}
          disabled={busy}
          className="mt-4 w-full rounded-lg bg-workwear-orange px-4 py-2.5 font-semibold text-white hover:bg-workwear-orange-dark disabled:opacity-60 sm:w-auto sm:px-8"
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

      {/* Three columns */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Auto-charge */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold text-workwear-ink">Auto-Charge</h3>
          {!invoice ? (
            <p className="text-sm text-gray-400">
              Create an invoice to see collection status.
            </p>
          ) : collection === "charge_automatically" ? (
            <div className="space-y-3">
              <StatusBadge
                status={autoCharge}
                label={
                  autoCharge === "paid"
                    ? "Paid ✓"
                    : autoCharge === "processing"
                      ? "Charging stored card…"
                      : "Awaiting card"
                }
              />
              <p className="text-sm text-gray-600">
                {autoCharge === "paid"
                  ? `${formatAud(invoice.amount_due)} collected from the stored card on file.`
                  : "Attempting to charge the customer's stored payment method."}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Collection method is <code>send_invoice</code> — the customer pays
              via the hosted invoice page.
            </p>
          )}
        </div>

        {/* BECS */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold text-workwear-ink">
            BECS Direct Debit
          </h3>
          {!invoice ? (
            <p className="text-sm text-gray-400">
              Create an invoice to initiate direct debit.
            </p>
          ) : (
            <div className="space-y-3">
              <StatusBadge status={becs} />
              <p className="text-sm text-gray-600">
                Direct debit initiated — settlement in 1–3 business days.
              </p>
            </div>
          )}
        </div>

        {/* Hosted invoice */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold text-workwear-ink">
            Hosted Invoice Page
          </h3>
          {!invoice?.hosted_invoice_url ? (
            <p className="text-sm text-gray-400">
              A hosted invoice link appears here after sending.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center rounded-lg bg-white p-2">
                <QRCodeCanvas
                  value={invoice.hosted_invoice_url}
                  size={128}
                  fgColor="#1A1A1A"
                />
              </div>
              <p className="text-xs text-gray-600">
                Client opens this link and pays by card, Apple Pay, or bank
                transfer.
              </p>
              <div className="flex gap-2">
                <a
                  href={invoice.hosted_invoice_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-lg bg-workwear-orange px-3 py-2 text-center text-sm font-semibold text-white hover:bg-workwear-orange-dark"
                >
                  Open
                </a>
                <button
                  onClick={copyUrl}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {copied ? "Copied ✓" : "Copy URL"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
