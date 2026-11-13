# Localized docs examples (DS-4922)

## Intent and why

The docs site has an "examples language" picker that switches the locale of the live examples. Before this change only a handful of components localized their example text; every other example showed hardcoded English regardless of the picker.

DS-4922 rolls the mechanism out to all examples: each example reads its user-facing strings from localized data translated for `ru-RU`, falling back to English for every other locale, and the picked language is carried in the URL (`?examples-lang=<id>`) and in localStorage.

## Goals

- Every docs example renders its user-facing strings from its own `l10n.ts`, following the examples language picker.
- Only `ru-RU` is translated; other locale ids get the English `default` entry.
- The examples language is reflected in and read from the URL: at startup, and on browser back/forward.
- Until the reader picks a different examples language, it follows the docs interface language.
- A generated StackBlitz project can switch the examples language too (switcher in the project header).

## Non-goals

- Translating to all 5 shipped locales (only `ru-RU` + English fallback).
- Localizing library-internal strings (already covered by `kbqInject*LocaleConfiguration` / `KbqLocaleService`).
- Changing the docs interface-language mechanism (stays in the URL path `/ru/`, `/en/`).

## Anti-goals

- Breaking StackBlitz: an example's project must compile from its own files plus `localImportFiles`, and must not show imports the reader cannot resolve.
- Breaking SSR / prerender (localStorage is unavailable on the server).
- Duplicating the localization helper across component folders.

## Constraints

- Each component folder of `packages/docs-examples` is its own ng-packagr secondary entry point; cross-entry-point imports must go through an alias, never a relative path.
- StackBlitz bundles only an example's own files plus `localImportFiles`, fetched from `dist/docs-content/examples-source/`; the generator `tools/example-module/resolve-local-imports.ts` follows `./`, `../` imports recursively.
- Shipped locale ids: `ru-RU` (library default), `en-US`, `es-LA`, `pt-BR`, `tk-TM`.

## Approaches considered

1. **Per-component duplicated helper.** Implemented first (as DS-4306 did for its components): each `l10n.ts` kept its own copy of the helper. Rejected in review: the helper is infrastructure and duplicating it in every folder violates the single-responsibility split between mechanism and data.
2. **Shared entry point, special-cased consumers (chosen).** `packages/docs-examples/i18n/` is a secondary entry point (`@koobiq/docs-examples/i18n`, same shape as `loader/`), imported by alias. It builds with ng-packagr, but the alias is unresolvable for consumers of the raw sources, so three small special cases carry the file: `resolve-local-imports.ts` records the alias in `localImportFiles`; `package-docs-content.ts` copies `i18n/` into `examples-source/`; the StackBlitz writer places the file inside the generated project and rewrites the specifier to a relative `./i18n`. The MCP indexer and the llms sources resolve `../` paths against the repo and needed no change.
3. **Centralized data.** Rejected — there is no shared dictionary; each example's text is its own.

## Design

### The shared i18n entry point

`packages/docs-examples/i18n/index.ts` holds the whole localization mechanism of the examples:

- `Translations<T>` — the locale-keyed record type (`default` is the fallback, English);
- `injectTranslation(translations)` — a signal with the entry for the active locale.

### Per-example data

Every example has its own `l10n.ts` with exactly two things: the `ExampleTranslation` interface and the `TRANSLATIONS` record. There are no section-level files: an example is self-contained, which keeps its StackBlitz project free of shared files.

The example component initializes `protected readonly t = injectTranslation(TRANSLATIONS)`; templates read `{{ t().someKey }}`. Every localized class of an example (a cell renderer, a nested component) initializes its own field the same way — one mechanism, no base class.

Naming follows the Transloco convention (`ExampleTranslation` = strings of one locale, `TRANSLATIONS` = the record, field `t`), agreed in review.

Shared non-text logic that several examples of one component use — the filter-bar period lists, the notification-center demo list — lives in its own file (`localized-periods.ts`, `create-notifications.ts`) and is picked up by the same `localImportFiles` mechanism.

### StackBlitz

The writer inlines the i18n entry point into every generated project (see approach 2) and rewrites the alias to a relative import. The header of the generated project mounts a language switcher (`src/language-switcher.ts`, a `KbqSelect` of the shipped locales) via `createComponent`, so a StackBlitz reader can switch the examples language the same way as on the docs site.

### The examples language: URL, storage, and the docs language

- Precedence on load: `?examples-lang` (if a valid locale) → localStorage → the docs interface language.
- Browser back/forward restores a URL that can carry a different language: `NavigationEnd` applies the param when it differs from the current pick, so the address bar and the rendered examples never disagree. A URL without the param carries no intent and leaves the pick alone.
- On a direct pick the param is written with `router.navigate` (`queryParamsHandling: 'merge'`, `preserveFragment`), skipped when the URL already shows it — otherwise the write would add a duplicate history entry.
- While the examples language mirrors the docs language, switching the docs language changes both in a single navigation: `DocsLocaleService.setLocale(locale, examplesLocale)` rewrites the locale segment and the param together, preserving the fragment. "Mirrors" is computed at the moment of the switch from the current values, not stored as a mode, so returning the two languages to a match restores the follow behavior.
- The read on startup mirrors how `DocsLocaleService` reads the path locale from `Location` (the router has not finished navigating during `provideAppInitializer`), extended to `router.parseUrl(...).queryParams`.

### Conventions

Recorded in `.claude/rules/docs-examples.md`: labels that carry no meaning (a button that is just "Button 1") stay hardcoded English demo metadata; text a Russian and an English reader must read differently (word order, plural forms, counters) goes to `l10n.ts`. Option values that state flows compare (filter values, selection sets, theme ids) use locale-independent keys with localized labels.
