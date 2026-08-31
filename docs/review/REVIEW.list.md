# Code Review — `packages/components/list`

> **Method:** multi-agent review across 9 dimensions (Angular standards, architecture,
> correctness, accessibility, TypeScript, styles, tests, API/docs, holistic). Every finding
> was adversarially re-verified against the actual source.
> **Result:** 72 findings raised → **42 confirmed**, 30 rejected as false positives.
> **Scope:** `KbqList`, `KbqListItem`, `KbqListSelection`, `KbqListOption`, `KbqListOptionCaption`,
> their templates, SCSS/theme/tokens, module, Jest specs, Playwright e2e and docs.

---

## Verdict

The component is functionally rich and mostly works: roving `FocusKeyManager`, single / keyboard /
checkbox modes, type-ahead, select-all, shift-range selection, and a `ControlValueAccessor`.
But there is **one critical cluster (accessibility)** and **several concrete CVA correctness bugs**,
on top of broad type erosion and unfinished signal-migration debt.

For a sighted mouse/keyboard user the selection list is a fully operable listbox; for a
screen-reader user it is invisible.

| Severity | Count | Area |
|---|---|---|
| High | 4 | a11y roles / selection state |
| Medium | 6 | CVA bugs, SCSS tokens, vacuous test |
| Low / Info | 32 | types, migration, tests, housekeeping |

Reference implementation for the correct patterns: the sibling `select` component.

---

## Theme 1 — Accessibility: the selection list is invisible to assistive technology (P0)

`KbqListSelection` implements a full listbox interaction model but emits **no ARIA semantics**.
The fixes are small host-binding additions, but they **must ship together** — roving DOM focus is
already correct yet announces nothing until roles land.

| Finding | Severity | Location | Fix |
|---|---|---|---|
| Container has no `role="listbox"` / `aria-multiselectable` | High | `list-selection.component.ts:116-124` (host) | Add `role: 'listbox'`, `[attr.aria-multiselectable]: 'multiple'`; pass through `aria-label`/`aria-labelledby` |
| Option has no `role="option"` / `aria-selected` | High | `list-selection.component.ts:690-703` (host) | Add `role: 'option'`, `[attr.aria-selected]: 'selected'` (present true/false on **every** option) |
| Pseudo-checkbox state has no accessible equivalent | High | `list-option.html:1-5` | Pseudo-checkbox is documented invisible to SR; mark it `aria-hidden`, carry state via `aria-selected` |
| Disabled uses inert `[attr.disabled]` on custom elements instead of `aria-disabled` | Low–Med | `list-selection.component.ts:119, 698` | Replace with `[attr.aria-disabled]='disabled \|\| null'`; keep `.kbq-disabled` class for styling |
| Roving DOM focus is correct but inert without roles | Info | `list-selection.component.ts:303-313, 911-925` | No separate change; depends on the role fixes above |

WCAG 1.3.1 / 4.1.2 and an almost-certain AXE failure that AGENTS.md explicitly mandates against.
The existing test asserting `role === null` (`list.component.spec.ts:57`) must be updated.

---

## Theme 2 — ControlValueAccessor correctness bugs (P0)

| Finding | Severity | Location | Fix |
|---|---|---|---|
| `setDisabledState` never disables the list itself | Medium | `list-selection.component.ts:428-432` | `this.disabled = isDisabled; this.changeDetectorRef.markForCheck();` — drop per-option mutation; `option.disabled` getter cascades. Mirror `select.component.ts` |
| `getOptionByValue` ignores `compareWith`, uses `===` | Medium | `list-selection.component.ts:606-608` | `this.options.find((o) => this.compareWith()(o.value, value))`; align with `KbqListOption.ngOnInit` (816) |
| `selectActiveOptions` can dereference `options[-1]` | Medium | `list-selection.component.ts:382-406` | `previousActiveItemIndex` starts at `-1`; on shift+click without prior keyboard nav, `options[fromIndex].selected` throws. Guard index range before the read; the `toIndex === fromIndex` guard is placed *after* the deref |

