import {
  AssessmentAttemptSchema,
  type AssessmentAttempt,
  type AssessmentDefinition,
  type SealedGradingKey,
} from "@faraday-academy/platform-contracts";
import type { PlatformStore } from "./ports";
import { createId, nowIso } from "./ports";
import { sha256Hex } from "./release";

export function createAssessmentService(store: PlatformStore) {
  return {
    async registerOfficial(input: {
      definition: AssessmentDefinition;
      answers: Record<string, unknown>;
      passThreshold?: number;
    }): Promise<{ definition: AssessmentDefinition; gradingKeyHash: string }> {
      if (input.definition.mode !== "OFFICIAL") {
        throw new Error("NOT_OFFICIAL");
      }
      await store.saveAssessmentDefinition(input.definition);
      const gradingKeyHash = sha256Hex(JSON.stringify(input.answers));
      const key: SealedGradingKey = {
        assessmentVersionId: input.definition.assessmentVersionId,
        gradingKeyHash,
        answers: input.answers,
        passThreshold: input.passThreshold ?? 0.7,
      };
      // Bind public item hashes to sealed key
      for (const item of input.definition.items) {
        if (!/^[a-f0-9]{64}$/.test(item.publicItemHash)) {
          throw new Error("INVALID_ITEM_HASH");
        }
      }
      await store.saveSealedKey(key);
      return { definition: input.definition, gradingKeyHash };
    },

    async startAttempt(input: {
      assessmentId: string;
      learnerId: string;
      courseId: string;
      courseVersionId: string;
      idempotencyKey: string;
    }): Promise<AssessmentAttempt> {
      const existing = await store.getAttemptByIdempotency(
        input.learnerId,
        input.idempotencyKey,
      );
      if (existing) return existing;

      const def = await store.getAssessmentDefinition(input.assessmentId);
      if (!def) throw new Error("ASSESSMENT_NOT_FOUND");
      if (def.mode !== "OFFICIAL") throw new Error("PRACTICE_CLIENT_SIDE");

      const attempt: AssessmentAttempt = {
        id: createId("atm"),
        assessmentId: def.assessmentId,
        assessmentVersionId: def.assessmentVersionId,
        courseId: input.courseId,
        courseVersionId: input.courseVersionId,
        learnerId: input.learnerId,
        status: "IN_PROGRESS",
        itemOrder: def.items.map((i) => i.itemId),
        responses: {},
        score: null,
        passed: null,
        startedAt: nowIso(),
        submittedAt: null,
        gradedAt: null,
        idempotencyKey: input.idempotencyKey,
      };
      AssessmentAttemptSchema.parse(attempt);
      await store.saveAttempt(attempt);
      return attempt;
    },

    async submit(input: {
      attemptId: string;
      learnerId: string;
      responses: Record<string, unknown>;
      /** Client-sent score/correct MUST be ignored. */
      clientScore?: unknown;
      clientPassed?: unknown;
      clientCorrect?: unknown;
    }): Promise<AssessmentAttempt> {
      void input.clientScore;
      void input.clientPassed;
      void input.clientCorrect;

      const attempt = await store.getAttempt(input.attemptId);
      if (!attempt) throw new Error("ATTEMPT_NOT_FOUND");
      if (attempt.learnerId !== input.learnerId) throw new Error("FORBIDDEN");
      if (attempt.status === "GRADED" || attempt.status === "SUBMITTED") {
        return attempt;
      }

      const key = await store.getSealedKey(attempt.assessmentVersionId);
      if (!key) throw new Error("SEALED_KEY_MISSING");

      const itemIds = attempt.itemOrder;
      let correct = 0;
      for (const id of itemIds) {
        const expected = key.answers[id];
        const got = input.responses[id];
        if (JSON.stringify(expected) === JSON.stringify(got)) correct++;
      }
      const score = itemIds.length === 0 ? 0 : correct / itemIds.length;
      const passed = score >= key.passThreshold;

      const graded: AssessmentAttempt = {
        ...attempt,
        status: "GRADED",
        responses: input.responses,
        score,
        passed,
        submittedAt: nowIso(),
        gradedAt: nowIso(),
      };
      await store.saveAttempt(graded);
      return graded;
    },
  };
}

/** Public assessment payload never includes answers. */
export function publicAssessmentView(def: AssessmentDefinition) {
  return {
    assessmentId: def.assessmentId,
    assessmentVersionId: def.assessmentVersionId,
    mode: def.mode,
    title: def.title,
    items: def.items.map((i) => ({
      itemId: i.itemId,
      prompt: i.prompt,
      choices: i.choices,
      publicItemHash: i.publicItemHash,
    })),
    maxAttempts: def.maxAttempts,
    timeLimitSeconds: def.timeLimitSeconds,
  };
}
