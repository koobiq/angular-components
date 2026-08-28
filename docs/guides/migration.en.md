## How to upgrade from Koobiq 17

New versions include improvements but also contain **breaking changes**; they must be applied step by step.

### Upgrade plan

1. **Up to 18.5.3**: a safe baseline with updated theming and icons.
2. **18.6**: token update.
3. **18.22**: component attribute changes.
4. **20.0.0**: the move to Angular 20: removal of deprecated APIs and package renames.
5. **20.2.0**: the move of the filter-bar API to signals.
6. **20.2.0**: one shared mechanism for dropdown panel width.
7. **20.3.0**: removal of the overlay demotion mechanism.
8. **20.3.0**: the move of the app-switcher API to signals.
9. **20.3.0**: the button review — host attributes, group ownership and styles.
10. **20.3.0**: button supported colors — a default color of its own per style.
11. **20.3.0**: the button-toggle review — ARIA semantics, keyboard navigation and signal inputs.
12. **20.3.0**: the form-field review — signals, accessibility and the removal of `mixinColor`.
13. **20.3.0**: the theme service review — signals, `auto` mode and built-in persistence.
14. **20.3.0**: explicit prefix and suffix slots for tag content.
15. **20.3.0**: deprecation of the overlayscrollbars-based Scrollbar implementation.
16. **20.3.0**: the locale layer typing — a typed `getParams`, partial locale data and signals.
17. **20.3.0**: `multiple` on the selection list and tree became a real, changeable input.
18. **20.3.0**: the component review — closed internals, signal inputs and the behavior fixes it uncovered.

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

### 6. Panel width unification (20.2.0)

In version 20.2.0 `autocomplete`, `select`, `tree-select`, `timezone` and `dropdown` started resolving the width of their dropdown panel through one shared mechanism. They now all expose the same three inputs — `panelWidth`, `panelMinWidth` and `panelMaxWidth` — with the same meaning:

| `panelWidth`           | Panel width                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| not set (default)      | sizes to its content, never narrower than the trigger or `panelMinWidth` |
| `'auto'`               | matches the trigger, never narrower than `panelMinWidth`                 |
| a number or CSS string | exactly that width; `panelMinWidth` is not applied                       |

Panels are now also capped at **640px** through the `--kbq-panel-size-width-max` token. The cap is soft: it limits how far a panel grows with its content, but it never makes a panel narrower than its trigger and never clamps an explicit `panelWidth`. Change it globally by setting the token on `:root`, per component through the component's own token (`--kbq-dropdown-size-container-width-max` still works), or per instance through `panelMaxWidth`.

#### Running the migration

The `autocomplete-panel-width-auto` schematic runs automatically:

```bash
ng update @koobiq/components@20
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

**`kbq-timezone-select` no longer has width defaults of its own.** It used to declare `panelWidth: 'auto'` and `panelMinWidth: 640`; both are gone, so it now inherits the select's defaults — the menu sizes to its content, never narrower than the field or 200px, and stops at 640px. In practice the panel used to match the field exactly (the `640` minimum never reached the DOM between 20.0.0 and 20.1.0), so the visible change is that the menu now grows with long timezone names. Set `panelWidth="auto"` to get the old field-matching behaviour back.

**`[panelMinWidth]="null"`** now keeps the trigger-width floor. It previously produced an invalid `NaNpx`, which browsers dropped, removing every minimum.

**`KbqDropdown.triggerWidth`** is deprecated and has no effect (it has been unread since 20.0.0). To make a dropdown panel match an element other than its trigger, set `KbqDropdownTrigger.widthOrigin`. `kbq-split-button`'s `panelAutoWidth` does this for you and now works — previously it wrote to `triggerWidth` and did nothing.

**`kbq-dropdown`'s minimum width is now measured with `getBoundingClientRect()`** (the trigger's full border-box) instead of `getComputedStyle().width` minus its borders (the old, incorrectly-computed content-box). A trigger with padding or a border renders a wider panel than before by that amount; a trigger with neither is unaffected.

### 7. Overlay demotion removal (20.3.0)

Until 20.3.0 an open `dropdown`, `select` or `popover` panel lowered the **shared, app-wide** `.cdk-overlay-container` from `z-index: 1000` to `999` by adding a `.cdk-overlay-container_dropdown` class to it. The point was to let a panel slide under a sticky `kbq-navbar` / `kbq-top-bar` while the page scrolled. `KbqDropdownTrigger.demoteOverlay` turned that off for one trigger, and the `KBQ_DROPDOWN_HOST` marker token — provided by `KbqNavbar` and `KbqTopBar` — flipped its default to `false` so a dropdown inside the chrome would not end up behind its own trigger.

The whole mechanism was removed: the input, the token, the class and the stylesheet rule. It operated on the container rather than on individual overlays, so it could not lower a panel without lowering every other overlay — modals, sidepanels, toasts and tooltips included — and it did so from whichever component happened to open first.

**The overlay container now stays at `z-index: 1000` at all times, so panels render above `kbq-navbar` and `kbq-top-bar` instead of sliding under them.**

#### Running the migration

The `dropdown-demote-overlay` schematic runs automatically:

```bash
ng update @koobiq/components@20
```

Or manually:

```bash
ng g @koobiq/components:dropdown-demote-overlay --project <your project>
```

#### What is fixed automatically

**The `demoteOverlay` attribute is removed from templates** in all of its forms — `demoteOverlay`, `demoteOverlay="false"` and `[demoteOverlay]="expr"` — in `.html` files and in inline `template:` literals.

Template rules are applied to `.ts` files only inside inline templates, so a wrapper component that forwards the input keeps its own member:

```ts
// Before
@Component({
    template: `
        <button [kbqDropdownTriggerFor]="menu" [demoteOverlay]="demote">…</button>
    `
})
export class MyTrigger {
    @Input() demote = false;
}

// After — only the binding is removed; `demote` is now dead code the compiler points at
@Component({
    template: `
        <button [kbqDropdownTriggerFor]="menu">…</button>
    `
})
export class MyTrigger {
    @Input() demote = false;
}
```

**`{ provide: KBQ_DROPDOWN_HOST, … }` entries of a provider array are removed**, together with the `KBQ_DROPDOWN_HOST` import specifier they made invalid and a `providers` array the removal left empty.

#### What you need to fix manually

**Programmatic `demoteOverlay` access.** A read or an assignment (`this.trigger.demoteOverlay = false`) is reported with a warning rather than rewritten — deleting a statement is not always safe, and the compiler flags it anyway. There is nothing to opt out of any more, so remove the line.

**Providers the schematic could not rewrite.** A provider declared outside a provider array (`export const HOST_PROVIDER = { provide: KBQ_DROPDOWN_HOST, … };`), or an `inject(KBQ_DROPDOWN_HOST)` call, is reported as a leftover `KBQ_DROPDOWN_HOST` warning. Remove it by hand.

**`.cdk-overlay-container_dropdown` rules in your stylesheets** are dead — the class is never applied now. This is reported as a warning. If the rule was an override neutralising the demotion, it is simply redundant.

**Panels that used to slide under your sticky chrome now render on top of it.** If you relied on the old behaviour, lower your header below the overlay container z-index (the library ships `$overlay-container-z-index: 1000`) rather than trying to reinstate the demotion — it lowered every overlay, not just the panel.

**`kbq-select` and popover panels inside `kbq-navbar` / `kbq-top-bar` are fixed by this release.** They applied the demotion unconditionally and had no opt-out, so they rendered behind the very chrome that contained them. No action needed — this is the bug the removal fixes.

### 8. App-switcher upgrade (20.3.0)

In version 20.3.0 `KbqAppSwitcherTrigger` moved `selectedApp` and `selectedSite` from a plain `@Input()` (plus a matching `output()`) to `model()`, and a review of the component removed several members that never did anything. Template bindings keep working — `[selectedApp]`, `[(selectedSite)]` and `(selectedAppChange)` are unchanged — so only programmatic access and reads through a `#ref="kbqAppSwitcher"` template reference variable break.

