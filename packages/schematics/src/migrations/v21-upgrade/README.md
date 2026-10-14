# v21-upgrade

Migration invoked by `ng update @koobiq/components@21`. It removes the uses of the APIs that were deprecated
before 21.0.0 and removed in it: renamed members and aliases are rewritten, everything else is reported with the
replacement to use. It also reports the uses of the state that 21.0.0 turned into signals.

The schematic walks every `.ts`, `.html`, `.scss` and `.css` file of the project (skipping `node_modules` and
`dist`), and the `styles` of the project's targets in `angular.json`. The tables live in `data/`, one file per
area, and `data.ts` gathers them:

- **`tsReplacements`** — TypeScript imports, identifiers and member accesses;
- **`templateReplacements`** — attributes and bindings in templates, external or inline;
- **`scssReplacements`** — selectors in style sheets;
- **`styleEntryReplacements`** — the `styles` entries in `angular.json`; an entry they turn into a duplicate is
  dropped;
- **`warnPatterns`** — what cannot be rewritten, reported with what to do instead.

## What it changes

**Accordion** — rewrites nothing; reports the `kbq-accordion-trigger__action` class in templates, styles and code:
move the actions out of the trigger into a `kbq-accordion-header__actions` element next to it.

**Code block and icon button**

- Rewrites `canLoad` → `canDownload` and `codeFiles` → `files` on `<kbq-code-block>`: bindings, static
  and valueless attributes.
- Rewrites `small` on an icon button to `size`: `[small]="true"` and `small="true"` → `size="compact"`,
  `[small]="false"` → `size="normal"`, any other binding → `[size]="(expr) ? 'compact' : 'normal'"`.
- Rewrites the `kbq-icon-button_small` class to `kbq-icon-button_compact` in styles and code.
- Reports a code block that binds an alias next to its replacement or binds `canDownload` or `files` twice
  (what the 20.0.0 migration made of such a pair), an icon button that sets both
  `small` and `size` or a static `small` other than `"true"`, programmatic `canLoad` / `codeFiles` /
  `canLoadInput` / `codeFilesInput` / `small`, and `scrollableCodeContent`, which is removed.

**Core** — rewrites:

- `KbqThemeSelector.Default` → `KbqThemeSelector.Light` and `KbqThemeNames.Default` → `KbqThemeNames.Light`, in
  code and templates;
- `KbqDefaultThemes` → `KBQ_DEFAULT_THEMES` and `KbqTheme` → `KbqThemeConfig` (an import clause that held both
  names keeps one);
- `ThemePalette.Error`, `.Warning` and `.Success` → the `KbqComponentColors` members of the same value, dropping
  the `ThemePalette` import once nothing else names it;
- the `mcLine` and `mcListIcon` aliases → `kbq-line` and `kbq-list-icon`, in templates, in selectors written in
  code and in the attribute selectors of stylesheets.

Reports:

- `KbqTheme`: `KbqThemeConfig` requires `colorScheme` and has no `selected`;
- `ThemeService` imported from `@koobiq/components/core`: inject `KbqThemeService` and the member to use for each
  old one;
- `getOptionScrollPosition` imported from `@koobiq/components/core`: `KbqOption.focus()` or `kbqFocusAndReveal()`;
- any other use of `ThemePalette`: `Primary`, `Secondary`, `Info` and `Default` styled nothing, `Empty` becomes an
  unset `color`, a type or a template field becomes `KbqComponentColors`;
- a re-export of `ThemePalette` from `@koobiq/components/core`, left as is: `KbqComponentColors` has other members
  and values;
- the undocumented exports nothing in the library used, imported from `@koobiq/components/core`: the pop-up
  position lists, `ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT`, `SELECT_PANEL_VIEWPORT_PADDING`, `NUMBER_FORMAT_REGEXP`,
  `isWithin`, `KBQ_SELECT_SCROLL_STRATEGY_PROVIDER`, `KBQ_CHECKABLE_CONTROL_VALUE_ACCESSOR`, `KbqHover`, `CanColor`,
  `KbqAnimationCurves`, `KbqAnimationDurations`, `KbqRectangleItem`, `countGroupLabelsBeforeOption` and `KbqLineSetter`, each with
  what to do instead;
- a call of `.handleBodyInteraction()`, and a read of `.isSpecialFormatForRULocale()` or `.roundingOptions`,
  private members of the number pipes now;
- in a subclass of a pop-up or of its trigger, `markForCheck()`, `warning` or `closeOnInteraction` on `this`,
  `super` or `instance`, or overridden: delete a `markForCheck()` after `updateClassMap()` or a visibility change,
  which re-render the pop-up, and use `changeDetectorRef.markForCheck()` or `instance.detectChanges()` for another
  field;
