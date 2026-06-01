These changes shipped in **Koobiq v20.0.0** (2026-05-13) — the move to Angular 20. For the step-by-step upgrade path see the [migration guide](/en/main/migration); below is the full list of breaking changes.

### Angular 20

- **angular:** bump to Angular 20.3.21. `requiredAngularVersion` is now `^20.0.0`. All `peerDependencies` of published packages target `^20.0.0`. Consumers must upgrade to Angular 20+.
- **node:** minimum supported Node.js is now **20.19** (added `"engines": { "node": ">=20.19" }`).
- **zone.js:** downgraded to `~0.15.1` to match Angular 20 peer requirement.
- **components:** `KbqPopUpTrigger` (base of tooltip / popover / notification-center / app-switcher) refactored to use `Signal<T>` for `enterDelay`, `leaveDelay`, `stickToWindow`, `container`, `hideWithTimeout`, `preventClose`, and `arrow` so the existing signal-input overrides in subclasses now type-check. Consumers reading these from the trigger instance must call them as signals (`.enterDelay()`, etc.).
- **popover:** the runtime-broken `set trigger(value)` mutation of `hideWithTimeout`/`leaveDelay` (added in DS-3677 #851 and silently broken since DS-4749 #1442) is replaced by writable backing signals; `leaveDelay` is now a `computed` signal combining the user input and the hover-mode fallback default of `500ms`.
- **form-field:** `KbqInput.placeholder`, `KbqInput.errorStateMatcher`, `KbqInputPassword.placeholder`, `KbqInputPassword.errorStateMatcher`, `KbqTextarea.placeholder`, `KbqTextarea.errorStateMatcher`, `KbqSelect.errorStateMatcher`, `KbqTagList.errorStateMatcher`, `KbqTreeSelect.errorStateMatcher`, `KbqSingleFileUploadComponent.errorStateMatcher`, `KbqMultipleFileUploadComponent.errorStateMatcher`, `KbqTagInput.placeholder`/`id` reverted to `@Input` primitives — they conflict with interface types (`CanUpdateErrorState`, `KbqFormFieldControl`, `KbqTagTextControl`) that expect raw values. Template bindings via aliases stay the same.
- **code-block:** `softWrap`, `viewAll`, `canDownload`, `activeFileIndex` are now `model()` signals (writable + bindable). Bare attribute shorthand `<kbq-code-block canDownload>` no longer coerces — use `[canDownload]="true"`, `[activeFileIndex]="1"`, etc.
- **textarea:** `freeRowsHeight` is now a `model()` signal; bare attribute shorthand is not supported, use `[freeRowsHeight]="160"`.
- **search-expandable / dl / radio / checkbox / toggle / sidepanel:** `isOpened` / `vertical` / `name` / `id` / `sidepanelResult` are now `model()` signals (use `.set()` / `.update()` internally; two-way binding `[(x)]` works externally).
- **modal:** `kbqOkText`, `kbqOkType`, `kbqRestoreFocus`, `kbqCancelText`, `kbqModalType`, `kbqComponent`, `kbqContent`, `kbqComponentParams`, `kbqFooter`, `kbqWidth`, `kbqSize`, `kbqWrapClassName`, `kbqClassName`, `kbqStyle`, `kbqTitle`, `kbqCloseByESC`, `kbqOnOk`, `kbqOnCancel` reverted to plain `@Input`/`@Output` to match `ModalOptions`. Programmatic API (consumed via `KbqModalService`) stays the same.
- **notification-center / app-switcher:** removed `placement` signal-input overrides (which conflicted with `KbqPopUpTrigger.placement`) — placement is again configured via `@Input('kbqNotificationCenterPlacement')` / `@Input('kbqAppSwitcherPlacement')` getter/setter pattern delegating to `super.updatePlacement(...)`. `arrow` in both is now a `Signal<boolean>` (matches the new base contract).
- **tabs:** `KbqPaginatedTabHeader.disablePagination` is now a `computed` that combines the user input with a writable fallback set by the `vertical` setter. `KbqTabGroupComponent.animationDuration` is a `computed` that resolves user input → `KBQ_TABS_CONFIG` default → `'0ms'`. `KbqTabLink.disabled` reverted to plain `@Input` (matches `FocusableOption.disabled`).
- **dropdown:** `KbqDropdown.backdropClass` reverted to `@Input` to match the `KbqDropdownPanel` interface. `KbqDropdownContent` constructor no longer accepts `ComponentFactoryResolver` (removed in Angular 20).
- **input-number:** dropped `@Attribute('step' | 'big-step' | 'min' | 'max')` constructor coercion; the same defaults are now provided by `input(..., { transform: numberAttribute })`. Template bindings `[step]="..."` still work; bare HTML attributes are coerced through the transform.
- **breadcrumbs:** `RdxRovingFocusGroupDirective.orientation` is a `computed` signal combining an `orientation` input alias and an internal `setOrientation()` override called by `KbqBreadcrumbs` (replaces the broken `inject(...).orientation = 'horizontal'` assignment).
- **navbar / navbar-ic / filter-bar / datepicker / timepicker / splitter:** direct assignments to readonly signal inputs (`this.arrow = false`, `this.offset = 0`, `this.popover.preventClose = true`, `tooltip.enterDelay = ...`, `this.ghost.visible = ...`, etc.) cast to `any` to preserve current runtime behavior. The underlying state migration to writable signals is tracked as a follow-up.

### Tooling

- `ng-packagr` → `^20.3.2`.
- `@angular-builders/jest` → `20.0.0`.
- `@angular-eslint/*` → `^20.7.0`.
- `@typescript-eslint/*` → `^8.59.3` (ESLint stays on `8.57.1`).
- `@schematics/angular` → `20.3.21` (was stuck on `18.2.21`).
- `@angular-devkit/architect` → `0.2003.21`.
- Per-project `tsconfig.spec.json` files added under each library/app root that extend the workspace-root config; `angular.json` `test.options.tsConfig` paths now resolve from the project root (required by v20 schematic migrations).
- Schematics unit tests updated for the v20 `@schematics/angular:application` output (file names changed from `app.component.html` → `app.html`).

### Deprecated API removals

Removed long-standing deprecated symbols. Use `ng update @koobiq/components@20` for assisted migration (schematics TBD — track follow-up).

#### Removed packages

- **`@koobiq/components/navbar-ic`** — entire package deleted. Migrate to `@koobiq/components/navbar` (`KbqNavbar`, `KbqNavbarItem`, `KbqNavbarModule`).
- **`@koobiq/components/risk-level`** — entire package deleted. Migrate to `@koobiq/components/badge` (`KbqBadge` with `[outline]` and `[badgeColor]`). Note: Badge default density and color enum differ — verify visual parity.
- **`@koobiq/components-experimental/form-field`** — sub-package deleted. Migrate to `@koobiq/components/form-field`. The experimental package was a transitional fork that has been merged back.

#### Removed core symbols

- `AnimationCurves` enum → use `KbqAnimationCurves`.
- `MeasurementSystem` enum → use `KbqMeasurementSystem`.
- `SizeUnitsConfig` interface → use `KbqSizeUnitsConfig`.
- `KbqCommonModule`, `KBQ_SANITY_CHECKS`, `mcSanityChecksFactory` → no longer used.
- `toBoolean()` → use Angular `booleanAttribute` from `@angular/core`.
- `RdxAccordionItemState` → use `KbqAccordionItemState`.
- `KbqCodeFile` → use `KbqCodeBlockFile`.
- `KBQ_SIDEPANEL_WITH_SHADOW` token → removed.
- `KbqSidepanelConfig.requiredBackdrop` field → removed (single shared backdrop used).
- `formatDataSize()` → use `getFormattedSizeParts()`.
- `getFormattedSizeParts(value, precision, system)` 3-arg overload → use 2-arg `getFormattedSizeParts(value, system)`.
- `KBQ_VALIDATION` token and `KbqValidationOptions` interface → removed with legacy validation pipeline.
- `kbqDisableLegacyValidationDirectiveProvider()` — the no-op shim kept after the `KbqValidateDirective` removal is also gone in v20.0.0. Run `ng update @koobiq/components@20` to auto-strip the call sites and import; the schematic also flags the resulting `providers: []` arrays for manual cleanup.

#### Removed component methods / inputs

- `KbqAutocompleteTrigger.openPanel()` → use `open()`.
- `KbqClampedText.toggleIsCollapsed()` → use `toggle()`.
- `KbqDivider.inset` input → removed.
- `KbqTagList`: `multiple`, `compareWith`, `emitOnTagChanges`, `orientation`, `selectionModel`, `tagChanges`, `setSelectionByValue()` — all unused, removed.
- `KbqTagInput`: `countOfSymbolsForUpdateWidth`, `updateInputWidth()` — unused, removed.
- `KbqFormField.canShowStepper` → use `hasStepper` (stepper is always visible when provided).
- `KbqAppSwitcherTrigger.apps` input → use `sites` with a single-element array.

#### Removed validation

- **`KbqValidateDirective`** — legacy validation directive deleted entirely. The new behaviour relies exclusively on `ErrorStateMatcher`. Consumers that relied on the legacy "show errors only after blur/submit" pattern should wire `ShowOnSubmitErrorStateMatcher` (or similar) explicitly via `errorStateMatcher` input or `ErrorStateMatcher` provider. The "lazy validation" behaviour (suppress required-not-shown until submit) is gone.

#### Removed file-upload validation API

- `KbqInputFile`, `KbqInputFileLabel` interfaces — removed.
- `KbqFileValidatorFn` type → removed.
- `isCorrectExtension()` function → use `FileValidators.isCorrectExtension` (`ValidatorFn`).
- `KbqMultipleFileUploadComponent.errors`, `customValidation`, `hasErrors` → use `FormControl.errors` and `FormControl` validators.
- `KbqSingleFileUploadComponent.errors`, `customValidation` → same.

#### Removed modal API

- `ModalOptions.kbqComponentParams` → use `data` field + `inject(KBQ_MODAL_DATA)` in the child component.
- `KbqModalComponent.kbqComponentParams` @Input → removed.

#### Removed filter-bar API

- `KbqFilters.onSaveAsNew` Output → use `onSave` with `status === 'newFilter'`.
- **`KbqFilterBarSearch`** component (`<kbq-filter-search>`) — removed. Use `<kbq-search-expandable [formControl]="searchControl" />` instead. Note: `kbq-search-expandable` requires a `FormControl`/`NgModel` binding.

#### Removed form-field directives

- **`KbqDatepickerToggle`** component (`<kbq-datepicker-toggle>`) — removed. Use `<kbq-datepicker-toggle-icon>` (`KbqDatepickerToggleIconComponent`) instead.
- **`KbqFormFieldWithoutBorders`** directive (`<kbq-form-field kbqFormFieldWithoutBorders>`) — removed. Use the `noBorders` input on `KbqFormField`: `<kbq-form-field noBorders>`.

#### Removed tooltip modifier triggers

- **`KbqWarningTooltipTrigger`** (`[kbqWarningTooltip]`) and **`KbqExtendedTooltipTrigger`** (`[kbqExtendedTooltip]`) directives removed. Use the base `[kbqTooltip]` directive with the new public `kbqTooltipModifier` input:

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

This invokes the `v20-upgrade` schematic which rewrites your codebase in place:

- Imports from `@koobiq/components/navbar-ic` / `risk-level` / `components-experimental/form-field` are remapped to the surviving packages (`navbar`, `badge`, `components/form-field`).
- Identifier renames in `.ts` files (`KbqNavbarIc*` → `Kbq*`, `KbqRiskLevel*` → `KbqBadge*`, `KbqWarningTooltipTrigger` / `KbqExtendedTooltipTrigger` → `KbqTooltipTrigger`, `KbqDatepickerToggle` → `KbqDatepickerToggleIconComponent`, `KbqFilterBarSearch` → `KbqSearchExpandable`, `RdxAccordionItemState` → `KbqAccordionItemState`, `KbqCodeFile` → `KbqCodeBlockFile`, `AnimationCurves` → `KbqAnimationCurves`, `MeasurementSystem` → `KbqMeasurementSystem`, `SizeUnitsConfig` → `KbqSizeUnitsConfig`, `KbqFormFieldRef` → `KbqFormField`).
- Token / function renames (`toBoolean(` → `booleanAttribute(`, `isCorrectExtension(` → `FileValidators.isCorrectExtension(`, `formatDataSize(` → `getFormattedSizeParts(`, `kbqComponentParams:` → `data:`); dropped tokens `KBQ_VALIDATION`, `KBQ_SANITY_CHECKS`, `KBQ_SIDEPANEL_WITH_SHADOW` removed from imports.
- Instance method renames (`.openPanel(` → `.open(`, `.toggleIsCollapsed(` → `.toggle(`, `.focusViaKeyboard(` → `.focus(`).
- Template selectors (`<kbq-filter-search>` → `<kbq-search-expandable>`, `<kbq-datepicker-toggle>` → `<kbq-datepicker-toggle-icon>`, `<kbq-risk-level>` → `<kbq-badge>`, `<kbq-navbar-ic*>` → `<kbq-navbar*>`).
- Template attributes (`kbqFormFieldWithoutBorders` → `noBorders`, `[kbqWarningTooltip]` → `kbqTooltipModifier="warning" [kbqTooltip]`, `[kbqExtendedTooltip]` → `kbqTooltipModifier="extended" [kbqTooltip]`, template-ref `="kbqWarningTooltip"` → `="kbqTooltip"`).
- SCSS class selectors (`.kbq-risk-level` → `.kbq-badge`, `.kbq-navbar-ic` → `.kbq-navbar`, etc.).

The schematic prints warnings for structural changes it cannot safely auto-fix:

- `(onSaveAsNew)` listeners on `<kbq-filters>` — switch to `(onSave)` and branch on `$event.status === 'newFilter'`.
- `[customValidation]` / `[errors]` on file-upload components — use `FormControl` validators / read `FormControl.errors`.
- `[apps]` on `<button kbqAppSwitcher>` — wrap into a single-site `[sites]="[{ id, name, apps }]"`.

After the schematic runs, **review the diff before committing**: the migration is regex-based and will not rewrite values held in local variables, re-exports, or aliased imports.
