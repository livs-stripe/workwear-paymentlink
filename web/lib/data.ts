// Realistic demo data shared across the portal.

export const TEST_CARD = {
  number: "4242 4242 4242 4242",
  exp: "12/26",
  cvc: "123",
  declined: "4000 0000 0000 0002",
};

export interface LineItem {
  description: string;
  amountCents: number; // unit amount in cents
  quantity: number;
}

export const NSW_HEALTH_OFFICES = [
  "NSW Health — Western Sydney PHN",
  "NSW Health — Northern Sydney LHD",
  "NSW Health — South Eastern Sydney LHD",
  "NSW Health — Illawarra Shoalhaven LHD",
  "NSW Health — Hunter New England LHD",
];

export const NSW_GOV_LINE_ITEMS: LineItem[] = [
  {
    description: "Hard Yakka FLC Shirts (Navy, L) x50",
    amountCents: 5995,
    quantity: 50,
  },
  {
    description: "KingGee Stretch Cargo (Khaki, 32R) x30",
    amountCents: 10995,
    quantity: 30,
  },
  {
    description: "NNT Uniform Shirt (White, M) x40",
    amountCents: 7995,
    quantity: 40,
  },
];

export const INVOICING_LINE_ITEMS: LineItem[] = [
  {
    description: "Hi-Vis Workwear Bundle x200",
    amountCents: 2250,
    quantity: 200,
  },
  {
    description: "Steel-Cap Safety Boots x60",
    amountCents: 12950,
    quantity: 60,
  },
];

export interface MotoAccount {
  name: string;
  invoices: { ref: string; amountCents: number; due: string }[];
}

export const MOTO_ACCOUNTS: MotoAccount[] = [
  {
    name: "Qantas Group",
    invoices: [
      { ref: "WWG-2847", amountCents: 325000, due: "2026-08-14" },
      { ref: "WWG-2811", amountCents: 189900, due: "2026-08-02" },
    ],
  },
  {
    name: "Sydney Airport Corporation",
    invoices: [
      { ref: "WWG-2839", amountCents: 512000, due: "2026-08-19" },
      { ref: "WWG-2790", amountCents: 76500, due: "2026-07-30" },
    ],
  },
  {
    name: "Transdev Australasia",
    invoices: [{ ref: "WWG-2853", amountCents: 244000, due: "2026-08-21" }],
  },
  {
    name: "John Holland Group",
    invoices: [
      { ref: "WWG-2802", amountCents: 998000, due: "2026-08-09" },
      { ref: "WWG-2765", amountCents: 145000, due: "2026-07-28" },
    ],
  },
  {
    name: "Lendlease",
    invoices: [{ ref: "WWG-2861", amountCents: 678500, due: "2026-08-25" }],
  },
];

export const INVOICE_FOOTER =
  "Workwear Group Pty Ltd ABN 12 345 678 901 | Payment terms NET 30";

export function formatAud(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}

export function lineItemsSubtotal(items: LineItem[]): number {
  return items.reduce((sum, i) => sum + i.amountCents * i.quantity, 0);
}