| Member                                                                               | Before              | After                                                              |
| ------------------------------------------------------------------------------------ | ------------------- | ------------------------------------------------------------------ |
| `selectedApp`                                                                        | `@Input()` property | `ModelSignal<KbqAppSwitcherApp \| undefined>` — write via `.set()` |
| `selectedSite`                                                                       | accessor input      | `ModelSignal<KbqAppSwitcherSite \| undefined>` — **value changed** |
| `selectedAppChange` / `selectedSiteChange`                                           | `output()`          | the implicit outputs of the models above                           |
| `header` / `footer`                                                                  | properties          | removed                                                            |
| `KbqAppSwitcherComponent.isTrapFocus` / `updateTrapFocus()`                          | public API          | removed                                                            |
| `KbqAppSwitcherDropdownApp.getIcon()`                                                | public method       | removed                                                            |
| `KbqAppSwitcherListItem.collapsed`                                                   | property            | `ModelSignal<boolean>`                                             |
| `app` / `site` inputs of `KbqAppSwitcherListItem` / `-DropdownApp` / `-DropdownSite` | optional inputs     | `input.required` signals                                           |

#### Running the migration

The changes are applied by the `app-switcher-signals` schematic (runs automatically):

```bash
ng update @koobiq/components@20
```

Or manually — for example, if you have already upgraded to 20.3.0. To preview without writing — `--fix=false`:

```bash
ng g @koobiq/components:app-switcher-signals --project <your project>
```

#### What is fixed automatically

**Reads and writes in TypeScript** (for receivers annotated `KbqAppSwitcherTrigger`):

- trigger.selectedApp → trigger.selectedApp(),
- trigger.selectedApp = app → trigger.selectedApp.set(app),
- trigger.selectedApp.name → trigger.selectedApp().name,
- trigger.selectedAppChange.subscribe(fn) → trigger.selectedApp.subscribe(fn) — `ModelSignal` implements `OutputRef`, so the callback signature is identical

**Reads through a template reference variable** (`#ref="kbqAppSwitcher"`, in external `.html` files and inline templates):

- switcher.selectedApp → switcher.selectedApp()

All replacements are idempotent — an access already followed by `()`, `.set`, `.update`, `.asReadonly` or `.subscribe` is left alone, so running the schematic twice does not double the call.

Note that `selectedApp()` is typed `KbqAppSwitcherApp | undefined`. Where the old property was read as non-nullable, the compiler will now ask for a `!` or a `?.` — that narrowing is yours to place.

#### What you need to fix manually

The schematic emits warnings for what cannot be rewritten safely:

**`selectedSite` is not rewritten, because its value changed.** The old getter returned the site with its applications already grouped for rendering; the model returns the value that was passed in. Read `trigger.selectedSite()` for the raw site and `trigger.parsedSelectedSite()` for the grouped one, and write with `trigger.selectedSite.set(site)`. `selectedSiteChange` is now the model's implicit output and emits the raw site as well.

**`selectedAppChange.emit(app)`**: no longer an emitter → `trigger.selectedApp.set(app)`.

**`header` / `footer`**: removed. The popup never rendered either, so the value was pushed into the overlay and dropped — delete the usage.

**`isTrapFocus` / `updateTrapFocus()`**: removed from `KbqAppSwitcherComponent`. Its template never bound `[cdkTrapFocus]`, so neither did anything.

**`KbqAppSwitcherDropdownApp.getIcon()`**: removed. Inline markup is sanitized by `KbqAppSwitcherIconSanitizer` and rendered by the component itself.

**Inline `icon` markup is now sanitized** against a strict SVG allow-list before it is rendered: `<script>`, `<style>`, `<foreignObject>`, HTML elements, every `on*` handler and any reference to an external resource are removed, and markup that changes shape when re-parsed is dropped entirely — in which case the row falls back to `iconSrc`. Check any icon that relies on those; prefer `iconSrc` for icons that come from a server.

The schematic does not cover the following changes — check them yourself:

**`KbqAppSwitcherModule` no longer provides `FocusTrapFactory` / `FOCUS_TRAP_INERT_STRATEGY`.** The app-switcher never rendered a focus trap, and those providers are injector-wide: they replaced the CDK inert focus-trap strategy with a no-op for every other focus trap in the same scope. If your application relied on that, provide them explicitly where they are actually needed.

**`defaultGroupBy`** now identifies a synthetic app group by its type name instead of an empty `id`.

**The popup hides itself when it scrolls out of an ancestor marked `kbq-hide-nested-popup`** (a tab body, for example). The guard that used to suppress this never passed, so the behaviour is effectively new.

The schematic matches receivers by explicit type annotation only, so aliases (`const t = this.trigger; t.selectedApp`) are left untouched — fix them by hand.

### 9. Button review (20.3.0)

The review of `[kbq-button]` changed three unrelated things at once. Nothing here has a deprecation period — the old behaviour is simply gone — but only one of the changes stops your code from compiling.

**Host attributes are now chosen by host tag.** Until 20.3.0 a disabled button rendered `disabled` _and_ `aria-disabled="true"`, whatever the host element was. `disabled` is not a valid attribute on an anchor and was ignored by the browser, while `aria-disabled` on a native `<button>` merely repeated what the native attribute already said. Each host now gets the one that applies:

| Host                             | Before                              | After                                                                  |
| -------------------------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| `<button kbq-button [disabled]>` | `disabled` + `aria-disabled="true"` | `disabled`                                                             |
| `<a kbq-button [disabled]>`      | `disabled` + `aria-disabled="true"` | `aria-disabled="true"` + `tabindex="-1"` + `.kbq-disabled`             |
| `<button kbq-button>`            | `tabindex="0"`                      | no `tabindex` — a native button is already in the tab order            |
| `<a kbq-button>` without `href`  | no role                             | `role="button"` — it does not navigate, so it is announced as a button |

