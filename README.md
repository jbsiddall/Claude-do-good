# Claude-do-good

Claude Code plugin. ELI5 output style, Tavily MCP web search, and session-start
appends that put rules into every session.

## Install

```
/plugin marketplace add jbsiddall/Claude-do-good
/plugin install claude-do-good
```

Style on: `/output-style ELI5`.

Pulls in two pinned dependencies,
[caveman](https://github.com/JuliusBrussee/caveman) and
[ponytail](https://github.com/DietrichGebert/ponytail). Pins and their audits:
[IMPLEMENTATION_DECISIONS.md](IMPLEMENTATION_DECISIONS.md).

Tavily needs `TAVILY_API_KEY`. Missing? Hook says how, at session start.

## Contents

- `session-start-appends/*.md` — appended to every session's context. Add file,
  done. Optional `requires_any:` frontmatter makes one conditional on a path
  existing in the working directory.
- `scripts/session-start-appends.ts` — reads that directory. Needs Deno.
- `scripts/check-tavily-key.ts` — warns on missing key, says how to set it.
- `output-styles/eli5.md` — the style.
- `.mcp.json` — Tavily server. `hooks/hooks.json` — both hooks.
- `IMPLEMENTATION_DECISIONS.md` — standing choices. Read before reversing one.

Nothing writes to disk. Appends go to session context, not `CLAUDE.md`. Disable
plugin, text gone.

## Status

Not published yet. Blocker: caveman's `/caveman-init` fetches an unpinned script
at runtime, so the SHA pin misses it. Nothing auto-runs it. Detail and fix in
[IMPLEMENTATION_DECISIONS.md](IMPLEMENTATION_DECISIONS.md).