- in a subclass of a pop-up, `elementRef` re-declared as a field, decorated or not, or as a constructor parameter
  property: override the `KbqPopUp.elementRef` getter over a `viewChild()`;
- `.isRow` in a file that names `KbqFormElement` or `kbqFormElement`: check the `kbq-form__row` class;
- deprecated for removal in 22.0.0: the unprefixed date pipes and their `ImpurePipe` twins (in templates and as
  imported classes), the `mcHighlight` pipe, `isDigit`, `isBoolean`, `KbqMeasureScrollbarService`,
  `FocusKeyManager.getFocusOrigin()` and `dateInput` of the datepicker locale configuration, each with its
  replacement.

**Dropdown and select** — rewrites:

- `DropdownPositionX` / `DropdownPositionY` → `KbqDropdownPositionX` / `KbqDropdownPositionY` in a file that names
  `@koobiq/components/dropdown` (an import clause that held both names keeps one);
- `KbqSelectPanelWidth` and `KbqTreeSelectPanelWidth` → `KbqPanelWidth`, moving the import from the select or
  tree-select entry point to `@koobiq/components/core`.

Reports:

- `.triggerWidth` in a file that imports `@koobiq/components/dropdown` or uses `<kbq-dropdown>`, and `triggerWidth`
  in a `KbqDropdownPanel` implementation or a `KbqDropdown` subclass: delete it, set `KbqDropdownTrigger.widthOrigin`
  to match another element;
- `.offsetY` (not a call — that is the `KbqDropdownTrigger` input) in a file that uses `kbq-select`,
  `kbq-tree-select` or `kbq-timezone-select`, and an `offsetY` field of their subclasses: delete it, the gap is the
  `--kbq-connected-overlay-gap` CSS variable;
- `AUTOCOMPLETE_PANEL_HEIGHT` imported from `@koobiq/components/autocomplete`: keep a constant of your own;
- `DropdownPositionX` / `DropdownPositionY` in a file that does not name the dropdown entry point, and an aliased
  import or a re-export of `KbqSelectPanelWidth` / `KbqTreeSelectPanelWidth`: rename them by hand;
- `.clearValue` (except on `this` and on a form field, whose `clearValue()` stays) in a file that uses one of the
  selects, and `clearValue` in their subclasses: project `<kbq-cleaner />`, or reset the form control from code;
- the `kbq-dropdown__group-header_small` class in templates, styles and code: use `<kbq-optgroup label="…" />`.

**Filter bar** — rewrites:

- `KbqFilterBarRefresher` → `KbqFilterRefresher` (an import clause that held both names keeps one);
- `KbqPipeMinWidth`: drops it from the `@koobiq/components/filter-bar` import and from `imports` arrays, and the
  `kbqPipeMinWidth` attribute from templates.

Reports:

- `.changes` in a file that names `KbqFilterBar`: read `filter()` in an `effect()` or listen to `(filterChange)`;
- any other `KbqPipeMinWidth` reference (an aliased import, a subclass, a query): remove it;
- a `required:` key next to `cleanable:`, `removable:` or `type: KbqPipeTypes.…` in the same object literal, in a
  file that imports `@koobiq/components/filter-bar`: delete it, set `cleanable: false` and `removable: false`;
- `.required` read on `data` or on a receiver named like a pipe, in a file that imports the filter bar or uses
  `kbq-pipe` classes: read `cleanable` and `removable` instead.

**Form field** — rewrites nothing: none of the removed APIs has a 1:1 replacement. Reports:

- `KbqPasswordHint`, `PasswordRules`, `regExpPasswordValidator` and `hasPasswordStrengthError` imported from
  `@koobiq/components/form-field`: put the rules on the control as validators (`PasswordValidators`) and show them
  with `<kbq-reactive-password-hint [hasError]="…">`;
- `kbq-password-hint` and `kbq-password-hint__icon` in templates, styles and selectors in code;
- a check of the `passwordStrength` error in a file that uses the form field or the input: the form field no longer
  sets it;
- `.passwordHints`, `.onKeyDown()` on a receiver named like a form field and `.hasPasswordHint`, in a file that
  names `KbqFormField` or `kbqFormField`;
- every `canCleanerClearByEsc`: it had no effect, delete it;
- `.checkRules()` and `.checkRule.next()` / `.subscribe()` / `.pipe()` / `.complete()` in a file that names
  `KbqInputPassword` or `kbqInputPassword`: call `control.updateValueAndValidity()` instead;