**A button group no longer overwrites what the button owns.** `KbqButtonGroupRoot` propagated its `kbqStyle` and `color` to every nested button on each update, including buttons that set their own. It now treats such a button as the owner and leaves it alone. Its `disabled` became additive as well: disabling the group disables every child, but re-enabling it no longer enables a child that was disabled through its own input. The `disabled` getter reads `boolean | undefined` and stays `undefined` while the input is unbound, so an unbound group never force-enables anything.

**Styles.** Four physical border-radius mixins were removed in favour of logical ones, the `.kbq-progress` utility moved into `kbq-core()`, and two custom properties that nothing read were dropped.

#### Running the migration

The `button-state-and-styles` schematic runs automatically:

```bash
ng update @koobiq/components@20
```

Or manually:

```bash
ng g @koobiq/components:button-state-and-styles --project <your project>
```

#### What is fixed automatically

**The removed border-radius mixins are rewritten.** `border-right-radius`, `border-left-radius`, `border-top-radius` and `border-bottom-radius` were removed from `core/styles/common/_groups-mixins.scss` and `core/styles/common/_groups.scss` (the latter re-exported through `core/styles/common/_index.scss`). An unmigrated stylesheet no longer compiles, which makes this the one mandatory mechanical change of the release:

```scss
// Before
@include border-right-radius(0);
@include groups-mixins.border-top-radius(var(--kbq-size-border-radius));

// After
@include border-inline-end-radius(0);
@include groups-mixins.border-block-start-radius(var(--kbq-size-border-radius));
```

The rewrite is anchored on `@include`, so a real CSS declaration (`border-top-left-radius`), a custom property (`--border-top-radius`) or a comment mentioning the old name is left alone.

**This is not a pure rename.** `border-inline-end-radius` follows `dir`, so under `dir="rtl"` it rounds the corners `border-right-radius` did not. That is the intent — the library moved its own group styling and its icon gaps the same way — but a physically-designed RTL layout will change.

#### What you need to fix manually

**Buttons that own an input inside a group** are reported with a file and line number. The schematic parses your templates and reports a button only when it sits inside a group _and_ declares its own `kbqStyle`, `color` or `disabled`:

```html
<div kbqButtonGroupRoot [kbqStyle]="groupStyle">
    <button kbq-button [kbqStyle]="ownStyle">Reported — the group no longer wins here</button>
    <button kbq-button>Not reported — still inherits from the group</button>
</div>
```

Drop the binding if you wanted the group value, or keep it if you wanted the override. Both readings were possible before, which is why this is reported rather than rewritten.

**`KbqButtonGroupRoot` and `KbqButtonCssStyler` API changes** are reported as warnings. The group's `disabled` is now `boolean | undefined`; on the styler, `nativeElement` became `readonly` and `icons` is typed `Signal<readonly KbqIcon[]>` instead of `readonly any[]`, so assignments and untyped member access stop compiling.

**Selectors and assertions built on the `disabled` attribute.** `a[kbq-button][disabled]` never matches now — use `.kbq-disabled` or `[aria-disabled="true"]`. Selectors targeting `<button kbq-button>` still work, but an `aria-disabled` selector on a native button no longer matches. A stylesheet that mentions both `kbq-button` and `[disabled]`, and TypeScript calling `getAttribute('disabled')` / `hasAttribute('disabled')`, are reported.

**`.kbq-progress` is emitted by `kbq-core()` only.** It used to be shipped three times over — by `button.css`, `toggle.css` and `dropdown-item.css` — and is now emitted once, from the prebuilt theme. Importing `core/styles/common/animation` no longer emits the rule or its keyframes; they live in the `kbq-progress()` mixin. If you include the prebuilt theme you already have it; if you pull in per-component CSS without a theme, add `@include animation.kbq-progress();`.

**The `--kbq-button-icon-size-vertical-padding` and `--kbq-button-icon-size-content-padding` custom properties were removed.** Nothing read them even before 20.3.0, so an override was already inert — delete it. Icon buttons use `--kbq-button-icon-size-horizontal-padding` and `--kbq-button-size-content-padding`.

**Custom locale data needs an `a11y` section.** Locale data gained accessible names for the built-in icon-only buttons — the close buttons of modal, popover, sidepanel, content panel and notification center, the calendar navigation, and the inline-edit save and cancel. Data registered through `KBQ_LOCALE_DATA` or `addLocale()` without that section falls back to the ru-RU strings. Add the section, or provide `kbqA11yLocaleConfigurationProvider(...)`.

**Snapshot and DOM-query tests.** Beyond the attribute table above, every `[kbqDropdownTriggerFor]` now renders `aria-expanded`, and the built-in icon-only buttons render a localized `aria-label`. Both are additions rather than removals, but they change rendered markup.

**A dev-mode warning about unnamed icon buttons.** An icon-only `[kbq-button]` with no `aria-label`, `aria-labelledby`, `title` or text now logs a warning in development builds. It is diagnostic only — nothing breaks — but it will point at your own buttons, since an icon carries no accessible name.

### 10. Button supported colors (20.3.0)

A button's `color` accepted any `KbqComponentColors` / `ThemePalette` value, but `kbq-button-theme()` only ever styled the pairs the design system defines:

| `kbqStyle`    | Supported colors              |
| ------------- | ----------------------------- |
| `filled`      | `contrast`, `contrast-fade`   |
| `outline`     | `theme-fade`, `contrast-fade` |
| `transparent` | `theme`, `contrast`           |

Every other combination matched no rule at all, so the button fell through to the user-agent appearance — a grey OS button. The most visible case was `transparent` with no explicit color: the shared default was `contrast-fade`, which is not one of the two colors the transparent block styled.

Each style now carries its own default color, every style gained an unqualified fallback rule, and `color` was narrowed to four values. `transparent` defaults to `contrast` rather than `contrast-fade`: it paints neither fill nor border, so the color only picks the foreground, and the design system has no faded transparent variant.

#### Running the migration

The `button-supported-colors` schematic runs automatically:

```bash
ng update @koobiq/components@20
```

Or manually:

```bash
ng g @koobiq/components:button-supported-colors --project <your project>
```

#### What is fixed automatically

**An unsupported color written as a literal is removed** from `[kbq-button]`, `kbq-button-group`, `[kbqButtonGroupRoot]` and `kbq-split-button` hosts. The `color="error"`, `[color]="'error'"` and `bind-color="'error'"` forms are handled, for the values `error`, `warning`, `success`, `empty`, `primary`, `secondary` and `info`:

```html
<!-- Before -->
<button kbq-button color="error">Delete</button>

<!-- After -->
<button kbq-button>Delete</button>
```

**The appearance does not change.** The button already rendered in its style's default color: an unsupported color matched no theme rule, and the new unqualified rule resolves to exactly the tokens the default color branch resolves to. What is removed is a value that never had an effect — and the type error with it.

#### What you need to fix manually

**A color read from an enum member** — `[color]="colors.Error"` — is reported with a file name and a line number, but not rewritten: the expression is not resolved, so the member name alone does not prove which enum it comes from. Remove the binding to keep the style's default, or pick a supported color. Programmatic assignments such as `button.color = KbqComponentColors.Error` are reported the same way.

