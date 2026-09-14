# check-angular-22

A throwaway Angular 22 application that consumes `@koobiq/components` the way a real project does —
from a packed tarball, not from source. It exists because the library itself builds against the
Angular version pinned in the root `package.json`, so none of the repository's own gates can tell
whether the published package still works on a newer Angular major.

Not wired into any yarn script or CI workflow: it has its own npm dependency tree and is run by hand.

## What it asserts

`src/app/silent-breaks.spec.ts` — the two regressions that fail with no error at all:

- `KbqTrim` still trims, now that Angular resolves `NgControl.valueAccessor` lazily.
- An explicit `[panelWidth]="0"` still reaches the overlay pane. Note the binding: a static
  `panelWidth="0"` passes the string `'0'`, which is truthy, and was never affected.

`src/app/removed-api.spec.ts` — the APIs removed from `@angular/core` 22. Importing the modal and
tabs entry points is most of the assertion: the published bundles referenced `ComponentFactoryResolver`
by name, so the consumer's build failed outright. Rendering them additionally covers what that API was
doing — the modal's dynamic component creation, including both of its injectors, and the tab body's
portal outlet.

`src/app/app.ts` renders the same four paths, for looking at them in a browser.

## Running it

```bash
# 1. build and pack the library from the repository root
yarn run build:components
cd dist/components && npm pack && cd ../..

# 2. install this application, then the packed library on top
cd tools/check-angular-22
npm install
npm install ../../dist/components/koobiq-components-<version>.tgz

# 3. the assertions, and optionally the page
npm test
npm start
```

`@koobiq/components` is deliberately absent from `package.json`: the point is to install the build
under test, and pinning it here would hide which one that was.

## Reading a failure

A failure in `removed-api.spec.ts` usually shows up one step earlier, as a bundling error rather than a
failing assertion — `No matching export in "…/@angular/core/…/core.mjs" for import "…"`. That is
the expected shape of a removed-API break, and it names the symbol.

The two specs in `silent-breaks.spec.ts` pass on Angular 20 whether or not the library carries the
corresponding fix, so they are only meaningful here.

## Limits

A green run proves that these four paths work. It is not a compatibility statement about the library:
it exercises four entry points out of roughly sixty, and covers neither SSR, nor the visual regression
suite, nor the rest of the CDK surface.

It also says nothing about zoneless applications. The library awaits `zone.onStable` in autocomplete,
datepicker, dropdown and select, so `provideZoneChangeDetection()` in `src/app/app.config.ts` is load
bearing, and an application without it is outside what this checks.
