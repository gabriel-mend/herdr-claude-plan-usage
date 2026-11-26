// Fake `gpui-kit`, `gpui-base` and `herdr` modules: elements are plain trees the tests can search and click.
export const fake = {};
export function reset(over = {}) {
  Object.assign(fake, { calls: [], agents: [], terminals: [], props: null, hc: { code: 0 }, exec: { code: 0, stdout: "{}" } }, over);
}
reset();

function element() {
  const node = { id_: null, kids: [], click: null, hovered: null };
  const el = new Proxy(node, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === "then") return undefined;
      return (...args) => {
        if (key === "id") target.id_ = args[0];
        else if (key === "child") target.kids.push(args[0]);
        else if (key === "children") target.kids.push(...args[0]);
        else if (key === "on_click") target.click = args[0];
        else if (key === "on_hover") target.hovered = args[0];
        else if (key === "when" && args[0]) args[1](el);
        return el;
      };
    },
  });
  return el;
}

export class View {}
export const div = element, h_flex = element, v_flex = element, svg = element;
export const theme = () => new Proxy({}, { get: () => "#000000" });
export const agents = () => fake.agents;
export const terminals = () => fake.terminals;
export const props = () => fake.props;
export const appHome = () => "/app";
export const checking = () => true;
export const run = (...args) => { fake.calls.push(["run", ...args]); };
export const hc = (args) => { fake.calls.push(["hc", args]); return Promise.resolve(fake.hc); };
export const exec = (cmd, args) => { fake.calls.push(["exec", cmd, args]); return Promise.resolve(fake.exec); };
