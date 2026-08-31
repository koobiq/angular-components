# Koobiq Tree Component — Code Review & Improvement Plan

> Scope: `packages/components/tree` (plus the shared `packages/components/core/option/action.ts` consumed by the tree) · Commit `3d86d38f` · 2026-06-14
> Method: all 24 source files read by hand + an automated multi-agent review (8 dimensions × adversarial verification of every finding → synthesis). Of 96 raw findings, **84 were confirmed** and **12 rejected** as false/intentional (see §5). The 84 confirmed findings deduplicate to **81 tracked items** across 8 themes (three are cross-listed — e.g. the toggle leak is C2 = P3 = part of M1).
> Severities below use the verified **adjusted severity** (the adversarial pass deflated hype, e.g. the "811-line god-class" was downgraded `high → low` because the sibling `KbqListSelection` is larger and built the same way on purpose).
> This complements the monorepo-wide `docs/REVIEW.md`, which touches the tree only at a summary level (`A11Y-05`, `A11Y-09`, `BUG-06`, `ARCH-10`). Findings here are consistent with it (e.g. both treat the `unorderedOptions.changes` "leak" as minor).

---

## 1. Executive Summary / Health

The tree is **functionally solid but architecturally and accessibly behind the rest of the library**. It is a hard fork of `@angular/cdk/tree` (zero `@angular/cdk/tree` imports anywhere in `packages/`) that re-implements the entire CDK tree concept set, and it carries the typical debt of an old fork: a fragile global static node handoff, an 811-line god-component, pervasive `any` typing, and a half-finished signals/standalone migration littered with `// TODO: Skipped for migration` markers. **None of these are runtime defects — the component works.**

Two areas genuinely need attention:

1. **Accessibility (the standout weakness).** The widget ships with **zero ARIA tree semantics** — no `role="tree"`, no `role="treeitem"`, no `aria-expanded` / `aria-selected` / `aria-level` / `aria-multiselectable` / `aria-disabled`, no accessible name, no type-ahead, incomplete Left/Right arrow behaviour, and an inaccessible expand toggle and row-action button. It is keyboard-operable via `FocusKeyManager` and visually correct, so a screen-reader user can move through it but cannot perceive that it is a tree, the hierarchy, or selection/expansion state. `AGENTS.md` mandates an AXE pass and WCAG AA, so this is the highest-value cluster. The missing roles mirror the sibling `KbqListSelection` convention, so this is a **library-wide pattern decision**, not a tree-only regression — adding tree ARIA needs a coherent implementation (roles + states together) rather than one attribute at a time.

2. **Test coverage.** The primary interaction model (keyboard nav, checkbox tri-state cascade, disabled-item exclusion, `noUnselectLast`, CVA edge cases, toggle behaviour, the flattener/data-source algorithms, teardown/leaks) is largely untested, and several core scenarios sit disabled (`xit`/`xdescribe`/`it.skip` with vague "todo need recover" markers), so the green suite overstates real coverage. There is no AXE/ARIA assertion anywhere.

A handful of **real low-cost correctness/perf bugs** exist (a toggle subscription leak, a `selectionChange` event that can emit `{option: undefined}`, redundant double change-detection, no default `trackBy` causing full view rebuilds, O(n)-heavy checkbox recomputation), but they are mostly edge cases or efficiency costs rather than crashes.

**Net: this is a maintainability + accessibility + test-coverage story, not a "the component is broken" story.** Quick wins are plentiful; the deep refactors (de-fork, generics, signals) are large and partly breaking and should be RFC'd.

### Scorecard

| Dimension | Grade | Confirmed | Notes |
|---|---|---|---|
| Accessibility | D | 14 | No tree/treeitem roles or ARIA state at all; 4× high. The headline gap. |
| Tests | C | 13 | Keyboard, tri-state, disabled, CVA, data-source untested; core tests disabled. |
| API & Typing | C+ | 11 | Pervasive `any` on public members; oversized public surface; loose `TreeControl` generics. |
| Modern Angular | B− | 13 | Mid-migration: decorator inputs/outputs, constructor injection, no signals. |
| Architecture | B | 9 | Hard fork, fragile static handoff, god-class — all deliberate/working, low severity. |
| Correctness | B | 9 | One `undefined`-emit bug + a toggle leak (medium); rest are narrow low-sev edges. |
| Change-Detection / Perf | B | 6 | No default `trackBy`, O(n) checkbox recompute, double CD — avoidable cost, not bugs. |
| Styling / Theming | B | 6 | 2 latent visual regressions (undefined tokens resolving to 0); rest dead CSS/tokens. |

Tracked-item counts (84 confirmed findings deduplicated to 81 unique items): **Accessibility 14 · Correctness 9 · Change-Detection/Perf 6 · Architecture 9 · Modern-Angular 13 · API & Typing 11 · Tests 13 · Styling 6 = 81.**

---

## 2. Findings by theme

Severity = verified **adjusted severity**. **Brk** = changes the public API tracked by `tools/public_api_guard/components/tree.api.md` or the visible component contract. Effort = S/M/L.

### Theme 1 — Accessibility

> **Cross-cutting decision required before most of these land:** adopt the WAI-ARIA flat-tree pattern (`role="tree"` on the container, `role="treeitem"` on each option, hierarchy via `aria-level`/`aria-setsize`/`aria-posinset` since the DOM is a single flat outlet). Individual attributes (`aria-selected`, `aria-expanded`, `aria-checked`) are **meaningless without the roles**, so several "medium" items here are only effective once the roles land. Because `KbqListSelection` deliberately omits roles (it has a test asserting `role === null`), this is a conscious library-pattern change — RFC it as one coherent a11y epic, then implement together.

