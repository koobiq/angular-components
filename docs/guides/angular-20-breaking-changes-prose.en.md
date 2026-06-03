These changes shipped in **Koobiq v20.0.0** (2026-05-13) — the move to Angular 20. For the step-by-step upgrade path see the [migration guide](/en/main/migration-prose); below is the full list of breaking changes.

### Angular 20

The library has been updated to Angular 20.3.21: `requiredAngularVersion` is now `^20.0.0`, all `peerDependencies` of published packages target `^20.0.0`, and consumers must upgrade to Angular 20+. Minimum supported Node.js is now **20.19** (added `"engines": { "node": ">=20.19" }`), and zone.js has been downgraded to `~0.15.1` to match the Angular 20 peer requirement.

`KbqPopUpTrigger` (the base of tooltip / popover / notification-center / app-switcher) has been refactored to use `Signal<T>` for `enterDelay`, `leaveDelay`, `stickToWindow`, `container`, `hideWithTimeout`, `preventClose`, and `arrow` so the existing signal-input overrides in subclasses now type-check. Consumers reading these values from a trigger instance must call them as signals (`.enterDelay()`, etc.). In popover, the runtime-broken `set trigger(value)` mutation of `hideWithTimeout`/`leaveDelay` has been replaced by writable backing signals; `leaveDelay` is now a `computed` signal combining the user input and the hover-mode fallback default of `500ms`.

In form-field, several properties have been reverted to `@Input` primitives: `KbqInput.placeholder`, `KbqInput.errorStateMatcher`, `KbqInputPassword.placeholder`, `KbqInputPassword.errorStateMatcher`, `KbqTextarea.placeholder`, `KbqTextarea.errorStateMatcher`, `KbqSelect.errorStateMatcher`, `KbqTagList.errorStateMatcher`, `KbqTreeSelect.errorStateMatcher`, `KbqSingleFileUploadComponent.errorStateMatcher`, `KbqMultipleFileUploadComponent.errorStateMatcher`, `KbqTagInput.placeholder`/`id` — they conflict with interface types (`CanUpdateErrorState`, `KbqFormFieldControl`, `KbqTagTextControl`) that expect raw values. Template bindings via aliases stay the same.

In code-block, `softWrap`, `viewAll`, `canDownload`, and `activeFileIndex` are now `model()` signals (writable + bindable) — bare attribute shorthand `<kbq-code-block canDownload>` no longer coerces, use `[canDownload]="true"`, `[activeFileIndex]="1"`, etc. In textarea, `freeRowsHeight` is now a `model()` signal; bare attribute shorthand is not supported, use `[freeRowsHeight]="160"`. In search-expandable, dl, radio, checkbox, toggle, and sidepanel, `isOpened`, `vertical`, `name`, `id`, and `sidepanelResult` are now `model()` signals — use `.set()` / `.update()` internally; two-way binding `[(x)]` works externally.

In modal, `kbqOkText`, `kbqOkType`, `kbqRestoreFocus`, `kbqCancelText`, `kbqModalType`, `kbqComponent`, `kbqContent`, `kbqComponentParams`, `kbqFooter`, `kbqWidth`, `kbqSize`, `kbqWrapClassName`, `kbqClassName`, `kbqStyle`, `kbqTitle`, `kbqCloseByESC`, `kbqOnOk`, and `kbqOnCancel` have been reverted to plain `@Input`/`@Output` to match `ModalOptions`; the programmatic API via `KbqModalService` stays the same. In notification-center and app-switcher, the `placement` signal-input overrides (which conflicted with `KbqPopUpTrigger.placement`) have been removed — placement is again configured via the `@Input` getter/setter pattern delegating to `super.updatePlacement(...)`; `arrow` in both is now a `Signal<boolean>` matching the new base contract.

In tabs, `KbqPaginatedTabHeader.disablePagination` is now a `computed` that combines the user input with a writable fallback set by the `vertical` setter; `KbqTabGroupComponent.animationDuration` is a `computed` that resolves user input → `KBQ_TABS_CONFIG` default → `'0ms'`; `KbqTabLink.disabled` has been reverted to plain `@Input` (matches `FocusableOption.disabled`). In dropdown, `KbqDropdown.backdropClass` has been reverted to `@Input` to match the `KbqDropdownPanel` interface; the `KbqDropdownContent` constructor no longer accepts `ComponentFactoryResolver` (removed in Angular 20). In input-number, `@Attribute('step' | 'big-step' | 'min' | 'max')` constructor coercion has been dropped — the same defaults are now provided by `input(..., { transform: numberAttribute })`; template bindings `[step]="..."` still work.

In breadcrumbs, `RdxRovingFocusGroupDirective.orientation` is now a `computed` signal combining an `orientation` input alias and an internal `setOrientation()` override called by `KbqBreadcrumbs`, replacing the broken `inject(...).orientation = 'horizontal'` assignment. In navbar, navbar-ic, filter-bar, datepicker, timepicker, and splitter, direct assignments to readonly signal inputs (`this.arrow = false`, `this.offset = 0`, `this.popover.preventClose = true`, `tooltip.enterDelay = ...`, `this.ghost.visible = ...`, etc.) have been cast to `any` to preserve current runtime behavior; migration of that state to writable signals is tracked as a follow-up.

