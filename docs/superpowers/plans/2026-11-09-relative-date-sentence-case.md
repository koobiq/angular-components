# DS-1229: Relative date sentence case — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let relative dates render lowercase mid-sentence («Обновлено вчера, 14:48» / «Updated yesterday, 14:48») via an opt-in `sentenceStart` flag, implemented in `@koobiq/date-formatter` and passed through the `kbqRelative*` pipes.

**Architecture:** `relativeDate()` in the date-formatter package records which template branch was selected and, when it is a word branch (yesterday/today/tomorrow) and `sentenceStart: false`, lowercases the first character of the compiled result. Date branches are untouched (English months keep the capital). The angular-components pipes forward the new option; the two date-only pipes gain an `options` argument, the DateTime pipes already take `options` and need no code change.

**Tech Stack:** TypeScript, ICU MessageFormat (@messageformat/core), Jest + Nx (date-formatters repo), Angular pipes + Vitest (angular-components repo).

**Spec:** `docs/superpowers/specs/2026-11-09-ds-1229-relative-date-sentence-case-design.md`

## Global Constraints

- Default behavior must stay byte-identical: `sentenceStart` defaults to `true` (package) / omitted (pipes).
- Lowercase applies **only** to YESTERDAY/TODAY/TOMORROW branches; BEFORE_YESTERDAY/AFTER_TOMORROW output must not change.
- Branches: `feat/DS-1229` in angular-components, `feat/DS-1229-sentence-case` in date-formatters, both from latest `origin/main`.
- No `git push` / PR creation without explicit user confirmation (ask at the commit step).
- date-formatters repo: prettier (4-space, single quotes, 120 cols, no trailing commas, sorted imports); `TZ=UTC` is pinned by the jest preset — keep expectations zone-independent; commitlint checks local commit messages (conventional commits, scope `formatter` is valid); do not run `release:stage:commit` (maintainer-only).
- angular-components repo: conventional commits with scope `core`; JSDoc on every new public member; header ≤ 120 chars; comment and docs language is English (user-facing docs also exist in Russian).
- Part 2 (Tasks 3–6) cannot merge before the new `@koobiq/date-formatter` version is published to npm — CI installs it from the registry.

## Review Focus

- `sentenceStart: false` on a **date branch** (e.g. 3 days away) — output must equal the default (pinned in package and pipe tests).
- `sentenceStart: false` **combined with `seconds`/`milliseconds`** — the word lowercases, the time suffix stays intact (package formats spec).
- **Case-less locales** (zh-CN, fa-IR) — the flag must not alter output (luxon spec).
- **Pipe cache** — same value, flag toggled: args are part of the cache key, so the rendered string must switch (pipe spec).
- **Missing/invalid value with the flag set** — still renders an empty string (pipe spec).

---

## Part 1 — `koobiq/date-formatters` (C:\proj\date-formatters)

### Task 1: `sentenceStart` option in `DateFormatter`

**Files:**

- Modify: `packages/date-formatter/src/formatter.ts`
- Test: `packages/date-formatter/src/formatter-formats.spec.ts`, `packages/date-formatter/src/formatter-locales.spec.ts`, `packages/date-formatter/src/formatter.spec.ts`

**Interfaces:**

- Consumes: existing private branch predicates `isBeforeYesterday` / `isYesterday` / `isToday` / `isTomorrow` / `isAfterTomorrow` in `formatter.ts`.
- Produces (used by Task 4 in Part 2):
    - `DateTimeOptions` gains `sentenceStart?: boolean` (JSDoc: relative formats only; default `true`).
    - `relativeDate(date: D, template: FormatterRelativeTemplate, seconds?: boolean, milliseconds?: boolean, sentenceStart?: boolean): string`
    - `relativeShortDate(date: D, options?: DateTimeOptions): string`
    - `relativeLongDate(date: D, options?: DateTimeOptions): string`
    - `relativeShortDateTime` / `relativeLongDateTime` keep their signatures; they forward `options?.sentenceStart`.

- [ ] **Step 1: Create the branch**

```bash
cd /c/proj/date-formatters
git fetch origin
git checkout -b feat/DS-1229-sentence-case origin/main
```

The clone currently sits on `chore/smol-toml-fix` — do not branch from it.

- [ ] **Step 2: Write the failing tests**

In `formatter-formats.spec.ts` (en-US, `InternationalizedDateAdapter`, `fixedToday = 2026-03-17 11:51:13.299`), inside `describe('relative date')`:

