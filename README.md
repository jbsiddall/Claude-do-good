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

Installing this also installs [caveman](https://github.com/JuliusBrussee/caveman), pinned to commit `fcf7663`. It compresses output further, and runs hooks at session start.

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

## What's inside

- `output-styles/eli5.md` — the style itself
- `.claude-plugin/plugin.json` — plugin metadata
- `.claude-plugin/marketplace.json` — lets this repo be added as a marketplace
