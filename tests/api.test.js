import test from 'node:test';
import assert from 'node:assert/strict';

import { route } from '../src/router.js';
import { resetTasks } from '../src/services/tasks.js';

test.beforeEach(() => resetTasks());

test('POST /tasks creates a task and returns 201', () => {
  const { status, payload } = route('POST', '/tasks', {}, { title: 'write the article' });

  assert.equal(status, 201);
  assert.equal(payload.data.title, 'write the article');
  assert.equal(payload.data.done, false);
});

test('POST /tasks rejects a missing title with 400', () => {
  const { status, payload } = route('POST', '/tasks', {}, { done: true });

  assert.equal(status, 400);
  assert.equal(payload.error.code, 'invalid_input');
});

test('GET /tasks returns every task', () => {
  route('POST', '/tasks', {}, { title: 'first' });
  route('POST', '/tasks', {}, { title: 'second' });

  const { status, payload } = route('GET', '/tasks');

  assert.equal(status, 200);
  assert.equal(payload.data.length, 2);
});

test('GET /tasks?done=true filters on the done flag', () => {
  route('POST', '/tasks', {}, { title: 'open' });
  route('POST', '/tasks', {}, { title: 'closed', done: true });

  const { status, payload } = route('GET', '/tasks', { done: 'true' });

  assert.equal(status, 200);
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].title, 'closed');
});

test('GET /tasks rejects a done filter that is not a boolean string', () => {
  const { status, payload } = route('GET', '/tasks', { done: 'maybe' });

  assert.equal(status, 400);
  assert.equal(payload.error.code, 'invalid_input');
});

test('GET /tasks/:id returns 404 for an unknown id', () => {
  const { status, payload } = route('GET', '/tasks/999');

  assert.equal(status, 404);
  assert.equal(payload.error.code, 'not_found');
});

test('PATCH /tasks/:id updates only the fields it is given', () => {
  const created = route('POST', '/tasks', {}, { title: 'draft' }).payload.data;

  const { status, payload } = route('PATCH', `/tasks/${created.id}`, {}, { done: true });

  assert.equal(status, 200);
  assert.equal(payload.data.done, true);
  assert.equal(payload.data.title, 'draft');
});

test('DELETE /tasks/:id returns 204 and removes the task', () => {
  const created = route('POST', '/tasks', {}, { title: 'temporary' }).payload.data;

  assert.equal(route('DELETE', `/tasks/${created.id}`).status, 204);
  assert.equal(route('GET', `/tasks/${created.id}`).status, 404);
});

test('an unknown path returns 404 rather than throwing', () => {
  const { status } = route('GET', '/nope');

  assert.equal(status, 404);
});
