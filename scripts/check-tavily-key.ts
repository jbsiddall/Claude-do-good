#!/usr/bin/env -S deno run --allow-env

if (!Deno.env.get("TAVILY_API_KEY")) {
  console.log(JSON.stringify({
    systemMessage:
      "TAVILY_API_KEY is not set — the Tavily MCP web search tools will fail. " +
      "Set it once in ~/.claude/settings.json under \"env\" (see this plugin's README).",
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext:
        "TAVILY_API_KEY is unset in this environment. The Tavily MCP server " +
        "will fail to authenticate. If a Tavily tool call errors on auth, tell " +
        "the user to set TAVILY_API_KEY (see README).",
    },
  }));
}
