import test from "node:test";
import assert from "node:assert/strict";
import { fake, reset, mount, find, text } from "./harness.mjs";

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

const block = (size) => ({ children: [{ id: "my-block", size, content: { mod: "claude-plan-usage" } }] });

test("minimize shrinks the block and expand restores its size", async () => {
  reset({ layout: block({ px: 200 }) });
  const { view, cx } = await mount();
  find(view.render(cx), "minimize").click({}, cx);
  assert.deepEqual(fake.calls, [["run", "layout.resize", { id: "my-block", px: 42 }]]);
  fake.calls.length = 0;
  fake.layout = block({ px: 42 });
  find(view.render(cx), "minimize").click({}, cx);
  assert.deepEqual(fake.calls, [["run", "layout.resize", { id: "my-block", px: 200 }]]);
});

test("expand falls back to the default size when none was saved", async () => {
  reset({ layout: block({ px: 42 }) });
  const { view, cx } = await mount();
  find(view.render(cx), "minimize").click({}, cx);
  assert.deepEqual(fake.calls, [["run", "layout.resize", { id: "my-block", ...{ px: 96 } }]]);
});

test("there is no minimize button outside a layout block", async () => {
  reset();
  const { view, cx } = await mount();
  assert.equal(find(view.render(cx), "minimize"), null);
});
