#!/usr/bin/env node

// Generates the tool specific context files from AGENTS.md, so the same rules do not have to be
// maintained by hand in three places.
//
//   node scripts/sync-context.mjs           write
//   node scripts/sync-context.mjs --check   report drift, exit 1

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'AGENTS.md';

const banner = `<!-- Generated from ${SOURCE} by \`npm run sync:context\`. Edit ${SOURCE} instead. -->`;

const CLAUDE_EXTRAS = `## Claude Code specific

- Use plan mode for any change that touches more than three files, and skip it for a one line fix.
- Delegate codebase exploration to a subagent so the findings come back summarised rather than as
  a hundred file reads in the main context.
- Run \`npm run lint:context\` after editing any context file, because the hook in
  \`.claude/settings.json\` runs it anyway and finding the problem earlier is cheaper.
`;

export const targets = [
  // Claude Code resolves @path imports, so its file stays a pointer plus what is specific to it.
  { path: 'CLAUDE.md', render: () => `${banner}\n\n@${SOURCE}\n\n${CLAUDE_EXTRAS}` },
  // Copilot has no import syntax, so the source is inlined.
  { path: '.github/copilot-instructions.md', render: (source) => `${banner}\n\n${source}` },
];

export function syncContext({ check = false } = {}) {
  const source = readFileSync(join(ROOT, SOURCE), 'utf8');
  const written = [];
  const drifted = [];

  for (const target of targets) {
    const expected = target.render(source);
    const absolute = join(ROOT, target.path);

    let actual = null;
    try {
      actual = readFileSync(absolute, 'utf8');
    } catch {
      actual = null;
    }

    if (actual === expected) continue;

    if (check) {
      drifted.push(target.path);
    } else {
      writeFileSync(absolute, expected);
      written.push(target.path);
    }
  }

  return { written, drifted };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const { written, drifted } = syncContext({ check });

  if (check) {
    for (const path of drifted) console.error(`  out of sync with ${SOURCE}: ${path}`);

    if (drifted.length > 0) {
      console.error('\n  run `npm run sync:context` to regenerate\n');
      process.exit(1);
    }

    console.log(`  every generated file matches ${SOURCE}`);
  } else {
    for (const path of written) console.log(`  written    ${path}`);
    if (written.length === 0) console.log('  nothing to do, every generated file was already current');
  }
}
