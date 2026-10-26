# AGENTS.md

> Context file for AI agents working in this repository.

## Getting Started

Use the Node.js version specified in [.nvmrc](.nvmrc); CI installs from the same file.

Use yarn as the package manager. Yarn 4 is checked in under `.yarn/releases` and uses the `node-modules` linker. Install dependencies with:

```bash
yarn install
```

`postinstall` compiles the custom Angular builder in `tools/builders` that every library build goes through.

Setup git hooks:

```bash
npx husky
```

The hooks run `lint-staged` before each commit (prettier, stylelint and eslint with `--fix`, cspell on Markdown) and `commitlint` on the commit message.

## Package Structure

```
packages/
├── components/                # @koobiq/components — every subdirectory is a secondary entry point (@koobiq/components/<name>)
├── components/core/           # @koobiq/components/core — shared code: a11y, behaviors, locales, overlay, test helpers, KBQ_WINDOW
├── components-experimental/   # @koobiq/components-experimental — empty barrel, kept so sub-packages can land later
├── docs-examples/             # Live examples rendered by the docs site and reused by the dev apps
├── components-dev/            # Dev app per component (yarn run dev:<component-name>)
├── e2e/                       # App that mounts every component's e2e.ts scenarios for Playwright
├── angular-luxon-adapter/     # Luxon date adapter
├── angular-moment-adapter/    # Moment date adapter
├── schematics/                # ng-add and ng-update migrations, shipped inside @koobiq/components
├── cli/                       # Release management CLI (@koobiq/cli)
└── mcp/                       # MCP server (@koobiq/mcp) — serves this repository's API, guides and examples to a coding agent
apps/docs/                     # Documentation site (koobiq.io): Angular SSR + prerender
tools/                         # Build, lint, docs and release tooling; tools/public_api_guard holds the API golden files
docs/guides/                   # Contributor guides (testing, releasing) and the guide pages of the docs site
```

## Component Structure Pattern

Each component follows this structure, for example:

```
packages/components/<component-name>/
├── <component-name>.ts                   # Main component (older components: <component-name>.component.ts)
├── <component-name>.module.ts            # Kbq<Name>Module — NgModule re-exporting the standalone pieces (legacy support; newer dirs name it module.ts)
├── <component-name>.spec.ts              # Unit tests (Vitest)
├── e2e.ts                                # E2e<Name><Scenario> components mounted by the e2e app
├── e2e.playwright-spec.ts                # Visual regression tests (Playwright)
├── __screenshots__/                      # Playwright baselines (Linux, threshold 0) — regenerate only via Docker or /approve-snapshots
├── <component-name>.scss                 # Base styles
├── <component-name>-tokens.scss          # Component CSS custom properties, mapped to the global --kbq-* design tokens
├── _<component-name>-theme.scss          # Theme mixins consuming the tokens
├── <component-name>.{en,ru}.mdx          # Overview page of the docs site — both languages are mandatory
├── examples.<component-name>.{en,ru}.mdx # Examples tab of the docs site
├── public-api.ts                         # Public exports
├── index.ts                              # Entry point (re-exports public-api)
└── ng-package.json                       # Makes the directory a secondary entry point
```

Cross-entry-point imports go through the `@koobiq/components/<name>` alias mapped in the root `tsconfig.json`, never through relative paths into another component's directory. A nested entry point such as `scrollbar/deprecated` carries its own `ng-package.json` and alias.

A new component touches more than its directory: the alias in `tsconfig.json`, the API guard list in `tools/api-extractor/config.json`, a `dev-<name>` project in `angular.json` plus a `dev:<name>` script in `package.json`, an `export *` of its `e2e.ts` in `packages/e2e/scenarios.ts`, the docs navigation in `apps/docs/src/app/structure.ts`, and an examples folder under `packages/docs-examples/components/<name>/`. The commit scope needs nothing: the enum is built from the directory names.

## Common Commands

### Build

