# 0001: Keep the task store in memory

Status: accepted

## Context

This repository exists to demonstrate context file management for AI coding agents, and a reader
should be able to clone it and run every command in `AGENTS.md` without installing anything. A real
database would add a dependency, a connection string, a migration step, and a docker compose file,
all of which are noise relative to the thing the repository is teaching.

## Decision

The store is a `Map` held in module scope inside `src/services/tasks.js`, and it exposes a
`resetTasks()` function so the test suite can start each case from a known state.

## Consequences

State disappears when the process exits, which is fine for a teaching repository and would not be
fine for anything real. The service module is the only file that touches the `Map`, so swapping in a
database later means rewriting one module and leaving the handlers, the router, and the server
untouched.

An agent working here should not add a database, an ORM, or a persistence layer unless the task
explicitly asks for one, and should treat the missing persistence as a deliberate choice rather than
a gap to fill.
