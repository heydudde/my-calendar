export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-10 animate-pulse">
        <div className="h-8 w-2/3 mx-auto rounded bg-neutral-200" />
        <div className="h-48 rounded-xl bg-neutral-200" />
        <div className="h-32 rounded-xl bg-neutral-200" />
      </div>
    </main>
  );
}