```bash
yarn run build:components              # Build main components library
yarn run build:components-experimental # Build experimental components
yarn run build:angular-luxon-adapter   # Build Luxon date adapter
yarn run build:angular-moment-adapter  # Build Moment date adapter
yarn run build:cli                     # Build release management CLI
yarn run build:schematics              # Build Angular CLI schematics
yarn run build:mcp                     # Build the MCP server: regenerate index.json/examples.json, compile src → dist, assemble dist/mcp
yarn run build:mcp:data                # Regenerate the committed guides.json and history.json (run by the release pipeline, not in CI)
yarn run check-mcp-data                # Gate: packages/mcp/data/guides.json not behind docs/guides (no git needed)
yarn run styles:build-all              # Compile all SCSS into dist/scss-compiled and the prebuilt themes into dist/components/prebuilt-themes
yarn run docs                          # Build every package, generate docs content and examples, then serve the docs site
yarn run docs:build                    # Build docs app for production (prerendered)
```

Libraries are built by the custom `@koobiq/builders:packager` builder around ng-packagr. It replaces the `{{VERSION}}` and `{{NG_VERSION}}` placeholders in the package manifests and in `packages/components/core/version.ts`; `{{NG_VERSION}}` comes from `requiredAngularVersion` in the root `package.json`. Never hardcode a version in those files.

The docs app resolves `@koobiq/*` from `dist/` (see `apps/docs/tsconfig.app.json`), so rebuild the libraries before `docs:build`, and again after changing a component you want to see on the site. `yarn run docs` runs the whole chain in the right order.

### Development

```bash
yarn run "dev:<COMPONENT_NAME>" # Start dev server for specific component on http://localhost:3003 (e.g., yarn run dev:button)
yarn run dev:all                # Every component in one app
yarn run dev:e2e                # The e2e app on http://localhost:4200 with navigation and source maps
yarn run serve:e2e              # Build dev-e2e in its production configuration and serve dist/e2e — what Playwright starts (builds once; restart it after a change)
yarn run ssr:dev                # SSR dev app; `ssr:build` is what CI runs to prove the library renders on the server
```

A dev app lives in `packages/components-dev/<name>/` (`main.ts`, `module.ts`, `template.html`, `styles.scss`) and usually embeds the component's docs examples module and its `e2e.ts` scenarios.

### Testing

There are two types of test files per component:

- `*.spec.ts` — Vitest unit tests
- `*.playwright-spec.ts` — Playwright E2E / visual regression tests

```bash
# Unit tests (Vitest)
yarn run styles:build-all # CI does this before the unit suites; do the same before a full local run
yarn run unit:all         # Every suite in one Vitest run: the `angular`, `node` and `mcp` projects of vitest.config.mts
yarn run unit:components  # Run component unit tests
yarn run unit:components-experimental
yarn run unit:angular-luxon-adapter
yarn run unit:angular-moment-adapter
yarn run unit:schematics # Run schematics tests
yarn run unit:cli
yarn run unit:koobiq-docs            # Docs app specs
yarn run unit:tools                  # Specs under tools/
yarn run unit:mcp                    # MCP server, everything that does not need a built @koobiq/components (regenerates its own index first)
yarn run unit:mcp:dts                # The MCP specs that need a build: the live reader and the tools built on it, the .d.ts parser check, and the stdio smoke test (dist/mcp)
yarn run check-spec-types            # Type-check the specs, which Vitest compiles unchecked (part of the lint gate)
npx vitest run "<TEST_PATH_PATTERN>" # Run specific tests (e.g., npx vitest run packages/components/button/button.component.spec.ts)
npx vitest run "<TEST_PATH_PATTERN>" -t "<test name pattern>"

# E2E tests (Playwright)
yarn run e2e:setup                        # Install Playwright browsers (run once)
yarn run e2e:components                   # Run all component E2E tests
yarn run e2e:docs                         # Run the docs site smoke suite (needs `yarn run docs:build` first)
npx playwright test "<TEST_PATH_PATTERN>" # Run specific E2E tests (e.g., npx playwright test packages/components/button/e2e.playwright-spec.ts)
yarn run check-e2e-types                  # Type-check the Playwright specs (part of the lint gate)

# Screenshots differ across operating systems — always use Docker for anything visual:
yarn run e2e:docker                                                                    # Run E2E tests in Docker (matches CI)
yarn run e2e:docker:update-snapshots                                                   # Run E2E tests in Docker and update the baselines
yarn run e2e:docker yarn playwright test packages/components/select -g "single select" # One spec inside the container
```