**Members typed `KbqComponentColors` / `ThemePalette`.** The wide type no longer assigns to a button `color` binding — narrow it to `KbqButtonColor`:

```ts
type Action = {
    style: KbqButtonStyleInput; // was KbqButtonStyles | string
    color: KbqButtonColor; // was KbqComponentColors
};
```

Check values built inside `Array.from` / `map` callbacks separately: without a return-type annotation an enum member widens to the whole enum and stops assigning even when every value is supported.

```ts
Array.from({ length: 3 }, (_, i): Action => ({ color: KbqComponentColors.ContrastFade, style: '' }));
```

**`kbqOkType`** on `KbqModalComponent` and `ModalOptions` was narrowed from `string` to `KbqButtonColor` — it colors the predefined OK button.

**Stylesheets targeting `.kbq-button_transparent.kbq-contrast-fade`** are reported: the selector no longer matches, because a transparent button is `contrast` now. Point it at `.kbq-contrast` — or drop it, if it was a workaround for the transparent button rendering unstyled.

**Changes with no textual signature.** A transparent button with no explicit color renders in `contrast` instead of `contrast-fade`, and the `color` getter reads back accordingly. A style paired with a color the design system does not define renders in the style default instead of as a native button. `KbqButtonGroupRoot` no longer propagates a color it was never given — each nested button follows the default color of its own style, while a color bound on the group still overrides that default.

### 11. Button-toggle review (20.3.0)

The review of `kbq-button-toggle` gave the control the semantics it always behaved with. A single-selection group is now announced as a `radiogroup` of radio buttons and navigated like one; a `multiple` group is announced as a `group` of toggle buttons.

#### What changed in the markup and on the keyboard

| Surface                                    | Before                     | After                                                                                        |
| ------------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------- |
| `<kbq-button-toggle-group>`                | no role, no way to name it | `role="radiogroup"`, or `role="group"` with `multiple`; an `aria-label` is announced with it |
| `<kbq-button-toggle-group>`, radio group   | no orientation             | `aria-orientation`, following `vertical`                                                     |
| inner `<button>`, single selection         | no role, no state          | `role="radio"` + `aria-checked`                                                              |
| inner `<button>`, `multiple` or standalone | no state                   | `aria-pressed`                                                                               |
| Tab in a single-selection group            | every toggle is a tab stop | one tab stop — the selected toggle, or the first enabled one                                 |
| arrow keys                                 | nothing                    | move focus and selection together; `Home`/`End` jump to the ends                             |

Selection used to be readable from the `.kbq-selected` class alone, which assistive tech does not see. Tests that count tab stops, snapshot the rendered markup or drive the group with arrow keys will notice the difference.

**An icon-only toggle needs a name.** `aria-label` and `aria-labelledby` are now inputs of `KbqButtonToggle` and are forwarded to the inner button. A toggle that projects nothing but icons and has no name logs a dev-mode warning — diagnostic only, but it will point at your own markup, because an icon glyph is `aria-hidden`.

**`[kbq-button]` no longer removes a `role` from a host that is not an anchor.** The host binding used to write `null` over whatever the consumer authored. Anchors are unaffected: one without `href` is still announced as `role="button"`.

#### Running the migration

The `button-toggle-signals-and-aria` schematic runs automatically:

```bash
ng update @koobiq/components@20
```

Or manually:

```bash
ng g @koobiq/components:button-toggle-signals-and-aria --project <your project>
```

#### What is fixed automatically

**Reads of the two inputs that became signals**, on receivers annotated `KbqButtonToggleGroup` and through a `#ref="kbqButtonToggleGroup"` template reference variable (external and inline templates):

- group.vertical → group.vertical(),
- group.multiple → group.multiple()

Receivers are resolved within the file: an explicit type annotation, an import under an alias (`KbqButtonToggleGroup as Group`), and a `viewChild()` / `contentChild()` / `inject()` initialiser are all recognised, and a nested declaration of the same name shadows the group rather than being rewritten as one. What is left over is a receiver whose type lives in another file (`const g = this.group; g.multiple`), which is reported instead. Every replacement is idempotent.

**Icon-only toggles with no accessible name are reported with their line number.** Every `<kbq-button-toggle>` whose content holds an icon and no text at all, and that carries no `aria-label` / `aria-labelledby`, is listed. A `title` does not count: it stays on `<kbq-button-toggle>`, while the accessible name is computed for the inner `<button>` and the attribute never reaches it. The schematic cannot invent the text, but it finds the places the new dev-mode warning will fire in.

#### What you need to fix manually

**`vertical` and `multiple` are signal inputs.** Template bindings are unchanged; reads and imperative writes are not:

A read gains a call; a write has nowhere to go, because an `input()` has no `.set()` — bind it in the template and drive the bound value:

```ts
// Before
group.vertical = true;
if (group.multiple) { ... }

// After
this.isVertical = true; // <kbq-button-toggle-group [vertical]="isVertical">
if (group.multiple()) { ... }
```

**`emitChangeEvent()` takes the toggle the change came from.** It used to read the source off the selection, which is empty right after the last toggle of a multiple-selection group is unchecked — `KbqButtonToggleChange.source` came out `undefined` there, against its own type. The group passes the interacted toggle now; a call of your own has to do the same:

```ts
// Before
group.emitChangeEvent();

// After
group.emitChangeEvent(toggle);
```

**Members that were never meant to be public are gone or narrowed.** `buttonToggleGroup` is `protected` (it was typed non-null while being `null` for a standalone toggle), `icons` is private, and the dead `mcButton` view query was removed. Use `focus()`, which now focuses the inner button instead of the non-focusable host, or the new `focusViaKeyboard()`.

**`type` and `iconType` are read-only getters** rather than writable fields, and `type` follows `multiple` at runtime instead of being frozen in `ngOnInit`.

**Types tightened.** `selected` is `KbqButtonToggle | KbqButtonToggle[] | null`, `buttonToggles()` is `readonly KbqButtonToggle[]`, `onTouched` and `registerOnTouched` take `() => void`, and `KBQ_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR` is a `Provider`. `value` stays `any`.

**`disabled` on a standalone toggle is a real `boolean`.** It used to return the group it could not find — `null` — whenever the toggle was not disabled itself. Falsy either way, but `=== false` and `typeof` checks behaved differently.

**`tabIndex` defaults to `null`** instead of `undefined`, which is what its declared type always said.

**`markForCheck()` on a toggle is no longer called by the library.** A toggle derives `checked` and `disabled` from signals owned by its group and re-renders on its own. The method is kept for back-compatibility.

**The group implements `OnDestroy` and no longer emits after teardown.** A selected toggle schedules its own removal from the selection on a microtask, which used to outlive the group and reach it with a `valueChange` once the whole group had already been destroyed. The group ignores that late sync now. A test asserting the old emission, or code that relied on it to clean up after a destroyed group, needs re-checking.

