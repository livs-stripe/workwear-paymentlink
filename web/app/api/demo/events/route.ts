import { errorResponse, jsonResponse, optionsResponse } from "@/lib/cors";
import { getEvents, resetEvents, type EventFilter } from "@/lib/events";

export const runtime = "nodejs";

const VALID_FILTERS: EventFilter[] = [
  "all",
  "payments",
  "invoices",
  "setup",
  "errors",
];

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const typeParam = (searchParams.get("type") ?? "all") as EventFilter;
  const filter: EventFilter = VALID_FILTERS.includes(typeParam)
    ? typeParam
    : "all";
  return jsonResponse({ events: getEvents(filter), filter });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  if (body.action === "reset") {
    resetEvents();
    return jsonResponse({ ok: true, events: [] });
  }
  return errorResponse('Unsupported action. Use { action: "reset" }.', 400);
}
