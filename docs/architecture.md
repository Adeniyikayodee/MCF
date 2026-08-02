# Architecture

The API is four layers deep and a request passes through all of them in order.

```
HTTP request
  src/server.js      parses the URL, the query string, and the JSON body
  src/router.js      matches method and path, then maps the result onto a status code
  src/api/tasks.js   validates input and shapes the response envelope
  src/services/tasks.js  applies business rules and owns the store
```

## Why the layers are split this way

The router is the only module that knows about HTTP status codes, so a change to the error
vocabulary happens in one place instead of being scattered across handlers. Handlers know about
request shape and response shape but nothing about storage, which means every business rule can be
tested by calling a service function directly without starting a server.

## Response envelope

Success responses carry a `data` key and failure responses carry an `error` key with a `code` and a
`message`, so a client can branch on the presence of `error` without inspecting the status code
first.

```json
{ "data": { "id": "1", "title": "write the article", "done": false } }
```

```json
{ "error": { "code": "invalid_input", "message": "title is required and must be a non-empty string" } }
```

The status mapping lives in `STATUS_BY_ERROR_CODE` in `src/router.js`, and adding a new error code
means adding it to that object as well as returning it from a handler.

## Adding a resource

A new resource such as `notes` follows the same layout, which is a service module holding the store
and the rules, a handler module holding validation and envelopes, and a set of route entries in
`src/router.js`. Nothing in `src/server.js` needs to change, because it never mentions a specific
resource.
