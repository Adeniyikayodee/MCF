import {
  handleList,
  handleGet,
  handleCreate,
  handleUpdate,
  handleDelete,
} from './api/tasks.js';

const STATUS_BY_ERROR_CODE = {
  invalid_input: 400,
  not_found: 404,
};

const routes = [
  { method: 'GET', pattern: /^\/tasks$/, successStatus: 200, run: (_, query) => handleList(query) },
  { method: 'POST', pattern: /^\/tasks$/, successStatus: 201, run: (_, __, body) => handleCreate(body) },
  { method: 'GET', pattern: /^\/tasks\/([^/]+)$/, successStatus: 200, run: ([id]) => handleGet(id) },
  { method: 'PATCH', pattern: /^\/tasks\/([^/]+)$/, successStatus: 200, run: ([id], __, body) => handleUpdate(id, body) },
  { method: 'DELETE', pattern: /^\/tasks\/([^/]+)$/, successStatus: 204, run: ([id]) => handleDelete(id) },
];

export function route(method, pathname, query = {}, body = undefined) {
  const match = routes
    .filter((candidate) => candidate.method === method)
    .map((candidate) => ({ candidate, groups: candidate.pattern.exec(pathname) }))
    .find(({ groups }) => groups !== null);

  if (!match) {
    return {
      status: 404,
      payload: { error: { code: 'not_found', message: `no route for ${method} ${pathname}` } },
    };
  }

  const result = match.candidate.run(match.groups.slice(1), query, body);

  if (result.error) {
    return { status: STATUS_BY_ERROR_CODE[result.error.code] ?? 500, payload: result };
  }

  return { status: match.candidate.successStatus, payload: result };
}
