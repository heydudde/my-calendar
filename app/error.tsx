"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-xl font-semibold text-neutral-900">Something went wrong</h1>
        <p className="text-neutral-500 text-sm">
          We couldn&apos;t load this page. Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