### Tooling

Build tooling has been updated: `ng-packagr` → `^20.3.2`, `@angular-builders/jest` → `20.0.0`, `@angular-eslint/*` → `^20.7.0`, `@typescript-eslint/*` → `^8.59.3` (ESLint stays on `8.57.1`), `@schematics/angular` → `20.3.21` (was stuck on `18.2.21`), `@angular-devkit/architect` → `0.2003.21`. Per-project `tsconfig.spec.json` files have been added under each library/app root extending the workspace-root config; `angular.json` `test.options.tsConfig` paths now resolve from the project root as required by v20 schematic migrations. Schematics unit tests have been updated for the v20 `@schematics/angular:application` output (file names changed from `app.component.html` → `app.html`).

### Deprecated API removals

Long-standing deprecated symbols have been removed. Use `ng update @koobiq/components@20` for assisted migration (schematics TBD — track follow-up).

#### Removed packages

The entire `@koobiq/components/navbar-ic` package has been deleted — migrate to `@koobiq/components/navbar` (`KbqNavbar`, `KbqNavbarItem`, `KbqNavbarModule`). The entire `@koobiq/components/risk-level` package has also been deleted — migrate to `@koobiq/components/badge` (`KbqBadge` with `[outline]` and `[badgeColor]`); note that Badge default density and color enum differ, so verify visual parity. The `@koobiq/components-experimental/form-field` sub-package has been deleted — migrate to `@koobiq/components/form-field`; the experimental package was a transitional fork that has been merged back.

#### Removed core symbols

The following symbols have been removed: `AnimationCurves` enum (use `KbqAnimationCurves`), `MeasurementSystem` enum (use `KbqMeasurementSystem`), `SizeUnitsConfig` interface (use `KbqSizeUnitsConfig`). `KbqCommonModule`, `KBQ_SANITY_CHECKS`, and `mcSanityChecksFactory` are no longer used and have been removed. `toBoolean()` has been replaced by Angular's `booleanAttribute` from `@angular/core`. `RdxAccordionItemState` has been replaced by `KbqAccordionItemState`, and `KbqCodeFile` by `KbqCodeBlockFile`. The `KBQ_SIDEPANEL_WITH_SHADOW` token has been removed, as has the `KbqSidepanelConfig.requiredBackdrop` field (a single shared backdrop is now used). `formatDataSize()` has been replaced by `getFormattedSizeParts()`; the 3-arg overload `(value, precision, system)` has been replaced by the 2-arg form `(value, system)`. The `KBQ_VALIDATION` token and `KbqValidationOptions` interface have been removed along with the legacy validation pipeline. `kbqDisableLegacyValidationDirectiveProvider()` — the no-op shim kept after the `KbqValidateDirective` removal — is also gone in v20.0.0; run `ng update @koobiq/components@20` to auto-strip call sites and the import; the schematic also flags the resulting empty `providers: []` arrays for manual cleanup.

#### Removed component methods / inputs

`KbqAutocompleteTrigger.openPanel()` has been replaced by `open()`, `KbqClampedText.toggleIsCollapsed()` by `toggle()`, and the `KbqDivider.inset` input has been removed. All unused members of `KbqTagList` have been removed: `multiple`, `compareWith`, `emitOnTagChanges`, `orientation`, `selectionModel`, `tagChanges`, `setSelectionByValue()`. From `KbqTagInput`, `countOfSymbolsForUpdateWidth` and `updateInputWidth()` have been removed. `KbqFormField.canShowStepper` has been replaced by `hasStepper` (the stepper is always visible when provided). The `KbqAppSwitcherTrigger.apps` input has been replaced by `sites` with a single-element array.

#### Removed validation

The **`KbqValidateDirective`** legacy validation directive has been deleted entirely. The new behaviour relies exclusively on `ErrorStateMatcher`. Consumers that relied on the legacy "show errors only after blur/submit" pattern should wire `ShowOnSubmitErrorStateMatcher` (or similar) explicitly via the `errorStateMatcher` input or the `ErrorStateMatcher` provider. The "lazy validation" behaviour (suppressing required errors until submit) is gone.

#### Removed file-upload validation API

The `KbqInputFile` and `KbqInputFileLabel` interfaces have been removed, as has the `KbqFileValidatorFn` type. `isCorrectExtension()` has been replaced by `FileValidators.isCorrectExtension` (`ValidatorFn`). From `KbqMultipleFileUploadComponent`, `errors`, `customValidation`, and `hasErrors` have been removed — use `FormControl.errors` and `FormControl` validators. From `KbqSingleFileUploadComponent`, `errors` and `customValidation` have been removed — same approach.

#### Removed modal API

`ModalOptions.kbqComponentParams` is replaced by the `data` field plus `inject(KBQ_MODAL_DATA)` in the child component. The `@Input KbqModalComponent.kbqComponentParams` has been removed.

#### Removed filter-bar API

