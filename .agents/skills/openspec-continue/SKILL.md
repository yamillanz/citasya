---
name: openspec-continue
description: Create the next artifact in the dependency chain, building up a change incrementally. Use when the user says "continue the change", "create next artifact", or wants step-by-step artifact creation.
---

# OpenSpec Continue Skill

Use this skill to create the next artifact in the dependency chain. This builds a change incrementally — one artifact at a time — giving the user control to review and edit before proceeding.

**Note:** There is no `openspec continue` CLI command. This is agent-driven behavior: the agent queries status, identifies the next ready artifact, and creates it.

## When to Use

- The user wants incremental, step-by-step artifact creation.
- After creating a change with **openspec-new** and wanting to build artifacts one at a time.
- The user says "continue", "next artifact", "create specs", "create design".

## Prerequisites

- **An active change** exists (created via **openspec-new** / `openspec new change <name>`).

## Workflow

1. **Query the dependency graph**
   - Run: `openspec status --change <name> --json`
   - Parse the JSON to see which artifacts are done, ready, or blocked.

2. **Identify ready artifacts**
   - In the default `spec-driven` schema: `proposal` → `specs` / `design` → `tasks`.
   - Dependencies are enablers: once a dependency is done, its dependents become "ready".
   - Pick the first ready artifact.

3. **Create one artifact**
   - Run: `openspec instructions <artifact> --change <name> --json`
   - Read the instructions and any dependency files for context.
   - Create the artifact file.

4. **Show what's unlocked**
   - Run: `openspec status --change <name>`
   - Show the updated state and what becomes available next.

5. **Repeat**
   - User reviews, optionally edits, then asks to continue for the next artifact.

## Artifact Dependency Graph (spec-driven schema)

```
proposal (root, no dependencies)
    |
    +---> specs (requires: proposal)
    |
    +---> design (requires: proposal)
            |
            +---> tasks (requires: specs + design)
```

## Outputs

- One artifact file created per invocation (e.g. `proposal.md`, `specs/**/*.md`, `design.md`, `tasks.md`).

## Next Steps

- Run again for the next artifact.
- When all planning artifacts are done: use **openspec-apply** to implement tasks.
- Or use **openspec-ff** to fast-forward remaining artifacts.

## Troubleshooting

- **"No artifacts ready"**: All artifacts are either complete or blocked. Check `openspec status --change <name>`.
- **"Change not found"**: Specify the change name explicitly.
- Run `openspec list` to see all active changes.

## References

- Status: `openspec status --change <name> --json`
- Instructions: `openspec instructions <artifact> --change <name> --json`
