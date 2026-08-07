#!/usr/bin/env -S deno run --allow-read

// Appends every ../session-start-appends/*.md to the session's context, in
// filename order. Adding one means adding a file; nothing here changes.
//
// Nothing is written to disk. The text sits alongside CLAUDE.md for the session
// only, and disabling the plugin removes it.

const dir = new URL("../session-start-appends/", import.meta.url).pathname;

const appends = [...Deno.readDirSync(dir)]
  .filter((entry) => entry.isFile && entry.name.endsWith(".md"))
  .map((entry) => entry.name)
  .sort()
  .map((name) => Deno.readTextFileSync(dir + name).trim())
  .filter(Boolean);

if (appends.length === 0) Deno.exit(0);

console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: appends.join("\n\n---\n\n"),
  },
}));
