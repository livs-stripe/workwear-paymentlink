"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  created: number;
  enterprise: boolean;
}

function fmtDate(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/customers?all=1");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load customers");
      setCustomers(data.customers ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function seed() {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/customers/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to seed customers");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to seed customers");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Accounts
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase tracking-[0.02em] text-charcoal heading-din">
            Customers
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-charcoal-light">
            Every Workwear Group account on file. Select a customer to view
            their invoices and payment history.
          </p>
        </div>
        <button
          onClick={seed}
          disabled={seeding}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          {seeding ? "Adding…" : "Add enterprise accounts"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-wwgBorder bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-wwgBorder bg-wwgSurface text-[11px] font-bold uppercase tracking-[0.12em] text-wwgGrey">
              <th className="px-6 py-3">Account</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3 text-right">Customer ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                  Loading customers…
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                  No customers found. Use “Add enterprise accounts” to create
                  the Workwear Group enterprise clients.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-wwgBorder last:border-0 transition-colors hover:bg-wwgSurface/60"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/demo/customers/${c.id}`}
                      className="font-semibold text-charcoal hover:text-brand"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-charcoal-light">
                    {c.email || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {c.enterprise ? (
                      <span className="rounded-full bg-brand-light px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-dark">
                        Enterprise
                      </span>
                    ) : (
                      <span className="rounded-full bg-wwgSurface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-wwgGrey">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-charcoal-light">
                    {fmtDate(c.created)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/demo/customers/${c.id}`}
                      className="font-mono text-[11px] text-wwgGrey hover:text-brand"
                    >
                      {c.id}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
