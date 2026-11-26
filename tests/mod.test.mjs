import test from "node:test";
import assert from "node:assert/strict";
import { reset, mount, text } from "./harness.mjs";

test("shows both rate-limit windows", async () => {
  reset();
  const { view, cx } = await mount();
  const later = Date.now() / 1000 + 3600;
  view.usage = { five_hour: { used_percentage: 6, resets_at: later }, seven_day: { used_percentage: 11, resets_at: later } };
  const out = text(view.render(cx));
  assert.match(out, /6%/);
  assert.match(out, /11%/);
});

test("says it is waiting when there is no data", async () => {
  reset();
  const { view, cx } = await mount();
  assert.match(text(view.render(cx)), /Waiting for a Claude response/);
});
