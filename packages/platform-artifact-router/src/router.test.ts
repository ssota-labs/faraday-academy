import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createMemoryStore,
  createReleaseService,
} from "@faraday-academy/platform-core";
import { sampleCourseDefinition } from "@faraday-academy/platform-contracts/fixtures";
import { createArtifactRouter } from "./index";

describe("artifact router", () => {
  it("renders shell without injecting tokens into iframe attrs", async () => {
    const store = createMemoryStore();
    const releases = createReleaseService(store);
    const course = await releases.createCourse({
      ownerId: "o1",
      slug: "optics",
      title: "Optics",
    });
    await releases.publishBuild({
      courseId: course.id,
      createdBy: "o1",
      definition: { ...sampleCourseDefinition, courseId: course.id },
      files: { "index.html": "<html>lesson</html>" },
      sealed: { grounding: "light" },
    });

    const router = createArtifactRouter(store);
    const resolved = await router.resolve("optics.learn.faraday.com");
    assert.ok(resolved);
    assert.match(resolved!.shellHtml, /sandbox=/);
    assert.doesNotMatch(resolved!.shellHtml, /accessToken|sessionToken|Bearer /);
    assert.match(resolved!.shellHtml, /__FARADAY_SHELL__/);
    assert.ok(resolved!.guestGrant);
  });
});
