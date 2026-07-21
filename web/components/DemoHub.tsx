import Link from "next/link";

const HEADLINE = [
  {
    n: "01",
    title: "NSW Government Contract",
    tag: "Auto-charge on file",
    description:
      "Store each purchasing office's corporate card once, then charge every uniform invoice automatically — no manual chasing.",
    href: "/demo/nsw-gov",
    urgent: true,
  },
  {
    n: "02",
    title: "B2B Invoicing",
    tag: "Enterprise accounts receivable",
    description:
      "Bill enterprise clients ordering in bulk and run the full invoice lifecycle — email, payment link, hosted page and direct debit.",
    href: "/demo/invoicing",
    urgent: false,
  },
  {
    n: "03",
    title: "B2B Portal Checkout",
    tag: "Card at checkout",
    description:
      "Corporate buyers pay by card at checkout in the B2B web portal, while NET-terms clients are invoiced on account instead.",
    href: "/demo/checkout",
    urgent: false,
  },
];

const SECONDARY = [
  {
    title: "MOTO Terminal",
    description: "Finance staff take card payments over the phone.",
    href: "/demo/moto",
    accent: "Finance",
  },
  {
    title: "Payment Links",
    description: "Send clients a self-serve link to pay bulk orders.",
    href: "/demo/payment-links",
    accent: "Self-Serve",
  },
];

export default function DemoHub() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Internal Payments Platform
        </p>
        <h1 className="mt-2 text-4xl font-bold uppercase tracking-[0.02em] text-charcoal heading-din">
          Workwear Group — Digital Payments
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-charcoal-light">
          Three ways Workwear Group collects payment — an automated government
          contract, enterprise invoicing at scale, and card payments in the B2B
          web portal — managed end-to-end from one place.
        </p>
      </div>

      {/* Three headline channels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {HEADLINE.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col overflow-hidden rounded-xl border border-wwgBorder bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
          >
            <div className="flex items-center justify-between border-b border-wwgBorder bg-wwgSurface px-6 py-3">
              <span className="font-mono text-sm font-bold text-wwgGrey">
                {card.n}
              </span>
              {card.urgent ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white" />
                  Urgent
                </span>
              ) : (
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-wwgGrey">
                  {card.tag}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col px-6 py-5">
              {card.urgent && (
                <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-wwgGrey">
                  {card.tag}
                </span>
              )}
              <h2 className="text-2xl font-bold uppercase leading-tight tracking-[0.02em] text-charcoal heading-din">
                {card.title}
              </h2>
              <p className="mt-3 flex-1 leading-relaxed text-charcoal-light">
                {card.description}
              </p>
              <span className="mt-6 inline-flex items-center gap-1 font-semibold uppercase tracking-wide text-brand">
                Open
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Supporting: live event stream */}
      <Link
        href="/demo/events"
        className="group mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-charcoal bg-charcoal px-6 py-6 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-brand" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Operations
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold uppercase tracking-[0.02em] heading-din">
            Live Event Stream
          </h2>
          <p className="mt-1 text-white/70">
            See it all happen live — every customer, invoice and payment across
            the three channels as it lands.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide text-brand">
          Open stream
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </Link>

      {/* Secondary tools */}
      <div className="mt-12">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-wwgGrey">
          More tools
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SECONDARY.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex items-center justify-between rounded-lg border border-wwgBorder bg-white p-5 shadow-sm transition-all hover:border-brand hover:shadow-md"
            >
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-wwgGrey">
                  {card.accent}
                </span>
                <h3 className="mt-1 text-lg font-bold uppercase tracking-[0.02em] text-charcoal heading-din">
                  {card.title}
                </h3>
                <p className="mt-1 text-sm text-charcoal-light">
                  {card.description}
                </p>
              </div>
              <span className="ml-4 text-brand transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
