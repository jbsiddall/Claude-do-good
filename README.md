# Claude-do-good

A Claude Code plugin. It ships one output style: **ELI5**.

ELI5 makes answers short and plain. Small words. Just what happened and what to do next.

## Install

```
/plugin marketplace add <owner>/Claude-do-good
/plugin install claude-do-good
```

Then turn the style on:

```
/output-style ELI5
```

Installing this also installs two pinned dependencies:

- [caveman](https://github.com/JuliusBrussee/caveman), pinned to commit `fcf7663`. It compresses output further, and runs hooks at session start.
- [ponytail](https://github.com/DietrichGebert/ponytail), pinned to commit `16f2980`. "Lazy senior dev mode" — pushes toward YAGNI, stdlib first, and the shortest solution that works.

This plugin also configures a [Tavily](https://tavily.com) MCP server for web search. It needs a `TAVILY_API_KEY` environment variable set to a valid Tavily API key.

### Setting `TAVILY_API_KEY`

Don't export it in your shell — you'd have to redo that in every new shell. Instead, set it once in your **user** settings file (`~/.claude/settings.json`, not the project's `.claude/settings.json`, so it stays out of this repo and applies on every machine session regardless of which project you're in):

```json
{
  "env": {
    "TAVILY_API_KEY": "tvly-..."
  }
}
```

Claude Code injects that into every session's environment at startup, and `.mcp.json` picks it up from there. A `SessionStart` hook (`hooks/hooks.json` → `scripts/check-tavily-key.ts`, needs [Deno](https://deno.com)) checks for the key and warns if it's missing, so a forgotten key surfaces immediately instead of failing silently the first time a Tavily tool is called.

## Project documentation rules

The plugin also ships a documentation convention that loads into every session. Claude Code plugins **cannot declare rules** — `plugin.json` has no such field, and `.claude/rules/*.md` is a per-project location that would mean committing the convention into every repository that wants it. A `SessionStart` hook gets the same always-on behaviour from inside the plugin: it prints the convention as `additionalContext`, so the text sits alongside `CLAUDE.md` for the session without living in any repository. Nothing is written to disk, and disabling the plugin removes it.

The convention is four files at the repository root, each defined by **when it is read** — the rule for writing to one is that same rule read backwards:

| File | Read it when | Write to it when |
| --- | --- | --- |
| `REQUIREMENTS.md` | Deciding scope, or a product/UI choice is uncertain | The statement would still have to be true after a from-scratch rebuild on different technology |
| `REQUIREMENTS_DISCREPANCIES.md` | The implementation doesn't match a requirement | A shortfall is accepted; delete the row when it's fixed |
| `DOMAIN_KNOWLEDGE.md` | Before assuming how an external tool, API or platform behaves | A wrong assumption about it fails silently, slowly or intermittently |
| `IMPLEMENTATION_DECISIONS.md` | Before reversing a precedent | Reversing it later would want to know why it was set |

Two things fall out of that. Requirements headings are stable slugs, so code and other documents can link to an anchor and a `grep` finds every place a requirement is touched. And an agent gets a **deletion licence**: code traceable to a requirement or a standing decision stays, code traceable to neither was somebody's discretion and can go.

## Session-start appends

`session-start-appends/` holds plain markdown. `scripts/session-start-appends.ts` reads every `.md` file in it at session start and appends them all to the session's context, so adding one means adding a file and changing nothing else. It needs [Deno](https://deno.com), like the Tavily check.

The directory is **not** a Claude Code plugin component — no such component exists. It is an ordinary folder that this plugin's own script reads, which is why it is named after what the script does rather than after a component type.

Files are appended in filename order, so prefix them (`10-`, `20-`) when order matters.

One optional frontmatter key makes a file conditional:

```markdown
---
requires_any: REQUIREMENTS.md, DOMAIN_KNOWLEDGE.md
---
```

A file declaring `requires_any` is appended only when at least one of those paths exists in the working directory, and gains a line saying which are present and which are not. Without the key, a file is always appended. That is how the documentation convention above costs nothing in repositories that don't use it.

## Skills

Two skills, both auto-triggering — you don't invoke them, Claude reaches for them at the right moment.

- **`git-commit`** — fires whenever a commit is about to happen. Reviews what is staged (including a check for credentials caught by a broad `git add`), branches off the default branch first, then writes a subject in imperative mood under 72 characters with a body that explains *why*.
- **`ship-it`** — fires when work is finished and code has changed. Runs the project's checks, reviews the whole branch rather than the last commit, pushes, and opens a PR whose body leads with what changed and why, states what was deliberately left undone, and names the commands used to verify.

Both write in **caveman-lite** — no filler or hedging, but articles and full sentences kept, because a commit message and a PR body are persisted prose a human reads later. This is deliberately not the session's caveman level: caveman's own rules exempt persisted artifacts from compression, and the skills reference the register rather than switching the session, so neither one changes how Claude talks to you.

## Status: not published yet

Caveman at `fcf7663` was audited and is clean — no npm dependencies at all, no
network calls on the plugin path, no prompt injection, and its terseness rules
explicitly exempt security warnings.

One thing is outstanding. Its `/caveman-init` slash command runs:

```
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/src/tools/caveman-init.js | node -
```

That fetches from an unpinned branch at runtime, so the SHA pin above does not
cover it. Nothing that auto-installs or auto-runs is affected — only that one
command, if a user types it.

A fix is prepared (resolve the script from `$CLAUDE_PLUGIN_ROOT`, where it
already ships, instead of the network). Once it merges upstream, bump the `sha`
in `.claude-plugin/marketplace.json` and publish.

### ponytail audit (`16f2980`)

Audited to the same bar as caveman, and came back clean: zero npm dependencies,
no lifecycle (`postinstall`) scripts, and no network calls, `execSync`, or
`eval` anywhere on the plugin path — every such call is confined to
`benchmarks/`, which isn't in the package's published `files` list. No prompt
injection. Like caveman's security-warning exemption, its ruleset carves out
what laziness must never touch: "input validation at trust boundaries, error
handling that prevents data loss, security measures, accessibility basics."

Its one security-relevant control is solid. The `SessionStart` hook offers to
add a statusline command to `~/.claude/settings.json`, and gates the embedded
path through an `isShellSafe` allowlist (`/^[A-Za-z0-9 _.\-:/\\~]+$/`) that
excludes quotes, `$`, backtick, `;`, `&`, and `|`, falling back to manual setup
on a hostile install path.

Two things to know, neither a blocker:

- **Flag writes aren't symlink-hardened.** `setMode` calls `writeFileSync` on
  `~/.claude/.ponytail-active` with no symlink check, where caveman's equivalent
  is hardened. Low severity: exploiting it needs pre-existing write access to
  `~/.claude` (at which point `settings.json` is directly writable anyway), and
  the written content is constrained to one of five fixed mode words.
- **This pin is ahead of the latest release.** `16f2980` is 53 commits past
  `v4.8.4`, which is still the newest tag — so this tracks unreleased `main`,
  not a cut release. That was deliberate (it picks up the fix that stops the
  statusline nudge firing every session), but it means the pinned tree hasn't
  been through a release.

Those 53 commits were audited as a delta and are net-positive hardening: mode
validation tightened so `review` can't be forced as a default, config writes no
longer clobber sibling keys, BOM handling added, and the `isShellSafe` allowlist
is unchanged. No new dependencies, network calls, `exec`, or `eval`. The one new
knob, `PONYTAIL_SUBAGENT_MATCHER`, compiles a user-set env var to a regex and
falls back to injecting on an invalid pattern.

Note that ponytail's hooks run automatically on every session
(`SessionStart`/`SubagentStart`/`UserPromptSubmit`) — a broader auto-run surface
than caveman's, which only acts when a user types `/caveman-init`. The code on
that path is clean, but it's the surface to re-check when bumping the pin.

## What's inside

- `output-styles/eli5.md` — the style itself
- `.claude-plugin/plugin.json` — plugin metadata
- `.claude-plugin/marketplace.json` — lets this repo be added as a marketplace, and pins the caveman and ponytail dependencies by `sha`
- `.mcp.json` — configures the Tavily MCP server
- `hooks/hooks.json`, `scripts/check-tavily-key.ts` — warns at session start if `TAVILY_API_KEY` is missing (requires Deno)
- `session-start-appends/*.md` — markdown appended to every session's context; currently the [project documentation rules](#project-documentation-rules)
- `scripts/session-start-appends.ts` — reads that directory and appends it (requires Deno)
- `skills/git-commit/`, `skills/ship-it/` — auto-triggering [skills](#skills) for commits and pull requests