| # | Sev | Brk | Effort | Title | Location | Fix |
|---|---|---|---|---|---|---|
| A1 | high | no | S | Options have no `role="treeitem"` | `tree-option.component.ts` host (80-95); base `KbqTreeNode` | Add `'role': 'treeitem'` to the option host; give the bare `KbqTreeNode` a treeitem role too. Without it, focusable rows are announced as generic elements with no role/position/state. |
| A2 | high | no | S | No `aria-expanded` on expandable nodes | `tree-option.component.ts` host (`isExpandable`/`isExpanded` already computed) | Bind `'[attr.aria-expanded]': 'isExpandable ? isExpanded : null'` (omits on leaves). Expand/collapse state is invisible to AT even though Left/Right already toggle it. |
| A3 | high | no | M | No `aria-level` / `aria-setsize` / `aria-posinset` — hierarchy not conveyed | `tree-option.component.ts` host; `level` from `KbqTreeNode.level` | Bind `'[attr.aria-level]': 'level + 1'`; derive `aria-setsize`/`aria-posinset` from the rendered sibling set. Flat single-outlet rendering means depth/position must come from these attrs; data exists but is used only for indentation. |
| A4 | high | no | L | No `role="group"` wrapping child nodes | `tree-selection.component.ts` template (114); `tree.ts` template | Given the flat data source, express hierarchy via `aria-level`/`setsize`/`posinset` (preferred over restructuring to nested `role="group"`); document and implement consistently. Overlaps A3 — solve together. |
| A5 | medium | no | S | Disabled nodes expose no `aria-disabled` | `tree-option.component.ts` host (89); also `toggle.ts`, `core/option/action.ts` | Add `'[attr.aria-disabled]': 'disabled || null'` to treeitem, toggle and action. The native `disabled` attr has no a11y meaning on custom elements; SRs can't tell an item is disabled (key manager already skips it). |
| A6 | medium | no | M | Expand/collapse toggle is not an accessible control | `toggle.ts` host (86-91, 98-101) | Pick a model: (a) real button — `role="button"`, tabindex, `aria-label`, `aria-expanded`, Enter/Space; or (b) `aria-hidden="true"` and rely on the treeitem's `aria-expanded` + arrows. Currently a clickable icon with no role/name/focus. |
| A7 | medium | no | M | Per-row action button has no role/name | `core/option/action.ts` host (46-54), used via `tree-option.html` 19-23 | Give `kbq-option-action` `role="button"` (or native `<button>`) + a required `aria-label` input; integrate into roving focus. Fails WCAG 4.1.2. Shared core component — fix benefits list too. |
| A8 | medium | no | S | No type-ahead character search | `tree-selection.component.ts` FocusKeyManager (288-290) | Add `.withTypeAhead()`; **also add `getLabel()` to `KbqTreeOption`** (e.g. `return this.viewValue`) — `withTypeAhead()` throws if any item lacks `getLabel`. The `getLabel` addition is additive public API (needs `approve-api`). Siblings list/select/dropdown all use it. |
| A9 | medium | no | M | Left doesn't move to parent; Right doesn't move to first child | `tree-selection.component.ts` onKeyDown LEFT/RIGHT (395-402) | Left: if expandable+expanded → collapse, else → focus parent (`treeControl.getParents` + `keyManager.setActiveItem`). Right: if collapsed → expand, if expanded → focus first child. Deviates from the WAI-ARIA tree pattern; uses existing internals, no API change. |
| A10 | medium | no | M | Pseudo-checkbox tri-state not exposed to AT | `tree-option.html` (6); `checkboxState` (203, 240-254) | Bind `aria-checked` (true/false/`mixed`) on the treeitem in checkbox mode, mapping `indeterminate`→`mixed`; update on descendant change. Needs role (A1). |
| A11 | medium | no | S | Missing `aria-multiselectable` on the tree container | `tree-selection.component.ts` host; `multiple` getter | Bind `'[attr.aria-multiselectable]': 'multiple || null'` on the `role="tree"` host. Only meaningful once `role="tree"` (A12) exists. |
| A12 | medium | no | S | Container has no `role="tree"` | `tree-selection.component.ts` host (123-131); `tree.ts` | Add `'role': 'tree'`; pair with an accessible name (A13). Apply to `KbqTree` too. Root cause that makes the whole pattern legible to AT; anchor for A1/A2/A5/A10/A11. |
| A13 | low | no | S | Tree container exposes no accessible name | `tree-selection.component.ts` host (no `aria-label`/`aria-labelledby`) | Add optional `aria-label`/`aria-labelledby` inputs (additive) bound on the `role="tree"` host; when `inSelect`, associate with the form-field label. Conditional on A12. |
| A14 | low | no | M | Roving-tabindex model undocumented; container stays tabbable | `tree-selection.component.ts` host tabindex (125); option tabindex (88) | Pick one model fully: bind `'[attr.aria-activedescendant]'` to `keyManager.activeItem.id` (ids already exist), OR switch the active option to `tabindex=0` (roving) and drop the container from tab order. Current hybrid advertises neither. Needs A1/A12. |

### Theme 2 — Correctness / Bugs

