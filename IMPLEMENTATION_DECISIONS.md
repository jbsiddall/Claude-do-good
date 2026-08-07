# Implementation decisions

Choices currently standing. Read before reversing one. Replace an entry in place
when it is reversed — this is a living document, not a log.

## Dependency pins

### caveman at `fcf7663`

Audited clean: no npm dependencies at all, no network calls on the plugin path,
no prompt injection, and its terseness rules explicitly exempt security
warnings.

**One thing outstanding, and it is why this is not published yet.** The
`/caveman-init` slash command runs
`curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/src/tools/caveman-init.js | node -`,
fetching from an unpinned branch at runtime, so the SHA pin above does not cover
it. Nothing that auto-installs or auto-runs is affected — only that one command,
and only if a user types it. A fix is prepared upstream (resolve the script from
`$CLAUDE_PLUGIN_ROOT`, where it already ships, instead of the network). Once it
merges, bump the `sha` in `.claude-plugin/marketplace.json` and publish.

### ponytail at `16f2980`

Audited to the same bar and clean: zero npm dependencies, no `postinstall`
scripts, and no network calls, `execSync` or `eval` anywhere on the plugin path
— every such call is confined to `benchmarks/`, which is not in the package's
published `files` list. No prompt injection. Its ruleset carves out what
laziness must never touch: input validation at trust boundaries, error handling
that prevents data loss, security measures, accessibility basics.

Its one security-relevant control is solid. The `SessionStart` hook offers to
add a statusline command to `~/.claude/settings.json`, gating the embedded path
through an `isShellSafe` allowlist (`/^[A-Za-z0-9 _.\-:/\\~]+$/`) that excludes
quotes, `$`, backtick, `;`, `&` and `|`, and falling back to manual setup on a
hostile install path.

Two things to know before bumping this pin, neither a blocker:

- **Flag writes are not symlink-hardened.** `setMode` calls `writeFileSync` on
  `~/.claude/.ponytail-active` with no symlink check, where caveman's equivalent
  is hardened. Low severity: exploiting it needs pre-existing write access to
  `~/.claude`, at which point `settings.json` is directly writable anyway, and
  the written content is constrained to one of five fixed mode words.
- **The pin is ahead of the latest release.** `16f2980` is 53 commits past
  `v4.8.4`, still the newest tag, so this tracks unreleased `main`. Deliberate —
  it picks up the fix that stops the statusline nudge firing every session — but
  the pinned tree has not been through a release. Those 53 commits were audited
  as a delta and are net-positive hardening: mode validation tightened so
  `review` cannot be forced as a default, config writes no longer clobber
  sibling keys, BOM handling added, `isShellSafe` unchanged. No new
  dependencies, network calls, `exec` or `eval`. The one new knob,
  `PONYTAIL_SUBAGENT_MATCHER`, compiles a user-set env var to a regex and falls
  back to injecting on an invalid pattern.

ponytail's hooks run automatically on every session (`SessionStart`,
`SubagentStart`, `UserPromptSubmit`) — a broader auto-run surface than
caveman's, which only acts when a user types `/caveman-init`. The code on that
path is clean, but it is the surface to re-check when bumping.

## Session-start appends

### Instructions ship as a `SessionStart` hook, not a skill or a rule

Rejected: **a plugin rule**, which does not exist — `plugin.json` has no `rules`
field. Rejected: **`.claude/rules/*.md`**, which is per-project and would mean
committing the same convention into every repository that wants it. Rejected: **a
skill**, which the documentation recommends for shipping instructions, but which
loads only when Claude decides to invoke it — missable exactly when someone is
moving fast.

The hook prints the content as `additionalContext`, so it is always in context,
lives only in the plugin, and writes nothing to disk.

### The directory is `session-start-appends/`, not `rules/`

Rejected: `rules/`, which reads as a Claude Code plugin component. No such
component exists, and the name implied the harness was involved when in fact
only this plugin's own script reads the directory. It was also a
forward-compatibility hazard: `.claude/rules/*.md` is already first-class with
its own `InstructionsLoaded` event, so if a release adds `rules` as a plugin
component path, a plugin with a root `rules/` directory would suddenly be
interpreted by the harness and load its content twice.

### Append files are full caveman; what they ask for is caveman-lite

The files are prompt, not documentation, and their cost is paid on every
session, so they compress. Commit messages and PR bodies do not: a human reads
those months later and needs the articles.

## No README

Rejected: a README, which duplicated what the code already says and drifts. The
two load-bearing parts moved instead — the Tavily setup instructions into
`scripts/check-tavily-key.ts` itself, where they appear at the moment they are
needed and cannot fall out of sync, and the dependency audits into this file,
where they are read at the moment they matter, which is bumping a pin.
