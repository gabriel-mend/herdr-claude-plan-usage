<p align="center"><img src="logo.svg" width="120" alt="herdr-claude-plan-usage logo"></p>

# herdr-claude-plan-usage

A Herdr.app sidebar mod showing your **Claude plan rate-limit usage** (5h and 7d windows, with reset countdown). Claude Pro/Max only.

## The Claude mods

Each one works on its own; together they share the account list.

| Repository | What it does |
| --- | --- |
| [herdr-claude-context](https://github.com/gabriel-mend/herdr-claude-context) | Context-window usage per agent, with a compact button |
| [herdr-claude-plan-usage](https://github.com/gabriel-mend/herdr-claude-plan-usage) (this one) | Claude 5h / 7d plan rate-limit usage |
| [herdr-claude-accounts](https://github.com/gabriel-mend/herdr-claude-accounts) | Switch between Claude accounts |

## Easy install (all 3 mods)

Needs Herdr.app, Claude Code, `git` and `python3`. Paste into a terminal; running it again updates the mods.

```sh
(
set -e
MODS="$HOME/.config/herdr-app/mods"
mkdir -p "$MODS" "$HOME/.claude/hooks"
for m in claude-context claude-plan-usage claude-accounts; do
  if [ -d "$MODS/$m/.git" ]; then git -C "$MODS/$m" pull --ff-only
  elif [ -e "$MODS/$m" ]; then echo "skipped $m: $MODS/$m exists and is not a git clone"
  else git clone "https://github.com/gabriel-mend/herdr-$m" "$MODS/$m"
  fi
done
cp "$MODS/claude-plan-usage/claude-hook/herdr-usage-statusline.py" "$HOME/.claude/hooks/"
python3 - <<'PY'
import json, os
p = os.path.expanduser("~/.claude/settings.json")
s = json.load(open(p)) if os.path.exists(p) else {}
if "statusLine" in s:
    print("statusLine already set: left unchanged (see herdr-claude-plan-usage)")
else:
    s["statusLine"] = {"type": "command", "command": "python3 ~/.claude/hooks/herdr-usage-statusline.py"}
    json.dump(s, open(p, "w"), indent=2)
    print("statusLine added")
PY
)
```

Then add the blocks to a personal layout. Shipped layouts are read-only, so clone one first (`layout.clone`; run `herdr-app commands` for its arguments). Put these inside the sidebar column of your file in `~/.config/herdr-app/layouts/`:

```json
{ "id": "claude-context",    "type": "block", "size": { "weight": 1 }, "min": 90, "content": { "mod": "claude-context" } },
{ "id": "claude-accounts",   "type": "block", "size": { "px": 150 },  "min": 60, "content": { "mod": "claude-accounts" } },
{ "id": "claude-plan-usage", "type": "block", "size": { "px": 78 },   "min": 60, "content": { "mod": "claude-plan-usage" } }
```

Switch to it with `herdr-app do layout.switch --name <your-layout>`. Changing to a layout without these blocks hides the mods.

## Install only this mod

```sh
git clone https://github.com/gabriel-mend/herdr-claude-plan-usage ~/.config/herdr-app/mods/claude-plan-usage
herdr-app check ~/.config/herdr-app/mods/claude-plan-usage
mkdir -p ~/.claude/hooks && cp ~/.config/herdr-app/mods/claude-plan-usage/claude-hook/herdr-usage-statusline.py ~/.claude/hooks/
```

Add to `~/.claude/settings.json`:

```json
"statusLine": { "type": "command", "command": "python3 ~/.claude/hooks/herdr-usage-statusline.py" }
```

Add it as a block in a personal layout:

```json
{ "id": "claude-plan-usage", "type": "block", "size": { "px": 78 }, "min": 60, "content": { "mod": "claude-plan-usage" } }
```

## How it works

The statusLine hook prints nothing; it saves `rate_limits` to `<profile>/state/herdr-usage.json` (using `CLAUDE_CONFIG_DIR` when set). Values refresh whenever a Claude session gets a response. The mod shows the active account from `~/.claude/state/herdr-accounts.json` (see [herdr-claude-accounts](https://github.com/gabriel-mend/herdr-claude-accounts)), or the main profile if that file is absent.
