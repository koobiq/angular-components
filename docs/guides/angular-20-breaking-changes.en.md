These changes are part of **Koobiq v20.0.0** (2026-05-13) — the move to Angular 20. The step-by-step upgrade scenario is described in the [migration guide](/en/main/migration); below is the full list of breaking changes.

### Angular 20

**Angular 20**. The library has been updated to Angular 20: `requiredAngularVersion` is now `^20.0.0`, and all `peerDependencies` of the published packages target `^20.0.0`. Consumers must upgrade to Angular 20+. The minimum Node.js version is **24.16** and `zone.js` is aligned with Angular 20's peer requirement.

**Code block**. The deprecated `canLoad` input has been renamed to `canDownload`, and `codeFiles` to `files`. The old names still work (marked `@deprecated`) but will be removed in the next major release. The `v20-upgrade` schematic rewrites the template bindings (`[canLoad]` → `[canDownload]`, `[codeFiles]` → `[files]`) automatically and warns about programmatic `.canLoad` / `.codeFiles` access that must be updated by hand.

**Dropdown**. Code that subclassed `KbqDropdownContent` no longer receives `ComponentFactoryResolver` in its constructor (removed in Angular 20).

### Tooling

Tooling dependencies have been updated:

| Package                   | Version   |
| ------------------------- | --------- |
| ng-packagr                | ^20.3.2   |
| @angular-builders/jest    | 20.0.0    |
| @angular-eslint/\*        | ^20.7.0   |
| @typescript-eslint/\*     | ^8.60.1   |
| ESLint                    | ^9.0.0    |
| @schematics/angular       | 20.3.27   |
| @angular-devkit/architect | 0.2003.27 |

Separate **tsconfig.spec.json** files have been added at the root of each library/application, extending the config from the workspace root. The **test.options.tsConfig** paths in angular.json are now resolved relative to the project root (required by the v20 schematic migrations).

The schematics unit tests have been updated for the **@schematics/angular:application** output from v20 (file names changed from app.component.html → app.html).

### Removal of deprecated APIs

Long-deprecated symbols have been removed. For a simplified migration, use `ng update @koobiq/components@20` (invokes the `v20-upgrade` schematic).

#### Packages

**Navbar IC**. The @koobiq/components/navbar-ic package has been removed entirely — switch to @koobiq/components/navbar (KbqNavbar, KbqNavbarItem, KbqNavbarModule).

**Risk level**. The @koobiq/components/risk-level package has been removed entirely — use @koobiq/components/badge (KbqBadge with `[outline]` and `[badgeColor]`); note that Badge's default density and color enum differ — verify the visual result.

**Form field (experimental)**. The @koobiq/components-experimental/form-field subpackage has been removed — switch to @koobiq/components/form-field; the experimental package was a transitional fork and has now been merged back.

**CDK (Core)**. The @koobiq/cdk package has been removed entirely; its a11y, keycodes, and testing utilities now live in @koobiq/components/core. Remove @koobiq/cdk from package.json and import these symbols from @koobiq/components/core (the v20-upgrade schematic remaps the imports automatically).

#### Symbols from Core

**Enums and interfaces**. The `AnimationCurves` enum has been removed (use KbqAnimationCurves), the `MeasurementSystem` enum has been removed (use KbqMeasurementSystem), and the `SizeUnitsConfig` interface has been removed (use KbqSizeUnitsConfig). The KbqCommonModule, KBQ_SANITY_CHECKS, and mcSanityChecksFactory symbols are no longer used and have been removed.

**Conversion functions**. The toBoolean() function has been replaced with booleanAttribute from @angular/core. The formatDataSize() function has been replaced with getFormattedSizeParts(); the three-argument overload (value, precision, system) has been replaced with a two-argument one (value, system).

**States and components**. The RdxAccordionItemState symbol has been replaced with KbqAccordionItemState, and KbqCodeFile with KbqCodeBlockFile.

