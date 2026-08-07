## What

<!-- One or two sentences. Why it was needed, not a file list. -->

## Checklist

- [ ] **Version bumped in `.claude-plugin/plugin.json`.** Without it `claude plugin update` reports success and copies nothing — the cache is keyed by version, and there is no `--force`.
- [ ] `claude plugin validate .` passes.
- [ ] Any script touched has been run, and the output checked.
- [ ] No secrets in the diff, including in files whose names look innocent.
- [ ] `README.md` still true, and still pointing rather than explaining.
