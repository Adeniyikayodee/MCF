const tasks = new Map();
let nextId = 1;

export function listTasks() {
  return [...tasks.values()];
}

export function getTask(id) {
  return tasks.get(id) ?? null;
}

export function createTask({ title, done = false }) {
  const task = {
    id: String(nextId++),
    title: title.trim(),
    done,
    createdAt: new Date().toISOString(),
  };

  tasks.set(task.id, task);
  return task;
}

export function updateTask(id, patch) {
  const existing = tasks.get(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
    ...(patch.done !== undefined ? { done: patch.done } : {}),
  };

  tasks.set(id, updated);
  return updated;
}

export function deleteTask(id) {
  return tasks.delete(id);
}

export function resetTasks() {
  tasks.clear();
  nextId = 1;
}
