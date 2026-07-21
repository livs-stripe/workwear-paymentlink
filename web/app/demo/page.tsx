import Link from "next/link";

const CARDS = [
  {
    title: "NSW Gov vCard",
    description: "Auto-charge 19 purchasing offices at invoice generation",
    href: "/demo/nsw-gov",
    accent: "Government",
  },
  {
    title: "B2B Invoicing",
    description: "Full invoice lifecycle from draft to paid",
    href: "/demo/invoicing",
    accent: "Accounts Receivable",
  },
  {
    title: "MOTO Terminal",
    description: "Finance staff take card payments over the phone",
    href: "/demo/moto",
    accent: "Finance",
  },
  {
    title: "Live Event Stream",
    description: "Real-time Stripe webhook activity",
    href: "/demo/events",
    accent: "Operations",
  },
];

export default function DemoHub() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-workwear-orange">
          Internal Payments Platform
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-workwear-ink">
          Workwear Group — Digital Payments
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600">
          A unified view of how Workwear Group collects payment across
          government contracts, B2B invoicing, and phone-based finance
          operations — powered end-to-end by Stripe.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-workwear-orange hover:shadow-md"
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {card.accent}
              </span>
              <h2 className="mt-2 text-2xl font-bold text-workwear-ink">
                {card.title}
              </h2>
              <p className="mt-2 text-gray-600">{card.description}</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1 font-semibold text-workwear-orange">
              Launch demo
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