**Tokens and configuration**. The KBQ_SIDEPANEL_WITH_SHADOW token has been removed, and the KbqSidepanelConfig.requiredBackdrop field has also been removed (a single shared backdrop is used).

**Validation**. The KBQ_VALIDATION token and the KbqValidationOptions interface have been removed along with the legacy validation pipeline. The kbqDisableLegacyValidationDirectiveProvider() function — a no-op stub left after KbqValidateDirective was removed — has also been removed in v20.0.0; run `ng update @koobiq/components@20` to automatically strip the calls and import; the schematic also flags the resulting empty `providers: []` arrays for manual cleanup.

#### Component methods and inputs

**Autocomplete trigger**. The KbqAutocompleteTrigger.openPanel() method has been replaced with open().

**Clamped text**. The KbqClampedText.toggleIsCollapsed() method has been replaced with `toggle()`.

**Divider**. The `KbqDivider.inset` input has been removed.

**Tag list**. All unused fields and methods have been removed: multiple, compareWith, emitOnTagChanges, orientation, selectionModel, tagChanges, setSelectionByValue().

**Tag input**. countOfSymbolsForUpdateWidth and updateInputWidth() have been removed.

**Form field**. The KbqFormField.canShowStepper property has been replaced with `hasStepper` (the stepper is always visible when set).

**App switcher**. On the trigger, KbqAppSwitcherTrigger.apps has been replaced with `sites` taking a single-element array.

#### Validation

The **KbqValidateDirective** directive has been removed entirely. The new behavior relies solely on **ErrorStateMatcher**. Consumers who relied on the legacy "show errors only after blur/submit" pattern should explicitly wire up **ShowOnSubmitErrorStateMatcher** (or a similar one) via the **errorStateMatcher** inputs or the **ErrorStateMatcher** provider. The "lazy validation" behavior is no longer available (not showing required until submit).

#### File upload validation API

- The KbqInputFile and KbqInputFileLabel interfaces have been removed, and the KbqFileValidatorFn type has also been removed.
- The isCorrectExtension() function has been replaced with FileValidators.isCorrectExtension (a ValidatorFn).
- `KbqMultipleFileUploadComponent`: `errors`, `customValidation`, and `hasErrors` have been removed — use `FormControl.errors` and `FormControl` validators.
- KbqSingleFileUploadComponent: errors and customValidation have been removed — same as above.

#### Modal API

**ModalOptions.kbqComponentParams** is replaced with the **data** field plus **inject(KBQ_MODAL_DATA)** in the child component. The @Input KbqModalComponent.kbqComponentParams has been removed.

#### Filter bar API

**Filter bar**. The KbqFilters.onSaveAsNew output has been replaced with `onSave` carrying `status === 'newFilter'`. The KbqFilterBarSearch component `<kbq-filter-search>` has been removed — use `<kbq-search-expandable [formControl]="searchControl" />`; note that kbq-search-expandable requires a FormControl/NgModel binding.

#### Form field directives

The KbqDatepickerToggle component (`<kbq-datepicker-toggle>`) has been removed — use `<kbq-datepicker-toggle-icon>` (KbqDatepickerToggleIconComponent).

The KbqFormFieldWithoutBorders directive (`<kbq-form-field kbqFormFieldWithoutBorders>`) has been removed — use the noBorders input on KbqFormField: `<kbq-form-field noBorders>`.

#### Tooltip modifier triggers

The KbqWarningTooltipTrigger (`[kbqWarningTooltip]`) and KbqExtendedTooltipTrigger (`[kbqExtendedTooltip]`) directives have been removed. Use the base `[kbqTooltip]` directive with the new public `kbqTooltipModifier` input:

```html
<!-- before -->
<div #tooltip="kbqWarningTooltip" [kbqWarningTooltip]="msg" />
<!-- after -->
<div #tooltip="kbqTooltip" kbqTooltipModifier="warning" [kbqTooltip]="msg" />
```

For the extended variant, `[kbqTooltipHeader]` is now also available on the base trigger:

