import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book a session — my-calendar",
  description: "Book a session against a live Google Calendar — no double booking, ever.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
