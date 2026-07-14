import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  createMemoryStore,
  createAuthBootstrap,
  AuthError,
  createReleaseService,
  createLmsService,
  createAssessmentService,
  createTutorService,
  createStudioService,
  createCommerceService,
  createCommunityService,
  createOpsService,
  signGuestGrant,
  verifyGuestGrant,
  scanPublicArtifactForSecrets,
} from "./index";
import {
  sampleCourseDefinition,
  sampleSealedAnswers,
} from "@faraday-academy/platform-contracts/fixtures";

function pkce() {
  const verifier = "a".repeat(43);
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

describe("auth bootstrap", () => {
  it("exchanges one-time code with PKCE", async () => {
    const store = createMemoryStore();
    const auth = createAuthBootstrap(store);
    const { challenge, verifier } = pkce();
    const { state } = await auth.start({
      returnTo: "https://physics.learn.faraday.com/",
      codeChallenge: challenge,
    });
    const { code } = await auth.completeLogin({ state, userId: "user_1" });
    const result = await auth.exchange({
      code,
      codeVerifier: verifier,
      state,
    });
    assert.equal(result.userId, "user_1");
  });

  it("rejects code replay", async () => {
    const store = createMemoryStore();
    const auth = createAuthBootstrap(store);
    const { challenge, verifier } = pkce();
    const { state } = await auth.start({
      returnTo: "http://localhost:3000/",
      codeChallenge: challenge,
    });
    const { code } = await auth.completeLogin({ state, userId: "user_1" });
    await auth.exchange({ code, codeVerifier: verifier, state });
    await assert.rejects(
      () => auth.exchange({ code, codeVerifier: verifier, state }),
      (err: unknown) => err instanceof AuthError && err.code === "CODE_REPLAY",
    );
  });

  it("rejects invalid return_to", async () => {
    const store = createMemoryStore();
    const auth = createAuthBootstrap(store);
    await assert.rejects(
      () =>
        auth.start({
          returnTo: "https://evil.com/",
          codeChallenge: "x".repeat(20),
        }),
      (err: unknown) =>
        err instanceof AuthError && err.code === "INVALID_RETURN_TO",
    );
  });
});

describe("release + artifact scan", () => {
  it("publishes and resolves learning host", async () => {
    const store = createMemoryStore();
    const releases = createReleaseService(store);
    const course = await releases.createCourse({
      ownerId: "owner_1",
      slug: "physics",
      title: "Physics",
    });
    const { release, manifest } = await releases.publishBuild({
      courseId: course.id,
      createdBy: "owner_1",
      definition: sampleCourseDefinition,
      files: {
        "index.html": "<html><body>hello</body></html>",
        "assets/app.js": "console.log(1)",
      },
      sealed: { grounding: "Newton laws", answers: sampleSealedAnswers.answers },
    });
    assert.equal(release.status, "READY");
    assert.equal(manifest.files.length, 2);

    const resolved = await releases.resolveLearningHost(
      "physics.learn.faraday.com",
    );
    assert.ok(resolved);
    assert.equal(resolved!.release.id, release.id);
  });

  it("blocks answer leak in public artifact", () => {
    const scan = scanPublicArtifactForSecrets(
      {
        "index.html": `{"official":true,"answerKey":"secret-answer-xyz"}`,
      },
      { answers: { i1: "secret-answer-xyz" } },
    );
    assert.equal(scan.ok, false);
  });

  it("rollback swaps active release pointer", async () => {
    const store = createMemoryStore();
    const releases = createReleaseService(store);
    const course = await releases.createCourse({
      ownerId: "owner_1",
      slug: "chem",
      title: "Chem",
    });
    const a = await releases.publishBuild({
      courseId: course.id,
      createdBy: "owner_1",
      definition: { ...sampleCourseDefinition, courseId: course.id },
      files: { "index.html": "v1" },
      sealed: {},
    });
    const b = await releases.publishBuild({
      courseId: course.id,
      createdBy: "owner_1",
      definition: { ...sampleCourseDefinition, courseId: course.id },
      files: { "index.html": "v2" },
      sealed: {},
    });
    const rolled = await releases.rollback({
      courseId: course.id,
      releaseId: a.release.id,
      actorId: "owner_1",
    });
    assert.equal(rolled.activeReleaseId, a.release.id);
    assert.notEqual(rolled.activeReleaseId, b.release.id);
  });
});

describe("LMS", () => {
  it("ignores forged complete_node and client learnerId", async () => {
    const store = createMemoryStore();
    const lms = createLmsService(store);
    const result = await lms.ingestEvents({
      learnerId: "real_user",
      intents: [
        {
          eventId: "e1",
          schemaVersion: 1,
          courseId: "c1",
          courseVersionId: "v1",
          learnerId: "attacker",
          sessionId: "s1",
          type: "complete_node",
          nodeId: "n1",
          occurredAt: new Date().toISOString(),
        },
        {
          eventId: "e2",
          schemaVersion: 1,
          courseId: "c1",
          courseVersionId: "v1",
          sessionId: "s1",
          type: "interaction",
          nodeId: "n1",
          occurredAt: new Date().toISOString(),
        },
      ],
    });
    assert.equal(result.rejected, 1);
    assert.equal(result.accepted, 1);
    const progress = await lms.getProgress("c1", "real_user");
    assert.equal(progress?.xp ?? 0, 0);
    assert.deepEqual(progress?.completedNodeIds ?? [], []);
  });
});

describe("assessment", () => {
  it("server-grades and ignores client score", async () => {
    const store = createMemoryStore();
    const assess = createAssessmentService(store);
    await assess.registerOfficial({
      definition: {
        assessmentId: "a1",
        assessmentVersionId: "av1",
        mode: "OFFICIAL",
        title: "Q",
        items: [
          {
            itemId: "i1",
            prompt: "2+2",
            choices: ["3", "4"],
            publicItemHash: "a".repeat(64),
          },
        ],
      },
      answers: { i1: "4" },
    });
    const attempt = await assess.startAttempt({
      assessmentId: "a1",
      learnerId: "u1",
      courseId: "c1",
      courseVersionId: "v1",
      idempotencyKey: "idem1",
    });
    const graded = await assess.submit({
      attemptId: attempt.id,
      learnerId: "u1",
      responses: { i1: "4" },
      clientScore: 0,
      clientPassed: false,
      clientCorrect: false,
    });
    assert.equal(graded.passed, true);
    assert.equal(graded.score, 1);
  });
});

describe("tutor / studio / commerce / community / ops", () => {
  it("tutor ignores client answer key and enforces budget", async () => {
    const store = createMemoryStore();
    const tutor = createTutorService(store, { tokenBudget: 500 });
    const r1 = await tutor.startRun({
      userId: "u1",
      courseId: "c1",
      courseVersionId: "v1",
      messages: [],
      clientAnswerKey: { i1: "4" },
    });
    assert.ok(r1.run.id);
    await assert.rejects(() =>
      tutor.startRun({
        userId: "u1",
        courseId: "c1",
        courseVersionId: "v1",
        messages: [],
      }),
    );
  });

  it("studio preview url + draft", async () => {
    const store = createMemoryStore();
    const studio = createStudioService(store);
    const { draftId } = await studio.saveDraft({
      courseId: "c1",
      ownerId: "o1",
      files: { "index.html": "<html></html>" },
    });
    const turn = await studio.agentTurn({
      ownerId: "o1",
      courseId: "c1",
      draftId,
      message: "Add a slider",
    });
    assert.ok(turn.previewBuildId);
    assert.match(studio.derivePreviewUrl(turn.previewBuildId!), /preview/);
  });

  it("commerce webhook is idempotent", async () => {
    const store = createMemoryStore();
    const commerce = createCommerceService(store);
    const order = await commerce.createCheckout({
      courseId: "c1",
      buyerId: "u1",
      amountCents: 1999,
    });
    const a = await commerce.handleWebhook({
      type: "payment_intent.succeeded",
      paymentIntentId: order.providerPaymentId!,
    });
    const b = await commerce.handleWebhook({
      type: "payment_intent.succeeded",
      paymentIntentId: order.providerPaymentId!,
    });
    assert.equal(a.entitlement?.id, b.entitlement?.id);
  });

  it("community requires access", async () => {
    const store = createMemoryStore();
    const community = createCommunityService(store);
    await assert.rejects(() =>
      community.createThread({
        courseId: "c1",
        authorId: "u1",
        title: "Hi",
        body: "Hello",
        hasAccess: false,
      }),
    );
    const t = await community.createThread({
      courseId: "c1",
      authorId: "u1",
      title: "Hi",
      body: "Hello",
      hasAccess: true,
    });
    assert.ok(t.id);
  });

  it("guest grant roundtrip", () => {
    const token = signGuestGrant("secret", {
      courseId: "c1",
      releaseId: "r1",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const claims = verifyGuestGrant("secret", token);
    assert.deepEqual(claims, { courseId: "c1", releaseId: "r1" });
    assert.equal(verifyGuestGrant("wrong", token), null);
  });

  it("ops cost dashboard", async () => {
    const store = createMemoryStore();
    const tutor = createTutorService(store);
    await tutor.startRun({
      userId: "u1",
      courseId: "c1",
      courseVersionId: "v1",
      messages: [],
    });
    const ops = createOpsService(store);
    const snap = await ops.costDashboard("u1", "c1");
    assert.ok(snap.tutorTokens > 0);
  });
});