| # | Sev | Brk | Effort | Title | Location | Fix & rationale |
|---|---|---|---|---|---|---|
| C1 | medium | no | S | `selectAllOptions` emits change with `undefined` option | `tree-selection.component.ts` (546-564) | Guard: when `changedOptions.length === 0`, skip the `selectionChange.emit` (scope so `onSelectAll.emit` still fires if intended). Ctrl+A on an all-disabled / all-already-selected tree emits `{option: undefined}`, violating the non-optional `option` type → consumer `event.option.data` throws. |
| C2 | medium | no | S | Toggle `filterValue` subscription never unsubscribed (leak) | `toggle.ts` constructor (51-56) | Pipe through `takeUntilDestroyed(inject(DestroyRef))` (the sibling `padding.directive.ts:63` already does this). One toggle per expandable row subscribes to a long-lived `BehaviorSubject`; destroyed rows leak subscribers + retain the directive. |
| C3 | low | no | S | `dataDiffer` not reset when `dataSource` is swapped | `tree-base.ts` `switchDataSource` (257-277) | Recreate `this.dataDiffer = this.differs.find([]).create(this.trackBy())` so a new source starts from an empty baseline. Swapping to a new source whose stream emits an identical-by-trackBy array yields a null diff → **stale** (not blank) rows. Narrow (needs a custom stable trackBy). |
| C4 | low | no | S | `unorderedOptions.changes` subscription lacks `takeUntilDestroyed` | `tree-selection.component.ts` ngAfterContentInit (286) | Add `.pipe(takeUntilDestroyed(this.destroyRef))` like the four sibling subscriptions. Inconsistent with neighbours; self-contained cycle so impact is limited, but a possible stale handler during teardown. |
| C5 | low | no | S | Redundant double change-detection per render | `tree-selection.component.ts` `renderNodeChanges` (525-536); base (169) | Collapse to a single `detectChanges` per render (prefer the outlet pass; verify the `sortedNodes` recompute at 533 still runs). Test carefully — the base call is shared by all `KbqTreeBase` consumers. |
| C6 | low | no | M | `FlatTreeControl.getParents` silently no-ops without `node.parent` | `control/flat-tree-control.ts` (84-92) | Self-derive parents via level scanning (like `getDescendants`), OR formally require `.parent` and have `KbqTreeFlattener` set `flatNode.parent = parent` during transform. Tri-state roll-up and ancestor filtering silently break if a consumer's `transformFunction` omits `.parent`. All shipped examples set it — a foot-gun, not a defect in supported usage. |
| C7 | low | no | S | `allowFocusEscape` setTimeout not cleared on destroy | `tree-selection.component.ts` (736-745) | Store the timeout id and `clearTimeout` in `ngOnDestroy`, or use `destroyRef.onDestroy`, or route via the existing `AsyncScheduler`. A dangling macrotask can `markForCheck` after destroy (tolerated today, fragile). |
| C8 | low | no | S | `highlightSelectedOption` focuses `selected[0]`, wrong/stale target | `tree-selection.component.ts` (361-363, called from focus 353) | On a `find()` miss, fall back to `keyManager.setFirstItemActive()`/`setActiveItem`; prefer `keyManager.activeItem` when present. In multiple mode it jumps to the first-inserted (not last-active) row; after a data swap before reconcile, no row gets focused. Narrow, self-heals on arrow key. |
| C9 | low | breaking *only if made async* | L | `NestedTreeControl._getDescendants` assumes synchronous `getChildren` | `control/nested-tree-control.ts` (29-49) | **Document** that `getChildren` must emit synchronously (sound, non-breaking). Do **not** change `getDescendants` to return `Observable` — that breaks the `TreeControl` interface and all sync callers. Faithful copy of CDK's sync-data constraint; no async usage exists in repo. Latent foot-gun only. |

### Theme 3 — Change Detection & Performance

