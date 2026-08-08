# Subagent work: worktrees in, pull requests out

Spawn every subagent with `isolation: "worktree"` — Agent tool parameter, or
`isolation: worktree` in custom subagent frontmatter. Two agents editing one
checkout clobber each other files. Worktree is separate checkout, so they
cannot.

Work leaves a worktree as a **pull request on GitHub**. Never as a local merge,
never as a branch left sitting on disk. Nothing is merged locally, so no local
branch needs keeping current and no worktree needs reconnecting to anything.

## Every subagent ends in a pull request

Two shapes, and the coordinator says which when it spawns the subagent.

**Standalone work** — base the PR on the default branch. A human reviews and
merges. `worktree.baseRef` defaults to `fresh`, which branches from
`origin/<default-branch>` already, so leave it alone.

**Part of something bigger** — the coordinator is assembling several pieces and
names a branch on `origin` as the base. First thing the subagent does, before
any work:

```
git fetch origin
git reset --hard origin/<base-branch>
```

Then work, push, and open the PR **against that branch**, not the default one.
GitHub stacks PRs, so a chain of these reviews cleanly. The coordinator merges
it once reviewed — coordinator's job, not the human's.

Push straight from the worktree to a new remote branch:

```
git push origin HEAD:refs/heads/<branch>
gh pr create --head <branch> --base <base-branch>
```

## Name the pair

`<slug>-implementer` and `<slug>-reviewer`. Slug is one to three hyphenated
words, or an issue number and a word or two: `42-enter-key-implementer`,
`42-enter-key-reviewer`. Names are load-bearing — they are how the two agents
reach each other.

## Review bounces between the two agents, not through the coordinator

**The coordinator does not review the code.** When the implementer reports a
finished PR, the coordinator spawns `<slug>-reviewer` and hands it the PR number
and the implementer's name. The reviewer is adversarial: its job is to find what
is wrong, not to approve.

- Reviewer has findings: `SendMessage` **to the implementer**, not to the
  coordinator.
- Implementer agrees: fix, push, `SendMessage` back to the reviewer to
  re-review.
- Reviewer satisfied: `SendMessage` to `main` — approved, with the PR number.
- Implementer disagrees: return that to the coordinator as its result, and stop.
  The coordinator decides. Sides with the implementer, the loop is over. Sides
  with the reviewer, it restarts the implementer with the decision as a
  directive, and the implementer messages the reviewer when done.

Keep the coordinator out of the middle. It spawns the pair, rules on
disagreements, and merges — nothing else.

Resuming a subagent is cheap. It re-reads its whole prior context from cache at
a tenth of the price and keeps everything it already knew, so bouncing work back
to the agent that wrote it beats briefing a fresh one.
