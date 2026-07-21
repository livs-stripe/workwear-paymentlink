import { jsonResponse, optionsResponse } from "@/lib/cors";
import { resetEvents } from "@/lib/events";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST() {
  resetEvents();
  return jsonResponse({ ok: true, events: [] });
}