**Impact:** a disabled form control stays focusable/tabbable and keyboard-active; object-valued
reactive-form / ngModel pre-selection silently selects nothing; a shift+click without prior keyboard
navigation throws a `TypeError`.

---

## Theme 3 — Value typing & form-control contract erosion (P1)

The model value type is unknowable to consumers; `any`-creep masks the `compareWith` bug at the type level.

| Finding | Severity | Location | Fix |
|---|---|---|---|
| `option.value` typed `any` end-to-end | Low | `list-selection.component.ts:744-755` | Parameterize `KbqListOption<T = unknown>` with `value: T` |
| CVA value typing inconsistent (`string[]` vs `any` vs non-array) | Low | `:231, 409-415, 418, 635` | Commit to a generic `T[]` or one concrete type end-to-end |
| `_value: string[] \| null` but plumbing handles objects | Low | `:231, 611` | Type as `unknown[] \| null` / `T[]` to match real object usage |
| Value-accessor provider + `compareWith` loosely typed | Low | `:71, 210` | Type provider as `Provider`; type `compareWith` against `T` |
| `tabIndex` getter/setter typed `any` | Low | `:179-186` | `get tabIndex(): number` / `set tabIndex(value: number)` |
| `showCheckbox` setter `any`; `_showCheckbox` lacks `\| undefined` | Low | `:784-788` | `private _showCheckbox: boolean \| undefined`; setter param `BooleanInput`/`unknown` |
| `KBQ_SELECTION_LIST_VALUE_ACCESSOR` typed `any` | Info | `:71` | Annotate as `Provider` from `@angular/core` |

---

## Theme 4 — Unfinished signal / standards migration (P2)

The class mixes two idioms for the same concepts; retire as one coordinated sweep + `approve-api`.

