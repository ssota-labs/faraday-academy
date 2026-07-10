"use client";

import { useMemo, useState } from "react";
import type { Agent, Command, Pack, Plugin, Skill } from "@/lib/catalog";

type Props = {
  skill: Skill | null;
  commands: Command[];
  agents: Agent[];
  worldPacks: Pack[];
  featurePacks: Pack[];
  plugins: Plugin[];
};

export function SkillCatalog({ skill, commands, agents, worldPacks, featurePacks, plugins }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const match = (...parts: (string | undefined)[]) => !q || parts.some((p) => p?.toLowerCase().includes(q));

  const refs = useMemo(() => (skill?.references ?? []).filter((r) => match(r.title, r.file)), [skill, q]);
  const cmds = useMemo(() => commands.filter((c) => match(c.name, c.description)), [commands, q]);
  const ags = useMemo(() => agents.filter((a) => match(a.name, a.description)), [agents, q]);
  const fpacks = useMemo(() => featurePacks.filter((p) => match(p.title, p.summary, p.tag)), [featurePacks, q]);
  const wpacks = useMemo(() => worldPacks.filter((p) => match(p.title, p.summary)), [worldPacks, q]);
  const plugs = useMemo(() => plugins.filter((p) => match(p.displayName, p.description, p.keywords.join(" "))), [plugins, q]);

  const skillVisible = skill && (match(skill.name, skill.description) || refs.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="sticky top-[57px] z-10 -mx-1 flex items-center gap-2 bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-1 py-2 backdrop-blur">
        <input
          className="field w-full px-3.5 py-2 text-sm sm:w-80"
          placeholder="Search skills, commands, packs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {skillVisible && skill && (
        <Section title="Skill" color="var(--g-skill)" count={skill.references.length} sub="references">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <h3 className="mono text-base font-semibold">{skill.name}</h3>
              <span className="chip">SKILL.md</span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">{skill.description}</p>
            <div className="mono mt-2 text-[11px] text-[var(--faint)]">{skill.relPath}</div>
            <div className="mt-4 border-t border-[var(--border-soft)] pt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--faint)]">
                Phase references
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {refs.map((r) => (
                  <div key={r.file} className="card card-hover flex flex-col gap-1 p-3">
                    <div className="text-[13px] font-medium leading-snug">{r.title}</div>
                    <div className="mono text-[11px] text-[var(--faint)]">{r.file}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {cmds.length > 0 && (
        <Section title="Slash commands" color="var(--g-command)" count={cmds.length}>
          <Grid>
            {cmds.map((c) => (
              <Card key={c.name} name={`/${c.name}`} desc={c.description} path={c.relPath} />
            ))}
          </Grid>
        </Section>
      )}

      {ags.length > 0 && (
        <Section title="Subagents" color="var(--g-agent)" count={ags.length}>
          <Grid>
            {ags.map((a) => (
              <Card key={a.name} name={a.name} desc={a.description} path={a.relPath} />
            ))}
          </Grid>
        </Section>
      )}

      {fpacks.length > 0 && (
        <Section title="Feature packs" color="var(--g-pack)" count={fpacks.length} sub="CLI overlays">
          <Grid>
            {fpacks.map((p) => (
              <Card key={p.id} name={p.title} desc={p.summary} path={p.relPath} tag={p.tag} />
            ))}
          </Grid>
        </Section>
      )}

      {wpacks.length > 0 && (
        <Section title="World packs" color="var(--g-pack)" count={wpacks.length} sub="curriculum renderers">
          <Grid>
            {wpacks.map((p) => (
              <Card key={p.id} name={p.title} desc={p.summary} path={p.relPath} tag={p.tag} />
            ))}
          </Grid>
        </Section>
      )}

      {plugs.length > 0 && (
        <Section title="Plugins" color="var(--g-plugin)" count={plugs.length}>
          <Grid>
            {plugs.map((p) => (
              <div key={p.name} className="card flex flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{p.displayName}</h3>
                  <span className="chip">{p.host}</span>
                </div>
                <p className="text-[13px] leading-relaxed text-[var(--muted)]">{p.description}</p>
                {p.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.keywords.slice(0, 6).map((k) => (
                      <span key={k} className="chip">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mono text-[11px] text-[var(--faint)]">{p.relPath}</div>
              </div>
            ))}
          </Grid>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  color,
  count,
  sub,
  children,
}: {
  title: string;
  color: string;
  count: number;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2.5 border-b border-[var(--border-soft)] pb-2">
        <span className="dot mt-1.5" style={{ background: color }} />
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-[var(--faint)]">
          {count}
          {sub ? ` ${sub}` : ""}
        </span>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Card({ name, desc, path, tag }: { name: string; desc: string; path: string; tag?: string }) {
  return (
    <article className="card card-hover flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <h3 className="mono font-semibold">{name}</h3>
        {tag && <span className="chip">{tag}</span>}
      </div>
      <p className="text-[13px] leading-relaxed text-[var(--muted)]">
        {desc || <span className="text-[var(--faint)]">No description.</span>}
      </p>
      <div className="mono mt-auto pt-1 text-[11px] text-[var(--faint)]">{path}</div>
    </article>
  );
}
