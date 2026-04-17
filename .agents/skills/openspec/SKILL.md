---
name: openspec
description: "OpenSpec artifact-driven workflow. Covers CLI commands, schemas, project config. Use when applying the artifact-driven workflow, planning or reviewing changes based on artifact dependencies, or working with OpenSpec commands."
metadata:
  version: "1.2.0"
  release_date: "2026-02-23"
---

# OpenSpec Skill

Use this skill to guide the OpenSpec artifact-driven workflow system, including artifact graphs, schema/template resolution, and change lifecycle.

## Quick Reference — CLI Commands

| Command | Purpose |
| --- | --- |
| `openspec new change <name>` | Start a new change |
| `openspec status --change <name>` | Show artifact completion status |
| `openspec instructions <artifact> --change <name>` | Get instructions for creating an artifact |
| `openspec list` | List all active changes |
| `openspec archive <change-name>` | Archive a completed change |
| `openspec validate <item>` | Validate a change or spec |
| `openspec schemas` | List available workflow schemas |
| `openspec config` | View/modify global config |
| `openspec init` | Initialize OpenSpec in a project |
| `openspec update` | Update instruction files |

## Agent-Driven Patterns (no CLI subcommand)

These are patterns the agent performs using the CLI commands above:

| Pattern | How it works |
| --- | --- |
| **Continue** (next artifact) | `openspec status --change <name> --json` → find first ready → `openspec instructions <artifact> --change <name> --json` → create it |
| **Fast-forward** (all artifacts) | Same as continue but loop through all: proposal → specs → design → tasks |
| **Apply** (implement tasks) | Read `tasks.md` → work through `[ ]` items → mark `[x]` |
| **Verify** (validate implementation) | Compare code against specs, design, and tasks |
| **Sync** (merge delta specs) | Merge delta specs from change into `openspec/specs/` |

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

## Typical Workflow

```
1. openspec new change add-feature
2. Create proposal.md (via instructions or manually)
3. Create specs/ (via instructions or manually)
4. Create design.md (via instructions or manually)
5. Create tasks.md (via instructions or manually)
6. Implement tasks (mark [x] in tasks.md)
7. openspec archive add-feature
```

## Schema Management

```bash
openspec schemas                                    # List available schemas
openspec schema which --all                         # Show resolution sources
openspec schema init my-workflow                    # Create new schema interactively
openspec schema fork spec-driven my-workflow        # Fork existing schema
openspec schema validate my-workflow                # Validate schema structure
```

## Project Configuration

Create `openspec/config.yaml` for per-project settings:

```yaml
schema: spec-driven

context: |
  Tech stack: TypeScript, Angular, Supabase
  Testing: Vitest

rules:
  proposal:
    - Include rollback plan
  specs:
    - Use Given/When/Then format
```

**Schema precedence:** CLI flag → Change metadata → Project config → Default (`spec-driven`)

## Core Concepts

- **Artifact graph, not a workflow engine**: Dependencies enable actions; they do not force linear phases.
- **Filesystem-as-database**: Completion is derived from file existence, not stored state.
- **Deterministic CLI**: Commands require explicit change context (agent infers, CLI remains strict).
- **Templates are schema-scoped**: Templates live next to schema and resolve with a strict 2-level fallback.

## Decision Rules

- Prefer **update** when intent stays the same and you are refining scope or approach.
- Prefer **new change** when intent or scope fundamentally shifts, or the original can be completed independently.
- Always preserve a clear history of why artifacts changed (proposal/specs/design/tasks).

## Prohibitions

- Do not treat the system as a linear workflow engine.
- Do not assume a change is active without explicit selection.
- Do not silently fall back between schemas or templates without reporting.
- Do not copy long vendor docs verbatim; summarize and provide actionable guidance.

## Links

- [Documentation](https://github.com/Fission-AI/OpenSpec/tree/main/docs)
- [Releases](https://github.com/Fission-AI/OpenSpec/releases)
- [GitHub](https://github.com/Fission-AI/OpenSpec)
- [npm](https://www.npmjs.com/package/openspec)
