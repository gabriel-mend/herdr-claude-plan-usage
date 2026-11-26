#!/usr/bin/env python3
"""Prints JSON: plan rate-limit usage (5h / 7d) of the active Claude account."""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common

cfg = common.load()
acct = next(a for a in cfg["accounts"] if a["id"] == cfg["active"])
usage = None
try:
    rl = json.load(open(f"{acct['dir']}/state/herdr-usage.json"))
    usage = {k: v for k, v in rl.items() if isinstance(v, dict) and v.get("resets_at", 0) > time.time()}
except Exception:
    pass
print(json.dumps({"account": acct["id"], "usage": usage}))
