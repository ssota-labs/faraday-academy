import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Copy } from "@phosphor-icons/react/dist/ssr";
import { BlockPreview } from "@/components/block-preview";
import { blockByName, blockBySlug, catalog } from "@/lib/catalog";

export function generateStaticParams() {
  return catalog.blocks.map((block) => ({ name: block.slug }));
}

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const block = blockBySlug(name) ?? blockByName(name);
  if (!block) notFound();

  const usage =
    block.usage ??
    (block.importPath
      ? `import { ${block.name} } from "${block.importPath}";`
      : null);

  return (
    <main className="px-5 py-8 md:px-7">
      <Link href="/blocks" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        All blocks
      </Link>
      <header className="mt-7 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          <span>{block.kind}</span>
          <span className="text-border">/</span>
          <span>{block.group}</span>
        </div>
        <h1 className="mt-2 font-mono text-3xl font-semibold">{block.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{block.summary}</p>
        {block.kind === "pattern" && block.primitives.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {block.primitives.map((primitiveName) => {
              const primitive = blockByName(primitiveName);
              if (!primitive) {
                return (
                  <span
                    key={primitiveName}
                    className="border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground"
                  >
                    {primitiveName}
                  </span>
                );
              }
              return (
                <Link
                  key={primitiveName}
                  href={`/blocks/${primitive.slug}`}
                  className="border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground hover:border-foreground hover:text-foreground"
                >
                  {primitive.name}
                </Link>
              );
            })}
          </div>
        ) : null}
      </header>

      <div className="grid gap-8 py-7 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Live preview
          </p>
          <div className="min-h-80 border border-border bg-background p-4">
            <BlockPreview name={block.name} />
          </div>
        </section>
        <aside className="space-y-5">
          {usage ? (
            <section>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {block.kind === "pattern" ? "Usage" : "Import"}
              </p>
              <pre className="overflow-x-auto border border-border bg-card p-4 font-mono text-xs leading-5">
                {usage}
              </pre>
            </section>
          ) : null}
          <section className="border border-border bg-card p-4 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <Copy className="size-4" />
              Registry metadata
            </div>
            <dl className="mt-4 grid gap-3 text-muted-foreground">
              <div>
                <dt className="font-mono text-[10px] uppercase">Kind</dt>
                <dd className="mt-1 capitalize">{block.kind}</dd>
              </div>
              {block.importPath ? (
                <div>
                  <dt className="font-mono text-[10px] uppercase">Package</dt>
                  <dd className="mt-1">{block.importPath}</dd>
                </div>
              ) : null}
              <div>
                <dt className="font-mono text-[10px] uppercase">Source</dt>
                <dd className="mt-1 break-all">{block.sourcePath ?? "Generated"}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}
