import Link from "next/link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] =
  [
    {
      heading: "Payments",
      links: [
        { label: "NSW Government", href: "/demo/nsw-gov" },
        { label: "Enterprise Invoicing", href: "/demo/invoicing" },
        { label: "Portal Checkout", href: "/demo/checkout" },
        { label: "Event Stream", href: "/demo/events" },
      ],
    },
    {
      heading: "Finance Tools",
      links: [
        { label: "Phone Payments", href: "/demo/moto" },
        { label: "Payment Links", href: "/demo/payment-links" },
      ],
    },
    {
      heading: "Our Brands",
      links: [
        { label: "Hard Yakka", href: "/demo/checkout" },
        { label: "KingGee", href: "/demo/checkout" },
        { label: "NNT", href: "/demo/checkout" },
      ],
    },
  ];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-charcoal text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <span className="text-xl font-bold uppercase tracking-[0.08em] text-brand heading-din">
              Workwear Group
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              The leading workwear solutions provider — home of Hard Yakka,
              KingGee and NNT. Owned and backed by Wesfarmers.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-white/40">
              Unified B2B Payments Platform
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center">
          <span>
            Workwear Group Pty Ltd · ABN 12 345 678 901 · A Wesfarmers company
          </span>
          <span className="uppercase tracking-[0.16em]">
            Unified Payments Platform
          </span>
        </div>
      </div>
    </footer>
  );
}
