import test from 'node:test';
import assert from 'node:assert/strict';

import { validateTaskInput, validateTaskPatch } from '../src/lib/validate.js';

test('validateTaskInput accepts a minimal valid task', () => {
  assert.deepEqual(validateTaskInput({ title: 'ship it' }), []);
});

test('validateTaskInput reports every problem at once', () => {
  const problems = validateTaskInput({ title: '   ', done: 'yes' });

  assert.equal(problems.length, 2);
});

test('validateTaskInput rejects a title longer than the limit', () => {
  const problems = validateTaskInput({ title: 'a'.repeat(121) });

  assert.equal(problems.length, 1);
  assert.match(problems[0], /120 characters/);
});

test('validateTaskPatch requires at least one known field', () => {
  const problems = validateTaskPatch({ colour: 'red' });

  assert.deepEqual(problems, ['patch must contain at least one of title or done']);
});

test('validateTaskPatch accepts a patch that only sets done', () => {
  assert.deepEqual(validateTaskPatch({ done: true }), []);
});
