"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StripeChip from "@/components/StripeChip";
import CustomerSelect, {
  type EnterpriseCustomer,
} from "@/components/CustomerSelect";
import { formatAud } from "@/lib/data";

const TEST_CARDS = [
  { key: "visa", label: "Visa ···· 4242" },
  { key: "mastercard", label: "Mastercard ···· 4444" },
  { key: "amex", label: "Amex ···· 8431" },
  { key: "declined", label: "Declined ···· 0002" },
];

interface OpenInvoice {
  id: string;
  number: string | null;
  amount_due: number;
  currency: string;
  due_date: number | null;
  created: number;
}

function fmtDate(epochSeconds: number | null): string {
  if (!epochSeconds) return "—";
  return new Date(epochSeconds * 1000).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface PaidInfo {
  amount: number;
  paymentIntent: string;
  number: string | null;
}

export default function MotoPage() {
  const [customer, setCustomer] = useState<EnterpriseCustomer | null>(null);
  const [invoices, setInvoices] = useState<OpenInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [note, setNote] = useState("");
  const [card, setCard] = useState("visa");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState<PaidInfo | null>(null);

  const seededRef = useRef(false);

  const invoice =
    invoices.find((i) => i.id === selectedInvoiceId) ?? null;

  const loadInvoices = useCallback(async (customerId: string) => {
    setLoadingInvoices(true);
    setError(null);
    try {
      let res = await fetch(
        `/api/demo/moto/invoices?customer=${encodeURIComponent(customerId)}`
      );
      let data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load invoices");

      // Seed outstanding invoices once if this account has none yet.
      if ((data.invoices ?? []).length === 0 && !seededRef.current) {
        seededRef.current = true;
        const seedRes = await fetch("/api/demo/moto/seed-invoices", {
          method: "POST",
        });
        if (seedRes.ok) {
          res = await fetch(
            `/api/demo/moto/invoices?customer=${encodeURIComponent(customerId)}`
          );
          data = await res.json();
        }
      }

      setInvoices(data.invoices ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load invoices");
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  useEffect(() => {
    if (!customer?.id) return;
    setSelectedInvoiceId(null);
    setPaid(null);
    loadInvoices(customer.id);
  }, [customer?.id, loadInvoices]);

  async function takePayment() {
    if (!invoice) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/moto/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice: invoice.id, card, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      if (data.invoice_status === "paid") {
        setPaid({
          amount: invoice.amount_due,
          paymentIntent: data.payment_intent,
          number: invoice.number,
        });
        setSelectedInvoiceId(null);
        setNote("");
        // Re-fetch open invoices so the just-paid invoice drops off the list.
        if (customer?.id) await loadInvoices(customer.id);
      } else {
        throw new Error(
          `Payment ${data.payment_status ?? "was not completed"} — try another card.`
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to take payment");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setSelectedInvoiceId(null);
    setNote("");
    setCard("visa");
    setPaid(null);
    setError(null);
    if (customer?.id) loadInvoices(customer.id);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="heading-din text-2xl font-bold text-charcoal">
            MOTO Payment Terminal
          </h1>
          <p className="text-gray-600">
            Finance staff take card payments over the phone on behalf of the
            customer.
          </p>
        </div>
        <button
          onClick={reset}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: account lookup */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <CustomerSelect
            value={customer?.id ?? null}
            onChange={setCustomer}
            label="Customer account"
          />

          <h3 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Outstanding invoices
          </h3>
          <div className="space-y-2">
            {loadingInvoices ? (
              <p className="py-4 text-sm text-gray-400">Loading invoices…</p>
            ) : invoices.length === 0 ? (
              <p className="py-4 text-sm text-gray-400">
                No outstanding invoices for this account.
              </p>
            ) : (
              invoices.map((inv) => {
                const active = selectedInvoiceId === inv.id;
                return (
                  <button
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvoiceId(inv.id);
                      setPaid(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                      active
                        ? "border-brand bg-brand-light"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-charcoal">
                        Invoice {inv.number ?? inv.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        Due {fmtDate(inv.due_date)}
                      </p>
                    </div>
                    <span className="font-bold">
                      {formatAud(inv.amount_due)}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {invoice && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">
                Take payment for Invoice {invoice.number ?? invoice.id} —{" "}
                {formatAud(invoice.amount_due)}
              </p>
              <label className="mb-1 mt-3 block text-xs font-medium text-gray-600">
                Note (optional, added to payment metadata)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Paid by A/P over phone, ref call #4821"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        {/* RIGHT: payment collection */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold text-charcoal">
            Card Payment (MOTO)
          </h3>
          <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
            MOTO payment — card details are keyed in by finance staff on behalf
            of the customer. Ensure verbal consent has been obtained. The MOTO
            exemption is flagged on the PaymentIntent at confirmation.
          </div>

          {paid ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-semibold text-green-800">
                Invoice {paid.number ?? ""} paid — {formatAud(paid.amount)}
              </p>
              <p className="mt-1 text-sm text-green-700">
                Charged as a MOTO transaction (SCA-exempt). The invoice is now
                marked paid and has dropped off the outstanding list.
              </p>
              <div className="mt-2">
                <StripeChip id={paid.paymentIntent} type="payment_intent" />
              </div>
            </div>
          ) : !invoice ? (
            <p className="text-sm text-gray-400">
              Select an outstanding invoice to collect payment.
            </p>
          ) : (
            <>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Card provided over the phone
              </label>
              <select
                value={card}
                onChange={(e) => setCard(e.target.value)}
                className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {TEST_CARDS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                onClick={takePayment}
                disabled={busy}
                className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {busy
                  ? "Charging…"
                  : `Charge ${formatAud(invoice.amount_due)}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
