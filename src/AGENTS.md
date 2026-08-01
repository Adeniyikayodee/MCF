# Source layer

Rules below apply to everything under `src/`, and they sit on top of the root `AGENTS.md` rather
than replacing it.

## Adding an endpoint

1. Add the handler to `src/api/tasks.js` following the shape the neighbouring handlers use.
2. Add one entry to the `routes` array in `src/router.js` with its success status.
3. Add a case to `tests/api.test.js` that covers the success path and the failure path.

## Validation

Validators live in `src/lib/validate.js`, they return an array of problem strings rather than
throwing, and they report every failing field instead of stopping at the first one, so a caller can
show the user all of their mistakes at once.
