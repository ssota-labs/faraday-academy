import { BlockGrid } from "@/components/block-grid";
import { catalog, type BlockKind } from "@/lib/catalog";

function parseKind(value: string | undefined): "all" | BlockKind {
  if (value === "primitive" || value === "pattern") return value;
  return "all";
}

export default async function BlocksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string }>;
}) {
  const { q = "", kind } = await searchParams;
  const primitiveCount = catalog.blocks.filter((block) => block.kind === "primitive").length;
  const patternCount = catalog.blocks.filter((block) => block.kind === "pattern").length;

  return (
    <main className="px-5 py-8 md:px-7">
      <header className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Library</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-4xl tracking-[-0.03em]">
          Lesson blocks
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Primitives are the composable teaching units. Patterns assemble a few of them into a
          ready-made usage scene you can copy into a lesson.
        </p>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          {primitiveCount} primitives · {patternCount} patterns
        </p>
      </header>
      <div className="mt-7">
        <BlockGrid
          blocks={catalog.blocks}
          initialQuery={q}
          initialKind={parseKind(kind)}
        />
      </div>
    </main>
  );
}
