import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createPlatformAdapter } from "./index";

describe("supabase adapter", () => {
  it("defaults to memory mode", () => {
    const { mode, store } = createPlatformAdapter({});
    assert.equal(mode, "memory");
    assert.ok(store);
  });
});
