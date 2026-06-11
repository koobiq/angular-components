# v20-upgrade

Migration schematic invoked automatically by `ng update @koobiq/components@20`.
Rewrites code in the target workspace to match the deprecated APIs that were
removed in @koobiq/components v20.0.0.

## What it does

The schematic walks every `.ts`, `.html`, `.scss`, and `.css` file in the
project (skipping `node_modules` and `dist`) and applies regex replacements
from three ordered tables in `data.ts`:

- **`tsReplacements`** — covers TypeScript imports and identifier usage:
  package moves (`@koobiq/components/navbar-ic` → `@koobiq/components/navbar`,
  `risk-level` → `badge`, `components-experimental/form-field` → `components/form-field`),
  class renames (`KbqNavbarIc*` → `Kbq*`, `KbqRiskLevel*` → `KbqBadge*`,
  `KbqWarningTooltipTrigger` / `KbqExtendedTooltipTrigger` → `KbqTooltipTrigger`,
  `KbqDatepickerToggle` → `KbqDatepickerToggleIconComponent`, etc.), token
  removals (`KBQ_VALIDATION`, `KBQ_SANITY_CHECKS`, `KBQ_SIDEPANEL_WITH_SHADOW`),
  function renames (`toBoolean(` → `booleanAttribute(`, `isCorrectExtension(` →
  `FileValidators.isCorrectExtension(`, `formatDataSize(` → `getFormattedSizeParts(`),
  method renames on instances (`.openPanel(` → `.open(`, `.toggleIsCollapsed(` →
  `.toggle(`, `.focusViaKeyboard(` → `.focus(`), and deprecated type-alias
  renames (`DropdownPositionX` → `KbqDropdownPositionX`, `DropdownPositionY` →
  `KbqDropdownPositionY`).
- **`templateReplacements`** — selectors and attributes in Angular templates
  (both external `.html` files and inline `template:` strings inside `.ts`):
  `<kbq-filter-search>` → `<kbq-search-expandable>`, `<kbq-datepicker-toggle>` →
  `<kbq-datepicker-toggle-icon>`, `<kbq-risk-level>` → `<kbq-badge>`,
  `<kbq-navbar-ic>` → `<kbq-navbar>`, `[kbqWarningTooltip]` →
  `kbqTooltipModifier="warning" [kbqTooltip]`, `kbqFormFieldWithoutBorders` →
  `noBorders`, the deprecated `KbqCodeBlock` input attributes
  (`[canLoad]` / `canLoad=` → `canDownload`, `[codeFiles]` / `codeFiles=` →
  `files`), and template-ref exportAs renames
  (`="kbqWarningTooltip"` → `="kbqTooltip"`).
- **`scssReplacements`** — CSS class selectors renamed at the component level.

## What it does _not_ do (warn-only)

Some changes require code restructuring and are surfaced as console warnings
without auto-fixing:

| Pattern                                           | Manual migration                                                                                      |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `(onSaveAsNew)`                                   | Listen to `(onSave)` and branch on `$event.status === 'newFilter'`                                    |
| `[customValidation]`                              | Use `FormControl` validators (e.g. `FileValidators.isCorrectExtension`)                               |
| `[errors]` (file-upload)                          | Use `FormControl.errors`                                                                              |
| `[apps]` (app-switcher)                           | Wrap in single-site `[sites]="[{ id, name, apps }]"` and read with `KbqAppSwitcherSite`               |
| `scrollableCodeContent` (code-block)              | Use the `scrollTo()` method instead                                                                   |
| `.canLoad` / `.codeFiles` (code-block, TS access) | Template bindings are auto-migrated; update programmatic access to `.canDownload` / `.files` manually |
| `required` (KbqFilter)                            | Use `cleanable = false` and `removable = false` (best-effort match — verify it is a KbqFilter config) |

## Running it manually

```
ng generate @koobiq/components:v20-upgrade --project my-app
```

Pass `--fix=false` to see what would change without writing files.

## Limitations

This is a regex-based migration. It does NOT understand:

- Re-exports through aliased imports.
- Variable bindings of class references (`const x = KbqNavbarIc;` → leaves it
  untouched).
- TypeScript module augmentation.

The grammar of `(?!...)` lookahead is used to avoid double-rewriting cases
like `KbqDatepickerToggleIcon` (which already references the new class).
After running, **always inspect the diff** before committing.
