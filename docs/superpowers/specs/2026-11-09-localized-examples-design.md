# Localized docs examples rollout (DS-4922)

## Intent and why

The docs site already has an "examples language" picker (footer) that switches the locale of the live examples. Only 4 components — `navbar`, `app-switcher`, `filter-bar`, `notification-center` — actually localize their example text (done in DS-4306). Every other example shows hardcoded English regardless of the picker.

DS-4922 rolls this mechanism out to all examples: each example reads its user-facing strings from per-component localized data, translated for `ru-RU` and falling back to English for every other locale. The selected examples language is also persisted in the URL query string so a link can carry it.

## Goals

- Every docs example renders its user-facing strings through `injectExampleText()`, so the footer picker re-renders it.
- Only `ru-RU` is translated; other locale ids get the English `default` entry.
- The examples language is reflected in and read from the URL (`?examples-lang=<id>`).

## Non-goals

- Translating to all 5 shipped locales (only `ru-RU` + English fallback).
- Localizing library-internal strings (already covered by `kbqInject*LocaleConfiguration` / `KbqLocaleService`).
- Changing the docs interface-language mechanism (stays in the URL path `/ru/`, `/en/`).

## Anti-goals

- Breaking StackBlitz (examples must stay self-contained; the shared file must be reachable).
- Breaking SSR / prerender (localStorage is unavailable on the server).
- Duplicating the helper across ~67 component folders.

## Constraints

- StackBlitz bundles only an example's own files plus `localImportFiles` (relative imports), fetched from `dist/docs-content/examples-source/`. Relative imports that stay inside the component's own entry point (`../l10n`) are picked up automatically; an import crossing entry-point boundaries is not buildable (see Approaches).
- The generator `tools/example-module/resolve-local-imports.ts` already follows `./`, `../`, `../../` imports recursively and records them in `localImportFiles`.
- Shipped locale ids: `ru-RU` (library default), `en-US`, `es-LA`, `pt-BR`, `tk-TM`.

## Approaches considered

1. **Per-component duplicated helper (chosen).** Each component's `l10n.ts` keeps its own copy of `injectLocalizedText` (~5 lines), as DS-4306 did for its 4 components. Relative imports stay inside the component's entry point, so ng-packagr, the docs source viewer, StackBlitz and the MCP server all work unchanged. Cost: the same ~5 lines repeated per component (~67 at full rollout).
2. **Shared helper file + per-component data.** Rejected: every component folder of `docs-examples` is its own ng-packagr secondary entry point, and a relative import crossing that boundary (`../i18n`) fails `yarn run build:docs-examples` with `Cannot destructure property 'pos' of 'file.referencedFiles[index]'`. A separate `@koobiq/docs-examples/components/i18n` entry point with an alias import does build (verified), but the alias is unresolvable for every consumer of the raw sources — the StackBlitz writer and the MCP indexer would each need a special case (fetch the file, rewrite the import), and the docs source viewer would show an import a reader cannot resolve.
3. **Full centralization of the data too.** Rejected — there is no shared dictionary; each component's text is its own.

## Design

### The helper

`injectLocalizedText` resolves a locale-keyed record for the active locale, falling back to `default` (English):

```ts
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};
```

Each component's `l10n.ts` carries its own copy (approach 1). `i18n` is the mechanism (how examples support several locales); the per-component dictionaries below are the `l10n` content (the actual translations).

### Per-component data

Each component keeps `packages/docs-examples/components/<component>/l10n.ts` (renamed from `localized-data.ts`), self-contained: its own copy of `injectLocalizedText`, its `ExampleText` interface and `injectExampleText()` with `ru-RU` and `default` entries.

The existing 4 files (`navbar`, `app-switcher`, `filter-bar`, `notification-center`) are renamed to `l10n.ts` and keep their local `injectLocalizedText`. `filter-bar` keeps its `injectLocalizedPeriods`, which stays component-specific.

After changing any example or adding a `l10n.ts` import, run `yarn run build:docs-examples-module` to regenerate `example-module.ts` and `loader/index.ts` so `localImportFiles` carries the new relative imports.

### queryParams

- Param name `examples-lang`, value = a locale id (e.g. `?examples-lang=ru-RU`).
- Precedence on load: `?examples-lang` (if a valid locale) → localStorage (`docs_examples-language`) → current default (`en-US`).
- On picker change: `localeService.setLocale(id)` (existing), write `?examples-lang=<id>` via `router.navigate` with `queryParamsHandling: 'merge'`, and keep localStorage as today.
- The existing `DocsLocaleService.setLocale` already forwards query params and the fragment when the interface locale changes, so `examples-lang` survives an interface-language switch.
- The read on startup mirrors how `DocsLocaleService` reads the path locale from `Location` (the router has not finished navigating during `provideAppInitializer`), extended to `router.parseUrl(...).queryParams`.

### Rollout

Incremental, component by component (or in small groups), each in its own change: refactor + queryParams first, then the pilot components, then the rest. This keeps every PR reviewable.

Pilot components: `button` and `validation`.

## What is left to the builder

- Exact query-param read/write plumbing in `DocsLanguagePreferences` / `DocsNavbarProperty` (initial-value override vs. post-construction sync), and whether to preserve the param across ordinary internal navigation.
- The per-component `ExampleText` shapes and the Russian translations themselves.
