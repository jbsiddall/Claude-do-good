#!/usr/bin/env -S deno run --allow-env

// The setup instructions live here rather than in a document, so they appear at
// the moment they are needed and cannot fall out of sync with the check.
const setup =
  'Set it in ~/.claude/settings.json — your USER file, not the project\'s — under ' +
  '"env": { "TAVILY_API_KEY": "tvly-..." }. Claude Code injects that into every ' +
  "session at startup, and .mcp.json picks it up from there. Do not export it in " +
  "your shell; you would have to redo that in every new shell.";

if (!Deno.env.get("TAVILY_API_KEY")) {
  console.log(JSON.stringify({
    systemMessage:
      `TAVILY_API_KEY is not set — the Tavily MCP web search tools will fail. ${setup}`,
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext:
        "TAVILY_API_KEY is unset in this environment. The Tavily MCP server " +
        "will fail to authenticate. If a Tavily tool call errors on auth, tell " +
        `the user: ${setup}`,
    },
  }));
}
