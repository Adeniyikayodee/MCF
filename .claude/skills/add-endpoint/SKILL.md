---
name: add-endpoint
description: Add a new endpoint to the task API following the layering this repository uses
---

# Add an endpoint

This workflow loads only when someone asks for a new endpoint, which is why it lives here instead
of in `AGENTS.md` where every session would pay for it.

Read `docs/architecture.md` first if you have not already, then work through these steps in order.

1. Decide which layer owns the new behaviour. Anything that reads or writes tasks belongs in
   `src/services/tasks.js`, and anything about request shape belongs in `src/api/tasks.js`.
2. Add or extend a validator in `src/lib/validate.js` if the endpoint accepts input, returning an
   array of problem strings so the handler can report every failure at once.
3. Add the handler to `src/api/tasks.js`, returning `{ data }` on success and
   `{ error: { code, message } }` on failure, and using an existing error code where one fits.
4. Register the route in the `routes` array in `src/router.js` with the success status it should
   return, and add the error code to `STATUS_BY_ERROR_CODE` if you introduced a new one.
5. Add at least one success case and one failure case to `tests/api.test.js`.
6. Run `npm test` and `npm run lint:context`, then paste both outputs into your summary.

Do not add a dependency, do not introduce a persistence layer, and do not set a status code inside
a handler.