```ts
it('lowercases the relative word mid-sentence', () => {
    expect(formatter.relativeLongDateTime(yesterday, { sentenceStart: false })).toBe('yesterday, 12:51');
    expect(formatter.relativeLongDateTime(fixedToday, { sentenceStart: false })).toBe('today, 11:51');
    expect(formatter.relativeLongDateTime(tomorrow, { sentenceStart: false })).toBe('tomorrow, 13:51');
});

it('keeps the date branch unchanged mid-sentence', () => {
    expect(formatter.relativeLongDate(beforeYesterdayOtherYear, { sentenceStart: false })).toBe('March 15, 2025');
    expect(formatter.relativeShortDateTime(beforeYesterdayOtherYear, { sentenceStart: false })).toBe('Mar 15, 12:51');
});

it('combines mid-sentence with seconds', () => {
    expect(formatter.relativeLongDateTime(yesterday, { seconds: true, sentenceStart: false })).toBe(
        'yesterday, 12:51:13'
    );
});
```

Reuse the existing dates of the neighbouring `it`s (yesterday = fixedToday − 1 day at 12:51:13.311, etc.); the asserted strings mirror the file's existing expectations with the first letter lowered.

In `formatter-locales.spec.ts`, add to both `Relative short` and `Relative long` describes (the suite is parametrized over all four adapters × ru-RU/en-US):

```ts
it('lowercases the word mid-sentence', () => {
    for (const date of acrossDay(shift(today, { days: -1 }))) {
        expect(formatter.relativeShortDate(date, { sentenceStart: false })).toBe(
            `${w.yesterday.charAt(0).toLowerCase()}${w.yesterday.slice(1)}, ${adapter.format(date, v.TIME)}`
        );
    }
});

it('leaves the date branch unchanged mid-sentence', () => {
    const date = shift(today, { days: -3 });

    expect(formatter.relativeShortDate(date, { sentenceStart: false })).toBe(formatter.relativeShortDate(date));
});
```

(`relativeShortDate` above is `relativeLongDate` in the long describe.)

In `formatter.spec.ts` (the small luxon-only suite — it already constructs a `LuxonDateAdapter`, which ships zh-CN/fa-IR):

```ts
it('ignores sentenceStart in locales without letter case', () => {
    for (const locale of ['zh-CN', 'fa-IR']) {
        const adapter = new LuxonDateAdapter(locale);
        const formatter = new DateFormatter(adapter, locale);
        const date = adapter.addCalendarUnits(adapter.today(), { days: -1 });

        expect(formatter.relativeShortDate(date, { sentenceStart: false })).toBe(formatter.relativeShortDate(date));
    }
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm run test:date-formatter -- --testFile=packages/date-formatter/src/formatter-formats.spec.ts --skip-nx-cache`
Expected: FAIL — TS compile error: `sentenceStart` does not exist in `DateTimeOptions` / argument count mismatch.

- [ ] **Step 4: Implement in `packages/date-formatter/src/formatter.ts`**

- Add to `DateTimeOptions`:
    ```ts
    /**
     * Relative formats only: whether the formatted value starts a sentence. Pass `false` when the date
     * sits mid-sentence to render the relative word lowercase. Defaults to `true`.
     */
    sentenceStart?: boolean;
    ```