| # | Sev | Brk | Effort | Title | Location | Fix & rationale |
|---|---|---|---|---|---|---|
| P1 | medium | no | M | No default `trackBy` → full view rebuild on data replacement | `tree-base.ts` trackBy input (51), dataDiffer (107) | Provide a sensible default `trackBy` (track by `treeControl.getValue(node)` when available); show trackBy in the docs example. Replacing `dataSource.data` re-flattens to a new array; identity diff destroys+recreates every row and forces `syncSelectionModelToDataNodes`. Correctness preserved; pure avoidable cost. |
| P2 | medium | no | M | Checkbox tri-state recompute is O(options × depth × n) | `tree-option.component.ts` updateCheckboxState (240-254), descendants* (220-230), updateParents* (232-238), markForCheck (398-404) | Compute descendants **once** and derive all/partial/none in a single pass (don't call `getDescendants` twice); avoid recompute inside `markForCheck` on every CD mark; cache `getDescendants` keyed by node while `dataNodes` is unchanged. Fires only in tri-state expandable checkbox mode, but select-all/deep-selection do redundant double `getDescendants` per option × ancestors. |
| P3 | medium | no | S | Toggle leaks a `filterValue` subscription per row (CD angle) | `toggle.ts` (55) | **Same fix as C2** (`takeUntilDestroyed`) — dedup with C2. Listed under both correctness and CD; growing per-emission CPU + retained directives. |
| P4 | low | no | L | No virtual-scroll support/guidance for large lists | `tree-base.ts` eager `createEmbeddedView`; `viewChange` MAX_VALUE (59-65) | At minimum **document** that all expanded nodes render eagerly; ideally implement the long-standing `viewChange` windowing (emit visible start/end so the flat source can slice) or provide a `cdk-virtual-scroll` pattern mirroring select/list. |
| P5 | low | no | M | Template-bound getters re-run treeControl work each CD pass | `tree-option.component.ts` disabled (131-134), isExpandable (191-193); `toggle.ts` iconState; `tree-base.ts` isExpanded/level | Migrate hot derived state to signals/`computed()` (memoized); also stop binding `disabled` twice in host (class + attr). Individually cheap O(1) calls; compound across rows. Tangled with the accessor-input migration. |
| P6 | low | no | M | Per-option focus/blur subscriptions rebuilt for the whole list on every change | `tree-selection.component.ts` optionFocus/BlurChanges (191-197), listenToOptionsFocus (764-776), resetOptions (747-750) | Consider a single delegated `focusin`/`focusout` listener at the tree root (O(1) wiring); a proper `trackBy` (P1) also cuts rebuild frequency. Every structural change drops/re-merges N per-row Subjects. |

### Theme 4 — Architecture / coupling

| # | Sev | Brk | Effort | Title | Location | Fix & rationale |
|---|---|---|---|---|---|---|
| AR1 | medium | no | M | Fragile global static node handoff (`KbqTreeNode.mostRecentTreeNode`) | `tree-base.ts` static (289), ctor (317), insertNode (224-226) | Pass node data through the embedded-view context (`KbqTreeNodeOutletContext.$implicit` already carries it; already consumed at tree-selection 730) and read from context instead of a mutable static. Relies on synchronous ctor ordering right after `createEmbeddedView`; breaks under deferred views; leaks a stale global. Public `data` getter/setter can stay. |
| AR2 | medium | no | L | Mid-migration: standalone vs NgModule + decorator vs signal inconsistency | `tree.module.ts`; many `// TODO: Skipped for migration` across base/selection/option/toggle/padding | Track as **one epic**: resolve the base/subclass `treeControl` input-type conflict (the documented blocker), convert constructor injection → `inject()`, move local state to signals/`computed`, then deprecate (not remove) `KbqTreeModule`. Mostly non-breaking if `KbqTreeModule` is only deprecated. |
| AR3 | medium | no | M | Option↔parent coupling via untyped `tree: any` token | `tree-option.component.ts` token (44), field (209), usages throughout | Define a narrow `KbqTreeOptionParent` interface (`selectionModel`, `treeControl`, `showCheckbox`, `multiple`, `inSelect`, `setSelectedOptionsByClick`, `optionShouldHoldFocusOnBlur`) and type both the `InjectionToken` and `tree`. Mirrors the existing `KBQ_OPTION_PARENT_COMPONENT` pattern in core. Narrowing the *token* type is non-breaking; the public `tree` field is API1. |
| AR4 | low | no | S | `KbqTreeNodePadding` hard-depends on concrete `KbqTreeOption` | `padding.directive.ts` ctor (60), ngAfterViewInit (67) | Make the `option` dependency `@Optional()` with a graceful fallback, or hoist `isToggleInDefaultPlace` onto `KbqTreeNode` (the same ctor already uses `@Optional() Directionality`). Latent extensibility smell; all shipped usage is on options. |
| AR5 | low | no | L | Stale hard-fork of CDK tree with no upstream-sync path | whole `tree-base.ts` etc.; TODO at 59; corrupted `MсTreeFlattener` (Cyrillic `с`) at `flat-data-source.ts:129` | **Quick win:** remove the upstream-author `TODO(tinayuangao)` comment, fix the Cyrillic `MсTreeFlattener` JSDoc typo, add a comment recording the CDK version this was forked from. **Do not** thin-wrap CDK (large, risks public exports) without an RFC. The two concrete defects are cosmetic; the fork is a deliberate library-wide convention. |
| AR6 | low | no | L | `KbqTreeSelection` is an 811-line god-class | `tree-selection.component.ts` (134-811) | Optional, low priority: extract a key-manager/focus controller, a selection-model reconciler, and a copy handler; keep `KbqTreeSelection` as CVA orchestrator. Many cited members are public/DI-consumed, so "no API break" is not guaranteed. The sibling `KbqListSelection` is larger (954 lines) with the same shape — this is the established convention. Defer unless actively refactoring. |
| AR7 | low | no | M | Duplicated `getHeight`/SSR-guard + two sources of truth for selection | `tree-option.component.ts` getHeight (322-329) / `tree-selection.component.ts` getHeight (694-701) | Extract the SSR-safe height helper to a shared util (small, safe). Longer term make `SelectionModel` the single source and derive `option.selected` (touches the public `selected` getter/setter → check-api review). `option._selected` mirrors `selectionModel`, the root cause of the reconciliation complexity. |
| AR8 | medium | **breaking** *(if removed)* | M | Dead/unused: bare `KbqTree`, `NestedTreeControl`, `KbqTreeNestedDataSource`, nested-render path | `tree.ts` (21); `control/nested-tree-control.ts`; `data-source/nested-data-source.ts`; `tree-base.ts` parentData branch (208-211) | Decide: build a real nested example + tests to justify them, OR deprecate and remove in a major (reworks the tree-select DI token that uses `KbqTree`). Resolve the Russian `getDescendants/_getDescendants` TODO if kept. `<kbq-tree>` is never instantiated (only a DI token). Needs an RFC for the removal path. |
| AR9 | low | no | S | `tree-errors.ts`: one unused factory | `tree-errors.ts` `getTreeControlFunctionsMissingError` (37-39) | Delete the single dead factory. (The barrel omission and duck-typing are already consistent — no further action.) |

### Theme 5 — Modern Angular

> All of these are convention/modernization items (the repo is openly mid-migration with `// TODO: Skipped for migration` markers). **None are runtime defects.** Group with AR2 as one migration epic. Most are non-breaking; the ones touching exported-class **constructors** are technically breaking for external subclassers and require `approve-api`.

| # | Sev | Brk | Effort | Title | Location & fix |
|---|---|---|---|---|---|
| M1 | medium | no | M | Toggle ctor injection + accessor `@Input`s + (leak) | `toggle.ts` (51-56, 21-30, 34-45) → `inject()` for `tree`/`treeNode`; pipe `filterValue` through `takeUntilDestroyed` (= C2/P3); migrate `recursive`/`disabled` to `input()` with `booleanAttribute`. `disabled` is written internally → feed an input into a signal, not a plain `input()`. |
| M2 | low | no | M | `KbqTreeSelection` uses constructor injection | `tree-selection.component.ts` (261-283) → field `inject()` for elementRef/scheduler/differs/CDR/clipboard; read `multiple` via `getAttribute`; keep `super(differs, changeDetectorRef)`. |
| M3 | low | **breaking** | M | `KbqTreeOption` uses constructor injection | `tree-option.component.ts` (205-212) → `inject()`; coordinate with base `KbqTreeNode` (super call). Constructors are tracked public API → `approve-api` + breaking for external subclassers. |
| M4 | low | **breaking** | L | `KbqTreeBase` ctor injection + decorator `@Input`/`@ViewChild`/`@ContentChildren` | `tree-base.ts` (101-104, 43, 86-97, 54, 57) → `inject()` for differs/CDR; `contentChildren()`/`viewChild()` once the subclass override is reconciled; `treeControl`/`dataSource` → `input()` is breaking, coordinate with the subclass narrowing (the documented blocker). |
| M5 | low | no\* | M | `KbqTreeNode` base uses constructor injection | `tree-base.ts` (313-318) → migrate **carefully**: base injects via `KbqTreeBase`, subclass injects `tree` via `KBQ_TREE_OPTION_PARENT_COMPONENT` (different tokens, coincide only via `useExisting`). The naive "drop super()" fix is unsound. \*ctor is in api.md. |
| M6 | low | no | S | `KbqTreeNodePadding` uses constructor injection | `padding.directive.ts` (55-64) → `inject()` fields; move `dir.change` subscription to field-init/init. DI-only, no API impact. |
| M7 | low | no | S | `KbqTreeNodeOutlet` uses constructor injection | `outlet.ts` (7-10) → `readonly viewContainer = inject(...)`, `readonly changeDetectorRef = inject(...)`; keep public names (consumed by `KbqTreeBase`). |
| M8 | low | no\* | S | Plain `@Output` EventEmitters should be `output()` | `tree-selection.component.ts` selectionChange (168), onCopy (172); `tree-option.component.ts` userInteraction (162) → `output()`; verify `this.onCopy.observed` still works (it does on `OutputEmitterRef`). \*changes the declared type in api.md → re-approve. |
| M9 | low | no | M | Decorator `@ViewChild`/`@ContentChildren` instead of signal queries | `tree-selection.component.ts` (158, 160); `tree-option.component.ts` (105) → `viewChild()`/`contentChildren()`; replace `unorderedOptions.changes` with `effect()`/`toObservable()`. `parentTextElement` is read externally via `KbqTitleTextRef` — migrate in lockstep. |
| M10 | low | **breaking** | M | `treeControl` input typed `FlatTreeControl<any>` | `tree-selection.component.ts` (164) → parameterize on a concrete node type; batch into the `@Input()`→`input()` breaking set. Root cause is `extends KbqTreeBase<any>`. |
| M11 | low | no\* | L | `KbqTreeOption` state mutated via `markForCheck`, not signals | `tree-option.component.ts` `_selected`/`_disabled`/`hasFocus`/`checkboxState` (144, 176, 189, 203, 260-358) → move `hasFocus`/`checkboxState` to `signal()`/`computed()` (mirror button's `disabledSignal` shim to keep public getters). \*bare public fields need getter wrappers to avoid a type change. |
| M12 | low | no | M | `KbqTreeNodePadding` `indent` is an accessor `@Input` | `padding.directive.ts` (28-37) → `input(12, { alias, transform })` + `effect()` driving `setPadding()`; replicate the `setIndentInput` CSS-unit side effect. |
| M13 | low | no\* | L | `renderedOptions`/`unorderedOptions` reconciled imperatively | `tree-selection.component.ts` (143, 707-722, 285-332) → lower priority. FocusKeyManager needs a live QueryList and ordering depends on ViewContainer order, so a clean signal conversion is constrained. \*both are public fields read externally. |

### Theme 6 — API & Typing

| # | Sev | Brk | Effort | Title | Location | Fix & rationale |
|---|---|---|---|---|---|---|
| API1 | high | **breaking** | M | Pervasive `any` on `KbqTreeOption` public members (`value`, `disabled`, `showCheckbox`, `tree`) | `tree-option.component.ts` (119-127, 136, 155, 209, 360) | Type `tree` as a narrow `KbqTreeOptionParent` interface (biggest win; avoids the option↔selection circular import); type boolean-coercion setters as `BooleanInput`/`unknown`, getters `boolean`; generic-ize `value` when the component becomes generic. `tree: any` erases checking across the option's entire interaction surface; violates the project's "avoid any" rule. Narrowing public `tree` is breaking for subclassers → `approve-api`. |
| API2 | medium | **breaking** | L | Consumer-facing components hardcode `KbqTreeBase<any>` | `tree.ts` (21); `tree-selection.component.ts` (135, 164) | Long-term: make `KbqTree<T>`/`KbqTreeSelection<T>` generic so node type flows to treeControl/dataSource/values/events — **major + RFC**. Short-term: document the limitation. `unknown` substitution is only safe for the bare `KbqTree` passthrough. All consumer-side type inference on the node type is currently lost. |
| API3 | medium | **breaking** *(if tightened)* | M | Large internal surface exposed as public (rendering engine + helpers) | `tree-base.ts` renderNodeChanges/getNodeDef/insertNode/viewChange/nodeOutlet/nodeDefs; many `KbqTreeSelection` methods | Audit each member: template-only → `protected`; sibling-used (e.g. `setSelectedOptionsByClick`) → keep public + `@docs-private` (non-breaking, clarifies intent); truly internal → `private`. Visibility tightening is breaking → batch into a major. CDK rendering machinery + dozens of collaboration methods are public/undocumented, freezing implementation details as contract. |
| API4 | low | no | S | `KbqTreeOptionChange.isUserInput` deprecated in prose but no `@deprecated` tag | `tree-option.component.ts` (46-61) | Add `/** @deprecated Will be removed in v20. */` on the field and ctor param; re-run `approve-api`. Tooling won't surface the deprecation before the v20 removal. |
| API5 | low | no | S | CVA surface fully `any`-typed; `registerOnTouched(fn: () => {})` typo | `tree-selection.component.ts` writeValue (585), onChange (598), getSelectedValues (670), registerOnTouched (608) | Fix `registerOnTouched(fn: () => void)` (non-breaking widening; matches Angular CVA; the same typo exists in autocomplete/select/tree-select — fix together); type the value surface to the node generic later. Requires `approve-api`. |
| API6 | low | breaking *(snapshot line)* | S | Private `SelectionModelOption` type leaks into public API | `tree-selection.component.ts` (104-107, 147) | Type `selectionModel` honestly as `SelectionModel<any>` (or an exported node type) — removes the `ae-forgotten-export` warning; the declared `{id,value}` shape is fiction (it stores raw nodes). Re-run `approve-api`. Currently un-importable, so not an unexpected consumer break. |
| API7 | low | no | S | `KBQ_SELECTION_TREE_VALUE_ACCESSOR` and `KBQ_TREE_OPTION_PARENT_COMPONENT` typed `any` | `tree-selection.component.ts` (60); `tree-option.component.ts` (44) | Type the provider const as `Provider`; type the token `InjectionToken<KbqTreeSelection>` or a parent interface (dodges the circular import). Token narrowing is low-risk; needs `approve-api`. Reinforces AR3/API1. |
| API8 | low | **breaking** | L | `TreeControl` generic design: `getDescendants` returns `any[]`, `getParents(node: any)`, loose `value` typing | `control/tree-control.ts` (36); `control/flat-tree-control.ts` (84, 24, 28, 30, 94) | Tighten the interface return to `T[]` (matches impls); add a value generic `TreeControl<T, V = any>`; `getParents(node: T)`. Interface changes break custom implementers → major + RFC. |
| API9 | low | no\* | M | Null-safety gaps on public inputs | `tree-base.ts` treeControl (43), dataSource setter (91); `tree-option.component.ts` disabled getter (133) | Remove the inconsistent `this.tree!` vs unguarded `this.tree.treeControl` on line 133 (safe). Add `\| null` to the `dataSource` setter type since the code already branches on falsy. \*retyping inputs alters api.md → `approve-api`. |
| API10 | low | **breaking** | M | Output naming: `on`-prefixed outputs vs Angular convention; raw public Subjects | `tree-selection.component.ts` onSelectAll/onCopy (170, 172); `tree-option.component.ts` onSelectionChange (161), onFocus/onBlur (99-101) | For a major: rename `on*` outputs to drop the prefix (`selectAll`/`copy` are free); expose `onFocus`/`onBlur` as `asObservable()` (update internal merge consumers at 192/196). All renames breaking → deprecation aliases in a major. Public raw `Subject`s let consumers `.next()` fake events. |
| API11 | low | no *(with `@docs-private`)* | S | Exported surface not minimal: default filter classes + flattener internals public | `public-api.ts` (3); `flat-tree-control.filters.ts`; `flat-data-source.ts` | Keep `FlatTreeControlFilter` + `FilterByValues` + `kbqTreeSelectAllValue` public (extensibility); add `@docs-private` to the two default filters (`FilterByViewValue`/`FilterParentsForNodes`) and to `flattenNode`/`flattenChildren`. Non-breaking. |

### Theme 7 — Tests

| # | Sev | Effort | Title | Location | What to add |
|---|---|---|---|---|---|
| T1 | high | M | Checkbox tri-state / indeterminate / parent cascade untested | `tree-option.component.ts` updateCheckboxState; `tree-selection.component.ts` setStateChildren (680-688) | Assert `option.checkboxState` === checked/indeterminate/unchecked for all-/some-/none-selected children; test `setStateChildren(parent, true/false)` cascades into the model. Use `fakeAsync`/`tick` (state runs via `Promise.resolve().then`). Public API with multiple consumers, validated only by Playwright pixels today. |
| T2 | medium | M | Keyboard navigation almost entirely untested | `tree-selection.component.ts` onKeyDown (374-429) | A "keyboard navigation" describe dispatching real keydown (DOWN/UP/HOME/END/PAGE_UP/PAGE_DOWN/SPACE/ENTER/LEFT/RIGHT/TAB); assert `activeItemIndex`, `navigationChange`, expansion toggles, selection + `selectionChange`, tabOut/`allowFocusEscape`. The primary interaction model; spec only dispatches C and Ctrl+A. |
| T3 | medium | M | Disabled-item behaviour has no unit coverage | `tree-option.component.ts` selectViaInteraction/focus/onMouseenter; `tree-selection.component.ts` selectAllOptions/selectActiveOptions | Fixture with an `isDisabled` predicate: assert disabled click is a no-op, Ctrl+A excludes disabled, shift-range skips disabled, disabled doesn't gain `kbq-focused` on hover. |
| T4 | medium | S | `noUnselectLast`/`canDeselectLast` guard untested | `tree-selection.component.ts` canDeselectLast (800-802) + call sites | With `noUnselectLast=true` assert the only selected node stays selected on re-click/ctrl-click/space; with `=false` assert it clears; cover the shift-range branch. Off-by-one (`selected.length === 1`) across 4 paths; the sibling list tests this. |
| T5 | medium | M | Toggle directive/component behaviour untested | `toggle.ts` (51-70, 47-49) | Un-skip/fix the expand/collapse test; add recursive (`toggleDescendants`), `stopPropagation` (toggle doesn't select row), filter auto-disable, and a teardown test for the `filterValue` subscription (C2). The primary toggle→expand path IS partially covered (filter-restore test); recursive/guard/leak paths aren't. |
| T6 | medium | M | Padding directive coverage is one happy-path assertion | `padding.directive.ts` (71-78, 116-121, 100-114, 39-47) | Test deeper-level `paddingLeft = level*indent+leftPadding`; RTL (`Directionality` rtl → `paddingRight`, reacts to `dir.change`); `withIcon=false` adds `iconWidth`; string indent with custom units (surfaces a latent `px`-hardcode bug). Reuse `expectFlatTreeToMatch` on a non-disabled fixture. The only active padding test is tautological. |
| T7 | low | M | `FlatTreeControl` filter pipeline + lookup helpers lack direct tests | `control/flat-tree-control.ts`; `flat-tree-control.filters.ts` | Add `flat-tree-control.filters.spec.ts` (each filter in isolation incl. the selectAll sentinel pop); direct tests for `getDescendants`/`getParents`/`hasValue`/save+restore expansion. |
| T8 | medium | M | Flattener + flat data-source change-stream branches untested | `data-source/flat-data-source.ts` expandFlattenedNodes (94-117), flattenNode async (61-64), connect (162-183), handlers (185-197) | Add `flat-data-source.spec.ts`: `flattenNodes` on array + Observable children, `expandFlattenedNodes` with mixed expansion, marble/TestScheduler test of `connect()` (filter vs expansion discrimination). Core data-shaping algorithms where an off-by-one in the level loop corrupts which nodes render. |
| T9 | low | S | CVA edge cases + `setDisabledState` untested | `tree-selection.component.ts` writeValue/setOptionsFromValues/setDisabledState/getSelectedValues (585-674) | `writeValue('x')` throws in multiple mode; `writeValue(null)` clears; unknown value ignored; `setDisabledState(true)` marks options; `getSelectedValues` scalar (single) vs array (multiple). Forms-integration boundaries; only exercised via ngModel today. |
| T10 | low | M | Nested tree has no component-level test | `data-source/nested-data-source.ts`; `nested-tree-control.ts` | Render `KbqTreeNestedDataSource` + `NestedTreeControl`: children render on expand, level/padding from parentData, `getDescendants` with sync + delayed `getChildren`. Couples with AR8 — if nested is removed, this is moot. |
| T11 | low | M | No teardown/subscription-leak tests | `tree-selection.component.ts` ngOnDestroy (339-343); `tree-base.ts` (114-125); `toggle.ts` | Spy on `dataSource.disconnect`/`focusMonitor.stopMonitoring`, assert called on `fixture.destroy()`; assert focus/blur subs nulled across re-renders; regression test for the toggle leak (after C2). `title.directive.spec` already has the exact pattern. |
| T12 | medium | M | No AXE/ARIA/role assertions in the tree suite | `tree-selection.component.spec.ts` (whole) | After the a11y epic lands: an AXE check over single/checkbox/disabled configs; assert roles + `aria-selected`/`expanded`/`disabled`; assert the real `document.activeElement` during keyboard nav (not just CSS classes). The activeElement assertion is independently actionable now. |
| T13 | medium | M | Many disabled/skipped tests mask coverage | `tree-selection.component.spec.ts` xit (81, 222), xdescribe (509), it.skip (132) | Re-enable + repair the `xit`/`xdescribe` tests (rendered-data correctness, `when`-predicate templates); convert the DS-5079 `it.skip` into a failing-then-fixed test with a linked issue. "todo need recover" markers indicate drift; the green suite overstates coverage. |

### Theme 8 — Styling / Theming

| # | Sev | Effort | Title | Location | Fix & rationale |
|---|---|---|---|---|---|
| S1 | medium | S | Toggle padding references undefined token `--kbq-tree-size-toggle-padding` | `toggle.scss` (12-14) | Declare `--kbq-tree-size-toggle-padding` in `tree-tokens.scss` mapped to a `--kbq-size-*` token (confirm value vs design spec), or add a `var()` fallback; remove the FIXME. The `var()` has no fallback and the token is defined nowhere → the toggle gets 0 horizontal padding (reduced hit area). Author flagged it with `// FIXME`. |
| S2 | medium | S | Option text padding reads a foreign list token | `tree-option.scss` (52-53) | Use the tree's own `--kbq-tree-size-text-padding-vertical` (declared at `tree-tokens.scss:9` but unused); the list token `--kbq-list-size-text-padding-vertical` is defined nowhere here, so it silently resolves to 0 and the tree's intended 3xs padding is dropped. Cross-namespace coupling + latent visual regression + a dead tree token. |
| S3 | low | S | Theme + typography mixins emitted 3× under `ViewEncapsulation.None` | `tree.scss` (7-8), `tree-selection.scss` (7-8), `toggle.scss` (33-34) | Include `kbq-tree-theme()`/`kbq-tree-typography()` exactly once from one root stylesheet always loaded with the tree (mirror button/list single-include). Each component points at a different root scss; all are None-encapsulated → identical global blocks duplicated 3×. Harmless but ~3× redundant CSS. |
| S4 | low | S | Caption typography targets non-existent `.kbq-tree-option-caption` | `_tree-theme.scss` (94) | Rename the selector to `.kbq-option-caption` (matches the markup + the color rule at line 23). Dead rule (extra `-tree-` segment); caption never gets text-compact typography. Cosmetic. |
| S5 | low | no *(token surface)* | M | Dead pressed/active-state tokens declared but unconsumed | `tree-tokens.scss` (19, 34, 36) | Either implement the active state in `_tree-theme.scss` (`&:active:not(.kbq-disabled)` consuming the tokens, mirror `_button-theme.scss`) or remove the tokens. Removal touches the public token surface (not the TS api guard). Three `*-active-container-background` tokens have zero consumers. |
| S6 | low | no *(token surface)* | S | Unused token `--kbq-tree-size-container-content-gap-vertical` | `tree-tokens.scss` (7) | Map to a `--kbq-size-*` token (not a raw `0px`) and wire into layout, or remove. The horizontal sibling IS consumed; this may be intentional design-system parity with list. |

---

## 3. Recommended execution order / phasing

### Phase 0 — Trivial cleanups (zero risk, no API/snapshot impact)
AR5 (remove `TODO(tinayuangao)` + fix the Cyrillic `MсTreeFlattener` typo + add a fork-provenance comment) · AR9 (delete the single dead `getTreeControlFunctionsMissingError`) · API9-partial (remove the `this.tree!` inconsistency on `tree-option` line 133) · S4 (rename caption selector) · S3 (de-dupe theme/typography includes).

### Phase 1 — Quick-win bug fixes (small, mostly non-breaking, high value)
- **C2 / P3 / M1(leak part)** — fix the toggle `filterValue` subscription leak with `takeUntilDestroyed` (one change resolves three findings)
- **C1** — guard `selectAllOptions` against emitting `{option: undefined}`
- **C4** — add `takeUntilDestroyed` to `unorderedOptions.changes`
- **C7** — clear the `allowFocusEscape` timeout on destroy
- **C8** — `highlightSelectedOption` fallback to the key manager on miss
- **C3** — reset `dataDiffer` on data-source swap
- **C5** — collapse the redundant double `detectChanges` (test against all `KbqTreeBase` consumers)
- **S1 / S2** — declare the missing toggle-padding token; use the tree's own text-padding token (visual fixes)
- **API4 / API5 / API6 / API11** — `@deprecated` tag; `registerOnTouched(fn: () => void)`; honest `selectionModel` type; `@docs-private` on default filters/flattener internals (each → `approve-api`)

### Phase 2 — Performance (medium effort, non-breaking, additive)
P1 (default `trackBy`, also reduces selection reconciliation + P6 rebuild frequency) + docs example · P2 (single-pass checkbox descendant computation + avoid recompute on every `markForCheck`) · P4 (document eager rendering; schedule virtual-scroll as a larger follow-up) · P5/P6 (getter memoization, delegated focus listener — lower priority, partly entangled with M11/M13).

### Phase 3 — Accessibility epic (RFC FIRST, then implement as one unit)
> RFC because adopting `role="tree"`/`treeitem` is a deliberate departure from the `KbqListSelection` "no roles" convention and must be consistent across siblings. Implement roles + states together.
- Core roles/structure: **A12 (role=tree) → A1 (treeitem) → A3+A4 (aria-level/setsize/posinset)**
- States on top of roles: **A2 (aria-expanded), A5 (aria-disabled), A11 (aria-multiselectable), A10 (aria-checked tri-state), A13 (accessible name)**
- Focus model: **A14 (aria-activedescendant or true roving tabindex)**
- Keyboard completeness: **A8 (type-ahead + `getLabel`), A9 (Left→parent / Right→child)**
- Interactive sub-controls: **A6 (toggle), A7 (action button — shared core component, coordinate with list)**
- Then **T12** (AXE + ARIA assertions) once the component exposes the semantics.

### Phase 4 — Test backfill (non-breaking, can run in parallel with Phases 1–3)
High value first: **T1, T2, T3, T4, T5, T6, T8.** Then **T9, T7, T11, T13.** **T10** only if AR8 keeps nested support.

### Phase 5 — Modern-Angular migration epic (mostly non-breaking; some breaking — see §4)
> One coordinated epic (AR2). Resolve the base/subclass `treeControl` input-type conflict first (the documented blocker for `input()`).
- Non-breaking mechanical: **M2, M6, M7** (ctor → `inject()` for DI-only classes), **M8** (`output()` — re-approve snapshot), **M12, M9, M11, M13** (signals/queries, lower priority)
- Breaking, batch into a major: **M3, M4, M5** (ctor changes on exported classes), **M10** (treeControl typing)
- **AR1** (replace the static node handoff with embedded-view context) can land independently; non-breaking.
- **AR3 / API7** (narrow the option-parent token + interface) — internal token narrowing is non-breaking and unblocks API1.
- **AR4** (decouple padding from the concrete option), **AR7** (shared height util) — small, non-breaking.

### Phase 6 — Larger / breaking refactors (RFC + major release)
**API1** (type `tree` field / boolean setters) · **API2** (generic `KbqTree<T>`/`KbqTreeSelection<T>`) · **API3** (tighten visibility) · **API8** (TreeControl interface generics) · **API10** (rename `on*` outputs + `asObservable` Subjects, with deprecation aliases) · **AR8** (decide nested support; reworks the tree-select DI token) · **AR6** (god-class extraction — optional) · **S5/S6** (token-surface changes) · **AR5 option (b)** / de-fork to thin-wrap CDK — only on a strategic decision.

---

## 4. Backward-incompatible changes (call-outs)

These change the public API (`tools/public_api_guard/components/tree.api.md`) and/or visible contract. Each needs `approve-api`; most need an **RFC + major release** with deprecation aliases:

1. **API2** — making `KbqTree`/`KbqTreeSelection` generic (`<T>`). RFC.
2. **API1** — narrowing the public `tree: any` field on `KbqTreeOption`. Breaking for external subclassers.
3. **API8** — tightening the `TreeControl` interface (`getDescendants: T[]`, value generic, `getParents(node: T)`). Breaks custom implementers. RFC.
4. **API3** — reducing visibility (public → `protected`/`private`) of the rendering machinery and collaboration methods. (`@docs-private` alone is non-breaking; visibility changes are not.)
5. **API10** — renaming `on`-prefixed outputs and converting the public `onFocus`/`onBlur` Subjects to Observables. Ship deprecation aliases.
6. **AR8** — removing the bare `KbqTree`, `NestedTreeControl`, `KbqTreeNestedDataSource`, nested-render path. Also reworks the `tree-select` DI token. RFC.
7. **M3 / M4 / M5** — converting exported-class **constructors** to `inject()` removes documented constructor params (breaking for external instantiation/subclassing).
8. **M10** — `treeControl` input retyping (coupled to the `@Input()`→`input()` batch).
9. **C9 (do NOT adopt the async variant)** — making `NestedTreeControl.getDescendants` return `Observable` would break the interface and all sync callers; **only document the sync constraint** instead.

**Non-breaking but requires `approve-api` snapshot re-approval** (safe to land outside a major): API4, API5, API6, API7, API11, M8 (declared-type change `EventEmitter`→`OutputEmitterRef`), API9 (dataSource setter `| null`), and A8's `getLabel` addition.

**Additive / behaviour-only, no public-API impact:** the entire Accessibility epic (host attribute bindings + roles), all Test items, all Performance items (default `trackBy` only adds a default to an already-optional input), AR1/AR4/AR7, and SCSS S1–S4 (CSS variables/selectors are not in the TS api guard; S5/S6 touch the public *token* surface that downstream theme overrides may rely on, so treat token removal as a soft-breaking theming change).

---

## 5. Rejected findings (adversarially filtered)

For transparency, 12 raw findings were rejected by the adversarial verification pass as false or intentional. **They are not work items** — listed here so they are not re-raised:

| Rejected claim | Why rejected |
|---|---|
| `levels` Map in `KbqTreeBase` grows unbounded (memory leak) | Bounded / cleaned in practice; not a real leak. |
| `selectActiveOptions` derefs `options[toIndex]` when `activeItemIndex === -1` | Covered by the `fromIndex === -1` branch — no crash. |
| `syncSelectionModelToDataNodes` misses in-place data mutation | Behaviour is correct for the supported (immutable-replace) data flow. |
| `expandFlattenedNodes` leaks level state across siblings | The level-AND algorithm is correct. |
| `FilterParentsForNodes.handle` throws on undefined `prevFilter` | It does not throw — the optional chain handles it. |
| keyManager over a `.reset()`-driven `renderedOptions` desyncs `activeItem` | Not reproducible; index is updated consistently. |
| `getSortedNodes` casts viewRef `as any` / unguarded `.context.$implicit` | Acceptable for the embedded-view contract here. |
| Whole-tree `detectChanges()` on every render | This *is* C5 (counted once), not a separate finding. |
| No visible focus indicator for mouse/programmatic focus (keyboard-only ring) | Deliberate library convention (`.cdk-keyboard-focused` gating). |
| Inconsistent `readonly` on public mutable state fields | Not a defect. |
| Tests rely on "private" internals / event-faking hacks | The accessed members are public (no access modifier), so not brittle by that measure. |
| Focus state relies on `border-color` only, no `outline` | Deliberate design (matches the keyboard-focus ring pattern). |

---

*Generated by an automated multi-agent review with per-finding adversarial verification, plus a manual hand-read of all 24 source files. Treat as a high-signal engineering backlog; the Russian mirror is `docs/REVIEW.tree.RU.md`.*
