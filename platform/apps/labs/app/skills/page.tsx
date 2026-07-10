import {
  loadAgents,
  loadCommands,
  loadFeaturePacks,
  loadPlugins,
  loadSkill,
  loadWorldPacks,
} from "@/lib/catalog";
import { SkillCatalog } from "@/components/SkillCatalog";

export const dynamic = "force-dynamic";

export default function SkillsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Skills &amp; Packs</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          What an agent picks up when it drives Faraday, and what the CLI can overlay. The skill and its phase references
          teach the method; commands and the subagent are the entry points; packs are the swappable pieces the scaffold
          composes.
        </p>
      </header>
      <SkillCatalog
        skill={loadSkill()}
        commands={loadCommands()}
        agents={loadAgents()}
        worldPacks={loadWorldPacks()}
        featurePacks={loadFeaturePacks()}
        plugins={loadPlugins()}
      />
    </div>
  );
}
