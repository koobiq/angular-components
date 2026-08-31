# Code Review — `packages/components/filter-bar`

> Scope: every component, directive, pipe, type, spec, style and doc under
> `packages/components/filter-bar`. Method: 9-dimension multi-agent review with **adversarial
> verification of every finding** (each claim re-checked against the real code by an independent
> agent; refuted findings dropped, several severities corrected). Verdicts below are `CONFIRMED`
> (verified against code) or `PLAUSIBLE` (real concern, impact depends on consumer/runtime).

> **Status (updated 2026-07-08): ✅ remediation complete.** Every P1/P2/P3 finding is resolved, or carries
> a documented **◑ partial** / intentional deferral. Delivered across four passes — the initial 2026-07-07
> batch plus **Phase A (architecture)**, **Phase B (test quality)** and **Phase C (SCSS & i18n)**. The last
> and most coupled items — **P1-6** (signal state core) and **P2-4/P2-5** (accessor `@Input`s → `model()`/
> `input()`) — landed 2026-07-08 via multi-agent ripple-map → migration → adversarial-review workflows.
> Gates: `ng build components` ✅, `check-api` clean + `approve-api` ✅, **350 filter-bar Jest tests** ✅,
> ESLint/Stylelint/Prettier ✅. See **§5** for per-finding state and two **corrected recommendations**
> (P2-10, P2-7 in §3 were wrong — fixed inline).

## 1. Executive summary

The filter-bar is a capable, feature-rich family — a `KbqFilterBar` host that projects
`KbqFilters` (saved-filter search / save / rename), `KbqPipeAdd`, and a set of 8 dynamically
rendered pipe components built on a shared `KbqBasePipe`, wired together through
`KbqPipeDirective` + `KBQ_PIPE_DATA` injection. It is mostly modern Angular (standalone, `OnPush`,
`ViewEncapsulation.None`, `input()`/`output()`, `inject()`, `host` object — no `@HostBinding`,
`ngClass` or `ngStyle` anywhere).

It is **not release-blocking** — no P0 crash on the normal UI path — but it carries a consistent
set of real defects:

- **Memory leaks:** four RxJS subscriptions are created without teardown, at least one on a common
  destroy path.
- **Accessibility:** seven interactive controls (icon-only buttons and search inputs) expose **no
  accessible name** — a genuine barrier for screen-reader users (grade **D**).
- **State architecture:** a hand-rolled `BehaviorSubject` "event bus" plus manual `markForCheck`
  fan-out does the job of signals/`computed()` the harder way, and shared-array in-place mutation
  fights the `structuredClone` isolation strategy.
- **Duplication:** `pipe-date` and `pipe-datetime` are ~99% identical 240-line files; the select /
  tree pipes share large copy-pasted blocks with no intermediate base class.
- **Type safety:** the pipe registry and the `configuration` field are `any`; the useful
  `KbqPipeType` literal union is neutered by `| string`.
- **Tests:** broad but with several assertion-free / stubbed / duplicated tests and a global
  `structuredClone` monkey-patch that leaks across the Jest worker.

## 2. Scorecard

| Dimension               | Grade | P0  | P1  | Headline issue                                                                               |
| ----------------------- | :---: | :-: | :-: | -------------------------------------------------------------------------------------------- |
| Architecture & patterns |   C   |  0  |  2  | RxJS event-bus + manual CD fan-out where signals fit; date≈datetime 99% dup                  |
| Angular v19 standards   |  C+   |  0  |  4  | 4 subscription-leak sites; `*ngIf`/`NgIf` in tree pipes; accessor `@Input`s; `any`           |
| Correctness / bugs      |  C+   |  0  |  1  | leaks; `removePipe` unguarded `indexOf(-1)`; `setTimeout` races                              |
| Accessibility           |   D   |  0  |  7  | 7 controls/inputs with no accessible name; fragile focus restore                             |
| TypeScript & public API |   C   |  0  |  3  | `configuration` & `KBQ_FILTER_BAR_PIPES` = `any`; `undefined!` input; name/selector mismatch |
| Tests (Jest)            |  C+   |  0  |  4  | assertion-free search tests; untested `removePipe(-1)`; global `structuredClone` leak        |
| SCSS & theming          |   C   |  0  |  1  | no `filter-bar-tokens.scss`; theme mixin covers only one button; `!important`; RTL           |
| Docs & i18n             |  B-   |  0  |  0  | EN example → wrong demo; Russian-by-default config                                           |

**Totals:** 0 × P0 · ~12 P1 themes · ~30 P2 · ~16 P3.

> _Grades above are **as-found** (the original review baseline). Post-remediation, the headline issues in
> every dimension are resolved: subscription leaks fixed, all controls named (A11y), the RxJS event-bus
> replaced by signals/`computed()` + `model()`/`input()` inputs (Architecture), date≈datetime and the
> select/tree pipes de-duplicated, the `any`s typed, and the assertion-free/leaky tests corrected._

## 3. Prioritized findings

Severity: **P0** release blocker · **P1** high · **P2** should-fix · **P3** hygiene. Findings that
several dimensions reported independently are merged; the parenthetical IDs preserve traceability.

### P1 — High

#### P1-1 · Four RxJS subscriptions leak (no `takeUntilDestroyed`) — `CONFIRMED`

_(NG-1/BUG-1, NG-3/BUG-3, BUG-9)_

- `filters.ts:175` — `KbqFilters` constructor: `this.filterBar.changes.subscribe(() => this.changeDetectorRef.markForCheck())`. `filterBar.changes` is a `BehaviorSubject` owned by the parent `KbqFilterBar` that outlives the child (e.g. `@if` around `<kbq-filters>`), so the destroyed component and its `ChangeDetectorRef` stay reachable and keep running `markForCheck`.
- `pipe-tree-select.ts:98` and `pipe-multi-tree-select.ts:154` — `ngOnInit`: `this.searchControl.valueChanges.subscribe(v => this.treeControl.filterNodes(v))`. Pipes are created/destroyed dynamically via `KbqPipeDirective.createComponent`, so each destroyed pipe leaks its subscription (capturing `this`).
- `base-pipe.ts:179` — `KbqPipeMinWidth`: `this.filterBar?.changes.pipe(delay(0)).subscribe(this.update)`. One leaked subscription per pipe element for the life of the bar; `delay(0)` can also run `update()` against a destroyed `elementRef`.

Each file already imports/uses `takeUntilDestroyed` elsewhere, so the omissions are inconsistent.

**Fix:** add `.pipe(takeUntilDestroyed(this.destroyRef))` (or argless `takeUntilDestroyed()` in an injection context) before every `.subscribe`.

#### P1-2 · Seven interactive controls have no accessible name — `CONFIRMED`

_(A11Y-1..A11Y-7)_ — WCAG 2.1 SC 4.1.2 / 1.3.1 / 3.3.2.

