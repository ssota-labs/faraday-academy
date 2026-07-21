import catalogJson from "@faraday-academy/registry/catalog";

export interface PackCatalogItem {
  name: string;
  displayName: string;
  description: string;
  category: string;
  requires: string[];
  variants: string[];
  dependencies: Array<{ packageName: string; version: string }>;
  quality: string | null;
  installCommand: string;
}

export type BlockKind = "primitive" | "pattern";

export interface BlockCatalogItem {
  name: string;
  slug: string;
  kind: BlockKind;
  group: string;
  summary: string;
  importPath: string | null;
  sourcePath: string | null;
  primitives: string[];
  usage: string | null;
}

export interface ExampleCatalogItem {
  slug: string;
  title: string;
  description: string;
  packs: string[];
}

export const catalog = catalogJson as {
  schemaVersion: number;
  packs: PackCatalogItem[];
  blocks: BlockCatalogItem[];
  examples: ExampleCatalogItem[];
};

export function packByName(name: string) {
  return catalog.packs.find((pack) => pack.name === name);
}

export function blockBySlug(slug: string) {
  return catalog.blocks.find((block) => block.slug === slug);
}

export function blockByName(name: string) {
  const normalized = name.toLowerCase();
  return catalog.blocks.find(
    (block) =>
      block.name.toLowerCase() === normalized || block.slug === normalized,
  );
}
