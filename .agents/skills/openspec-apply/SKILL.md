---
name: openspec-apply
description: Implement tasks from the change. Use when the user says "implement", "apply the change", or "start coding from tasks".
---

# OpenSpec Apply Skill

Use this skill to implement tasks from a change. The agent reads `tasks.md`, works through tasks one by one, writes code, creates files, runs tests as needed, and checks off completed items with `[x]`.

## When to Use

- All planning artifacts are complete and the user wants to implement.
- The user says "implement", "apply", "start coding", "execute tasks".
- Resuming implementation after an interruption.

## Prerequisites

- **Planning artifacts complete** — at minimum `tasks.md` exists (created via **openspec-ff** or **openspec-continue**).

## Workflow

1. **Check status**
   - Run: `openspec status --change <name>`
   - Confirm all planning artifacts are done.

2. **Read tasks**
   - Read `openspec/changes/<name>/tasks.md` and identify incomplete tasks (unchecked `[ ]` items).

3. **Work through tasks**
   - For each task: read relevant specs, design, and existing code; write code; create/modify files; run tests.
   - Mark each task complete with `[x]` in `tasks.md`.

4. **Handle issues**
   - If a task reveals that the design was wrong, edit the artifact (e.g. `design.md`) and continue.
   - OpenSpec is fluid — updating artifacts during implementation is expected and encouraged.

5. **Resume if interrupted**
   - Run the apply flow again; it picks up where it left off based on checkbox state.

## Outputs

- Code changes (new files, modified files) implementing the tasks.
- `tasks.md` updated with `[x]` for completed tasks.

## Next Steps

- Use **openspec-verify** to validate implementation matches artifacts.
- Use **openspec-archive** to archive the completed change.

## Troubleshooting

- **"Change not found"**: Specify the change name: check with `openspec list`.
- **Tasks seem wrong**: Edit `tasks.md` before applying.
- **Implementation diverges from design**: Edit `design.md` or `specs/` as needed; OpenSpec is iterative.

## References

- Status: `openspec status --change <name>`
- Tasks file: `openspec/changes/<name>/tasks.md`
