#!/usr/bin/env -S deno run --allow-read=.

// Injects the project-documentation convention as an always-on rule, but only
// in repositories that actually use it. A repository with none of these four
// files gets nothing, so this costs unrelated projects no context.

const DOCS = [
  "REQUIREMENTS.md",
  "REQUIREMENTS_DISCREPANCIES.md",
  "DOMAIN_KNOWLEDGE.md",
  "IMPLEMENTATION_DECISIONS.md",
];

const present = DOCS.filter((name) => {
  try {
    return Deno.statSync(name).isFile;
  } catch {
    return false;
  }
});

if (present.length === 0) Deno.exit(0);

const missing = DOCS.filter((name) => !present.includes(name));

const inventory = [
  `Present in this repository: ${present.join(", ")}.`,
  missing.length ? `Not yet created: ${missing.join(", ")}.` : "",
].filter(Boolean).join(" ");

const rules = `# Project documentation rules

This project keeps its long-lived knowledge in four files at the repository
root. Each file is defined by *when it is read*; the rule for writing to it is
the same rule read backwards. ${inventory}

Read the relevant file before acting on the area it covers. Do not restate its
contents anywhere else.

## REQUIREMENTS.md — what must be true of the product

Read when deciding whether something is in scope, or when a product or UI
decision is uncertain.

Write when the statement would still have to be true after a from-scratch
rebuild on entirely different technology. If it would not, it is not a
requirement.

- State outcomes, never mechanism. How something is achieved belongs in
  IMPLEMENTATION_DECISIONS.md.
- Each heading is a stable slug. Reword the body freely; never rename a slug,
  because code and other documents link to its anchor.
- Changing or deleting a requirement means clearing its rows in
  REQUIREMENTS_DISCREPANCIES.md in the same change.

## REQUIREMENTS_DISCREPANCIES.md — where the implementation knowingly falls short

Read whenever you find the implementation not matching a requirement.

- Listed: known. Still follow the slug back to REQUIREMENTS.md and confirm the
  requirement is still there. If the slug is gone, the row is stale — report it.
- Not listed: not triaged. Report it rather than assuming it is accepted.

Write when a shortfall is accepted. Delete the row when it is fixed.

Columns: Requirement (link to the slug anchor) | Reason | Basis.

- Reason is one of \`not feasible\`, \`not implemented\`, \`bug\`. Only
  \`not feasible\` means stop. The other two mean known but still open work.
- Basis is mandatory, and capped at one sentence or a link.
  - \`not feasible\` points at a dated DOMAIN_KNOWLEDGE.md anchor, so the
    infeasibility can be re-checked when the external world changes.
  - \`bug\` carries an issue link. If no issue exists, open one before adding
    the row.

Completeness runs one way only: every accepted shortfall appears here, but not
every known bug needs to.

## DOMAIN_KNOWLEDGE.md — how external things actually behave

One H1 per domain: a CLI, an API, a browser, a runtime.

Read before assuming how any external tool, API or platform behaves.

Write only when a wrong assumption about it fails **silently, slowly, or
intermittently**. A wrong assumption that fails immediately with a clear error
is rediscovered for free and does not belong here.

- Verified observations only. Never phrase an inference as an observation.
  Anything not directly observed goes in an \`Unverified\` section or nowhere.
- Every claim states the version observed and the date observed. An undated
  claim is worthless, because external behaviour changes between releases.
- Skip the obvious. Documented behaviour that behaves as documented is not a
  finding.

## IMPLEMENTATION_DECISIONS.md — the choices currently standing

Choices among options that all could have worked.

Read before reversing a precedent: a convention, a library, an architecture, a
naming scheme.

Write when, at the moment someone later moves to reverse the decision, this
entry would change whether they should. Nothing else earns a line.

- Record the rejected options and why they were rejected, not only the choice.
  Without that a future reader has nothing to weigh, and repeats either the
  original investigation or the original mistake.
- A decision the code already states is not worth an entry. That a validation
  library is used is visible in the manifest; that its schemas reject unknown
  keys so a typo is a hard error is not.
- This is a living document, not a log. When a decision is reversed, replace the
  entry in place rather than appending a contradiction. Version control holds
  the history, and the person deleting an entry is the one who needed to read
  it.
- Unlike the other three, this file has no value for reconstructing the product
  from scratch. It describes choices about code that exists.

## Deletion licence

Code traceable to a requirement or to a standing implementation decision stays.
Code traceable to neither was the previous author's discretion and may be
removed. Check both files before deleting something that looks arbitrary.

## Keep it DRY

Each fact lives in exactly one of these files. Cross-reference by slug or
anchor; never restate. README.md indexes these documents rather than
duplicating them.`;

console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: rules,
  },
}));
