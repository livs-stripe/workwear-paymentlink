"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StripeChip from "@/components/StripeChip";
import { formatAud } from "@/lib/data";

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  created: number;
  description: string;
  address: {
    line1?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
  enterprise: boolean;
}

interface InvoiceRow {
  id: string;
  number: string | null;
  status: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  hosted_invoice_url: string | null;
}

interface ChargeRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paid: boolean;
  refunded: boolean;
  description: string | null;
  created: number;
  payment_intent: string | null;
}

function fmtDate(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const INVOICE_STATUS_STYLE: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  open: "bg-orange-100 text-orange-700",
  draft: "bg-gray-100 text-gray-600",
  void: "bg-gray-100 text-gray-500",
  uncollectible: "bg-red-100 text-red-700",
};

function StatusPill({ status }: { status: string | null }) {
  const key = status ?? "draft";
  const style = INVOICE_STATUS_STYLE[key] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${style}`}
    >
      {key}
    </span>
  );
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [charges, setCharges] = useState<ChargeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/demo/customers/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load customer");
      setCustomer(data.customer);
      setInvoices(data.invoices ?? []);
      setCharges(data.charges ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customer");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const addressLine = customer?.address
    ? [
        customer.address.line1,
        customer.address.city,
        customer.address.state,
        customer.address.postal_code,
        customer.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Link
        href="/demo/customers"
        className="text-sm font-medium text-brand hover:text-brand-dark"
      >
        ← All customers
      </Link>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !customer ? (
        <p className="mt-6 text-gray-400">Loading customer…</p>
      ) : customer ? (
        <>
          {/* Header */}
          <div className="mt-4 rounded-xl border border-wwgBorder bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold uppercase tracking-[0.02em] text-charcoal heading-din">
                    {customer.name}
                  </h1>
                  {customer.enterprise && (
                    <span className="rounded-full bg-brand-light px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-dark">
                      Enterprise
                    </span>
                  )}
                </div>
                {customer.email && (
                  <p className="mt-1 text-charcoal-light">{customer.email}</p>
                )}
                {addressLine && (
                  <p className="mt-1 text-sm text-charcoal-light">
                    {addressLine}
                  </p>
                )}
                <p className="mt-2 text-xs text-wwgGrey">
                  Customer since {fmtDate(customer.created)}
                </p>
              </div>
              <StripeChip id={customer.id} type="customer" />
            </div>
          </div>

          {/* Stat summary */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Invoices"
              value={String(invoices.length)}
            />
            <SummaryCard
              label="Total invoiced"
              value={formatAud(
                invoices.reduce((s, i) => s + i.amount_due, 0)
              )}
            />
            <SummaryCard
              label="Total paid"
              value={formatAud(
                charges
                  .filter((c) => c.paid && !c.refunded)
                  .reduce((s, c) => s + c.amount, 0)
              )}
            />
          </div>

          {/* Invoices */}
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-charcoal heading-din">
              Invoices
            </h2>
            <div className="overflow-hidden rounded-xl border border-wwgBorder bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-wwgBorder bg-wwgSurface text-[11px] font-bold uppercase tracking-[0.12em] text-wwgGrey">
                    <th className="px-6 py-3">Invoice</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Amount due</th>
                    <th className="px-6 py-3 text-right">Amount paid</th>
                    <th className="px-6 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No invoices for this customer yet.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-wwgBorder last:border-0"
                      >
                        <td className="px-6 py-4 font-medium text-charcoal">
                          {inv.number ?? inv.id}
                        </td>
                        <td className="px-6 py-4 text-charcoal-light">
                          {fmtDate(inv.created)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill status={inv.status} />
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums">
                          {formatAud(inv.amount_due)}
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums">
                          {formatAud(inv.amount_paid)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {inv.hosted_invoice_url && (
                            <a
                              href={inv.hosted_invoice_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-brand hover:text-brand-dark"
                            >
                              View →
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Charges */}
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-charcoal heading-din">
              Purchases &amp; Payments
            </h2>
            <div className="overflow-hidden rounded-xl border border-wwgBorder bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-wwgBorder bg-wwgSurface text-[11px] font-bold uppercase tracking-[0.12em] text-wwgGrey">
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No payments recorded for this customer yet.
                      </td>
                    </tr>
                  ) : (
                    charges.map((ch) => (
                      <tr
                        key={ch.id}
                        className="border-b border-wwgBorder last:border-0"
                      >
                        <td className="px-6 py-4 text-charcoal">
                          {ch.description || "Payment"}
                        </td>
                        <td className="px-6 py-4 text-charcoal-light">
                          {fmtDate(ch.created)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
                              ch.refunded
                                ? "bg-gray-100 text-gray-600"
                                : ch.paid
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {ch.refunded ? "refunded" : ch.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums">
                          {formatAud(ch.amount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {ch.payment_intent && (
                            <StripeChip
                              id={ch.payment_intent}
                              type="payment_intent"
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-wwgBorder bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-wwgGrey">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-charcoal heading-din">
        {value}
      </p>
    </div>
  );
}