How specs are written and how screenshots stay stable is in [unit-tests.md](.claude/rules/unit-tests.md) and [e2e.md](.claude/rules/e2e.md).

### Linting

```bash
yarn run eslint                                                        # Lint TypeScript/HTML
yarn run stylelint                                                     # Lint SCSS
yarn run prettier                                                      # Check formatting
yarn run cspell                                                        # Spell-check Markdown (dictionaries in tools/cspell-locales/{en,ru}.json)
yarn run check-peer-deps                                               # Validate peerDependencies of the published packages
yarn run check-tokens-data                                             # Verify the design tokens docs data matches the installed @koobiq/design-tokens
yarn run eslint:fix && yarn run stylelint:fix && yarn run prettier:fix # Auto-fix all
```

CI runs ESLint and stylelint with `--max-warnings=0`, so a warning fails the build. Formatting is prettier with 120 columns, 4-space indent, single quotes and no trailing commas, plus the `organize-imports`, `multiline-arrays` and `sh` plugins — let it order imports and break arrays rather than fighting it. The `sh` plugin formats shell scripts, the Dockerfile, husky hooks, ignore files and the shell snippets in Markdown. Quote placeholders in those snippets (`--project "<your project>"`): unquoted, `<` and `>` are redirects, and the plugin either rewrites the command or silently skips the block.

### API Management

After making changes to the package's public API, you must update the API snapshot files:

```bash
yarn run check-api                       # Verify public API hasn't changed unexpectedly (CI)
yarn run approve-api                     # Approve API changes (updates tools/public_api_guard/**/*.api.md files)
yarn run approve-api "components/<name>" # Approve a single entry point
yarn run check-public-api-any            # Ratchet on `any` / `unknown` in the published type surface (CI)
yarn run approve-public-api-any          # Record the new counts after removing `any` — the ratchet fails in both directions
yarn run check-api-docs                  # Ratchet on public members with no description, read from the `docs:api-gen` manifest (CI)
yarn run approve-api-docs                # Record the new counts after adding descriptions — the ratchet fails in both directions
yarn run docs:generate-llms              # Regenerate the committed apps/docs/src/llms.txt and the Markdown for agents in dist/docs-llms
yarn run check-llms                      # Fail on a stale llms.txt or on Markdown for agents that is incomplete or not plain Markdown (CI)
yarn run check-typings                   # Type-check the typings of every published package in dist/ with skipLibCheck off (CI)
```

The guard reads the flattened typings ng-packagr writes to `dist/components/types/koobiq-components-<name>.d.ts` (a nested entry point such as `scrollbar/deprecated` becomes `koobiq-components-scrollbar-deprecated.d.ts`), so build the package first; a stale `dist/` produces a wrong golden file. Only the entry points listed in `tools/api-extractor/config.json` are guarded. Adding a JSDoc comment to a public member also changes its golden file (the `(undocumented)` marker goes away).

## CI Gates

Every pull request runs these workflows:

| Workflow                          | What it runs                                                                                                                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linters                           | `cspell`, `prettier`, `stylelint --max-warnings=0`, `eslint --max-warnings=0`, `check-peer-deps`, `check-e2e-types`, `check-spec-types`, `check-tokens-data`                              |
| Unit tests                        | `styles:build-all`, then the `angular` and `node` projects of `vitest.config.mts` (not the `mcp` one — that is `mcp.yml`)                                                                 |
| MCP                               | `build:components` and `build:mcp` on their own — not the full `build-packages` action, which also builds things no mcp spec reads — then `check-mcp-data`, `unit:mcp` and `unit:mcp:dts` |
| E2E tests                         | `e2e:docker` (component screenshots) and `e2e:docs` (docs smoke)                                                                                                                          |
| API                               | build the packages, then `check-typings`, `check-api`, `check-public-api-any`, `docs:api-gen`, `check-api-docs` and `check-llms`                                                          |
| Build                             | build the packages, `check-npm-resolution` (npm rejects peer conflicts that Yarn only warns about), build the docs, `ssr:build`                                                           |
| Commitlint                        | the PR **title** must be a valid conventional commit — it becomes the squash commit and drives the release-notes label                                                                    |
| License validation, Audit, CodeQL | `validate:license`, `yarn npm audit` (exceptions live in `.yarnrc.yml`, each with a justification), CodeQL                                                                                |