**Styles.** The keyboard-focus `border-color` is set by the theme alone, from `--kbq-button-toggle-item-states-focused-outline`; the structural stylesheet no longer declares it from the raw `--kbq-states-line-focus-theme` token, so overriding the component token works regardless of import order. The theme also stopped targeting `.kbq-icon-button`, a class `KbqButton` never emitted, in favour of `.kbq-button-icon`.

### 12. Form field review (20.3.0)

The review of `<kbq-form-field>` finished the move of the container and the hint family to signals, gave the icon-only cleaner and password toggle real button semantics, and removed the deprecated `mixinColor`. Most of it stops your code from compiling, but the accessibility part changes rendered markup silently.

**The content queries and their `has*` getters are signals.** `control`, `stepper` and `connectionContainerRef` were already signals and are unchanged; everything else moved in this release:

| Member                                                                                                  | Before             | After                    |
| ------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------ |
| `cleaner`, `passwordToggle`                                                                             | `T \| null`        | `Signal<T \| undefined>` |
| `hint`, `passwordHints`, `prefix`, `suffix`                                                             | `QueryList<T>`     | `Signal<readonly T[]>`   |
| `hasCleaner`, `hasHint`, `hasPasswordHint`, `hasPasswordToggle`, `hasPrefix`, `hasStepper`, `hasSuffix` | getter             | `Signal<boolean>`        |
| `hasError`, `hasLabel`, `hasReactivePasswordHint`                                                       | `protected` getter | `protected` signal       |

**The hint inputs are signals.** `fillTextOff` and `compact` became signal inputs on `KbqHint` and everything that extends it — `KbqError`, `KbqPasswordHint`, `KbqReactivePasswordHint`. `KbqPasswordHint.regex` became a `model()`, so it is read as a call and written through `.set()`. Template bindings (`[fillTextOff]`, `[compact]`, `[regex]`) are unaffected.

**The cleaner and the password toggle are buttons now.** Both were focusable graphics with no role and no accessible name. `<kbq-cleaner>` renders `role="button"` and a localized `aria-label`, and activates on <kbd>Space</kbd> as well as <kbd>Enter</kbd>. The toggle's icon renders `role="button"`, an `aria-label` that follows the state ("Show password" / "Hide password") and `aria-pressed`. Because the cleaner now owns the `aria-label` host binding, an `[attr.aria-label]` written by hand is overwritten — it has to move to the new `[aria-label]` input.

**The form field describes its control.** Hints and the error are linked to the control through `aria-describedby`, `kbq-error` renders `role="alert"`, and `KbqInput` / `KbqInputPassword` / `KbqSelect` render `aria-invalid` (`KbqSelect` also renders `aria-required`). Nothing here breaks a build — it changes rendered markup.

**`mixinColor` was removed.** It was deprecated, unused inside the library, and logged a dev-mode warning on every instance. `KbqColorDirective` replaces it and exposes the same `color` input.

#### Running the migration

The `form-field-signals` schematic runs automatically:

```bash
ng update @koobiq/components@20
```

Or manually:

```bash
ng g @koobiq/components:form-field-signals --project <your project>
```

#### What is fixed automatically

**Reads of the migrated members become calls**, both in TypeScript and through a template reference variable:

```ts
// Before
if (formField.hasCleaner && formField.hint.length && hint.fillTextOff) {
}

// After
if (formField.hasCleaner() && formField.hint().length && hint.fillTextOff()) {
}
```

```html
<!-- Before -->
<kbq-form-field #field="kbqFormField">…</kbq-form-field>
<span>{{ field.hasHint }}</span>

<!-- After -->
<span>{{ field.hasHint() }}</span>
```

A receiver is matched by its explicit type annotation (`KbqFormField`, `KbqHint`, `KbqError`, `KbqPasswordHint`, `KbqReactivePasswordHint`) — parameters, class fields including content queries, constructor parameter-properties and typed locals.

**Writes to `KbqPasswordHint.regex` become `.set()`:** `hint.regex = /x/` → `hint.regex.set(/x/)`.

**The cleaner's accessible name moves to the input:** `<kbq-cleaner [attr.aria-label]="label" />` → `<kbq-cleaner [aria-label]="label" />`.

**The misspelled stylesheet is renamed:** `_fiedset-theme.scss` became `_fieldset-theme.scss`, so `@use '…/form-field/fiedset-theme'` is rewritten.

#### What you need to fix manually

**The `QueryList` API is gone.** `hint`, `passwordHints`, `prefix` and `suffix` are signals over a readonly array, so `.changes`, `.first`, `.last`, `.toArray()` and `.get(i)` no longer exist. React to the queries with `computed()` / `effect()` instead of subscribing to `.changes`, and index the array directly. Every occurrence is reported with its file.

**`cleaner` and `passwordToggle` return `undefined`, not `null`.** A strict `=== null` comparison silently stops matching — use a truthiness check or `== null`.

**Assignments to `fillTextOff` and `compact` no longer compile.** They are read-only signal inputs; drive them with a template binding.

**Assignments to the `KbqFormField` content queries no longer compile either** — `cleaner`, `passwordToggle`, `hint`, `passwordHints`, `prefix` and `suffix` are read-only signals. `cleaner` was writable only because of an internal workaround, which is gone; the rest were a `QueryList`, which test code used to reassign to fake the projected content. Project the content into the form field instead.

**`KbqPasswordHint.icon` is `protected`.** Derive the state from `checked` / `hasError` instead of reading the icon name.

**`KBQ_FORM_FIELD_REF.control` is typed.** It used to be `any`, so `formField.control.placeholder` compiled and was silently `undefined` — the library had exactly that bug. Call the signal first: `formField.control().placeholder`.

**Custom locale data needs three more `a11y` keys** — `clear`, `showPassword` and `hidePassword` — for the accessible names of the cleaner and the password toggle. A locale object literal without them stops type-checking; data registered through `KBQ_LOCALE_DATA` falls back to the ru-RU strings.

**The `KbqPasswordHint` rules engine is deprecated.** `PasswordRules`, `regExpPasswordValidator` and `hasPasswordStrengthError` will be removed in the next major release — migrate to `KbqReactivePasswordHint`, which derives its state from the form control validators. `regExpPasswordValidator` is also typed `Partial<Record<PasswordRules, RegExp>>` now, so indexing it yields `RegExp | undefined`; it never had entries for `Length` and `Custom`.

**Three fixed bugs change behaviour.** A failing password strength check used to call `setErrors({ passwordStrength: true })`, wiping every other error on the control — it now merges. A `PasswordRules.Length` hint compared against `undefined` bounds, so a valid-length password was always reported as failing; the bounds now default to `0` and `Infinity`, and the guard only throws when neither `min` nor `max` is set. And the hint now checks the control's current value instead of waiting for the control to be focused with a value that differs from the last one it saw — a rule was left unchecked for a control that was already filled when the hint appeared, which is the usual case for an edit form.

