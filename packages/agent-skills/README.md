# Agent skill for consumers of @koobiq/components

`koobiq-angular` is an [Agent Skill](https://agentskills.io) that ships inside `@koobiq/components`. It teaches the coding
agents of the teams that use the library (Claude Code, Codex, Copilot, Cursor, Gemini CLI and others) to build UI with
Koobiq: which component fits, where to import it from, how to style it with tokens and how to upgrade. It is the
consumer-facing counterpart of the repository's own `AGENTS.md`, which serves contributors.

## What ships

`yarn run build:agent-skills` runs after `yarn run build:components` and writes two folders into `dist/components`:

| Folder                   | Contents                                                                                                                                                     | How consumers get it                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `skills/koobiq-angular/` | `SKILL.md` (rules, workflow, component inventory) and `references/*.md`                                                                                      | Copied into `.claude/skills` / `.agents/skills` by `ng generate @koobiq/components:agent-skills` |
| `agent-docs/`            | One reference per documented item (overview, the code of every example, API summary, component tokens), the guides, `migrations.md` and an index `README.md` | Read in place from `node_modules`, so it always matches the installed version                    |

Everything is generated from the sources of the documentation site: `apps/docs/src/app/structure.ts`, the English MDX
pages, `packages/docs-examples`, the API reports in `tools/public_api_guard`, the component `*-tokens.scss` files,
`apps/docs/src/app/seo-descriptions.ts` and `packages/schematics/src/migrations.json`. A new component with an overview
page appears in the skill without any change here.

## What is written by hand

- `koobiq-angular/SKILL.md`: the rules and the workflow. `{{VERSION}}`, `{{NG_VERSION}}`, `{{COMPONENTS}}`, `{{OTHER}}`
  and `{{GUIDES}}` are filled by the generator. Keep the frontmatter to the six keys of the specification: claude.ai and
  the Skills API reject any other key.
- `koobiq-angular/references/*.md`: guidance the documentation does not give in one place, such as choosing between
  look-alike components. The first line of each file lists the documented items whose API it relies on:
  `<!-- covers: select, autocomplete -->`. The generator strips that line from the shipped copy.
- `evals/`: the eval suite, see below. It does not ship.

Write for agents: English, imperative, short. Every Koobiq name you mention must exist, see the gate below.

## The gate

`yarn run check-agent-skills` runs in the API workflow after the packages are built. It fails when:

- a `Kbq*` / `KBQ_*` / `kbq*` name, a `<kbq-*>` element, a `--kbq-*` token or an `@koobiq/components/<entry>` path in
  the hand-written files does not exist in the API reports, the stylesheets, `@koobiq/design-tokens` or `tsconfig.json`;
- the API surface (exports, selectors, input and output names, deprecations) of an item a reference covers changed since
  the reference was last reviewed. Re-read the reference against the new API, fix it, then run
  `yarn run approve-agent-skills`, which updates `review-hashes.json`, the way `approve-api` updates the API reports;
- the shipped skill breaks the specification: unknown frontmatter keys, a description over 1024 characters, `SKILL.md`
  over 500 lines or about 5000 tokens, links that leave the skill, references nested deeper than `references/`;
- an item has no generated reference or a reference still holds an `<Example>` tag.

To run it locally:

```bash
yarn run build:components && yarn run build:agent-skills && yarn run check-agent-skills
```

## Evals

The gate proves the skill says nothing false; evals show whether it helps. `packages/agent-skills/evals` holds
[`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals) cases: realistic requests in a scaffolded Angular
workspace that has the built package installed, graded by regular expressions over the files the agent writes and by
whether it used the skill. Each case runs with the skill and without it, and the report shows the difference.

```bash
yarn run eval:agent-skills --case sign-in-form --runs 1 --max-cost-usd 5
```

Every run is a real model call on your account: the full suite is 9 cases × 3 runs × 2 arms. Run it on demand, before
a release and when a new model comes out, not on every pull request. It needs Claude Code 2.1.269 or newer.

## Delivery

- **The package.** `ng add @koobiq/components` asks which agents to set up; nothing is written without an answer.
  `ng generate @koobiq/components:agent-skills` installs or updates the skill and adds a managed block of rules to
  `AGENTS.md`. It records what it installed in `.koobiq-skill.json` and never replaces a file the user changed without
  `--force`.
- **Upgrades.** The `agent-skills-refresh` migration updates an installed skill on `ng update @koobiq/components@21`.
  Between majors, consumers run the schematic again.
- **Without Angular CLI.** Copy `node_modules/@koobiq/components/skills/koobiq-angular`, or
  `npx skills add ./node_modules/@koobiq/components/skills/koobiq-angular`.
- **The documentation site.** The generator also writes `dist/agent-skills-site/.well-known/agent-skills/` (an index
  in the Agent Skills Discovery v0.2.0 format and an archive with its SHA-256 digest), and the docs build publishes it
  together with `agent-docs` as Markdown. `npx skills add https://koobiq.io` then installs the skill of the release the
  site documents, and web-reading agents fetch `https://koobiq.io/agent-docs/components/<id>.md`.

The documentation page for consumers is `docs/guides/ai-agents.{en,ru}.mdx`.
