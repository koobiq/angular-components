## How to upgrade from Koobiq 17

New versions include improvements but also **breaking changes**; they need to be applied step by step.

---

### Summary plan

**Up to 18.5.3** — safe baseline with theming and icon updates
**18.6** — token update
**18.22** — component attribute changes
**20.0.0** — move to Angular 20: removal of deprecated APIs and package renames

---

### 1. Upgrade to 18.5.3

```bash
npm install @koobiq/cdk@18.5.3
npm install @koobiq/components@18.5.3
npm install @koobiq/icons@^9.0.0
npm install @koobiq/design-tokens@~3.7.3
npm install @koobiq/angular-luxon-adapter@18.5.3
npm install @koobiq/date-adapter^3.1.3
npm install @koobiq/date-formatter^3.1.3
npm install luxon
npm install @messageformat/core
```

#### New theming

The theming is now simpler and based on CSS variables. More details [at this link](https://koobiq.io/ru/main/theming/overview#как-использовать?).

See examples in the repository:

- [`apps/docs/src/main.scss`](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/main.scss)
- [`apps/docs/src/styles/_theme-kbq.scss`](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/styles/_theme-kbq.scss)

#### Icon Package Update

- Install the new icon version:

```bash
npm install @koobiq/icons@9.1.0
```

- To update icon names in templates, use the update tool (schematic):

```bash
ng g @koobiq/angular-components:new-icons-pack --project <your project>
```

---

### 2. Token update (18.6.x)

- Deprecated color tokens have been removed, and typography token names have been renamed.

The script will rename class and CSS variable names to the new ones and highlight places where outdated colors need to be removed or replaced:

```bash
ng g @koobiq/angular-components:css-selectors --fix=true --project <your project>
```

- For manual control, add `--fix=false`. The script will highlight where to remove or replace colors and typography names:

```bash
ng g @koobiq/angular-components:css-selectors --fix=false --project <your project>
```

---

### 3. Attribute update (18.22.0)

- Component attribute names have changed:
    - `KbqLoaderOverlay`: `compact` → `size`
    - `KbqEmptyState`: `big` → `size`

```bash
ng g @koobiq/angular-components:loader-overlay-size-attr --project <your project>
ng g @koobiq/angular-components:empty-state-size-attr --project <your project>
```

---

### 4. Upgrade to Angular 20

In v20.0.0 the library moves to **Angular 20**. This is a major release: long-deprecated APIs were removed and some packages were renamed. Requirements: **Angular 20+** and **Node.js ≥ 20.19**. The `@koobiq/cdk` package has been merged into `@koobiq/components/core` — drop `@koobiq/cdk` from your `package.json`.

#### Running the migration

Most of the changes are applied by the `v20-upgrade` schematic (runs automatically):

```bash
ng update @koobiq/components@20
```

Or invoke it manually (use `--fix=false` to preview without writing):

```bash
ng g @koobiq/components:v20-upgrade --project <your project>
```

#### What is fixed automatically

- **Package moves:** `@koobiq/components/navbar-ic` → `navbar`, `risk-level` → `badge`, `@koobiq/components-experimental/form-field` → `@koobiq/components/form-field`, `@koobiq/cdk/{a11y,keycodes,testing}` → `@koobiq/components/core`.
- **Classes, tokens, functions:** `KbqNavbarIc*` → `Kbq*`, `KbqRiskLevel*` → `KbqBadge*`, `toBoolean(` → `booleanAttribute(`, `formatDataSize(` → `getFormattedSizeParts(`, etc.
- **Instance methods:** `.openPanel()` → `.open()`, `.toggleIsCollapsed()` → `.toggle()`, `.focusViaKeyboard()` → `.focus()`.
- **Templates:** `<kbq-filter-search>` → `<kbq-search-expandable>`, `<kbq-datepicker-toggle>` → `<kbq-datepicker-toggle-icon>`, `kbqFormFieldWithoutBorders` → `noBorders`, `[kbqWarningTooltip]` → `kbqTooltipModifier="warning" [kbqTooltip]`.
- **SCSS:** `.kbq-risk-level` → `.kbq-badge`, `.kbq-navbar-ic` → `.kbq-navbar`, etc.

#### What you need to fix manually

The schematic emits warnings for changes it cannot rewrite safely:

- `(onSaveAsNew)` on `<kbq-filters>` → listen to `(onSave)` and check `$event.status === 'newFilter'`.
- file-upload `[customValidation]` / `[errors]` → `FormControl` validators / `FormControl.errors`.
- app-switcher `[apps]` → `[sites]="[{ id, name, apps }]"`.
- `KbqValidateDirective` and `kbqDisableLegacyValidationDirectiveProvider()` were removed → use `ErrorStateMatcher` (e.g. `ShowOnSubmitErrorStateMatcher`).
- Modals: `ModalOptions.kbqComponentParams` → the `data` field + `inject(KBQ_MODAL_DATA)`.
- A bare attribute is no longer coerced: `<kbq-code-block canDownload>` → `[canDownload]="true"`, `[freeRowsHeight]="160"`. Reading `enterDelay`/`arrow` from a trigger instance (tooltip/popover) is now a signal call: `trigger.enterDelay()`.

#### After the migration

The migration is regex-based and does not rewrite aliased imports, local variables or re-exports — **review the diff before committing**, rebuild the project and run your tests. The full list of breaking changes is on the [Angular 20 breaking changes](/en/main/angular-20-breaking-changes) page.
