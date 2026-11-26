import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { exec, theme, appHome, checking, layout, shared, setShared, run } from "herdr";

const until = (ts) => {
  const m = Math.max(0, Math.round((ts * 1000 - Date.now()) / 60000));
  return m >= 1440 ? `${Math.floor(m / 1440)}d ${Math.floor((m % 1440) / 60)}h` : m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
};

// Minimizing shrinks this mod's own layout block down to its header.
const MOD = "claude-plan-usage";
const MINIMIZED = 42; // header height plus the top border
function ownBlock(node) {
  if (node?.content?.mod === MOD && !node.content.props?.badge) return node;
  for (const child of node?.children ?? []) {
    const found = ownBlock(child);
    if (found) return found;
  }
  return null;
}
const isMinimized = (block) => block?.size?.px != null && block.size.px <= MINIMIZED;

export default class ClaudePlanUsage extends View {
  init(_props, cx) {
    this.usage = null;
    this.error = null;
    if (checking()) return;
    this.refresh(cx);
    cx.timer.every(4000, (cx) => this.refresh(cx));
  }

  refresh(cx) {
    cx.spawn(async (cx) => {
      try {
        const r = await exec("python3", [appHome() + "/mods/claude-plan-usage/usage.py"], { timeout: 15000 });
        this.usage = JSON.parse(r.stdout).usage;
        this.error = r.code === 0 ? null : r.stderr.slice(0, 200);
      } catch (e) {
        this.error = String(e).slice(0, 200);
      }
      cx.notify();
    });
  }

  usageView(t) {
    const u = this.usage || {};
    const line = (label, w) => {
      if (!w) return null;
      const p = Math.min(100, w.used_percentage);
      const c = p < 60 ? t.done : p < 85 ? t.blocked : t.working;
      return h_flex().h(20).gap(9).items_center()
        .child(div().w(18).flex_none().text_size(11).text_color(t.muted).child(label))
        .child(div().flex_1().h(3).rounded(2).bg(t.border).child(div().h(3).rounded(2).bg(c).w(`${p}%`)))
        .child(div().flex_none().text_size(11).text_color(t.dim).child(`${p.toFixed(0)}%  ·  ${until(w.resets_at)}`));
    };
    const rows = [line("5h", u.five_hour), line("7d", u.seven_day)].filter(Boolean);
    return v_flex().px(16).children(rows.length ? rows : [div().text_size(11).text_color(t.dim).child("Waiting for a Claude response…")]);
  }

  toggleMinimized(cx) {
    const block = ownBlock(layout());
    if (!block) return;
    if (isMinimized(block)) {
      run("layout.resize", { id: block.id, ...(shared(MOD + ".size") ?? { px: 96 }) });
    } else {
      setShared(MOD + ".size", block.size);
      run("layout.resize", { id: block.id, px: MINIMIZED });
    }
    cx.notify();
  }

  // Chevron in the header; absent when the mod isn't a layout block (e.g. opened as an overlay).
  minimizeButton(t) {
    const block = ownBlock(layout());
    const min = isMinimized(block);
    return div().when(!!block, (el) => el.child(div().id("minimize").size(26).flex_none().flex().items_center().justify_center().rounded(6)
      .text_color(t.dim).cursor_pointer().hover((st) => st.bg(t.hover).text_color(t.foreground))
      .tooltip(min ? "Expand" : "Minimize")
      .on_click((_e, cx) => this.toggleMinimized(cx))
      .child(svg(`mods/workspace-chrome/chevron-${min ? "right" : "down"}.svg`).size(14))));
  }

  render(cx) {
    const t = theme();
    return v_flex().size_full().min_h(0).bg(t.chrome).border_t(1).border_color(t.border).text_size(13)
      .child(h_flex().px(16).pr(10).h(41).pt(14).pb(5).flex_none().items_center().justify_between()
        .child(div().text_size(11.5).font_medium().text_color(t.dim).child("Plan usage"))
        .child(this.minimizeButton(t)))
      .when(!isMinimized(ownBlock(layout())), (el) => el.child(this.usageView(t)))
      .when(this.error, (el) => el.child(div().px(16).text_size(11).text_color(t.working).child(this.error)));
  }
}
