import { defineConfig } from "@playwright/test";

/** Billing e2e config placeholder (P5). */
export default defineConfig({
  testDir: "./tests-billing",
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100" },
});
