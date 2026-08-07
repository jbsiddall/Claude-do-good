# Subagent worktrees

Spawn subagents with `isolation: "worktree"` — the Agent tool parameter, or
`isolation: worktree` in a custom subagent's frontmatter. Two agents editing one
checkout clobber each other's files; a worktree is a separate checkout, so they
cannot. The cost: the work lands on its own branch that somebody has to merge.

**The base-ref trap.** `worktree.baseRef` defaults to `fresh`, which branches
from `origin/<default-branch>` — **not** the current HEAD. A subagent sent to
work on a feature branch would silently get a worktree with none of that
branch's commits. This repository sets `head` in `.claude/settings.json`:
`{ "worktree": { "baseRef": "head" } }`. Confirm it is there before spawning.

**What the harness does and does not do.**

- A worktree is a **new branch**, checked out under `.claude/worktrees/`. Being
  a fresh checkout, gitignored files like `.env` are missing — list them in a
  `.worktreeinclude` at the project root, `.gitignore` syntax, or the subagent
  fails on absent config in a way that reads like a code bug.
- It is auto-cleaned **only if unchanged**. Holding work, it stays on disk
  indefinitely: the periodic sweep skips exactly the worktrees that matter.
- `ExitWorktree` with `remove` **refuses** while there are uncommitted files or
  unmerged commits, unless you pass `discard_changes: true`.
- **Nothing merges automatically.** The coordinator merges, cherry-picks or
  rebases the branch, or the work is never seen again.