- `relativeDate()`: add trailing param `sentenceStart = true`; set a local `isWordBranch = true` in the `isYesterday` / `isToday` / `isTomorrow` branches of the existing if/else chain; after compiling, `if (!sentenceStart && isWordBranch) return result.charAt(0).toLowerCase() + result.slice(1); return result;`
- `relativeShortDate(date)` → `relativeShortDate(date, options?: DateTimeOptions)` forwarding `false, false, options?.sentenceStart`; same for `relativeLongDate`.
- `relativeShortDateTime` / `relativeLongDateTime`: append `options?.sentenceStart` as the new last argument.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test:date-formatter`
Expected: PASS, and the pre-existing snapshot count stays green (default-flag output unchanged).

- [ ] **Step 6: Verify no snapshot drift and full gates**

Run: `git status --short packages/date-formatter/src/__snapshots__` → empty; `npm run lint:date-formatter`; `npm run format:check`; `npm run build:date-formatter`.
Expected: all clean.

- [ ] **Step 7: Commit**

```bash
git add packages/date-formatter/src/formatter.ts packages/date-formatter/src/formatter-formats.spec.ts packages/date-formatter/src/formatter-locales.spec.ts packages/date-formatter/src/formatter.spec.ts
git commit -m "feat(formatter): opt-in lowercase for relative dates mid-sentence (#DS-1229)"
```

### Task 2: Push and PR in date-formatters — only on explicit user confirmation

**Files:** none (remote work).

- [ ] **Step 1: Ask the user whether to push `feat/DS-1229-sentence-case` and open the PR** (title: `feat(formatter): opt-in lowercase for relative dates mid-sentence (#DS-1229)`). Remind them the npm release (maintainer flow) must follow before Part 2 can merge.
- [ ] **Step 2: If confirmed:** `git push -u origin feat/DS-1229-sentence-case`, then open the PR with `gh` against `main`, body covering: the flag, the word-branch-only lowering, verification (`npm run test:date-formatter`, lint, format, build).

## Part 2 — `koobiq/angular-components` (C:\proj\koobiq_3)

> Blocked until the new `@koobiq/date-formatter` is on npm. For local development before that, mirror a local build into `node_modules` (Task 3, Step 4) and run `yarn install` to restore the registry copy before committing.

### Task 3: Branch and bump `@koobiq/date-formatter`

**Files:**

- Modify: `package.json` (root), `packages/components/package.json:33`, `tools/check-angular/package.json`, `apps/docs/src/assets/stackblitz/package.json`

**Interfaces:**

- Produces: workspace resolving `@koobiq/date-formatter` at the released version (`^3.6.0` expected — use the actually published one).

- [ ] **Step 1: Create the branch**

```bash
cd /c/proj/koobiq_3
git fetch origin
git checkout -b feat/DS-1229 origin/main
```

- [ ] **Step 2: Bump the four manifests** — replace the `@koobiq/date-formatter` range with `^<released-version>` in each file listed above (root `^3.5.1`, components `^3.2.3`, check-angular `^3.5.1`, stackblitz `^3.4.0` today).

- [ ] **Step 3: `yarn install`** — lockfile updates; `yarn workspace` resolution stays on the registry copy.

- [ ] **Step 4 (only if developing before the release is published): mirror the local build**

```bash
cd /c/proj/date-formatters && npm run build:date-formatter
# copy the built package contents over node_modules/@koobiq/date-formatter (keep a backup)
```

Temporary only: before any commit in angular-components, delete the mirror and `yarn install` to restore the registry state. `node_modules` is never committed.

### Task 4: `options` on the relative date pipes + specs

**Files:**

- Modify: `packages/components/core/formatters/date/formatter.pipe.ts` (`KbqRelativeLongDatePipe` ~line 747, `KbqRelativeShortDatePipe` ~line 766)
- Test: `packages/components/core/formatters/date/formatter.spec.ts`

**Interfaces:**

- Consumes: `DateFormatter.relativeLongDate(date, options?)` / `relativeShortDate(date, options?)` from the bumped package (Task 3).
- Produces:
    - `KbqRelativeLongDatePipe.transform(value, options?: DateTimeOptions)`; same for `KbqRelativeShortDatePipe`. `KbqRelativeLongDateTimePipe` / `KbqRelativeShortDateTimePipe` keep their signatures.
    - Later tasks rely on `DateTimeOptions` re-export from `@koobiq/date-formatter` through `@koobiq/components/core` (already the case — the pipe file imports it today).

- [ ] **Step 1: Write the failing spec**

Add a `describe('kbq relative pipes with sentenceStart')` to `formatter.spec.ts` with a host component following the file's existing pattern (imports the four `KbqRelative*` pipes, OnPush, `markForCheck` via `fixture.componentRef.injector.get(ChangeDetectorRef)` as the helper at the top of the file does):

```ts
@Component({
    selector: 'kbq-sentence-case-host',
    imports: [
        KbqRelativeLongDatePipe,
        KbqRelativeLongDateTimePipe,
        KbqRelativeShortDatePipe,
        KbqRelativeShortDateTimePipe
    ],
    template: `
        <span id="long">{{ value() | kbqRelativeLongDate: options() }}</span>
        <span id="short">{{ value() | kbqRelativeShortDate: options() }}</span>
        <span id="longTime">{{ value() | kbqRelativeLongDateTime: options() }}</span>
        <span id="shortTime">{{ value() | kbqRelativeShortDateTime: options() }}</span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SentenceCaseHostComponent {
    readonly value = signal<DateTime | null>(null);
    readonly options = signal<{ sentenceStart?: boolean } | undefined>(undefined);
}
```

Tests (ru-RU providers, mirroring the existing suites' TestBed setup):

```ts
it('lowercases the relative word mid-sentence', () => {
    // yesterday at midnight; parity with the formatter call
    expect(read(fixture, 'long')).toBe(dateFormatter.relativeLongDate(date, { sentenceStart: false }));
    expect(read(fixture, 'long')).toBe('вчера, 00:00');
});

it('toggles back when the option is cleared', () => {
    options.set({ sentenceStart: false });
    runChangeDetection();
    options.set(undefined);
    runChangeDetection();
    expect(read(fixture, 'long')).toBe('Вчера, 00:00');
});

it('leaves the date branch unchanged', () => {
    // date three days out
    expect(read(fixture, 'long')).toBe(dateFormatter.relativeLongDate(date3));
});

it('renders an empty string for a missing value', () => {
    // value null, flag set
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run packages/components/core/formatters/date/formatter.spec.ts -t "sentenceStart"`
Expected: FAIL — the date pipes reject the extra argument / template parse error.

- [ ] **Step 3: Implement the pipe change in `formatter.pipe.ts`**

For `KbqRelativeLongDatePipe` and `KbqRelativeShortDatePipe` only: change the `Args` type parameter to `[options?: DateTimeOptions]`, add `options?: DateTimeOptions` to `transform` and `format`, and pass it to `this.formatter.relativeLongDate(date, options)` / `relativeShortDate(date, options)`. No change to the DateTime pipes, the deprecated pipes, or `BaseLocaleAwareFormatterPipe` (args already participate in the cache key).

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run packages/components/core/formatters/date/formatter.spec.ts`
Expected: PASS.

### Task 5: Docs example and MDX

**Files:**

- Modify: `packages/docs-examples/components/date-formatter/relative-date-formatter/relative-date-formatter-example.ts` (+ its `.html`)
- Modify: `packages/components/core/formatters/date/date-formatter.en.mdx:190` and `date-formatter.ru.mdx:190` (next to `<Example id="relative-date-formatter" />`)

- [ ] **Step 1: Extend the example** — add a `sentenceCase` block (long + short, yesterday/today/tomorrow) computed in the example's locale-change handler via `this.dateFormatter.relativeLongDate(date, { sentenceStart: false })` / `relativeShortDate(...)`, rendered in the template prefixed with "Updated" («Обновлено») so the mid-sentence context is visible.

- [ ] **Step 2: Add an MDX paragraph** in both languages explaining the option: by default a relative date is capitalized (it can open a sentence); pass `{ sentenceStart: false }` to the pipe or formatter to lowercase the relative word mid-sentence; absolute dates inside the same formats are unaffected. Keep it to 2–3 sentences per the terse-docs convention.

- [ ] **Step 3: Verify the example compiles**

Run: `yarn run build:docs-examples`
Expected: build succeeds (strict mode — no template/type warnings).

### Task 6: API snapshot, gates, commit

**Files:**

- Modify: `tools/public_api_guard/components/core.api.md` (via the approve command)

- [ ] **Step 1: Build and approve the API snapshot**

```bash
yarn run build:components
yarn run approve-api "components/core"
yarn run check-api
```

Expected: `check-api` passes; the golden diff shows only the two new optional `options` parameters.

- [ ] **Step 2: Run the remaining gates**

`npx vitest run packages/components/core/formatters`; `yarn run check-spec-types`; `npx eslint packages/components/core/formatters/date/formatter.pipe.ts packages/components/core/formatters/date/formatter.spec.ts packages/docs-examples/components/date-formatter/relative-date-formatter`; `npx prettier --check` on the changed files; `yarn run cspell` (MDX changed).

- [ ] **Step 3: Confirm the working tree contains only intended changes** (`git status` — no `node_modules` mirror leftovers, no stray logs), then commit:

```bash
git add -A
git commit -m "feat(core): sentence case option for relative dates (#DS-1229)"
```

### Task 7: Push and PR in angular-components — only on explicit user confirmation

- [ ] **Step 1: Ask the user** whether to push `feat/DS-1229` and open the PR (title `feat(core): sentence case option for relative dates (#DS-1229)`), noting it must wait for the date-formatter release to merge.
- [ ] **Step 2: If confirmed:** push and open the PR with `gh`, body covering: bumped package version, new pipe argument, docs updates, verification results.

## Self-review notes

- Spec coverage: flag + word-branch-only lowering (Tasks 1, 4), all seven locales / case-less locales (Task 1 luxon test), pipes pass-through incl. cache (Task 4), version bump (Task 3), docs en+ru (Task 5), API snapshot (Task 6), release sequencing (Task 2 + Part 2 header). Approaches documented in the spec; the rejected wrapper-only approach needs no task.
- Type consistency: `DateTimeOptions.sentenceStart?: boolean` is the only new name; used identically in both repos.
- Proportion: bodies given only where the signature/tests do not determine the code (lowering expression, branch flag); everything else is signature + assertions.
