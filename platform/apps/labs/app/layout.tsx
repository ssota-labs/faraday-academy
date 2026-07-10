import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Faraday Labs",
  description: "Internal catalog of the Faraday runtime components and the skills/packs shipped by the CLI + plugins.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
            <a href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent)] text-[13px] font-bold text-white">
                F
              </span>
              <span>
                Faraday <span className="text-[var(--muted)]">Labs</span>
              </span>
            </a>
            <Nav />
            <a
              href="https://github.com/titanism/faraday-edu"
              className="ml-auto hidden text-xs text-[var(--faint)] hover:text-[var(--text)] sm:block"
            >
              titanism/faraday-edu ↗
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-5 py-10 text-xs text-[var(--faint)]">
          Faraday Labs — a read-only view of the source tree. Edit a component or skill and refresh; the catalog
          re-reads from disk.
        </footer>
      </body>
    </html>
  );
}
