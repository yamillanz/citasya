---
name: openspec-ff
description: Fast-forward through artifact creation — generate all planning artifacts (proposal, specs, design, tasks) at once. Use when the user says "fast forward", "create all artifacts", or has a clear picture of what to build.
---

# OpenSpec Fast-Forward Skill

Use this skill to create all planning artifacts at once. Creates artifacts in dependency order (proposal → specs → design → tasks) in a single pass.

**Note:** There is no `openspec ff` CLI command. This is agent-driven behavior: the agent creates each artifact sequentially using `openspec instructions`.

## When to Use

- The user has a clear picture of what to build and does not need incremental review.
- The user says "fast forward", "create everything", "generate all planning docs".
- Small to medium features where step-by-step review is unnecessary.

## Prerequisites

- **An active change** exists (created via **openspec-new** / `openspec new change <name>`).
- Or provide the change name to create artifacts for.

## Workflow

1. **Check current status**
   - Run: `openspec status --change <name>`
   - Identify which artifacts already exist and which are ready.

2. **Create artifacts in dependency order**
   - In the default `spec-driven` schema:
     1. `proposal.md` — why and what (no dependencies)
     2. `specs/**/*.md` — delta specs (requires: proposal)
     3. `design.md` — technical approach (requires: proposal)
     4. `tasks.md` — implementation checklist (requires: specs + design)
   - For each artifact:
     - Run: `openspec instructions <artifact> --change <name> --json`
     - Read the instructions and any dependency files for context.
     - Create the artifact file.

3. **Review**
   - Run: `openspec status --change <name>` to confirm all artifacts are created.
   - The user can edit any artifact before proceeding.

## Outputs

- All planning artifacts created in `openspec/changes/<name>/`:
  - `proposal.md`
  - `specs/**/*.md`
  - `design.md`
  - `tasks.md`

## Next Steps

- Review and edit artifacts if needed.
- Use **openspec-apply** to implement tasks.
- Or use **openspec-verify** after implementation to validate.

## Troubleshooting

- **"Change not found"**: Specify the name explicitly: `openspec status --change <name>`.
- **Artifact quality issues**: Use **openspec-continue** instead for more control over each artifact.
- **Already has some artifacts**: Only create the missing ones; skip completed artifacts.

## References

- Status: `openspec status --change <name>`
- Instructions: `openspec instructions <artifact> --change <name> --json`
