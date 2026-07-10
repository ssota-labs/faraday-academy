import { loadComponentGroups, loadSummary } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const GROUP_COLOR: Record<string, string> = {
  blocks: "var(--g-blocks)",
  ui: "var(--g-ui)",
  runtime: "var(--g-runtime)",
  world: "var(--g-world)",
  lms: "var(--g-lms)",
};

export default function OverviewPage() {
  const s = loadSummary();
  const groups = loadComponentGroups();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <span className="chip w-fit">internal · read-only</span>
        <h1 className="text-3xl font-semibold tracking-tight">What Faraday ships</h1>
        <p className="max-w-2xl text-[var(--muted)]">
          A live inventory of the two things the team keeps building against: the{" "}
          <b className="text-[var(--text)]">runtime UI components</b> that get vendored into every lesson, and the{" "}
          <b className="text-[var(--text)]">skills &amp; packs</b> the CLI and agent plugins expose. Read straight from
          the source tree — no drift.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Components" value={s.componentCount} />
        <Stat label="Blocks (API)" value={s.blockCount} />
        <Stat label="Skill refs" value={s.skillRefCount} />
        <Stat label="Commands" value={s.commandCount} />
        <Stat label="Packs" value={s.worldPackCount + s.featurePackCount} />
        <Stat label="Plugins" value={s.pluginCount} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <EntryCard
          href="/components"
          title="UI components"
          desc="The vendored Faraday layer, grouped: blocks, UI primitives, runtime, world, and LMS. Search across every component's purpose and exports."
        >
          <div className="mt-4 flex flex-wrap gap-1.5">
            {groups.map((g) => (
              <span key={g.id} className="chip">
                <span className="dot" style={{ background: GROUP_COLOR[g.id] }} />
                {g.title} · {g.components.length}
              </span>
            ))}
          </div>
        </EntryCard>

        <EntryCard
          href="/skills"
          title="Skills & packs"
          desc="What agents get: the faraday skill and its phase references, the slash commands, the authoring subagent, plus the world packs and feature packs (--3d / --tutor) the CLI overlays."
        >
          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className="chip">skill · {s.skillRefCount} refs</span>
            <span className="chip">commands · {s.commandCount}</span>
            <span className="chip">agents · {s.agentCount}</span>
            <span className="chip">world packs · {s.worldPackCount}</span>
            <span className="chip">feature packs · {s.featurePackCount}</span>
          </div>
        </EntryCard>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card px-4 py-3.5">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-[var(--muted)]">{label}</div>
    </div>
  );
}

function EntryCard({
  href,
  title,
  desc,
  children,
}: {
  href: string;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <a href={href} className="card card-hover flex flex-col p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-[var(--faint)]">→</span>
      </div>
      <p className="mt-1.5 text-sm text-[var(--muted)]">{desc}</p>
      {children}
    </a>
  );
}
