# Project documentation

Four files at the repository root. Each is defined by when you read it; the rule
for writing to it is the same rule backwards. Read the relevant one before
acting. Never restate one file's content in another.

## REQUIREMENTS.md — what must be true of the product

Read when deciding scope, or when a product or UI decision is uncertain.

Write it only if it would still be true after a from-scratch rebuild on entirely
different technology.

```
Yes: The conversation survives a page reload.
No:  The transcript is restored from a signed cookie.   <- mechanism
No:  Panels switch to overlays below 1200px.            <- mechanism
```

Headings are stable slugs. Reword a body freely; never rename a slug, because
code links to its anchor. Changing or deleting a requirement means deleting its
rows in REQUIREMENTS_DISCREPANCIES.md in the same change.

## REQUIREMENTS_DISCREPANCIES.md — accepted shortfalls

Read whenever you find the implementation not matching a requirement.

- Listed: known. Still open REQUIREMENTS.md and confirm the slug is still there.
  Gone means the row is stale — report it.
- Not listed: not triaged. Report it. Never assume it was accepted.

Write a row when a shortfall is accepted. Delete the row when it is fixed.

```markdown
| Requirement | Reason | Basis |
| --- | --- | --- |
| [mic-permission](REQUIREMENTS.md#mic-permission) | not feasible | No API persists a getUserMedia grant — [Browser](DOMAIN_KNOWLEDGE.md#browser) |
| [dark-mode](REQUIREMENTS.md#dark-mode) | not implemented | #412 |
| [copy-message](REQUIREMENTS.md#copy-message) | bug | #398 |
```

`Reason` is exactly one of `not feasible`, `not implemented`, `bug`. Only
`not feasible` means stop; the other two mean known but still open.

`Basis` is required, and is one sentence or a link. `not feasible` points at a
dated DOMAIN_KNOWLEDGE.md anchor, so it can be re-checked when the world
changes. `bug` carries an issue link — open the issue first if there is none.

Every accepted shortfall appears here. Not every bug does. Absence means
untriaged, never "does not exist".

## DOMAIN_KNOWLEDGE.md — how external things really behave

One H1 per domain: a CLI, an API, a browser, a runtime.

Read before assuming how any external tool, API or platform behaves.

Write only when a wrong assumption fails **silently, slowly or intermittently**.

```
Yes: `--permission-mode manual` never asks for approval. It auto-denies in
     silence. (claude 2.1.217, 2026-08-04)
No:  `deno compile` fails on NixOS with "Could not start dynamically linked
     executable".      <- loud and immediate, so it is rediscovered for free
```

Observations only, never inference. Anything not directly observed goes in an
`Unverified` section or nowhere. Every claim states the version and the date it
was observed; an undated claim is worthless.

## IMPLEMENTATION_DECISIONS.md — the choices currently standing

Choices among options that all could have worked, and invariants that must keep
holding. Read before reversing a precedent: a convention, a library, an
architecture, a naming scheme, a line two things must not cross.

Write when reversing it later would want to know why it was set.

An entry has four parts, and one missing part makes it read stronger than it is:
the choice, the options rejected and why, the cost knowingly accepted, and the
evidence — a command to re-run, a recipe, or a dated run.

```
Yes: Colour lives only in the @theme block in assets/styles.css; islands use
     semantic utilities. Rejected: palette classes per component, which put a
     theme change in 40 files. Cost: a new shade needs a token before it can be
     used. Check: `grep -rE "blue-[0-9]" islands/` is empty.
No:  We use zod for validation.   <- deno.json already says so
No:  Startup is under 200ms.      <- a conclusion with no way to re-test
```

Never drop a cost or a piece of evidence as noise. A stripped entry cannot be
falsified, and reads more confident than the day it was written. A claim you
could not prove goes in an `Unproven` section, named, until it is proved or the
entry is withdrawn. Evidence that is an observation of an external tool lives in
DOMAIN_KNOWLEDGE.md — link its anchor rather than copying it.

This is a living document, not a log: replace a reversed entry in place, cost
and evidence with it. Git holds the history, and the person deleting an entry is
the one who needed to read it.

## Deleting code

Traceable to a requirement or a standing decision: keep it. Traceable to
neither: it was somebody's discretion, so delete it freely. Check both files
before deleting anything that looks arbitrary.
