# v21-upgrade

Migration invoked by `ng update @koobiq/components@21`. It removes the uses of the APIs that were deprecated
before 21.0.0 and removed in it: renamed members and aliases are rewritten, everything else is reported with the
replacement to use. It also reports the uses of the state that 21.0.0 turned into signals.

The schematic walks every `.ts`, `.html`, `.scss` and `.css` file of the project (skipping `node_modules` and
`dist`). The tables live in `data/`, one file per area, and `data.ts` gathers them:

- **`tsReplacements`** — TypeScript imports, identifiers and member accesses;
- **`templateReplacements`** — attributes and bindings in templates, external or inline;
- **`scssReplacements`** — selectors in style sheets;
- **`warnPatterns`** — what cannot be rewritten, reported with what to do instead.

## What it changes

**Code block and icon button**

- Rewrites `canLoad` → `canDownload` and `codeFiles` → `files` on `<kbq-code-block>`: bindings, static
  and valueless attributes.
- Rewrites `small` on an icon button to `size`: `[small]="true"` and `small="true"` → `size="compact"`,
  `[small]="false"` → `size="normal"`, any other binding → `[size]="(expr) ? 'compact' : 'normal'"`.
- Rewrites the `kbq-icon-button_small` class to `kbq-icon-button_compact` in styles and code.
- Reports a code block that binds an alias next to its replacement, an icon button that sets both
  `small` and `size` or a static `small` other than `"true"`, programmatic `canLoad` / `codeFiles` /
  `canLoadInput` / `codeFilesInput` / `small`, and `scrollableCodeContent`, which is removed.

**Core** — rewrites:

- `KbqThemeSelector.Default` → `KbqThemeSelector.Light` and `KbqThemeNames.Default` → `KbqThemeNames.Light`, in
  code and templates;
- `KbqDefaultThemes` → `KBQ_DEFAULT_THEMES` and `KbqTheme` → `KbqThemeConfig` (an import clause that held both
  names keeps one).

Reports:

- `KbqTheme`: `KbqThemeConfig` requires `colorScheme` and has no `selected`;
- `ThemeService` imported from `@koobiq/components/core`: inject `KbqThemeService` and the member to use for each
  old one;
- `getOptionScrollPosition` imported from `@koobiq/components/core`: `KbqOption.focus()` or `kbqFocusAndReveal()`.

**Dropdown and select** — rewrites nothing: the removed members were never inputs, so no template binds them.
Reports:

- `.triggerWidth` in a file that imports `@koobiq/components/dropdown` or uses `<kbq-dropdown>`, and `triggerWidth`
  in a `KbqDropdownPanel` implementation or a `KbqDropdown` subclass: delete it, set `KbqDropdownTrigger.widthOrigin`
  to match another element;
- `.offsetY` (not a call — that is the `KbqDropdownTrigger` input) in a file that uses `kbq-select`,
  `kbq-tree-select` or `kbq-timezone-select`, and an `offsetY` field of their subclasses: delete it, the gap is the
  `--kbq-connected-overlay-gap` CSS variable;
- `AUTOCOMPLETE_PANEL_HEIGHT` imported from `@koobiq/components/autocomplete`: keep a constant of your own.

**Filter bar** — rewrites:

- `KbqFilterBarRefresher` → `KbqFilterRefresher` (an import clause that held both names keeps one);
- `KbqPipeMinWidth`: drops it from the `@koobiq/components/filter-bar` import and from `imports` arrays, and the
  `kbqPipeMinWidth` attribute from templates.

Reports:

- `.changes` in a file that names `KbqFilterBar`: read `filter()` in an `effect()` or listen to `(filterChange)`;
- any other `KbqPipeMinWidth` reference (an aliased import, a subclass, a query): remove it.

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
  `KbqInputPassword` or `kbqInputPassword`: call `control.updateValueAndValidity()` instead.

**Forms controls** — rewrites nothing; reports, in a file that names `KbqCheckbox`, `KbqToggleComponent` or their
tags:

- a use of `.writeValue`, `.registerOnChange`, `.registerOnTouched` or `.setDisabledState` (except on `this`): set
  `checked` / `disabled`, listen to `(change)`, or call it on the host `KbqCheckable`;
- a use of `.onTouched` (except on `this`), checkbox only: forms never called it, delete it.

**Navbar, ellipsis center and description list** — rewrites:

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
- `.minWidth()` and `setInput('minWidth', …)` in a file that names `KbqDlComponent`: use `verticalBreakpoint`.

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

**Tags** — rewrites nothing; reports, in a file that names `KbqTagInput` or its `exportAs`:

- a read of `.ngControl` (except `this.ngControl` and a `…List.ngControl`): read the control bound to the input;
- a call of `.triggerValidation()` (except on `this`): a no-op, delete it;
- a subclass of `KbqTagInput` that mentions either member.

`KbqTagTextControl.ngControl` is not reported: the interface is not exported.

## Running it manually

```bash
ng g @koobiq/components:v21-upgrade --project "<your project>"
```

| Option    | Default | Description                                                    |
| --------- | ------- | -------------------------------------------------------------- |
| `project` | —       | Project to migrate; the whole workspace when omitted.          |
| `fix`     | `true`  | Applies the rewrites; with `false`, only reports what changes. |
