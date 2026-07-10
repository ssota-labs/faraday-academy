import path from "node:path";
import type { NextConfig } from "next";

// Labs reads source files from sibling workspace packages and the repo's
// plugins/ tree. Point file-tracing at the repo root so those parent-dir reads
// are resolved consistently and Next doesn't infer the wrong workspace root.
const config: NextConfig = {
  outputFileTracingRoot: path.join(import.meta.dirname, "..", "..", ".."),
};

export default config;
