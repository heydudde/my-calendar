"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkingHours } from "@/lib/google/calendar";
import type { BuilderSettings } from "@/lib/settings";

const DAYS: { key: keyof WorkingHours; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export default function SettingsForm({ initial }: { initial: BuilderSettings }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.display_name);
  const [bio, setBio] = useState(initial.bio);
  const [bufferMinutes, setBufferMinutes] = useState(initial.buffer_minutes);
  const [hours, setHours] = useState<WorkingHours>(initial.working_hours);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  function dayEnabled(key: keyof WorkingHours) {
    return (hours[key]?.length ?? 0) > 0;
  }

  function toggleDay(key: keyof WorkingHours) {
    setHours((prev) => ({
      ...prev,
      [key]: (prev[key]?.length ?? 0) > 0 ? [] : [{ start: "09:00", end: "17:00" }],
    }));
  }

  function setDayTime(key: keyof WorkingHours, field: "start" | "end", value: string) {
    setHours((prev) => {
      const window = prev[key]?.[0] ?? { start: "09:00", end: "17:00" };
      return { ...prev, [key]: [{ ...window, [field]: value }] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          bio,
          buffer_minutes: bufferMinutes,
          working_hours: hours,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Could not save settings.");
        return;
      }
      setStatus("saved");
      setMessage("Settings saved.");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Could not save settings.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-neutral-200 p-6">
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-neutral-700">
          Display name
        </label>
        <input
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-neutral-700">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="buffer_minutes" className="block text-sm font-medium text-neutral-700">
          Buffer between bookings (minutes)
        </label>
        <input
          id="buffer_minutes"
          type="number"
          min={0}
          max={120}
          value={bufferMinutes}
          onChange={(e) => setBufferMinutes(Number(e.target.value))}
          className="mt-1 w-32 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Working hours</p>
        <div className="space-y-2">
          {DAYS.map(({ key, label }) => {
            const enabled = dayEnabled(key);
            const window = hours[key]?.[0] ?? { start: "09:00", end: "17:00" };
            return (
              <div key={key} className="flex items-center gap-3">
                <label className="flex items-center gap-2 w-32 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleDay(key)}
                  />
                  {label}
                </label>
                {enabled ? (
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="time"
                      value={window.start}
                      onChange={(e) => setDayTime(key, "start", e.target.value)}
                      className="rounded-lg border border-neutral-300 px-2 py-1"
                    />
                    <span className="text-neutral-400">to</span>
                    <input
                      type="time"
                      value={window.end}
                      onChange={(e) => setDayTime(key, "end", e.target.value)}
                      className="rounded-lg border border-neutral-300 px-2 py-1"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-neutral-400">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {message && (
        <p
          className={`text-sm rounded-lg px-3 py-2 border ${
            status === "error"
              ? "text-red-700 bg-red-50 border-red-200"
              : "text-emerald-700 bg-emerald-50 border-emerald-200"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
