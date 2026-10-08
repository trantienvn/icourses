# Decisions and assumptions

| Date | Topic | Decision | Reason |
|---|---|---|---|
| 2026-10-08 | Angular version | Angular 22 stable; pin matching core, CLI, Material, and CDK versions | Latest stable release supported by the official Angular release schedule on implementation date |
| 2026-10-08 | Node version | Require Node 22.22.3+ in the 22.x line | Meets Angular 22 compatibility and project Node 20+ baseline |
| 2026-10-08 | Repository starting state | Initialize the requested monorepo from an empty workspace | `D:\code\Codex` had no project files or Git repository |
| 2026-10-08 | Compose verification | Docker Compose configuration will be authored, but execution cannot be verified in this environment | Docker CLI is not installed |