| #      | Element                         | Location                                      | Problem                                                                             |
| ------ | ------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| A11Y-1 | Refresher's 2 icon buttons      | `filter-refresher.ts:12`                      | icon-only, no `aria-label`, no tooltip                                              |
| A11Y-2 | Filter-actions "⋮" button       | `filters.html:51`                             | icon-only dropdown trigger, no name                                                 |
| A11Y-3 | Saved-filter search input       | `filters.html:76`                             | labelled only by `placeholder`                                                      |
| A11Y-4 | Pipe-add "+" button             | `pipe-add.ts:25`                              | relies on `kbqTooltip` (not an accessible name)                                     |
| A11Y-5 | Pipe remove/clear button        | `pipe-button.ts:28`                           | icon-only, tooltip only, tooltip disabled when pipe disabled                        |
| A11Y-6 | Per-pipe select search input    | `pipe-select.html:33` (+ multi/tree variants) | `placeholder` only                                                                  |
| A11Y-7 | "Save as new filter" name field | `filters.html:168`                            | bare `<label class="kbq-form__label">` with no `for`, in a sibling `kbq-form-field` |

A hover `kbqTooltip` is **not** exposed as the button's accessible name (the tooltip package adds no `aria-label`/`aria-describedby`), and a `placeholder` is not a programmatic label.

**Fix:** localized `[attr.aria-label]` on each icon-only button and search input (source the text from `filterBar.configuration`); associate the save-name label via `for`/`id` or `aria-label`, and expose validation errors with `aria-describedby`. Mark decorative icons `aria-hidden`.

#### P1-3 · `filters` input declared `input<KbqFilter[]>(undefined!)` — `CONFIRMED`

_(NG-13/TSAPI-4)_ · `filters.ts:120`

The non-null assertion lies to the type system: the signal is typed `KbqFilter[]` but holds `undefined` until bound. `isEmpty` (`this.filters().length`) and `ngOnInit` (`of(this.filters())`) throw if the input is not provided.

**Fix:** `readonly filters = input.required<KbqFilter[]>();` (or a real `[]` default if genuinely optional).

#### P1-4 · `KbqFilterBar.configuration` is an untyped, uninitialised public field — `CONFIRMED`

_(NG-5/TSAPI-3)_ · `filter-bar.ts:64` — `configuration;`

Implicit `any`, no access modifier, no initialiser; assigned only in `updateLocaleParams`/`initDefaultParams`. Every consumer reads `.filters` / `.reset` / `.add` / `.pipe` untyped (`filters.ts:161`, `filter-reset.ts:29`, `base-pipe.ts:80`), and an early read can hit `undefined`.

**Fix:** define a `KbqFilterBarConfiguration` interface (shape of `ruRULocaleData.filterBar`), type & initialise the field, and mark it `protected readonly` as appropriate.

#### P1-5 · Pipe registry is `InjectionToken<any>` — end-to-end untyped extension point — `CONFIRMED`

_(TSAPI-1/FB-ARCH-09)_ · `filter-bar.types.ts:20`

`KBQ_FILTER_BAR_PIPES = new InjectionToken<any>(…)`, filled with `Map<string, unknown>`. `KbqPipeDirective` (`pipe.directive.ts:16,22`) resolves a component as `any` and calls `createComponent` on it — a wrong value fails only at runtime. This is the central extension point of the whole feature.

**Fix:** `InjectionToken<Map<KbqPipeType, Type<KbqBasePipe<unknown>>>>` and type `defaultFilterBarPipes` accordingly.

#### P1-6 · State event-bus should be signals + `computed()` — `CONFIRMED` · ✅ done (Phase A)

_(FB-ARCH-02/NG-11)_ · `filter-bar.ts:153-196`

`KbqFilterBar` exposes 5 hand-rolled Subjects (`changes`, `internalFilterChanges`, `internalTemplatesChanges`, `openPipe`, `onResetFilter`) plus 2 `merge()` chains; the second chain calls both `changes.next()` **and** `markForCheck()` on every emission, and `changes` is independently subscribed by `KbqFilters`, `KbqPipeAdd`, `KbqPipeState`, `KbqFilterBarButton`, `KbqPipeButton` and `KbqPipeMinWidth` — each re-running `markForCheck`. A single pipe change fans out an uncoordinated CD cascade. `isSaved/isChanged/isReadOnly/isDisabled` are already plain getters off `filter` — a textbook fit for signals, which the project standards mandate.

**Fix (done, breaking):** `filter` is now backed by a private `signal` behind the existing `@Input()` accessor (so `filter` reads stay `.filter`, no `.filter()` ripple across the overloaded token); the boolean states are `computed()` off it (`isSaved()` … — a breaking public-API change, approved); the `changes` Subject and its second `merge` fan-out are **removed**. The 6 former subscribers now react via signal reactivity: `KbqFilters` (template reads the `computed()` states), `KbqPipeAdd` (`addedPipes` → `computed()`), and `KbqPipeState`/`KbqFilterBarButton`/`KbqPipeButton`/`KbqPipeMinWidth` via `effect()` (the min-width effect keeps the old `delay(0)` via a deferred `setTimeout` + cleanup). `filter-reset` no longer nudges `changes.next()`. To make `computed()` states react, the in-place `filter.changed/saved/pipes` mutations (`removePipe`, `resetFilterChangedState`, `saveChanges`, `pipe-add`, the `onChangePipe/onRemovePipe` chain) were converted to **immutable replacements** — this lands the **core of P2-20**. The pure `model()` rename (P2-4) and `kbqPipeState`→`input()` (P2-5) remain deliberately deferred; the `filter` `@Input()` accessor is kept (public surface preserved). Build ✓, 349 tests ✓ (added a non-vacuous effect-driven button-style test), `approve-api` ✓ (`changes` dropped, states → `Signal<boolean>`, `addedPipes` → `Signal`), eslint/prettier ✓.

#### P1-7 · `pipe-date.ts` ≈ `pipe-datetime.ts` — 99% identical 240-line files — `CONFIRMED`

_(FB-ARCH-03)_ · `pipe-datetime.ts:56`

The two components differ only in the formatter call (`rangeShortDate` vs `rangeShortDateTime`, line 81) and `defaultStart`/`defaultEnd` (`startOf`/`endOf('day')`, lines 107/121). Every other member — imports, providers, `onKeydown`, `onApplyPeriod`, `onSelect`, `showPeriod`, `showList`, `open`, all focus/calendar handlers, `initFormGroup`, all getters — is duplicated verbatim (they even share `pipe-date.scss`). Any fix (including the a11y fixes above) must be applied twice and will drift.

**Fix:** extract an abstract `KbqPipeDateBaseComponent<D>` with 3 protected hooks (`formatRange`, `getDefaultStart`, `getDefaultEnd`); the two concrete pipes become ~15-line subclasses.

#### P1-8 · Multi-select search tests are assertion-free (false coverage) — `CONFIRMED`

_(TEST-1)_ · `pipe-multi-select.spec.ts:663,680`

