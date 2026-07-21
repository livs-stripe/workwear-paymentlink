"use client";

import { useEffect, useRef, useState } from "react";
import PaymentElementForm from "@/components/PaymentElementForm";
import StripeChip from "@/components/StripeChip";
import StatusBadge, { type Status } from "@/components/StatusBadge";
import {
  NSW_HEALTH_OFFICES,
  NSW_GOV_LINE_ITEMS,
  formatAud,
  lineItemsSubtotal,
  type LineItem,
} from "@/lib/data";

type Step = 1 | 2 | 3;

export default function NswGovPage() {
  const [office, setOffice] = useState(NSW_HEALTH_OFFICES[0]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [items, setItems] = useState<LineItem[]>(NSW_GOV_LINE_ITEMS);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<Status>("draft");
  const [paidInfo, setPaidInfo] = useState<{
    amount: number;
    pi?: string;
    charge?: string;
    url?: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const subtotal = lineItemsSubtotal(items);
  const gst = Math.round(subtotal * 0.1);
  const total = subtotal + gst;

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function beginOnboarding() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/customers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: office }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setCustomerId(data.id);

      const siRes = await fetch("/api/demo/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: data.id }),
      });
      const siData = await siRes.json();
      if (!siRes.ok) throw new Error(siData.error ?? "Failed");
      setSetupSecret(siData.client_secret);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onboarding failed");
    } finally {
      setBusy(false);
    }
  }

  async function createInvoice() {
    if (!customerId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customerId,
          default_payment_method: paymentMethodId,
          lineItems: items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setInvoiceId(data.id);
      setInvoiceStatus("draft");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invoice creation failed");
    } finally {
      setBusy(false);
    }
  }

  async function finalizeInvoice() {
    if (!invoiceId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/invoices/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoiceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setInvoiceStatus("open");
      startPolling();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Finalize failed");
    } finally {
      setBusy(false);
    }
  }

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      if (!invoiceId) return;
      try {
        const res = await fetch(`/api/demo/invoices/${invoiceId}`);
        const data = await res.json();
        if (!res.ok) return;
        if (data.status === "paid") {
          setInvoiceStatus("paid");
          setPaidInfo({
            amount: data.amount_paid ?? total,
            pi: data.payment_intent?.id,
            charge: data.charge?.id,
            url: data.hosted_invoice_url,
          });
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (data.status === "open") {
          setInvoiceStatus("open");
        }
      } catch {
        // keep polling
      }
    }, 1500);
  }

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );
  }

  function resetDemo() {
    if (pollRef.current) clearInterval(pollRef.current);
    setCustomerId(null);
    setSetupSecret(null);
    setPaymentMethodId(null);
    setItems(NSW_GOV_LINE_ITEMS);
    setInvoiceId(null);
    setInvoiceStatus("draft");
    setPaidInfo(null);
    setError(null);
    fetch("/api/demo/reset", { method: "POST" }).catch(() => {});
  }

  const cardOnFile = Boolean(paymentMethodId);
  const currentStep: Step = paidInfo || invoiceId ? 3 : cardOnFile ? 2 : 1;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">
            NSW Government vCard Auto-Charge
          </h1>
          <p className="text-gray-600">
            Onboard a NSW Health purchasing office, store its Citibank vCard, and
            auto-charge at invoice generation.
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

      {paidInfo && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-6 py-4">
          <p className="text-lg font-bold text-green-800">
            Invoice paid — {formatAud(paidInfo.amount)} charged to Citibank
            vCard on file
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {paidInfo.pi && (
              <StripeChip id={paidInfo.pi} type="payment_intent" />
            )}
            {paidInfo.charge && (
              <StripeChip id={paidInfo.charge} type="charge" />
            )}
            {paidInfo.url && (
              <a
                href={paidInfo.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-brand underline"
              >
                View hosted invoice →
              </a>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: step-by-step flow */}
        <div className="space-y-5">
          {/* Step 1 */}
          <StepCard
            n={1}
            title="Onboard Purchasing Office"
            active={currentStep === 1}
            done={cardOnFile}
          >
            <label className="mb-1 block text-sm font-medium text-gray-700">
              NSW Health Office
            </label>
            <select
              value={office}
              disabled={Boolean(customerId)}
              onChange={(e) => setOffice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            >
              {NSW_HEALTH_OFFICES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            {!customerId && (
              <button
                onClick={beginOnboarding}
                disabled={busy}
                className="mt-3 w-full rounded-lg bg-brand px-4 py-2.5 font-semibold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {busy ? "Working…" : "Begin Onboarding"}
              </button>
            )}

            {setupSecret && !cardOnFile && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Citibank vCard Details — One-time setup
                </p>
                <PaymentElementForm
                  clientSecret={setupSecret}
                  mode="setup"
                  submitLabel="Store vCard"
                  onSuccess={(pm) => setPaymentMethodId(pm)}
                />
              </div>
            )}

            {cardOnFile && (
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Card on file ✓
                </span>
                <span className="text-sm text-gray-600">{office}</span>
              </div>
            )}
          </StepCard>

          {/* Step 2 */}
          <StepCard
            n={2}
            title="Generate Invoice"
            active={currentStep === 2}
            done={Boolean(invoiceId)}
            disabled={!cardOnFile}
          >
            {cardOnFile ? (
              <>
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
                        disabled={Boolean(invoiceId)}
                        className="col-span-7 rounded border border-gray-300 px-2 py-1 disabled:bg-gray-100"
                      />
                      <input
                        type="number"
                        value={it.quantity}
                        onChange={(e) =>
                          updateItem(i, {
                            quantity: Number(e.target.value) || 0,
                          })
                        }
                        disabled={Boolean(invoiceId)}
                        className="col-span-2 rounded border border-gray-300 px-2 py-1 disabled:bg-gray-100"
                      />
                      <span className="col-span-3 text-right font-medium">
                        {formatAud(it.amountCents * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-sm">
                  <Row label="Subtotal" value={formatAud(subtotal)} />
                  <Row label="GST (10%)" value={formatAud(gst)} />
                  <Row label="Total" value={formatAud(total)} bold />
                  <p className="pt-1 text-xs text-gray-500">
                    Payment terms NET 30
                  </p>
                </div>
                {!invoiceId && (
                  <button
                    onClick={createInvoice}
                    disabled={busy}
                    className="mt-3 w-full rounded-lg bg-brand px-4 py-2.5 font-semibold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {busy ? "Creating…" : "Create Invoice"}
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">
                Store a card on file to enable invoicing.
              </p>
            )}
          </StepCard>

          {/* Step 3 */}
          <StepCard
            n={3}
            title="Finalize & Auto-Charge"
            active={currentStep === 3}
            done={Boolean(paidInfo)}
            disabled={!invoiceId}
          >
            {invoiceId ? (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">Invoice status:</span>
                  <StatusBadge status={invoiceStatus} />
                </div>
                {!paidInfo && invoiceStatus === "draft" && (
                  <button
                    onClick={finalizeInvoice}
                    disabled={busy}
                    className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {busy ? "Finalizing…" : "Finalize Invoice"}
                  </button>
                )}
                {!paidInfo && invoiceStatus === "open" && (
                  <p className="text-sm text-blue-600">
                    Charging Citibank vCard on file…
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">
                Create an invoice to finalize and charge.
              </p>
            )}
          </StepCard>
        </div>

        {/* RIGHT: live data panel */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Live Stripe Objects
          </h2>
          <div className="space-y-4">
            <DataRow label="Purchasing Office" value={office} />
            <DataRow
              label="Customer"
              chip={
                customerId ? (
                  <StripeChip id={customerId} type="customer" />
                ) : undefined
              }
            />
            <DataRow
              label="Payment Method (vCard)"
              chip={
                paymentMethodId ? (
                  <StripeChip id={paymentMethodId} type="payment_method" />
                ) : undefined
              }
            />
            <DataRow
              label="Invoice"
              chip={
                invoiceId ? (
                  <StripeChip id={invoiceId} type="invoice" />
                ) : undefined
              }
              extra={
                invoiceId ? <StatusBadge status={invoiceStatus} /> : undefined
              }
            />
            {paidInfo?.pi && (
              <DataRow
                label="PaymentIntent"
                chip={<StripeChip id={paidInfo.pi} type="payment_intent" />}
              />
            )}
            {paidInfo?.charge && (
              <DataRow
                label="Charge"
                chip={<StripeChip id={paidInfo.charge} type="charge" />}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  n,
  title,
  children,
  active,
  done,
  disabled,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
  active?: boolean;
  done?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm transition-colors ${
        active
          ? "border-brand ring-1 ring-brand/30"
          : "border-gray-200"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
            done
              ? "bg-green-100 text-green-700"
              : active
                ? "bg-brand text-white"
                : "bg-gray-200 text-gray-600"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <h3 className="font-semibold text-charcoal">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-semibold" : "text-gray-600"}>{label}</span>
      <span className={bold ? "font-bold" : ""}>{value}</span>
    </div>
  );
}

function DataRow({
  label,
  value,
  chip,
  extra,
}: {
  label: string;
  value?: string;
  chip?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        {chip ?? (value ? <span className="text-sm font-medium">{value}</span> : <span className="text-sm text-gray-300">—</span>)}
        {extra}
      </div>
    </div>
  );
}