- `.connectTo()` (except on `this`) in a file that names `KbqStepper`, `kbqStepper` or `<kbq-stepper>`: it was a
  no-op, delete it.

**Forms controls** — rewrites the `TransitionCheckState` import from `@koobiq/components/checkbox` into the
`@koobiq/components/core` one, and reports an aliased import, a re-export or a namespace read of it. Reports, in a
file that names `KbqCheckbox`, `KbqToggleComponent` or their tags:

- a use of `.writeValue`, `.registerOnChange`, `.registerOnTouched` or `.setDisabledState` (except on `this`): set
  `checked` / `disabled`, listen to `(change)`, or call it on the host `KbqCheckable`;
- a use of `.onTouched` (except on `this`), checkbox only: forms never called it, delete it;
- a call of `.onLabelTextChange()` (except on `this`), toggle only: it does nothing now and is deprecated for
  removal in 22.0.0, delete it;
- a read of `currentCheckState` without the call in a class that extends `KbqToggleComponent`: it is a signal now.

**Navbar, ellipsis center, description list and loader overlay** — rewrites:

- `minWidth` → `verticalBreakpoint` on `<kbq-dl>`, as a binding or a static attribute, unless the tag sets
  `verticalBreakpoint` too;
- `longTitle` on `kbq-navbar-brand` (a binding, a static or a valueless attribute): dropped, the two-line title is
  detected automatically.

Reports:

- every dropped `longTitle`: a forced `true` or `false` has no replacement;
- `.longTitle()` and `setInput('longTitle', …)` in a file that names `KbqNavbarBrand` or `kbqNavbarBrand`;
- `.getTitleWidth()` in a file that names `KbqNavbarItem` or `kbqNavbarItem`, and `.outerElementWidth` in one that
  names `KbqNavbarTitle`: call `getOuterElementWidth()` on the title;
- `.resizeStream` in a file that names `KbqEllipsisCenterDirective`: delete it;
- a `<kbq-dl>` that sets both `minWidth` and `verticalBreakpoint`: `minWidth` took precedence, move its value;
- a renamed `minWidth` whose value is not a number literal: `minWidth` fell back to 400 on `null`, `''` or `700px`,
  `verticalBreakpoint` reads them as `NaN` and never switches to the vertical layout;
- `.minWidth()` and `setInput('minWidth', …)` in a file that names `KbqDlComponent`: use `verticalBreakpoint`.
- `transparent` and `card` on `<kbq-loader-overlay>`, and their reads and `setInput()` in a file that names
  `KbqLoaderOverlay`: deprecated for removal in 22.0.0, set `surface` instead.

**Popover**

- Rewrites the unprefixed inputs of `KbqPopoverTrigger` and `KbqPopoverConfirmTrigger` — `[name]=`, `name=` and a
  bare `name` — on an element that carries `kbqPopover` or `kbqPopoverConfirm`: `hideIfNotInViewPort`,
  `defaultPaddings`, `container`, `hasBackdrop`, `hasCloseButton`, `closeOnScroll` and `backdropClass` become
  `kbqPopoverHideIfNotInViewPort`, `kbqPopoverDefaultPaddings`, and so on. The same inputs of other components
  are left alone.
- Reports `getKbqPopoverInvalidPositionError`, a read of `KbqPopoverTrigger.hideIfNotInViewPort` (use
  `popoverHideIfNotInViewPort()`) and a `hostDirectives` entry of `KbqPopoverTrigger` that exposes one of the
  unprefixed inputs.

**State as signals** — rewrites nothing; reports, each in a file that uses the entry point (an import in code, the
element in a template):

- `.value`, `.getValue()`, `.next()`, `.subscribe()`, `.pipe()` and `| async` on the flags, `unreadItemsCounter` and
  `groupedItems` of the notification center, and a subscription to its `changes`, which no longer emits on
  subscription;
- the same on `hovered` and `focused` of the toast service and component;
- the same on `hovered` of a pop-up or its trigger (tooltip, popover, notification center, app switcher), but
  not on `KbqDropdownItem.hovered`, which stays an event stream;
- a subscription to, an assignment of or `| async` on `filteredOptions` of the filter bar, `super.ngOnInit()` in a
  subclass of `KbqPipeSelectComponent`, and the date pipe flags read as fields in a subclass;
- `hiddenItems` of `KbqSelect` read as a field;
- `.value.next()`, `.value.getValue()`, `.value.subscribe()` and the like on `KbqSearchExpandable`;
- `super.ngAfterContentInit()` and `super.ngOnDestroy()` in a subclass of `KbqDatepickerToggleIconComponent`.

