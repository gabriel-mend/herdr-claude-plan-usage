#!/usr/bin/env python3
"""statusLine command: saves plan rate-limit usage for the Herdr agent-context mod. Prints nothing."""
import json, os, sys, tempfile
try:
    rl = json.load(sys.stdin).get("rate_limits")
    if rl:
        base = os.environ.get("CLAUDE_CONFIG_DIR") or os.path.expanduser("~/.claude")
        path = os.path.join(base, "state", "herdr-usage.json")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path))
        with os.fdopen(fd, "w") as f:
            json.dump(rl, f)
        os.replace(tmp, path)
except Exception:
    pass
