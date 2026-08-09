# MCF: Managing Context Files

A small task API wrapped in the context file setup described in the article *How to Manage Context
Files in Your Codebase and Get Better Output From AI Coding Agents*. The API is deliberately
ordinary, because the point of the repository is the layer around it: the files that tell a coding
agent how this codebase works, and the tooling that stops those files from going stale.

There is nothing to install. Node 20 or newer is the only requirement.

```bash
git clone https://github.com/Adeniyikayodee/MCF.git
cd MCF
npm test
npm run lint:context
npm start
```

## The context layer

`AGENTS.md` is the source of truth. `CLAUDE.md` and `.github/copilot-instructions.md` are generated
from it, so edit `AGENTS.md` and run `npm run sync:context` rather than editing them directly.

| Path | Role |
| --- | --- |
| `AGENTS.md` | Loaded on every task, kept under a token budget |
| `src/AGENTS.md` | Scoped rules that only load when an agent works inside `src/` |
| `docs/` | The on demand layer, referenced from the root file by path |
| `.claude/skills/add-endpoint/SKILL.md` | A workflow that loads only when someone asks for an endpoint |
| `.cursor/rules/testing.mdc` | Glob scoped rule, hand written because the shared format has no equivalent |
| `scripts/sync-context.mjs` | Generates the tool specific files from `AGENTS.md` |
| `scripts/context-lint.mjs` | Fails when a context file rots |

## The context linter

Context files go stale for the same reason documentation goes stale, which is that nothing breaks
when they are wrong. `npm run lint:context` gives them a failing test. It checks that always loaded
files stay under a token budget, that every path they mention exists, that every npm script they
mention is real, and that the generated files still match `AGENTS.md`.

```
context lint

  token budgets
    AGENTS.md                          ~ 452 tokens / 800  ok
    CLAUDE.md                          ~ 133 tokens / 300  ok
    .github/copilot-instructions.md    ~ 474 tokens / 900  ok
    src/AGENTS.md                      ~ 169 tokens / 400  ok
```

When something is wrong it names the file and the problem:

```
  problem: AGENTS.md mentions an npm script that is not in package.json: npm run typecheck
  problem: AGENTS.md points at a path that does not exist: src/services/task.js
  problem: .github/copilot-instructions.md is out of sync with AGENTS.md, run `npm run sync:context`

  3 problems found
```

Token counts are estimated at four characters per token rather than measured with a real tokenizer.
That is accurate enough to catch a file that has doubled in size, and it keeps the repository free
of dependencies.

## The API

| Method | Path | Behaviour |
| --- | --- | --- |
| `GET` | `/tasks` | Lists tasks, with an optional `done=true` or `done=false` filter |
| `POST` | `/tasks` | Creates a task from a body with a `title` and an optional `done` |
| `GET` | `/tasks/:id` | Returns one task, or a 404 |
| `PATCH` | `/tasks/:id` | Updates the title, the done flag, or both |
| `DELETE` | `/tasks/:id` | Removes a task and returns a 204 |

Success responses carry a `data` key and failures carry an `error` key with a `code` and a
`message`. See `docs/architecture.md` for the request flow and the reasoning behind the layering.

## Trying it on your own agent

Point any agent at this repository and ask for a new endpoint, such as a `GET /tasks/count` that
returns the number of open tasks. Run the same request again on a branch where the context files
have been deleted, then compare whether the agent picked the right layer, reused the response
envelope, wrote its test in the right runner, and resisted adding a dependency.

## License

MIT, see `LICENSE`.
