#!/usr/bin/env -S deno run --allow-run=git

// SubagentStop: nothing merges a subagent worktree back for you, so an
// unmentioned worktree is work quietly lost. Fires only when a worktree under
// .claude/worktrees/ actually holds work — most subagents use none, and a
// reminder on every one is noise people learn to skip.
//
// Reads everything through `git`, so --allow-run=git is the only permission
// needed: no --allow-read, no --allow-env. Any failure exits 0 in silence.

const decoder = new TextDecoder();

/** git in `cwd` unless -C says otherwise. Returns null on any non-zero exit. */
function git(...args: string[]): string | null {
  const { code, stdout } = new Deno.Command("git", { args, stderr: "null" })
    .outputSync();
  return code === 0 ? decoder.decode(stdout).trim() : null;
}

try {
  const input = JSON.parse(await new Response(Deno.stdin.readable).text());

  const here = git("rev-parse", "--show-toplevel");
  // Commits reachable from where we stand, or from remote default branch, are
  // not subagent work. `fresh` bases off latter, `head` off former. Exclude
  // both, so either worktree.baseRef setting covered.
  const exclude = ["HEAD", "origin/HEAD"]
    .map((ref) => git("rev-parse", "--verify", "--quiet", ref))
    .filter((sha): sha is string => !!sha)
    .map((sha) => `^${sha}`);

  const found: string[] = [];

  for (
    const block of (git("worktree", "list", "--porcelain") ?? "").split("\n\n")
  ) {
    const path = block.match(/^worktree (.+)$/m)?.[1];
    if (!path || !path.includes("/.claude/worktrees/") || path === here) {
      continue;
    }

    const dirty = !!git("-C", path, "status", "--porcelain");
    const commits = Number(
      git("-C", path, "rev-list", "--count", "HEAD", ...exclude) ?? "0",
    );
    if (!dirty && !commits) continue;

    const branch = block.match(/^branch refs\/heads\/(.+)$/m)?.[1] ??
      "detached HEAD";
    const holds = [
      commits ? `${commits} commit${commits === 1 ? "" : "s"}` : "",
      dirty ? "uncommitted changes" : "",
    ].filter(Boolean).join(" and ");
    // Claude Code locks a worktree while its agent runs. `remove --force` exits
    // 128 on locked one, so do not hand out advice that fails.
    const locked = /^locked/m.test(block)
      ? " (locked — `git worktree unlock` it first)"
      : "";
    found.push(`- \`${path}\` on branch \`${branch}\` — ${holds}${locked}`);
  }

  if (found.length === 0) Deno.exit(0);

  const who = input.agent_type
    ? `\`${input.agent_type}\` subagent${
      input.agent_id ? ` (${input.agent_id})` : ""
    }`
    : "A subagent";

  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SubagentStop",
      additionalContext:
        `${who} finished. Work sitting in a git worktree:\n\n` +
        found.join("\n") +
        `\n\nThat work is NOT in the current tree, and nothing merges it for ` +
        `you. Merge, cherry-pick or rebase the branch before relying on it. ` +
        `Or drop it with \`git worktree remove --force <path>\` — that ` +
        `destroys the work, no undo.`,
    },
  }));
} catch {
  // Hook that throws on every subagent completion is worse than no hook.
}
