"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "NSW Gov", href: "/demo/nsw-gov" },
  { label: "Invoicing", href: "/demo/invoicing" },
  { label: "Checkout", href: "/demo/checkout" },
  { label: "Customers", href: "/demo/customers" },
];

const SECONDARY_NAV = [
  { label: "MOTO", href: "/demo/moto" },
  { label: "Payment Links", href: "/demo/payment-links" },
  { label: "Event Stream", href: "/demo/events" },
];

export default function DemoHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/20 bg-charcoal text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold uppercase tracking-[0.08em] text-brand">
              WORKWEAR GROUP
            </span>
          </Link>
          <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-white/45 sm:inline">
            Payments Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
                    active
                      ? "bg-brand text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <span className="mx-1 hidden h-4 w-px bg-white/20 sm:inline-block" />
            {SECONDARY_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/45 hover:bg-white/10 hover:text-white/80"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/demo/checkout"
            className="rounded-md bg-brand px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-dark"
          >
            Shop the Brands
          </Link>
        </div>
      </div>
    </header>
  );
}
