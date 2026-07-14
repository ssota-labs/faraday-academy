import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createStudioSandbox,
  assertWorkerEnvClean,
} from "./index";

describe("studio-sandbox", () => {
  it("isolates files and keeps worker env secret-free", () => {
    const sbx = createStudioSandbox();
    const session = sbx.start({
      ownerId: "o1",
      courseId: "c1",
      files: { "index.html": "<html></html>" },
    });
    sbx.writeFile(session.id, "src/lesson.tsx", "export default function(){}", "o1");
    assert.equal(sbx.readFile(session.id, "src/lesson.tsx", "o1")?.includes("export"), true);
    assert.throws(() => sbx.readFile(session.id, "src/lesson.tsx", "other"));
    const env = sbx.workerEnv();
    assertWorkerEnvClean(env);
    assert.throws(() =>
      assertWorkerEnvClean({ ...env, AI_GATEWAY_API_KEY: "x" }),
    );
  });
});
