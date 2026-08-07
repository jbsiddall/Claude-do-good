---
name: git-commit
description: >
  Write the commit message and make the commit. Use this EVERY time you are about to run
  `git commit`, whether the user asked for a commit, said "commit this", "save this",
  "check this in", or you reached a point in your own work where committing is the next
  step. Also use when amending or rewording a commit. Produces a caveman-lite message:
  tight, professional, no filler.
---

# Commit

Write the message in **caveman-lite**: no filler, no hedging, no pleasantries. Keep
articles and complete sentences — this is a persisted artifact a human reads months
later, so it stays readable prose. Not fragments, not telegram style.

## Before committing

1. `git status` and `git diff --staged`. Review what is actually included.
2. If a broad `git add` was used, check for anything that should not be committed —
   credentials, tokens, `.env` files, key material, large binaries, local scratch files.
   A harmless-looking filename is not evidence; open anything you are unsure about.
3. If on the default branch (`main`/`master`), create a branch first unless the user
   explicitly asked to commit there.
4. Run the project's test or check command if it has one and the change is not trivial.

## The message

Subject line, 72 characters or fewer, imperative mood, no trailing period:

```
Add the rule that decides which document a fact belongs in
```

Use a conventional-commit prefix (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`,
`chore:`) only if the repository already uses them. Check `git log --oneline -20`
rather than assuming.

The body explains **why**, not what — the diff already says what. Wrap at 72
characters. Skip the body entirely when the subject is self-evident.

Cover, when they apply: the reason the change was needed, anything non-obvious about
the approach, and what was deliberately left out.

Never write "updated some files", "various fixes", "WIP", or a subject that would fit
any commit in any repository.

## Attribution

End the message with:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

## After committing

Report the subject line and the short SHA. Do not push unless the user asked, or you
are about to open a pull request.
