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
  draft: { label: "Draft", className: "bg-gray-200 text-gray-700" },
  open: { label: "Open", className: "bg-workwear-orange-light text-workwear-orange-dark" },
  paid: { label: "Paid", className: "bg-green-100 text-green-700" },
  processing: { label: "Processing", className: "bg-blue-100 text-blue-700" },
  failed: { label: "Failed", className: "bg-red-100 text-red-700" },
  requires_action: {
    label: "Requires Action",
    className: "bg-yellow-100 text-yellow-800",
  },
  succeeded: { label: "Succeeded", className: "bg-green-100 text-green-700" },
  pending: { label: "Pending", className: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-700" },
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
