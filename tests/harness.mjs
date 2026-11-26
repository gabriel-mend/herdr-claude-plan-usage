import { register } from "node:module";
import { fake, reset } from "./stubs.mjs";

register("./loader.mjs", import.meta.url);
export { fake, reset };

export async function mount() {
  const { default: Mod } = await import("../main.js");
  const view = new Mod();
  const spawned = [];
  const cx = {
    notify() {}, stop_propagation() {}, timer: { every() {} },
    spawn(fn) { spawned.push(fn); },
  };
  view.init({}, cx);
  return { view, cx, spawned };
}

export function find(el, id) {
  if (!el || typeof el !== "object") return null;
  if (el.id_ === id) return el;
  for (const kid of el.kids ?? []) {
    const hit = find(kid, id);
    if (hit) return hit;
  }
  return null;
}

export function text(el) {
  if (el == null) return "";
  if (typeof el !== "object") return String(el);
  return (el.kids ?? []).map(text).join(" ");
}
