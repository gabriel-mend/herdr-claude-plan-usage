const STUBS = new URL("./stubs.mjs", import.meta.url).href;

export async function resolve(specifier, context, next) {
  if (["gpui-kit", "gpui-base", "herdr"].includes(specifier)) return { url: STUBS, shortCircuit: true };
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.endsWith("/main.js")) return next(url, { ...context, format: "module" });
  return next(url, context);
}
