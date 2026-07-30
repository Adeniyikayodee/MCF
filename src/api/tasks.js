import { validateTaskInput, validateTaskPatch } from '../lib/validate.js';
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../services/tasks.js';

const invalid = (message) => ({ error: { code: 'invalid_input', message } });
const missing = (id) => ({ error: { code: 'not_found', message: `no task with id ${id}` } });

export function handleList(query) {
  const tasks = listTasks();

  if (query.done === undefined) {
    return { data: tasks };
  }

  if (query.done !== 'true' && query.done !== 'false') {
    return invalid('done filter must be true or false');
  }

  const wanted = query.done === 'true';
  return { data: tasks.filter((task) => task.done === wanted) };
}

export function handleGet(id) {
  const task = getTask(id);
  return task ? { data: task } : missing(id);
}

export function handleCreate(body) {
  const problems = validateTaskInput(body);
  if (problems.length > 0) return invalid(problems.join(', '));

  return { data: createTask(body) };
}

export function handleUpdate(id, body) {
  const problems = validateTaskPatch(body);
  if (problems.length > 0) return invalid(problems.join(', '));

  const task = updateTask(id, body);
  return task ? { data: task } : missing(id);
}

export function handleDelete(id) {
  return deleteTask(id) ? { data: null } : missing(id);
}
