# Testing

Tests run on the Node built in test runner, so there is no framework to install and no
configuration file to maintain.

```bash
npm test                                  # everything
node --test tests/api.test.js             # one file
node --test --test-name-pattern="filter"  # one case by name
```

## How the tests are organised

`tests/api.test.js` calls `route()` from `src/router.js` directly rather than starting an HTTP
server, which keeps each case fast and lets an assertion look at the status and the payload in the
same object. `tests/validate.test.js` covers the validators on their own, because validation rules
change more often than routes do and they deserve cases that do not depend on the routing layer.

## Shared state

The store in `src/services/tasks.js` is module level state that persists between test cases, so
every file that creates tasks must call `resetTasks()` in a `beforeEach` hook. Forgetting this
produces tests that pass alone and fail when run with the rest of the suite, which is the single
most common way to break this suite.

```js
import test from 'node:test';
import { resetTasks } from '../src/services/tasks.js';

test.beforeEach(() => resetTasks());
```

## What a new endpoint needs

Two cases at minimum, one that proves the success path returns the right status and body, and one
that proves the failure path returns the right error code. Cover an additional case whenever the
endpoint accepts input that can be malformed in more than one way.
