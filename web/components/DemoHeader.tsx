"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "NSW Gov", href: "/demo/nsw-gov" },
  { label: "Invoicing", href: "/demo/invoicing" },
  { label: "MOTO", href: "/demo/moto" },
  { label: "Event Stream", href: "/demo/events" },
  { label: "Payment Links", href: "/demo/payment-links" },
];

export default function DemoHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/20 bg-charcoal text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/demo" className="flex items-center gap-2">
            <span className="text-xl font-bold uppercase tracking-[0.08em] text-brand">
              WORKWEAR GROUP
            </span>
          </Link>
          <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-white/45 sm:inline">
            Payments Portal
          </span>
        </div>

        <div className="flex items-center gap-6">
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
          </nav>
          <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Demo Mode
          </span>
        </div>
      </div>
    </header>
  );
}
