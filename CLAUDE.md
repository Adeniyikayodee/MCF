<!-- Generated from AGENTS.md by `npm run sync:context`. Edit AGENTS.md instead. -->

@AGENTS.md

## Claude Code specific

- Use plan mode for any change that touches more than three files, and skip it for a one line fix.
- Delegate codebase exploration to a subagent so the findings come back summarised rather than as
  a hundred file reads in the main context.
- Run `npm run lint:context` after editing any context file, because the hook in
  `.claude/settings.json` runs it anyway and finding the problem earlier is cheaper.
