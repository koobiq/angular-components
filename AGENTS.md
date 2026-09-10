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
├── components-experimental/   # @koobiq/components-experimental — empty barrel in v20, kept so sub-packages can land later
├── docs-examples/             # Live examples rendered by the docs site and reused by the dev apps
├── components-dev/            # Dev app per component (yarn run dev:<component-name>)
├── e2e/                       # App that mounts every component's e2e.ts scenarios for Playwright
├── angular-luxon-adapter/     # Luxon date adapter
├── angular-moment-adapter/    # Moment date adapter
├── schematics/                # ng-add and ng-update migrations, shipped inside @koobiq/components
└── cli/                       # Release management CLI (@koobiq/cli)
apps/docs/                     # Documentation site (koobiq.io): Angular SSR + prerender
tools/                         # Build, lint, docs and release tooling; tools/public_api_guard holds the API golden files
docs/guides/                   # Contributor guides (testing, releasing) and the guide pages of the docs site
```

## Component Structure Pattern

Each component follows this structure, for example:

```
packages/components/<component-name>/
├── <component-name>.ts                  # Main component (older components: <component-name>.component.ts)
├── <component-name>.module.ts           # Kbq<Name>Module — NgModule re-exporting the standalone pieces (legacy support; newer dirs name it module.ts)
├── <component-name>.spec.ts             # Unit tests (Jest)
├── e2e.ts                               # E2e<Name><Scenario> components mounted by the e2e app
├── e2e.playwright-spec.ts               # Visual regression tests (Playwright)
├── __screenshots__/                     # Playwright baselines (Linux, threshold 0) — regenerate only via Docker or /approve-snapshots
├── <component-name>.scss                # Base styles
├── <component-name>-tokens.scss         # Component CSS custom properties, mapped to the global --kbq-* design tokens
├── _<component-name>-theme.scss         # Theme mixins consuming the tokens
├── <component-name>.{en,ru}.md          # Overview page of the docs site — both languages are mandatory
├── examples.<component-name>.{en,ru}.md # Examples tab of the docs site
├── public-api.ts                        # Public exports
├── index.ts                             # Entry point (re-exports public-api)
└── ng-package.json                      # Makes the directory a secondary entry point
```

Cross-entry-point imports go through the `@koobiq/components/<name>` alias mapped in the root `tsconfig.json`, never through relative paths into another component's directory. A nested entry point such as `scrollbar/deprecated` carries its own `ng-package.json` and alias.

A new component touches more than its directory: the alias in `tsconfig.json`, the API guard list in `tools/api-extractor/config.json`, a `dev-<name>` project in `angular.json` plus a `dev:<name>` script in `package.json`, the route list in `packages/e2e/routes.ts`, the docs navigation in `apps/docs/src/app/structure.ts`, and an examples folder under `packages/docs-examples/components/<name>/`. The commit scope needs nothing: the enum is built from the directory names.

## Common Commands

### Build

```bash
yarn run build:components               # Build main components library
yarn run build:components-experimental  # Build experimental components
yarn run build:angular-luxon-adapter    # Build Luxon date adapter
yarn run build:angular-moment-adapter   # Build Moment date adapter
yarn run build:cli                      # Build release management CLI
yarn run build:schematics               # Build Angular CLI schematics
yarn run styles:build-all               # Compile all SCSS into dist/scss-compiled and the prebuilt themes into dist/components/prebuilt-themes
yarn run docs                           # Build every package, generate docs content and examples, then serve the docs site
yarn run docs:build                     # Build docs app for production (prerendered)
```

Libraries are built by the custom `@koobiq/builders:packager` builder around ng-packagr. It replaces the `{{VERSION}}` and `{{NG_VERSION}}` placeholders in the package manifests and in `packages/components/core/version.ts`; `{{NG_VERSION}}` comes from `requiredAngularVersion` in the root `package.json`. Never hardcode a version in those files.

The docs app resolves `@koobiq/*` from `dist/` (see `apps/docs/tsconfig.app.json`), so rebuild the libraries before `docs:build`, and again after changing a component you want to see on the site. `yarn run docs` runs the whole chain in the right order.

### Development

```bash
yarn run dev:<COMPONENT_NAME>      # Start dev server for specific component on http://localhost:3003 (e.g., yarn run dev:button)
yarn run dev:all                   # Every component in one app
yarn run dev:e2e                   # The e2e app on http://localhost:4200 — the same server Playwright starts
yarn run ssr:dev                   # SSR dev app; `ssr:build` is what CI runs to prove the library renders on the server
```

A dev app lives in `packages/components-dev/<name>/` (`main.ts`, `module.ts`, `template.html`, `styles.scss`) and usually embeds the component's docs examples module and its `e2e.ts` scenarios.

### Testing

There are two types of test files per component:

- `*.spec.ts` — Jest unit tests
- `*.playwright-spec.ts` — Playwright E2E / visual regression tests

```bash
# Unit tests (Jest)
yarn run styles:build-all          # CI does this before the unit suites; do the same before a full local run
yarn run unit:components           # Run component unit tests
yarn run unit:components-experimental
yarn run unit:angular-luxon-adapter
yarn run unit:angular-moment-adapter
yarn run unit:schematics           # Run schematics tests
yarn run unit:cli
yarn run unit:koobiq-docs          # Docs app specs
yarn run unit:tools                # Specs under tools/
npx jest <TEST_PATH_PATTERN>       # Run specific Jest tests (e.g., npx jest packages/components/button/button.component.spec.ts)
npx jest <TEST_PATH_PATTERN> -t "<test name pattern>"

# E2E tests (Playwright)
yarn run e2e:setup                      # Install Playwright browsers (run once)
yarn run e2e:components                 # Run all component E2E tests
yarn run e2e:docs                       # Run the docs site smoke suite (needs `yarn run docs:build` first)
npx playwright test <TEST_PATH_PATTERN> # Run specific E2E tests (e.g., npx playwright test packages/components/button/e2e.playwright-spec.ts)
yarn run check-e2e-types                # Type-check the Playwright specs (part of the lint gate)

# Screenshots differ across operating systems — always use Docker for anything visual:
yarn run e2e:docker                     # Run E2E tests in Docker (matches CI)
yarn run e2e:docker:update-snapshots    # Run E2E tests in Docker and update the baselines
yarn run e2e:docker yarn playwright test packages/components/select -g "single select"   # One spec inside the container
```

The committed baselines under `__screenshots__` are compared with `threshold: 0` and have no
platform suffix, so a native run outside Linux fails on font rasterization alone. `e2e:components`
is still useful for the assertion-based specs; use `e2e:docker` whenever screenshots are involved,
and never regenerate a baseline any other way. Without a local Docker, comment `/approve-snapshots`
on the pull request. The container runs with `CI=true`, so `test.only` is rejected. Retries are 0
everywhere, CI included, so a flaky test fails the run and is named; set `PLAYWRIGHT_RETRIES=<n>` to
absorb a known flake and `PLAYWRIGHT_WORKERS=<n>` to change the worker cap. `@playwright/test` is
pinned exactly because a patch release can change the bundled Chromium and invalidate every
baseline — upgrade it on its own branch and refresh the baselines in the same PR.

Jest setup (`jest.config.js`, `tools/jest/setup.ts`) that shapes how specs are written:

- `jest-fail-on-console` is on: any `console.error` or `console.warn` during a test fails it.
- `jest-axe` is registered, so `expect(element).toHaveNoViolations()` is available in every spec.
- `testTimeout` is 2 seconds; `clearMocks` and `resetModules` are on.
- Event and typing helpers (`dispatchFakeEvent`, `dispatchKeyboardEvent`, `dispatchMouseEvent`, `typeInElement`, ...) are exported from `@koobiq/components/core`.
- Test host components carry no `Kbq` prefix (`TestApp`, `BasicSelect`); lint does not check this.

Playwright specifics (`playwright.config.ts`, `docs/guides/06-testing.md`): the per-test timeout is 15 seconds, and screenshot flakes almost always come from shooting before the state has settled — assert the settled state first. `docs/e2e-flakiness.md` records the mechanisms found so far; the helpers in `packages/e2e/utils` (for example `e2eWaitForSettledScrollbars`) exist for that.

### Linting

```bash
yarn run eslint                                                         # Lint TypeScript/HTML
yarn run stylelint                                                      # Lint SCSS
yarn run prettier                                                       # Check formatting
yarn run cspell                                                         # Spell-check Markdown (dictionaries in tools/cspell-locales/{en,ru}.json)
yarn run check-peer-deps                                                # Validate peerDependencies of the published packages
yarn run eslint:fix && yarn run stylelint:fix && yarn run prettier:fix  # Auto-fix all
```

CI runs ESLint and stylelint with `--max-warnings=0`, so a warning fails the build. Formatting is prettier with 120 columns, 4-space indent, single quotes and no trailing commas, plus the `organize-imports` and `multiline-arrays` plugins — let it order imports and break arrays rather than fighting it.

### API Management

After making changes to the package's public API, you must update the API snapshot files:

```bash
yarn run check-api                       # Verify public API hasn't changed unexpectedly (CI)
yarn run approve-api                     # Approve API changes (updates tools/public_api_guard/**/*.api.md files)
yarn run approve-api components/<name>   # Approve a single entry point
yarn run check-public-api-any            # Ratchet on `any` / `unknown` in the published type surface (CI)
yarn run approve-public-api-any          # Record the new counts after removing `any` — the ratchet fails in both directions
```

The guard reads `dist/components/<name>/index.d.ts`, so build the package first; a stale `dist/` produces a wrong golden file. Only the entry points listed in `tools/api-extractor/config.json` are guarded. Adding a JSDoc comment to a public member also changes its golden file (the `(undocumented)` marker goes away).

## CI Gates

Every pull request runs these workflows:

| Workflow                          | What it runs                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Linters                           | `cspell`, `prettier`, `stylelint --max-warnings=0`, `eslint --max-warnings=0`, `check-peer-deps`, `check-e2e-types`             |
| Unit tests                        | `styles:build-all`, then every `unit:*` script                                                                                  |
| E2E tests                         | `e2e:docker` (component screenshots) and `e2e:docs` (docs smoke)                                                                |
| API                               | build the packages, then `check-api` and `check-public-api-any`                                                                 |
| Build                             | build the packages, `check-npm-resolution` (npm rejects peer conflicts that Yarn only warns about), build the docs, `ssr:build` |
| Commitlint                        | the PR **title** must be a valid conventional commit — it becomes the squash commit and drives the release-notes label          |
| License validation, Audit, CodeQL | `validate:license`, `yarn npm audit` (exceptions live in `.yarnrc.yml`, each with a justification), CodeQL                      |

A docs preview is deployed to Firebase for pull requests opened from this repository.

## Architecture Notes

### Library packaging

- `@koobiq/components` has an empty root barrel; consumers import from `@koobiq/components/<name>`. `core` is the shared entry point: common behaviors (`disabled`, `color`, `tabindex`, `error-state`), a11y, keycodes, datetime and formatters, forms, locales, overlay helpers (panel width and height resolvers, scroll strategies), the pop-up base classes, option and selection models, theme configuration and stores, the testing helpers, utils and validators.
- Every component keeps a `Kbq<Name>Module` that imports and re-exports its standalone components and directives. A new directive has to be added there too, or NgModule consumers will not see it.
- Published packages depend only on `tslib` at runtime; everything else is a peer dependency. `check-peer-deps` and `check-npm-resolution` guard the ranges because Yarn tolerates peer conflicts that npm rejects for consumers.
- Supported release lines: `main` is `20.x`; `19.x` and `18.x` have their own branches and receive backports. Releases are cut by maintainers with `yarn run release:stage:commit`; the tag push publishes the packages listed under `release.packages` in the root `package.json` (see `docs/guides/05-releasing-packages.md`).

### Styling and theming

- Components use `ViewEncapsulation.None` with `kbq-`-prefixed classes. Stylelint enforces the prefix (`dev-`, `e2e-`, `example-`, `docs-` in the other packages; `cdk-` and `ng-` always allowed) and kebab-case mixin names.
- `<name>-tokens.scss` declares the component's `--kbq-<name>-*` custom properties in terms of the global `--kbq-*` tokens from `@koobiq/design-tokens`; `_<name>-theme.scss` consumes them. A component-specific look is expressed by redefining that component's tokens, not by editing the shared theme mixins.
- `packages/components/_index.scss` forwards `core`, the theming API and `_koobiq-theme.scss`, whose `koobiq-theme()` and `koobiq-typography()` mixins aggregate the global (directive-level) themes. `styles:build-all` compiles every SCSS file to `dist/scss-compiled` and copies the prebuilt light, dark and combined themes into `dist/components/prebuilt-themes`, which is what the package `exports` expose.

### Localization and accessibility text

- Locale data lives in `packages/components/core/locales/<locale>.ts`; `ru-RU` provides the defaults. Each section has an `InjectionToken` (`KBQ_A11Y_LOCALE_CONFIGURATION`, `KBQ_SELECT_LOCALE_CONFIGURATION`, ...), a `kbqInject<Section>LocaleConfiguration()` helper that returns a signal following the active locale, and a `kbq<Section>LocaleConfigurationProvider()` for partial overrides.
- Component-provided default ARIA text comes from `kbqInjectA11yLocaleConfiguration()`; do not hardcode strings.

### SSR

- `KBQ_WINDOW` from `@koobiq/components/core` and Angular's `DOCUMENT` replace the globals. ESLint's `no-restricted-globals` bans `window`, `document`, `navigator`, `localStorage`, `requestAnimationFrame`, `getComputedStyle`, `matchMedia` and the rest of that family in `packages/components`; specs and e2e code are exempt.

### E2E wiring

- `packages/components/<name>/e2e.ts` exports standalone `E2e<Name><Scenario>` components with a `data-testid` host attribute and an inner `data-testid="e2eScreenshotTarget"` for screenshots. Each class is imported into `packages/e2e/routes.ts` and becomes a route whose path is the class name, so a spec navigates with `page.goto('/E2eButtonStateAndStyle')`.
- Specs locate everything by test id, take the light screenshot, call `e2eEnableDarkTheme(page)` and take the dark one; baselines are named `NN-light.png` / `NN-dark.png` (and `NN-rtl.png` where relevant).
- Selectors, class names and exported symbols in e2e code use the `e2e` prefix (lint-enforced); dev apps use `dev`, the docs app `docs`.

### Documentation pipeline

- Page content is Markdown next to the code: `<name>.{en,ru}.md` (overview), `examples.<name>.{en,ru}.md` (examples tab), `docs/guides/*.{en,ru}.md` and `docs/data-grid/**`. `build:docs-content` renders them into `dist/docs-content/` and regenerates the SEO descriptions; `docs:api-gen` (`tools/api-gen`) produces the API tab. Every page exists in both languages — update both.
- `apps/docs/src/app/structure.ts` is the single source of the navigation (`hasApi`, `hasExamples`, `isNew` with an expiry date); the routes, the sitemap, the prerender route list and `llms.txt` are all derived from it.
- Examples live in `packages/docs-examples/components/<name>/<example-name>/<example-name>-example.ts` with a `/** @title ... */` JSDoc, selector `<example-name>-example` and class `<ExampleName>Example`, registered in that folder's `index.ts` NgModule. After adding or renaming one, run `yarn run build:docs-examples-module` to regenerate the committed `packages/docs-examples/example-module.ts`.
- Committed generated files — never hand-edit: `packages/docs-examples/example-module.ts`, `tools/public_api_guard/**`, `tools/check-public-api-any/baseline.json`, `apps/docs/src/llms.txt`, `apps/docs/src/llms-full.txt`, `apps/docs/src/sitemap.xml`, `apps/docs/src/prerender-routes.txt`, `apps/docs/src/app/seo-descriptions.ts`, `apps/docs/src/assets/versions.json`. The docs metadata files are refreshed by the release scripts (`release:extract-docs-meta`); leave them alone in feature branches.

### Schematics

- `packages/schematics/src/ng-add` sets up a consumer project; `src/migrations/<name>/` holds the `ng update` migrations, registered in `src/migrations.json` with the version they ship in. A breaking change to a component ships with a migration there, or at least a warning that points at the manual steps. Build with `build:schematics`, test with `unit:schematics`.

## Conventions

- Commits and PR titles follow `type(scope): subject` (conventional commits, header at most 120 characters). Scopes are the directory names under `apps/` and `packages/components/` plus `core`, `components`, `experimental`, `schematics`, `cli`, `e2e`, `examples`, `dev`, `deps`, `deps-dev` and the rest of the list in the commitlint config at the repo root. Tracker references go in the subject as `(#DS-1234)`, for example `fix(select): panel scrolling in Safari (#DS-3299)`.
- Public symbols are prefixed `Kbq` (classes, enums, interfaces), `kbq` (functions, directive attributes, CSS classes) or `KBQ_` (injection tokens); selectors are `kbq-<name>` or `[kbq-<name>]`.
- Code comments and commit messages are written in English; user-facing documentation exists in English and Russian.
- Fill the PR template: summary, list of notable changes, what reviewers should focus on.

## Best Practices

<!-- Adapted from Angular team recommendations: https://v20.angular.dev/assets/context/best-practices.md -->

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

### TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Prefer `readonly` where appropriate (e.g., signals, injections)
- Use `protected` for template bindings

### Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v19+
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images (does not work for inline base64 images).

### Server Side Rendering (SSR)

- Use `inject(KBQ_WINDOW)` instead of the global `window`

### Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
- Source all component-provided default ARIA text from `kbqInjectA11yLocaleConfiguration()`

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.
- When a projected child depends on its host component, inject a narrow `InjectionToken` scoped to the members it uses, not the host's concrete class.

### Form Validation

- Use `ErrorStateMatcher` to control **when** errors are shown

### State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

### Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

### Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

### Comments

- Prefer clear naming and structure over comments. Add concise comments only to explain non-obvious rationale or constraints; never restate the code
- Use `/** JSDoc */` for user-facing public API documentation and `//` for implementation comments. Omit details apparent from names, types, or signatures
- Do NOT commit commented-out code or comments describing change history
- Update or remove comments that become outdated because of your changes
