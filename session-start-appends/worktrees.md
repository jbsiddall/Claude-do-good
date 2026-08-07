# Subagent worktrees

Spawn subagents with `isolation: "worktree"` — Agent tool parameter, or
`isolation: worktree` in custom subagent frontmatter. Two agents editing one
checkout clobber each other files. Worktree is separate checkout, so they
cannot. Cost: work lands on own branch, and somebody must merge it.

**Base-ref trap.** `worktree.baseRef` defaults to `fresh`, which branches from
`origin/<default-branch>` — **not** current HEAD. Subagent sent at a feature
branch silently gets a worktree holding none of that branch commits. This
repository sets `head` in `.claude/settings.json`:
`{ "worktree": { "baseRef": "head" } }`. Confirm it there before spawning.

**What harness does and does not do.**

- Worktree is **new branch**, checked out under `.claude/worktrees/`. Fresh
  checkout, so gitignored files like `.env` are missing. List them in
  `.worktreeinclude` at project root, `.gitignore` syntax, or subagent fails on
  absent config in a way that reads like a code bug.
- Auto-cleaned **only if unchanged**. Holding work, it stays on disk forever:
  the periodic sweep skips exactly the worktrees that matter.
- `ExitWorktree` with `remove` **refuses** while uncommitted files or unmerged
  commits exist, unless you pass `discard_changes: true`.
- **Nothing merges automatically.** Coordinator merges, cherry-picks or rebases
  the branch, or work is never seen again.
