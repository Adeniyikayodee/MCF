#!/usr/bin/env node

// Checks that the context files still describe the code. Four checks:
//
//   1. token budget   always loaded files have a ceiling, because they cost the agent something
//                     on every request
//   2. dead paths     a backticked path in prose has to exist on disk
//   3. dead scripts   an npm script named in prose has to exist in package.json
//   4. sync drift     the generated files have to match AGENTS.md

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { syncContext } from './sync-context.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Loaded at the start of every session whether the task needs them or not. When one of these keeps
// pushing against its ceiling, move the detail into docs/ and leave a path behind.
const ALWAYS_LOADED = [
  { path: 'AGENTS.md', budget: 800 },
  { path: 'CLAUDE.md', budget: 300 },
  { path: '.github/copilot-instructions.md', budget: 900 },
  { path: 'src/AGENTS.md', budget: 400 },
];

// Checked for correctness but not budgeted, because an agent only reads these on demand.
const ON_DEMAND_DIRS = ['docs', '.claude', '.cursor'];

// Rough average for English prose. Precision is not the point, catching a file that doubled is.
const CHARS_PER_TOKEN = 4;

const estimateTokens = (text) => Math.ceil(text.length / CHARS_PER_TOKEN);

const PATH_LIKE = /^[\w.@-]+(\/[\w.@-]+)*\/?$/;
const HAS_EXTENSION = /\.(js|mjs|cjs|ts|json|md|mdc|ya?ml|txt)$/;

// Fenced blocks are stripped first so an example inside a snippet is never read as a real reference.
function inlineCodeSpans(text) {
  const prose = text.replace(/```[\s\S]*?```/g, '');
  return [...prose.matchAll(/`([^`\n]+)`/g)].map((match) => match[1].trim());
}

function looksLikePath(span) {
  if (!PATH_LIKE.test(span)) return false;
  return span.includes('/') || HAS_EXTENSION.test(span);
}

function collectMarkdown(dir) {
  const absolute = join(ROOT, dir);
  if (!existsSync(absolute)) return [];

  const found = [];

  for (const entry of readdirSync(absolute)) {
    const full = join(absolute, entry);

    if (statSync(full).isDirectory()) {
      found.push(...collectMarkdown(join(dir, entry)));
    } else if (/\.(md|mdc)$/.test(entry)) {
      found.push(relative(ROOT, full));
    }
  }

  return found;
}

function checkBudgets(problems) {
  console.log('  token budgets');

  for (const { path, budget } of ALWAYS_LOADED) {
    const absolute = join(ROOT, path);

    if (!existsSync(absolute)) {
      problems.push(`missing always loaded file: ${path}`);
      console.log(`    ${path.padEnd(34)} missing`);
      continue;
    }

    const tokens = estimateTokens(readFileSync(absolute, 'utf8'));
    const verdict = tokens > budget ? 'over budget' : 'ok';

    console.log(`    ${path.padEnd(34)} ~${String(tokens).padStart(4)} tokens / ${String(budget).padEnd(4)} ${verdict}`);

    if (tokens > budget) {
      problems.push(`${path} is ~${tokens} tokens against a budget of ${budget}, move detail into docs/`);
    }
  }
}

function checkReferences(files, scripts, problems) {
  console.log('\n  references');

  for (const file of files) {
    const spans = inlineCodeSpans(readFileSync(join(ROOT, file), 'utf8'));
    let checked = 0;

    for (const span of spans) {
      if (looksLikePath(span)) {
        checked += 1;

        if (!existsSync(join(ROOT, span))) {
          problems.push(`${file} points at a path that does not exist: ${span}`);
        }

        continue;
      }

      const script = span.match(/^npm run ([\w:-]+)$/) ?? span.match(/^npm (test|start)$/);

      if (script) {
        checked += 1;

        if (!scripts.includes(script[1])) {
          problems.push(`${file} mentions an npm script that is not in package.json: ${span}`);
        }
      }
    }

    console.log(`    ${file.padEnd(44)} ${String(checked).padStart(2)} references checked`);
  }
}

function checkSync(problems) {
  console.log('\n  generated files');

  const { drifted } = syncContext({ check: true });

  if (drifted.length === 0) {
    console.log('    every generated file matches AGENTS.md');
    return;
  }

  for (const path of drifted) {
    console.log(`    ${path.padEnd(44)} out of sync`);
    problems.push(`${path} is out of sync with AGENTS.md, run \`npm run sync:context\``);
  }
}

const scripts = Object.keys(JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts);
const files = [
  ...ALWAYS_LOADED.map(({ path }) => path).filter((path) => existsSync(join(ROOT, path))),
  ...ON_DEMAND_DIRS.flatMap(collectMarkdown),
];

const problems = [];

console.log('\ncontext lint\n');
checkBudgets(problems);
checkReferences(files, scripts, problems);
checkSync(problems);

if (problems.length === 0) {
  console.log(`\n  ${files.length} files checked, no problems found\n`);
} else {
  console.log('');
  for (const problem of problems) console.error(`  problem: ${problem}`);
  console.error(`\n  ${problems.length} problem${problems.length === 1 ? '' : 's'} found\n`);
  process.exit(1);
}