```html
<!-- before -->
<button [kbqExtendedTooltip]="content" [kbqTooltipHeader]="header"></button>
<!-- after -->
<button kbqTooltipModifier="extended" [kbqTooltip]="content" [kbqTooltipHeader]="header"></button>
```

**Datepicker, Timepicker**. The KbqDatepickerInput.kbqValidationTooltip and KbqTimepicker.kbqValidationTooltip setters now accept KbqTooltipTrigger (the base class) instead of KbqWarningTooltipTrigger.

### Migration

**V20 upgrade**. Consumers can run the automatic migration with the `ng update @koobiq/components@20` command. It invokes the `v20-upgrade` schematic, which rewrites your code in place.

**Imports and packages**. Imports from @koobiq/components/navbar-ic, risk-level, and components-experimental/form-field are remapped to the surviving packages (navbar, badge, components/form-field).

**Identifiers in .ts files**. The following identifiers have been renamed:

| Old name                  | New name                         |
| ------------------------- | -------------------------------- |
| KbqNavbarIc\*             | KbqNavbar\*                      |
| KbqRiskLevel\*            | KbqBadge\*                       |
| KbqWarningTooltipTrigger  | KbqTooltipTrigger                |
| KbqExtendedTooltipTrigger | KbqTooltipTrigger                |
| KbqDatepickerToggle       | KbqDatepickerToggleIconComponent |
| KbqFilterBarSearch        | KbqSearchExpandable              |
| RdxAccordionItemState     | KbqAccordionItemState            |
| KbqCodeFile               | KbqCodeBlockFile                 |
| AnimationCurves           | KbqAnimationCurves               |
| MeasurementSystem         | KbqMeasurementSystem             |
| SizeUnitsConfig           | KbqSizeUnitsConfig               |
| KbqFormFieldRef           | KbqFormField                     |
| DropdownPositionX/Y       | KbqDropdownPositionX/Y           |

**Tokens and functions**. Updated: toBoolean( → booleanAttribute(, isCorrectExtension( → FileValidators.isCorrectExtension(, formatDataSize( → getFormattedSizeParts(, kbqComponentParams: → data:;

Removed tokens are stripped from imports: KBQ_VALIDATION, KBQ_SANITY_CHECKS, KBQ_SIDEPANEL_WITH_SHADOW

**Instance methods**. Updated: .openPanel( → .open(, .toggleIsCollapsed( → .toggle(, .focusViaKeyboard( → .focus(.

**Selectors in templates**. Updated: `<kbq-filter-search>` → `<kbq-search-expandable>`, `<kbq-datepicker-toggle>` → `<kbq-datepicker-toggle-icon>`, `<kbq-risk-level>` → `<kbq-badge>`, `<kbq-navbar-ic*>` → `<kbq-navbar*>`.

**Attributes in templates**. Updated: `kbqFormFieldWithoutBorders` → `noBorders`, `[kbqWarningTooltip]` → `kbqTooltipModifier="warning" [kbqTooltip]`, `[kbqExtendedTooltip]` → `kbqTooltipModifier="extended" [kbqTooltip]`, the template ref `="kbqWarningTooltip"` → `="kbqTooltip"`.

**CSS classes in SCSS**. Updated: `.kbq-risk-level` → `.kbq-badge`, `.kbq-navbar-ic` → `.kbq-navbar`, etc.

**Manual fixes**. The schematic emits warnings for structural changes that cannot be fixed automatically and safely: `(onSaveAsNew)` listeners on `<kbq-filters>` must be moved to `(onSave)` with branching on `$event.status === 'newFilter'`; the `[customValidation]` / `[errors]` attributes on file-upload components must be replaced with `FormControl` validators; the `[apps]` attribute on `<button kbqAppSwitcher>` must be wrapped into a single site `[sites]="[{ id, name, apps }]"`.

**After the migration**. Review the diff before committing: the migration is regex-based and does not rewrite values in local variables, re-exports, or aliased imports.
