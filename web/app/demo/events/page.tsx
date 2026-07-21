"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DemoEvent, EventFilter, EventType } from "@/lib/events";
import { formatAud } from "@/lib/data";

const FILTERS: { label: string; value: EventFilter }[] = [
  { label: "All", value: "all" },
  { label: "Payments", value: "payments" },
  { label: "Invoices", value: "invoices" },
  { label: "Setup", value: "setup" },
  { label: "Errors", value: "errors" },
];

const BADGE: Record<EventType, string> = {
  "payment_intent.succeeded": "bg-green-500/20 text-green-400 border-green-500/40",
  "invoice.paid": "bg-green-500/20 text-green-400 border-green-500/40",
  "setup_intent.succeeded": "bg-blue-500/20 text-blue-400 border-blue-500/40",
  "payment_intent.failed": "bg-red-500/20 text-red-400 border-red-500/40",
  "invoice.finalized": "bg-orange-500/20 text-orange-400 border-orange-500/40",
  "customer.created": "bg-gray-500/20 text-gray-300 border-gray-500/40",
  "payment_link.created": "bg-red-500/20 text-red-400 border-red-500/40",
};

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-AU", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function EventsPage() {
  const [filter, setFilter] = useState<EventFilter>("all");
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [seeded, setSeeded] = useState(false);
  const seedingRef = useRef(false);

  const load = useCallback(
    async (f: EventFilter) => {
      try {
        const res = await fetch(`/api/demo/events?type=${f}`);
        const data = await res.json();
        const list: DemoEvent[] = data.events ?? [];
        if (list.length === 0 && f === "all" && !seedingRef.current && !seeded) {
          seedingRef.current = true;
          await fetch("/api/demo/seed-events", { method: "POST" });
          setSeeded(true);
          const res2 = await fetch(`/api/demo/events?type=${f}`);
          const data2 = await res2.json();
          setEvents(data2.events ?? []);
        } else {
          setEvents(list);
        }
      } catch {
        /* keep prior events */
      }
    },
    [seeded]
  );

  useEffect(() => {
    load(filter);
    const t = setInterval(() => load(filter), 2000);
    return () => clearInterval(t);
  }, [filter, load]);

  async function resetStream() {
    await fetch("/api/demo/reset", { method: "POST" }).catch(() => {});
    setEvents([]);
    setSeeded(false);
    seedingRef.current = false;
  }

  return (
    <div className="min-h-[calc(100vh-96px)] bg-[#0D1117] px-6 py-8 font-mono text-gray-200">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-pulse-dot rounded-full bg-green-400" />
            <h1 className="text-lg font-bold text-white">
              Workwear Payments Event Stream — Live
            </h1>
          </div>
          <button
            onClick={resetStream}
            className="rounded border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
          >
            Reset
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded px-3 py-1 text-xs transition-colors ${
                filter === f.value
                  ? "bg-brand text-white"
                  : "border border-gray-700 text-gray-400 hover:bg-white/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-800 bg-black/30">
          {events.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              No events yet. Activity will appear here in real time.
            </p>
          ) : (
            <ul>
              {events.map((e) => (
                <li
                  key={e.id}
                  className="flex animate-slide-fade-in flex-wrap items-center gap-3 border-b border-gray-800/60 px-4 py-2.5 text-sm last:border-0"
                >
                  <span className="text-gray-500">[{fmtTime(e.timestamp)}]</span>
                  <span
                    className={`rounded border px-2 py-0.5 text-xs ${BADGE[e.type]}`}
                  >
                    {e.type}
                  </span>
                  <span className="text-brand">{e.objectId}</span>
                  <span className="flex-1 text-gray-300">{e.summary}</span>
                  {typeof e.amount === "number" && (
                    <span className="font-semibold text-white">
                      {formatAud(e.amount)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
