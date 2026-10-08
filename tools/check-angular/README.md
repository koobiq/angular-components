# check-angular

A consumer application for `@koobiq/components`, installed the way a real project gets it: from the packed
tarballs of `dist/`, not from source. The library builds against the Angular of the root `package.json` and is
tested in its own zoneless TestBed, so none of the repository's gates show how the published package behaves in an
application that bootstraps differently.

It is a separate npm project with its own Angular, not wired into any yarn script or CI workflow, and run by hand.
Its sources are excluded from the repository's ESLint, stylelint and Vitest.

## Configurations

One Angular workspace, three applications that render the same scenarios from `shared/`:

| Project           | Change detection                 | `@angular/animations`                                                    |
| ----------------- | -------------------------------- | ------------------------------------------------------------------------ |
| `zoneless`        | `provideZonelessChangeDetection` | not provided                                                             |
| `zone`            | `provideZoneChangeDetection`     | not provided                                                             |
| `zone-animations` | `provideZoneChangeDetection`     | `provideAnimations()`, with the application's own triggers around Koobiq |

## What it asserts

- `scripts/check-bundles.mjs` — the production builds: the library pulls in neither zone.js nor
  `@angular/animations`, so `zoneless` bundles neither, `zone` only zone.js and `zone-animations` both.
- `shared/scenarios/smoke.suite.ts` — each application runs the change detection it claims, and a Koobiq component
  renders and re-renders.
- `shared/scenarios/<name>.suite.ts` — per component, what a user does with it: opening and closing, the keyboard,
  focus, values and events. Each suite runs in all three applications, through `src/<name>.spec.ts` of each
  project.
- `projects/zone-animations/src/legacy-triggers.spec.ts` — an application's own `@angular/animations` triggers
  around Koobiq components and inside their projected content.

## Running it

```bash
# 1. build the packages from the repository root
yarn run build:components
yarn run build:angular-luxon-adapter

# 2. install this application, then the packed packages on top of it
cd tools/check-angular
npm install
npm run install:library

# 3. everything: the three builds, the bundle check and the three suites
npm run check

# or one application
npx ng test zoneless --watch=false
npx ng serve zone
```

`@koobiq/components` is deliberately absent from `package.json`: `install:library` packs and installs whatever
`dist/` holds, so the run tests that build and says so in its output.

## Writing a scenario

- The component goes into `shared/scenarios/<name>.ts` and is rendered by `shared/app.ts`; its suite goes into
  `shared/scenarios/<name>.suite.ts` and renders it through `renderScenario` with the configuration's providers.
- Test-only code that more than one suite shares goes into `shared/scenarios/<name>.helpers.ts`: the applications
  build `shared/` without `*.suite.ts` and `*.helpers.ts`.
- A test that fails because of the library stays as the right expectation, wrapped in `it.fails` in the applications
  where it fails, with a `// Library bug:` comment naming the mechanism. Once the library is fixed the `it.fails`
  itself fails, which is the cue to unwrap it.
- Run one scenario in one application with `npx ng test zone --watch=false --include="**/<name>.spec.ts"`.
- The suites run in jsdom, without layout. Assert what a user would see change — the DOM, ARIA, focus, values and
  events — rather than geometry.
- `await fixture.whenStable()` after every interaction: in the zoneless application nothing renders on its own.
- Keep every inline style of a file different. `@angular/build` 21.2.x leaks an esbuild context for identical inline
  styles of several components in one file, and `ng build` then never exits.

## Limits

A green run shows these scenarios working in these three setups. It covers neither SSR nor the visual regression
suite, and jsdom has neither layout nor the Web Animations API.
