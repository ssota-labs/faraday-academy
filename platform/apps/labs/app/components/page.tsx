import { loadComponentGroups } from "@/lib/catalog";
import { ComponentCatalog } from "@/components/ComponentCatalog";

export const dynamic = "force-dynamic";

export default function ComponentsPage() {
  const groups = loadComponentGroups();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">UI components</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Everything under <code className="code">@faraday/runtime</code>, grouped by folder. Each card is one source
          file — its header doc, exported symbols, and path. This is the vendored layer that lands in every lesson under{" "}
          <code className="code">src/faraday/**</code>.
        </p>
      </header>
      <ComponentCatalog groups={groups} />
    </div>
  );
}