`filteredOptions` is a cold `merge(internalTemplatesChanges, searchControl.valueChanges)` with no `startWith`/replay. The tests `setValue(...)` + `flush()` **before** subscribing, so the emission has already passed and the `subscribe` callback (and its `expect`s) never runs. The tests pass unconditionally with zero coverage of search filtering — the opposite of their names.

**Fix:** subscribe first (capture into a variable), then `setValue` + `flush`, then assert synchronously — mirror the correct pattern in `pipe-select.spec.ts:382-400`.

#### P1-9 · `removePipe(-1)` path untested + source lacks the guard — `CONFIRMED`

_(F1; source BUG-5, PLAUSIBLE)_ · `filter-bar.spec.ts:284`, source `filter-bar.ts:201`

`removePipe` does `this.filter?.pipes.splice(this.filter?.pipes.indexOf(pipe), 1)`. If `pipe` is not found, `indexOf` returns `-1` and `splice(-1, 1)` removes the **last** element. Every `removePipe` test passes a pipe that is present, so the defect path has zero coverage. (In the normal UI flow the pipe object is the exact `KBQ_PIPE_DATA` element, so it is not reachable there — hence the source guard is P2/`PLAUSIBLE` — but the missing test is P1.)

**Fix:** add a test removing a pipe **absent** from the array and assert the array is unchanged; add a `if (i === -1) return;` guard (prefer id-based removal via `getId`).

#### P1-10 · Global `structuredClone` monkey-patch never restored — `CONFIRMED`

_(F2)_ · `filter-bar.spec.ts:81` (also `filters.spec.ts:92`, `pipe-add.spec.ts:87`)

`window.structuredClone = (v) => JSON.parse(JSON.stringify(v))` is assigned at describe-body scope (runs once at file load, no `afterEach`/`afterAll`). The lossy JSON shim leaks to any later test in the same Jest worker and masks the `Date`/`undefined`/function loss that `saveFilterState`/`restoreFilterState`/`selectFilter` actually rely on.

**Fix:** save the original and restore it in a lifecycle hook (or use the jsdom/node `structuredClone`).

#### P1-11 · `saveAsNew` "invalid" test stubs `FormControl.invalid` — `CONFIRMED`

_(F3)_ · `filters.spec.ts:286`

`Object.defineProperty(component.filterName, 'invalid', { get: () => true })` tests the stub, not the real `Validators.required` guard, and mutates the control without restoring it.

**Fix:** open the popover so `filterName` is built with `Validators.required`, leave it empty, call `saveAsNew`, assert `onSave` did not emit.

#### P1-12 · Theme mixin covers only the changed-filter button — `CONFIRMED` · ✅ done (Phase C)

_(FB-SCSS-005)_ · `_filter-bar-theme.scss:23`

`_filter-bar-theme.scss` exposes `kbq-button-changed-filter()` + typography only. All other themable surfaces — pipe separators (`base-pipe.scss:46,61`), pipe name/value/disabled colours (`base-pipe.scss:23,72`), pipe tooltip colours (`base-pipe.scss:113,117`), readonly disabled backgrounds (`pipe-readonly.scss:8,15`), the changed-saved warning dot (`filters.scss:64,67`) — hard-wire global CSS vars directly in the base SCSS with no theme hook. (They still respond to **global** theme switches via semantic tokens, so severity is debatable.)

**Fix:** move colour/background declarations into theme mixins in `_filter-bar-theme.scss`, included from the base SCSS.

### P2 — Should-fix

