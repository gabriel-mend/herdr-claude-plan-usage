import json, os, subprocess, sys, tempfile, time, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def script(path, home, stdin="", config_dir=None):
    env = {**os.environ, "HOME": home}
    env.pop("CLAUDE_CONFIG_DIR", None)
    if config_dir:
        env["CLAUDE_CONFIG_DIR"] = config_dir
    return subprocess.run([sys.executable, f"{ROOT}/{path}"], env=env, input=stdin,
                          capture_output=True, text=True, check=True).stdout


class UsageTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.home = tmp.name
        self.window = {"used_percentage": 6, "resets_at": time.time() + 3600}

    def hook(self, payload, config_dir=None):
        return script("claude-hook/herdr-usage-statusline.py", self.home, payload, config_dir)

    def usage(self):
        return json.loads(script("usage.py", self.home))

    def test_hook_saves_what_the_mod_reads_and_prints_nothing(self):
        self.assertEqual(self.hook(json.dumps({"rate_limits": {"five_hour": self.window}})), "")
        self.assertEqual(self.usage()["usage"], {"five_hour": self.window})

    def test_hook_ignores_bad_input(self):
        self.assertEqual(self.hook("not json"), "")
        self.assertIsNone(self.usage()["usage"])

    def test_expired_windows_are_dropped(self):
        old = {"used_percentage": 90, "resets_at": time.time() - 1}
        self.hook(json.dumps({"rate_limits": {"five_hour": old, "seven_day": self.window}}))
        self.assertEqual(list(self.usage()["usage"]), ["seven_day"])

    def test_reads_the_active_account(self):
        other = f"{self.home}/.claude-acct2"
        self.hook(json.dumps({"rate_limits": {"five_hour": self.window}}), other)
        os.makedirs(f"{self.home}/.claude/state", exist_ok=True)
        with open(f"{self.home}/.claude/state/herdr-accounts.json", "w") as f:
            json.dump({"active": "acct2", "accounts": [{"id": "acct2", "name": "Account 2", "dir": other}]}, f)
        out = self.usage()
        self.assertEqual((out["account"], out["usage"]), ("acct2", {"five_hour": self.window}))


if __name__ == "__main__":
    unittest.main()
