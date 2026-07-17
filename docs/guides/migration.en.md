## How to upgrade from Koobiq 17

New versions include improvements but also contain **breaking changes**; they must be applied step by step.

### Upgrade plan

1. **Up to 18.5.3**: a safe baseline with updated theming and icons.
2. **18.6**: token update.
3. **18.22**: component attribute changes.
4. **20.0.0**: the move to Angular 20: removal of deprecated APIs and package renames.
5. **20.2.0**: the move of the filter-bar API to signals.
6. **21.0.0**: one shared mechanism for dropdown panel width.

### 1. Upgrade to 18.5.3

```bash
npm install @koobiq/cdk@18.5.3
npm install @koobiq/components@18.5.3
npm install @koobiq/icons@^9.0.0
npm install @koobiq/design-tokens@~3.7.3
npm install @koobiq/angular-luxon-adapter@18.5.3
npm install @koobiq/date-adapter@^3.1.3
npm install @koobiq/date-formatter@^3.1.3
npm install luxon
npm install @messageformat/core
```

#### New theming

Theming is now simpler and built on CSS variables. [Theming. How to use](https://koobiq.io/en/main/theming/overview).

Examples:

- [apps/docs/src/main.scss](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/main.scss)
- [apps/docs/src/styles/\_theme-kbq.scss](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/styles/_theme-kbq.scss)

#### Icon package update

Install the new icon version:

```bash
npm install @koobiq/icons@9.1.0
```

To update icon names in templates, use the update tool (schematic):

```bash
ng g @koobiq/angular-components:new-icons-pack --project <your project>
```

### 2. Token update (18.6.x)

Deprecated color tokens were removed and typography parameter tokens were renamed.

The script will rename class and CSS-variable names to the new ones and highlight places where deprecated colors need to be removed (replaced):

```bash
ng g @koobiq/angular-components:css-selectors --fix=true --project <your project>
```

For manual review, add `--fix=false`. The script will highlight places where colors and typography names need to be removed (replaced):

```bash
ng g @koobiq/angular-components:css-selectors --fix=false --project <your project>
```

### 3. Attribute update (18.22.0)

Component attribute names have changed:

- **KbqLoaderOverlay**: compact → size
- **KbqEmptyState**: big → size

The schematic replaces the attributes automatically:

```bash
ng g @koobiq/angular-components:loader-overlay-size-attr --project <your project>
ng g @koobiq/angular-components:empty-state-size-attr --project <your project>
```

### 4. Upgrade to Angular 20

In version 20.0.0 the library moves to Angular 20. This is a major release: long-deprecated APIs were removed and some packages were renamed. Requirements: **Angular 20+** and **Node.js ≥ 20.19**.

Remove `@koobiq/cdk` from `package.json` — the package has been merged into `@koobiq/components/core`.

#### Running the migration

Most of the changes are applied by the `v20-upgrade` schematic (runs automatically):

```bash
ng update @koobiq/components@20
```

Or manually. To preview without writing — `--fix=false`:

```bash
ng g @koobiq/components:v20-upgrade --project <your project>
```

#### What is fixed automatically

**Package moves:**

- @koobiq/components/navbar-ic → navbar
- risk-level → badge
- @koobiq/components-experimental/form-field → @koobiq/components/form-field
- @koobiq/cdk/{a11y,keycodes,testing} → @koobiq/components/core

**Classes, tokens, functions:**

- KbqNavbarIc* → Kbq*,
- KbqRiskLevel* → KbqBadge*,
- toBoolean → booleanAttribute,
- formatDataSize → getFormattedSizeParts

**Instance methods:**

- .openPanel() → .open(),
- .toggleIsCollapsed() → .toggle(),
- .focusViaKeyboard() → .focus().

**Templates:**

- kbq-filter-search → kbq-search-expandable,
- kbq-datepicker-toggle → kbq-datepicker-toggle-icon,
- kbqFormFieldWithoutBorders → noBorders,
- [kbqWarningTooltip] → kbqTooltipModifier="warning" [kbqTooltip].

**SCSS:**

- .kbq-risk-level → .kbq-badge,
- .kbq-navbar-ic → .kbq-navbar, etc.

#### What you need to fix manually

The schematic emits warnings for what cannot be rewritten safely:

**(onSaveAsNew) on kbq-filters**: listen to `(onSave)` and check `$event.status === 'newFilter'`.

**File upload**. The `[customValidation]` and `[errors]` attributes → `FormControl` validators / `FormControl.errors`.

**App switcher**. `[apps]` → `[sites]="[{ id, name, apps }]"`.

**Validation.** **KbqValidateDirective** and **kbqDisableLegacyValidationDirectiveProvider()** were removed → use **ErrorStateMatcher** (e.g. `ShowOnSubmitErrorStateMatcher`).

**Modals**: ModalOptions.kbqComponentParams → the data field + inject(KBQ_MODAL_DATA).

**Code block**: the deprecated `canLoad` / `codeFiles` inputs are renamed to `canDownload` / `files`. Template bindings are migrated automatically; programmatic access (`.canLoad`, `.codeFiles`) must be updated by hand.

### 5. Filter-bar upgrade (20.2.0)

In version 20.2.0 the public API of `KbqFilterBar` moved to signals. Template bindings (`[filter]`, `[(filter)]`, `[pipeTemplates]`) and the `(filterChange)` output keep working — only programmatic reads break: they now require a call.

| Member                                                                      | Before                  | After                                                    |
| --------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------- |
| `filter`                                                                    | accessor                | `ModelSignal<KbqFilter \| null>` — write via `.set(...)` |
| `pipeTemplates`                                                             | accessor                | `InputSignal<KbqPipeTemplate[]>`                         |
| `isChanged` / `isDisabled` / `isReadOnly` / `isSaved` / `isSavedAndChanged` | getter                  | `Signal<boolean>`                                        |
| `onChangePipe`                                                              | `EventEmitter<KbqPipe>` | `OutputEmitterRef<KbqPipe>`                              |

#### Running the migration

The changes are applied by the `filter-bar-signals` schematic (runs automatically):

```bash
ng update @koobiq/components@20
```

Or manually — for example, if you have already upgraded to 20.2.0. To preview without writing — `--fix=false`:

```bash
ng g @koobiq/components:filter-bar-signals --project <your project>
```

#### What is fixed automatically

**Reads and writes in TypeScript** (for receivers annotated `KbqFilterBar` / `KbqFilterBarHost`):

- filterBar.filter → filterBar.filter(),
- filterBar.filter = next → filterBar.filter.set(next),
- filterBar.filter?.name → filterBar.filter()?.name,
- this.filterBar.isChanged → this.filterBar.isChanged()

**Reads through a template reference variable** (`#ref` on `<kbq-filter-bar>`, in external `.html` files and inline templates):

- ref.isChanged → ref.isChanged()

**Renames:**

- KbqFilterBarRefresher → KbqFilterRefresher (the old name is still re-exported as an alias, so it does not break the build)

All replacements are idempotent — running the schematic twice does not double the call.

#### What you need to fix manually

The schematic emits warnings for what cannot be rewritten safely:

**KbqFilterBar.changes**: deprecated and no longer emits → read `filterBar.filter()` inside an `effect(...)`, or listen to `(filterChange)`.

**KbqFilters.preparePopover()**: removed → `openSaveAsNewFilterPopover()` / `openChangeFilterNamePopover()`.

**viewChild(KbqFilterBar) queries**: return the component instance, so a read becomes a double call — `this.filterBar().filter()`.

**KBQ_FILTER_BAR_PIPES**: now typed `Map<KbqPipeType, Type<KbqBasePipe>>` (was an array of tuples) → wrap the entries in `new Map([...])`.

The schematic does not cover the following changes — check them yourself:

**[filters] on kbq-filters**: the input became required.

**KbqPipeState.state**: accessor → `InputSignal<T | null>` (relevant for custom pipes).

**KbqPipeTreeSelectComponent**: `template` and `filteredOptions` were removed. On **KbqFilters** the `popoverOffset` and `popoverSize` fields became `protected`.

The schematic matches receivers by explicit type annotation only, so aliases (`const fb = this.filterBar; fb.filter`) are left untouched — fix them by hand.

### 6. Panel width unification (21.0.0)

In version 21.0.0 `autocomplete`, `select`, `tree-select`, `timezone` and `dropdown` started resolving the width of their dropdown panel through one shared mechanism. They now all expose the same three inputs — `panelWidth`, `panelMinWidth` and `panelMaxWidth` — with the same meaning:

| `panelWidth`           | Panel width                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| not set (default)      | sizes to its content, never narrower than the trigger or `panelMinWidth` |
| `'auto'`               | matches the trigger, never narrower than `panelMinWidth`                 |
| a number or CSS string | exactly that width; `panelMinWidth` is not applied                       |

Panels are now also capped at **640px** through the `--kbq-panel-size-width-max` token. The cap is soft: it limits how far a panel grows with its content, but it never makes a panel narrower than its trigger and never clamps an explicit `panelWidth`. Change it globally by setting the token on `:root`, per component through the component's own token (`--kbq-dropdown-size-container-width-max` still works), or per instance through `panelMaxWidth`.

#### Running the migration

The `autocomplete-panel-width-auto` schematic runs automatically:

```bash
ng update @koobiq/components@21
```

Or manually:

```bash
ng g @koobiq/components:autocomplete-panel-width-auto --project <your project>
```

#### What is fixed automatically

**`panelWidth="auto"` on `<kbq-autocomplete>`** → `panelWidth="fit-content"`. On autocomplete, `auto` used to be passed to CSS verbatim, so the panel shrank to fit its content. It now means "match the host width", as it already did on `kbq-select`. `fit-content` preserves the old behaviour. Both the static (`panelWidth="auto"`) and bound (`[panelWidth]="'auto'"`) forms are rewritten; a dynamic value (`[panelWidth]="expr"`) is skipped with a warning.

`auto` still type-checks and still renders, the panel is just laid out differently — it isn't the only silent change in this release though, see the `panelWidth={{0}}` note below.

#### What you need to fix manually

**`panelWidth`, `panelMinWidth` and `panelMaxWidth` are signal inputs.** Reads now require a call, and writes are no longer possible — this is the one change in this release without an automated path, because there is no runtime equivalent of writing to a signal input from outside.

```ts
// Before
@ViewChild(KbqSelect) select: KbqSelect;
this.select.panelWidth = 'auto';
const w = this.select.panelWidth;

// After — bind from the template instead
// <kbq-select [panelWidth]="panelWidth">
panelWidth: KbqPanelWidth = 'auto';
const w = this.select.panelWidth();
```

`kbq-tree-select` already exposed these as signals, so it is unaffected. `KbqDropdownPanel.panelWidth` / `panelMinWidth` / `panelMaxWidth` are typed `Signal<...>` for the same reason.

**Panels no longer grow past 640px with their content.** `kbq-select`, `kbq-tree-select` and `kbq-autocomplete` previously had no cap at all, so a panel with long option text could grow arbitrarily wide; it now stops at 640px. Panels whose width comes from the trigger or from an explicit `panelWidth` are unaffected. To restore the old behaviour set `--kbq-panel-size-width-max: none` on `:root`, or raise the cap for one instance with `panelMaxWidth`.

**`panelWidth="auto"` on `kbq-select` and `kbq-tree-select`** no longer goes below `panelMinWidth` (200 by default). A trigger narrower than 200px used to produce a panel of exactly the trigger's width; it now produces a 200px panel. If you relied on that, set `panelMinWidth="0"`. This cannot be migrated automatically — whether it affects you depends on the rendered width of the trigger.

**`panelWidth={{0}}` on `<kbq-autocomplete>`** is now an explicit width instead of being treated as unset — the panel renders at literally `0px` instead of sizing to content. `getOverlaySize()` used to treat `panelWidth` as falsy-checked, so `0` fell back to content-sizing; `select`/`tree-select` already treated `0` as an explicit width before this release, and autocomplete is now consistent with them. This only matters if `panelWidth` is bound to an expression that can evaluate to `0` (a literal `panelWidth="0"` has no legitimate use); it can't be schematic-migrated since it depends on a runtime value, not a static template attribute.

**`kbq-timezone-select`** now honours the 640px minimum its documentation has always described. Between 20.0.0 and 20.1.0 its `panelMinWidth: 640` default never reached the DOM, so the panel always matched the field. If you want the field width back, set `panelMinWidth="0"`.

**`[panelMinWidth]="null"`** now keeps the trigger-width floor. It previously produced an invalid `NaNpx`, which browsers dropped, removing every minimum.

**`KbqDropdown.triggerWidth`** is deprecated and has no effect (it has been unread since 20.0.0). To make a dropdown panel match an element other than its trigger, set `KbqDropdownTrigger.widthOrigin`. `kbq-split-button`'s `panelAutoWidth` does this for you and now works — previously it wrote to `triggerWidth` and did nothing.

**`kbq-dropdown`'s minimum width is now measured with `getBoundingClientRect()`** (the trigger's full border-box) instead of `getComputedStyle().width` minus its borders (the old, incorrectly-computed content-box). A trigger with padding or a border renders a wider panel than before by that amount; a trigger with neither is unaffected.

### After the migration

The migration is regex-based and does not rewrite aliased imports, local variables, or re-exports — **review the diff before committing**, rebuild the project and run your tests. The full list of breaking changes is on the [Angular 20 breaking changes](https://github.com/koobiq/angular-components/blob/main/docs/guides/angular-20-breaking-changes.en.md) page.