- **P2-1 · `*ngIf`/`NgIf` instead of `@if`** _(NG-4, CONFIRMED)_ — `pipe-tree-select.ts:40` & `pipe-multi-tree-select.ts:42` import `NgIf`; templates use `*ngIf="data.search"` (with an `eslint-disable` for `prefer-control-flow`). **Fix:** `@if` + remove `NgIf`.
- **P2-2 · `preparePopover` `filterName.valueChanges` no teardown** _(NG-2/BUG-2, CONFIRMED)_ — `filters.ts:264`; runs on every popover open, siblings use `takeUntilDestroyed`. **Fix:** add `takeUntilDestroyed(this.destroyRef)`.
- **P2-3 · `onChangePipe` is `@Output() EventEmitter` amid `output()` siblings** _(NG-6/BUG-7/FB-ARCH-06, CONFIRMED)_ — `filter-bar.ts:117`; callers mix `.next()` (`base-pipe.ts:146`) and `.emit()` with divergent payloads (`{...data, value: []}` vs `data`), so subscribers get an inconsistent reference. **Fix:** standardise on `output()` + a consistent payload (keep a private `Subject` source if an internal stream is needed).
- **P2-4 · Accessor `@Input filter`/`pipeTemplates` un-migrated** _(NG-7, CONFIRMED; ✅ done, breaking)_ — `filter-bar.ts:80,98` (carried the "too complex to migrate" TODO). **Fix (done):** `filter` → `model<KbqFilter|null>()` (two-way `[(filter)]` preserved; explicit `filterChange` output dropped — `model()` synthesizes it; imperative subscribers use `filter.subscribe`); `pipeTemplates` → `input<KbqPipeTemplate[]>()` with the setter side effect moved to an `effect(() => internalTemplatesChanges.next(pipeTemplates()))`. `KbqFilters.filter` deliberately kept a plain getter (body reads `filterBar.filter()`) to avoid rippling its own consumers. Every `filterBar.filter` read → `filterBar.filter()`, write → `filterBar.filter.set()`, across source + 3 docs-examples + all specs. Both "too complex" TODOs removed. Mapped + migrated + reviewed via multi-agent workflows. Build ✓, 350 tests ✓, `approve-api` ✓ (breaking: `filter`→`ModelSignal`, `pipeTemplates`→`Signal`, `filterChange` output dropped), lint ✓.
- **P2-5 · Accessor `@Input kbqPipeState` un-migrated** _(NG-8, CONFIRMED; ✅ done)_ — `pipe-state.ts:25` (getter+setter+manual `updateState`). **Fix (done):** `state` → `input<T|null>(null, { alias: 'kbqPipeState' })`; the setter's `updateState()` side effect folded into the existing effect (`effect(() => this.updateState(this.filterBar.filter(), this.state()))`). `[kbqPipeState]` bindings unchanged. `approve-api` ✓ (`get/set state` → `InputSignal`).
- **P2-6 · Pervasive `any` in select/tree pipes** _(NG-9/TSAPI-8, CONFIRMED)_ — `template: any`, `filteredOptions: Observable<any[]>`, untyped node callbacks, `as any` casts (`pipe-multi-tree-select.ts:62,69,165,219,321`; mirrored in `pipe-tree-select.ts`). `template`/`filteredOptions` appear vestigial in the tree pipes. **Fix:** use the node/`KbqSelectValue` types; remove dead fields.
- **P2-7 · `UntypedFormControl` (typed forms)** _(NG-10, CONFIRMED; ◑ partial)_ — `filters.ts:100` (and searchable pipes). **Fix (done):** typed `FormControl<string | null>` everywhere; `UntypedFormControl` removed. **⚠ Correction:** the original fix also said "add `kbqDisableLegacyValidationDirectiveProvider()` + an `ErrorStateMatcher`" — but that provider is **not exported by `@koobiq/components`**; it was a no-op shim **removed in v20** (the v20 schematic actively deletes it, `schematics/…/v20-upgrade/data.ts`). So there is no provider to add; P2-7 reduces to the typed-forms change. An `ErrorStateMatcher` remains an optional future refinement (the one shown error is already gated manually by `@if (filterName.hasError(...))`).
- **P2-8 · `KbqBasePipe.stateChanges` subscribed in ctor without teardown** _(BUG-4, PLAUSIBLE)_ — `base-pipe.ts:86`; low impact (own Subject) but a late `setTimeout`-driven `.next()` after destroy runs `markForCheck` on a stale CDR. **Fix:** `takeUntilDestroyed()` / complete on destroy.
- **P2-9 · `removePipe` unguarded `indexOf(-1)`** _(BUG-5, PLAUSIBLE)_ — `filter-bar.ts:201` (see P1-9). **Fix:** guard `-1`, prefer id-based removal.
- **P2-10 · Redundant double `values`/`valueTemplate` write in tree subclasses** _(BUG-6/FB-ARCH-01, PLAUSIBLE; ◑ partial)_ — `base-pipe.ts` + `pipe-tree-select.ts` + `pipe-multi-tree-select.ts`. **⚠ Correction:** the original fix ("delete the subclass subscriptions — base already dispatches to the override") is **self-contradictory and unsafe** — it would break the tree. JS class field-init order runs the **base** constructor (which subscribes) inside `super()`, _before_ the subclass field initializers reassign `updateTemplates`; so the base subscription permanently captures the **base** `updateTemplates` (sets only `values`/`valueTemplate`, never `dataSource`). The **subclass** subscription is the _only_ writer of `dataSource.data` — deleting it leaves the tree empty (CONFIRMED by adversarial re-check). **Fix (done):** keep both subscriptions and slim the subclass override to write only `dataSource.data`, dropping the redundant `values`/`valueTemplate` re-assignment the base already performs. (The redundant _subscription_ itself is retained by necessity, so this finding is ◑ partial by design.)
- **P2-11 · Unguarded `setTimeout` race in multi-tree-select** _(BUG-8, PLAUSIBLE)_ — `pipe-multi-tree-select.ts:184,223`; deferred work reads `this.select()` and mutates `data.value` after a possible destroy/filter-switch. **Fix:** guard with `destroyRef` or use `afterNextRender`.
- **P2-12 · Non-null `this.filter!` in `resetFilterChangedState`** _(BUG-10, PLAUSIBLE)_ — `filter-bar.ts:219`; not reachable via the UI (`@if (filterBar.isSavedAndChanged)`) but a hazard for programmatic callers of the public method. **Fix:** `if (!this.filter) return;`.
- **P2-13 · `KbqPipeType = \`${KbqPipeTypes}\` | string`** _(TSAPI-2, CONFIRMED)_ — `filter-bar.types.ts:42`; `| string` collapses the literal union (no autocomplete/exhaustiveness). **Fix:** `\`${KbqPipeTypes}\` | (string & {})`.
- **P2-14 · `kbqBuildTree(value: any)` exported** _(TSAPI-5, CONFIRMED)_ — `filter-bar.types.ts:150`; leaks `any` to consumers, `v['value']` unguarded. **Fix:** `Record<string, unknown>` + narrow.
- **P2-15 · `KbqFilterBarRefresher` class name ≠ `kbq-filter-refresher` selector** _(TSAPI-6, CONFIRMED)_ — `filter-refresher.ts:26`; inconsistent public export (siblings match). **Fix:** rename class to `KbqFilterRefresher` or the selector to `kbq-filter-bar-refresher` (keep `public-api`/module in sync).
- **P2-16 · Untyped `getFilteredOptions(value)` + uninit `filterSavingErrorText`** _(TSAPI-7, CONFIRMED)_ — `filters.ts:373,116`. **Fix:** type the param, init the field.
- **P2-17 · Fragile focus restoration** _(A11Y-9, CONFIRMED)_ — WCAG 2.4.3 — `filters.ts:254`; `focusedElementBeforeOpen` is set only by `KbqFilterBarButton` `(click)/(keydown)`, so dropdown/programmatic popover opens (`filters.html:108,128`) restore focus to `<body>`. **Fix:** capture the trigger at open time; fall back to `mainButton`.
- **P2-18 · No status announcements** _(A11Y-10, CONFIRMED; ✅ done)_ — WCAG 4.1.3 — `filters.ts:244`; save success/error (`kbq-alert`, `filters.html:161`) and newly-added pipes have no `role="alert"`/`aria-live`. **Fix (done):** `role="alert"` on the save-error alert (Phase C) + a visually-hidden `.cdk-visually-hidden` `aria-live="polite"` region in `pipe-add` that announces the added pipe via a new localized `filterBar.add.addedAnnouncement` key (`{{ name }}` placeholder, all 5 locales). Non-vacuous test asserts the exact announced text.
- **P2-19 · No shared base for the select-family pipes** _(FB-ARCH-04, CONFIRMED; ✅ done Phase A)_ — `pipe-multi-select.ts:118`; `selectedAllEqualsSelectedNothing`, `updateInternalSelected`, `emitChangePipeEvent`, `internalSelected`, and the whole tree scaffolding (`transformer`/`getLevel`/…) are duplicated across 4 pipes. **Fix (done, two parts):** (1) extracted `KbqTreeSelectPipeBase<V>` (a `@Directive()` base via direct `extends`, so the `viewChild` queries inherit under AOT) holding the flat-tree control/flattener/data-source, the 6 node accessors, search filtering, and open/close — `pipe-tree-select` + `pipe-multi-tree-select` extend it (~70 lines × 2). The `internalTemplatesChanges` subscription stays in each subclass ctor (the field-init/replay trap from P2-10). (2) the multi-select "select-all = select-nothing" state (`internalSelected`/`selectedAllEqualsSelectedNothing`/`updateInternalSelected`/`emitChangePipeEvent`, ~25 lines) — shared by `pipe-multi-select` (base `KbqBasePipe`) and `pipe-multi-tree-select` (base `KbqTreeSelectPipeBase`), the **diamond** — was extracted into a **plain composition helper** `KbqMultiSelectPipeState` (a private field on each pipe → no public-API leak; a `@Directive()` base can't serve both bases and a mixin risks AOT query-inheritance breakage). Near-wash on line count, but single-source for the subtle logic. Build ✓, 348 tests ✓, `approve-api` ✓ (tree base only; the composition helper is private).
- **P2-20 · In-place `splice`/`push` mutation vs `structuredClone` isolation** _(FB-ARCH-05, CONFIRMED; ✅ done)_ — `filter-bar.ts:201`, `pipe-add.ts:98`; in-place mutation defeats `OnPush`/signal reference-equality (hence the manual `changes.next()`/`markForCheck`), while `structuredClone` on every selection is a heavy deep copy that silently drops non-cloneable values (`valueTemplate: TemplateRef`). **Fix (done):** (1) `filter`/`pipes` immutable (new reference on add/remove/save — landed in P1-6, which is what makes the `computed()` states react); (2) `KbqFilters.selectFilter` now isolates the active filter via a **shallow structural copy** (`{ ...filter, pipes: filter.pipes.map((p) => ({ ...p })) }`) instead of a per-selection `structuredClone` — safe because **every pipe writes `value` by reassignment, never in-place** (verified across all pipes: no `.value.push/splice/sort`), so shallow isolation suffices while preserving non-cloneable `value` payloads. `structuredClone` now lives only at the explicit `saveFilterState`/`restoreFilterState` boundary. Non-vacuous isolation test (edit active copy → source unchanged). Build ✓, 350 tests ✓, no API change.
- **P2-21 · `KbqFilters` is overloaded (SRP)** _(FB-ARCH-07, CONFIRMED; ✅ done Phase A)_ — `filters.ts:61`; owns search + save + rename + popover lifecycle + focus + error display in one ~380-line component. **Fix (done):** extracted `KbqFilterSavePopover` — it owns the save/rename **state** (`filterName`, `saveNewFilter`, `isSaving`, error), the popover's header/content/footer **templates**, and the save/error/close **logic**. The popover trigger stays on the `KbqFilters` main button (it also drives the saved-filters dropdown); the child receives the trigger via an `exportAs` template ref (`#popoverRef="kbqPopover"`) and **pushes its templates onto the trigger imperatively** in `ngAfterViewInit` — no parent-side `[kbqPopoverContent]` binding, so no `ExpressionChangedAfterItHasBeenCheckedError`. `KbqFilters` keeps focus management + the public `filterSavedSuccessfully`/`filterSavedUnsuccessfully` API and delegates the rest through a **thin facade** (so its public surface + all 70 filters specs are preserved unchanged). Build ✓, 348 tests ✓, `approve-api` ✓.
- **P2-22 · Test name↔body mismatch + duplicate** _(TEST-2, CONFIRMED)_ — `pipe-multi-tree-select.spec.ts:374`; a test under `describe('onSelect')` calls `toggleSelectAllNode()`, not `onSelect`, and duplicates the test at 448-468. **Fix:** drive through `onSelect`, or delete the duplicate.
- **P2-23 · `onClose` test asserts only `toBeDefined()`** _(TEST-3, CONFIRMED)_ — `pipe-multi-tree-select.spec.ts:585` (also `pipe-multi-select.spec.ts:560`); `selected` is always a defined array, so the assertion can't fail. **Fix:** assert the concrete `internalSelected` snapshot.
- **P2-24 · "Pipe states" suite copy-pasted across 7 specs** _(TEST-4, CONFIRMED)_ — `pipe-text.spec.ts:96` (+6); identical `required/empty/cleanable/removable/disabled` block with magic `[0..4]` indices. **Fix:** parametrised helper / test the base once, keep only the type-specific class per spec.
- **P2-25 · Pervasive `(component as any)` casts in specs** _(F4, CONFIRMED)_ — `filters.spec.ts:526,562,703,716,749,894` reach protected viewChildren; renames compile silently. **Fix:** assert through public behaviour/DOM or a typed test seam.
- **P2-26 · `saveAsNew → error(nameAlreadyExists) → retry` round-trip uncovered** _(F5, CONFIRMED)_ — `filters.spec.ts:274`; success and `showError` are tested in isolation but never chained. **Fix:** add the integrated round-trip test.
- **P2-27 · Locale-change / `externalConfiguration` precedence untested** _(F6, CONFIRMED)_ — `filter-bar.spec.ts:451`; only the no-locale-service default is asserted. **Fix:** provide a mock `KBQ_LOCALE_SERVICE`, emit `changes`, and a case where `KBQ_FILTER_BAR_CONFIGURATION` wins.
- **P2-28 · No `filter-bar-tokens.scss`** _(FB-SCSS-001, PLAUSIBLE)_ — `filter-bar.scss:1`; the documented `<comp>.scss` + `<comp>-tokens.scss` + `_<comp>-theme.scss` triad (see `button/`) is missing the tokens layer, so all geometry is literal. (Several other components also omit it, so this is a house sub-pattern, not a unique violation.) **Fix:** add a tokens file with `--kbq-filter-bar-*` variables.
- **P2-29 · Magic geometry & `!important`** _(FB-SCSS-002/003/004, CONFIRMED; ✅ done Phase C)_ — `320px` min/max-width (`filter-bar.scss:36`); `!important` popover padding with raw `1px` (`filter-bar.scss:41`); triple `!important` + `calc()` composite on the separator (`filters.scss:30`). **Fix (done):** geometry tokenised via `panelClass`-scoped custom properties; the redundant text-pipe popover `!important` removed. **⚠ Correction:** the popover-padding and separator `!important` are load-bearing (custom-pipe docs example reuses `.kbq-pipe__popover` with default paddings; separator overrides the divider's own `.kbq-divider_paddings` 0,3,0 rule) — kept + documented rather than dropped.
- **P2-30 · EN example points to the wrong demo** _(docs-i18n-1, CONFIRMED)_ — `examples.filter-bar.en.md:3` uses `<!-- example(filter-bar-complete-functions) -->` under the "custom pipe" heading, while RU correctly uses `filter-bar-custom-pipe`. English readers see the wrong example. **Fix:** align EN with RU (or add a distinct heading for the complete-functions demo in both).
- **P2-31 · Default config hardcodes Russian locale** _(docs-i18n-2, CONFIRMED; ✅ done Phase C)_ — `filter-bar.types.ts:14` `KBQ_FILTER_BAR_DEFAULT_CONFIGURATION = ruRULocaleData.filterBar`; without `KBQ_LOCALE_SERVICE`, `initDefaultParams()` renders Russian strings in an English app. (Library-wide convention, so an i18n smell rather than a filter-bar regression.) **Fix (done):** documented via JSDoc (the `ru-RU` default is kept — every `KBQ_*_DEFAULT_CONFIGURATION` resolves to `ruRULocaleData`, so changing only filter-bar would be inconsistent + a behavioural change to a public const); the doc directs consumers to provide `KBQ_LOCALE_SERVICE`.

### P3 — Hygiene

- **P3-1 · Missing `protected`/`readonly` on template-only members** _(NG-12, CONFIRMED)_ — `filters.ts:105-118` (`popoverSize`, `popoverOffset`, `filterName`, `showFilterSavingError`, `isSaving`, …).
- **P3-2 · `restoreFilterState(structuredClone(null))` silently wipes filter; cloneable-payload coupling** _(BUG-11, PLAUSIBLE; ✅ done Phase A)_ — `filter-bar.ts:213`. **Fix (done):** guard `restoreFilterState` — when neither an explicit arg nor `savedFilter` is present, no-op instead of assigning `structuredClone(null)`. Non-vacuous test added (fails without the guard — the filter is wiped to `null`).
- **P3-3 · `compareByValue(o1: any, o2: any)` compares `.id` not on `KbqSelectValue`** _(TSAPI-9, CONFIRMED)_ — `pipe-multi-select.ts:206`, `pipe-select.ts:87`; `KbqSelectValue` declares only `name`/`value`.
- **P3-4 · `KBQ_FILTER_BAR_CONFIGURATION` `InjectionToken` has no generic** _(TSAPI-10, CONFIRMED)_ — `filter-bar.types.ts:17` → `unknown`, propagated into `configuration`.
- **P3-5 · Decorative icons not `aria-hidden` on the `<i>` host** _(A11Y-8, PLAUSIBLE)_ — `icon.component.ts`; mostly moot because the injected `<svg>` is already `aria-hidden` via the icon registry.
- **P3-6 · Pipes hard-coupled to concrete `KbqFilterBar`** _(FB-ARCH-08, CONFIRMED; ✅ done Phase A)_ — `base-pipe.ts:45` (+ `pipe-state`, `pipe-add`, `filter-bar-button`); a rigid star topology with no interface seam, so a pipe can't be unit-tested without a full bar. **Fix (done):** added a `KbqFilterBarHost` interface + `KBQ_FILTER_BAR_HOST` token in `filter-bar.types.ts`; `KbqFilterBar implements KbqFilterBarHost` and provides itself via `useExisting: forwardRef(() => KbqFilterBar)`. The **pipe-side** consumers (`KbqBasePipe`, `KbqPipeMinWidth`, `KbqPipeButton`, `KbqPipeAdd`, `KbqPipeState`, `KbqFilterBarButton`, `KbqFilterReset`, `KbqFilterRefresher`) now `inject(KBQ_FILTER_BAR_HOST)`. **`KbqFilters` deliberately stays on the concrete `KbqFilterBar`** — it builds the public `KbqSaveFilterEvent` whose `filterBar: KbqFilterBar` field intentionally hands consumers the full bar (`saveFilterState`/`restoreFilterState`/…), which the seam doesn't expose. Behavior-preserving (`useExisting` → same instance); 348 Jest tests pass; public API updated (`approve-api`) — new exported token + interface, and the pipe consumers' `filterBar` member type becomes `KbqFilterBarHost`.
- **P3-7 · Magic keycodes / hard-coded indices in tests** _(TEST-5, CONFIRMED)_ — `pipe-text.spec.ts:321` (`keyCode: 13/27`); use `ENTER`/`ESCAPE` from `@koobiq/components/core`.
- **P3-8 · Asymmetric `compareByValue` null coverage** _(TEST-6, CONFIRMED; ✅ done)_ — `pipe-select.spec.ts` vs `pipe-multi-select.spec.ts` (`toBeFalsy()` vs `toBe(false)`, missing symmetric case). **Fix (done):** both specs now cover first-null / second-null / both-null with a consistent `toBe(false)`; the multi-select comparator was null-guarded so `(null, null)` returns `false` (the flagged asymmetry) — see §5.
- **P3-9 · Tautological `selected`-getter branch tests** _(TEST-7, CONFIRMED)_ — `pipe-multi-tree-select.spec.ts:265` (both branches yield the same literal; a swap would pass).
- **P3-10 · `structuredClone` deep isolation not asserted** _(F7, CONFIRMED)_ — `filters.spec.ts:212` (only a shallow reference check).
- **P3-11 · `filterSavedSuccessfully` focus-restore never asserted** _(F8, CONFIRMED)_ — `filters.spec.ts:497` (the `setTimeout(() => restoreFocus())` path is unverified).
- **P3-12 · RTL-unsafe physical margins / SCSS duplication / hard-coded px** _(FB-SCSS-006/007/008, CONFIRMED; ✅ done Phase C)_ — `margin-left/right` throughout (`base-pipe.scss:39`); duplicated value/badge rules + repeated `max-height: 404px` (`pipe-multiselect.scss` ↔ `pipe-multi-tree-select.scss`); `400/136/64/4px` literals (`filters.scss:86`, `pipe-date.scss:78`, `filter-refresher.scss:5`). **Fix (done):** all physical directional props → logical (including the button-seam borders/radii, beyond the original margins scope); `404px` de-duplicated via a shared mixin; magic widths tokenised.
- **P3-13 · Prose docs omit the public API surface** _(docs-i18n-3, CONFIRMED)_ — `filter-bar.en.md`/`.ru.md` never mention inputs/outputs/tokens/pipe types (relies on the auto-generated API tab).

## 4. Not a defect (verified and dismissed)

- **Duplicated `#kbqTitleText` template refs** across `pipe-readonly`, `pipe-select.html`, `pipe-date.html`, `filters.html` are **intentional**: the `kbq-title` directive collects multiple `#kbqTitleText` elements via `@ContentChildren('kbqTitleText')` (`title.directive.ts:192`; documented in `title.en.md:28`) to detect overflow across name + value.
- **The "missing" pipe components in `filter-bar.module.ts`** are not a public-API gap — the 8 pipe components are provided lazily through `KBQ_FILTER_BAR_PIPES` and rendered by `KbqPipeDirective`, not declared in the NgModule by design.

## 5. Execution status & remaining work

Remediation executed **2026-07-07 → 2026-07-08** across four passes — the initial batch, then **Phase A
(architecture)**, **Phase B (test quality)** and **Phase C (SCSS & i18n)**. Verified by independent
per-finding audits + multi-agent adversarial review of the P1-6 and P2-4/P2-5 signal migrations, plus the
standing gates: `ng build components` ✅, `check-api` clean + `approve-api` ✅, **350 filter-bar Jest
tests** ✅, ESLint/Stylelint/Prettier ✅. Legend: **✅ done** · **◑ partial** · **⏳ deferred**.

### ✅ Done — initial 2026-07-07 batch (29)

P1-1, P1-2, P1-3, P1-4, P1-5, P1-7, P1-8, P1-9, P1-10, P1-11, P2-1, P2-2, P2-3, P2-6, P2-8, P2-9,
P2-11, P2-12, P2-13, P2-14, P2-15, P2-16, P2-17, P2-28, P2-30, P3-3, P3-4, P3-5, P3-9.

_The remaining architecture / test / SCSS findings were completed in the phased passes below (Phase B:
P2-22–P2-27, P3-7/P3-10/P3-11, P3-8; Phase C: P1-12, P2-31, P3-13; **Phase A: P3-2, P3-6, P2-19, P2-21,
P1-6, P2-20, P2-4, P2-5** — all ✅)._

Notes on fixes that deviated (correctly) from the original wording: **P1-4** keeps `configuration`
public + mutable (it is reassigned by locale changes), not `protected readonly`; **P1-9/P2-9** guard
via `includes()` + immutable `filter()` rather than a literal `indexOf === -1` check; **P3-5** marks
each decorative `<i kbq-icon>` `aria-hidden` per-usage (not on the global icon host, which must stay
announceable).

### ◑ Partial (landed, with a remaining slice)

- **P2-7** — typed `FormControl<string | null>` done; the mandated provider does **not exist** (see
  the §3 correction) so nothing to add; `ErrorStateMatcher` is an optional future refinement.
- **P2-10** — redundant double `values`/`valueTemplate` write removed; the extra subscription is
  intentionally kept (the plan's "delete it" is unsafe — see the §3 correction).
- **P2-18** — ✅ **fully done**: `role="alert"` on the save-error alert (Phase C) + a visually-hidden
  `aria-live="polite"` region in `pipe-add` announcing the added pipe (new `filterBar.add.addedAnnouncement`
  locale key, all 5 locales; non-vacuous test). Build ✓, 351 tests ✓, `approve-api` ✓ (additive), lint ✓.
- **P2-20** — ✅ **fully done**: immutable `filter`/`pipes` (new reference on add/remove/save — P1-6) +
  `selectFilter` now uses a shallow structural copy instead of a per-selection `structuredClone` (safe: all
  pipe `value` writes are reassignments); `structuredClone` confined to the save/restore boundary. 350 tests ✓.
- **P2-22** — a real `onSelect`-driven test added; the misplaced duplicate under `describe('onSelect')`
  (which actually calls `toggleSelectAllNode`) still remains.
- **P2-29** — ✅ **remainder completed in Phase C**: overlay geometry tokenised via `panelClass`-scoped
  custom properties; the redundant text-pipe popover `!important` removed. The two remaining `!important`
  (popover padding + separator) proved **load-bearing** and were kept + documented (see Phase C). Raw
  `1px`/`10px` decorative literals remain.
- **P3-1** — `popoverSize`/`popoverOffset` → `protected readonly`; the remaining template-only mutable
  members stay public (several are written directly by specs → couples with P2-25).
- **P3-12** — ✅ **remainder completed in Phase C**: RTL logical properties finished in `filters.scss`/
  `pipe-date.scss` (plus the button-seam borders/radii, beyond the original margins scope); the duplicated
  `max-height: 404px` de-duplicated via a shared mixin; `400px`/`136px`/`320px` tokenised.

### ✅ Phased remediation (Phases A / B / C — all complete)

_Originally the deferred backlog with a recommended sequencing; all three phases are now done. Record below._

**Phase A — architecture (✅ COMPLETED 2026-07-08 — one item at a time, safest-first order; P1-6, the
most coupled, landed last):**

- ✅ **P3-2** (done 2026-07-08) guard `restoreFilterState` against a null payload — no-op instead of a
  `structuredClone(null)` wipe; non-vacuous test added (34 filter-bar specs pass).
- ✅ **P3-6** (done 2026-07-08) `KbqFilterBarHost` interface + `KBQ_FILTER_BAR_HOST` token added; the
  pipe-side consumers `inject(KBQ_FILTER_BAR_HOST)` (bar provides itself via `useExisting`). `KbqFilters`
  deliberately stays on the concrete bar (owns the public `KbqSaveFilterEvent` payload). Behavior-preserving;
  348 tests pass; `approve-api` run. See §3 P3-6.
- ✅ **P2-19** (done 2026-07-08) `KbqTreeSelectPipeBase` (tree scaffolding) + `KbqMultiSelectPipeState`
  (composition helper for the diamond's multi-select state) extracted; all 4 select-family pipes de-duplicated.
  Build ✓, 348 tests ✓, `approve-api` ✓. See §3 P2-19.
- ✅ **P2-21** (done 2026-07-08) `KbqFilterSavePopover` extracted (owns save state + templates + logic;
  trigger stays on the main button, templates pushed imperatively; `KbqFilters` delegates via a thin
  facade). Build ✓, 348 tests ✓, `approve-api` ✓. See §3 P2-21.
- ✅ **P1-6** (done 2026-07-08, breaking) `filter` backed by a private `signal` behind the kept `@Input()`
  accessor; boolean states → `computed()` (`isSaved()` …); the `changes` Subject + `merge` fan-out **removed**;
  the 6 former subscribers react via signal reactivity/`effect()` (min-width keeps `delay(0)` via a deferred
  `setTimeout`); `filter-reset` drops its `changes.next()`. In-place `filter.changed/saved/pipes` mutations →
  immutable replacements (**lands the core of P2-20**). Build ✓, 349 tests ✓, `approve-api` ✓ (breaking:
  `changes` dropped, states → `Signal<boolean>`, `addedPipes` → `Signal`), eslint/prettier ✓. See §3 P1-6.
- ✅ **P2-4 / P2-5** (done 2026-07-08, breaking) the `filter`/`pipeTemplates` accessors → `model()`/`input()`
  and `kbqPipeState`→`input()` (+ folded `updateState` into the effect). This was the `.filter()` ripple P1-6
  deliberately avoided — done here via multi-agent workflows: an exhaustive **ripple-map** (261 sites),
  parallel **spec-migration** (3 files, ~90 rewrites), and an adversarial **review** pass. `KbqFilters.filter`
  kept as a plain getter to bound the ripple. Build ✓, 350 tests ✓, `approve-api` ✓, lint ✓. See §3 P2-4/P2-5.

**Phase A is now fully complete** — every architecture finding (P3-2, P3-6, P2-19, P2-21, P1-6, P2-20, P2-4,
P2-5) is landed. P2-20 is also **fully done** (see §3).

**Phase B — test quality (✅ completed 2026-07-07 — 344 Jest tests, no production change):**

- ✅ **P2-23** concrete `internalSelected` snapshot asserted in both `onClose` tests (empty-after-close
  transition, non-vacuous).
- ✅ **P2-24** the copy-pasted "Pipe states" suite is now one shared helper
  (`pipes/pipe-states.spec-helper.ts`, `registerPipeStatesTests`); magic `[0..4]` → named descriptors.
- ✅ **P2-25** all 10 `(component as any)` casts replaced with typed seams
  (`By.directive(T).injector.get(T)` + `getPopoverTrigger`/`getMainButton`/`getFilterActionsButton`).
- ✅ **P2-26** `saveAsNew → error(nameAlreadyExists) → retry` round-trip test added (adversarially
  verified: fails if `filterSavedUnsuccessfully` stops showing the error).
- ✅ **P2-27** locale-change + `externalConfiguration`-precedence tests added (adversarially verified:
  fails if the precedence is dropped).
- ✅ **P3-7** raw `13`/`27` → `ENTER`/`ESCAPE` from `@koobiq/components/core`.
- ✅ **P3-10 / P3-11** deep `structuredClone` isolation and the deferred `filterSavedSuccessfully`
  focus-restore path now asserted.
- ✅ **P2-22 (partial remainder)** the misplaced duplicate under `describe('onSelect')` deleted.
- ✅ **P3-8** symmetric + both-null `compareByValue` cases added to both specs (consistent `toBe(false)`);
  the multi-select comparator was null-guarded (`!!o1 && !!o2 && o1.id === o2.id`) so `(null, null)` now
  returns `false` like the select pipe (adversarially verified). This is the one Phase B item that also
  touched production (1 line, no API/type change).

**Phase C — SCSS & i18n polish (✅ completed 2026-07-08 — every filter-bar `.scss` compiled to CSS
before/after and diffed per declaration; `stylelint` + `styles:build-all` clean; independently
re-audited by a 4-agent adversarial pass):**

- ✅ **P1-12** all colour/background surfaces moved into three theme mixins in `_filter-bar-theme.scss`
  (`kbq-filter-bar-pipe-theme`, `-readonly-theme`, `-filters-theme`), `@include`d from the layout SCSS.
  The compiled-CSS declaration sets are **byte-identical** (proven, not eyeballed). Two date-popover
  colours (`.kbq-icon`, `.kbq-calendar`) were intentionally left in `pipe-date.scss` — outside the
  finding's enumerated surfaces and already governed by the datepicker theme mixin.
- ✅ **P2-29** overlay geometry tokenised via `panelClass`-scoped custom properties
  (`--kbq-filter-bar-{popover,save-popover,date-period,date-field}-*`); the redundant popover-padding
  `!important` on the text pipe removed. **⚠ Correction:** both other `!important` (popover-content
  padding + `.kbq-filter-bar__separator` height/margins) are **load-bearing, not droppable** — the
  separator overrides the divider's own higher-specificity `.kbq-divider_paddings` rule (0,3,0), and the
  popover padding is relied on by the custom-pipe **docs example**, which reuses `.kbq-pipe__popover` with
  default paddings (a 0,2,0 tie without `!important`). Both kept + documented in-place. Raw `1px`/`10px`
  decorative literals remain.
- ✅ **P3-12** RTL logical properties finished across `filters.scss`/`pipe-date.scss`; the repeated
  `max-height: 404px` de-duplicated into one shared mixin across all four select panels; `400px`/`136px`/
  `320px` tokenised. Went **beyond** the finding's "margins" scope to also convert the pipe/filters
  button-seam (`border-right/left: none` + the four `border-*-radius: unset` corners → `border-inline-*` /
  `border-*-*-radius` logical) and a missed `left: 0` separator inset, so the whole button group mirrors
  correctly in RTL. All conversions are LTR-identical (`inline-start`↔`left` in `horizontal-tb`).
- ✅ **P2-31** documented (not changed): `KBQ_FILTER_BAR_DEFAULT_CONFIGURATION` keeps the `ru-RU` default
  (every `KBQ_*_DEFAULT_CONFIGURATION` in the library resolves to `ruRULocaleData`; changing only filter-bar
  would make it the lone inconsistent component + a behavioural change to a public const). JSDoc now states
  the default is Russian and that `KBQ_LOCALE_SERVICE` must be provided to localise.
- ⏳ **P3-13** (optional) not done — relies on the auto-generated API tab, the alternative the finding
  explicitly sanctions.

> **Note:** the Phase C SCSS changes were verified **computed-CSS-equivalent in LTR** by a per-declaration
> diff of every filter-bar `.scss` compiled before and after, so the existing Playwright `__screenshots__`
> baselines (closed-state, LTR light/dark) remain valid by construction — the logical-property conversions
> are pure RTL improvements with no `horizontal-tb` pixel change, and there is no RTL baseline to re-run.
> The remaining **Phase A (architecture)** items above still need Playwright re-baselining when tackled.

### Corrections to the original plan (both CONFIRMED by adversarial re-check)

1. **P2-10 fix was unsafe.** "Delete the subclass subscription — base already dispatches to the
   override" is self-contradictory. Field-init order captures the **base** `updateTemplates` in the
   base subscription (never touches `dataSource`); the subclass subscription is the only `dataSource`
   writer, so deleting it empties the tree. Correct fix applied: keep both, de-duplicate the write.
2. **P2-7 provider does not exist here.** `kbqDisableLegacyValidationDirectiveProvider()` is not
   exported by `@koobiq/components` — it was a no-op shim **removed in v20** (the v20 schematic
   deletes it). P2-7 therefore reduces to the typed-forms change.

## 6. Verification strategy

- **Leaks (P1-1, P2-2, P2-8):** unit test that creates then destroys the host/pipe and asserts the
  source Subject has no remaining observers (`(subject as any).observers.length === 0`), or spy that
  `markForCheck` is not called after destroy.
- **Accessibility (P1-2, P2-17, P2-18):** Playwright + `axe` on `e2e.playwright-spec.ts`; assert every
  interactive control has an accessible name and that focus returns to the trigger after the popover
  closes on the dropdown/programmatic paths.
- **`removePipe(-1)` (P1-9):** the new negative-case Jest test (array unchanged).
- **Type fixes (P1-3, P1-4, P1-5, P2-6, P2-13):** `node_modules/.bin/tsc` / `eslint`; run
  `build:components` then `check-api` (public-API changes for the rename P2-15 require `approve-api`
  after a fresh build).
- **Tests (P1-8, P1-10, P1-11, P2-22..27):** `node_modules/.bin/jest.cmd <spec>` green, and confirm
  the previously-vacuous tests now fail when the code is reverted.
- **SCSS (P1-12, P2-28, P2-29):** `stylelint` + `styles:build-all`; visual diff via the existing
  `__screenshots__` Playwright baselines.
- Run heavy commands **sequentially, never in parallel**, and always `build:components` before
  `check-api`/`approve-api`.

## 7. Appendices

**A. Method.** Nine dimensions (architecture, Angular-standards, correctness/bugs, accessibility,
TypeScript/public-API, core tests, pipe tests, SCSS/theming, docs/i18n). Each dimension: an
independent finder agent reading the real files, then an independent **adversarial verifier** that
re-opened each cited file and tried to refute the claim (CONFIRMED / PLAUSIBLE / FALSE). FALSE
findings were dropped; several severities were corrected downward by the verifier (noted inline).

**B. Files reviewed.** All of `packages/components/filter-bar`: `filter-bar.ts`, `filters.ts`
(+`filters.html`), `filter-bar.types.ts`, `filter-reset.ts`, `filter-refresher.ts`,
`filter-bar-button.ts`, `pipe-add.ts`, `pipe.directive.ts`, `filter-bar.module.ts`, `public-api.ts`,
`index.ts`; `pipes/base-pipe.ts`, `pipe-state.ts`, `pipe-button.ts`, `pipe-readonly.ts`,
`pipe-text.ts`, `pipe-select.ts`, `pipe-multi-select.ts`, `pipe-tree-select.ts`,
`pipe-multi-tree-select.ts`, `pipe-date.ts`, `pipe-datetime.ts` (+ their `.html`); all `*.spec.ts`,
`e2e.ts`, `e2e.playwright-spec.ts`; `*.scss` (`filter-bar`, `filters`, `filter-refresher`,
`pipe-add`, `_filter-bar-theme`, `pipes/*`); `*.en.md` / `*.ru.md`.

**C. Severity legend.** P0 release blocker · P1 high · P2 should-fix · P3 hygiene.
