# Git

Commit messages and PR bodies: caveman-lite. Terse, but keep articles and full
sentences — a human reads these months later, not a model.

- **Before committing.** Scan `git diff --staged` for credentials, including in
  innocent-looking files. Branch first if on the default branch. Subject
  imperative, 72 characters or fewer. Body says why, not what.
- **When the work is done.** Open a PR rather than leaving commits on a branch.
  Run the project's checks first — never open one on a red tree. Review the whole
  branch, not just your last commit. State what you deliberately left undone.
