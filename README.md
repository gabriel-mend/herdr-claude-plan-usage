# herdr-claude-plan-usage

A [Herdr.app](https://herdr.app) sidebar mod showing your **Claude plan rate-limit usage** (5h and 7d windows, with reset countdown). Claude Pro/Max only.

## Install

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
