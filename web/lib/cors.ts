import { NextResponse } from "next/server";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-vercel-protection-bypass, x-vercel-set-bypass-cookie",
};

export function corsHeaders(): Record<string, string> {
  return { ...CORS_HEADERS };
}

export function jsonResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: corsHeaders() });
}

export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status, headers: corsHeaders() });
}

export function optionsResponse(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}
