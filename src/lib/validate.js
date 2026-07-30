const TITLE_MAX = 120;

// Validators return a list of problems instead of throwing, so a handler can report every bad
// field in one response.

export function validateTaskInput(input) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return ['body must be a JSON object'];
  }

  const problems = [];

  if (typeof input.title !== 'string' || input.title.trim() === '') {
    problems.push('title is required and must be a non-empty string');
  } else if (input.title.length > TITLE_MAX) {
    problems.push(`title must be ${TITLE_MAX} characters or fewer`);
  }

  if (input.done !== undefined && typeof input.done !== 'boolean') {
    problems.push('done must be a boolean when present');
  }

  return problems;
}

export function validateTaskPatch(input) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return ['body must be a JSON object'];
  }

  if (input.title === undefined && input.done === undefined) {
    return ['patch must contain at least one of title or done'];
  }

  const problems = [];

  if (input.title !== undefined) {
    if (typeof input.title !== 'string' || input.title.trim() === '') {
      problems.push('title must be a non-empty string when present');
    } else if (input.title.length > TITLE_MAX) {
      problems.push(`title must be ${TITLE_MAX} characters or fewer`);
    }
  }

  if (input.done !== undefined && typeof input.done !== 'boolean') {
    problems.push('done must be a boolean when present');
  }

  return problems;
}
