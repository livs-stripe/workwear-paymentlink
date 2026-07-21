import Link from "next/link";
import DemoHeader from "@/components/DemoHeader";
import SiteFooter from "@/components/SiteFooter";
import { WWG_IMAGES, BRAND_TILES } from "@/lib/brand";

const STATS = [
  { value: "3", label: "World-class workwear brands" },
  { value: "19", label: "NSW Health hospitals automated" },
  { value: "NET 30", label: "Enterprise terms, collected on time" },
  { value: "1", label: "Unified payments platform" },
];

const CHANNELS = [
  {
    n: "01",
    title: "Government Contracts",
    copy: "Store each agency's corporate card once, then auto-charge every invoice — no chasing, no manual reconciliation.",
    href: "/demo/nsw-gov",
    cta: "NSW Government",
  },
  {
    n: "02",
    title: "Enterprise Invoicing",
    copy: "Bill Qantas, Australia Post and construction majors at scale — hosted invoices, payment links, bank transfer and BECS.",
    href: "/demo/invoicing",
    cta: "B2B Invoicing",
  },
  {
    n: "03",
    title: "B2B Portal Checkout",
    copy: "Corporate buyers pay by card at checkout inside SAP Commerce Cloud, while NET-terms accounts are invoiced automatically.",
    href: "/demo/checkout",
    cta: "Portal Checkout",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <DemoHeader />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-charcoal">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={WWG_IMAGES.hero}
          alt="Workwear Group brands"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/55 to-charcoal/85" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-28 text-center sm:py-36">
          <span className="mb-4 inline-block rounded-full border border-white/25 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Workwear Group · Payments
          </span>
          <h1 className="heading-din max-w-4xl text-4xl font-bold uppercase leading-[1.05] text-white sm:text-6xl">
            One Payments Platform For Every Workwear Transaction
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            From automated government contracts to enterprise invoicing and B2B
            portal checkout — Workwear Group collects every payment across Hard
            Yakka, KingGee and NNT on a single unified platform.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/demo/checkout"
              className="rounded-md bg-brand px-7 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-lg shadow-brand/30 transition-colors hover:bg-brand-dark"
            >
              Shop the Brands
            </Link>
            <Link
              href="/demo/nsw-gov"
              className="rounded-md border border-white/40 bg-white/5 px-7 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white backdrop-blur transition-colors hover:bg-white/15"
            >
              Explore the Platform
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-b border-wwgBorder bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-wwgBorder md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white px-6 py-8 text-center">
              <p className="heading-din text-3xl font-bold text-brand">
                {s.value}
              </p>
              <p className="mt-1 text-sm leading-snug text-charcoal-light">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW PAYMENTS WORK */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            How we get paid
          </p>
          <h2 className="heading-din mt-3 text-3xl font-bold uppercase text-charcoal sm:text-4xl">
            Three channels, one platform
          </h2>
          <p className="mt-4 text-lg text-charcoal-light">
            Every way Workwear Group collects money from its partners and
            customers — unified, automated and reconciled end-to-end.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {CHANNELS.map((c) => (
            <Link
              key={c.n}
              href={c.href}
              className="group flex flex-col rounded-xl border border-wwgBorder bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg"
            >
              <span className="heading-din text-4xl font-bold text-wwgBorder transition-colors group-hover:text-brand">
                {c.n}
              </span>
              <h3 className="heading-din mt-4 text-2xl font-bold uppercase text-charcoal">
                {c.title}
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-charcoal-light">
                {c.copy}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.08em] text-brand">
                {c.cta}
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* BRANDS */}
      <section className="bg-wwgSurface py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Our brands
            </p>
            <h2 className="heading-din mt-3 text-3xl font-bold uppercase text-charcoal sm:text-4xl">
              Three world-class workwear brands
            </h2>
            <p className="mt-4 text-lg text-charcoal-light">
              Trusted on worksites, in hospitals and across corporate Australia
              — and every order is paid for on the same platform.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {BRAND_TILES.map((b) => (
              <Link
                key={b.name}
                href={b.href}
                className="group relative flex h-96 flex-col justify-end overflow-hidden rounded-xl bg-charcoal shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image}
                  alt={b.name}
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
                <div
                  className="absolute left-0 top-0 h-1.5 w-full"
                  style={{ backgroundColor: b.accent }}
                />
                <div className="relative p-6">
                  <h3 className="heading-din text-2xl font-bold uppercase text-white">
                    {b.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">
                    {b.blurb}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.08em] text-white">
                    Shop {b.name}
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / WESFARMERS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={WWG_IMAGES.about}
              alt="About Workwear Group"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              About us
            </p>
            <h2 className="heading-din mt-3 text-3xl font-bold uppercase text-charcoal sm:text-4xl">
              The trusted partner in workwear solutions
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-charcoal-light">
              Workwear Group is proud to be the trusted partner in workwear
              solutions, owned and backed by Wesfarmers. We outfit government,
              enterprise and healthcare Australia — and this platform makes sure
              every one of those orders is paid for quickly, securely and
              automatically.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Live records — customers, invoices and payments in one place",
                "Automated card-on-file charging for contract accounts",
                "Card, bank transfer, direct debit and payment links",
              ].map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-charcoal"
                >
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                    ✓
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="bg-brand">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-16 text-center">
          <h2 className="heading-din max-w-3xl text-3xl font-bold uppercase text-white sm:text-4xl">
            See every payment land in real time
          </h2>
          <p className="max-w-2xl text-lg text-white/90">
            Watch customers, invoices and payments flow across all three
            channels as they happen — live.
          </p>
          <Link
            href="/demo/events"
            className="rounded-md bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.08em] text-brand transition-colors hover:bg-charcoal hover:text-white"
          >
            Open the Event Stream
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
