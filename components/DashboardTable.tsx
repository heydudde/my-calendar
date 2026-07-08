"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  declined: "bg-red-100 text-red-800",
  cancelled: "bg-neutral-200 text-neutral-600",
};

export default function DashboardTable({
  bookings,
  loadError,
}: {
  bookings: Booking[];
  loadError?: string;
}) {
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  async function handleCancel(id: string) {
    setCancellingId(id);
    setRowErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRowErrors((prev) => ({ ...prev, [id]: data.message || "Could not cancel booking." }));
      } else {
        router.refresh();
      }
    } catch {
      setRowErrors((prev) => ({ ...prev, [id]: "Could not cancel booking." }));
    } finally {
      setCancellingId(null);
    }
  }

  if (loadError) {
    return (
      <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-4 py-3">
        Couldn&apos;t load bookings — please refresh the page.
      </p>
    );
  }

  if (bookings.length === 0) {
    return (
      <p className="text-sm text-neutral-500 border border-dashed border-neutral-300 rounded-lg px-4 py-6 text-center">
        No bookings yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="min-w-full divide-y divide-neutral-200 text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-neutral-600">Date</th>
            <th className="px-4 py-2 text-left font-medium text-neutral-600">Topic</th>
            <th className="px-4 py-2 text-left font-medium text-neutral-600">Client</th>
            <th className="px-4 py-2 text-left font-medium text-neutral-600">Status</th>
            <th className="px-4 py-2 text-right font-medium text-neutral-600">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className="px-4 py-3 whitespace-nowrap">
                {new Date(b.requested_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </td>
              <td className="px-4 py-3">{b.topic}</td>
              <td className="px-4 py-3">
                <div>{b.client_name}</div>
                <div className="text-xs text-neutral-400">{b.client_email}</div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    STATUS_STYLES[b.status] ?? "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {b.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {b.status === "confirmed" ? (
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancellingId === b.id}
                    className="text-red-600 hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {cancellingId === b.id ? "Cancelling…" : "Cancel"}
                  </button>
                ) : (
                  <span className="text-neutral-300">—</span>
                )}
                {rowErrors[b.id] && (
                  <p className="text-xs text-red-600 mt-1">{rowErrors[b.id]}</p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
