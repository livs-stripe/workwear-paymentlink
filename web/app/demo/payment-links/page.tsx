"use client";

import { useCallback, useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import StripeChip from "@/components/StripeChip";
import {
  PAYMENT_LINK_LINE_ITEMS,
  TEST_CARD,
  formatAud,
  lineItemsSubtotal,
  type LineItem,
} from "@/lib/data";

const DEFAULT_CUSTOMER = "Qantas Group — Uniform Division";

interface PaymentLinkResult {
  id: string;
  url: string;
  amountTotalCents: number;
}

interface RecentLink {
  id: string;
  url: string;
  customerName: string;
  amountTotalCents: number;
  timestamp: number;
}

export default function PaymentLinksPage() {
  const [customerName, setCustomerName] = useState(DEFAULT_CUSTOMER);
  const [items, setItems] = useState<LineItem[]>(PAYMENT_LINK_LINE_ITEMS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<PaymentLinkResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [recent, setRecent] = useState<RecentLink[]>([]);

  const subtotal = lineItemsSubtotal(items);
  const gst = Math.round(subtotal / 11); // GST component of a GST-inclusive total

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/demo/payment-links");
      const data = await res.json();
      setRecent(data.links ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { description: "New workwear item", amountCents: 4995, quantity: 1 },
    ]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function generateLink() {
    setBusy(true);
    setError(null);
    setLink(null);
    try {
      const res = await fetch("/api/demo/payment-links/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, lineItems: items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setLink(data);
      loadRecent();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to create payment link"
      );
    } finally {
      setBusy(false);
    }
  }

  function resetDemo() {
    setLink(null);
    setItems(PAYMENT_LINK_LINE_ITEMS);
    setCustomerName(DEFAULT_CUSTOMER);
    setError(null);
    setCopied(false);
  }

  async function copyUrl() {
    if (!link?.url) return;
    try {
      await navigator.clipboard.writeText(link.url);
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
          <h1 className="text-2xl font-bold uppercase tracking-[0.02em] text-charcoal">
            Payment Links
          </h1>
          <p className="text-charcoal-light">
            Send an enterprise client a self-serve link to pay a bulk uniform
            order — no login required.
          </p>
        </div>
        <button
          onClick={resetDemo}
          className="rounded-lg border border-wwgBorder bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-wwgSurface"
        >
          Reset Demo
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT — order builder */}
        <div className="rounded-xl border border-wwgBorder bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold uppercase tracking-wide text-charcoal">
            Bulk Uniform Order
          </h2>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-charcoal-light">
              Client
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-wwgBorder px-3 py-2 text-sm"
            />
          </div>

          <div className="mb-2 grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wide text-wwgGrey">
            <span className="col-span-6">Item</span>
            <span className="col-span-2 text-right">Qty</span>
            <span className="col-span-3 text-right">Unit (AUD)</span>
            <span className="col-span-1" />
          </div>

          <div className="space-y-2">
            {items.map((it, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center gap-2 text-sm"
              >
                <input
                  value={it.description}
                  onChange={(e) =>
                    updateItem(i, { description: e.target.value })
                  }
                  className="col-span-6 rounded border border-wwgBorder px-2 py-1"
                />
                <input
                  type="number"
                  min={0}
                  value={it.quantity}
                  onChange={(e) =>
                    updateItem(i, { quantity: Number(e.target.value) || 0 })
                  }
                  className="col-span-2 rounded border border-wwgBorder px-2 py-1 text-right"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={(it.amountCents / 100).toFixed(2)}
                  onChange={(e) =>
                    updateItem(i, {
                      amountCents: Math.round(
                        (Number(e.target.value) || 0) * 100
                      ),
                    })
                  }
                  className="col-span-3 rounded border border-wwgBorder px-2 py-1 text-right"
                />
                <button
                  onClick={() => removeItem(i)}
                  title="Remove item"
                  className="col-span-1 rounded border border-wwgBorder py-1 text-center text-wwgGrey hover:border-brand hover:text-brand"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addItem}
            className="mt-3 text-sm font-semibold uppercase tracking-wide text-brand hover:text-brand-dark"
          >
            + Add line item
          </button>

          <div className="mt-4 space-y-1 border-t border-wwgBorder pt-3 text-sm">
            <div className="flex items-center justify-between text-charcoal-light">
              <span>Subtotal (inc. GST)</span>
              <span className="font-medium text-charcoal">
                {formatAud(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-charcoal-light">
              <span>Includes GST (10%)</span>
              <span>{formatAud(gst)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-wwgBorder pt-2">
              <span className="font-semibold uppercase tracking-wide text-charcoal">
                Total
              </span>
              <span className="text-lg font-bold text-charcoal">
                {formatAud(subtotal)}
              </span>
            </div>
          </div>

          <button
            onClick={generateLink}
            disabled={busy || items.length === 0}
            className="mt-4 w-full rounded-lg bg-brand px-4 py-2.5 font-semibold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {busy ? "Generating link…" : "Generate Payment Link"}
          </button>
        </div>

        {/* RIGHT — result */}
        <div className="rounded-xl border border-wwgBorder bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold uppercase tracking-wide text-charcoal">
            Payment Link
          </h2>

          {!link ? (
            <p className="text-sm text-wwgGrey">
              Generate a link to see the shareable URL, QR code, and payment
              link ID here.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <StripeChip id={link.id} type="payment_link" />
                <span className="rounded-full bg-charcoal/10 px-2.5 py-1 text-xs font-semibold text-charcoal">
                  {formatAud(link.amountTotalCents)}
                </span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-wwgGrey">
                  Payment link URL
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={link.url}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-wwgBorder bg-wwgSurface px-3 py-2 font-mono text-xs text-charcoal"
                  />
                  <button
                    onClick={copyUrl}
                    className="shrink-0 rounded-lg border border-wwgBorder px-3 py-2 text-sm font-medium text-charcoal hover:bg-wwgSurface"
                  >
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex justify-center rounded-lg border border-wwgBorder bg-white p-3">
                <QRCodeCanvas value={link.url} size={144} fgColor="#2F3540" />
              </div>

              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-lg bg-brand px-4 py-2.5 text-center font-semibold uppercase tracking-wide text-white hover:bg-brand-dark"
              >
                Open payment link
              </a>

              <p className="text-sm text-charcoal-light">
                Send this link to the client — they pay by card, Apple Pay,
                Google Pay, or bank transfer. No login required.
              </p>

              <div className="rounded-lg bg-wwgSurface px-3 py-2 text-xs text-charcoal-light">
                Test card:{" "}
                <span className="font-mono text-charcoal">
                  {TEST_CARD.number}
                </span>{" "}
                · Exp{" "}
                <span className="font-mono text-charcoal">{TEST_CARD.exp}</span>{" "}
                · CVC{" "}
                <span className="font-mono text-charcoal">{TEST_CARD.cvc}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recently generated links */}
      {recent.length > 0 && (
        <div className="mt-6 rounded-xl border border-wwgBorder bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold uppercase tracking-wide text-charcoal">
            Recently Generated Links
          </h2>
          <ul className="divide-y divide-wwgBorder">
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-charcoal">{r.customerName}</p>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-brand hover:underline"
                  >
                    {r.id}
                  </a>
                </div>
                <span className="font-semibold text-charcoal">
                  {formatAud(r.amountTotalCents)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
