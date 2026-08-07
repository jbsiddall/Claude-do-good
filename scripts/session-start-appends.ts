#!/usr/bin/env -S deno run --allow-read

// Appends every ../session-start-appends/*.md file to the session's context, as
// SessionStart additionalContext. Nothing is written to disk and no repository
// file is touched — the text sits alongside CLAUDE.md for the session only, and
// disabling the plugin removes it.
//
// Adding one means adding a markdown file; nothing here changes. Files are
// appended in filename order, so prefix them (10-, 20-) when order matters.
//
// Optional frontmatter, one key:
//
//   ---
//   requires_any: REQUIREMENTS.md, DOMAIN_KNOWLEDGE.md
//   ---
//
// A file with `requires_any` is appended only when at least one of those paths
// exists in the working directory, and gains a line naming which are present.
// Without the key, a file is always appended.

const appendsDir = new URL("../session-start-appends/", import.meta.url)
  .pathname;

const exists = (path: string) => {
  try {
    return Deno.statSync(path).isFile;
  } catch {
    return false;
  }
};

const files = [...Deno.readDirSync(appendsDir)]
  .filter((entry) => entry.isFile && entry.name.endsWith(".md"))
  .map((entry) => entry.name)
  .sort();

const appends: string[] = [];

for (const name of files) {
  const raw = Deno.readTextFileSync(appendsDir + name);
  const frontmatter = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const body = (frontmatter ? raw.slice(frontmatter[0].length) : raw).trim();

  const declared = frontmatter?.[1].match(/^requires_any:\s*(.+)$/m)?.[1]
    .split(",").map((path) => path.trim()).filter(Boolean);

  if (!declared) {
    appends.push(body);
    continue;
  }

  const present = declared.filter(exists);
  if (present.length === 0) continue;

  const missing = declared.filter((path) => !present.includes(path));
  appends.push(
    `${body}\n\nPresent in this repository: ${present.join(", ")}.` +
      (missing.length ? ` Not yet created: ${missing.join(", ")}.` : ""),
  );
}

if (appends.length === 0) Deno.exit(0);

console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: appends.join("\n\n---\n\n"),
  },
}));
