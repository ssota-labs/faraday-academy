import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CourseDefinitionSchema,
  ReleaseManifestSchema,
  LearningEventSchema,
  UgcBridgeMessageSchema,
  UGC_FORBIDDEN_KEYS,
  AuthCodeExchangeRequestSchema,
  isAllowedReturnTo,
  AssessmentDefinitionSchema,
  EntitlementSchema,
} from "./index";
import { sampleCourseDefinition, sampleReleaseManifest } from "./fixtures";

describe("platform-contracts", () => {
  it("parses sample CourseDefinition", () => {
    const parsed = CourseDefinitionSchema.parse(sampleCourseDefinition);
    assert.equal(parsed.schemaVersion, 1);
    assert.equal(parsed.nodes.length, 2);
  });

  it("parses sample ReleaseManifest", () => {
    const parsed = ReleaseManifestSchema.parse(sampleReleaseManifest);
    assert.equal(parsed.entrypoint, "index.html");
    assert.ok(parsed.files.every((f) => f.path !== "faraday.release.json"));
  });

  it("rejects LearningEvent without eventId", () => {
    assert.throws(() =>
      LearningEventSchema.parse({
        schemaVersion: 1,
        courseId: "c1",
        courseVersionId: "v1",
        learnerId: "u1",
        sessionId: "s1",
        type: "enter_node",
        occurredAt: new Date().toISOString(),
      }),
    );
  });

  it("UGC bridge accepts emitInteraction without forbidden keys", () => {
    const msg = UgcBridgeMessageSchema.parse({
      method: "emitInteraction",
      params: { eventId: "e1", type: "scrub", nodeId: "n1" },
    });
    assert.equal(msg.method, "emitInteraction");
    for (const key of UGC_FORBIDDEN_KEYS) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(msg.params, key),
        false,
        `forbidden key ${key}`,
      );
    }
  });

  it("UGC bridge accepts requestTrustedSurface", () => {
    const msg = UgcBridgeMessageSchema.parse({
      method: "requestTrustedSurface",
      params: { kind: "TUTOR" },
    });
    assert.equal(msg.method, "requestTrustedSurface");
  });

  it("auth return_to allowlist", () => {
    assert.equal(isAllowedReturnTo("https://physics.learn.faraday.com/"), true);
    assert.equal(isAllowedReturnTo("http://localhost:3000/learn"), true);
    assert.equal(isAllowedReturnTo("https://evil.com/"), false);
    assert.equal(isAllowedReturnTo("https://learn.faraday.com.evil.com/"), false);
  });

  it("auth code exchange requires long code", () => {
    assert.throws(() =>
      AuthCodeExchangeRequestSchema.parse({
        code: "short",
        codeVerifier: "verifier-long-enough",
        state: "state-long-enough",
      }),
    );
  });

  it("assessment OFFICIAL definition parses", () => {
    const a = AssessmentDefinitionSchema.parse({
      assessmentId: "a1",
      assessmentVersionId: "av1",
      mode: "OFFICIAL",
      title: "Quiz 1",
      items: [
        {
          itemId: "i1",
          prompt: "2+2?",
          choices: ["3", "4"],
          publicItemHash: "a".repeat(64),
        },
      ],
    });
    assert.equal(a.mode, "OFFICIAL");
  });

  it("entitlement status model", () => {
    const e = EntitlementSchema.parse({
      id: "ent1",
      courseId: "c1",
      userId: "u1",
      status: "ACTIVE",
      source: "FREE_GRANT",
      providerReference: null,
      startsAt: new Date().toISOString(),
      expiresAt: null,
      reason: null,
      createdAt: new Date().toISOString(),
    });
    assert.equal(e.status, "ACTIVE");
  });
});
