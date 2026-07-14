/**
 * Emits a JSON Schema map for harness:docs sync.
 * Run: pnpm --filter @faraday-academy/platform-contracts build:schema
 */
import { zodToJsonSchema } from "./zod-to-json-schema";
import { CourseDefinitionSchema } from "./course";
import { ReleaseManifestSchema } from "./release";
import { LearningEventSchema } from "./lms";
import { EntitlementSchema } from "./entitlement";
import { AssessmentDefinitionSchema } from "./assessment";
import { UgcBridgeMessageSchema } from "./ugc-bridge";
import { AuthCodeExchangeRequestSchema } from "./auth";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const schemas = {
  CourseDefinition: zodToJsonSchema(CourseDefinitionSchema, "CourseDefinition"),
  ReleaseManifest: zodToJsonSchema(ReleaseManifestSchema, "ReleaseManifest"),
  LearningEvent: zodToJsonSchema(LearningEventSchema, "LearningEvent"),
  Entitlement: zodToJsonSchema(EntitlementSchema, "Entitlement"),
  AssessmentDefinition: zodToJsonSchema(
    AssessmentDefinitionSchema,
    "AssessmentDefinition",
  ),
  UgcBridgeMessage: zodToJsonSchema(UgcBridgeMessageSchema, "UgcBridgeMessage"),
  AuthCodeExchangeRequest: zodToJsonSchema(
    AuthCodeExchangeRequestSchema,
    "AuthCodeExchangeRequest",
  ),
};

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "schemas.json"),
  JSON.stringify(schemas, null, 2) + "\n",
);
console.log(`Wrote ${Object.keys(schemas).length} schemas to generated/schemas.json`);
