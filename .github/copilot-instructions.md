<!-- Generated from AGENTS.md by `npm run sync:context`. Edit AGENTS.md instead. -->

# AGENTS.md

Task API used as the worked example for a tutorial on managing context files. This file is the
single source of truth for agent instructions, and `CLAUDE.md` plus
`.github/copilot-instructions.md` are generated from it by `npm run sync:context`, so edit this
file and never the generated ones.

## Commands

- Install: nothing to install, the project has zero dependencies
- Run the tests: `npm test`
- Start the server on port 3000: `npm start`
- Check the context files: `npm run lint:context`
- Regenerate the tool specific context files: `npm run sync:context`

## Conventions that are not obvious from the code

- The test runner is the Node built in runner invoked through `node --test`, so do not add Jest,
  Vitest, or any other test dependency to this repository.
- This project stays dependency free on purpose, so solve problems with the Node standard library
  rather than by adding a package.
- Handlers in `src/api/` return `{ data }` or `{ error: { code, message } }` and never choose an
  HTTP status, because `src/router.js` owns the mapping from error code to status.
- Handlers never touch the store directly, so any logic that reads or writes tasks belongs in
  `src/services/tasks.js`.
- The store is module level state that survives between test cases, so any test file that creates
  a task has to call `resetTasks()` in a `beforeEach` hook.

## Definition of done

Run `npm test` and `npm run lint:context` before you report a task as finished, and paste the
output rather than asserting that it passed.

## Where to look

- Architecture and request flow: `docs/architecture.md`
- Testing conventions and how to add a case: `docs/testing.md`
- Why the store is in memory: `docs/decisions/0001-in-memory-store.md`
- Rules that apply only to the API layer: `src/AGENTS.md`