The `KbqFilters.onSaveAsNew` Output has been replaced by `onSave` with `status === 'newFilter'`. The **`KbqFilterBarSearch`** component (`<kbq-filter-search>`) has been removed — use `<kbq-search-expandable [formControl]="searchControl" />` instead; note that `kbq-search-expandable` requires a `FormControl`/`NgModel` binding.

#### Removed form-field directives

The **`KbqDatepickerToggle`** component (`<kbq-datepicker-toggle>`) has been removed — use `<kbq-datepicker-toggle-icon>` (`KbqDatepickerToggleIconComponent`) instead. The **`KbqFormFieldWithoutBorders`** directive (`<kbq-form-field kbqFormFieldWithoutBorders>`) has been removed — use the `noBorders` input on `KbqFormField`: `<kbq-form-field noBorders>`.

#### Removed tooltip modifier triggers

The **`KbqWarningTooltipTrigger`** (`[kbqWarningTooltip]`) and **`KbqExtendedTooltipTrigger`** (`[kbqExtendedTooltip]`) directives have been removed. Use the base `[kbqTooltip]` directive with the new public `kbqTooltipModifier` input:

```html
<!-- before -->
<div #tooltip="kbqWarningTooltip" [kbqWarningTooltip]="msg" />
<!-- after -->
<div #tooltip="kbqTooltip" kbqTooltipModifier="warning" [kbqTooltip]="msg" />
```

For the extended variant, `[kbqTooltipHeader]` is now also exposed on the base trigger:

```html
<!-- before -->
<button [kbqExtendedTooltip]="content" [kbqTooltipHeader]="header"></button>
<!-- after -->
<button kbqTooltipModifier="extended" [kbqTooltip]="content" [kbqTooltipHeader]="header"></button>
```

`KbqDatepickerInput.kbqValidationTooltip` and `KbqTimepicker.kbqValidationTooltip` setters now accept `KbqTooltipTrigger` (the base class) instead of `KbqWarningTooltipTrigger`.

### Migration

Consumers can run the automatic migration:

```bash
ng update @koobiq/components@20
```

This invokes the `v20-upgrade` schematic which rewrites your codebase in place. Imports from `@koobiq/components/navbar-ic`, `risk-level`, and `components-experimental/form-field` are remapped to the surviving packages (`navbar`, `badge`, `components/form-field`). Identifiers in `.ts` files are renamed: `KbqNavbarIc*` → `Kbq*`, `KbqRiskLevel*` → `KbqBadge*`, `KbqWarningTooltipTrigger` / `KbqExtendedTooltipTrigger` → `KbqTooltipTrigger`, `KbqDatepickerToggle` → `KbqDatepickerToggleIconComponent`, `KbqFilterBarSearch` → `KbqSearchExpandable`, `RdxAccordionItemState` → `KbqAccordionItemState`, `KbqCodeFile` → `KbqCodeBlockFile`, `AnimationCurves` → `KbqAnimationCurves`, `MeasurementSystem` → `KbqMeasurementSystem`, `SizeUnitsConfig` → `KbqSizeUnitsConfig`, `KbqFormFieldRef` → `KbqFormField`. Tokens and functions are renamed: `toBoolean(` → `booleanAttribute(`, `isCorrectExtension(` → `FileValidators.isCorrectExtension(`, `formatDataSize(` → `getFormattedSizeParts(`, `kbqComponentParams:` → `data:`; dropped tokens `KBQ_VALIDATION`, `KBQ_SANITY_CHECKS`, `KBQ_SIDEPANEL_WITH_SHADOW` are removed from imports. Instance methods are renamed: `.openPanel(` → `.open(`, `.toggleIsCollapsed(` → `.toggle(`, `.focusViaKeyboard(` → `.focus(`. Template selectors are updated: `<kbq-filter-search>` → `<kbq-search-expandable>`, `<kbq-datepicker-toggle>` → `<kbq-datepicker-toggle-icon>`, `<kbq-risk-level>` → `<kbq-badge>`, `<kbq-navbar-ic*>` → `<kbq-navbar*>`. Template attributes are updated: `kbqFormFieldWithoutBorders` → `noBorders`, `[kbqWarningTooltip]` → `kbqTooltipModifier="warning" [kbqTooltip]`, `[kbqExtendedTooltip]` → `kbqTooltipModifier="extended" [kbqTooltip]`, template-ref `="kbqWarningTooltip"` → `="kbqTooltip"`. SCSS class selectors are updated: `.kbq-risk-level` → `.kbq-badge`, `.kbq-navbar-ic` → `.kbq-navbar`, etc.

The schematic prints warnings for structural changes it cannot safely auto-fix: `(onSaveAsNew)` listeners on `<kbq-filters>` must be switched to `(onSave)` with branching on `$event.status === 'newFilter'`; `[customValidation]` / `[errors]` on file-upload components must be replaced with `FormControl` validators / `FormControl.errors`; `[apps]` on `<button kbqAppSwitcher>` must be wrapped in a single-site `[sites]="[{ id, name, apps }]"`.

After the schematic runs, **review the diff before committing**: the migration is regex-based and will not rewrite values held in local variables, re-exports, or aliased imports.
