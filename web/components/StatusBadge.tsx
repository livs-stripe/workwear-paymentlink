"use client";

type Status =
  | "draft"
  | "open"
  | "paid"
  | "processing"
  | "failed"
  | "requires_action"
  | "succeeded"
  | "pending"
  | "confirmed";

const STYLES: Record<Status, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-200 text-charcoal" },
  open: { label: "Open", className: "bg-wwgOrange/10 text-wwgOrange" },
  paid: { label: "Paid", className: "bg-wwgGreen/10 text-wwgGreen" },
  processing: { label: "Processing", className: "bg-charcoal/10 text-charcoal" },
  failed: { label: "Failed", className: "bg-brand/10 text-brand-dark" },
  requires_action: {
    label: "Requires Action",
    className: "bg-wwgOrange/10 text-wwgOrange",
  },
  succeeded: { label: "Succeeded", className: "bg-wwgGreen/10 text-wwgGreen" },
  pending: { label: "Pending", className: "bg-charcoal/10 text-charcoal" },
  confirmed: { label: "Confirmed", className: "bg-wwgGreen/10 text-wwgGreen" },
};

export default function StatusBadge({
  status,
  label,
}: {
  status: Status;
  label?: string;
}) {
  const cfg = STYLES[status] ?? STYLES.draft;
  const showDot = status === "processing" || status === "pending";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-500 ${cfg.className}`}
    >
      {showDot && (
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
      )}
      {label ?? cfg.label}
    </span>
  );
}

export type { Status };
