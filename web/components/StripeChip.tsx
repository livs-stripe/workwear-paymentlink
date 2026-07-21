"use client";

import { useState } from "react";

type ChipType =
  | "customer"
  | "payment_method"
  | "setup_intent"
  | "invoice"
  | "payment_intent"
  | "charge";

const ICONS: Record<ChipType, string> = {
  customer: "👤",
  payment_method: "💳",
  setup_intent: "🔧",
  invoice: "🧾",
  payment_intent: "⚡",
  charge: "✓",
};

function truncate(id: string): string {
  if (id.length <= 16) return id;
  return `${id.slice(0, 10)}…${id.slice(-4)}`;
}

export default function StripeChip({
  id,
  type,
}: {
  id: string;
  type: ChipType;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable; ignore silently
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Click to copy ${id}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-wwgBorder bg-white px-2.5 py-1 font-mono text-xs text-charcoal shadow-sm transition-colors hover:border-brand hover:bg-brand-light"
    >
      <span aria-hidden>{ICONS[type]}</span>
      <span>{truncate(id)}</span>
      <span className={copied ? "text-green-600" : "text-gray-400"}>
        {copied ? "✓ copied" : "⧉"}
      </span>
    </button>
  );
}
