# Claude-do-good

Claude Code plugin. ELI5 output style, Tavily MCP web search, and session-start
appends that put rules into every session.

## Install

```
/plugin marketplace add jbsiddall/Claude-do-good
/plugin install claude-do-good
```

Style on: `/output-style ELI5`.

Tavily needs `TAVILY_API_KEY`. Missing? Hook says how, at session start.

## Contents

- `session-start-appends/*.md` — appended to every session's context, filename
  order. Add file, done. Currently: the project documentation convention, git
  rules for commits and PRs, and the subagent worktree convention.
- `scripts/session-start-appends.ts` — reads that directory. Needs Deno.
- `scripts/check-tavily-key.ts` — warns on missing key, says how to set it.
- `scripts/worktree-reminder.ts` — on `SubagentStop`, names any worktree left
  holding work. Silent when there is none.
- `output-styles/eli5.md` — the style.
- `.mcp.json` — Tavily server. `hooks/hooks.json` — all three hooks.
- `.claude/settings.json` — `worktree.baseRef: head`, so subagent worktrees
  branch from the current HEAD rather than `origin/main`.

Nothing writes to disk. Appends go to session context, not `CLAUDE.md`. Disable
plugin, text gone.

## Pinned dependencies

[caveman](https://github.com/JuliusBrussee/caveman) at `fcf7663` and
[ponytail](https://github.com/DietrichGebert/ponytail) at `16f2980`, pinned by
`sha` in `.claude-plugin/marketplace.json`. Both audited. **Read this before
bumping either pin.**

### caveman — clean

No npm dependencies at all, no network calls on the plugin path, no prompt
injection. Terseness rules explicitly exempt security warnings.

**Blocks publication.** `/caveman-init` runs
`curl -fsSL .../main/src/tools/caveman-init.js | node -` — unpinned branch,
fetched at runtime, so the SHA pin does not cover it. Nothing auto-installs or
auto-runs it; only a user typing that command. Fix prepared upstream: resolve
the script from `$CLAUDE_PLUGIN_ROOT`, where it already ships. On merge, bump
`sha` and publish.

### ponytail — clean

Zero npm dependencies, no `postinstall`, and no network calls, `execSync` or
`eval` on the plugin path — all confined to `benchmarks/`, not in the published
`files` list. No prompt injection. Its ruleset exempts input validation at trust
boundaries, error handling that prevents data loss, security measures and
accessibility basics.

Its statusline hook writes `~/.claude/settings.json`, gating the embedded path
through an `isShellSafe` allowlist (`/^[A-Za-z0-9 _.\-:/\\~]+$/`) excluding
quotes, `$`, backtick, `;`, `&` and `|`, falling back to manual setup on a
hostile install path.

Two non-blockers:

- **Flag writes not symlink-hardened.** `setMode` calls `writeFileSync` on
  `~/.claude/.ponytail-active` with no symlink check; caveman's equivalent is
  hardened. Exploiting it needs pre-existing write access to `~/.claude`, where
  `settings.json` is already writable anyway, and content is limited to five
  fixed mode words.
- **Pin is 53 commits past `v4.8.4`**, still the newest tag, so it tracks
  unreleased `main`. Deliberate — picks up the fix stopping the statusline nudge
  firing every session. Delta audited, net-positive hardening: mode validation
  tightened so `review` cannot be forced as a default, config writes no longer
  clobber sibling keys, BOM handling added, `isShellSafe` unchanged. No new
  dependencies, network calls, `exec` or `eval`. One new knob,
  `PONYTAIL_SUBAGENT_MATCHER`, compiles an env var to a regex and falls back to
  injecting on an invalid pattern.

ponytail's hooks run every session (`SessionStart`, `SubagentStart`,
`UserPromptSubmit`) — broader auto-run surface than caveman's, which acts only
on `/caveman-init`. That path is clean, but re-check it when bumping.
