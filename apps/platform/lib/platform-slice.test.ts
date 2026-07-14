import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createMemoryStore,
  createReleaseService,
  createLmsService,
  createAssessmentService,
  createTutorService,
  createCommerceService,
  createCommunityService,
  createOpsService,
  createStudioService,
} from "@faraday-academy/platform-core";
import { createArtifactRouter } from "@faraday-academy/platform-artifact-router";
import { createStudioBuild } from "@faraday-academy/platform-studio-build";
import { createStudioSandbox } from "@faraday-academy/platform-studio-sandbox";
import { sampleCourseDefinition } from "@faraday-academy/platform-contracts/fixtures";

/**
 * End-to-end platform slice covering P0–P7 happy paths on the memory adapter.
 */
describe("platform P0–P7 slice", () => {
  it("manifest → build → shell → LMS → official → tutor → pay → community → costs", async () => {
    const store = createMemoryStore();
    const releases = createReleaseService(store);
    const build = createStudioBuild(store);
    const lms = createLmsService(store);
    const assessment = createAssessmentService(store);
    const tutor = createTutorService(store);
    const commerce = createCommerceService(store);
    const community = createCommunityService(store);
    const ops = createOpsService(store);
    const studio = createStudioService(store);
    const sandbox = createStudioSandbox();
    const router = createArtifactRouter(store);

    // P2 sandbox draft
    const sbx = sandbox.start({
      ownerId: "creator",
      courseId: "pending",
      files: { "index.html": "<html><body>Newton</body></html>" },
    });
    assertWorkerClean(sandbox.workerEnv());

    // P0/P1 publish
    const course = await releases.createCourse({
      ownerId: "creator",
      slug: "mechanics",
      title: "Mechanics",
      access: "PUBLIC_PAID",
    });
    sbx; // session kept for ownership model
    await studio.saveDraft({
      draftId: "d1",
      courseId: course.id,
      ownerId: "creator",
      files: { "index.html": "<html><body>Newton</body></html>" },
    });

    const published = await build.buildAndPublish({
      courseId: course.id,
      createdBy: "creator",
      definition: { ...sampleCourseDefinition, courseId: course.id },
      files: {
        "index.html": "<html><body>Newton</body></html>",
        "assets/app.js": "export {}",
      },
      sealed: {
        grounding: "F=ma",
        answers: { i1: "4" },
      },
    });
    assert.equal(published.ok, true);
    if (!published.ok) return;

    const shell = await router.resolve("mechanics.learn.faraday.com");
    assert.ok(shell);
    assert.doesNotMatch(shell!.shellHtml, /accessToken/);

    // P5 paywall before access
    assert.equal(await lms.hasAccess(course.id, "student"), false);
    const order = await commerce.createCheckout({
      courseId: course.id,
      buyerId: "student",
      amountCents: 2500,
    });
    await commerce.handleWebhook({
      type: "payment_intent.succeeded",
      paymentIntentId: order.providerPaymentId!,
    });
    assert.equal(await lms.hasAccess(course.id, "student"), true);

    await lms.enroll({
      courseId: course.id,
      learnerId: "student",
      courseVersionId: published.release.courseVersionId,
    });

    // P3 LMS — forge rejected
    const ingest = await lms.ingestEvents({
      learnerId: "student",
      intents: [
        {
          eventId: "forge1",
          schemaVersion: 1,
          courseId: course.id,
          courseVersionId: published.release.courseVersionId,
          sessionId: "s",
          type: "award_xp",
          occurredAt: new Date().toISOString(),
        },
        {
          eventId: "ok1",
          schemaVersion: 1,
          courseId: course.id,
          courseVersionId: published.release.courseVersionId,
          sessionId: "s",
          type: "interaction",
          nodeId: "node_intro",
          occurredAt: new Date().toISOString(),
        },
      ],
    });
    assert.equal(ingest.rejected, 1);
    assert.equal(ingest.accepted, 1);

    // P4 official assessment
    await assessment.registerOfficial({
      definition: {
        assessmentId: "a_forces",
        assessmentVersionId: "a_forces_v1",
        mode: "OFFICIAL",
        title: "Forces",
        items: [
          {
            itemId: "i1",
            prompt: "2+2",
            choices: ["3", "4"],
            publicItemHash: "f".repeat(64),
          },
        ],
      },
      answers: { i1: "4" },
    });
    const attempt = await assessment.startAttempt({
      assessmentId: "a_forces",
      learnerId: "student",
      courseId: course.id,
      courseVersionId: published.release.courseVersionId,
      idempotencyKey: "k1",
    });
    const graded = await assessment.submit({
      attemptId: attempt.id,
      learnerId: "student",
      responses: { i1: "4" },
      clientPassed: false,
    });
    assert.equal(graded.passed, true);

    // P4 tutor
    const run = await tutor.startRun({
      userId: "student",
      courseId: course.id,
      courseVersionId: published.release.courseVersionId,
      officialAttemptId: attempt.id,
      messages: [],
    });
    assert.equal(run.locked, false); // already graded

    // P6 community
    const thread = await community.createThread({
      courseId: course.id,
      authorId: "student",
      title: "Question",
      body: "Why F=ma?",
      hasAccess: true,
    });
    assert.ok(thread.id);

    // P7 costs
    const costs = await ops.costDashboard("student", course.id);
    assert.ok(costs.tutorTokens >= 0);

    const integrity = await ops.verifyReleaseIntegrity({
      buildHash: published.release.buildHash,
      expectedFiles: published.manifest.files,
    });
    assert.equal(integrity.ok, true);
  });
});

function assertWorkerClean(env: Record<string, string>) {
  assert.equal("AI_GATEWAY_API_KEY" in env, false);
}
