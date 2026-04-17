---
name: openspec-new
description: Start a new OpenSpec change. Use when the user says "start a new change", "new feature", or "create an OpenSpec change".
---

# OpenSpec New Skill

Use this skill to start a new change. This creates the change folder structure under `openspec/changes/<name>/` with metadata (`.openspec.yaml`) and prepares the first artifact for creation.

## When to Use

- Starting work on a new feature, bug fix, or refactor.
- The user says "start a change", "new feature", "new OpenSpec change".
- After exploring ideas with **openspec-explore** and deciding what to build.

## Prerequisites

- **OpenSpec initialized** in the project (see **openspec-initial**).

## Workflow

1. **Create the change**
   - Run: `openspec new change "<change-name>"`
   - Optional: `openspec new change "<change-name>" --schema <schema>` — use a specific workflow schema (default: `spec-driven`).
   - Optional: `openspec new change "<change-name>" --description "<text>"` — add a description.
   - If no name is provided, ask the user for one.

2. **What gets created**
   - `openspec/changes/<name>/` directory.
   - `openspec/changes/<name>/.openspec.yaml` — change metadata (schema, created date).

3. **Show next step**
   - Run `openspec status --change <name>` to show the current state.
   - The first ready artifact is typically `proposal`.
   - Offer to create it now or let the user decide.

## Naming Conventions

- Use descriptive names: `add-dark-mode`, `fix-login-bug`, `refactor-auth`.
- Avoid generic names: `update`, `changes`, `wip`.
- Use kebab-case.

## Outputs

- `openspec/changes/<name>/` directory with `.openspec.yaml`.

## Next Steps

- Create artifacts one at a time using `openspec instructions <artifact> --change <name>` (see **openspec-continue**).
- Or create all planning artifacts at once by following the instructions for proposal, specs, design, and tasks sequentially (see **openspec-ff**).

## Troubleshooting

- **"Change already exists"**: The change name is already taken. Use a different name or continue the existing change.
- Run `openspec list` to see all active changes.

## References

- CLI command: `openspec new change <name>`
- View status: `openspec status --change <name>`
- Get instructions: `openspec instructions <artifact> --change <name>`
