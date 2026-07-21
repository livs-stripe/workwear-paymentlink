export type EventType =
  | "customer.created"
  | "setup_intent.succeeded"
  | "invoice.finalized"
  | "invoice.paid"
  | "payment_intent.succeeded"
  | "payment_intent.failed"
  | "payment_link.created";

export interface DemoEvent {
  id: string;
  type: EventType;
  objectId: string;
  summary: string;
  amount?: number; // in cents
  currency?: string;
  timestamp: number; // epoch ms
}

export type EventFilter = "all" | "payments" | "invoices" | "setup" | "errors";

const MAX_EVENTS = 50;

/**
 * Module-level in-memory store. Newest first. Capped at MAX_EVENTS.
 * NOTE: this resets whenever the serverless runtime cold-starts. That is
 * acceptable for a live demo where events are generated on the fly.
 */
declare global {
  // eslint-disable-next-line no-var
  var __workwearEvents: DemoEvent[] | undefined;
}

function store(): DemoEvent[] {
  if (!globalThis.__workwearEvents) {
    globalThis.__workwearEvents = [];
  }
  return globalThis.__workwearEvents;
}

function genId(): string {
  return `evt_${Math.random().toString(36).slice(2, 12)}`;
}

export function recordEvent(
  evt: Omit<DemoEvent, "id" | "timestamp"> & {
    id?: string;
    timestamp?: number;
  }
): DemoEvent {
  const full: DemoEvent = {
    id: evt.id ?? genId(),
    type: evt.type,
    objectId: evt.objectId,
    summary: evt.summary,
    amount: evt.amount,
    currency: evt.currency,
    timestamp: evt.timestamp ?? Date.now(),
  };
  const arr = store();
  arr.unshift(full);
  if (arr.length > MAX_EVENTS) {
    arr.length = MAX_EVENTS;
  }
  return full;
}

export function getEvents(filter: EventFilter = "all"): DemoEvent[] {
  const arr = store();
  switch (filter) {
    case "payments":
      return arr.filter(
        (e) =>
          e.type === "payment_intent.succeeded" ||
          e.type === "payment_intent.failed"
      );
    case "invoices":
      return arr.filter(
        (e) => e.type === "invoice.finalized" || e.type === "invoice.paid"
      );
    case "setup":
      return arr.filter(
        (e) =>
          e.type === "setup_intent.succeeded" || e.type === "customer.created"
      );
    case "errors":
      return arr.filter((e) => e.type === "payment_intent.failed");
    case "all":
    default:
      return [...arr];
  }
}

export function resetEvents(): void {
  globalThis.__workwearEvents = [];
}

/**
 * Seed a mix of realistic historical events so the Live Event Stream is never
 * empty on first load during a demo.
 */
export function seedEvents(): DemoEvent[] {
  resetEvents();
  const now = Date.now();
  const seed: DemoEvent[] = [
    {
      id: genId(),
      type: "customer.created",
      objectId: "cus_Qk3Rfield01",
      summary: "NSW Health — Western Sydney PHN onboarded",
      timestamp: now - 1000 * 60 * 42,
    },
    {
      id: genId(),
      type: "setup_intent.succeeded",
      objectId: "seti_1PQr7kCitibankVCard",
      summary: "Citibank vCard stored for Western Sydney PHN",
      timestamp: now - 1000 * 60 * 41,
    },
    {
      id: genId(),
      type: "invoice.finalized",
      objectId: "in_1PQrA2WWG2841",
      summary: "Invoice WWG-2841 finalized — Northern Sydney LHD",
      amount: 1099450,
      currency: "aud",
      timestamp: now - 1000 * 60 * 33,
    },
    {
      id: genId(),
      type: "invoice.paid",
      objectId: "in_1PQrA2WWG2841",
      summary: "Invoice WWG-2841 paid via vCard on file",
      amount: 1099450,
      currency: "aud",
      timestamp: now - 1000 * 60 * 32,
    },
    {
      id: genId(),
      type: "payment_intent.succeeded",
      objectId: "pi_3PQrB9SydneyAirport",
      summary: "MOTO payment — Sydney Airport Corporation",
      amount: 325000,
      currency: "aud",
      timestamp: now - 1000 * 60 * 18,
    },
    {
      id: genId(),
      type: "payment_intent.succeeded",
      objectId: "pi_3PQrC4QantasUniform",
      summary: "Invoice charged — Qantas Group Uniform Division",
      amount: 450000,
      currency: "aud",
      timestamp: now - 1000 * 60 * 6,
    },
  ];
  // Store newest-first.
  const ordered = [...seed].sort((a, b) => b.timestamp - a.timestamp);
  globalThis.__workwearEvents = ordered;
  return ordered;
}
