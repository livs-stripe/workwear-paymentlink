import { jsonResponse, optionsResponse } from "@/lib/cors";
import { getPaymentLinks } from "@/lib/payment-links";

export const runtime = "nodejs";

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  return jsonResponse({ links: getPaymentLinks() });
}