A docs preview is deployed to Firebase for pull requests opened from this repository.

A pull request that conflicts with `main` gets no check runs at all: rebase it rather than waiting. When CI fails on a file the branch did not change, look at `main`'s own runs first: pull requests merge on old green checks, so `main` can be red.

## Architecture Notes

The details of each area live in the rule files listed under [Agent Rules](#agent-rules).

### Library packaging

- `@koobiq/components` has an empty root barrel; consumers import from `@koobiq/components/<name>`. `core` is the shared entry point: common behaviors (`disabled`, `color`, `tabindex`, `error-state`), a11y, keycodes, datetime and formatters, forms, locales, overlay helpers (panel width and height resolvers, scroll strategies), the pop-up base classes, option and selection models, theme configuration and stores, the testing helpers, utils and validators.
- Supported release lines: `main` is `21.x`; `20.4.x` (the 20 line), `19.x` and `18.x` have their own branches and receive backports. Releases are cut by maintainers with `yarn run release:stage:commit`; the tag push publishes the packages listed under `release.packages` in the root `package.json` (see `docs/guides/05-releasing-packages.md`). A maintenance branch runs push CI from its own copies of the workflows, so it is added to `push.branches` on that branch, not on `main`.

### Localization and accessibility text

- Locale data lives in `packages/components/core/locales/<locale>.ts`; `ru-RU` provides the defaults. Each section has an `InjectionToken` (`KBQ_A11Y_LOCALE_CONFIGURATION`, `KBQ_SELECT_LOCALE_CONFIGURATION`, ...), a `kbqInject<Section>LocaleConfiguration()` helper that returns a signal following the active locale, and a `kbq<Section>LocaleConfigurationProvider()` for partial overrides.
- Component-provided default ARIA text comes from `kbqInjectA11yLocaleConfiguration()`; do not hardcode strings.

### SSR

- `KBQ_WINDOW` from `@koobiq/components/core` and Angular's `DOCUMENT` replace the globals. ESLint's `no-restricted-globals` bans `window`, `document`, `navigator`, `localStorage`, `requestAnimationFrame`, `getComputedStyle`, `matchMedia` and the rest of that family in `packages/components`; specs and e2e code are exempt.

## Conventions

- Commits and PR titles follow `type(scope): subject` (conventional commits, header at most 120 characters). Scopes are the directory names under `apps/` and `packages/components/` plus `core`, `components`, `experimental`, `schematics`, `cli`, `e2e`, `examples`, `dev`, `deps`, `deps-dev` and the rest of the list in the commitlint config at the repo root. Tracker references go in the subject as `(#DS-1234)`, for example `fix(select): panel scrolling in Safari (#DS-3299)`.
- Public symbols are prefixed `Kbq` (classes, enums, interfaces), `kbq` (functions, directive attributes, CSS classes) or `KBQ_` (injection tokens); selectors are `kbq-<name>` or `[kbq-<name>]`.
- Code comments and commit messages are written in English; user-facing documentation exists in English and Russian.
- Fill the PR template: summary, list of notable changes, what reviewers should focus on.
- Do not name a branch `test/<name>`: origin has a plain `test` branch, so git rejects the push of a nested ref.
- After a rebase, check what git merges silently: a `####` subsection of `docs/guides/migration.{en,ru}.mdx` still sits under its own `###` step (the look-alike subsections of another step match as context), and no `var()` is left pointing at a token that upstream removed.

## Agent Rules

- This file holds what applies to any task. A rule about some files only goes to `.claude/rules/<topic>.md`, with the globs it covers in a `paths` frontmatter list: Claude Code loads it once it reads or edits a matching file, so it costs no context before.
- List each rule file in the table below with a plain Markdown link, so that agents that read only this file can open it. An `@` import would load the file at startup.
- A rule a linter can check goes to its config (`eslint.config.js`, `.stylelintrc.js`, the commitlint config, cspell); the text keeps only the reason.
- Write rules in English, one per bullet, each with its reason, and keep every rule in one place.
- Claude Code reads this file natively from version 2.1.277 and stops doing so as soon as a `CLAUDE.md` or `CLAUDE.local.md` exists in the repository or a directory above it: add neither here, and keep personal notes in `~/.claude/CLAUDE.md`, which does not count.

| Rule file                                              | Applies to                                                                       |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| [components.md](.claude/rules/components.md)           | TypeScript of `packages/components`: packaging, typings, JSDoc, Angular patterns |
| [overlays.md](.claude/rules/overlays.md)               | Overlays, panels, lists and selection models                                     |
| [styles.md](.claude/rules/styles.md)                   | SCSS and theming                                                                 |
| [unit-tests.md](.claude/rules/unit-tests.md)           | Vitest specs                                                                     |
| [e2e.md](.claude/rules/e2e.md)                         | `e2e.ts` scenarios, Playwright specs and baselines                               |
| [docs.md](.claude/rules/docs.md)                       | MDX pages, the docs app and its pipeline                                         |
| [docs-examples.md](.claude/rules/docs-examples.md)     | Docs examples and dev apps                                                       |
| [generated-files.md](.claude/rules/generated-files.md) | Committed generated files and how to regenerate them                             |
| [schematics.md](.claude/rules/schematics.md)           | `ng add` and `ng update` migrations                                              |
| [deps.md](.claude/rules/deps.md)                       | Dependencies, patches, tsconfigs and licenses                                    |
| [release.md](.claude/rules/release.md)                 | Release CLI                                                                      |
| [adapters.md](.claude/rules/adapters.md)               | Luxon and Moment date adapters                                                   |

## Best Practices

<!-- Adapted from Angular team recommendations: https://v20.angular.dev/assets/context/best-practices.md -->

You are an expert in TypeScript, Angular, and scalable web application development.

### TypeScript Best Practices

- `strictNullChecks` and `strictFunctionTypes` are on but `noImplicitAny` is off, so a parameter without a type annotation silently becomes `any`: annotate parameters, and rely on inference where the type is obvious
- Avoid `any`, and use `unknown` for a value of uncertain type — but not in published declarations: `check-public-api-any` counts both and fails when a package's count grows, so give new public members concrete or generic types
- Prefer `readonly` where appropriate (e.g., signals, injections)
- Use `protected` for template bindings

### Angular Best Practices

- Components and directives are standalone; each entry point's `Kbq<Name>Module` only re-exports them for NgModule consumers
- Don't write `standalone: true` in Angular decorators; it has been the default since Angular 19
- Use signals for state management
- Put host bindings and listeners in the `host` object of the `@Component` or `@Directive` decorator, not in `@HostBinding` / `@HostListener`
- Use `NgOptimizedImage` for all static images (does not work for inline base64 images).

### Accessibility Requirements

- Components, docs examples and the docs site must pass all AXE checks and meet WCAG AA, including focus management, color contrast, and ARIA attributes.

### Components

- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Form controls are used with both reactive and template-driven forms, and the docs examples show both
- Use `class` bindings instead of `ngClass`
- Use `style` bindings instead of `ngStyle`
- When using external templates/styles, use paths relative to the component TS file.
- When a projected child depends on its host component, inject a narrow `InjectionToken` scoped to the members it uses, not the host's concrete class.

### Form Validation

- Use `ErrorStateMatcher` to control **when** errors are shown

### Templates

- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

### Services

- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

### Comments

- Prefer clear naming and structure over comments. Add concise comments only to explain non-obvious rationale or constraints; never restate the code
- Use `/** JSDoc */` for user-facing public API documentation and `//` for implementation comments. Omit details apparent from names, types, or signatures
- Don't commit commented-out code or comments describing change history
- Update or remove comments that become outdated because of your changes
