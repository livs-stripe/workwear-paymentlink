export interface DemoPaymentLink {
  id: string;
  url: string;
  customerName: string;
  amountTotalCents: number;
  timestamp: number; // epoch ms
}

const MAX_LINKS = 25;

/**
 * Module-level in-memory store. Newest first. Capped at MAX_LINKS.
 * NOTE: this resets whenever the serverless runtime cold-starts. That is
 * acceptable for a live demo where links are generated on the fly.
 */
declare global {
  // eslint-disable-next-line no-var
  var __workwearPaymentLinks: DemoPaymentLink[] | undefined;
}

function store(): DemoPaymentLink[] {
  if (!globalThis.__workwearPaymentLinks) {
    globalThis.__workwearPaymentLinks = [];
  }
  return globalThis.__workwearPaymentLinks;
}

export function recordPaymentLink(link: DemoPaymentLink): DemoPaymentLink {
  const arr = store();
  arr.unshift(link);
  if (arr.length > MAX_LINKS) {
    arr.length = MAX_LINKS;
  }
  return link;
}

export function getPaymentLinks(): DemoPaymentLink[] {
  return [...store()];
}

export function resetPaymentLinks(): void {
  globalThis.__workwearPaymentLinks = [];
}
