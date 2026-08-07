---
name: ship-it
description: >
  Finish a piece of work by opening a pull request. Use this whenever you have finished
  the work you were asked to do and code has changed — you are about to report back,
  the task is complete, tests pass, or the user says "done", "ship it", "finish up",
  "wrap this up", "raise a PR", "open a PR". Default to opening a PR rather than leaving
  committed work sitting on a branch. Produces a caveman-lite PR body: tight,
  professional, no filler.
---

# Ship it

Work is not finished when the code is written. It is finished when it is on a branch,
pushed, and open for review.

Write the PR body in **caveman-lite**: no filler, no hedging, no pleasantries. Keep
articles and complete sentences — a reviewer reads this, so it stays readable prose.
Not fragments, not telegram style.

## Before opening

1. Make sure the work is committed. If it is not, commit it first — see the
   `git-commit` skill.
2. Run the project's test and check commands. Do not open a PR on a red tree; if
   something fails, say so and stop.
3. `git log <base>..HEAD` and `git diff <base>...HEAD` — review the **whole** branch,
   not just your last commit. Someone else's commits may be on it.
4. Push the branch with `-u` if it has no upstream.

## The body

Lead with what changed and why. A reviewer should be able to decide whether to read
the diff from the first two sentences.

Structure, dropping any section that has nothing to say:

- **What** — the change, in one or two sentences.
- **Why** — the reason it was needed. Link the issue if there is one.
- **Notable details** — anything a reviewer would otherwise have to reverse-engineer:
  a non-obvious approach, a rejected alternative, a deliberate limitation.
- **How it was verified** — the commands run and what they showed. "Tests pass" is
  worth nothing without naming what was run.

State what you did **not** do, when it matters — skipped cases, deferred work, known
gaps. A reviewer finding those themselves is a worse outcome than reading them here.

Never pad the body with a summary of every file changed. The diff is right there.

## Attribution

End the body with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## After opening

Report the PR URL. If the repository runs CI on pull requests, say so, and offer to
watch it rather than assuming it passed.
