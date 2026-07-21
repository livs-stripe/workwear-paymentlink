import { jsonResponse, optionsResponse } from "@/lib/cors";
import { seedEvents } from "@/lib/events";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST() {
  const events = seedEvents();
  return jsonResponse({ events });
}