**Styles** — rewrites:

- the arguments of `koobiq-theme()`, `koobiq-typography()` and `kbq-core-theme()`, dropped unless they hold
  parentheses (a map, a function call);
- `prebuilt-themes/light-theme.css` and `dark-theme.css` → `theme.css` in style sheets, code, templates and the
  `styles` of `angular.json`, keeping one load where both themes were loaded;
- the unprefixed markdown typography classes (`md-h1`…`md-h6`, `md-body`, `md-body-mono`, `md-caption`,
  `md-table-cell`, `md-table-header`) → `kbq-md-*` in `class` attributes, `[class.…]` bindings and selectors.

Reports:

- arguments of those mixins that hold parentheses;
- `kbq-contrast()`, `kbq-palette()`, `kbq-color()` and `kbq-typography-config()`;
- `kbq-light-theme()` and `kbq-dark-theme()`, deprecated for removal in 22.0.0;
- deprecated for removal in 22.0.0 too, the `kbq-scrollbar` class, which no library component carries any more (a
  selector, a `class` attribute or host property, `[class.…]`, an `[ngClass]` key, `classList` and `addClass()`),
  `kbq-scrollbar-theme()`, and its `--kbq-scrollbar-*` variables the new scrollbar does not share: use
  `kbqNativeScrollbar` or `<kbq-scrollbar>`;
- a `@use`, `@import` or `@forward` of `@koobiq/components/core/styles/tokens`: load the design tokens modules
  directly;
- a load of the removed modules `core/styles/functions` (its index, `number`, `string`),
  `typography/typography-utils`, `common/clearfix` and `common/popup`, a call of the removed
  `kbq-markdown-typography-config()`, the `typography-utils` getters, `popup-params`, `input-placeholder`,
  `rtl-value()` and `kbq-typography-css-variables`, and, in a file that loads `core/styles/functions`, a timing
  variable other than `$ease-out-circ`, `$ease-in-out-quad` and `$ease-in-out-circ`;
- an unprefixed markdown class in any other string, such as `classList.add('md-h1')` or `[ngClass]`.

**Tags** — rewrites nothing; reports, in a file that names `KbqTagInput` or its `exportAs`:

- a read of `.ngControl` (except `this.ngControl` and a `…List.ngControl`): read the control bound to the input;
- a call of `.triggerValidation()` (except on `this`): a no-op, delete it;
- a subclass of `KbqTagInput` that mentions either member.

`KbqTagTextControl.ngControl` is not reported: the interface is not exported.

**Toast**

- Rewrites `--kbq-toast-stack-size-margin-top` → `--kbq-toast-stack-size-margin-vertical` and
  `--kbq-toast-stack-size-margin-right` → `--kbq-toast-stack-size-margin-horizontal` in styles, templates and code.
- Reports a file that declares both a removed and a new name, and `dispatchScrollEvent` in a file that names
  `KbqToastContainerComponent` or uses `<kbq-toast-container>`: delete the call.

**Tree** — rewrites the listeners of the outputs deprecated for removal in 22.0.0, which emit the same events as
their replacements: `(onSelectAll)` → `(selectAllChange)` and `(onCopy)` → `(copyChange)` on
`<kbq-tree-selection>`, `(onSelectionChange)` → `(selectionChange)` on `<kbq-tree-option>`. Reports:

- `.isUserInput` in a file that names `KbqTreeOptionChange`, and `$event.isUserInput` bound to an output of
  `<kbq-tree-option>`: it was always `false`, delete the check;
- `new KbqTreeOptionChange(…)` with a second argument, and a `super(…)` call with one in a subclass: drop it;
- `.onSelectAll` / `.onCopy` in a file that names `KbqTreeSelection`, and `.onSelectionChange` in a file that
  names `KbqTreeOption`: use the replacement output;
- `.mostRecentTreeNode` in a file that imports `@koobiq/components/tree`: deprecated, nothing reads it.

The `isUserInput` of `KbqOptionSelectionChange` and `KbqTreeSelectChange` stays and is not reported, nor are the
`onSelectAll` and `onCopy` of `kbq-list-selection` and the `onSelectAll` of `kbq-tree-select`, which are not
deprecated.

## Running it manually

```bash
ng g @koobiq/components:v21-upgrade --project "<your project>"
```

| Option    | Default | Description                                                    |
| --------- | ------- | -------------------------------------------------------------- |
| `project` | —       | Project to migrate; the whole workspace when omitted.          |
| `fix`     | `true`  | Applies the rewrites; with `false`, only reports what changes. |
