import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMemoryStore, createReleaseService } from "@faraday-academy/platform-core";
import { sampleCourseDefinition } from "@faraday-academy/platform-contracts/fixtures";
import { createStudioBuild } from "./index";

describe("studio-build", () => {
  it("rejects missing index and publishes valid build", async () => {
    const store = createMemoryStore();
    const releases = createReleaseService(store);
    const course = await releases.createCourse({
      ownerId: "o1",
      slug: "bio",
      title: "Bio",
    });
    const build = createStudioBuild(store);
    const bad = build.validate({ "app.js": "x" }, {});
    assert.equal(bad.ok, false);

    const good = await build.buildAndPublish({
      courseId: course.id,
      createdBy: "o1",
      definition: { ...sampleCourseDefinition, courseId: course.id },
      files: { "index.html": "<html>ok</html>" },
      sealed: { grounding: "cells" },
    });
    assert.equal(good.ok, true);
  });
});
