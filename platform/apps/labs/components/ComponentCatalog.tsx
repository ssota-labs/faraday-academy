"use client";

import { useMemo, useState } from "react";
import type { ComponentGroup } from "@/lib/catalog";

const GROUP_COLOR: Record<string, string> = {
  blocks: "var(--g-blocks)",
  ui: "var(--g-ui)",
  runtime: "var(--g-runtime)",
  world: "var(--g-world)",
  lms: "var(--g-lms)",
};

export function ComponentCatalog({ groups }: { groups: ComponentGroup[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return groups
      .filter((g) => !active || g.id === active)
      .map((g) => ({
        ...g,
        components: g.components.filter((c) => {
          if (!q) return true;
          return (
            c.name.toLowerCase().includes(q) ||
            c.summary.toLowerCase().includes(q) ||
            c.file.toLowerCase().includes(q) ||
            c.exports.some((e) => e.toLowerCase().includes(q))
          );
        }),
      }))
      .filter((g) => g.components.length > 0);
  }, [groups, active, q]);

  const total = filtered.reduce((n, g) => n + g.components.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-[57px] z-10 -mx-1 flex flex-wrap items-center gap-2 bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-1 py-2 backdrop-blur">
        <input
          className="field w-full px-3.5 py-2 text-sm sm:w-72"
          placeholder="Search components, docs, exports…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          <Pill active={active === null} onClick={() => setActive(null)}>
            All
          </Pill>
          {groups.map((g) => (
            <Pill key={g.id} active={active === g.id} color={GROUP_COLOR[g.id]} onClick={() => setActive(g.id)}>
              {g.title}
            </Pill>
          ))}
        </div>
        <span className="ml-auto text-xs text-[var(--faint)]">{total} shown</span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--muted)]">No components match “{query}”.</p>
      ) : (
        filtered.map((g) => (
          <section key={g.id} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2.5 border-b border-[var(--border-soft)] pb-2">
              <span className="dot mt-1.5" style={{ background: GROUP_COLOR[g.id] }} />
              <h2 className="text-lg font-semibold">{g.title}</h2>
              <code className="code">{g.importPath}</code>
              <span className="text-xs text-[var(--faint)]">{g.components.length}</span>
            </div>
            <p className="-mt-1 text-sm text-[var(--muted)]">{g.blurb}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.components.map((c) => (
                <article key={c.relPath} className="card card-hover flex flex-col gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="mono font-semibold">{c.name}</h3>
                    {c.isUtil && <span className="chip">util</span>}
                  </div>
                  <p className="text-[13px] leading-relaxed text-[var(--muted)]">
                    {c.summary || <span className="text-[var(--faint)]">No header doc.</span>}
                  </p>
                  {c.exports.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1 pt-1">
                      {c.exports.slice(0, 6).map((e) => (
                        <span key={e} className="chip mono">
                          {e}
                        </span>
                      ))}
                      {c.exports.length > 6 && <span className="chip">+{c.exports.length - 6}</span>}
                    </div>
                  )}
                  <div className="mono text-[11px] text-[var(--faint)]">{c.relPath}</div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function Pill({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="chip cursor-pointer data-[active=true]:border-[var(--accent)] data-[active=true]:text-[var(--text)]"
    >
      {color && <span className="dot" style={{ background: color }} />}
      {children}
    </button>
  );
}