| Finding | Severity | Location | Fix |
|---|---|---|---|
| 8 `@Input` accessors carry stale "Skipped for migration" TODOs | Info | `:142-203, 742-803` | Migrate simple boolean-coercion inputs (`autoSelect`, `noUnselectLast`, `disabled`, `showCheckbox`) to `input({transform: booleanAttribute})`; replace boilerplate TODOs with real comments where behaviour is model-derived |
| `onCopy` is the only legacy `@Output()`/`EventEmitter` | Low | `:140` | Migrate to `output()`; replace the `.observed` branch (652) with an explicit input flag or a default overridable handler |
| `on*`-prefixed public outputs (`onCopy`, `onSelectAll`) | Low | `:138, 140` | Rename to event-style (`copy`, `selectAll`) following the `selectionChange` precedent; deprecate old names if breaking |
| Redundant `@ViewChild('kbqTitleText')` duplicates signal `viewChild` | Info | `:730-731` | Consolidate to one signal query after `check-api`; type `ElementRef`/`QueryList` generics. (The `@ContentChild` trigger queries at 726-727 must stay decorators per #DS-5079) |
| Template-only public members should be `protected` | Info | `:711, 809`; `list.component.ts:45-51` | Tighten `handleFocus`/`handleBlur`/`handleClick`/`onKeydown`/`externalPseudoCheckbox`; keep cross-component-read members public |
| Manual focus/blur `Subscription` bookkeeping vs `takeUntilDestroyed` | Low | `:235-237, 571-598` | Replace with `options.changes.pipe(startWith(...), switchMap(...), takeUntilDestroyed())` |

---

## Theme 5 — SCSS theming gaps & dead style surface (P1 / P2)

| Finding | Severity | Location | Fix |
|---|---|---|---|
| Theme mixin references **23 undefined** per-state color tokens | Medium | `_list-theme.scss:3-23` (used 27-72) | `_kbq-list-item($state)` emits 5 color decls per state, but `list-tokens.scss` defines colors only for some states. With no `var()` fallback they compute to `inherit` → **wrong text/icon/caption colors** in active / selected-active / multiple-selected. Define the full token set or use `var(--token, <default>)` |
| `states-hover` caption color undefined | Low | `_list-theme.scss:21` | Caption loses its muted treatment on hover/selected; define caption tokens per themed state |
| All 12 `--kbq-list-size-*` tokens are dead | Low | `list-tokens.scss:34-45` | Defined, never consumed (base padding hardcodes `var(--kbq-size-*)`); wire them up as real override points or delete (header/subheading tokens have no element at all) |
| `horizontal` mode has no layout CSS | Low | `list-selection.component.ts:174`; `list.scss` | Input rebinds Left/Right arrows but options still stack vertically → keyboard/visual orientation disagree (focus-order WCAG). Add a flex-row layout or remove the input until styled |
| `.kbq-list-item` gets selected border-radius logic but no selected theming | Info | `list.scss:27-31`; `_list-theme.scss:26-79` | Scope `_kbq-list-item-border-radius()` + action-container hover to `.kbq-list-option` only (`KbqListItem` is non-selectable) |

---

## Theme 6 — Test coverage gaps & stale assertions (P1 / P3)

| Finding | Severity | Location | Fix |
|---|---|---|---|
| Vacuous negative assertions reference a class never set | Medium | `list.component.spec.ts:20, 28` | Asserts `kbq-list-item-focus`; component sets `kbq-focused` → both negatives always pass, so `handleBlur()` is untested. Replace with `kbq-focused` |
| `should add aria roles properly` only asserts `role === null` | Low | `list.component.spec.ts:49-60` | No listbox/option a11y coverage anywhere; rename, add `role`/`aria-selected`/`aria-disabled`/`aria-multiselectable` assertions + axe check |
| Horizontal mode entirely untested | Low | `list-selection.component.spec.ts` | Add `[horizontal]="true"` describe: LEFT/RIGHT navigation, `updateScrollSize` short-circuit |
| Disabled-option keyboard paths untested | Low | `list-selection.component.spec.ts:204-216, 636-663` | Only click is covered; add SPACE/ENTER on disabled active item / disabled list |
| SSR `getHeight()` guard branches untested | Low | `:460-467, 874-881` | Stub `getClientRects` → `undefined`/`[]`, assert `0` and no throw in `updateScrollSize` |
| Leftover `standalone: true` on a test wrapper | Low | `list-selection.component.spec.ts:1338` | Remove — violates repo rule, inconsistent with the rest of the file |
| Typeahead tests use magic keyCodes `83`/`68` | Low | `:389, 397` | Use named constants (`S`, `D`) from `@koobiq/components/core` |
| Two near-identical SHIFT+arrow tests duplicate setup | Info | `:288-314, 328-354` | Consider `it.each` over direction; ensure the checkbox-mode shift test asserts model emission so it's not pure duplication |

---

## Theme 7 — Performance & misc housekeeping (P2 / P3)

| Finding | Severity | Location | Fix |
|---|---|---|---|
| `(window:resize)` forces synchronous layout, no throttle | Low | `list-selection.component.ts:123, 336-342` | Two forced reflow reads + CD on every resize tick. Use `ResizeObserver` or `fromEvent(window,'resize').pipe(auditTime(...))` outside the zone; re-enter only on change |
| Stale Russian top-of-file TODO mislabels `KbqList`/`KbqListItem` | Info | `list.component.ts:1` | Says "not doing this" while the components ship and are consumed by `file-upload`. Delete or replace with an English note |
| Empty `KbqListOptionCaption` marker directive undocumented | Info | `list-selection.component.ts:664-670` | Add a one-line JSDoc explaining it is a styling hook |

---

## Prioritized roadmap

### P0 — must fix (correctness + a11y)
1. **Make the selection list an accessible listbox** — add `role="listbox"`/`aria-multiselectable`,
   `role="option"`/`aria-selected`, mark the pseudo-checkbox decorative, switch `[attr.disabled]` →
   `[attr.aria-disabled]`, update the role test. Ship as one PR (focusing a roleless element announces nothing).
2. **Fix the three CVA bugs** — `setDisabledState`, `getOptionByValue` via `compareWith`,
   `selectActiveOptions` index guard. Small, well-scoped, `select` is the reference.

### P1 — important
3. **A11y regression coverage** — lock in the P0 role work with Jest + axe assertions.
4. **Typed value contract** — generic `T`, propagate through the CVA surface, remove `any`.
5. **SCSS per-state token coverage** — fix the 23 undefined tokens producing wrong colors.

### P2 — consistency / perf
6. **Signal/standards migration sweep** — accessor inputs, `onCopy`→`output()`, output renames,
   redundant `@ViewChild`, member visibility, focus subscription refactor (+ `check-api`/`approve-api`).
7. **Horizontal mode + resize** — add flex-row layout (or remove the input) and throttle resize.

### P3 — hardening
8. **Backfill tests** — disabled-keyboard paths, SSR `getHeight` guards, de-duplicate shift tests.

---

## Quick wins (trivial, high value)

1. Fix the vacuous focus/blur test (`kbq-list-item-focus` → `kbq-focused`) — restores real coverage.
2. `setDisabledState`: `this.disabled = isDisabled; markForCheck()` — one line, fixes a real bug.
3. Route `getOptionByValue` through `compareWith()` — fixes silent object-value pre-selection.
4. Type `onKeydown($event: KeyboardEvent)` and add `: void` to `blur/selectAll/deselectAll/reportValueChange/emitChangeEvent/removeOptionFromList/handleFocus/handleBlur`.
5. Type `KBQ_SELECTION_LIST_VALUE_ACCESSOR` as `Provider` and `tabIndex` as `number`.
6. Replace `.filter(Boolean)` with a type-guard predicate to drop the `option!` non-null assertion.
7. Remove `standalone: true` from `TestListSelectionWithDynamicList`.
8. Replace magic keyCodes `83`/`68` with named constants (`S`, `D`).
9. Delete/translate the stale Russian TODO in `list.component.ts:1`.
10. Add a one-line JSDoc to `KbqListOptionCaption`.
11. Switch `[attr.disabled]` → `[attr.aria-disabled]` (pairs with P0).

---

## Appendix — notable rejected false positives (30 total)

The verification pass discarded findings that were factually accurate but **not real defects** for this
component. The most instructive ones:

- **"`KbqListSelection` is a god-object"** — it's a faithful port of Material's `MatSelectionList`;
  the option↔list back-reference is intrinsic to the `FocusKeyManager` contract. Splitting it would
  multiply indirection without removing the reference web.
- **"`event.keyCode` is deprecated"** — intentional repo-wide convention (37 files), mirrors
  `@angular/cdk/keycodes`; all keys handled here are layout-independent control keys.
- **"`KbqLineSetter` leaks a subscription"** — the subscribed `QueryList.changes` completes on
  component destroy, tearing down the subscriber; the verbatim Material pattern, leak-safe.
- **Several `any` items** (`onChange`, `compareWith`, `writeValue` signature) — the canonical Angular
  CVA boundary is `any` by design; narrowing one component creates inconsistency.
- **"`Promise.resolve().then` / `setTimeout` run after destroy"** — `setSelected` short-circuits when
  the model is gone and `markForCheck()` on a destroyed view is a documented no-op.
- **"No `forced-colors` / high-contrast handling"** — true but library-wide (zero components have it);
  not a list-specific defect, and `transparent` borders are preserved in forced-colors mode.
- **"`@ViewChild('kbqTitleText') textElement` is a redundant duplicate"** — it's the externally-injected
  `KbqTitleTextRef` interface property consumed by `title.directive.ts`; consolidating to a signal would
  break that contract (same class as #DS-5079).
