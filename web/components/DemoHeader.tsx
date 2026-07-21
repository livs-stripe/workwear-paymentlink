"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "NSW Gov", href: "/demo/nsw-gov" },
  { label: "Invoicing", href: "/demo/invoicing" },
  { label: "MOTO", href: "/demo/moto" },
  { label: "Event Stream", href: "/demo/events" },
];

export default function DemoHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-workwear-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/demo" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-workwear-orange">
              WORKWEAR GROUP
            </span>
          </Link>
          <span className="hidden text-xs font-medium uppercase tracking-widest text-white/40 sm:inline">
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
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-workwear-orange text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <span className="rounded-full bg-workwear-orange px-3 py-1 text-xs font-semibold text-white">
            Demo Mode
          </span>
        </div>
      </div>
    </header>
  );
}
