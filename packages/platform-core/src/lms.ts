import {
  LearningEventIntentSchema,
  LearningEventSchema,
  type Enrollment,
  type Entitlement,
  type LearningEvent,
  type ProgressProjection,
} from "@faraday-academy/platform-contracts";
import type { PlatformStore } from "./ports";
import { createId, nowIso } from "./ports";

const OFFICIAL_TYPES = new Set([
  "complete_node",
  "award_xp",
  "assessment_passed",
]);

export function createLmsService(store: PlatformStore) {
  return {
    async ensureFreeEntitlement(input: {
      courseId: string;
      userId: string;
    }): Promise<Entitlement> {
      const existing = await store.listEntitlements(input.courseId, input.userId);
      const active = existing.find((e) => e.status === "ACTIVE");
      if (active) return active;
      const ent: Entitlement = {
        id: createId("ent"),
        courseId: input.courseId,
        userId: input.userId,
        status: "ACTIVE",
        source: "FREE_GRANT",
        providerReference: null,
        startsAt: nowIso(),
        expiresAt: null,
        reason: "public_free",
        createdAt: nowIso(),
      };
      await store.saveEntitlement(ent);
      return ent;
    },

    async enroll(input: {
      courseId: string;
      learnerId: string;
      courseVersionId: string;
    }): Promise<Enrollment> {
      const existing = await store.getEnrollment(input.courseId, input.learnerId);
      if (existing) return existing;
      const enrollment: Enrollment = {
        id: createId("enr"),
        courseId: input.courseId,
        learnerId: input.learnerId,
        courseVersionId: input.courseVersionId,
        createdAt: nowIso(),
      };
      await store.saveEnrollment(enrollment);
      return enrollment;
    },

    async hasAccess(courseId: string, userId: string): Promise<boolean> {
      const ents = await store.listEntitlements(courseId, userId);
      return ents.some((e) => e.status === "ACTIVE");
    },

    async ingestEvents(input: {
      learnerId: string;
      intents: unknown[];
    }): Promise<{ accepted: number; duplicates: number; rejected: number }> {
      let accepted = 0;
      let duplicates = 0;
      let rejected = 0;

      for (const raw of input.intents) {
        let intent;
        try {
          intent = LearningEventIntentSchema.parse(raw);
        } catch {
          rejected++;
          continue;
        }

        // Client-supplied learnerId is ignored; server identity wins.
        // Official completion/XP cannot be granted via client interaction alone.
        if (OFFICIAL_TYPES.has(intent.type)) {
          rejected++;
          continue;
        }

        const event: LearningEvent = LearningEventSchema.parse({
          ...intent,
          learnerId: input.learnerId,
        });

        const result = await store.appendEvent(event);
        if (result === "duplicate") {
          duplicates++;
          continue;
        }
        accepted++;
        await recomputeProjection(store, event);
      }
      return { accepted, duplicates, rejected };
    },

    async grantAssessmentCompletion(input: {
      learnerId: string;
      courseId: string;
      courseVersionId: string;
      nodeId: string;
      sessionId: string;
    }): Promise<ProgressProjection> {
      const event: LearningEvent = {
        eventId: createId("evt"),
        schemaVersion: 1,
        courseId: input.courseId,
        courseVersionId: input.courseVersionId,
        learnerId: input.learnerId,
        sessionId: input.sessionId,
        nodeId: input.nodeId,
        type: "assessment_passed",
        occurredAt: nowIso(),
        payload: { source: "server_grant" },
      };
      await store.appendEvent(event);
      return recomputeProjection(store, event);
    },

    async getProgress(
      courseId: string,
      learnerId: string,
    ): Promise<ProgressProjection | null> {
      return store.getProjection(courseId, learnerId);
    },
  };
}

async function recomputeProjection(
  store: PlatformStore,
  latest: LearningEvent,
): Promise<ProgressProjection> {
  const events = await store.listEvents(latest.courseId, latest.learnerId);
  const completed = new Set<string>();
  let xp = 0;
  let lastEventAt: string | null = null;
  for (const e of events) {
    lastEventAt = e.occurredAt;
    if (e.type === "assessment_passed" && e.nodeId) {
      completed.add(e.nodeId);
      xp += 10;
    }
    if (e.type === "enter_node" || e.type === "interaction") {
      // interaction only — no official XP
    }
  }
  const projection: ProgressProjection = {
    courseId: latest.courseId,
    courseVersionId: latest.courseVersionId,
    learnerId: latest.learnerId,
    completedNodeIds: [...completed],
    xp,
    lastEventAt,
    updatedAt: nowIso(),
  };
  await store.saveProjection(projection);
  return projection;
}