**Snapshot and DOM-query tests.** Beyond the ARIA attributes above, the generated id of `KbqPasswordHint` changed prefix from `kbq-hint-N` to `kbq-password-hint-N` so that it stops colliding with `KbqHint`. Nothing should depend on a generated id, but selectors keyed on it will stop matching.

**Stylesheets that fought `!important`.** `.kbq-form-field_no-borders` and `.kbq-form-field_in-overlay` used `!important` to beat the state theme; they now override the `--kbq-form-field-*` tokens instead. The computed result is the same, but an override written specifically to outrank the old `!important` can be simplified.

### 13. Theme service review (20.3.0)

`ThemeService` moved to signals, gained a built-in `auto` mode that follows the OS color scheme, and now persists the selected mode to `localStorage` out of the box. `ThemeService` keeps working under its old name and the deprecated `KbqTheme.selected` field is still kept in sync — nothing is forced to change, but new code should move to `KbqThemeService`.

**It's `KbqThemeService` now.** `ThemeService` is exported as a `@deprecated` alias of `KbqThemeService` and will be removed in a future major version. There is no `ng update` schematic for the rename — swap the import when convenient.

**`current` (a `BehaviorSubject<KbqTheme | null>`) is deprecated in favor of a few signals.** It still exists and stays in sync, so `current.value` and `current.pipe(...)` keep working. `selection()` is the raw selected value (`'auto'`, or a specific theme's `name`); `auto()` is whether that's currently `'auto'`; `currentTheme()` is the resolved `KbqTheme` object, equivalent to `current.value`; `colorScheme()` is the strictly `'light' | 'dark'` polarity of `currentTheme()` — reach for this, not a theme's `name`, when you just need to know which of the two you're in (e.g. driving CSS `light-dark()`).

```ts
// Before
themeService.current.pipe(map((theme) => theme?.className)).subscribe(...);

// After
themeService.currentTheme(); // read directly, or wrap with toObservable() if you need a stream
```

**`setTheme(index | theme)` is deprecated in favor of `selectTheme(name)`.** Selecting by array index was fragile once `auto` stopped being a regular registered theme. `selectTheme(name)` selects any registered theme directly, including the built-in `'light'`/`'dark'`; `setAuto()` and `toggle()` are the two convenience methods kept for the common cases actually used in this library — there is no `setLight()`/`setDark()`.

**`auto` mode is handled inside the service.** If you were reading `window.matchMedia('(prefers-color-scheme: …)')` yourself and rewriting a theme's `className` to fake a "system" option (as the docs app used to), call `themeService.setAuto()` instead and read `currentTheme()`/`colorScheme()` — the OS listener and the DOM update are both handled internally now.

**Persistence is on by default.** The selection is now saved to `localStorage` (key `kbq-theme-mode` by default) and restored on init through the `KBQ_THEME_STORE` token, the same swappable-store pattern as `KBQ_ACCORDION_STATE_STORE`. If you rolled your own persistence under a different key (as the docs app did, under `docs_theme`), configure `kbqThemeProvider({ storageKey: '…' })` instead of dropping it — existing users keep their saved preference, **provided the old value was already a mode/theme name**. If your old storage held something else (an index, a boolean, …), write a small `KbqThemeStore` wrapping `KbqThemeLocalStorageStore` that translates `getSelection()`'s return value before handing it back — see `DocsThemeStore` in the docs app's own `apps/docs/src/app/services/theme-store.ts` for the pattern. `KbqThemeCookieStore` is also available for apps that render with live Angular SSR and want the initial server-rendered HTML to already reflect the visitor's saved selection — read its doc comment first, since it doesn't help a build-time prerendered/static site.

**Custom themes and DI-based setup.** `setThemes()` still accepts any array of `{ name, className, colorScheme? }` objects — `colorScheme` (`'light' | 'dark'`) is optional: when set, it's each theme's own polarity, independent of its `name`, and is what `colorScheme()` (and `toggle()`) key off; when omitted, `colorScheme()` falls back to the OS preference for that theme. New: `kbqThemeProvider({ themes, mode, storageKey, autoLight, autoDark })` configures the service through DI instead of calling `setThemes()`/`setTheme()` imperatively. The active theme is always applied as a CSS class on `<body>` — the design tokens' `.kbq-light`/`.kbq-dark` styles depend on it, so there's no attribute-based alternative. `auto` resolves to the theme named `autoLight`/`autoDark` (`'light'`/`'dark'` by default) — set these if your custom theme set doesn't use those names, otherwise `auto` won't match any registered theme.

### 14. Explicit tag content slots (20.3.0)

Until 20.3.0 every directly projected element with `kbq-icon` was placed before the tag text, regardless of its position in the template. This implicit rule made icon placement depend on the component's projection selector and made the markup easy to break. Tag content now has explicit `kbqTagPrefix` and `kbqTagSuffix` slots:

```html
<kbq-tag>
    <i kbqTagPrefix kbq-icon="kbq-circle-info_16"></i>
    Tag
    <i kbqTagSuffix kbq-icon="kbq-chevron-down-s_16"></i>
</kbq-tag>
```

`kbqTagRemove` and `kbqTagEditSubmit` are suffix controls already: `KbqTagSuffix` is attached to them through `hostDirectives`. Do not add `kbqTagSuffix` to the same element explicitly, because that applies the directive twice.

#### Running the migration

The `tag-slots` schematic runs automatically:

```bash
ng update @koobiq/components@20
```

Or manually — for example, if you have already upgraded to 20.3.0:

```bash
ng g @koobiq/components:tag-slots --project <your project>
```

To preview the changes without writing them, use `--fix=false`:

```bash
ng g @koobiq/components:tag-slots --project <your project> --fix=false
```

#### What is fixed automatically

The schematic adds `kbqTagPrefix` to every legacy, directly projected `kbq-icon` that is not already assigned to a slot and is not a remove or edit-submit control:

```html
<!-- Before: the info icon rendered before the text despite its source position. -->
<kbq-tag>
    Tag
    <i kbq-icon="kbq-circle-info_16"></i>
    <i kbqTagRemove kbq-icon="kbq-xmark-s_16"></i>
</kbq-tag>

<!-- After: rendering is preserved by an explicit slot. -->
<kbq-tag>
    Tag
    <i kbqTagPrefix kbq-icon="kbq-circle-info_16"></i>
    <i kbqTagRemove kbq-icon="kbq-xmark-s_16"></i>
</kbq-tag>
```

Source order is not used to infer a suffix: under the old projection rule all such icons were prefixes. Existing `kbqTagPrefix`, `kbqTagSuffix`, `kbqTagRemove` and `kbqTagEditSubmit` attributes are left unchanged, so the migration is idempotent.

#### What you need to fix manually

**Intentional trailing content.** Add `kbqTagSuffix` yourself when an icon or another element should follow the label. The schematic cannot infer a new visual intent from markup whose old rendering always placed `kbq-icon` before the label.

**Content outside the legacy icon selector.** Elements with only `kbq-icon-button` or `kbq-icon-item`, nested consumer wrappers and nodes with `ngProjectAs` are left unchanged because they were not directly matched by the old `kbq-icon` slot. Review them only if you want to move them to one of the new slots.

**Standalone imports.** `KbqTagsModule` exports both slot directives. If a standalone component imports `KbqTag` directly instead of the module, also import `KbqTagPrefix` and/or `KbqTagSuffix` when using them; otherwise their host classes and slot spacing are not applied.

<!-- cspell:ignore addClassModificatorForIcons -->

**Deprecated imperative placement and styles.** Replace calls to `addClassModificatorForIcons()` with explicit slot directives, and migrate custom selectors from `.kbq-icon_left` to `.kbq-tag-prefix`. The method and the old selector are deprecated and will be removed in the next major version.

### 15. Scrollbar overlayscrollbars implementation deprecation (20.3.0)

Until 20.3.0, `@koobiq/components/scrollbar` wrapped the third-party `overlayscrollbars` library: the `KbqScrollbar` component (`kbq-scrollbar` / `[kbq-scrollbar]`) and the low-level `KbqScrollbarDirective` (`[kbqScrollbar]`), with `options`, `events`, `defer` inputs and raw access to `scrollbarInstance`.

As of 20.3.0, `@koobiq/components/scrollbar` provides a new dependency-free `KbqScrollbar` component with the `<kbq-scrollbar>` selector and a different public API. The previous implementation has not gone away — it moved, unchanged, to `@koobiq/components/scrollbar/deprecated` and will be removed in a future major version.

#### Running the migration

The `scrollbar-deprecated-path` schematic runs automatically:

```bash
ng update @koobiq/components@20
```

Or manually:

```bash
ng g @koobiq/components:scrollbar-deprecated-path --project <your project>
```

#### What is fixed automatically

**The `@koobiq/components/scrollbar` import path is rewritten to `@koobiq/components/scrollbar/deprecated`** — in every `.ts` file, in both single- and double-quoted specifiers. The implementation itself and its public API (`options` / `events` / `defer` / `scrollbarInstance`, the `kbq-scrollbar` / `[kbq-scrollbar]` / `[kbqScrollbar]` selectors) are unchanged — only where you import them from changes.

```ts
// Before
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';

// After
import { KbqScrollbarModule } from '@koobiq/components/scrollbar/deprecated';
```

#### What you need to fix manually

**Moving to the new implementation** is a separate, manual migration, not just an import path change: the new component uses the `<kbq-scrollbar>` selector and does not support the `[kbq-scrollbar]` or `[kbqScrollbar]` attribute selectors. Its public API differs from the previous implementation — see the [Scrollbar component documentation](/en/components/scrollbar) for details.

**Do not import both the old and the new implementation into the same standalone component.** Both use the `kbq-scrollbar` element selector, so Angular cannot choose a component unambiguously. During a gradual manual migration, keep old and new usage in separate components.

### 16. Locale layer typing (20.3.0)

The locale layer is fully typed now, and every localized component takes its strings through one shared
mechanism. Nothing was removed and no signature was narrowed in a way that rejects code which used to
compile — this section is here so you know what became possible, and which two narrowed types could surface a
latent mistake in your own code.

**`getParams()` resolves the section type.** A known section name returns its configuration type instead of
`any`; a dynamically-built string still returns `any`, so existing call sites keep working.

```ts
const { selectAll } = localeService.getParams('select'); // KbqSelectLocaleConfiguration
localeService.getParams('selection'); // not a section - now a compile error
```

**Custom locale data may be partial.** `addLocale()` and `KBQ_LOCALE_DATA` accept any subset of
`KbqLocaleData` and complete it from the shipped locale of the same id, or from `KBQ_DEFAULT_LOCALE_ID` for
a new id. You no longer have to restate a whole locale to change one string, and a section you leave out
can no longer surface as `undefined` at runtime. The two earlier notes about custom locale data needing an
`a11y` section no longer apply — a missing section is filled in for you.

**Signals alongside the observable.** `localeId()`, `data()` and `items()` join `changes`, and
`params(section)` returns a `Signal` of one section. `changes` keeps working; `id` and `current` are
deprecated in favour of `localeId()` and `data()`. Prefer the signals: a signal read from a template
registers on the reading view, so a runtime `setLocale()` reaches `OnPush` children that a subscription in
the parent never marked dirty.

**Configuration providers accept a partial, and now apply on top of the active locale.**
`kbqA11yLocaleConfigurationProvider`, `kbqCodeBlockLocaleConfigurationProvider`,
`kbqClampedTextLocaleConfigurationProvider`, `kbqActionsPanelLocaleConfigurationProvider` and
`kbqTimeRangeLocaleConfigurationProvider` now take only the keys you want to change. Previously the locale
service took precedence over them, so an application that provided `KBQ_LOCALE_SERVICE` saw these providers
ignored entirely; the keys you pass are now merged over the active locale and stay pinned across a runtime
`setLocale()`, while the keys you leave out keep following it. Passing a full object still works and pins
the whole section.

**Component configuration tokens now supply defaults, not overrides.** `KBQ_VERTICAL_NAVBAR_CONFIGURATION`,
`KBQ_NOTIFICATION_CENTER_CONFIGURATION`, `KBQ_APP_SWITCHER_CONFIGURATION`,
`KBQ_SEARCH_EXPANDABLE_CONFIGURATION`, `KBQ_DATEPICKER_CONFIGURATION` and `KBQ_FILTER_BAR_CONFIGURATION` used
to beat the locale service outright. Every one of those components now reads the shared
`kbqInjectLocaleConfiguration` helper, where the token carries the defaults and the active locale wins, so
`{ provide: KBQ_<X>_CONFIGURATION, useValue: … }` is silently ignored in any application that provides
`KBQ_LOCALE_SERVICE`. Replace it with the matching `kbq<X>LocaleConfigurationProvider(…)`, which registers a
real override — `ng update` rewrites it for you. The same conversion dropped the `externalConfiguration`
member from those components and made `configuration` read-only, and gave `kbq-select`, `kbq-tree-select`,
`kbq-tree-selection`, `kbq-timepicker`, `kbq-timezone-select` and the number input the token-and-provider
pair they never had. One behaviour fix rides along: an explicit `[hiddenItemsText]` binding on `kbq-select`
and `kbq-tree-select` is no longer wiped by the next `setLocale()`.

**Type names were normalized to `Kbq<X>LocaleConfiguration`.** The old names — `KbqAppSwitcherConfiguration`,
`KbqClampedTextLocaleConfig`, `KbqTimeRangeLocaleConfig`, `KbqNumberInputLocaleConfig`,
`KbqNumberRoundingLocaleConfig`, `KbqFileUploadLocaleConfig`, `KbqBaseFileUploadLocaleConfig` and
`KbqMultipleFileUploadLocaleConfig` — remain as deprecated aliases. Likewise
`kbqInjectKbqClampedLocaleConfiguration` is now `kbqInjectClampedTextLocaleConfiguration`, with the old name
kept.

**Two narrowed types worth checking.** `KBQ_DATEPICKER_CONFIGURATION`, `KBQ_VERTICAL_NAVBAR_CONFIGURATION`,
`KBQ_NOTIFICATION_CENTER_CONFIGURATION` and `KBQ_SEARCH_EXPANDABLE_CONFIGURATION` used to be
`InjectionToken<unknown>` and now carry their real type, so a value you provide for one of them is
type-checked for the first time. And `defaultUnitSystem` on the exported `*FormattersData` constants is now
the literal `'SI'` rather than `string`; only code that assigns to it is affected.

#### Running the migration

The `locale-configuration-providers` schematic rewrites the configuration providers automatically:

```bash
ng update @koobiq/components@20
```

Or manually:

```bash
ng g @koobiq/components:locale-configuration-providers --project <your project>
```

Run it even if you upgrade by hand: a `{ provide: KBQ_<X>_CONFIGURATION, useValue: … }` left behind is
silently ignored at runtime rather than reported as a compile error. The rest of this section — the renamed
types and the two narrowed ones — surfaces as compile errors whose messages already name the fix.

### 17. List and tree multiple selection (20.3.0)

Until 20.3.0 `multiple` on `kbq-list-selection` and `kbq-tree-selection` was a static host attribute read
once in the constructor. It could not be bound, the mode was frozen for the lifetime of the component, and
every value other than `checkbox` and `keyboard` fell through to multiple selection with checkboxes — so
`multiple="false"` meant _multiple_.

It is now a real input with a closed set of values, and the mode can be changed at any time:

| value                                                  | mode             |
| ------------------------------------------------------ | ---------------- |
| `multiple="checkbox"`                                  | checkbox         |
| `multiple="keyboard"`                                  | keyboard         |
| `multiple`, `multiple="true"`, `[multiple]="true"`     | checkbox         |
| no attribute, `multiple="false"`, `[multiple]="false"` | single selection |

Single selection is the default, so the way to ask for it is to leave the attribute off entirely. Anything
else — `multiple="single"` included — falls back to single selection and is reported in the console in dev
mode, where it used to enable multiple selection.

#### Running the migration

The `list-tree-multiple-input` schematic runs automatically:

```bash
ng update @koobiq/components@20
```

Or manually:

```bash
ng g @koobiq/components:list-tree-multiple-input --project <your project>
```

#### What is fixed automatically

**`multiple="false"` and `multiple="single"`** → the attribute is **removed**. This is the one rewrite in
this section that changes behaviour: both spellings used to enable multiple selection with checkboxes, and
both now mean single selection, which is what an absent attribute already says. The migration assumes the
author meant what they wrote. Each removal is logged as a behaviour change — if you actually wanted multiple
selection, put `multiple="checkbox"` back.

**Every other unrecognized value** (`multiple="multiple"`, `multiple="yes"`, `multiple="1"`, …) →
`multiple="checkbox"`, which preserves the behaviour, since any such value used to enable multiple
selection. Both external `.html` and inline templates are covered; a dynamic `[multiple]="expr"` is skipped
with a warning.

#### What you need to fix manually

**`multipleMode` is now an accessor** rather than a plain field. Assigning to it rebuilds the
`SelectionModel` instead of only relabelling the mode — CDK freezes multiplicity at construction, so the
model has to be replaced. On a `kbq-tree-selection` rendered inside a `kbq-tree-select` the assignment
throws `getKbqTreeSelectionOwnedMultipleError`: the select shares its model with the tree and subscribes to
that instance, so it owns how many nodes may be selected. Bind `multiple` on the select instead. Switching
only between `checkbox` and `keyboard` is still allowed there.

**A mode change replaces the `SelectionModel` instance**, so any code holding
`selectionModel.changed.subscribe(...)` is left on the discarded one. Subscribe to the
`(selectionChange)` output of the component, which survives the swap.

**On `kbq-tree-selection` the reported value follows the mode** — a bare value in single selection, an array
in multiple selection. That was already true, but the mode could not change before; now it can, so the shape
the form control holds changes with it. `kbq-list-selection` always reports an array and is unaffected.

**Narrowing keeps the first selected item in render order** and drops the rest, emitting `selectionChange`
for each option it deselected and reporting the shortened value to the form control.

### 18. Component review (20.3.0)

Ten components went through a full review in 20.3.0: notification-center, popover, search-expandable, select, split-button, title, toast, tooltip, tree and tree-select. Each review closed the members that were never part of the component's contract, moved inputs to signals where that was the point of it, and fixed the behavior it uncovered along the way. Only the changes that reach a consumer are listed here.

Every schematic named below runs automatically:

```bash
ng update @koobiq/components@20
```

Most of them report rather than rewrite: what replaces a removed member or a signal input is a decision — a template binding, a different member, or nothing at all — so they log the call sites they find and leave the code alone. Each subsection below names the schematic that covers it and says what, if anything, it changes for you. Run one on its own to get its report again:

```bash
ng g @koobiq/components:<schematic-name> --project <your project>
```

#### Title

`kbq-title` measures its host and opens a tooltip when the text is truncated. The review kept that surface — the `kbq-title` input and the tooltip it opens — and closed the measurement machinery behind it.

`resizeStream` is the one removal that changes how the directive works rather than only what it exposes. It was fed by a `(window:resize)` host listener, so one directive instance meant one listener, and `kbq-title` sits on every dropdown item, list option and tree option. The directive now injects the CDK `SharedResizeObserver`, which adds no per-instance listener and, unlike `window:resize`, also reacts to container-only resizes such as a splitter drag or a sidebar collapse.

| Pattern                                                                                                           | Manual migration                                                             |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `.resizeStream`                                                                                                   | Drop the call — the shared `ResizeObserver` re-measures on its own           |
| `.hasOnlyText`                                                                                                    | Now `private`; read the rendered DOM directly if it is genuinely needed      |
| `.child` / `.parent` / `.isHorizontalOverflown` / `.isVerticalOverflown` / `.handleElementEnter` / `.hideTooltip` | Now `protected`; use the `kbq-title` input — these are measurement internals |
| `super.ngOnDestroy()` in a subclass                                                                               | Remove it — the base tears down through `takeUntilDestroyed`                 |

The tooltip now also opens on keyboard focus, which the directive always documented but never did; a host that compensated for its absence can drop the workaround. `titleContent` is typed `TemplateRef<unknown>` instead of `TemplateRef<any>` — a `TemplateRef<Ctx>` still assigns to it, but a value read back out needs a cast.

Reported by `title-encapsulation`.

### After the migration

After fully moving to the new component and removing imports from `@koobiq/components/scrollbar/deprecated`, the `overlayscrollbars` dependency is no longer needed and can be removed:

```bash
npm uninstall overlayscrollbars
```

The migration is regex-based and does not rewrite aliased imports, local variables, or re-exports — **review the diff before committing**, rebuild the project and run your tests. The full list of breaking changes is on the [Angular 20 breaking changes](https://github.com/koobiq/angular-components/blob/main/docs/guides/angular-20-breaking-changes.en.md) page.
