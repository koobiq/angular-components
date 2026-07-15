## How to upgrade from Koobiq 17

New versions include improvements but also contain **breaking changes**; they must be applied step by step.

### Upgrade plan

1. **Up to 18.5.3**: a safe baseline with updated theming and icons.
2. **18.6**: token update.
3. **18.22**: component attribute changes.
4. **20.0.0**: the move to Angular 20: removal of deprecated APIs and package renames.
5. **20.1.0**: the move of the filter-bar API to signals.

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

### 5. Filter-bar upgrade (20.1.0)

In version 20.1.0 the public API of `KbqFilterBar` moved to signals. Template bindings (`[filter]`, `[(filter)]`, `[pipeTemplates]`) and the `(filterChange)` output keep working — only programmatic reads break: they now require a call.

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

Or manually — for example, if you have already upgraded to 20.1.0. To preview without writing — `--fix=false`:

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

### After the migration

The migration is regex-based and does not rewrite aliased imports, local variables, or re-exports — **review the diff before committing**, rebuild the project and run your tests. The full list of breaking changes is on the [Angular 20 breaking changes](https://github.com/koobiq/angular-components/blob/main/docs/guides/angular-20-breaking-changes.en.md) page.
