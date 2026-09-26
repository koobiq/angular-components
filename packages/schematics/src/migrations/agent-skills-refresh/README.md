# agent-skills-refresh

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`). Updates
the `koobiq-angular` agent skill to the new version wherever `ng generate @koobiq/components:agent-skills` or
`ng add @koobiq/components` installed it, and refreshes the managed block of rules in `AGENTS.md` and `CLAUDE.md`.

## What it changes

- `.claude/skills/koobiq-angular/` and `.agents/skills/koobiq-angular/`, when they hold a `.koobiq-skill.json`
  manifest from an earlier install. Files still identical to what was installed are replaced with the new version;
  files the user changed are kept and listed in the output.
- The text between `<!-- koobiq:agent-rules:start -->` and `<!-- koobiq:agent-rules:end -->` in `AGENTS.md`,
  `CLAUDE.md` and `.claude/CLAUDE.md`. Everything outside the markers stays as it is.

A workspace that never installed the skill is not touched.

## Manual steps

When the output lists kept files, merge the new version of the skill into them by hand, or run
`ng generate @koobiq/components:agent-skills --force` to replace them.
