export type Booking = {
  id: string;
  client_name: string;
  topic: string;
  requested_at: string;
  duration_minutes: number;
  status: string;
  google_event_link: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  declined: "bg-red-100 text-red-800",
  cancelled: "bg-neutral-200 text-neutral-600",
};

export default function BookingsList({
  bookings,
  loadError,
}: {
  bookings: Booking[];
  loadError?: string;
}) {
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
    <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
      {bookings.map((b) => (
        <li key={b.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="font-medium text-neutral-900 truncate">{b.topic}</p>
            <p className="text-sm text-neutral-500 truncate">
              {b.client_name} ·{" "}
              {new Date(b.requested_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · {b.duration_minutes}m
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
              STATUS_STYLES[b.status] ?? "bg-neutral-100 text-neutral-700"
            }`}
          >
            {b.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
