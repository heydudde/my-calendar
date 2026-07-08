"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "loading" | "success" | "declined" | "error";

type Confirmation = {
  topic: string;
  requestedAt: string;
  link: string | null;
};

type Suggestion = {
  suggested_at: string;
  suggestion_confidence: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function BookingForm() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [requestedAt, setRequestedAt] = useState("");
  const [duration, setDuration] = useState(30);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const minDateTime = useMemo(() => {
    const d = new Date(Date.now() + 60_000);
    d.setSeconds(0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);

  function validateClientSide(): string | null {
    if (!clientName.trim() || !clientEmail.trim() || !topic.trim() || !requestedAt) {
      return "Please fill in every field.";
    }
    if (!EMAIL_RE.test(clientEmail)) return "Enter a valid email address.";
    if (new Date(requestedAt).getTime() <= Date.now()) {
      return "Pick a date and time in the future.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateClientSide();
    if (err) {
      setFieldError(err);
      return;
    }
    setFieldError(null);
    setStatus("loading");
    setMessage(null);
    setSuggestions([]);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail,
          topic,
          requested_at: new Date(requestedAt).toISOString(),
          duration_minutes: duration,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 200) {
        setConfirmation({
          topic: data.booking?.topic ?? topic,
          requestedAt: data.booking?.requested_at ?? requestedAt,
          link: data.booking?.google_event_link ?? null,
        });
        setStatus("success");
        router.refresh();
      } else if (res.status === 409) {
        setStatus("declined");
        setMessage(data.message || "That slot is already taken — please choose another time.");
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setRequestedAt("");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong, please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong, please try again.");
    }
  }

  function resetForm() {
    setClientName("");
    setClientEmail("");
    setTopic("");
    setRequestedAt("");
    setDuration(30);
    setStatus("idle");
    setMessage(null);
    setFieldError(null);
    setConfirmation(null);
    setSuggestions([]);
  }

  function pickSuggestion(iso: string) {
    setRequestedAt(toDatetimeLocalValue(new Date(iso)));
    setStatus("idle");
    setMessage(null);
    setSuggestions([]);
  }

  if (status === "success" && confirmation) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 space-y-3">
        <h2 className="text-xl font-semibold text-emerald-900">You&apos;re booked!</h2>
        <dl className="text-sm text-emerald-900 space-y-1">
          <div>
            <dt className="inline font-medium">Topic: </dt>
            <dd className="inline">{confirmation.topic}</dd>
          </div>
          <div>
            <dt className="inline font-medium">When: </dt>
            <dd className="inline">
              {new Date(confirmation.requestedAt).toLocaleString(undefined, {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </dd>
          </div>
        </dl>
        {confirmation.link && (
          <a
            href={confirmation.link}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm font-medium text-emerald-700 underline underline-offset-2"
          >
            View on Google Calendar →
          </a>
        )}
        <div>
          <button
            onClick={resetForm}
            className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Book another session
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 p-6">
      <div>
        <label htmlFor="client_name" className="block text-sm font-medium text-neutral-700">
          Name
        </label>
        <input
          id="client_name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="client_email" className="block text-sm font-medium text-neutral-700">
          Email
        </label>
        <input
          id="client_email"
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-neutral-700">
          Topic
        </label>
        <input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="What do you want to talk about?"
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="requested_at" className="block text-sm font-medium text-neutral-700">
            Date & time
          </label>
          <input
            id="requested_at"
            type="datetime-local"
            min={minDateTime}
            value={requestedAt}
            onChange={(e) => setRequestedAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="w-32">
          <label htmlFor="duration" className="block text-sm font-medium text-neutral-700">
            Minutes
          </label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
          </select>
        </div>
      </div>

      {fieldError && (
        <p role="alert" className="text-sm text-red-600">
          {fieldError}
        </p>
      )}
      {status === "declined" && (
        <div className="space-y-2">
          <p role="alert" className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {message}
          </p>
          {suggestions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-neutral-500">Next available times:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.suggested_at}
                    type="button"
                    onClick={() => pickSuggestion(s.suggested_at)}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                  >
                    {new Date(s.suggested_at).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Checking availability…" : "Book session"}
      </button>
    </form>
  );
}
