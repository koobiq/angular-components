# OpenSpec baseline findings

<!-- cspell:ignore webkitdirectory -->

Every `## Findings` section of the 63 OpenSpec baseline changes (`document-<component>-baseline`), collected in one place. The baselines describe `main` at `c9c196a9b` (2026-10-21). Nothing here has been fixed.

- **Docs and JSDoc that disagree with the code** — the docs pages, examples or JSDoc promise something the code does not do, or the other way round.
- **Suspected defects** — found by reading the code. None was reproduced; check each one before acting on it.
- **Tests whose name and body disagree, or that cannot fail** — tests that give false confidence.
- **Behaviour without a test** — what the baseline spec states from the source alone.

Each section is copied verbatim from the change's `design.md`, which stays the source: `openspec/changes/document-<component>-baseline/design.md`, or `openspec/changes/archive/<date>-document-<component>-baseline/design.md` once archived. Counts are top-level list items.

## Summary

| Component                                   | Docs and JSDoc | Suspected defects | Tests | Without a test |
| ------------------------------------------- | -------------- | ----------------- | ----- | -------------- |
| [accordion](#accordion)                     | 9              | 8                 | 10    | 20             |
| [actions-panel](#actions-panel)             | 8              | 8                 | 5     | 20             |
| [alert](#alert)                             | 5              | 5                 | 4     | 16             |
| [app-switcher](#app-switcher)               | 8              | 8                 | 10    | 19             |
| [autocomplete](#autocomplete)               | 9              | 8                 | 7     | 8              |
| [badge](#badge)                             | 5              | 6                 | 5     | 10             |
| [breadcrumbs](#breadcrumbs)                 | 11             | 5                 | 6     | 16             |
| [button](#button)                           | 8              | 6                 | 7     | 16             |
| [button-toggle](#button-toggle)             | 9              | 7                 | 8     | 18             |
| [checkbox](#checkbox)                       | 7              | 7                 | 9     | 25             |
| [clamped-text](#clamped-text)               | 7              | 5                 | 3     | 16             |
| [code-block](#code-block)                   | 9              | 11                | 11    | 18             |
| [content-panel](#content-panel)             | 9              | 8                 | 5     | 13             |
| [datepicker](#datepicker)                   | 9              | 11                | 9     | 21             |
| [divider](#divider)                         | 4              | 3                 | 2     | 7              |
| [dl](#dl)                                   | 7              | 8                 | 7     | 12             |
| [dropdown](#dropdown)                       | 9              | 7                 | 12    | 20             |
| [dynamic-translation](#dynamic-translation) | 6              | 9                 | 4     | 10             |
| [ellipsis-center](#ellipsis-center)         | 6              | 5                 | 4     | 11             |
| [empty-state](#empty-state)                 | 7              | 3                 | 4     | 8              |
| [file-upload](#file-upload)                 | 10             | 6                 | 9     | 31             |
| [filter-bar](#filter-bar)                   | 10             | 7                 | 7     | 22             |
| [flag](#flag)                               | 5              | 4                 | 2     | 11             |
| [form-field](#form-field)                   | 7              | 7                 | 4     | 13             |
| [icon](#icon)                               | 8              | 7                 | 4     | 11             |
| [inline-edit](#inline-edit)                 | 13             | 5                 | 8     | 21             |
| [input](#input)                             | 10             | 10                | 12    | 22             |
| [link](#link)                               | 8              | 4                 | 3     | 10             |
| [list](#list)                               | 8              | 8                 | 10    | 18             |
| [loader-overlay](#loader-overlay)           | 6              | 5                 | 4     | 14             |
| [markdown](#markdown)                       | 6              | 9                 | 3     | 9              |
| [modal](#modal)                             | 12             | 11                | 7     | 17             |
| [navbar](#navbar)                           | 8              | 15                | 6     | 23             |
| [notification-center](#notification-center) | 11             | 10                | 6     | 23             |
| [overflow-items](#overflow-items)           | 7              | 8                 | 9     | 10             |
| [popover](#popover)                         | 11             | 6                 | 5     | 24             |
| [progress-bar](#progress-bar)               | 5              | 4                 | 4     | 11             |
| [progress-spinner](#progress-spinner)       | 4              | 3                 | 3     | 8              |
| [radio](#radio)                             | 8              | 5                 | 7     | 19             |
| [resizer](#resizer)                         | 6              | 6                 | 4     | 12             |
| [scrollbar](#scrollbar)                     | 8              | 9                 | 4     | 14             |
| [search-expandable](#search-expandable)     | 9              | 9                 | 6     | 17             |
| [select](#select)                           | 12             | 9                 | 9     | 7              |
| [sidebar](#sidebar)                         | 9              | 7                 | 5     | 16             |
| [sidepanel](#sidepanel)                     | 8              | 8                 | 5     | 21             |
| [skeleton](#skeleton)                       | 5              | 4                 | 5     | 10             |
| [split-button](#split-button)               | 7              | 7                 | 5     | 11             |
| [splitter](#splitter)                       | 8              | 5                 | 3     | 25             |
| [table](#table)                             | 6              | 4                 | 2     | 14             |
| [tabs](#tabs)                               | 7              | 7                 | 7     | 16             |
| [tags](#tags)                               | 14             | 9                 | 3     | 10             |
| [textarea](#textarea)                       | 7              | 7                 | 8     | 13             |
| [time-range](#time-range)                   | 10             | 10                | 6     | 18             |
| [timepicker](#timepicker)                   | 14             | 8                 | 9     | 17             |
| [timezone](#timezone)                       | 10             | 7                 | 7     | 12             |
| [title](#title)                             | 5              | 6                 | 4     | 8              |
| [toast](#toast)                             | 8              | 9                 | 6     | 18             |
| [toggle](#toggle)                           | 6              | 4                 | 9     | 22             |
| [tooltip](#tooltip)                         | 10             | 10                | 5     | 12             |
| [top-bar](#top-bar)                         | 6              | 4                 | 4     | 12             |
| [tree](#tree)                               | 16             | 10                | 10    | 23             |
| [tree-select](#tree-select)                 | 11             | 13                | 13    | 22             |
| [username](#username)                       | 6              | 5                 | 7     | 15             |
| **Total**                                   | 517            | 449               | 391   | 986            |

## accordion

Change: `document-accordion-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. "Inactive section" says a disabled section cannot be expanded. Only user toggles and the item and accordion methods are blocked: a bound `value`, `defaultValue`, a saved state, `[expanded]` and the `expanded` setter still expand a disabled item, and in single mode an expanded disabled item collapses when another one opens. The e2e "states" screenshot shows a disabled item expanded by `defaultValue`.
2. The JSDoc of `orientation` calls it "the layout orientation". The shipped styles have no horizontal layout: `horizontal` changes `data-orientation` and the arrow keys only. Neither docs page mentions `orientation`.
3. The JSDoc of `value` says it falls back to `defaultValue` while unbound. It does not say, and neither docs page does, that `value()` therefore never follows the user's toggles unless `[(value)]` writes them back; with a one-way `[value]` the signal and the expanded items drift apart.
4. The overview page does not document `value`, `defaultValue`, `valueChange`, `collapsible`, `level`, `orientation`, `openAll()` / `closeAll()`, the item's `expanded`, `opened` and `closed`, or the arrow, Home and End keys. "Section expansion" does not name `type="multiple"`.
5. `expandedChange` is marked `@docs-private`, so the API tab hides the output behind `[(expanded)]`.
6. Eight of the ten docs examples, the overview among them, put the trigger straight into the item without `kbq-accordion-header`. Their sections have no heading semantics, and `level` has nothing to apply to.
7. `examples.accordion.{en,ru}.mdx` are "Documentation in progress" placeholders; `structure.ts` sets `hasExamples: false`, so they are not routed.
8. The Russian overview has its Recommendations heading one level deeper than the English one.
9. The "accordion-sections" example misspells the word "Opening" in the label above its toggle group.

**Suspected defects (from reading the code, not reproduced)**

1. `collapsible="false"` is checked only on click. Enter or Space on the focused trigger of an expanded item collapses it, and `toggle()`, `close()` and `closeAll()` ignore the input too.
2. In single mode, switching from one expanded item to another emits `valueChange` twice. When the previously expanded item comes first in the document, the first emission carries its value, not the new one.
3. `orientation` and the `Directionality` are read once, when the content initializes. Changing `orientation` later updates `data-orientation` but not the arrow keys, and a switch to right-to-left at runtime is not followed.
4. The trigger's element form `<kbq-accordion-trigger>`, or any host that is not a native `<button>`, gets `role="button"` but no `tabindex`, so keyboard users cannot reach it. Its `flex: 1` layout is also scoped to `button.kbq-accordion-trigger`.
5. The trigger's and the content's `id` are host bindings, so an `id` the consumer writes on either element is replaced.
6. An item without content keeps an `aria-controls` that points at a missing id, and a content without a trigger keeps a dangling `aria-labelledby`.
7. `collapsible` has no boolean transform, unlike `disabled`. A static `collapsible="false"` is a template type error under strict templates and a truthy string otherwise.
8. A disabled trigger stays in the Tab order, while the arrow keys skip it. The WAI-ARIA pattern allows either choice, but mixing them makes the same header reachable one way and not the other.

**Tests whose name and body disagree, or that cannot fail**

- "hidden attribute should be "true" when closed" and "… "false" when open" assert the presence of an empty `hidden` attribute; it never holds `true` or `false`.
- "has no axe violations with header actions in RTL" provides a right-to-left `Directionality`, but nothing sets `dir="rtl"` in the DOM, so axe checks the same markup as the left-to-right test.
- "Right/Left arrows are mirrored in RTL" presses only Right.
- "ENTER should toggle active item", "SPACE should toggle active item" and "ENTER on an active disabled item should not toggle it" call `setActiveItem()` first, so they do not show that a key on a trigger that is not yet active toggles its own item.
- "should emit valueChange with the current value when item state changes" uses an accordion with one item, so it cannot see the double emission in suspected defect 2.
- "should expand and collapse with motion by default" and "… without motion when animations are disabled" check only the `kbq-animations-disabled` class, not motion.
- "disabled trigger should not have the HTML disabled attribute" and "should have aria-disabled="true" when item is disabled" repeat assertions already made in "should set aria-disabled on trigger when item is disabled".
- "the accordion host should not handle keys itself" dispatches to a host with no key listener; it fails only if one is added back.
- "stops focus monitoring and completes openCloseAllActions on destroy" accepts a `stopMonitoring` call for any element.
- "create then immediately destroy does not throw" runs change detection before destroying.

**Left out of the spec.** Whether `valueChange` fires for items expanded on the first render (by `defaultValue`, a saved state or `expanded`) depends on effect timing, and no test covers it.

**Behaviour without a test.** The spec states these from the source:

- a trigger placed directly in the item, without a header, toggling it;
- a click moving focus to the trigger;
- `collapsible="false"` in single mode still collapsing the expanded item when another opens;
- `defaultValue`: only its first value in single mode, empty strings ignored, later changes ignored;
- the user toggling items under a one-way `[value]`, and `value()` not following those toggles;
- the `valueChange` payload in multiple mode and its once-per-changed-item count;
- a change of an item's `[expanded]` binding after the first render;
- `open()`, `toggle()` and `close()` doing nothing on a disabled item, and the `expanded` setter working on one;
- `openAll()` and `closeAll()` skipping disabled items, and `closeAll()` in single mode;
- `close()`, `closeAll()` and `clearSavedState()` called from an effect;
- Space on a disabled item, and clicks on the items of a disabled accordion;
- a disabled expanded item collapsing in single mode when another item opens (the e2e screenshot covers only the `defaultValue` case);
- arrow keys skipping disabled items, not wrapping, ignoring Left and Right in vertical orientation and ignoring modified keys; Home and End skipping disabled items;
- Left in right-to-left layout, and Up and Down in horizontal orientation;
- the focus border not showing for header actions or content;
- the chevron's `aria-hidden`;
- each nested accordion persisting only its own items;
- the 300 ms duration of the motion;
- the absence of motion on the first render;
- `hasSavedState`.

## actions-panel

Change: `document-actions-panel-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `disableClose` says "Whether the user can use ESC or click on close button to close the actions panel". `true` means the opposite, and it removes the close button instead of disabling it.
2. The JSDoc of `keydownEvents` says it emits keydown events "targeted on the overlay". It emits every keydown that reaches `body` while the panel's overlay is the most recently attached overlay that listens for keys, wherever the target is.
3. The keyboard section of the docs says Escape closes the panel. It does so only when the keydown starts inside the panel, and the panel never takes focus when it opens, so Escape pressed in the table it acts on does nothing.
4. The `@default` tags of `scrollStrategy`, `direction` and `closeOnNavigation` hold only for the built-in default configuration. A value given to `kbqActionsPanelDefaultConfigProvider` replaces it whole, and neither the provider's JSDoc nor the docs say so (see suspected defect 3).
5. On the component overload of `open()`, `@param componentOrTemplateRef` names a parameter that is called `component`.
6. "Managing OverlayContainer" says the default container is `document.body`. It is the CDK overlay container element appended to `body`.
7. The comment above `hostDirectives` of the panel container says the container's injector is parented on the root injector unless `injector` is given. With `KbqActionsPanel` provided in a component, as the docs recommend, it is parented on that component's injector.
8. The close button's name comes from `actionsPanel.closeTooltip`, not from `kbqInjectA11yLocaleConfiguration()` as AGENTS.md asks of default ARIA text. Its `en-US` value "Clear" does not match the other locales, which say "deselect".

**Suspected defects (from reading the code, not reproduced)**

1. A panel in the application-wide container makes CDK mark every sibling of the overlay container, the application root included, with `aria-hidden="true"` once the entrance ends. The panel is not modal: `aria-modal="false"`, no backdrop, no focus move, no focus trap. Screen reader users lose the content the panel acts on, and keyboard users can still tab into hidden content (axe `aria-hidden-focus`). The scoped path avoids the marks on purpose; the global one does not.
2. The panel has `role="dialog"` without an accessible name (axe `aria-dialog-name`), and `KbqActionsPanelConfig` has no option to give it one. No axe test opens a panel.
3. A partial value for `kbqActionsPanelDefaultConfigProvider`, the shape its type and its test use, drops the class defaults:
    - `scrollStrategy` becomes `undefined`, so CDK falls back to the dialog's block strategy and page scrolling is locked while a panel is open;
    - `data` becomes `undefined` instead of `null`.
4. Closing that bypasses `KbqActionsPanelRef.close()` skips the exit animation and never emits `beforeClosed`. This covers `closeOnNavigation`, `Dialog.closeAll()` and an overlay disposed from outside. A later `close()` on the reference still emits `beforeClosed`, after `afterClosed`.
5. The close button and Escape call `close()` on the `KbqActionsPanel` that the container's injector resolves. When the `injector` option resolves a different instance, for example the root one, they close that instance's panel, or nothing, instead of their own.
6. `direction` reaches only the overlay's `dir` attribute and the RTL class. CDK provides a `Directionality` to the content only when the content injector has none, and the injector built for the panel always reaches the root one. Content that reads `Directionality`, such as a dropdown, keeps the application's direction. The `'ltr'` default also ignores the application's direction.
7. A replacement panel closed before the panel it replaces has finished closing never emits `beforeOpened` or `afterOpened`, and those streams never complete.
8. Closing the panel from its close button or with Escape leaves focus on `body`: the focused element is removed, `restoreFocus` is off and the focus trap is never set up.

**Tests whose name and body disagree, or that cannot fail**

- "should not close on ESCAPE" (with `disableClose`) checks synchronously after dispatching the key. Closing is asynchronous, so it passes even if Escape closes the panel.
- "should apply global custom OverlayContainer by providers" only checks a class that `FakeOverlayContainer.getContainerElement()` adds whenever it is called, including by the test's own helper. It passes wherever the panel renders.
- "should keep the scoped container as an only child, so that CDK has no siblings to aria-hide" checks `aria-hidden` synchronously after opening, while CDK sets the marks only after the entrance ends. That half probably cannot fail.
- "should emit beforeOpened synchronously on open, before afterOpened" subscribes after `open()` has returned and sees the replay, so it cannot tell a synchronous emission from a later one. It duplicates "should replay beforeOpened to subscribers that missed the synchronous emission".
- The suite is named after `KbqActionsPanelModule`, which no test imports; every host provides `KbqActionsPanel` directly.

**Behaviour without a test.** The spec states these from the source:

- `KBQ_ACTIONS_PANEL_DATA` resolving to `null` without `data`;
- dependency resolution of component content through `injector` or the opening instance's injector;
- a replacing panel emitting `beforeOpened` only after the replaced one has closed;
- `KbqActionsPanelModule` providing an instance of its own;
- the result of the first close being kept when `close()` is called again;
- `keydownEvents`;
- `close()` on the service doing nothing when no panel is open;
- the vertical divider and the `undefined` result of the close button;
- Escape not closing the panel when focus is outside it, and the prevented default action;
- Escape with `disableClose`, since its only test cannot fail, and closing from code with `disableClose`;
- an outside click not closing the panel;
- overlays of the content not being scoped to the element;
- the `dir` attribute and the `'ltr'` default of `direction`;
- the reposition strategy as the default;
- router navigation not closing the panel;
- a per-call option winning over the default configuration;
- no focus trap and no focus restore on close;
- `role`, `aria-modal`, `tabindex` and the missing accessible name of the panel;
- the close button's tooltip text, the `KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION` default and `kbqActionsPanelLocaleConfigurationProvider`;
- `kbq-animations-disabled` and the events under reduced motion.

## alert

Change: `document-alert-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqAlertTitle` calls it the alert heading, and the docs speak of a heading. The directive adds only a class: the examples use `<div kbq-alert-title>`, so assistive technology gets no heading, and the docs do not say to use a heading element.
2. The accessibility section of both pages tells consumers to mark a decorative status icon `aria-hidden="true"`. `kbq-icon` and `kbq-icon-item` already render `aria-hidden="true"` unless told otherwise, so the advice, which every example follows, is redundant.
3. The "Hide" section says an alert that reports a system problem "is displayed permanently and the user cannot close it". Nothing enforces that: an `error` alert with a close control can be dismissed. It is a design guideline that reads like behaviour.
4. The "Status" section describes the auto-tint, but the `alert-status` example it embeds, and `alert-variants` too, set `[color]` on every icon to the matching status, so neither shows the auto-tint. The comment in the unit spec says its fixture relies on the auto-tint "like the docs examples", which holds only for the overview, content and close examples.
5. The comment on the button query in `alert.component.ts` says it reports whether the control slot contains a button. The query covers the whole projected content (see suspected defect 3).

**Suspected defects (from reading the code, not reproduced)**

1. The `closed` listener sits on the close control's wrapper, not on the control. The wrapper is a flex item of the host, which keeps the default `align-items: stretch`, so it probably runs from just below the top of the alert to its bottom. A click in the empty column under the close button would then emit `closed`.
2. A disabled `kbq-icon-button` gets `pointer-events: none`. A click on a disabled close control then lands on the wrapper and probably still emits `closed`.
3. `kbq-alert__button-stack_has-button` follows any `kbq-button` at any depth of the content, for example one inside the text or a `kbq-button` used as the close control, not only one in the control slot.
4. The re-tint compares the icon's color with the last color the alert assigned, not with who set it. A consumer color equal to that last color, set later on the same icon or on a new icon that replaced the tinted one, is overwritten on the next `alertColor` change.
5. The dev-mode warning covers only one icon of each kind. Two `kbq-icon` or two `kbq-icon-item` elements render side by side, only the first is tinted, and nothing warns.

**Tests whose name and body disagree, or that cannot fail**

- "should default to the default style" and "should be normal by default and compact when requested" use a host that binds `alertStyle` to `default` and `compact` to `false`. They do not test the inputs' defaults and keep passing if the defaults change. No unit test checks the `info` default either.
- "should toggle the has-button modifier when the control is a button" checks only that the modifier is present; nothing checks that it is absent for link controls.
- "should toggle the title modifiers when a title is projected" checks only `kbq-alert__content_title`. The fixture shows no icon at the same time, so `kbq-alert__icon_title` is never checked.
- "should round-trip alertColor (get returns the raw value that was set)" names a getter that no longer exists; the body reads the `alertColor` signal.

**Behaviour without a test.** The spec states these from the source:

- the `info` and normal-size defaults, which only the e2e screenshot shows, and the `default` style default, which nothing checks;
- the bare `compact` attribute, and `null` or `undefined` falling back to `info` (the test covers the empty string);
- removing the previous status class when the status changes;
- the template references `kbqAlert`, `kbqAlertTitle`, `kbqAlertControl` and `kbqAlertCloseButton`;
- an icon nested inside the text not being taken as the status icon;
- the auto-tint of a `kbq-icon-item`, which only the e2e screenshot shows, and of an icon bound to an empty color;
- which icon is tinted when both kinds are projected;
- no warning in production mode;
- `kbq-alert__icon_title`;
- the fixed slot order and nested markers staying with their parent;
- no `closed` on clicks on the text, title or controls; `closed` from the keyboard; the alert staying rendered after `closed`;
- no `kbq-alert__button-stack_has-button` for link-only controls, which only the e2e screenshot shows;
- no `role` or ARIA on the host, and the consumer's `role="alert"` kept; no axe check renders an alert;
- no text of its own;
- the host classes of the three marker directives;
- `KbqAlertModule`, exercised only indirectly by `filter-bar/filters.spec.ts`, which renders an alert from that module.

## app-switcher

Change: `document-app-switcher-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. `KbqAppSwitcherSite.icon` and `KbqAppSwitcherSite.iconSrc` are documented as the site icon, "sanitized the same way" as an application icon. No template renders a site icon: the site heading and the other-site rows show the name and the status only.
2. `KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING` is 3 and `KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_SEARCH` is 7, but both thresholds are exclusive: a group needs four applications of a type and search needs eight applications. The names read as inclusive minimums. The docs page states four and "more than 7" correctly.
3. The docs say "The main platform is marked with a badge". The badge shows the `status` text of any site that has one; there is no notion of a main site.
4. The keyboard table says Esc closes the switcher. With a query in the search field Esc clears the query first, and inside a flyout it closes only the flyout. The table also describes the arrow keys for left-to-right layouts only, while groups and flyout panels swap Left and Right in right-to-left layouts.
5. The JSDoc of `backdropClass` says it is the class "used in the background". The switcher never renders a backdrop: `hasBackdrop` is a private `false`.
6. The JSDoc of `disabled` says the trigger is disabled. The trigger element gets no `disabled` or `aria-disabled`; only opening is blocked.
7. The comment on the focus tracking and the name of its test say a row can receive focus "via Tab". Tab anywhere in the popup except the search field closes it.
8. `examples.app-switcher.{en,ru}.mdx` are "Documentation in progress" placeholders, and `structure.ts` sets `hasExamples: false`, so the pages are never routed. Both examples are on the overview page.

**Suspected defects (from reading the code, not reproduced)**

1. A pick from the current site's list or from the search results never writes `selectedApp` or `selectedSite`; only a pick in another site's flyout does. A single-site switcher therefore never updates `[(selectedApp)]`. The overview example shows "App: …" bound to it, and its applications have no `link`, so clicking one does nothing at all.
2. `offset` has no effect. The popup root never binds the placement classes it computes (`classMap` is set but bound neither in the template nor on the host), so the margin that `applyPopupMargins` writes for the `kbq-app-switcher_placement-*` classes never applies. The size modifier class is lost the same way.
3. `backdropClass` has no effect, because no backdrop is rendered.
4. When the user moves focus to another focusable element outside the popup, by Tab from the search field or by a click, the focus-out handler closes the popup and focuses the trigger, taking focus away from the element the user chose. Every other close, such as an outer scroll, also moves focus to the trigger.
5. Flyout rows have `role="menuitem"`, but the dropdown panel that holds them has no `role="menu"`. The axe tests never open a flyout, so an `aria-required-parent` violation would go unnoticed.
6. The trigger gets no `aria-haspopup` or `aria-expanded`, which the menu-button pattern expects; the examples add only `aria-label`.
7. Hovering a row focuses it, as every dropdown item does. Moving the pointer over the results while typing a query takes focus out of the search field, and the next keystrokes go to the list's type-ahead instead of the query.
8. The default grouping treats a `type` of `0` as no type, because it checks for a falsy value, and merges the types `1` and `'1'` into one group, because it keys groups by `type.toString()`.

**Tests whose name and body disagree, or that cannot fail**

- "filters apps by name case-insensitively" asserts with `.every()`, which also passes when nothing matches.
- "closes and focuses the trigger on Tab, preventing the native focus move into browser chrome" mocks `hide` and never asserts that it was called, so "closes" is not checked.
- The `disabled input` block sets the property in code and never binds `[disabled]`; "sets `_disabled` to true" names a private field.
- "marks external links as noopener" checks every row; the code adds `rel` to all of them, and nothing tells external links apart.
- "hides decorative icons from assistive technology" in the accessibility block checks only the search icon.
- "treats Space as a typeahead character instead of activation while a search sequence is in progress" mocks `isTyping`, so nothing shows that type-ahead runs.
- "syncs the active item when focus moves to a tracked menu item via Tab or click" calls `focus()`; it never presses Tab, which would close the popup.
- "does not throw when hovering the list of a single-site switcher that has a search field" sits in the accessibility block and asserts only that nothing throws.
- The e2e "closes and returns focus to the trigger when focus leaves the menu" presses Tab, which goes through the Tab handler, not through the focus-out path its name describes.
- The e2e "the switcher opens and stays usable with reduced motion requested" checks only that the first row is visible.

**Behaviour without a test.** The spec states these from the source:

- Enter and Space on the trigger opening the switcher;
- the `kbq-app-switcher_open` and `kbq-active` classes on the trigger, and the `kbqVisibleChange` and `kbqPlacementChange` outputs;
- a disabled trigger not opening, and the `[disabled]` binding;
- an outside click closing the switcher, with no backdrop;
- scrolling inside a site flyout not closing the switcher;
- focus moving to the trigger after closes other than Escape and Tab;
- a single-site switcher ignoring `selectedSite`;
- the image size of `iconSrc`, and the sanitizer returning `null` when a second pass changes the markup;
- no selected marking in the search results and the flyout panels;
- a pick from the current list or the search results leaving the selection alone;
- opening a site flyout by click or Space, and picking an application from a group's nested flyout;
- Left closing a flyout, and the pointer over the current list closing it;
- the site labels in multi-site search results, and grouped applications showing as plain rows there;
- Escape clearing a query, and the query being reset on reopen;
- type-ahead itself, and Shift+Tab;
- a hovered row receiving focus;
- `aria-haspopup` on group rows inside flyout panels, and no ARIA on the trigger;
- the localized strings, their default without a locale service and `kbqAppSwitcherLocaleConfigurationProvider()`;
- standalone use without `kbqAppSwitcherProvider()` and the precedence of `KBQ_APP_SWITCHER_SCROLL_STRATEGY`.

## autocomplete

Change: `document-autocomplete-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Text autocomplete" section says text mode "inserts the selected option after the caret". It replaces the query before the caret, trigger included, with the option. The Enter row of the keyboard table says the option is inserted "at the caret", with the same gap.
2. The keyboard table says ↓ opens the panel. In text mode ↓ never opens it. The table also leaves out Shift+↑/↓, which chooses the newly active option outside text mode and selects text in text mode.
3. The "Inline hint" section does not say that the hint needs a `kbq-form-field`, which the JSDoc of `kbqAutocompleteInlineHint` does. It also does not say that no hint is drawn when text follows the caret on its line or when the text is right-to-left or centred.
4. The JSDoc of `panelClosingActions` lists "on blur" among the closing actions. Blur does not close the panel; an outside click does.
5. The JSDoc of `activeOption` says the option is "coerced to MatOption type", a leftover from Angular Material.
6. The JSDoc of `kbqAutocompleteOnBlur` describes "an event handler for input blur events". The trigger never calls it: only `kbqTagInput` reads it to decide whether to add a tag on blur.
7. The JSDoc of `displayWith` describes mapping "an option's control value". It is also applied to every value the form writes, `null` included, and in text mode to the text an option inserts.
8. The JSDoc of `kbqAutocompleteDisabled` says "the user won't be able to open the panel". `open()` still opens it.
9. `examples.autocomplete.{en,ru}.mdx` are "Documentation in progress" stubs, while `structure.ts` sets `hasExamples: false`, so no route shows them. The "Suggestions next to the caret" and "Inline hint" sections have no live example of their own.

**Suspected defects (from reading the code, not reproduced)**

1. With `autoActiveFirstOption` on, its default, choosing an option other than the first with Enter makes the first option active after the panel has closed. The active-option handler then selects that option, because the panel is closed. While it is still rendered, the first option becomes `selected` next to the chosen one, and `optionSelections` reports a user selection of it. In text mode this breaks the promise that no option stays selected.
2. Every arrow key and every hover moves DOM focus onto the option and straight back to the field. The WebKit e2e records those focus calls. The field fires `blur` and `focusin` each time, so the control is marked touched, and a required field may show its error, while the user is still in it.
3. When the panel is bound after the trigger's first render, for example inside an `@if` that turns true later, the trigger never subscribes to active-option changes. Arrow keys then no longer scroll the active option into view, and the inline hint does not follow them.
4. `opened` and `openedChange(true)` fire again, with no `closed` in between, when the options run out while the panel is attached and later come back.
5. Focusing a field whose `kbqAutocomplete` is not bound throws a `TypeError` (`openOnFocus` of `undefined`). It is not the descriptive missing-panel error that `open()` throws.
6. Every selection event of an option while the panel is open counts as a choice. A programmatic `select()` or `deselect()` closes the panel, writes that option's value to the field and the form, even the value of an option being deselected, and emits `optionSelected`.
7. Deselecting on an empty field works only when `kbq-autocomplete` sits inside the field's `kbq-form-field`. Placed outside, as in the unit fixtures and the fallback e2e route, a cleared field leaves the old option `kbq-selected`.
8. `aria-autocomplete="both"` is set whenever text mode and the inline hint are on, also where no hint can be drawn: outside a `kbq-form-field`, or with right-to-left or centred text.

**Tests whose name and body disagree, or that cannot fail**

- "should close the panel when the user taps away on a touch device" dispatches `focus`, but the trigger listens to `focusin`. The panel never opens, so the assertions hold without the touch event.
- These compare `getBoundingClientRect()` values, which are all zero in jsdom:
    - "should use below positioning by default";
    - "should reposition the panel on scroll";
    - "should align panel properly when filtering in "above" position";
    - "should fall back to above position when requested if options are added while the panel is open";
    - "should reposition the panel when the amount of options changes";
    - "should be able to set a custom panel connection element";
    - "should be able to change the origin after the panel has been opened".
- "should use below positioning by default" also asserts the absence of `kbq-autocomplete-panel-above`, a class nothing sets.
- "should not move active option past the first when pressing UP from the top" reads `scrollTop` of `.kbq-autocomplete-panel`. That element does not scroll, and jsdom does not scroll at all, so only the active-option assertion can fail. The `getScrollTop()` assertions of "should move the active option through the panel via DOWN/UP" are always 0 for the same reason.
- "should not open the panel if the `input` event was dispatched with changing the value" dispatches the event without changing the value.
- "should close the panel when pressing escape" under "panel closing" asserts only that `panelClosingActions` emitted, not that the panel closed.
- "should show the panel when the first open is after the initial zone stabilization" refers to zone stabilization. TestBed is zoneless, and `runOutsideAngular` changes nothing there.

**Behaviour without a test.** The spec states these from the source:

- opening:
    - Down opens a closed panel outside text mode;
    - a click on the focused field opens the panel with `openOnFocus` set to `false`;
    - `open()` ignores the read-only, disabled and autocomplete-disabled states;
- closing:
    - a middle-button click and the end of a touch outside the panel close it;
    - a click inside the `kbq-form-field` keeps it open;
    - an outside click does not move focus and keeps the typed text;
    - Escape and Alt+Up reset the active option to the first one when `autoActiveFirstOption` is on;
    - the default scroll strategy repositions the panel;
- choosing:
    - focus returns to the field after a pointer choice;
    - a click on a disabled option leaves the panel open, hover skips disabled options, and a disabled `kbq-optgroup` disables its options;
    - hover makes an option active (the WebKit e2e asserts only that the list does not move);
    - Enter resolves a stale active option again;
    - Home, End, Left and printable characters are left to the field;
    - focus is back in the field after each arrow key;
- forms:
    - an emptied number field writes `null`;
    - the selection is cleared with the field;
    - the default `autocomplete="off"`;
- caret and text mode:
    - the field's box is used when the caret cannot be measured;
    - a caret-anchored panel is repositioned on `input`, `click`, `select` and `scroll` (only the key release is tested);
    - no query while text is selected;
    - text mode opens on focus and on a click;
    - text mode closes when only the caret moves;
    - the bubbling `input` event after an insertion;
    - an inserted option does not stay selected;
- inline hint:
    - the `aria-hidden` hint layer;
    - no hint outside a `kbq-form-field` or for right-to-left, centred or end-aligned text;
    - the hint is hidden when `kbqAutocompleteDisabled` is set;
- layout:
    - `panelMaxWidth` and the 640 px cap;
    - positioning and width against a custom origin;
    - the `kbq-connected-overlay_below` and `kbq-connected-overlay_above` pane classes;
    - the footer's place outside the listbox and the scrolling area, and clicks inside it;
- `openedChange`.

## badge

Change: `document-badge-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. "Tooltip with explanation" in `badge.en.mdx` and `badge.ru.mdx` says the tooltip opens on hover or focus. The badge sets no `tabindex`, the tooltip trigger adds one only for a disabled wrapped control, and the `badge-tooltip` example adds none, so a keyboard user cannot reach the tooltip.
2. `KbqBadgeCssStyler` is `@docs-private`, yet a standalone consumer has to import it next to `KbqBadge` to get the icon spacing. No docs page says so; `dl/e2e.ts` and the `file-upload-primitive` example import `KbqBadge` alone (neither has an icon inside the badge).
3. The "Content" example writes the caption as `<div class="kbq-badge-caption">` and never shows the `kbq-badge-caption` directive, which the docs do not mention at all.
4. Nothing on the docs page or in the JSDoc says that `outline` is styled only for the fade colors and `disabled`. The members of `KbqBadgeColors` have no JSDoc; the golden file marks each one `(undocumented)`.
5. `examples.badge.en.mdx` and `examples.badge.ru.mdx` are "documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so they are not routed, but they are kept in the tree.

**Suspected defects (from reading the code, not reproduced)**

1. An outlined badge in a solid color gets no theme rule. It inherits its text color, has a transparent background, and keeps the base `border-style: solid` with no border color, so the border is drawn in the inherited text color. Nothing warns about the combination.
2. Icon position counts whitespace-only text nodes; only comments are skipped. Button, button toggle and the deprecated link use `getContentNodes`, which skips both. With `preserveWhitespaces: true`, a leading icon after a line break sits at index 1 and gets no class.
3. The icon classes are recomputed only when the set of projected icons changes. Text or a caption added or removed later, for example by its own `@if`, leaves the icon classes as they were.
4. When a recomputation finds one child node or fewer, it removes the host classes but not `kbq-icon_left` / `kbq-icon_right` from the remaining icon. Removing one of two adjacent icons leaves a stale class on the other.
5. A `badgeColor` string with whitespace in it is split by the class binding into several classes, so `success foo` adds `kbq-badge_success` and `foo`.
6. `KbqBadgeModule` imports `A11yModule` and `PlatformModule`, which the badge does not use and the module does not export.

**Tests whose name and body disagree, or that cannot fail**

- "should fall back to fade-contrast color" under "basic styles" renders a badge with no `badgeColor` binding, so it checks the default, not a fallback. The fallback is covered by "should fall back to fade-contrast for an empty value".
- "should not render an icon before it is projected" mostly asserts that the fixture's own `@if` hides the icon; only its second assertion concerns the badge.
- "should add left icon class to a leading icon" sits under a `beforeEach` that builds the async-icon fixture, then discards it with `TestBed.resetTestingModule()` and builds its own.
- "boolean attribute coercion" checks the string `'false'` only for `compact`, not for `outline`.
- The e2e test "adds icon spacing when the icon is projected asynchronously" reads the computed margin once with a plain `expect`, not a retrying assertion, right after the click.

**Behaviour without a test.** The spec states these from the source:

- the element-only selector and the module's exports;
- a non-enum color string rendered as a class, and the `null` and `undefined` fallback;
- toggling `outline` and `compact` at runtime, and `outline` bound to `'false'`;
- the `disabled` color setting no `disabled` or `aria-disabled` attribute;
- content projected without a wrapper;
- the `kbq-badge-caption` directive adding its class;
- `KbqBadge` imported alone applying no icon spacing;
- no class for an icon-only badge, an icon in the middle or a nested icon;
- the host class removed when the icon is removed again;
- no `tabindex`, `role` or ARIA attribute on the host.

The color and fill combinations rest on the e2e screenshot "styles" alone, and the outlined solid colors are read from the theme, as no test renders them.

## breadcrumbs

Change: `document-breadcrumbs-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The keyboard table says Tab moves focus to the first item. Focus returns to the entry that last had focus, and goes to the first entry only when none has.
2. The keyboard table says Enter and Space activate an item. Default entries are `<a>` elements, and neither the trail nor `kbq-button` turns Space into a click. As read from the source, Space scrolls the page instead of following the link. This is not reproduced.
3. The "Disabled State" section and the JSDoc of `disabled` say every item stops navigating and leaves the tab order. Entries rendered from a `kbqBreadcrumbView` template are not disabled. The item's own `disabled` likewise reaches only default entries and dropdown rows.
4. The "Accessibility" section says the last item is marked `aria-current="page"`, and the JSDoc of `current` says the last item is current regardless of the input. Both hold only for default entries. A templated last item gets no `aria-current`, and `current` on a templated item affects only its dropdown row. The custom-template examples set `aria-current` themselves.
5. The JSDoc of `max` says it is the maximum number of visible items. The expand button takes one of the slots, so `max - 1` items stay visible. A value below 2 applies no cap. `wrap` and `none` ignore `max`. The docs page explains the slot but not the other two.
6. The JSDoc of `text` says the text is shown when the item is hidden in the dropdown. The docs page says the dropdown rebuilds collapsed items from `text` and `routerLink`. Both are true only for items without a `kbqBreadcrumbView` template. The row of a templated item renders the template.
7. The JSDoc of `size` says it affects the font size. `compact` also changes the entry height and the expand button padding.
8. The "Line Breaks" section never names `wrapMode` and never shows `none`. Its "No Line Break Mode" heading shows an example with `wrapMode="auto"`.
9. `breadcrumbs-dropdown-example.ts` has the title "Breadcrumbs sizes".
10. Two examples nest a button inside a link: `breadcrumbs-truncate-by-abbrev-items` and `breadcrumbs-truncate-center-items` place a `<button kbq-button kbqBreadcrumb>` inside an `<a routerLink>`. Docs examples are expected to pass axe, which reports `nested-interactive` for such markup. This is not reproduced.
11. "Truncation by Name Length" says the name is cut after the first 14 characters. Its example cuts the entries at a width of 124 px.

**Suspected defects (from reading the code, not reproduced)**

1. `kbq-button` and the roving focus both bind `tabindex` on every entry, and each writes only when its own value changes. Suppose an entry goes from disabled to enabled, because the trail's or the item's `disabled` is turned off. The button then writes `tabindex="0"`. The roving value is still `-1`, so it does not write back. The entry looks to stay an extra Tab stop until it gains and loses focus.
2. A collapsed item whose template holds an `<a kbq-button kbqBreadcrumb>` is rendered inside the row's `<a kbq-dropdown-item>` in the expand dropdown. That is a link inside a link. The custom-template example and the unit fixture both do this. No axe test opens the dropdown.
3. `kbqBreadcrumb` injects the trail's roving-focus group without `optional`. Used outside `kbq-breadcrumbs`, it throws a dependency-injection error, and no docs say it needs a trail.
4. Before the first overflow measurement, the expand button has no hidden state yet. That measurement runs in a zero-delay timer after the render. A trail with nothing to collapse may show the button for a frame.
5. A disabled default entry keeps the `href` from its `routerLink`; only `click` and the activation keys are halted. A middle click or "open in new tab" still follows it. This includes the last entry, which always renders disabled.

**Tests whose name and body disagree, or that cannot fail**

- "should not set max-width when max more than actual items": the trail never sets an inline `max-width`, so the test cannot fail.
- "should apply the disabled state correctly to specific breadcrumb items" checks the last item. That item is disabled whatever its own `disabled` says, so the test would pass if the item input stopped working.
- "should not modify focusableItems when fewer than two items are registered": the name and its comment describe an effect returning early with fewer than two items. The body checks that a lone last item is not registered.
- "should render all items inside the overflow container when max is exceeded": its first assertion compares the fixture's own array with `max`. The cap itself is not asserted; the "max changes" tests cover it. The test also keeps a comment about the earlier Karma version.
- "should open dropdown on ArrowDown if item is Dropdown trigger" dispatches an event that carries only `keyCode`. The roving handler reads `key`, so it never sees an arrow key. The test does not show that the trail leaves ArrowDown alone.
- "should apply the size class to the breadcrumbs container" binds `normal`, which is also the default. It covers neither the default path nor the other sizes.

**Behaviour without a test.** The spec states these from the source, or from the screenshots only:

- the destination of default entries and dropdown rows, including `queryParams` and `fragment`;
- item content outside a `kbqBreadcrumbView` template being hidden;
- a click on a disabled entry not navigating;
- the transparent style and contrast color that `kbqBreadcrumb` applies by default (screenshots only);
- the collapse order by width, and `aria-hidden` on collapsed entries;
- the default `max` of 4, and a `max` below 2 applying no cap;
- the `disabled` and `aria-current` states of dropdown rows;
- the classes `kbq-breadcrumbs_compact`, `kbq-breadcrumbs_big`, `kbq-breadcrumbs_wrap` and `kbq-breadcrumbs_first-item-negative-margin`, and the rendering of `wrap` and `none` (screenshots only);
- the tooltip of a clipped entry;
- no expand button in a trail of fewer than two items;
- `tabindex="-1"` on the host when no entry is reachable (the tests check only the registered set);
- focus returning to the entry that last had focus, and pointer focus;
- arrow-key movement in left-to-right, wrapping with `loop`, `loop` set to `false`, Home and End movement, ignored modifier keys, and ArrowUp and ArrowDown not prevented;
- the `dir` input;
- `kbqBreadcrumbsConfigurationProvider` merging over the defaults, and a bound input winning over it;
- `[localeOverrides]` and switching the locale at runtime.

## button

Change: `document-button-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. `button.en.mdx` says an icon button is made with `<button kbq-icon-button>`. `kbq-icon-button` is a different component from `@koobiq/components/icon`, put on the icon itself. A `kbq-button` becomes icon-only by itself when its content is one or two icons.
2. `button.en.mdx` says there are "two button variants, each applied as an attribute". There is one attribute, `kbq-button`, and the variant follows the content.
3. `button.en.mdx` lists the colors `theme`, `secondary` and `error`. `KbqButtonColor` is `theme`, `theme-fade`, `contrast` and `contrast-fade`; there is no `secondary`, and status colors have no button look.
4. The English and Russian overview pages describe different things. Only the Russian page shows `kbqStyle`, the content slots, the width cases (hug, fixed, fill) and the loading example; neither page mentions the `kbqButtonPrefix` / `kbqButtonSuffix` markers in text, anchors, `tabIndex`, `kbq-title` or `kbqButtonGroupRoot`.
5. `examples.button.{en,ru}.mdx` are "documentation in progress" stubs, and `structure.ts` sets `hasExamples: false` for Button and Button Group, so the site never routes to them.
6. The JSDoc of `buttonLeftIconClassName` and `buttonRightIconClassName` says the class is set when the first or last visible child is an icon. A lone icon is both, but gets neither class: the classes need more than one visible node.
7. The JSDoc of `KbqButtonGroupRoot.kbqStyle` says the style reaches "every nested button". Only buttons placed directly in the group's content are reached; a button inside a wrapper element is not.
8. `KbqButton`, `KbqButtonModule`, `focus()`, `focusViaKeyboard()`, `hasFocus` and `getHostElement()` have no JSDoc; the golden file marks them `(undocumented)`.

**Suspected defects (from reading the code, not reproduced)**

1. A disabled `<a href kbq-button>` keeps its `href`, and only `click` and a few keys are halted. A middle click, which fires no `click` event, or "Open link in new tab" from the context menu probably still opens the link.
2. On an `<a kbq-button>`, a `role` the consumer sets is replaced by `button` when there is no `href` and removed when there is one, on every check. A link button with `role="tab"` or `role="menuitem"` loses it.
3. When a button's own `kbqStyle` turns falsy inside a group whose style is not `filled`, the button becomes `filled` and stays so until the group style changes again, instead of taking the group style. The only test uses a `filled` group, where the two are the same.
4. A group color set in code to `contrast-fade`, the group's default, is not propagated, while the same value bound through the input is. Transparent buttons then stay `contrast`.
5. `kbq-progress` is purely visual: it sets no `aria-busy`, does not disable the button and lets clicks through. Assistive technology gets no loading cue, and a repeated click submits again. This may be intended, but the docs do not say so.
6. `KbqButton` imported without `KbqButtonCssStyler` fails with a bare missing-provider error, while the opposite mistake gets a dev-mode warning that names the fix.

**Tests whose name and body disagree, or that cannot fail**

- "should remove tabindex if disabled" expects `tabindex="-1"`, not a removed attribute, and its first assertion runs before the first change detection, when the anchor has not rendered its `tabindex="0"` yet.
- `KbqButtonGroupRoot` "should fall back to Filled when falsy value is set" never sets a falsy value: the fixture binds `filled`.
- "should toggle host button class type on icon removal/reveal" and the left and right icon variants only remove the icon; nothing is revealed.
- "should switch to kbq-button-icon via the effect when an icon is revealed while the content observer is disabled": the template never disables the content observer, so the test cannot tell the effect from the observer, and its comment is stale.
- "should leave every child on the default color of its own style while the color is unbound" binds the group color to `null`; no unit test renders a group without a `color` binding.
- "should expose aria-expanded on a dropdown trigger" asserts an attribute the dropdown trigger writes, not the button.
- "should should not clear previous defined classes" has a doubled word in its name.

**Behaviour without a test.** The spec states these from the source:

- `KbqButton` without the styler failing with a missing-provider error;
- no `type` attribute added to a native button;
- the `kbq-disabled` class (only the disabled screenshot depends on it);
- Left and Right being halted, and Tab and Escape passing, on a disabled anchor;
- the CDK focus-origin classes on the host;
- no focus ring for mouse focus or for a disabled button that keeps focus;
- `kbq-progress` standing still under reduced motion and leaving the button clickable;
- the fallback look of a style and color pair the design system does not define, and a custom style getting no colors;
- the forced hover and pressed looks not applying to a disabled button;
- an icon nested in a wrapper element counting as other content (`kbq-button`);
- `kbq-active` going away when the dropdown closes;
- `role="group"` and no `aria-orientation` on `kbq-button-group`;
- the group's `disabled` input through `kbq-button-group` (tests use `kbqButtonGroupRoot`), and an unbound group style leaving buttons alone;
- the `kbq-button-group-root_<style>` class in the DOM (tests read the property) and its absence on an unstyled group;
- a group color set in code;
- a button inside a wrapper element not being reached by the group.

## button-toggle

Change: `document-button-toggle-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Both docs pages say that when "the pressed button is blocked, the entire group is styled as unavailable". Nothing styles the group as a whole: disabling the pressed toggle disables that toggle only, as the `button-toggle-disabled-partial-overview` example just above the sentence shows. Disabling the group disables each toggle; the group element gets no disabled class.
2. The JSDoc of the toggle's `change` says "Event emitted when the group value changes". It fires on every activation, including a click on the selected toggle of a single group that changes nothing, and on a standalone toggle that has no group. It carries the toggle's own value, not the group's.
3. The JSDoc of the group's `change` says "Event emitted when the group's value changes". It fires only for a user interaction; a value assigned in code, a toggle checked in code, a renamed or removed selected toggle change the value without it.
4. The JSDoc of `controlValueAccessorChangeFn` says "`ngModel` binding is not supported in multiple selection mode". A multiple group writes arrays to its form control, and the unit suite drives one through `formControl`.
5. The JSDoc of the toggle's `tabIndex` says `null` "leaves the toggle at its default position in the tab order". In a single group every toggle except the tab stop gets `-1` whatever its `tabIndex`.
6. The docs say the tooltip of a truncated label opens "on hover or focus". It opens on keyboard focus only; focus from a click or from code hides it.
7. The docs say an unnamed icon-only toggle "logs a warning until it is named". It warns once per toggle instance.
8. The docs ask to name the group and to mark icons with `kbqButtonPrefix` / `kbqButtonSuffix`, but most live examples do neither: only one group of the overview example and one of the alignment example has an `aria-label`, and only the tooltip example uses a slot marker.
9. `examples.button-toggle.{en,ru}.mdx` are "Documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so the tab is not routed. The Russian overview keeps the English heading "Disabled".

**Suspected defects (from reading the code, not reproduced)**

1. Changing `multiple` after initialization updates the roles, `aria-orientation` and `type`, but the selection keeps the mode it was created with in `ngOnInit`. A group switched from multiple to single would keep several toggles selected and report the one selected first. The select throws in this case; the toggle group says nothing.
2. Changes made in code never reach the form control. After the selected toggle is removed, the group value is empty while the control still holds the old value, and a toggle rendered again with that value is not reselected, because the group dropped the value when the toggle left.
3. Assigning an array in an order other than the toggles' through `[(value)]` makes the group emit the reordered array during change detection. With the exhaustive `checkNoChanges` of development mode this probably throws `NG0100`.
4. The array check accepts falsy non-arrays. Assigning `0` or `false` to a multiple group after initialization fails with a `TypeError` from `includes` instead of the documented message; assigned before initialization, it preselects the toggle with that value.
5. The arrow, Home and End handler ignores modifier keys, so Alt + Left (browser back) and Ctrl or Shift with an arrow are prevented and move the selection.
6. Nothing marks the control touched on blur. A required group the user tabs through without choosing stays untouched, so an error shown on touched never appears.
7. The right-to-left swap of Left and Right comes from the CDK `Directionality`, while the layout and the hit area follow the CSS `dir`. A `dir="rtl"` on a container that the CDK `Dir` directive does not pick up mirrors the layout but not the keys.

**Tests whose name and body disagree, or that cannot fail**

- "should update the model before firing change event" checks the model and the event only after both happened, so it cannot detect the order.
- "should register the on change callback" registers a spy on the `FormControl` and calls `setValue()`; the control calls the spy itself, whatever the group does.
- "should update the model if a selected toggle is removed" asserts the group's `value` and `selected`, never the bound `groupValue`.
- Both "should disable click interactions when the group is disabled" tests click a natively disabled button, which jsdom does not dispatch; the toggle's own disabled guard is never reached.
- The two "should emit a change event for state changes" tests explain the second event with a `checkbox` input type that the toggle does not render.
- "should follow the mode when it changes at runtime" checks roles and `type` only, which is how suspected defect 1 goes unnoticed.
- The e2e "paints the hover state from a real pointer" says it uses the "normal" column, but its `.first()` group is the "disabled" column; it hovers that group's last, enabled toggle, so the test still holds.
- The `kbq-title` tests under "KbqButtonToggle label" read private members of `KbqTitleDirective` (`childElements`, `parent`, `handleElementEnter`) and break on a refactor of that directive.

**Behaviour without a test.** The spec states these from the source:

- a click on the selected toggle of a single group keeps it selected, emits no group `change` and does not mark the control touched;
- the order of the form write, the group `change`, `valueChange`, touched and the toggle `change`;
- a toggle checked in code leaves the form model's value unchanged; blur does not mark the control touched;
- an arrow-key move emits `change` and writes the form;
- `type="button"` on the inner button, and activation by Enter and Space;
- the order of values in multiple mode, and `valueChange` after an out-of-order assignment;
- only the first of several toggles sharing a value is selected; `null` assigned to a single group is reported as `null`;
- `selected` as an array in multiple mode;
- `[checked]` and `[disabled]` bound to `undefined` are ignored;
- a toggle's own `disabled` survives enabling the group, and the group element gets no disabled class;
- a disabled toggle can be selected in code, and its `focus()` does nothing;
- the tab stop moves to the first enabled toggle when the selected toggle is disabled;
- forwarding of `aria-labelledby`;
- the tooltip on keyboard focus;
- `iconType` following a change of content;
- `kbq-selected`, `kbq-disabled` and `kbq-button-toggle-group_stretched`, which only the screenshot baselines show;
- the re-export of `KbqButtonPrefix` and `KbqButtonSuffix` from the module, which no test can tell apart from the plain attribute selectors of the slots;
- one warning per toggle.

## checkbox

Change: `document-checkbox-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The class JSDoc of `KbqCheckbox` says that without a label "you may supply an [aria-label] input". There is no such input: `aria-label` and `aria-labelledby` stay on the host element and do not reach the native input.
2. The JSDoc of `change` says it is emitted "when the checkbox's `checked` value changes". It fires only for a toggle by the user, not for the binding, the property set in code, `toggle()` or a value written by the form.
3. The JSDoc of `indeterminate` says a click sets it to `false` "immediately". It is cleared in a microtask after `change` has fired, and not at all with the `check` or `noop` click action.
4. The "Click action config" section names only the injection token. It does not mention the `clickAction` input, which overrides it, nor that `kbq-toggle` falls back to the same token.
5. The JSDoc of `KbqCheckboxRequiredValidator` speaks of a "template-driven checkbox", but the selector also matches `formControl` and `formControlName`.
6. The overview pages say nothing about:
    - `big`, `labelPosition`, `name`, `value` and `color`;
    - the projected `kbq-hint`;
    - required validation;
    - the lack of an error state of its own.

    The "Multiline" section has no text. The examples tab shows only the `KbqCheckable` "Block checkbox", not `kbq-checkbox`.

7. `checkbox.ru.mdx` writes the indeterminate binding as `` `[indeterminate] =" true "` `` and uses `«[indeterminate]»` quotes instead of code formatting.

**Suspected defects (from reading the code, not reproduced)**

1. A checkbox without label text cannot be given an accessible name: the native input has no `aria-label` binding, and the host's ARIA attributes are not forwarded. axe would report the input as unlabelled.
2. A projected `kbq-hint` sits inside the `<label>`, so its text joins the input's accessible name instead of being its description. There is no `aria-describedby`.
3. With `checked` and `indeterminate` both true, the box shows the mixed mark and the native input is indeterminate, but `aria-checked` is `true`. What assistive technology announces depends on whether the browser honours `aria-checked` on a native checkbox.
4. The checkbox reads only `KBQ_CHECKBOX_CLICK_ACTION`. `kbq-toggle` reads `KBQ_CHECKABLE_CLICK_ACTION` first and falls back to the checkbox token. Providing the shared token therefore changes the toggle and not the checkbox, and providing the checkbox token changes both.
5. The microtask that clears `indeterminate` after a default click writes `false` without checking the current value. If a `change` handler sets `indeterminate` to `true` in code, the microtask overwrites it and still emits `indeterminateChange(false)`.
6. Setting `checked` in code on a form-bound checkbox does not update the control, while `toggle()` does. The checkbox and its control can then disagree until the form writes again.
7. Binding `[clickAction]="undefined"` replaces the token's value with `undefined`, so the token is ignored for that checkbox.

**Tests whose name and body disagree, or that cannot fail**

- "should not toggle `checked` state upon interaction while disabled" clicks the host element. A click on the host never toggles, so the test would pass on an enabled checkbox too.
- "should not set `indeterminate` to false on click if check is set" sets `isIndeterminate` and clicks before change detection runs. The checkbox is not indeterminate at the click, so the test passes with the default action too. The indeterminate half of "should not change `indeterminate` on click if noop is set" has the same problem.
- "should make the host element a tab stop" checks the native input's `tabIndex`; the host is not a tab stop.
- "should trigger a change event when the native input does" carries a comment saying the change event "shouldn't fire", next to an assertion that it fired once.
- "should be in pristine, untouched, and valid states initially" keeps an old `TODO` to test `touched` and `pristine` changes, which was never done.
- "should should not clear previous defined classes" repeats a word. The color tests use `primary` and `accent`, which the checkbox has no styles for.
- The `CheckboxWithAriaLabel` and `CheckboxWithAriaLabelledby` fixtures are imported into the test module but no test renders them. `parentElementClicked` and `parentElementKeyedUp` of `SingleCheckbox` are never read.
- The "focused" state of the e2e `E2eCheckboxStateAndStyle` scenario puts `cdk-keyboard-focused` on the host. The focus style is keyed to that class on the native input, so the baseline shows no focus outline in that column, and the screenshot cannot catch a regression of the focus style.
- No spec runs axe on the checkbox.

**Behaviour without a test.** The spec states these from the source. Some are backed only by core tests that use a test host instead of `kbq-checkbox`; those are marked "core".

- Space toggles the checkbox;
- a click on the host outside the label area does not toggle it;
- the binding or the property set in code does not update the form control;
- bound `checked`, `disabled` and `indeterminate` apply only when their value changes;
- `toggle()` updates the form control (core) and emits no `change`;
- checked and indeterminate together show the mixed mark;
- `change` fires while `indeterminate` is still `true`;
- `indeterminateChange` fires for changes made through the binding or in code, and not for a repeated value;
- the `check` click action keeps `indeterminate` (core);
- the `noop` click action emits no `change` and does not update the form control;
- a bound `undefined` click action ignores the token, and `KBQ_CHECKABLE_CLICK_ACTION` has no effect;
- the form control holds the new value when `change` fires;
- a click on the native input does not propagate to the host;
- a hint declared before the label text is shown under it;
- long label text wraps with the box next to the first line;
- `kbq-empty` without a color;
- no error state of its own;
- the string `"false"` for a boolean input, and valueless `disabled` and `indeterminate`;
- a non-numeric `tabIndex`, and `-1` while disabled (core);
- `focus()` gives keyboard focus with the `cdk-keyboard-focused` class;
- a disabled checkbox ignores clicks and keys (core);
- `formControlName`, and a truthy value written by the form (core);
- required validation with `formControl` and `formControlName`, and the `required` error key;
- the accessible name from the label content;
- the `kbqCheckbox` template reference.

## clamped-text

Change: `document-clamped-text-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The Accessibility section of `clamped-list.{en,ru}.mdx` says that without `kbqClampedListTrigger` the trigger "is not reachable from the keyboard". Every example's trigger is an `<a kbqLink pseudo>`, which `KbqLink` already makes a focusable `role="button"` activated by Enter and Space. What is lost without the directive is `aria-expanded` and `aria-controls`.
2. The JSDoc of `KbqClampedList.visibleItems` says the list is truncated "to `minVisibleCount`". There is no such input; it is `collapsedVisibleCount`.
3. The JSDoc of `KbqClampedList.isCollapsed` describes "`undefined` = expanded", but the model is typed `boolean`.
4. The JSDoc of `KbqClampedText.isCollapsed` says it is written "when the user operates the toggle", and the "External state control" section says a user action is "the only thing that travels back". A `toggle()` call from code also writes it and emits `isCollapsedChange`.
5. The JSDoc of `rows` ("Max rows before text is clamped") and of `isCollapsed` (`true` = collapsed) leave out that nothing collapses until the content exceeds `rows` + 1 lines.
6. The `KbqClamped` interface, shared by both containers, documents `toggle()` as toggling "the collapsed state of the list". The `@see {KbqClampedText, KbqClampedList}` on `kbqInjectClampedTextLocaleConfiguration` is not a valid `@see` target.
7. Examples:
    - `clamped-list` and `clamped-list-dotted` render the separator only while `hasToggle()` is true, so a list that fits shows no separators, and the last visible item keeps one before the trigger;
    - `clamped-list-overview` declares a `collapsed` signal it never uses, and on expanding moves focus to the first item of the list rather than to the first item that was revealed.

**Suspected defects (from reading the code, not reproduced)**

1. The content is measured only when the content box changes size. A change of `rows`, or of the projected text, that leaves the box the same size is not measured. Expanded 20-line text whose `rows` grows to 30 probably keeps a toggle that changes nothing. Collapsed text whose content shrinks to `rows` + 1 lines probably keeps its toggle as well.
2. The trigger toggles on every Enter or Space keydown, auto-repeat included. Holding a key probably flips the state on each repeat, while a native button fires once. `KbqLink` guards against the repeat, but it never sees the event, because the trigger has already prevented its default.
3. Lines are counted from the line boxes of an inline wrapper around the projected content. Block-level content, such as several `<p>`, probably counts as fewer lines than it renders, so long block content may get no toggle.
4. With `hiddenThreshold` at 0 or below, `hasToggle()` is true when nothing is hidden, and the list's trigger would read "Show 0 more".
5. The toggle of `kbq-clamped-text` changes its accessible name between "Expand" and "Collapse" while also exposing `aria-expanded`, so a screen reader announces the state twice. This is a design question rather than a clear defect.

**Tests whose name and body disagree, or that cannot fail**

- `clamped-list.spec.ts` "should keep an id the host already carries" renders a host without an id and only checks that some id exists. The generated id is tested; keeping an existing id is not.
- The test host of `clamped-list.spec.ts` binds `collapsedVisibleCount` to 10 and `hiddenThreshold` to 6 and never changes them, so neither the defaults nor other values are tested. The `rows` default is untested the same way: the hosts bind 5 or `kbqClampedTextDefaultMaxRows`.
- The `measure` helper in `clamped-text.spec.ts` explains its extra wait by "a timer scheduled outside the Angular zone"; the suite runs without zone.js.

**Behaviour without a test.** The spec states these from the source:

- the default `rows` of 5 and `rows` given as a string;
- `isCollapsed = true` on content that fits;
- the server-rendered state;
- `debounceTime`, and a resize that makes the toggle appear;
- the text and icons of the built-in toggle (only an `en-US` screenshot shows them);
- expanding never scrolls;
- click and keydown propagation stopped by a trigger;
- the list defaults `collapsedVisibleCount` 10 and `hiddenThreshold` 6;
- `exceededItemCount` and `showMoreCountText` (only a screenshot shows "Show 7 more");
- `[(isCollapsed)]` and `isCollapsedChange` on the list;
- a list host keeping the id written on it;
- a trigger without a toggle reporting `aria-expanded="true"`;
- a written `role` or `tabindex` winning on a trigger;
- a trigger outside any container;
- switching the locale, `[localeOverrides]` and `KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION` (the provider is shown only by screenshots);
- the `kbqClampedText` and `kbqClampedListTrigger` template references and `KbqClampedTextModule`.

## code-block

Change: `document-code-block-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Changing the block height" section (EN and RU) says the line wrap toggle is unavailable in the collapsed state. The toggle is rendered and works whatever `viewAll` is.
2. The download section says the default extension is _txt_. The block suggests the bare name (`filename` or `code`) and only sets the blob type to `text/plain`; any extension comes from the browser.
3. The English page says "Languages are loaded lazily on first use", which reads as one load per language. Every configured language is loaded together with the core on the first highlight under that configuration. The Russian text, "on first use of the component", matches the code.
4. The JSDoc of `KbqCodeBlockFile.filename` and `.language` says a missing value "will be set to" the fallback token. The file object is never changed; the fallback is only used for the tab label, the download name and highlighting.
5. The JSDoc of `softWrap` says "Whether sequences of whitespace should be preserved". Whitespace is preserved either way; the input controls line wrapping. The JSDoc of `toggleSoftWrap()` says lines wrap when they exceed the height of the component; it is the width.
6. The JSDoc of `hideTabs` sends readers to `tabsHidden`, which is `@docs-private` and hidden from the API tab. The JSDoc of `hideTabsChange` promises two-way binding, but the output is never emitted.
7. The line numbers section does not say that content of a single line never shows a number.
8. The action panel section describes only hover for hidden tabs and says nothing about keyboard users (see defect 1).
9. `startFrom` and `singleLine` are public inputs of the exported `KbqCodeBlockHighlight`, but `kbq-code-block` never binds them, so a block always numbers from 1 and never numbers a single line.

**Suspected defects (from reading the code, not reproduced)**

1. With tabs hidden, which includes every block with a single unnamed file, and without `alwaysShowActionbar`, the action bar is `display: none` until the pointer hovers. Nothing reveals it on keyboard focus, so keyboard and screen reader users cannot reach copy, download, soft wrap or the link.
2. `hideTabsChange` is declared but never emitted, so `[(hideTabs)]` never writes back.
3. The copy tooltip sits on a wrapper `<div>` that never receives `focus`, so keyboard users see neither "Copy" nor the "copied" confirmation. The button's `aria-label` stays `copyTooltip`, so a successful copy is not announced.
4. `openLink()` calls `window.open(url, '_blank')` without `noopener`, so the opened page gets `window.opener`. A URL the sanitizer rejects is still opened, as `unsafe:…`.
5. `downloadCode()` never revokes the object URL it creates, and clicks an anchor that is not attached to the document.
6. With `maxHeight` set and code that fits vertically but overflows horizontally, the code area scrolls but keeps `tabIndex` -1, so keyboard users cannot scroll it.
7. A negative `maxHeight` sets no limit, but the overflow measure treats any non-zero value as one, so "Show all" appears over code that is not clipped.
8. Enter on "Show all" decides whether to move focus before the expanded layout renders, so expanding always moves focus to the code area, which then gets `tabIndex` -1 when the expanded code no longer scrolls.
9. With tabs hidden, the code area keeps `role="tabpanel"` with no tab list and no accessible name. With one named file, the only tab has `aria-selected="false"` and no tab stop, and the panel has no `aria-labelledby`.
10. The "Show all" button exposes its state only through its text, with no `aria-expanded`.
11. With an empty `files` list, the tab bar renders without tabs and the copy button stays, doing nothing.

**Tests whose name and body disagree, or that cannot fail**

- "should toggle softWrap property by click" asserts only that `toggleSoftWrap` was called twice; `softWrap` and `softWrapChange` are never checked.
- "should toggle viewAll property by click" and "should toggle viewAll property by ENTER keydown" only spy on `toggleViewAll`; `viewAll`, `viewAllChange` and the focus move are not checked.
- "should copy code content by click" spies on `copyCode` without checking the clipboard or the tooltip. "should open link by click" does not check `window.open`, and "should download code content by click" does not check the file name or type.
- "should not re-emit hideTabsChange on every files assignment" cannot fail: nothing emits `hideTabsChange`.
- "should apply lineNumbers plugin" runs with `lineNumbers` off; what it shows is that the numbered rows are built regardless.
- "should hide lineNumbers" and "should outline the code block" set the input to its default and assert the default class.
- "should show viewAll button when content overflows maxHeight" exists twice with the same body, at the top level and under "viewAll button visibility".
- "should show actionbar on mobile devices" mocks iOS and Android as both true, so neither platform is covered alone.
- "should display copy button" binds `canCopy` to `false` first, so no unit test covers the default `true`.
- "should provide custom locale configuration" snapshots a protected member instead of the rendered strings.
- The e2e "states" test fakes the hover state by adding `kbq-code-block_show-actionbar` to two blocks, so its screenshot does not exercise hover.

**Behaviour without a test.** The spec states these from the source, or from a screenshot only:

- copying and downloading doing nothing on an empty `files` list;
- the illegal-characters and language-mismatch warnings;
- a single-line file showing no number (the numbering from 1 is visible only in the screenshot);
- the header shadow (screenshot only);
- a `maxHeight` of zero or less;
- the collapsed block being clipped without scrolling and out of the tab order;
- `viewAllChange`, the scroll to the top on collapse, `viewLessText` and the focus move on Enter;
- `softWrapChange` and the toggle's icon, name and tooltip;
- `kbqCodeBlockFallbackFileNameProvider()` and `kbqCodeBlockFallbackFileLanguageProvider()`;
- the tab of a single named file;
- switching tabs by click or keyboard, `activeFileIndexChange` and the scroll to the top;
- the clipboard content, the "copied" tooltip, the download name and type, and `window.open`;
- `cdk-keyboard-focused` on the code area;
- the `aria-label` of the action buttons and the tab roles;
- switching the locale and `[localeOverrides]`;
- the string `"false"` on boolean inputs;
- writing the state signals in code;
- the `kbqCodeBlock` template reference.

## content-panel

Change: `document-content-panel-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `disableClose` says the panel "can not be closed by clicking on the close button or pressing the ESCAPE key". It removes the close button rather than disabling it, and `close()`, `toggle()` and the `opened` input still close the panel.
2. The JSDoc of `openedChange` says it emits "when the content panel opened state is changed". It does not emit when the state comes from the `opened` input or from restored state.
3. The JSDoc of `saveState()` says it is "called whenever the panel is opened, closed or resized". It is not called when the panel opens or closes through the `opened` input, or when the `width` input changes.
4. The "Keyboard interaction" section says Escape closes the panel "by default". It does so only while focus is inside the container, and `disableClose` turns it off too, which the section does not say.
5. The "State Saving" section says `width` "is always restored" and "the persisted one wins over it". That holds on initialization only: a later change of the `width` input replaces the restored or dragged width, and the new width is not written.
6. `disableCloseByEscape` has no `@default`. Its default is read from `disableClose()` once, while the container is constructed, so it is always `false` and does not follow `disableClose`. There is no visible effect, because Escape checks both inputs.
7. The overview page opens with `KbqContentPanel`, but the opened state, the widths, state saving and Escape all live on `kbq-content-panel-container`.
8. These have no place in the docs pages:
    - `[(opened)]`, `openedChange` and `isOpened`;
    - `disableClose` and `disableResizer`;
    - drag resizing itself, which only appears inside the state-saving section;
    - the units and defaults of the width inputs (pixels; 480, 640, 800);
    - `saveState()` and `hasSavedState`;
    - the aside, the header actions, the extra header content and the footer;
    - `localeOverrides` on the header.
9. `examples.content-panel.{en,ru}.mdx` are "Documentation in progress" stubs, and `structure.ts` sets `hasExamples: false`, so the pages exist but are never routed.

**Suspected defects (from reading the code, not reproduced)**

1. The content margin is computed from the unclamped width. When `width` lies outside `minWidth` to `maxWidth`, or a double click resets to such a `width`, CSS clamps the panel but the main content keeps a margin of the unclamped width plus 16 px, leaving a gap or an overlap.
2. A container that is not attached to the document when it initializes, such as one inside an overlay that attaches later, never restores or writes its state, even with an explicit `stateSavingKey`. The container skips the read before the shared directive can warn, so the core warning that suggests a key never appears.
3. Turning `useStateSaving` on after initialization never starts persisting: nothing was read, so the shared directive refuses every write, and a key change does not trigger a read either. The container has to be created again.
4. `clearSavedState()` does nothing while `useStateSaving` is `false`, so the entry a panel left behind cannot be removed through the panel once state saving is turned off.
5. The panel exposes nothing to assistive technology: it has no role and no accessible name, and the open state is not announced. Opening does not move focus into the panel, and closing with the close button drops focus to `<body>` instead of returning it to where the panel was opened. No axe check renders the panel.
6. The resize handle has no `role="separator"`, no `tabindex` and no keyboard alternative, so the width cannot be changed without a pointer.
7. An application that tracks the state through `(openedChange)` alone, without binding `opened`, is not told when a restored state opens the panel.
8. Layout is fixed to the right edge (`right: 0`, `margin-right`, a resizer that grows to the left). Nothing adapts to `dir="rtl"`, and there is no RTL screenshot.

**Tests whose name and body disagree, or that cannot fail**

- "should open/close panel by two-way binding" sets the host's model and reads the same model back. It never looks at the container or the DOM, so it cannot fail.
- "restores the width but not the opened state while the application drives it" asserts only `isOpened()`; the width is never checked.
- "should open panel by KbqContentPanelContainer instance" repeats the second half of "should open/close panel by KbqContentPanelContainer instance".
- The three Escape tests share one module-level `KeyboardEvent` that neither bubbles nor can be cancelled, dispatched on the container itself. They cannot observe the `preventDefault()` and `stopPropagation()` the container calls.
- The three e2e "overflow shadow" tests assert only that a shadow appears, never that it is absent at the top or the bottom.

**Behaviour without a test.** The spec states these from the source:

- the projection order, the dropped loose content of `kbq-content-panel` and the extra header row;
- the content margin and the panel position (seen only in the `01-light` and `01-dark` screenshots);
- panel content existing before the first open and surviving a close (relied on by `E2eAccordionContentPanel`, not asserted by the panel's own tests);
- `kbq-content-panel-container__opened`, the export names and the no-provider error for a header or footer outside its parents;
- `openedChange` staying silent for unchanged state, input changes and restores, and local changes outlasting an unchanged binding;
- `close()` and `toggle()` closing the panel despite `disableClose`, and the close button's `type="button"`;
- focus not being moved on open or close;
- the defaults of `minWidth` and `maxWidth`, a change of `width` after initialization (exercised but not asserted by `E2eAccordionContentPanel`), drag resizing and its bounds, `disableResizer`, the double-click reset and the handle not being focusable;
- `KBQ_STATE_SAVING_ENABLED` as the default of `useStateSaving`, the 300 ms write after a drag, the immediate write after a reset, inputs not being written, clamping a restored width to `minWidth`, `clearSavedState()` and `hasSavedState` while state saving is off, a key change and a detached container;
- Escape from inside the panel, `preventDefault()` and `stopPropagation()`, and Escape on a closed panel;
- the body filling the space between header and footer, and the absence of shadows at the edges;
- the motion and its three switches;
- the close button's `aria-label` and `localeOverrides`.

## datepicker

Change: `document-datepicker-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `panelClass` promises classes for "the date picker panel" with "the same syntax as the `[class]` binding". The type is only `string | string[]`, and the classes land on the inner `kbq-calendar` element, not on the overlay pane.
2. The JSDoc of `yearSelected` and `monthSelected`, on `KbqDatepicker` and on `KbqCalendar`, refers to a "multiyear view" and a "year view". The calendar has only a month view, and both outputs fire from the header's year and month lists. The JSDoc of `KbqCalendar.activeDate` mentions keyboard navigation, which the calendar does not have.
3. The JSDoc of `dateInput` says it emits on an `input` event. The directive does not listen to `input`; it emits when typing, pasting or emptying the text changes the value to a different day. The JSDoc of `dateChange` mentions only the `change` event; it also fires for calendar picks and for Up/Down stepping.
4. The JSDoc of the input's `valueChange` says it emits on any change. It compares by day, so a write that changes only the time emits nothing.
5. The overview page presents `minDate` / `maxDate` as restricting the calendar only. They also bound Up/Down stepping in the input.
6. The `datepicker-inactive` example:
    - labels its second field "Read-only field with data", but disables it;
    - binds `[placeholder]="''"` on the first field, which the input treats as unset, so the locale placeholder still shows.
7. The `datepicker-range` example declares `minDate` and `maxDate` and never binds them; its two fields are not linked.
8. `labelMinRequiredCells` and `cellAspectRatio` of `KbqCalendarBody` are documented inputs with no effect: the blank cell renders whenever the first row is short, and the cell padding is hard-coded to `0`. The template comment says the blank cell is `aria-hidden`; it is not.
9. The calendar's single-input error names `KbqDatepicker`. The missing-input error reads "Attempted to open an KbqDatepicker".

**Suspected defects (from reading the code, not reproduced)**

1. The calendar cannot be used from the keyboard:
    - days, header buttons and the month and year select hosts have `tabindex="-1"`;
    - days handle no keys, and Tab in the input closes the calendar;
    - the toggle is not focusable: its icon has `tabindex="-1"`, and its host has neither `role` nor `tabindex`.

    Only the native `<button>` triggers of the month and year lists are focusable, which is inconsistent with the rest. The skipped unit test for Enter documents part of this.

2. ARIA gaps that no axe test covers:
    - the input has no `aria-haspopup`, `aria-expanded` or `aria-controls`;
    - `aria-expanded` sits on the toggle host, which has no role;
    - day cells have no `gridcell` role, `aria-selected` or `aria-disabled`;
    - the table has no accessible name.
3. A read-only input still opens from the toggle icon, which calls `open()` rather than `toggle()`. A day picked there writes the read-only input.
4. `monthSelected` and `yearSelected` seem to carry the previously shown date. The calendar re-emits its own `activeDate` before the header's `activeDateChange` has updated it.
5. Typing a lone first part after selecting the whole text:
    - in a day-first format, the month becomes January;
    - in a year-first format (`yyyy-MM-dd`), the month shifts back by one, because a 0-based month from the current value or today is passed where a 1-based one is expected.
6. Separators:
    - the format's own separator is rejected as typed text, while other punctuation after digits completes the part;
    - `onPaste` discards the result of a `replace()` meant to normalize separators.
7. An unusable `dateInput` format builds an `Error` that is never thrown.
8. The form control's `valueChanges` subscription stores the raw control value as the input's `value()`. An ISO string bound through `ngModel` stays a string (skipped unit test), and an invalid date is kept as is.
9. No `input` event is handled:
    - text deleted with Backspace or Delete reaches the model only on the next handled key or on blur;
    - Left, Right, Home and End are prevented and do nothing while the input has no value, so the caret cannot move in a partly typed empty field.
10. Unparseable text usually keeps the previous model value and only adds `kbqDatepickerParse`. Three groups of non-digits instead set the model to `null` on blur.
11. Calendar header:
    - its default minimum is February 1900 (`createDate(1900, 1)`), so January 1900 is out of reach;
    - when `minDate` and `maxDate` fall in the same year, the months after `maxDate` stay enabled in the month list;
    - it ignores a `minDate` or `maxDate` that becomes unset and keeps the old year list and button limits.

**Tests whose name and body disagree, or that cannot fail**

- "should emit VALID via statusChanges on blur" asserts that blur emits nothing.
- "should change selected year in calendar if input year is less than MIN": the typed 2014 is after `min` (2010), and the datepicker has no `minDate`. It checks that the year trigger follows the typed value.
- "should not reopen if the browser fires the focus event asynchronously" cannot fail:
    - it writes `_focusedElementBeforeOpen`, which the datepicker no longer has;
    - it focuses an input that already has focus, so no focus event fires.
- "clicking the currently selected date should close the calendar without firing selectedChanged" never checks that the calendar closed.
- "should reset the datepicker when it is closed externally": its comment promises a stubbed close scroll strategy that triggers a detachment. It clicks the body instead and repeats the outside-click test, so closing on detachment is untested.
- In the `a11y` block of `calendar.spec.ts`, two tests dispatch Enter on a body that handles no keys, so `selected` stays `undefined` whatever the code does:
    - "should not allow selection of disabled date in month view";
    - "should allow entering month view at disabled month", which also names a year view that does not exist.

    The `focus` events in its `beforeEach` do nothing.

- "places label in first row if space is available" (`calendar-body.spec.ts`) names a condition that `labelMinRequiredCells` never applies.
- "open non-touch should open popup" names a touch mode that does not exist.
- Three skipped tests document known defects: Enter in the calendar, ISO strings through `ngModel`, and the `de-DE` locale throwing in the adapter.

**Behaviour without a test.** The spec states these from the source:

- Tab closing the calendar, and `toggle()` ignoring a read-only input;
- `hasBackdrop` and `backdropClass`;
- the end-aligned fallback positions and the locked position;
- following page scroll, and a strategy provided through `KBQ_DATEPICKER_SCROLL_STRATEGY`;
- `panelClass` and the calendar element's `id`;
- `dateClass` bound on the datepicker (the month view test binds it directly);
- in the calendar header:
    - the current date button;
    - the month and year lists: their range, the disabled months, `monthSelected` and `yearSelected`;
    - the accessible names of the buttons;
- the weekday `aria-label`;
- letters and punctuation rejected with `incorrectInput`, and the validation tooltip;
- clamping of typed parts and short years read on blur;
- Up/Down stepping, Space, Right, Home, End, PageUp and PageDown;
- pasting text with letters or with separators other than the format's;
- writes from code emitting neither `dateInput` nor `dateChange`, and `valueChange` comparing by day;
- ISO strings for `[value]`, `min` and `max`;
- `disabledChange` and the blur on disabling;
- the input's `id`, `autocomplete`, `min` / `max` attributes and classes;
- the form field's type class and container click;
- the toggle's `aria-expanded`, its stopped click propagation, its own `disabled` and the muted sibling tooltip;
- `[localeOverrides]` on the input and on the datepicker;
- re-rendering on a locale or time zone change;
- `input[kbqCalendar]`, exercised only through the filter-bar date pipes.

## divider

Change: `document-divider-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Length" section says a divider "takes its length from the layout around it". A vertical divider only does so in a container with a definite height (its height is `100%`), and a horizontal one only in a block container. See suspected defect 1.
2. The JSDoc of `decorative` says a decorative divider is "hidden from assistive technology". The code sets `role="presentation"`, which hides only a bare divider: ARIA's conflict resolution ignores `presentation` once the element gets a global ARIA attribute such as `aria-label`, or becomes focusable.
3. The "Spacing" section does not say that `paddings` adds margins, so a consumer's own `margin` replaces the spacing. Both docs examples set `style="margin: 20px"`, so the page never shows the default spacing.
4. `examples.divider.en.mdx` and `examples.divider.ru.mdx` are "documentation in progress" stubs, while `structure.ts` sets `hasExamples: false` for the divider, so they are never routed.

**Suspected defects (from reading the code, not reproduced)**

1. A vertical divider without `length` in a container with no definite height gets a height of `auto`, and an empty element is then 0 px tall, so the line disappears. A horizontal divider in a flex row shrinks to 0 px wide the same way.
2. A negative `length` is a finite number, so it passes the parser and is written as, for example, `-5px`. Browsers reject a negative `width` or `height`, so the divider silently falls back to its layout length.
3. The divider always writes `role`, so a `role` the caller puts on the element is replaced by `separator` or `presentation`. A caller's `aria-orientation` is removed from horizontal and decorative dividers in the same way.

**Tests whose name and body disagree, or that cannot fail**

- "should drop a decorative divider out of the accessibility tree" asserts only `role="presentation"`; jsdom has no accessibility tree to check.
- No test was found that cannot fail.

**Behaviour without a test.** The spec states these from the source:

- content inside `<kbq-divider>` is not rendered;
- the divider is not focusable and has no outputs or interaction;
- `"false"` coerced to `false` for `vertical` and `decorative` (only `paddings="false"` is tested; all three share the same transform);
- an empty string or `null` for `length` meaning no length (only `"tall"` is tested);
- the default length: a block-width horizontal divider and a 100% tall vertical one (the e2e screenshot shows it but asserts nothing about sizes);
- the spacing margins on the cross axis (shown only by the e2e screenshot);
- a runtime change of `paddings` or `decorative` (only a change of `vertical` is tested).

## dl

Change: `document-dl-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Small (adaptive)" section shows `dl-small`, which is the `dl-overview` example under another name: nothing in it is smaller.
2. The English page shows four examples (`dl-overview`, `dl-small`, `dl-horizontal-overview`, `dl-vertical-overview`) whose terms and descriptions are in Russian.
3. The overview page leaves out:
    - `verticalBreakpoint`, its 400 px default, and the switch happening at or below it, about 100 ms after render;
    - `verticalAlign` and `horizontalAlign`;
    - the keyboard (Home, End, arrows) and the double-click on the separator;
    - `resizerAriaLabel` and `[localeOverrides]`;
    - that unset minimums default to the first term's rendered width, so by default the term column can only grow, and that `ddMinWidth` also defaults to the term's width, not a description's;
    - that `dtWidth` sets a fixed term width without `resizable`.
4. The JSDoc of `dtWidth` says a drag or a double-click sets it. The keyboard and the clamps after a resize or a minimum change set it too, and emit `dtWidthChange`.
5. The JSDoc of `wide` calls it "the wide two-column layout". The default layout also shows two columns; `wide` makes them equal.
6. `KbqDlComponent`, `KbqDtComponent`, `KbqDdComponent` and `KbqDlModule` have no JSDoc. The protected getters `maxDtWidth` and `currentDtWidth` lack the `@docs-private` the other protected members carry, so they appear in the golden file as `(undocumented)`.
7. `examples.dl.en.mdx` and `examples.dl.ru.mdx` are "documentation in progress" placeholders that no route shows: `structure.ts` sets `hasExamples: false`.

**Suspected defects (from reading the code, not reproduced)**

1. `kbq-dl`, `kbq-dt` and `kbq-dd` carry no role, and they are not native `dl`, `dt` and `dd` elements. Assistive technology gets a flat run of text with no term–description relation (WCAG 1.3.1).
2. Restoring the default column ratio is only possible with a double-click. The keyboard reaches the minimum and the maximum but has no way to set `dtWidth` back to `null` (WCAG 2.1.1).
3. A `dtWidth` bound after the first measurement is not clamped when it arrives. It is clamped only at the next change of the list's size, which a reflow of its height may or may not cause, or of a minimum. Until then the grid column takes the raw value while the separator is held at the bound, and `aria-valuenow` reports the separator, not the column.
4. A drag writes the raw pointer width onto the separator's track. After a drag that ended past a bound, a later lower minimum or wider list can leave the separator away from the column border until the width changes again.
5. The default minimums are measured once, right after the first render, from the first `kbq-dt`:
    - a list first rendered hidden, or with terms that arrive later, keeps a minimum of 0;
    - a list first rendered with `vertical` true measures a full-width term, so when it later turns horizontal and resizable, the term column takes the whole row.
6. The second double-click sets the `col-resize` cursor without checking the bounds. When there is no room, or when the default minimum equals the resting width, the cursor disagrees with the "Separator cursor" rules until the next resize.
7. An unparsable `verticalBreakpoint` becomes `NaN`, so the automatic layout always stays horizontal.
8. A narrow list in automatic mode renders horizontally for its first 100 ms and then jumps to the vertical layout. On the server it is always horizontal, so a hydrated narrow list shifts layout. The spec states this as shipped.

**Tests whose name and body disagree, or that cannot fail**

- "should apply the col-resize cursor to the separator at rest" checks the initial value before any measurement. In a browser, a resizable list without minimums rests at its minimum and shows `e-resize`.
- "should resize the first column with keyboard and expose separator semantics": the list is 0 px wide in jsdom, so the minimum and maximum are both 96 and ArrowRight only proves the clamp.
- "should keep the col-resize cursor while the width is between the bounds" would pass if the key did nothing: `col-resize` is the initial cursor.
- "should update the shared dt width on pointer drag" renders one list; nothing is shared.
- "should expose the dt min width as a CSS variable so the resting grid honors it" checks only the custom property, not the grid.
- "should use start alignment by default" expects the class to be exactly `kbq-dl`. That holds only because the 100 ms measurement has not run; afterwards jsdom's 0 px width adds `kbq-dl_vertical`.
- The e2e "should resize the first column with the keyboard" asserts the width with `toBeGreaterThanOrEqual(startWidth)`, which passes when nothing moves; only the class assertion can fail.

**Behaviour without a test.** The spec states these from the source:

- the vertical layout at a width equal to `verticalBreakpoint`;
- the horizontal layout before the first measurement and on the server, and the 0 px measurement of a hidden list;
- the `kbq-dl_resizable` host class;
- `dtWidth` applying without `resizable` and being kept in the vertical layout;
- `dtWidthChange` on a drag, a key and a clamp, its silence on a consumer's binding, and the width shared through `[(dtWidth)]`;
- the clamp after a resize and after a change of `dtMinWidth` or `ddMinWidth`;
- the default of `ddMinWidth`, and Home keeping the initial width of a list without minimums;
- `aria-valuemax`;
- the 8 px step and ArrowLeft in a left-to-right list, keys other than Home, End, ArrowLeft and ArrowRight being left alone, and the default action of the double-click being prevented;
- a change of direction at runtime, and the mirrored pointer drag in a right-to-left list;
- `[localeOverrides]` and an empty `resizerAriaLabel` falling back to the locale;
- the wrapping of long text.

## dropdown

Change: `document-dropdown-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. "Menu Search" says search splits a multi-word query, trims it, ignores case and folds diacritics. The panel does not filter at all; that is `createSearchPredicate` in the `dropdown-with-filter` example.
2. "Panel width" says panels that overlap the trigger vertically are not matched to the trigger. Only panels with `overlapTriggerY` set and `overlapTriggerX` unset are; with the default `overlapTriggerX: true` an overlapping panel is still matched.
3. "Panel width" tells consumers to set `KbqDropdownTrigger.widthOrigin`, whose JSDoc carries `@docs-private`, so the API tab hides it.
4. "Progress state" says `progress` can be combined with `disabled` "to also prevent interaction", implying `progress` alone keeps the item interactive. The item overlay already swallows pointer clicks on an item in progress (see suspected defect 3).
5. The JSDoc of `panelMinWidth` says the panel is never narrower than its trigger. Nested panels, panels with `overlapTriggerY` set and `overlapTriggerX` unset, and panels anchored to a caret rectangle are not sized against the trigger.
6. The JSDoc of `closed` says it is emitted "when the dropdown is closed". It also fires when `close()` is called on a panel that no trigger has open, and its reasons, including no value for a backdrop or outside click, are not documented anywhere.
7. The JSDoc of `hasBackdrop` does not say that nested panels never get a backdrop. `navigationWithWrap` has no JSDoc at all.
8. The `yPosition` error reads "must be either 'above' or below'." with a misplaced quote, and the JSDoc of the internal helper that throws the `xPosition` error lists only `'before'` and `'after'`.
9. These have no text on the dropdown pages; they appear only in examples or nowhere: `kbqDropdownTriggerData` and `kbqDropdownContent`, `navigationWithWrap`, `openByArrowDown`, `kbqDropdownItemCaption` and `kbqDropdownGroupHeader`, `kbqDropdownStaticContent`, `kbqDropdownTriggerRestoreFocus`, `offsetX` and `offsetY`, `overlapTriggerX` and `overlapTriggerY`, `hasBackdrop` and `backdropClass`, `KBQ_DROPDOWN_SCROLL_STRATEGY` and typeahead.

**Suspected defects (from reading the code, not reproduced)**

1. A partial `KBQ_DROPDOWN_DEFAULT_OPTIONS`, such as `{ safeArea: false }` for the global configuration the docs describe, leaves `xPosition` undefined. Validation skips the default, and opening then fails on the positions table: no position matches `undefined`, so the destructuring throws a `TypeError`.
2. An explicit `panelWidth` is ignored on nested panels and on panels with `overlapTriggerY` set and `overlapTriggerX` unset, because the pane size is applied only to panels matched to the trigger. The CSS minimum still drops to `0px` for an explicit width, so such a panel ends up content-sized with no floor.
3. On an item in progress, the full-size item overlay stops pointer clicks before they reach the item, so its handlers do not run and the panel stays open. Enter or Space on a native `button` host is not intercepted and still clicks it.
4. The 8 px horizontal shift of a nested panel is not mirrored for right-to-left layouts: the panel overlaps its trigger item in left-to-right layouts but leaves an 8 px gap in right-to-left ones. When it falls back on both axes, the shift turns back to 8 px left, which leaves a gap in left-to-right layouts too. The Playwright tests assert the right-to-left gap as expected.
5. `offsetY` and `offsetX` set on the trigger are applied as given to the fallback positions too, so an offset that opens a gap below the trigger pushes a panel that falls back above it down into the trigger.
6. Changing `xPosition` or `yPosition` while the panel is open moves the position classes at once but not the panel, so the classes can name a side the panel is not on until it opens again or `updatePosition()` is called.
7. `navigationWithWrap` is read once, when the key manager of the current mode is built. A later change is ignored, and a panel whose search field appears later builds its second manager with the value of that moment, so the two modes can disagree.

**Tests whose name and body disagree, or that cannot fail**

- "should close the dropdown when a click occurs outside the dropdown" clicks the backdrop. No unit test clicks outside a panel without a backdrop; only a context-menu event and an auxiliary-button click on the trigger are covered.
- "should restore focus to the trigger when the dropdown was opened by keyboard" and "should set the proper focus origin when restoring focus after opening by keyboard" open with a click that has no mouse press before it, which is the `program` origin, and the second asserts `cdk-program-focused`.
- "should close immediately on a sibling hover when disabled (default)": the fixture turns `safeArea` off, while the component's default is on.
- "should honor a `safeArea: true` default without setting the input explicitly" cannot fail: `true` is also the built-in default.
- The "fallback positions" and "overlapping trigger" tests, and "should open above trigger when yPosition is above and there is space above", compare `getBoundingClientRect()` values that jsdom reports as zero, so they cannot fail.
- "should scroll the panel to the top on open, when it is scrollable" cannot fail: jsdom never scrolls, so `scrollTop` is always 0.
- "does not close when a scrollbar gesture produces a panel click" dispatches the click on the panel, an ancestor of the content element where closing is bound, so it cannot reach the close handler.
- "should not emit an event when a disabled dropdown item is clicked" clicks a disabled `button`, which jsdom, like a browser, does not dispatch the click to, so the item's own guard is probably never exercised.
- The two "with KbqTitle directive" unit tests assert that no tooltip appears; jsdom measures no overflow, so they probably cannot fail. The positive cases live in the Playwright suite.
- "should close the initial dropdown if the user moves away while animating": the panel has no animation.
- "should navigate by active descendant without a search field" asserts only the `@docs-private` `inSearchMode()` signal, not a highlight or focus.
- The comment in "should close the dropdown when using the CloseScrollStrategy" says `KbqDropdownModule` declares its own provider for `KBQ_DROPDOWN_SCROLL_STRATEGY`. The module has no providers; the token has a root factory.

**Behaviour without a test.** The spec states these from the source, or rests them on a test listed above that cannot fail:

- a second click on a top-level trigger closing the panel, Space on the trigger, and `openByArrowDown` set to `false`;
- `openedChange`, and the trigger on a disabled native button;
- no value in `closed` for an outside click, and a plain outside click without a backdrop closing the panel;
- a click on a group header, a divider or another non-item element of the content closing the whole chain, which may be unintended;
- Escape not propagating past the panel;
- repositioning on scroll with the default strategy;
- the item list scrolled to the top on opening;
- `kbqDropdownTriggerRestoreFocus` set to `false`, and Escape or the arrow key back returning focus to the trigger item of a panel without a search field;
- stopping at the ends without `navigationWithWrap`, and `navigationWithWrap` itself;
- a disabled item ignoring hover in a panel without a search field;
- `progress` leaving `aria-disabled` and `tabindex` alone, and an inactive action getting its `tabindex` back;
- Space on a nested trigger item, `kbq-dropdown__panel_nested`, and the shift of a nested panel that falls back on both axes;
- `safeArea: false` through `KBQ_DROPDOWN_DEFAULT_OPTIONS`;
- a nested panel of a search panel taking no focus on opening;
- the highlight and the missing `aria-activedescendant` of `activeDescendantNavigation`;
- the panel moving only on its next opening after a position input changes, and the `yPosition` error;
- the top-level fallback positions, `overlapTriggerX`, and the `offsetX` and `offsetY` inputs;
- `panelMaxWidth` and the 640 px cap of the width token;
- `kbqDropdownStaticContent`;
- the defaults of `KBQ_DROPDOWN_DEFAULT_OPTIONS` other than the position and overlap ones.

## dynamic-translation

Change: `document-dynamic-translation-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `text` says "The text which will be translated". The component translates nothing; the docs page itself says the string arrives already translated.
2. `KbqDynamicTranslationHelper` and `KbqDynamicTranslationHelperSlot` are marked `@docs-private`, so the API tab hides them and their inputs have no description, yet the examples tab builds its second example on them.
3. The examples heading "Dynamic component creation" and the example title promise component creation. The helper creates plain DOM elements by tag name: a component selector given as `tag` produces an inert element.
4. The syntax section presents `[[<slotName>:<context>]]` as if the context were required. `[[slotName]]` works and gives the template `undefined`.
5. The docs do not say that:
    - a marker with an unknown name stays in the output as literal text;
    - list items keep the spaces after the commas;
    - a context cannot hold `]]` or a line break;
    - a slot template has to be a direct content child of `kbq-dynamic-translation`.
6. The dynamic-component-creation example attaches the created component to `ApplicationRef` and never detaches or destroys it.

**Suspected defects (from reading the code, not reproduced)**

1. Slot names go into a regular expression without escaping. With a slot named `a.b`, `[[axb]]` is taken as a marker and renders nothing; a name containing `|` splits into two alternatives that match no template; an unbalanced `(` or `[` in a name makes rendering throw a `SyntaxError`.
2. With no slot template registered, for example when every slot sits in a false `@if`, the pattern has an empty alternative: `[[]]` and `[[:text]]` disappear from the output instead of staying as text.
3. `[[name:]]` is not a marker on its own, but when a later `]]` follows, the context runs on to it and swallows the text and markers in between: `[[a:]] x [[b:y]]` renders one `a` slot with the context `]] x [[b:y`.
4. A line break inside a context, which longer translations can contain, leaves the whole marker as literal text.
5. `()` gives a template written for a list the string `()` instead of an empty array.
6. The helper replaces its placeholders once. After a later change to `text`, the created elements keep their first text, markers new to the text render as empty placeholder `span` elements with `data-slot-name` and `data-slot-content`, and the elements of removed markers stay in the DOM, because Angular removes only the placeholder it rendered.
7. The helper's elements are created only in the browser, so server-rendered or prerendered output holds the empty placeholders.
8. A helper slot without `content`, used in a marker without a context, renders the text "null": the placeholder has no `data-slot-content` attribute, and the missing value becomes a text node.
9. The helper sets `attributes` with `Renderer2.setAttribute`, which bypasses Angular's sanitization, and accepts any `tag`. An `href` from untrusted data, or a `script` tag whose text comes from the translation, is not sanitized.

**Tests whose name and body disagree, or that cannot fail**

- "should render component with 2 slots", "should change text dynamically" and "should handle slots without context" snapshot the inner markup of `KbqLink` (`kbq-link__text`, `kbq-link__trailing`, `tabindex`), so a change to the link component fails them.
- "should handle undefined slot" tests a slot name that is not registered, not an `undefined` value.
- "should handle malformed slot syntax" covers only unknown names and single brackets. An unclosed marker of a registered name, such as `[[testSlot2:x`, is not tested.
- No test covers `KbqDynamicTranslationHelper`.

**Behaviour without a test.** The spec states these from the source:

- the text is not translated and does not follow the locale;
- the text is not parsed as markup;
- which slot templates are registered (control flow and `<ng-container>` are transparent, another element is not) and that an empty name is ignored;
- the missing-provider error for a slot directive used without `*`;
- the later of two slots with the same name wins;
- slot names are compared case-sensitively;
- list items keep their spaces, and `()` gives the string `()`;
- a context does not span a line break;
- adding or removing a slot template re-renders the output;
- every helper requirement, and the standalone import of a single piece.

## ellipsis-center

Change: `document-ellipsis-center-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The constructor JSDoc of `KbqTooltipTrigger` says `KbqEllipsisCenterDirective` skips `super.ngAfterViewInit()`. It calls it, so its tooltip does close when an enclosing pop-up closes.
2. The JSDoc of `minVisibleLength` says a shorter text is cut "by the host's own `text-overflow`". The host has none; the start half carries `text-overflow: ellipsis`. The comment in the Playwright spec repeats this.
3. The overview says the split is recalculated "when the element is resized". Only a change of the host's width does it; a change of the text's rendered width alone does not. The overview also does not say that changing `minVisibleLength` or `charWidth` waits for the next split, or that `debounceInterval` is read once.
4. The overview does not mention `charWidth`, `ignoreTooltipPointerEvents` and its `true` default, or that the tooltip inputs such as `kbqPlacementPriority` are accepted on the host. The breadcrumbs example relies on the last one.
5. `examples.ellipsis-center.{en,ru}.mdx` are "documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so they are not routed, and there are no docs examples for the directive; the overview has a snippet but no live example.
6. The main input has no description in the API: the `kbqEllipsisCenter` setter is `(undocumented)` in the golden file, and the input member it is bound through is `@docs-private`.

**Suspected defects (from reading the code, not reproduced)**

1. A change of the text's rendered width that leaves the host's width unchanged, typically a web font swapping in after the first render, keeps the split and the tooltip state measured with the old metrics. The tail can then be cut, or a text that now overflows keeps its tooltip disabled. The file upload e2e works around it by loading fonts first.
2. `minVisibleLength` and `charWidth` have no `numberAttribute` transform, unlike `debounceInterval`. A static `minVisibleLength="10"` passes a string, which works at run time only through JavaScript coercion and is rejected by strict template type-checking.
3. Changing `minVisibleLength` or `charWidth` alone does not split the text again, and a later `debounceInterval` is never applied. The spec records both as they ship.
4. Content already inside the host is kept beside the halves. It takes width the tail length does not account for, so the end half can overflow the host. The host's text then also differs from the tooltip text, so the open tooltip gets linked through `aria-describedby`.
5. `ignoreTooltipPointerEvents` defaults to `true`, so the tooltip cannot be hovered. The tooltip's own JSDoc ties its hoverable default to WCAG 1.4.13 (content on hover): at high magnification the full text can disappear as the pointer moves towards it. Together with a host that is not focusable, sighted keyboard users have no way to read the full text. The default is deliberate per its JSDoc but worth an accessibility review.

**Tests whose name and body disagree, or that cannot fail**

- "should initialize with input value and call refresh" checks neither the initialization nor a call to `refresh()`. It asserts that the protected `content` follows a changed binding, read through bracket access.
- "should let clicks reach whatever the hint floats over" only asserts that `ignoreTooltipPointerEvents()` returns `true`. It never opens the tooltip, checks the pane class or clicks through it.
- In "should properly split content on refresh", the last assertion (`start.length + end.length` at most the text length) cannot fail once `start + end` equals the text.
- Every unit test drives the split through the `@docs-private` `refresh()`, not through a text change or a resize. `ResizeObserver` is a no-op stub in `tools/vitest/setup-angular.ts`, so no unit test reaches the resize path.

**Behaviour without a test.** The spec states these from the source:

- other children of the host being kept, and a static `kbqEllipsisCenter` attribute value;
- writing the text from code through the `kbqEllipsisCenter` setter;
- the full text in the start half before the timer runs, and a newer render cancelling a pending measurement;
- text that fits staying whole in the start half with an empty end half (tests only check the tooltip state);
- a `charWidth` larger than the measured width shortening the tail;
- `minVisibleLength` and `charWidth` changes waiting for the next split;
- the `cdk-overlay-pane_ignore-pointer-events` class on the tooltip pane, and `false` making it hoverable;
- the inherited tooltip inputs and outputs on this host;
- re-splitting on a width change, no re-split on a height-only change, and the `debounceInterval` value, its string form and its single read;
- no `aria-describedby` on the host while the tooltip is open (the tooltip spec covers the general rule, not this directive);
- no `tabindex` or `role` on the host, and the tooltip opening on keyboard focus of a focusable host.

## empty-state

Change: `document-empty-state-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Both docs pages say `alignTop` and `errorColor` are switched on by "the attribute". Neither input has a boolean transform. A bare `alignTop` attribute is therefore a type error under `strictTemplates` and an empty, falsy string without it. Only `[alignTop]="true"` works, which is what every example uses.
2. The Error section of both pages says an icon in the illustration slot is tinted, and the JSDoc of `errorColor` says "the projected icon". Only a `kbq-icon-item` declared in the consumer's own template is tinted. An image, a plain `kbq-icon`, or an icon item rendered inside a child component keeps its color. The JSDoc of `KbqEmptyStateIcon` names `kbq-icon-item` correctly.
3. The JSDoc of `KbqEmptyStateTitle` and the Accessibility section of both pages give the title typography only for the normal and big sizes. At `compact` the title uses `text-normal`, which is body text rather than heading typography.
4. The JSDoc of `size` says it limits the width of "the title and the text". The actions row is limited to the same width.
5. The Illustration section says "the illustration size can be changed". The component does not size the illustration; the examples set `width` and `height` on the image.
6. `examples.empty-state.{en,ru}.mdx` are "Documentation in progress" stubs. `structure.ts` sets `hasExamples: false`, so they are not routed, but they would show as stubs if the examples tab were turned on.
7. The Accessibility section advises adding `role="status"` to an empty state that is inserted dynamically. A live region inserted together with its content is often not announced; the region usually has to exist before its content changes. Not checked with a screen reader.

**Suspected defects (from reading the code, not reproduced)**

1. `kbq-empty-state_has-icon` follows a content query that includes descendants, not what is projected. A `kbq-empty-state-icon` inside an element without a slot attribute, which is not rendered, or one placed inside another slot, still sets the class. A centred `normal` or `big` empty state then gets the compensation margin with no visible illustration.
2. The `empty-state-content` example gives its decorative illustration `alt="Empty state"`. Next to the title, a screen reader reads a redundant image name; `alt=""` would hide it. It also uses a plain `<img>` with absolute koobiq.io URLs rather than `NgOptimizedImage`.
3. The `empty-state-text-only` example declares `styles` and `colors` fields that its template never uses.

**Tests whose name and body disagree, or that cannot fail**

- "should replace the previous size class instead of accumulating" only checks that `kbq-empty-state_normal` is gone. It would also pass if no size class were rendered at all; the `it.each` case covers the new class separately.
- The comment above "should tint an icon wrapped by the illustration slot" says the directive finds the icon only through `inject(KbqIconItem)` on its own host. The directive now also queries wrapped icons, so the comment describes the past.
- Several comments in the unit spec describe change history ("used to be applied once from ngAfterContentInit", the two "DS-5520 follow-up" notes, "EST-CSS-01 ... used to live in two files"). The repository conventions ask to leave such comments out.
- The e2e spec has one `states` test that screenshots the whole table. A failure does not name the state that changed, and long text and `alignTop` are shot only at the `normal` size.

**Behaviour without a test.** The spec states these from the source, or from Angular's content projection:

- slots declared out of order still render as illustration, title, text, actions;
- an element without a slot attribute and an `@if` block with two roots are not rendered (the single-root block is covered by the unit fixtures);
- the slot directives used outside an empty state;
- an image, a plain `kbq-icon` or an icon item inside a child component is not tinted;
- no `role` or `aria-*` attribute from the component, and a consumer `role` is kept;
- the `kbqEmptyState` template reference;
- a host without a height looking the same in both alignments;
- the 480 px width limit at `big`, which no long-text state exercises.

## file-upload

Change: `document-file-upload-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Accessibility and keyboard" section (`en` and `ru`) says the tab order is the browse link, then the remove controls. In the multiple uploader the footer with the browse link comes after the list, so the remove controls come first. A single uploader holding a file renders no browse link at all.
2. The `file-upload-custom-text-via-input` example overrides `single.captionText`, which the single uploader never renders: in `'file'` mode it reads `single.captionTextWithFolder`. Only its `browseLink` override shows. The same example gives the single uploader a `#kbqFileIcon` template, which only the multiple uploader reads, so no icon is shown.
3. More generally, the `single.captionText` key ("Drag file here or {{ browseLink }}" in `en-US`) is unused by the component. Its localization test still asserts it.
4. The "Disabled state" section says drag and drop does not work. Files are not added, but with `fullScreenDropZone` set, the full-screen overlay still opens over the page for a disabled uploader, judging by the code: the service's `disabled` is not tied to the uploader's.
5. The JSDoc of `KBQ_DROPZONE_DATA` says it holds "the data that was passed in to a modal".
6. The JSDoc of `KbqDrop.disabled` opens with "Controls whether drag-and-drop functionality is enabled" for a flag that disables it. It says all drag events are ignored, but `kbqLocalDropzone` still opens its overlay on a drag entering while disabled (see Suspected defects).
7. The JSDoc of `fullScreenDropZone` says "Provide configuration object to enable, or undefined to disable". `true` also enables it, with an empty configuration, and `false` disables it.
8. The examples page ends with a "Dropzone" section that repeats the `file-upload-dropzone` example already shown under "Full-screen file uploader". That example drives the root `KbqFullScreenDropzoneService` directly; no example shows the `fullScreenDropZone` input.
9. The `file-upload-primitive` example puts `multiple` on the context, so the dialog allows several files, but its `onFileClicked` adds only `files.item(0)`.
10. `deleteItem()` and `deleteFile()` are `@docs-private`, yet the tests pin calling them from a consumer's `effect()`. `kbqLocalDropzone` also calls the `@docs-private` `onFileDropped()` of the connected uploader.

**Suspected defects (from reading the code, not reproduced)**

1. A file input given no id gets the string `"null"`: `[id]` is a property binding, and `input.id = null` stores `"null"`. This happens to:
    - the folder input of every uploader in `'folder'` and `'mixed'` mode without `id`;
    - any bare `kbqFileLoader` without `for`.

    Two such uploader components on a page share the id `null`. The same holds for `accept`, so the folder input has `accept="null"`.

2. A static `id` attribute on the uploader host (`<kbq-file-upload id="avatar">`) stays on the host element and is also forwarded to the hidden file input, so two elements share it. In `'mixed'` mode the folder input gets it as well, so even a bound `[id]` ends up on two inputs.
3. Reading a dropped folder calls `readEntries()` once per directory. Chromium returns entries in batches of about 100, so the files of a larger folder past the first batch are silently lost.
4. `kbqLocalDropzone` does not filter the drag-enter event by `disabled`. While disabled, it opens its overlay, but the overlay's handlers of the drag-over, drag-leave and drop events are filtered. The overlay then never closes on leave, and a drop is not prevented, so the browser may open the file.
5. In a browser without `DataTransferItem.webkitGetAsEntry`, a drop logs the "not supported" warning and then calls that missing method, so the drop throws instead of falling back to plain files.
6. The single uploader sets `hasError` on its item only when the control status changes, through `distinctUntilChanged`. If an invalid file replaces another invalid one, the status stays `INVALID` and the new item keeps `hasError` unset. The uploader still shows the error state through `errorState` once touched. The flag is also written onto the consumer's item object.

**Tests whose name and body disagree, or that cannot fail**

- "should NOT toggle label focus state on input focus if disabled" (both flavours) dispatches `focusin`. The CDK focus monitor listens to `focus`, so the class is never set whatever `disabled` is.
- "should disable fileDrop directive" (both flavours) asserts at once after the drop, but the drop handler emits only after a promise chain. It would pass with the drop area enabled.
- `FileDropDirective: drop without files` asserts synchronously, but any emission would be asynchronous, so it cannot fail.
- `KbqFullScreenDropzoneService`:
    - "should create overlay if not already attached" and "should create overlay with correct configuration" have the same body;
    - neither covers the "already attached" branch the first name names;
    - the test that sets up the drag-enter listener and "should pass config to open method" overlap;
    - so do "should unsubscribe from all event listeners" and "should prevent future events after stop is called".
- "should use element dimensions for overlay size" sets a width and height that jsdom never lays out. `offsetWidth` and `offsetHeight` stay 0 on both sides of the comparison.
- `KbqFileUploadContext`:
    - "disabled input — should have false as default value" asserts the `false` the fixture binds; the real default is `null`;
    - "multiple input — should have null as default value" asserts `toBeFalsy()` on the `false` that `booleanAttribute(null)` returns;
    - both "should transform string to boolean" tests bind a boolean, not a string, and `onlyDirectory` has no transform.
- "should listen to filesDropped via dropzoneService" (both flavours) builds its files with `{ ...createMockFile() }`. That copies none of the `File` getters, so the items have no name or size.
- "should report the files a drop discarded through rejected" sits under "with accessibility".
- The test hosts `BasicMultipleFileUpload` and `ControlValueAccessorMultipleFileUpload` share the selector `control-value-accessor-multiple-file-upload`.

**Behaviour without a test.** The spec states these from the source, or from a screenshot that does not assert them:

- the module exports;
- clearing the native input after a selection;
- a drop replacing the file of the single uploader;
- a folder chosen in a single uploader emitting the extra files through `rejected`;
- the classes `kbq-single-file-upload_selected` (only its absence is asserted), `kbq-selected`, `kbq-file-upload_default` and `kbq-file-upload_compact`, and `kbq-disabled` on the drop area and the rows;
- the empty multiple layout, the title, the captions per mode and per size, and `showFileSize` (screenshots only);
- the projected icon of the single uploader, the `#kbqFileIcon` context of the multiple one, and the single uploader ignoring that template;
- `webkitdirectory` on the folder input and no `accept` on it;
- removal ignored while disabled, and the remove controls' `aria-disabled` and tab order;
- no error state without a form directive;
- the single uploader setting `hasError` from the control status;
- the row `kbq-error` class and the error color of its remove control;
- the list height cap (the flash fixture only relies on it), and no scrollbar flash after a removal;
- the service's `disabled`, the overlay content (title, caption, size), focus capture and its return, `autoCapture`;
- the local overlay closing when the directive is destroyed;
- equal files in one selection both being added, and the form write after a selection of duplicates only;
- an empty drop marking the control touched;
- Enter, Space (and its prevented scroll) and Backspace on the remove controls;
- `fileRemoved` with the index, and `itemRemoved` re-emitted by the multiple uploader;
- `deleteItem()` without a file, and `deleteFile()` with an index outside the list;
- the keyboard or program focus origin after a removal;
- the role and name of the single remove control;
- the tab order;
- the `a11y.filesNotAdded`-only announcement;
- the subjects of items the uploader creates;
- unbound `[file]` / `[files]` keeping a value written by code;
- server rendering;
- the default ids and the `id` input of the uploader components;
- `kbqFileDrop` ignoring a leave into a child, preventing the default, and `disabled`;
- dropped items that are not files being ignored;
- the multiple uploader rendering the empty state at the `'normal'` size.

## filter-bar

Change: `document-filter-bar-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. `filter-bar.{en,ru}.mdx` says the `input` pipe applies text "only from 3 characters on (`minLength`)". `minLength` defaults to 1.
2. The same section says Enter and blur apply the value at once and ignore the threshold. The pipe has no Enter or blur handler; the text is applied only after the 200 ms debounce or by a clear. The JSDoc of `debounceTime`, `minLength` and `KbqPipeTypes.Input` ("Commits … on Enter and on blur") say the same and are wrong too.
3. The same section calls the cleaner the `input` pipe's "only clear affordance". The cleaner is rendered only with `cleanable: true`; otherwise the pipe has no clear affordance at all.
4. The JSDoc of `filterSavedSuccessfully` and `filterSavedUnsuccessfully` says to call them from `onSave` or `onChangeFilter`. `onChangeFilter` is declared but never emitted; renames arrive through `onSave` with `newName`. The dev app still binds it.
5. The JSDoc of `onClosePipe` says it fires when "the select or multiselect pipe" closes. It also fires for the `text`, `date`, `datetime`, `tree-select` and `multi-tree-select` pipes.
6. "Parameter not specified" reads as if the bar puts a localized option at the top of the list. The option, its text and its position belong to the example's own `values`.
7. "Inactive filter" describes a filter that cannot be changed or deleted, but the example sets `disabled` on each pipe. `KbqFilter.disabled` and `isDisabled()` have no effect anywhere in the bar.
8. The "Search" section describes word splitting and diacritic folding as if the bar searched. The bar does not filter data; the example does, with `createSearchPredicate`.
9. The `filterBar.search.tooltip` locale string is not used by any part of the filter bar.
10. `kbq-filter-refresher` is exported and has a slot in the bar, but the docs page does not mention it, it has no inputs or outputs, and its two buttons do nothing. The dev app keeps it commented out.

**Suspected defects (from reading the code, not reproduced)**

1. The bar's reset stream is a `BehaviorSubject` that stays `true` after the first reset. A pipe with `openOnReset` that is rendered later for any other reason, such as selecting a saved filter or a locale change, opens on its own. Only a comment in the overview example warns about it.
2. The `select` and `multiselect` pipes read `filterBar!.internalTemplatesChanges` while being constructed. Rendered outside a `kbq-filter-bar`, where the base pipe treats the bar as optional, they throw a `TypeError` instead.
3. When "all selected equals nothing selected" applies, the multi-select pipes emit `onChangePipe` with a copy of the pipe (`{ ...data, value: [] }`), not the pipe object in the filter. A handler that compares it with `filter.pipes` or passes it to `removePipe` finds nothing.
4. The `text` pipe never resets its textarea from the value. Text typed and then abandoned by closing the popover is still there on the next open, although the value did not change.
5. `numberOfSelectedLeaves`, which feeds the multi-tree-select count badge, counts every selected node, branches included, not only leaves.
6. Escape in the saved-filter search calls `closePopover()`, which hides the save popover (not open at that moment) and moves focus back to the trigger. Closing the menu itself is left to the dropdown.
7. The `tree-select` pipe template projects a `kbq-cleaner` into `kbq-tree-select`, but the custom matcher replaces the slot that would render it, so it never shows.

**Tests whose name and body disagree, or that cannot fail**

- `filter-bar.spec.ts` "should mark filter as changed when onRemovePipe emits" calls `removePipe`; nothing in the bar listens to `onRemovePipe`.
- `filter-bar.spec.ts` "selectedAllEqualsSelectedNothing › should reflect the bound value" binds `true`, the default, so it cannot tell a working binding from none.
- `filters.spec.ts` "should show save button when filter is changed and not saved" and "should show filter actions button when filter is saved" both look for `.kbq-button_action`, which both buttons carry, so each would pass with the other button.
- `pipe-date.spec.ts` "should use today as defaults when pipe is empty" asserts that the default end is tomorrow.
- `pipe-multi-tree-select.spec.ts` "should count selected items excluding selectAll value" recomputes the getter's own formula, so it cannot fail.
- `e2e.playwright-spec.ts` "should apply panelMaxHeight from the pipe template to a select pipe" opens the `multiselect` pipe.
- `filters.spec.ts` "should call closePopover when Escape is pressed" checks only that the method was called, not that the menu closed.

**Behaviour without a test.** The spec states these from the source:

- the order of `kbq-filters`, the pipes, `kbq-pipe-add` and `kbq-filter-reset` in the left section;
- `changed` staying `true` after the values are reverted;
- `*kbqPipe` ignoring later binding changes, and its error for an unregistered type;
- the default `KBQ_FILTER_BAR_PIPES` map, `kbqFilterBarPipesProvider()` and custom pipe registration (shown only by a docs example);
- `kbq-active` on an open pipe trigger;
- the names and tooltips of the clear and remove buttons, removal through the button, a disabled pipe's button, and both `cleanable` and `removable` set;
- focus staying where the user moved it when a pipe closes;
- `openOnAdd` being deleted from the pipe object;
- the name and tooltip of the `kbq-pipe-add` button;
- the projected label of `kbq-filter-reset`, and `openOnReset`;
- the `readonly` pipe, which has no unit spec;
- the `text` pipe's hot-key label and five-row limit;
- the `input` pipe ignoring `removable`, emitting nothing for an unchanged value, and not applying on Enter or blur;
- the multi-select trigger name and count badge (screenshots only), and a multi-tree-select branch following its children;
- the select-all row hidden while a search finds nothing;
- `kbqBuildTree`, used in the specs only to build fixtures;
- word-by-word matching and diacritic folding in pipe search (tested in `core`), the tree highlight and the `pipe.emptySearchResult` text;
- in `kbq-filters`: the trigger disabled while saving, `kbq-selected` on the current filter, the search and list hidden for an empty list, the read-only actions menu, focus in the popover field, the bar's filter left alone by a new save, focus on the trigger after Delete, and `onChangeFilter` never firing;
- restoring an unnamed state over the current filter, restoring after a key change, and a bar outside the document persisting nothing;
- `[localeOverrides]` on the bar (tested in `core`);
- the accessible names of the add, save-as-new, actions, clear and remove buttons and of the pipe search fields;
- `kbq-filter-refresher`.

## flag

Change: `document-flag-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Neither docs page names the `empty` input. The fallback section asks for "a neutral placeholder" and shows it only through the `flag-fallback` example; a reader of the page alone does not learn that the component draws one.
2. The JSDoc of `empty` says it "renders a neutral placeholder", and the comment in `flag.scss` says the fill is for "when no flag is projected". The class is applied whatever the flag contains: projected content and the `svg` markup still render over the fill. The example avoids this by binding `[empty]` to the absence of a flag.
3. The comment on the size in `flag.scss` says the width is "1.5 × line height" and that the flag can be resized "via font-size / width / height". The height is `1em`, the font size, not the line height. Because the height is fixed, setting only `width` does not keep the proportions: the box becomes that width by `1em` and the flag is cropped to it (from reading the CSS, not reproduced). The docs page does not describe the default size at all.
4. The `flag-aspect-ratio` example is titled "Flags in a select" and shows 3:2 flags in select options. It sits under the paragraph about cropping to any ratio in the Rectangle section and demonstrates neither a custom ratio nor a crop.
5. The docs prose writes ratios as "4:3", while `aspectRatio` needs a CSS `aspect-ratio` value such as `4 / 3`. Nothing warns that the colon form is not valid CSS (see suspected defect 3).

**Suspected defects (from reading the code, not reproduced)**

1. A `label` made only of spaces is truthy, so the host gets `role="img"` with a blank `aria-label`: an image without an accessible name, which axe reports as `role-img-alt`. The empty string is handled; whitespace is not trimmed.
2. The host bindings for `role`, `aria-label` and `aria-hidden` remove those attributes whenever their computed value is `null`, so a consumer's own static `role` or `aria-label` on `<kbq-flag>` is dropped. A flag named with `aria-labelledby` instead of `label` is also hidden by `aria-hidden="true"`, so `label` is the only way to name a flag.
3. An `aspectRatio` (or a class rule for `--kbq-flag-aspect-ratio`) that is not a valid `aspect-ratio` value, such as `4:3`, makes `aspect-ratio` invalid at computed-value time. The box then has no ratio, and a flag passed through `svg`, whose SVG is absolutely positioned, would collapse to zero width.
4. The crop rules match every descendant `img` and `svg` of the flag, not only its direct carrier. A flag whose markup nests an `<svg>` inside its root `<svg>`, or an `<img>` projected inside a wrapper that does not fill the box (a `<picture>`, an inline `<span>`), would be positioned or sized against the wrong box.

**Tests whose name and body disagree, or that cannot fail**

- "should pass axe in each of the three documented shapes" renders the three accessibility forms (labelled, decorative, neither), not the three shapes. No axe test renders a square or circle flag.
- "should leave the aspect ratio to the stylesheet when the input is unset" only asserts that there is no inline declaration. The stylesheet part — the 1:1 of the square modifier its comment mentions — is not asserted; only the e2e screenshot covers it.

**Behaviour without a test.** The spec states these from the source:

- the `kbqFlag` template reference name;
- a projected inline `<svg>` written in the template (the tests project only `<img>`);
- the `kbq-flag__svg` element coming after the projected content (the tests check only that both are present);
- no `kbq-flag__svg` element for an empty string, or after `svg` is cleared;
- a plain string passed to `svg` being stripped by the sanitizer;
- setting `height` on the flag keeping its proportions;
- `--kbq-flag-aspect-ratio` from a class rule on a square or circle flag (the e2e scenario overrides it on a rectangle);
- `empty` keeping the projected content and the `svg` markup;
- the value `"false"` of `decorative` and `empty`;
- a name from the projected image (`alt`, `<title>`) being hidden with the flag;
- the flag not being focusable.

## form-field

Change: `document-form-field-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The docs page (both languages) says `kbq-password-toggle` adds its button for **filled** password fields. The toggle is shown whenever the control is enabled, empty included; the unit snapshots show it visible on an empty field.
2. The Troubleshooting headings quote "kbq-password-toggle should use with kbqInputPassword" and "kbq-stepper should use with kbqNumberInput". The thrown messages are "You should use kbq-password-toggle with kbqInputPassword" and "You should use kbq-stepper with kbqNumberInput", so a search for the real message finds nothing.
3. The cleaner's error says "You can't use kbq-cleaner with input that have type=\"number\"". It is thrown for any `kbqNumberInput`, which renders `type="text"`, and the Troubleshooting section does not list it.
4. The JSDoc of `KbqCleaner` says it "resets form control by click". It also clears on Enter, Space and Escape, and resets nothing when the control has no form directive.
5. The docs page tells consumers to use `KBQ_FORM_FIELD_DEFAULT_OPTIONS`, but the token is marked `@docs-private`, so the API tab hides it. Likewise `kbqTooltipNotHidden` is `@docs-private` while its pair `kbqTooltipHidden` is documented; `tabindex` of the toggle has no description.
6. `KbqTrim` is `@docs-private` and listed under "Legacy components" in `KbqFormFieldModule`, yet it trims every `kbqInput` and `kbqTextarea` value wherever the module, `KbqInputModule` or `KbqTextareaModule` is imported. No page mentions trimming or `no-trim`.
7. The docs page says nothing about:
    - Escape clearing a field that has a cleaner, and Alt+F8 toggling the password;
    - `kbq-stepper`, `labelClass`, `contentClass` and `inOverlay`;
    - the reactive password hint staying neutral until the control is touched or edited, whatever `[hasError]` says.

**Suspected defects (from reading the code, not reproduced)**

1. A cleaner next to a control without a form directive (`<input kbqInput>` with no `ngModel` or `formControl`) appears once text is typed, but activating it only focuses the input: it resets the form control, and there is none.
2. The Escape handler of the cleaner listens on the form-field host, ignores `defaultPrevented` and stops propagation. With an open autocomplete panel in a filled field, Escape seems to clear the value, and the key never reaches the overlay that would close the panel. Inside a modal, Escape in a filled field clears it instead of closing the modal.
3. The `kbq-form-field-type-<type>` class and the subscription that refreshes the forwarded `ng-*` classes are set up once, for the first control. A control swapped in later keeps the old type class, and its `ng-*` classes refresh only when something else checks the view.
4. The forwarded `ng-*` classes are read outside the reactive graph. A state change with no value change and no event inside the field, such as `markAllAsTouched()` called from another component, may not reach the host classes until the next check of the parent view.
5. The password toggle combines `aria-pressed` with a label that flips between "Show password" and "Hide password", so a screen reader can announce "Hide password, pressed" for a shown password. A toggle button should keep one label.
6. The hints and errors of a `kbq-fieldset` are not referenced by any `aria-describedby`: neither the group nor its controls point to them.
7. The fieldset examples and test fixtures use `<legend kbqLegend>` inside `kbq-fieldset`, which is not a native `<fieldset>`, so the markup does not conform to HTML.

**Tests whose name and body disagree, or that cannot fail**

- `form-field.spec.ts`:
    - "should hide KbqPasswordToggle initially" records a snapshot in which the toggle is visible (`visibility: visible`, `aria-hidden="false"`).
    - "should display KbqPasswordToggle by input" records the same toggle state as the initial snapshot, so it cannot detect the transition its name describes.
    - "should clean field by KbqCleaner on Space" duplicates the `' '` case of "should clean field by KbqCleaner on %s" in the accessibility block.
- `input-number.spec.ts`:
    - "should throw an exception with kbq-cleaner" checks that a fixture without a cleaner renders none; it never expects a throw.
    - "should have stepper on focus" dispatches a focus event that plays no part: the stepper is rendered whatever the focus.
- `input-password.spec.ts` "should change visibility of toggle if form field disabled and empty" flips `disabled` and the value together; only `disabled` drives the toggle's visibility.
- `e2e.playwright-spec.ts`: "cleaner owns pointer and keyboard clearing" uses only the keyboard. Its fixture sets `ariaLabel="Clear text"` on `kbq-cleaner`, which is not an input (the input is `aria-label`) and is never asserted.

**Behaviour without a test.** The spec states these from the source:

- the form field throwing when its control is removed after initialization;
- the `id` of a native `<label>`, and the hint area being absent without hints, errors or reactive hints;
- the hint `color` input and its `[kbq-icon]` slot, and the form field's own `color` class;
- consumer ids kept in `aria-describedby`, and `setDescribedByIds` (no control in the library implements it);
- the cleaner hidden for a disabled control, Escape ignored in an empty field and stopped in a filled one, the cleaner's `aria-label` input, `localeOverrides` and the `en-US` string;
- the prefix and suffix areas being absent without content, and the order inside the suffix area;
- a click on the container focusing the control, and the focus-origin classes (only `cdk-focused` is asserted);
- a bound `noBorders` winning over the default options, and `inOverlayChange`;
- the password toggle's missing-input error, icon error color, projected content, tooltips, `tabindex` input and `localeOverrides`, and its doing nothing while disabled;
- the stepper's missing-input error, keeping focus when an arrow is pressed, and `aria-hidden` with `tabindex="-1"` on its arrows;
- trimming applied through `KbqFormFieldModule`, `KbqInputModule` and `KbqTextareaModule`, and `no-trim` working only as a static attribute;
- the container as the default overlay origin, checked only indirectly by the autocomplete panel-position tests;
- custom controls beyond the labelling case.

## icon

Change: `document-icon-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqIconResolver` and `KBQ_ICON_RESOLVER` says a resolver may answer with an inline SVG string. Such an answer goes through Angular's HTML sanitizer as untrusted text, which removes `<svg>`; the icon keeps its font class and Angular logs a "sanitizing HTML stripped some content" warning in dev mode. Only the JSDoc of `kbqIconsDictProvider` says so.
2. The "Dictionary" section of `icon.en.mdx` and `icon.ru.mdx` says an unknown name falls through to the next resolver "and then to the font class". The registry tries the sprites of the namespace first. The pages also do not say that a resolver answering for every name, like the URL resolver example, hides every sprite.
3. The URL resolver example maps every name, including the `kbq-*` font names that other components render. Each of those then issues a request and keeps its font class only after the request fails. The pages do not warn about it.
4. `kbqIconsProvider` takes several sprites but provides them as one value without `multi`, so a second call in the same injector replaces the first. The pages and the JSDoc do not say so.
5. The JSDoc of `KbqIconButton` and the accessibility section of the icon page say `aria-disabled` is supplied on a host that is not a native `<button>`. It is written on a native `<button>` as well, and the `disabled` attribute is written on every host.
6. The dev app labels "Approach A" as a sprite from `kbqIconsProvider`, but its `main.ts` registers no sprite. The `kbq:` names there reach the catch-all resolver with the namespace removed.
7. `examples.icon.en.mdx` and `examples.icon.ru.mdx` are "documentation in progress" stubs. `structure.ts` sets `hasExamples: false` for the icon, so they are never shown.
8. The `big` and `fade` inputs of `KbqIconItem` take no boolean-attribute transform, unlike `disabled` and `autoColor`, so a bare `big` attribute does not type-check. The docs examples bind `[big]="true"`.

**Suspected defects (from reading the code, not reproduced)**

1. `iconName` is a public field. Assigned after initialization, it changes only the font class on the next check: no SVG is resolved, the `max-height` of the old name stays, and while an SVG is shown the old SVG stays, because the font class is not rendered then.
2. An icon button disabled from the start is focus-monitored anyway: the effect stops monitoring before the view is initialized, and the view-init hook then starts it without checking `disabled`.
3. A disabled icon button on an `<a href>` stays in the tab order, and Enter follows the link. Only the `tabindex` attribute is removed, and `pointer-events: none` stops only the pointer.
4. A resolver that throws makes `getNamedSvgIcon` throw synchronously, although the class comments say that every failure arrives as an error notification. `KbqIcon` survives only because it defers the call.
5. `getNamedSvgIcon` accepts a name that is itself markup (starts with `<`), but sanitizes it as untrusted text, so this path can never produce an SVG.
6. When `iconSize` turns `undefined` on a name without a size, the inserted SVG keeps the `width` and `height` of the old size, while the host's `max-height` is removed.
7. `kbq-icon-flip-h` applies `scaleY(-1)` and `kbq-icon-flip-v` applies `scaleX(-1)`. The names look swapped, and no page documents these classes.

**Tests whose name and body disagree, or that cannot fail**

- The registry tests "strips `<script>` elements embedded in the SVG", "strips inline event-handler attributes from the SVG root" and "strips event-handler attributes from nested SVG children" assert that registration throws, because the sanitizer drops the `<svg>` itself. Nothing is stripped and kept. `toThrow()` without a message also passes on any error.
- "should handle a click on the button" checks that the test host's own `(click)` listener runs on a native click. The icon button adds nothing to click handling, so the test cannot fail because of it.
- The `hydration` test "should adopt an already-rendered svg instead of duplicating it on a repeat resolution" renders on the client and calls `ngOnChanges` by hand. The constructor path that adopts a server-rendered SVG never runs in any test.
- "does not register same URL twice" probably cannot fail. Without the check, the second registration would join the request still in flight instead of sending its own, so one request would be seen either way.

**Behaviour without a test.** The spec states these from the source:

- the `kbq-empty` class of an icon without a color, and `autoColor` outside a form field or given as a bare attribute;
- an `iconSize` that does not parse being ignored;
- the fallback to the font class after a failed request or markup without `<svg>`, and a pending resolution being dropped on a name change;
- `aria-hidden="true"` and `focusable="false"` on the inserted SVG;
- adopting a server-rendered SVG;
- the lookup order, the details of resolvers (namespace removed, `null` passing the name on, remembered answers, markup answers) and the registry being configured per injector — the URL resolver and the component-level registry are backed only by the e2e screenshots;
- the sprite view box fallbacks and the order of several sprites in one namespace;
- `kbqIconsProvider` and `kbqIconsDictProvider`;
- a fetched icon being parsed once and copied, and `KbqIconOptions`;
- for the icon button: its font class and the missing `max-height`, the `disabled` attribute on a generic host, `pointer-events: none` while disabled, `disabled` set in code, the missing Enter and Space activation, and the focus-origin classes;
- `getHostElement()` of the icon button and the icon item.

## inline-edit

Change: `document-inline-edit-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `disabled` says it prevents "mode switching". It blocks only click, Enter and Space: `toggleMode()` and a write to `mode` still open and close a disabled inline edit.
2. The docs say edit mode "cannot be reopened while the request is in flight", and the JSDoc of `toggleMode()` says it does nothing then. Both hold for the user and for `toggleMode()`, but a write to `mode` (`[(mode)]`) still opens the editor during a request.
3. "Empty state" says the system shows "Not filled" by default (`ru`: «Не заполнено»). The component renders no placeholder text: `kbqInlineEditPlaceholder` only styles what the consumer projects.
4. "An invalid value is never written through." The bound control holds the typed value from the first keystroke. A rejected save only withholds `saved` and `saveHandler`, and closing through `mode` or `toggleMode()` leaves the invalid value in the control.
5. "The field is a single tab stop." The menu button, interactive view content with its focus anchor, and controls in the label are tab stops of their own.
6. "After picking an option, the field returns to view mode" (select-style editor, twice). That is the examples' `(selectionChange)="inlineEdit.commit()"`; the page does not say the consumer has to bind it.
7. Two paragraphs describe what the examples do as if the component did it:
    - "The message doesn't hide on a timeout, and closing or dismissing it discards the unsaved value" — the inline edit shows no message;
    - blocking invalid characters with a yellow tooltip in "Validation" — that is the example's `(input)` handler.
8. The accessibility section suggests `aria-label` "wherever the projected value alone does not say what is being edited", which reads as if the value were announced. The label replaces the content as the name (see the first suspected defect).
9. The accessibility section asks for an `aria-label` on every `kbqInlineEditMenu`, but the `inline-edit-menu` and `inline-edit-disabled` examples render their menu buttons without one.
10. The JSDoc of `KBQ_INLINE_EDIT_SAVE_ERROR_HANDLER` says "Declare it in the root injector". It is resolved from the inline edit's own injector when the component is created, and the `inline-edit-save-error` example provides it on a component.
11. "Leaving edit mode returns focus to the field." Only when focus is on the page body or still in the panel: after a click outside on another focusable element, focus stays there.
12. The pages do not mention:
    - `editModeWidth`, `overlayPanelClass`, `tooltipPlacement` and `localeOverrides`;
    - the exported `kbqInlineEditSaveProgressDelay` and `kbqInlineEditSaveProgressMinimumDuration`;
    - that closing through `mode` neither saves nor cancels.
13. `KbqInlineEditMode` and the three methods of `KbqInlineEditSaveRecovery` have no JSDoc (`(undocumented)` in the golden file).

**Suspected defects (from reading the code, not reproduced)**

1. The view's `aria-label`, "Edit" by default, replaces its content as the accessible name, and the content of a `button` role is presentational. Assistive technology probably announces "Edit, button, collapsed" without the current value. The focus anchor is named the same way.
2. A focusable control in the label, or one in the view that `interactiveSelectors` does not match (a plain `button` by default), opens the editor when clicked. On Enter or Space the inline edit prevents the key's default action, which also cancels that control's own activation. The interactive-content check covers only the view, while the click filter covers the whole host with the same list.
3. With `getValueHandler` bound and no `setValueHandler`, cancelling and `rollback()` restore nothing, unless the getter returns an array: then its items are written into the form fields by index.
4. In the select-style editor without `commit()` bound to `selectionChange`, picking an option closes only the options panel. The editor stays open with its field hidden, and focus is probably left on the page body. Clicks in the options panel do not count as outside clicks of the edit panel, because the select subscribes to the outside clicks of its own overlay.
5. Selecting the text on open is guarded by `if (initialValue)`, which is always true for the default snapshot, an array. The guard only matters with `getValueHandler`, where a value of `0` or `''` skips the selection.

**Tests whose name and body disagree, or that cannot fail**

- "should not enter the error state while the value is still being typed" dispatches one `keydown` on the overlay and types nothing. A control is marked touched on blur, not on a key, so the test cannot fail through the path its name describes.
- "should stay in view mode when commit() is followed by a redundant outside-click save()" calls the protected `save()` directly. Its comment says a click on a select option also reaches the edit panel's outside-click handler; the select's own subscription makes the CDK dispatcher stop at the select's overlay, so that path looks unreachable (not reproduced).
- "should prevent close if control invalid" asserts only that `saved` did not fire, not that the editor stayed open, and it touches the control first.
- "should pass overlayPanelClass to panel" sits under "with multiple form fields" but renders the single-field host.
- "should finish a successful save after the inline edit is destroyed" asserts that `subscriptions` is 1, which holds before the response arrives. Only the fail-on-console hook guards the behaviour it names.
- "should setup with default parameters" snapshots only the host classes.
- "should toggle mode on click / space / enter" sends Space with `key: 'Space'`, which no browser sends. It matches `keydown.space` only because Angular lower-cases the key.
- The e2e "view states" test adds `cdk-focused` and `cdk-keyboard-focused` to the hosts by hand, so its screenshots show the class-driven ring and not a focus the component produced. The "keyboard" and focus-ring tests cover the real path.

**Behaviour without a test.** The spec states these from the source:

- a click on the label opens the editor, and the opening click does not propagate;
- an empty `interactiveSelectors` turns the interactive-content check off;
- the panel width: `editModeWidth`, the host width, and the inner width with a label;
- the text of the first input is selected when the editor opens;
- the accessible names of the save and cancel buttons;
- `kbqInlineEditPlaceholder` adds `kbq-inline-edit__placeholder`;
- a click on the host while editing saves without reopening;
- `showTooltipOnError` set to `false`, `tooltipPlacement`, and a template as `validationTooltip`;
- cancelling runs no validation;
- an Escape a control has already handled does not cancel;
- with `saveHandler`, an unchanged save emits no `saved`, a throwing comparator counts as a change, and emissions after the first are ignored;
- `saveErrorHandler` bound to `null`;
- cancelling does not clear the failed state;
- the menu's `role="button"`, its handling of Enter and Space, `kbq-inline-edit_with-menu`, and the menu being kept while disabled and removed in edit mode;
- closing through `toggleMode()` or `mode` neither saves nor cancels;
- Tab-out skips tab stops in other overlays, and the select Tab-out ignores Ctrl, Cmd and Alt;
- focus already moved elsewhere is not taken back;
- the view's `tabindex="-1"` in edit mode and the `a11y.edit` fallback for an empty `aria-label`;
- `kbq-inline-edit_disabled`, and a disabled inline edit not opening on click, Enter or Space;
- `setValueHandler` on cancel;
- `localeOverrides`.

## input

Change: `document-input-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The first sentence of `input.en.mdx` and `input.ru.mdx` lists masking among what Input provides. The entry point has no masking; the example relies on Maskito.
2. "Numeric input field" says `kbqNormalizeWhitespace` replaces thin spaces when pasting. The directive in `core` acts on copy: it puts the field's whole value on the clipboard with thin spaces turned into spaces, whatever part of it was selected.
3. The `integer` bullet says it rejects the fraction separator on typing. It also rejects the group separator keys, Space in `ru-RU` included.
4. "Number formatting and locale" says the separators come from the `input.number` section. The fraction separator does, but the rendered group separator comes from `Intl.NumberFormat` for the active locale id unless the section sets `viewGroupSeparator`. Paste ignores the section altogether (see the suspected defects).
5. Neither page mentions `[localeOverrides]` on the number input, `[value]` or `valueAsNumber`.
6. The error thrown for a `kbq-cleaner` next to a number input speaks of `type="number"`. The number input always renders `type="text"`, and the docs tell consumers not to use `type="number"`.
7. The `input-number-overview` example starts its `ngModel` values at `''`. The number input formats an empty string as `0`, so the four fields probably start with `0` and `aria-valuenow=""` while the model holds a string (not reproduced).
8. The hint of the first field in that example reads "От −12 000 до 12 000". The field never renders `-12000` with a group separator (see suspected defect 1).
9. The JSDoc of `KbqMinValidator` and `KbqMaxValidator` says they install themselves; they install `Validators.min` and `Validators.max`.
10. The comment over the playground block in `e2e.ts` says typing, stepping, pasting and locale switching are asserted there. The Playwright spec has no paste or locale case.

**Suspected defects (from reading the code, not reproduced)**

1. With a `startFormattingFrom` threshold — `ru-RU` sets one by default — the grouping test compares the signed integer part, so negative values are never grouped (requirement "Grouping threshold").
2. The keyboard filter works on `keyCode` and blocks Shift with any digit. On layouts that type digits with Shift, such as the French one, the main-row digits cannot be typed. It also blocks every Ctrl or Cmd shortcut other than A, C, V, X and Z while the field has focus, such as Ctrl+Y, Ctrl+F or Cmd+R, as well as Page Up and Page Down.
3. A minus is let through wherever the caret is. Typed after digits, it makes the text unparseable, which empties the field and sets the value to `null`. Typing the fraction separator into an empty field does the same.
4. A paste replaces the whole text, whatever the caret position or selection, so pasting `3` after `12` leaves `3` (requirement "Paste").
5. Paste parsing reads the shipped data of the active locale id. It ignores `kbqInputLocaleConfigurationProvider`, `[localeOverrides]` and locales registered by the application. Without `KBQ_LOCALE_SERVICE` it tries `en-US` first, so pasting `1,5` into the default `ru-RU`-formatted field gives `15`.
6. Overriding `groupSeparator` without `viewGroupSeparator` changes what is parsed but not what is rendered. With `{ groupSeparator: ['.'], fractionSeparator: ',' }` in `en-US`, `1234.5` renders as `1,234,5`, which the next keystroke cannot parse.
7. A step at a bound reports the unchanged value again: `valueChange` emits and the form control is marked dirty.
8. A keystroke typed before the previous reformat has settled is inserted at the uncorrected caret. The e2e spec records this as INP-BUG-06: typing `1234567` at once can render `1 234 675`. An arrow key pressed in that window steps from the last committed value.
9. `integer` does not stop a fractional value from a form write or from a fractional `step` (requirement "Integer mode").
10. On `kbqInput`, `[value]` and `value.set()` write the element without going through the forms API, so the view and a bound form control can disagree (requirement "Value written to the element").

**Tests whose name and body disagree, or that cannot fail**

- `input-number.spec.ts` "should throw an exception with kbq-cleaner" looks for a cleaner in a fixture that has none and expects `null`.
- "should have stepper on focus" asserts that the stepper and its two icons exist; they exist without the focus event.
- "should be able to set step" steps down twice from an empty field with `min="3"`. Both results clamp to `3`, so the step size is never observed.
- "should step up when max is set" gets `3` and `3.5` from the `min` clamp; `max` is never reached.
- "should step up/down with bug step on shift and up/down arrow key" means "big step".
- "should allow entering minus" starts from `null` and asserts `null`. It passes whether or not the model is updated, and it does not check that the `-` stays in the field.
- In `input.spec.ts`, two cases cannot fail: "should not be in error state when invalid and touched but form not submitted" (`ShowOnFormSubmitErrorStateMatcher`) and "should not be in error state when invalid but pristine" (`ShowOnControlDirtyErrorStateMatcher`). Each changes the matcher, and the first also the control, without running change detection, so `errorState()` still holds its initial `false`.
- "should emit VALID via statusChanges on blur": `VALID` comes from `setValue`; the blur part asserts that nothing more is emitted.
- `input-password.spec.ts` "should apply validation rules on blur": the `maxlength` error comes from the input event and is there without the blur.
- "should change visibility of toggle if form field disabled and empty": the toggle follows the disabled state only; emptiness plays no part.
- The cleaner, hint, prefix and suffix cases in `input.spec.ts` test the form field rather than the input.
- The e2e "text visible" case takes only the light screenshot.

**Behaviour without a test.** The spec states these from the source:

- applying `type` to the element, and the error for an unsupported type;
- the never-empty date and time types;
- a click on the form field container focusing the input, and disabling resetting the focused state;
- a bound form control's disabled state taking precedence over `disabled`;
- `required` setting the native property;
- the error state staying off without a form control;
- a value set in code on `kbqInput` not reaching the form control;
- a value written by a form into the number input not being reported back to it;
- a typed `.` being rendered as the locale's fraction separator;
- the keys blocked by the number input other than the minus and the second fraction separator, and the separator keys blocked in integer mode;
- a paste replacing the whole text;
- the empty field after unparseable typed text (only the `null` model is tested);
- a lone `-` keeping the previous value in the form;
- stepping moving focus to the field, and typed values outside `min` and `max` being kept;
- negative values left ungrouped under a threshold;
- runtime changes of `withThousandSeparator` and `startFormattingFrom` not re-rendering;
- `aria-valuenow` and `aria-valuetext` being absent while the field is empty;
- `disabledChange`, and the blur on disabling;
- `kbqInputLocaleConfigurationProvider` and `[localeOverrides]` on the number input;
- the separators of `pt-BR`, `es-LA` and `tk-TM`;
- the `kbq-input-password` class and the overwritten `type` attribute of the password input;
- the `kbq-form-field-type-input` and `kbq-form-field-type-input-password` classes.

## link

Change: `document-link-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqLink` says the link applies to "an `<a>` with a `href`" or to "any other element, which makes it a pseudo link that acts as a button". An `<a>` without a `href` and without `pseudo` is neither: it stays a regular link. A `<button>` or a `<label>` host is a pseudo link that gets no button role from the component.
2. The JSDoc of `tabIndex` says a `<label>` "is left out" of the tab order. A `<label>` that declares a role in the template gets the `tabindex` like any other link.
3. The JSDoc of `pseudo` describes a pseudo `<a>` as "a control without a `href`". `pseudo` also works on an `<a>` with a `href`, which keeps it: Enter is then left to the browser and Space clicks the anchor (tested).
4. The docs say `print` prints "its address" and that "http://www" can be dropped. The component prints the resolved `href`, so a relative `href` prints with the host (`localhost/docs`), and it strips only `http://` and `https://` with a following `www.`; a `mailto:` address is printed in full.
5. The `link-print` example binds an explicit text instead of showing the valueless `print` the docs describe, and its text has no trailing slash, while the sample printout above it ends with `/`.
6. The docs do not say that `kbqLinkPrefix` and `kbqLinkSuffix` have to be imported. Without them the marked content is still projected into place, because projection matches the attribute, but it lacks the `kbq-link__prefix` and `kbq-link__suffix` classes: the prefix loses its gap to the text, and a caption in the suffix no longer wraps inside.
7. The "Disabled" section of the docs has only an example. It does not say that a disabled link keeps its `href`, is marked with `aria-disabled`, leaves the tab order and also stops ArrowDown, ArrowLeft and ArrowRight.
8. The `link-overview` example declares the unused fields `active` and `focus` and renders the same external link twice.

**Suspected defects (from reading the code, not reproduced)**

1. `[tabIndex]="null"`, `undefined` or a non-numeric string goes through `numberAttribute` without a fallback and becomes `NaN`. The host then gets `tabindex="NaN"`, which browsers ignore: a pseudo `<span>` loses its tab stop, its `button` role and its Enter and Space activation.
2. An external link is marked only by an icon that `KbqIcon` hides with `aria-hidden="true"`. The accessible name does not say that the link leads outside the product, and axe does not flag it.
3. An `<a kbqLink>` without a `href` and without `pseudo` gets `tabindex="0"` but no role and no keyboard activation: a tab stop that the keyboard cannot use.
4. `kbqLinkOptionsProvider({ size: undefined })` is allowed by its `Partial` type, overrides the built-in `normal` with `undefined` and leaves links without any size class.

**Tests whose name and body disagree, or that cannot fail**

- "should keep reporting the bound tabIndex while disabled" reads the `tabIndex` and `disabled` inputs, which the component cannot write, and looks at no DOM, so it cannot fail.
- "should let a forDisabledComponent consumer drive disabledSignal" uses no tooltip and writes the signal itself. The real consumer, `kbqTooltip`, only reads it.
- The Playwright "states of every kind of link" and "icons in every state" force hover, press and keyboard focus with the `kbq-hovered`, `kbq-active` and `cdk-keyboard-focused` classes. They show the styles of those states, not that a real pointer or keyboard reaches them.

**Behaviour without a test.** The spec states these from the source:

- `exportAs: 'kbqLink'`, `focus()` and `getHostElement()`;
- the default `tabindex="0"` of a link and a pseudo link;
- a `<button>` host: the `kbq-link_pseudo` class, no role and no activation from the component (only its native `disabled` is tested);
- a `<label>` that declares a role keeps the tab stop;
- keys pressed on an element inside the link do not activate it;
- non-breaking spaces at the edges of the text are kept;
- `aria-hidden="true"` on the external icon;
- a given `print` text on a link without a `href` is printed as is;
- a disabled pseudo link keeps `role="button"`, and a disabled link stops ArrowDown, ArrowLeft and ArrowRight but lets other keys through (only Enter is tested);
- `KbqLinkModule` re-exports the three standalone pieces.

## list

Change: `document-list-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `noUnselectLast` says "Whether the last selected option can be deselected". It means the opposite: when it is `true`, the last selected option cannot be deselected.
2. The Keyboard section of `list.en.mdx` and `list.ru.mdx` says the arrows "move the active option". With `autoSelect` on, which is the default in single selection and keyboard mode, they also select it, and so do `Home`, `End`, `PageUp` and `PageDown`. The JSDoc of `autoSelect` mentions clicks only.
3. The docs say that in `multiple="keyboard"` the user extends the selection with `Shift` + click. `Shift`+click extends only from an anchor that keyboard navigation or an earlier range selection set. After mouse-only interaction it selects nothing.
4. The JSDoc of `selectAllHandler` says the default handler "toggles" the selection. It only selects, unless `selectAllToggle` is set or the select-all row is rendered.
5. The JSDoc of `multiple` lists `single` among the spellings of single selection. `single` is an unsupported value: it falls back to single selection with a development-mode warning, as the docs page says.
6. `checkboxPosition` on `kbq-list-option` carries a comment that it places the label before or after the checkbox, defaulting to `after`. The template never reads it, so it has no effect. The unit fixtures still set it.
7. The accessibility section names `externalPseudoCheckbox` as if it were an API. It is a protected getter; what the consumer does is project a `kbq-pseudo-checkbox`.
8. The drag-and-drop section says an option with `draggable="false"` cannot be picked up "by either the pointer or the keyboard". The same page says reordering is pointer-only.

**Suspected defects (from reading the code, not reproduced)**

1. `Ctrl`/`Cmd` with an arrow key moves the active option without changing the selection, but still emits `selectionChange` for the new active option and reports the value to the form control.
2. With `autoSelect` off and `noUnselectLast` on, a plain click still deselects the only selected option, while `Space`, `Enter` and `Ctrl`+click refuse to. The `list-action-button` docs example uses this combination: it is a single selection with `[autoSelect]="false"`.
3. In single selection, `Ctrl`/`Cmd` + `A` goes to typeahead as the letter "A": the active option jumps to one starting with "A", and the browser's default is not prevented. In multiple modes, `Ctrl` with any other letter except `C` also feeds typeahead.
4. Under virtual scrolling, the value reported after a user change holds only the selected options that are currently rendered. A selection scrolled out of view seems to drop out of the form value on the next change and then to be cleared when its option comes back.
5. Lists connected by `id` instead of by instance seem to get the `kbq-list-option_drop-forbidden` class and the `no-drop` cursor while the pointer is over them, although they accept the drop. A drop there reports the source list's `previousIndex` as `currentIndex`.
6. The page size for `PageUp` and `PageDown` is the list's own height divided by the first option's height. In a list scrolled by an outer container, such as the `kbq-scrollbar` of the `list-select-all` example, one page seems to be every option.
7. In a horizontal list with `autoSelect` on, `Up` and `Down` do not move the active option. They still re-select it and emit `selectionChange`.
8. Focus entering a list whose first selected option is disabled, or not rendered under virtual scrolling, stays on the list host and reaches no option.

**Tests whose name and body disagree, or that cannot fail**

- "should copy selected option - default handler" copies the active option, which is not selected.
- "should update the list value when an item is selected programmatically" asserts the selection model. Selection made in code does not update the value.
- "should focus and toggle the next item when pressing SHIFT + $direction" does not toggle: the range takes the anchor's selected state.
- "should update the options if a model value is set" asserts only the length of the array the test itself assigned, so it cannot fail.
- "should add preselected options to the model value" and "should handle preselected option both through the model and the view" use fixtures with no `[selected]` option. They only assert that the initial model value survives.
- "should set tabindex to "-1" in disabled state" renders a list without options. Such a list gets `tabindex="-1"` anyway, so the test cannot fail on the disabled rule; "should disable the list itself when the control is disabled" covers it.
- "should survive a comparator that throws and report it once per comparison" asserts only that a warning was logged, not how many.
- "should render the text preview by default" asserts the default input value and that no preview is rendered.
- "should reorder without changing the selection" starts with nothing selected, so its selection assertion cannot fail.
- "should refocus the option through the panel close output" asserts only that emitting does not throw.

**Behaviour without a test.** The spec states these from the source:

- with `autoSelect` on, a plain click deselects the other options in a multiple mode; any click emits `selectionChange` even when nothing changed;
- `Ctrl`/`Cmd` + click: toggling, and the refusal under `noUnselectLast`;
- the option's `showCheckbox` input and a projected `kbq-pseudo-checkbox` replacing the built-in one;
- the value listing option values in option order whatever the order of selection;
- an option deselected when its new value no longer matches the value the list holds;
- `selectAll()` and `deselectAll()` emitting neither `selectionChange` nor `onSelectAll`;
- the `kbq-disabled` class on the list host and the `kbq-list-option_multiple` class;
- in the list: the group named by its label, and keyboard navigation skipping the options of a disabled group;
- the option content slots: icon before the text, action after it;
- `Shift`+`Tab` from the action back to its option;
- arrow navigation not wrapping;
- the `noUnselectLast` guard on `Space`, `Enter` and `Shift` ranges;
- typeahead: it does not select, the text it matches includes the caption, and it wraps around;
- the default action of `Ctrl`/`Cmd` + `A` and `Ctrl`/`Cmd` + `C`: prevented by the default handlers, left alone with an `onCopy` subscriber;
- the select-all row keeping the built-in toggle under a custom `selectAllHandler`, and staying out of typeahead;
- `aria-hidden` on the drop indicator;
- an option moved into a connected list arriving unselected; no indicator in a list connected by `id`;
- the listbox having no accessible name of its own.

## loader-overlay

Change: `document-loader-overlay-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Both overview pages say the default text is "Loading" («Загрузка»). The overlay has no default text: `text` defaults to `undefined`, and without it only the spinner shows. The `loader-overlay-default` example passes "Загрузка" itself.
2. "Elements behind the overlay must not be accessible for focus, selection, or clicking" and "The system prevents focusing on form elements covered by the overlay". The overlay only intercepts pointer input over its area. It does not trap focus or make the covered content inert, so Tab still reaches covered controls.
3. "Vertical alignment" describes centering with optical compensation (40% of the content height) and a fixed top offset of 72 px. The overlay only centers its column. The `fixed-top` attribute in the `loader-overlay-fixed-top` example and in the dev app matches no input, directive or style and changes nothing; the example renders the same as a centered overlay.
4. "Padding from the overlay edges is 10% of its width" and "Maximum width of the text and caption under the spinner is 480px". The overlay has one horizontal padding token (`--kbq-size-3xl` for every size), its column is 80% wide, and the text and caption are capped at 90% of the column. Nothing limits them to 480 px.
5. The JSDoc of `size` says it sets the size "of its default indicator". For `normal` the indicator is the big spinner, since the spinner has no normal size.
6. The JSDoc of `surface` and the class `kbq-loader-overlay_transparent` call the non-solid surfaces transparent. They are translucent tints of the surface at `--kbq-opacity-overlay`.

**Suspected defects (from reading the code, not reproduced)**

1. The overlay gives assistive technology no signal: no `aria-busy` on the parent, no live region, no role or name on the spinner. With the covered content still focusable and in the accessibility tree, a screen reader user can operate a block that sighted users see as blocked. No axe test renders the overlay.
2. Two overlays in one parent: destroying either removes `kbq-loader-overlay_parent` while the other is still shown, and the remaining overlay loses its containing block. The same happens when the consumer put that class on the parent themselves.
3. A marker attribute whose directive is not imported, for example by a standalone consumer that imports only `KbqLoaderOverlay`, is not recognized: the default part is shown and the marked element is silently dropped. A marker nested inside a wrapper element is recognized by the content query, which hides the default part, but projection matches only top-level nodes, so nothing is shown.
4. `.kbq-loader-overlay_parent { position: relative }` has the specificity of one class. Depending on stylesheet order, it can override a parent that is `absolute`, `fixed` or `sticky`, and move that parent.
5. `KbqLoaderOverlayModule` imports `A11yModule` and `PlatformModule`, which the overlay does not use. They appear in the public typings of the module.

**Tests whose name and body disagree, or that cannot fail**

- "should render params" and "should render only spinner with modifier" assert `expect(indicatorElement).toBeDefined()`. `DebugElement.query` returns `null`, never `undefined`, when nothing matches, so these assertions cannot fail.
- "should render external params" does not check that the default spinner is gone once an indicator is projected, nor that a bound `text` or `caption` would be ignored.
- "should preserve the transparent input behavior without a background" asserts the opaque `filled` surface, which is the one variant with a full background. "Without a surface" seems to be meant.
- The e2e test "card" covers only the deprecated `card` input inside a modal. `surface="card"` is covered by the "surfaces" screenshot, so the "card" test loses its purpose when the input is removed.

**Behaviour without a test.** The spec states these from the source:

- the indeterminate mode of the default spinner;
- an empty `text` or `caption` rendering nothing, and a caption without text;
- the fixed order of indicator, text and caption;
- a projected caption alone clearing `kbq-loader-overlay_empty`;
- `kbq-loader-overlay_parent` being added to and removed from the parent (the screenshots depend on it only indirectly);
- covering the parent and inheriting its corners (backed only by the screenshots);
- disappearing at once when removed, with no animation;
- pointer input landing on the overlay;
- keyboard focus not being blocked;
- the default spinner not being rendered next to a projected indicator;
- a projected text or caption winning over a bound input;
- the marker classes on projected elements;
- unmarked content not being rendered;
- the absence of `role`, `aria-busy` and `aria-live`.

## markdown

Change: `document-markdown-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Line break" section of `markdown.en.mdx` and `markdown.ru.mdx` says that with `markdownText` you need `\n` at the end of the line and `{ breaks: true }`. Neither is quite right:
    - `\n` becomes a newline only inside a TypeScript string or an inline template literal, as in the example; in an external `.html` template, `markdownText="a\nb"` passes a backslash and an "n".
    - `breaks: true` is not needed: two trailing spaces before the newline give a `br` with the default options, as they do for projected content.
2. The docs do not say that projected content needs `ngPreserveWhitespaces` on `kbq-markdown`, although every example and test uses it. They also do not say that the projection is read as plain text, so markup characters have to be written as entities and elements lose their tags.
3. The docs do not say that the output is not sanitized. Only the JSDoc of `KbqMarkdownService.parseToHtml` says so, and the service is `@docs-private`, so the API tab hides it.
4. The docs never name `KBQ_MARKDOWN_MARKED_OPTIONS` or `kbqMarkdownMarkedOptionsProvider`; only the source of the line-break example shows the provider.
5. The comment on the whole-tag list says `th` and `p` are kept apart only to avoid matching `thead` and `pre`. The same rule also skips a `th` or `p` that has attributes (see suspected defect 3).
6. The examples `markdown-line-break` and `markdown-line-break-with-markdown-text-input` share the title "Markdown line break", and `markdown-overview` is titled "Markdown headers".

**Suspected defects (from reading the code, not reproduced)**

1. `KbqMarkdown` imported on its own, without `KbqMarkdownModule`, seems unable to start. `KbqMarkdownService` is `@Injectable()` without `providedIn`, and only the module provides it, so creating the component should fail with a missing-provider error. AGENTS.md treats the modules as legacy and the components as standalone; every test and example imports the module.
2. Raw HTML in the source reaches the DOM without sanitization, so an event-handler attribute such as `onerror` on an `img` runs. With `markdownText` bound to user input, this is a script-injection path.
3. Header cells of aligned table columns get no `kbq-markdown__th` class, because `th` is aliased only without attributes. The snapshot tests lock this in.
4. Inserting the alias `class` in front of an existing `class` attribute leaves two `class` attributes, and the browser keeps the first. A fenced code block loses its `language-*` class, which syntax highlighters look for, and a raw HTML element of a listed tag loses its own classes.
5. `async: true` in the options, or an async extension registered with `marked.use()`, makes `marked.parse` return a promise. The service treats the result as a string, so rendering would throw a `TypeError`.
6. The component calls the global `marked` instance, so `marked.use()` or `marked.setOptions()` anywhere in the application changes every `kbq-markdown`. This is not documented.
7. An ordered list that starts at another number, such as `3.`, gets `start="3"`. However, the styles hide the native numbers and count the items with a CSS counter that starts from zero, so the list seems to display from "1.".
8. Projected content is read only in the browser, so prerendered pages, the docs site included, carry an empty output for projected Markdown until the application starts.
9. The `--kbq-markdown-*-max-width` tokens, `--kbq-markdown-size-max-width: 650px` among them, are declared, but no style rule reads them.

**Tests whose name and body disagree, or that cannot fail**

- "should generate html from markdown string" builds its fixture in a TypeScript string, where `&#32;&#32;` is entity text, not two spaces. The line-break part of the fixture therefore renders no `br` (the snapshot shows "First line" and "Second line" in one text node), while the same lines in the inline-template test do. The fixture reads as if it tested hard breaks for the input.
- "should customize the scrollbars of the host and of the rendered content" asserts only the two host classes; nothing about the rendered content is checked.
- The two snapshot tests assert the whole DOM, so the quirks in suspected defects 3 and 4 are locked in without a test that names them. A fix shows up only as a snapshot diff.

**Behaviour without a test.** The spec states these from the source:

- re-rendering when `markdownText` changes to another non-empty text (only the change to `null` is tested);
- falling back to the projected content when `markdownText` is an empty string;
- elements in the projection contributing only their text;
- the projected source not being displayed (the e2e screenshot shows it only implicitly);
- projected content rendering only in the browser;
- `KBQ_MARKDOWN_MARKED_OPTIONS`, which has no unit test; the e2e screenshot of the `breaks: true` case backs it;
- the event-handler attribute surviving, that is, the component not sanitizing (the service suite shows only a harmless `abbr` passing through);
- links getting no `target` and not going through the router, and a link title being kept;
- the caption under an image being displayed on a line of its own.

## modal

Change: `document-modal-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The keyboard table of `modal.{en,ru}.mdx` says Ctrl + Enter "performs the primary dialog action". It clicks only an element marked `kbq-modal-main-action`, plus the OK flow of the confirm layout. The predefined OK button of the default layout carries no marker, so a default dialog with `kbqOkText` ignores the shortcut. Cmd + Enter does nothing on macOS.
2. The predefined OK button always carries `autofocus`, which beats every `kbqAutoFocus` value but `false`. With `kbqOkText` set, the OK button gets the initial focus. That contradicts:
    - the docs line that the first tabbable control "for a dialog with a header" is the close button;
    - the advice to set `kbqAutoFocus: 'dialog'` for a long scrolling dialog;
    - the JSDoc of `KbqModalAutoFocus` for `'first-tabbable'`.
3. The JSDoc of `delete()` says it opens a dialog "styled for a destructive action". Nothing styles `kbq-confirm-warn`, so `delete()`, `success()` and `confirm()` render the same. `kbqOkType` is a `KbqButtonColor`, which has no error color.
4. The JSDoc of `kbqOkType` says it colors "the predefined OK button". The default layout always renders that button in the contrast color; only the confirm layout reads `kbqOkType`.
5. In `IModalButtonOptions`:
    - the comment on `autoLoading` says it controls the automatic progress state. The progress state is shown for any promise returned by `onClick`, whatever `autoLoading` says;
    - `shape`, `ghost` and `size` are never rendered.
6. The JSDoc of `ModalOptions.kbqVisible` says the service manages it. Passing it to the service breaks the open flow (suspected defect 4).
7. The JSDoc of `create()` says that destroying the opener "closes" the dialog. A comment in the service also claims that `afterClose` then emits. In fact the dialog is torn down without `beforeClose` or `afterClose` and without restoring focus.
8. The JSDoc of `kbqContent` says it "falls back to `<ng-content>`". In the custom layout neither string or template content nor projected content is rendered.
9. The docs say the dialog closes "on a left mouse button click". It reacts as soon as the button is pressed on the area around the dialog, not to the click.
10. The Position section says opening a dialog must not shift the page sideways. The scroll lock sets `overflow: hidden` on the body and does not make up for the width of a classic scrollbar.
11. The examples page says a `kbqComponent` is created from the root environment injector. It is created from the injector of the `KbqModalService` instance. `KbqModalModule` still lists `KbqModalService` in its providers, so a lazily loaded module that imports it gets an instance of its own.
12. The JSDoc of `kbqComponent` calls it "the instance of component"; it takes a component class.

**Suspected defects (from reading the code, not reproduced)**

1. A declarative dialog is registered once, on init, and unregistered when it first finishes closing. On every later opening it is missing from `openModals`, `closeAll()` does not close it, and `afterAllClose` ignores it.
2. The dim-layer hand-over runs only when a dialog registers while it is already shown, which is the service path. A declarative dialog opened over another shown dialog after its own init keeps both dim layers, against the docs' "only one dim overlay should remain".
3. `closeAll()` closes only the dialogs in `openModals`, so a dialog still in its opening animation stays open.
4. `kbqVisible: true` passed to the service turns the service's `open()` call into a no-op. The dialog is painted and focused, but:
    - `afterOpen` never emits and the dialog never enters `openModals`;
    - the body is not locked and the page is not made inert;
    - it never counts as the topmost dialog, so over another shown dialog it is made `inert` itself.
5. A promise from `kbqOkClick` or `kbqCancelClick` that rejects closes the dialog, with the rejection reason as the close result.
6. A dialog closed during its opening animation still settles the opening: `afterOpen` emits after `beforeClose`, the dialog enters `openModals` until it finishes closing, and the closing animation is cut short.
7. The progress state of an array footer button is cleared on a plain object once the promise settles, with nothing marking the dialog for check. Under the zoneless, `OnPush` setup the spinner can stay until something else checks the dialog.
8. `confirm()` and `open()` write `kbqModalType` and `kbqClassName` into the options object the caller passed. Reusing one object for two `confirm()` calls repeats the `kbq-confirm` classes.
9. The scroll lock removes the body's inline `overflow` when the last dialog closes, instead of restoring a value the page had set before.
10. `triggerOk()`, `triggerCancel()` and the predefined buttons run the handler, or emit `kbqOnOk` and `kbqOnCancel`, even when the dialog is already closed or closing. Only the close button, Escape and the dim layer check that the dialog is shown.
11. A composed title, caption or footer registers itself for good. If it is rendered conditionally and removed, `aria-labelledby` or `aria-describedby` points at a missing id, and the dialog still counts as having a footer.

**Tests whose name and body disagree, or that cannot fail**

- "should process kbqPreventFocusRestoring flag set to true" and "… set to false": there is no such option. The tests set `kbqRestoreFocus`, and the one named "true" passes `false`.
- "should set focus inside modal when opened by dropdown" calls `showConfirm()` directly and never activates the dropdown item. The dropdown items are only counted.
- "should close on Escape and emit kbqOnCancel first" checks the count and the visibility, not the order.
- "should return/receive with/without result data" covers only the case without a result.
- "should trigger kbqOkClick/kbqCancelClick" calls `triggerCancel()` on a dialog `triggerOk()` has already closed. It passes only because of suspected defect 10.
- "should modal not be registered twice" reaches the private registry through `as any`.
- "should close all opened modals (include non-service modals)" and "should show only one mask at a time" use a declarative dialog that is shown from its first render, the one case where suspected defects 1 and 2 do not apply.

**Behaviour without a test.** The spec states these from the source:

- `beforeClose` and `kbqBeforeClose`;
- closing through the `[(kbqVisible)]` binding without the Cancel flow, the initial visibility of a declarative dialog, and `kbqGetContainer`;
- the classes added by `confirm()`, `success()` and `delete()`;
- in the confirm layout: ignoring `kbqTitle`, `kbqCaption`, `kbqClosable` and `kbqFooter`, the development-mode warning, and `kbqOkType`;
- what the custom layout leaves out;
- strings rendered as sanitized HTML, template title, caption and footer, and a footer template replacing the predefined buttons;
- `kbqComponent` winning over a component in `kbqContent`, `getContentComponent()`, and `KbqModalRef` injected into the content (only the docs examples use it);
- the asynchronous handler: its progress state and its resolved value as the close result. Also the returned value of a synchronous handler as the close result, `kbqOkLoading` and `kbqCancelLoading`, and the progress state of a footer button whose `onClick` returns a promise;
- `kbqMaskClosable` defaulting to `false` and needing `kbqMask`, `kbqMask: false` and `kbqMaskStyle`;
- Ctrl + Enter doing nothing in a default dialog that has only the predefined buttons;
- live regions left reachable while the page is inert, and the scroll lock released after a normal close;
- `kbqWidth`, `toCssUnit`, `kbqStyle`, `kbqBodyStyle` and `kbqWrapClassName` (the last only as a query selector);
- `kbqAutoFocus: 'first-heading'`;
- switching the locale and `[localeOverrides]`;
- the `kbq-modal-overlay` class and the teardown on router navigation;
- a dialog still opening being absent from `openModals`;
- the `kbqModalTitleActions` slot.

## navbar

Change: `document-navbar-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. `examples.navbar.en.mdx` and `examples.navbar.ru.mdx` say to declare the templates inside `<kbq-navbar>` so that the navbar keeps managing "responsive collapsing of the items". The `navbar-template-outlet` example renders a `kbq-vertical-navbar`, which has no responsive collapsing.
2. The same pages say an icon without `kbqNavbarItemSuffix` "is shown before the title, wherever it is written". Only an icon written directly in the item is moved there. An icon wrapped in another element is rendered after the title, yet it still counts as the leading icon when the horizontal navbar decides what can collapse.
3. The JSDoc of `KbqNavbarItem.collapsed` says it "collapses the item regardless of what the ambient navbar decided". In a horizontal navbar the next fitting pass overwrites it. In a vertical navbar it changes `isCollapsed()`, the `aria-label` and the tooltip, but not the presentation, which follows the navbar's `kbq-collapsed` class. The member is also write-only: reading `item.collapsed` returns `undefined`.
4. The JSDoc of `collapsedText` on the item mentions only the tooltip of a collapsed item. It also replaces the title in the tooltip of a cut title and in the accessible name of a collapsed item.
5. The overview page says nothing about:
    - responsive collapsing, `collapsable` and `collapsedText`;
    - `disabled` and the tooltip inputs;
    - keyboard navigation and the `Ctrl` + `/` shortcut;
    - `aria-label` for the landmark and for icon-only items;
    - the toggle strings and `localeOverrides`.
6. `KBQ_NAVBAR_LOCALE_CONFIGURATION` and `KBQ_NAVBAR_DEFAULT_LOCALE_CONFIGURATION` each carry two JSDoc blocks. Only the last one, `@docs-private`, applies, so the tokens that the deprecation notes point to are hidden from the API tab and lose their description.
7. `updateExpandedStateForItems()` is `@docs-private`, yet it is the only way to re-fit a horizontal navbar whose own width changed without a window resize. The navbar dev app calls it through a `KbqNavbar`-typed view query that points at a `kbq-vertical-navbar`, from a method its template never calls.
8. The `exportAs` of the vertical navbar is `KbqVerticalNavbar` with a capital K, while items and brands use `kbqNavbarItem` and `kbqNavbarBrand`; `kbq-navbar` has none.

**Suspected defects (from reading the code, not reproduced)**

1. The vertical navbar passes every key except the vertical arrows and Tab to its key manager, including characters typed into a `kbqInput` field inside it. 200 ms after a letter that starts an item title, focus would jump from the field to that item. The horizontal navbar guards against this.
2. Outside a `kbqInput` field, both navbar components prevent the default action of the arrow keys, Home, End, PageUp, PageDown, Backspace and Delete. A plain `<input>`, or a field of another library, inside a navbar cannot delete text or move its cursor with these keys.
3. Only a projected `kbq-button` is taken out of the tab order. The control of a `kbq-form-field` keeps its tab stop, so Tab from an earlier item lands in it instead of leaving the navbar.
4. An item becomes active only when the item element itself receives focus. Clicking straight into a field inside an item leaves the previous item active, so Left and Right at the edges of the text move relative to that item.
5. The `[kbq-navbar-container]` attribute form is projected but gets no `kbq-navbar-container` class, because the directive selector matches only the element, so it loses the container layout and spacing.
6. The suffix and the dropdown chevron are rendered only while the item has a title: a suffix on an item without a title is dropped, and an icon-only dropdown item shows no chevron.
7. A brand on anything but `<a>` that is interactive by itself, such as `<button kbq-navbar-brand>`, is treated as decorative: it has `tabindex="-1"` and the arrow keys skip it, so it cannot be reached from the keyboard.
8. A disabled item does not cancel clicks; only `pointer-events: none` keeps the pointer away. A click dispatched by code or by assistive technology still runs its click handlers and follows its link, and Enter or Space on a disabled item that has focus clicks it. The disabled brand cancels them.
9. When the navbar widens, collapsed items are expanded starting from the last one, the same order they were collapsed in. A partial widening can expand a later item while an earlier one stays collapsed.
10. Only a window `resize` makes the horizontal navbar fit its items again. A navbar whose own width changes, for example when a sidebar beside it collapses, keeps overflowing or keeps items collapsed until the next window resize.
11. The `Ctrl` + `/` shortcut is caught on the window wherever focus is, text fields and code editors elsewhere on the page included. It does not prevent the default action and does not check Shift or Alt, so a page that uses the same keys for something else also toggles the navbar.
12. The horizontal key manager is fixed to left-to-right, and a vertical dropdown item opens on Right whatever the direction. In a right-to-left layout, Right moves focus to the item on the visual left.
13. `openOver` and `expanded` have no boolean transform. A bare `openOver` attribute passes `''`, which leaves the mode off, and fails type checking under strict templates.
14. In a vertical navbar, every tooltip refresh of an item or brand sets its placement to `right`, overriding a bound `kbqPlacement`.
15. The host's tab index counts every focusable element, enabled or not. A navbar whose only focusable elements are disabled or decorative keeps `tabindex="0"`, and tabbing into it leaves focus on the host.

**Tests whose name and body disagree, or that cannot fail**

- "items should not allow click if disable": the click handler of `TestApp` returns early for a disabled item, and jsdom ignores `pointer-events`, so the test passes whatever the navbar does.
- "a navbar item should stop the dropdown opening on Down Arrow" presses no key and asserts only the trigger's `openByArrowDown` flag. In a horizontal navbar the item opens the dropdown on Down itself; the fixture is a vertical navbar.
- "collapsed elements should have title" collapses the items itself and checks their tooltip content; it neither exercises the navbar's collapse nor checks a title.
- "RIGHT_ARROW key should pass event to keyManager" and "LEFT_ARROW key should pass event to keyManager" spy on the internal key manager; they pass whether or not focus moves.
- "ENTER should activate a bare item" and "SPACE should activate a bare item" use the literal key codes 13 and 32 although `ENTER` and `SPACE` are imported, and do not check that the default action is prevented.
- The `E2eHorizontalNavbarStates` and `E2eVerticalNavbarStates` fixtures mark items disabled with `class="kbq-disabled"`, so the disabled screenshots never go through the `disabled` input and carry no `aria-disabled`.

**Behaviour without a test.** The spec states these from the source:

- content outside a container not being rendered, and the `kbq-navbar-logo` and `kbq-navbar-divider` classes;
- the horizontal dropdown chevron and its absence on a vertical bento item;
- a width change without a window resize not re-fitting the items;
- `expandedChange` being emitted;
- the expanded navbar lying over the content with `openOver`, beyond the host class;
- the toggle's custom icon, its tooltip being placed to the right and hidden on toggle, and the toggle being hidden until the navbar is hovered or holds keyboard focus;
- the missing-provider error of a toggle outside a vertical navbar;
- the shortcut not preventing the default action;
- the bento title being revealed on hover, keyboard focus, `kbq-active` and `kbq-pressed`;
- `kbqTooltipDisabled` on a brand, and the tooltip defaults: hover only, no arrow, no offset, right placement in a vertical navbar;
- a projected `kbq-button` being taken out of the tab order;
- focus actually leaving the navbar on Tab and Shift+Tab, beyond the host's tab index;
- the arrow keys stopping at the ends, Up and Down doing nothing in a horizontal navbar, and Left and Right doing nothing in a vertical one;
- the default action of the navigation keys being prevented, and Home, End, PageUp and PageDown not moving focus;
- a click making a brand or a toggle element the active element;
- typeahead;
- Left and Right at the edges of a `kbqInput` field;
- focus moving into the control of a nested `kbq-form-field`;
- Down opening the dropdown of a horizontal item, Right opening that of a vertical item, and Down not opening it in a vertical navbar;
- a disabled item ignoring the pointer (the unit test cannot fail, see above);
- the `horizontal` orientation of a divider in a vertical navbar;
- the stacking order of the navbar, the open-over navbar and the toggle;
- `[localeOverrides]` on a vertical navbar.

## notification-center

Change: `document-notification-center-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `placement` ("Placement of popUp") and the `kbqNotificationCenterPlacement` input suggest the panel can be placed. The bound value is stored, but the panel keeps opening on the right (see the first suspected defect).
2. The JSDoc of `offset` ("Offset of popUp") and of `backdropClass` ("Class that will be used in the background") describe effects that never happen: the panel never gets the placement class the margin helper looks for, and the overlay is created with `hasBackdrop: false`.
3. The JSDoc of `popoverHeight` says the default is `calc(100vh - <navbar height>)`. That holds in popover mode only; the input also sets the height of the side panel, whose default is `100vh`.
4. The JSDoc of `onRead` says it "emits a notification the moment it flips from unread to read". It is a `BehaviorSubject`, so a new subscriber first receives `null` or the last notification read, long after the fact.
5. The JSDoc of `hasMore` and the docs ("page by page as the user scrolls to the bottom") describe `onNextPage` as a scroll event. It also fires without any scroll: when the panel opens with a list that does not fill it, and after every state change of the service, `setSilentMode()` and `push()` included, while the list is at its end. `hasMore()` is `true` by default, so a consumer that never pages still gets these emissions.
6. In `KbqNotificationCenterLocaleConfiguration`, `remove` is documented as the name of "a single notification's remove button", but it also names the group delete button and is its tooltip. `removeAll` is documented as the label of the delete-all action, but it is only its tooltip: the accessible name comes from `a11y.removeAll`, so overriding `notificationCenter.removeAll` leaves the name unchanged, and in `en-US` the two differ ("Remove all" and "Delete all").
7. The overview says the menu shows an unread counter that is hidden at 0 and reads "99+" above 99. The trigger renders no counter. It exposes `unreadItemsCounter`, and the badge is markup in the examples.
8. The overview says each item has a title and a timestamp. The time and the unread marker are rendered inside the title line, so a notification without a `title` shows neither.
9. The English error section names a "Repeat" button; the `en-US` string for it is "Try again".
10. `KbqNotificationCenterComponent` is `@docs-private`, yet the module exports it and the e2e fixtures render it in place. The docs page does not say whether that is supported. `KbqNotificationCenterTrigger` itself has no JSDoc.
11. The JSDoc of `KbqNotificationItem.style` says it selects the built-in icon. A style other than `contrast`, `success`, `warning` or `error` renders an empty icon container.

**Suspected defects (from reading the code, not reproduced)**

1. `kbqNotificationCenterPlacement` does not move the panel. The trigger's constructor sets a placement priority of `right`, `rightBottom`, `rightTop`, and the positions come from that priority whenever one is set; the input only changes `placement`. Only `popoverMode` replaces the priority.
2. `offset` (default 8) is never applied. The margin helper looks for a `kbq-notification-center_placement-*` class on the panel host, but the panel never binds the class map its trigger computes.
3. `backdropClass` has no effect, because the overlay never has a backdrop.
4. `kbqNotificationCenterPanelClass` is passed to the overlay as one token. A value with several space-separated classes reaches `classList.add()` whole, which throws `InvalidCharacterError`. A change after the first open is ignored, because the overlay is created once.
5. Every close moves focus to the trigger, including a close caused by an outside click or an outside scroll. A user who clicks into a text field elsewhere on the page while the panel is open loses that focus to the trigger.
6. The silent-mode switch is named after the current mode in the wording of an action: while pop-up notifications are on, it reads "Turn on notifications" in `en-US`. The two menu options show which mode is active only with a visual mark; they carry no checked state.
7. The delete buttons of every row and every day group share one accessible name ("Delete" in `en-US`), with nothing to tell the notification or the day apart.
8. `[disabled]` on a plain `<button>` trigger, without `kbq-button`, is taken by the directive's input, so the button itself stays enabled and focusable, and the trigger sets no `aria-disabled`.
9. `scrolledToBottomOffset` and `popoverMode` are handed to the panel only when it opens; a change while it is open is ignored, unlike `popoverHeight`.
10. A `<kbq-notification-center>` rendered in place moves focus to its silent-mode switch as soon as it renders, as it does when opened from a trigger.

**Tests whose name and body disagree, or that cannot fail**

- "opens on click, and a repeat click is not a toggle": the second click's outside-click handler calls `hide()` from inside a timer, so the panel's zero-delay hide timeout fires 1 ms later on the fake clock, and `runOnlyPendingTimersAsync()` never runs it. The assertion passes whether or not the second click closes the panel, and reading the code suggests that in a browser it does.
- "keeps the side placement when popoverMode is explicitly turned off" and "falls back to the default placement" read only the `placement` property, never where the panel is, which is where the first suspected defect hides.
- "traps focus inside the panel" checks only that the focus trap directive is enabled; the Playwright test "focus stays inside the open panel" is the one that tabs.
- "scrolls the list smoothly by default" checks only that `kbq-animations-disabled` is absent. The unit tests load no stylesheet, so the smooth scrolling itself is never observed.
- "shows the bottom "load more" spinner without replacing the list" opens an empty panel, so there is no list to replace. Its second assertion, that the full-size loader is absent, cannot fail, because `setLoadingMore()` never shows that loader.
- The Playwright test "the delete buttons are reachable with the keyboard" only expects a group delete button in the tab order, not a row delete button.

**Behaviour without a test.** The spec states these from the source:

- Space on the trigger opening the panel;
- disabling an open trigger closing it;
- the trigger classes `kbq-notification-center_open` and `kbq-active`;
- `kbqNotificationCenterPanelClass` on the overlay pane;
- the default side position and its fallbacks, and `kbqPlacementChange`;
- an outside click closing the panel, and a click in the silent-mode menu not closing it;
- the close button closing the panel;
- the label, tooltip and icon of the silent-mode switch, the "show pop-up notifications" option and the mark on the active option;
- the delete-all button staying visible in loading and error modes;
- `content`, `actions`, `iconClass` and an `icon` template in a row;
- the `HH:mm` time, which only the screenshots show, and a row without a title showing no time and no unread marker;
- the delete controls hidden until hover or focus, and the time hidden while they show;
- a pointer dwell marking a notification read;
- `onRead` replaying its latest value;
- error mode winning over loading mode, and staying on after the reload button;
- the bottom retry button moving focus to the list;
- the noop animations module and reduced motion turning smooth scrolling off;
- the position and the `kbq-notification-center_popover` class in popover mode;
- the default panel heights;
- `stickToWindow` with `top`, `bottom` or `left`;
- the service failing without a `DateAdapter` or `DateFormatter`;
- `kbqLocaleOverrides` on an ancestor of the trigger;
- the status text in error mode and with the bottom error row alone.

## overflow-items

Change: `document-overflow-items-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `changes` says it "emits when the set of hidden items changes". It emits a new set after every recalculation, also when the hidden items are the same; a unit test relies on that.
2. The overview page calls the entry point a "component" that adapts "to the container width". It is three directives, and in the vertical orientation the height counts.
3. "Order of hiding" and the JSDoc of `order` do not say the direction: the item with the highest order is hidden first, the lowest first with `reverseOverflowOrder`. Nor do they say that an item without `order` takes its index, so explicit values compete with indices; the example works around it with `±Infinity`.
4. The `@title` of the `overflow-items-with-order` example is "Overflow items result offset".
5. The ResizeObserver section talks about the browser window being resized. The container observes itself and `document.body`, not the window, and binding `additionalResizeObserverTargets` replaces `document.body` instead of adding to it, which the page does not say.
6. These have no place in the overview page:
    - `kbqOverflowItemsResult`, `hiddenItemIDs` and `changes`, which appear only inside the examples;
    - `wrap`, which appears only on the examples tab;
    - the inline layout styles the container forces on its host;
    - the rule that items must be direct children of the container;
    - that items should not shrink: every test fixture sets `flex-shrink: 0`, and because rendered sizes are measured, shrinkable items are squeezed before any is hidden (not reproduced).
7. `ElementVisibilityManager` is in the public API golden file without the `Kbq` prefix the conventions require. It is marked `@docs-private` but can be imported.

**Suspected defects (from reading the code, not reproduced)**

1. The available space is the container's border-box size minus its padding. Its borders are not subtracted, so a bordered container (every docs example has a 1 px border) overestimates the space by the border widths, and the last visible item can be clipped.
2. A CSS `gap` between items is not counted, so with a gap the visible items can overflow the container and be clipped.
3. Changing `wrap`, `order`, `alwaysVisible` or an item's `kbqOverflowItem` value does not trigger a recalculation. An item that is hidden and then made always visible stays hidden, and `hiddenItemIDs` keeps a stale ID, until something else triggers one.
4. Only the container and the resize targets are observed. An item or the result element that changes size on its own (new text, late content, a font loading) does not trigger a recalculation. The e2e test of `additionalResizeObserverTargets` changes the result width together with the target and relies on the target.
5. `[order]="null"` or `[order]="undefined"` goes through `numberAttribute` and becomes `NaN`, not `null`. The item then does not fall back to its index, the sort comparator returns `NaN`, and the processing order is unspecified. A non-numeric string does the same.
6. `show()` removes the inline `visibility` and `position` of the element, including values the consumer set, for example through a `[style.position]` binding on an item.
7. Before the first recalculation, and for good on the server, every item and the result element are shown, so the result reads "and 0 more" and the row overflows until the browser recalculates.
8. Duplicate `kbqOverflowItem` values collapse in the set, so a counter built on `hiddenItemIDs().size` shows too few items. The JSDoc asks for unique values, but nothing warns.

**Tests whose name and body disagree, or that cannot fail**

- The two `sortItemsByOrder` tests pass their items already in the expected order, so they also pass if sorting is removed. Both call a private method with hand-made objects.
- "should recalculate hidden items without kbqOverflowItemsResult and emit hidden IDs" wraps the trigger in `expect(...).resolves.not.toThrow()`. On a promise that resolves to `undefined` that assertion returns without checking anything; only a rejected promise would fail it. In jsdom nothing is hidden, so the "hidden IDs" are always an empty set.
- "should keep hiddenItemIDs empty before first recalculation and update after resize": the "update" is a new empty set object; nothing can be hidden in jsdom.
- "should render result" only checks that the result element is an `HTMLDivElement`.
- The `orientation` and `reverseOverflowOrder` tests spy on the private `getHiddenItems` and count calls; they do not check the outcome.
- "should reflect the set emitted by changes output" emits on the output by hand and does not go through a recalculation.
- The e2e "should recalculate hidden items on resize when debounceTime is configured" does not observe the delay; it also passes with `debounceTime` 0.
- The e2e "should prevent hiding item with alwaysVisible attribute when reverseOverflowOrder is enabled (vertical orientation)" checks only the first visible item, not how many are visible.
- `e2e.playwright-spec.ts:163` keeps a change-history comment about a Karma copy-paste bug.

**Behaviour without a test.** The spec states these from the source:

- an item nested inside another element is not managed, and only the first result element is used;
- a plain `kbqOverflowItem` attribute gives a string ID, and the set holds the item values in processing order (no test checks the IDs of a real recalculation);
- the inline `display`, `position`, `overflow`, `flex-grow` and `flex-direction` of the container;
- the hidden state of the result element: `aria-hidden`, inline styles;
- the result element staying shown when only always-visible items are left and the content still overflows;
- the first recalculation running asynchronously with `debounceTime` 0;
- binding `additionalResizeObserverTargets` replacing `document.body`;
- `hide()` and `show()` on the result element, and the next recalculation overwriting a state set by hand;
- every item and the result element shown before the first recalculation;
- the server rendering every item and the result element shown.

## popover

Change: `document-popover-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. "Hiding the arrow" says that hiding the arrow lets the popover sit closer to the trigger. `kbqPopoverArrow` does not change the distance; only `kbqPopoverOffset` does, 8 px either way, and the example in that section binds no offset.
2. The accessibility section says that a popover opened by hover or focus does not take focus. A popover whose `kbqTrigger` also includes `click` takes focus however it was opened.
3. The accessibility section says that every closing path returns focus to the trigger. Focus is returned only when it is inside the panel at the moment the popover closes.
4. "Opening and closing" says that the popover closes on a click outside it, and the JSDoc of `hasBackdrop` says that it closes on a backdrop click. Both hold only when `kbqTrigger` includes `click`; a `hover`, `focus` or `manual` popover ignores both.
5. "Behavior when scrolling the page" says that a popover with `kbqPopoverCloseOnScroll` set to `false` never closes on a scroll. `kbqPopoverHideIfNotInViewPort`, `true` by default and never mentioned on the page, still closes a popover whose trigger scrolls out of its `cdkScrollable` container. The layering example turns it off without saying why.
6. The JSDoc of `closeOnScroll` presents `null` as the default third state. The input's `booleanAttribute` transform turns a bound `null` or `undefined` into `false`, which also switches off the `kbq-hide-nested-popup` rule; only an unbound input keeps `null`. The docs page, which says "left unbound", is accurate.
7. The JSDoc of `kbqPopoverOrigin` says to bind it before `kbqPopoverVisible`. `ngOnChanges` applies the origin before the visibility whatever the attribute order, so the advice matters only for code that writes the setters.
8. The page lists `manual` among the `kbqTrigger` values. `PopUpTriggers` has no such member (it has `program`); `manual` works only because the value is matched by substring and contains none of the listened-for names.
9. `show()` and `hide()` are `@docs-private`, so the API tab hides them, while the examples close their popovers with `popover.hide(0)`.
10. The page names neither the content inputs nor `kbqPopoverSize`, `kbqPopoverPlacement`, `kbqPopoverPlacementPriority`, `kbqPopoverHasCloseButton`, `kbqPopoverHasBackdrop`, `kbqPopoverBackdropClass`, `kbqPopoverPreventClose`, `kbqPopoverDisabled`, `kbqPopoverVisible`, `kbqPopoverContainer`, `kbqPopoverHideIfNotInViewPort` or the two outputs; they appear only in examples or on the API tab.
11. The confirmation section says that the panel has no header and no footer. It does not say that `kbqPopoverContent` and `kbqPopoverHasCloseButton`, which the directive accepts, are ignored too.

**Suspected defects (from reading the code, not reproduced)**

1. When a hover-opened panel has been entered, the pop-up base binds a `mouseleave` listener on `.kbq-popover` that hides it at once. Leaving the panel therefore seems to bypass `kbqLeaveDelay` and `kbqPopoverPreventClose`. The unit test dispatches `mouseleave` on the component host, not on `.kbq-popover`, so it never runs that listener.
2. The confirm button closes the popover with `hide()`, which does nothing while the pointer rests on the panel of a hover popover — the case the close button avoids by calling `close()`. A hover-opened confirmation popover seems to emit `confirm` and stay open.
3. A custom `kbqPopoverOffset` is written as an inline margin only when the panel becomes visible. After a later flip of the placement, on scroll or resize, the margin stays on the old side and the new side gets the 8 px of the stylesheet.
4. A `hover`, `focus` or `manual` popover with `kbqPopoverHasBackdrop` renders a backdrop over the page that no click closes; only Escape in the panel or code does.
5. Whether the `kbq-hide-nested-popup` rule applies is decided once, after the first render. Writing `closeOnScroll` in code later neither adds the rule nor removes it.
6. A `kbqPopoverPlacementPriority` made only of unknown names leaves the position strategy without positions, which the CDK rejects when it positions the panel.

**Tests whose name and body disagree, or that cannot fail**

- "should hold the panel open for the default leave delay": its comment says the scheduled hide hands the delay on to the panel for a second period, while the code hides with `hide(0)` after one. The test checks for the close only after 1,000 ms, so it cannot tell a 500 ms close from a doubled one.
- "kbqTrigger = hover" asserts a leave delay after the pointer leaves the panel, and its comment credits "the panel's own zero-delay hide" — the listener of suspected defect 1, which the test never triggers.
- "kbqTrigger = focus" checks the content right after the `focus` event, before the panel's show timer has run. The content is in the DOM as soon as the overlay attaches, so the test passes even if the panel never becomes visible.
- "should arm the focus trap and claim focus for a click open" says that the Playwright suite covers focus landing in the panel. No Playwright test asserts it: the one e2e panel closed with Escape has nothing tabbable, so focus stays on the trigger there.
- "Can set kbqPopoverHeader", "Can set kbqPopoverContent" and "Can set kbqPopoverFooter" destroy the fixture because "a hover popover keeps a watchdog interval running". There is no interval any more; the hover hide is driven by events.

**Behaviour without a test.** The spec states these from the source:

- closing from a template reference with `popover.hide(0)`;
- re-applying the position when an input changes while the panel is open;
- the preset widths, the `custom` size and the 480 px maximum height (the widths only in a screenshot);
- the distance kept when the arrow is hidden, and a custom `kbqPopoverOffset` value;
- the fallback list, the push into the viewport and unknown names in `kbqPopoverPlacementPriority`;
- following the page scroll by default, and `KBQ_POPOVER_SCROLL_STRATEGY`;
- the `kbq-hide-nested-popup` rule;
- `kbqPopoverHideIfNotInViewPort` (only its default is tested);
- pinning to a window or container edge (only the dropped arrow is tested);
- `kbqPopoverConfirm` ignoring the header, footer, content and close button, and the `role` and `aria-label` of its panel (covered only by axe);
- the first half of "Repositioning on request";
- `kbqTrigger` configuring a `kbqTooltip` on the same element;
- the pointer returning to the host within the leave delay;
- the default delays of `show()` and `hide()`;
- an outside click on the host itself, clicks in overlays opened after the popover, and non-click popovers ignoring outside clicks;
- an Escape already spent, on the host or in the panel;
- `kbqPopoverPreventClose` against the close and confirm buttons, `close()`, `hide()`, `kbqPopoverVisible`, a touch, a scroll and disabling;
- a disabled popover not opening;
- Tab cycling inside the panel;
- focus landing in the panel (only the call to the focus trap is tested);
- the scrollable content region;
- `kbq-popover_open`, the whitespace-separated `kbqPopoverClass` and the pane class `kbq-popover__panel`;
- the locale name of the close button (axe only checks that it has one);
- boolean inputs bound to `null` or `undefined`.

## progress-bar

Change: `document-progress-bar-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The `color` section of `progress-bar.{en,ru}.mdx` lists four values. The input accepts every `KbqComponentColors` value and any string: `theme-fade`, `warning` and `success` add their `kbq-<color>` class, but the bar paints them with the theme fill, because only `contrast`, `contrast-fade` and `error` redeclare it.
2. The docs say values outside the range are clamped. They do not say that a non-finite value renders as zero, so `Infinity` gives an empty bar rather than a full one.
3. The JSDoc of `ariaLabel` says it takes precedence over the projected text and that the locale name is used "when neither is given". An empty string counts as given for the fallback but not for the precedence (see suspected defect 1).
4. The "Theming" section advises restyling one bar through `--kbq-progress-bar-fill`. The theme declares that property on `.kbq-progress-bar` and again on `.kbq-progress-bar.kbq-contrast`, `.kbq-contrast-fade` and `.kbq-error`, so a consumer rule with one class loses on a colored bar, and on any bar when the component styles load later. Read from the CSS, not reproduced.
5. `examples.progress-bar.{en,ru}.mdx` are "Documentation in progress" stubs. `structure.ts` sets `hasExamples: false`, so they are not routed; the two examples appear only on the overview page.

**Suspected defects (from reading the code, not reproduced)**

1. With `aria-label=""`, the host gets an empty `aria-label`. Without projected text it then has no accessible name at all, because the locale fallback is skipped (axe `aria-progressbar-name`). With projected text it carries both the empty `aria-label` and `aria-labelledby`.
2. `value` has no number transform and the finiteness check does not coerce. A string value — a static `value="30"` in a project without strict template type checking, or a string from a form control — renders an empty bar with `aria-valuenow="0"`.
3. Binding `undefined` to the `id` of a projected text removes its id, because a signal input does not fall back to its default. The bar then has neither `aria-label` nor `aria-labelledby`, since the fallback is skipped whenever a text is projected.
4. In a right-to-left layout the determinate fill grows from the right edge, but the indeterminate sweep is built on `translateX` from a left origin. Read from the CSS, the segment seems to appear in the middle of the track at the start of each iteration and leave to the right. No RTL test or screenshot exists.

**Tests whose name and body disagree, or that cannot fail**

- "should animate a new value by default" only checks that the fill lacks `kbq-animations-disabled`. jsdom runs no transition, so no test observes the animation.
- "should follow a new value without a transition when animations are disabled" only checks the same class. Nothing checks the transition is gone.
- "should pulse the indeterminate fill in place when animations are disabled" checks two classes. Neither the unit nor the e2e suite observes the pulse; the e2e reduced-motion test checks only the width of the fill.
- jsdom has no `matchMedia`, so the unit suite never takes the reduced-motion path of the animation state. Only `KBQ_ANIMATIONS_CONFIG` is exercised.

**Behaviour without a test.** The spec states these from the source:

- the `kbq-progress-bar` host class and the `kbq-progress-bar-text` and `kbq-progress-bar-caption` classes;
- `Infinity` and `-Infinity` rendering as zero;
- an indeterminate fill keeping its width while `value` changes;
- the bar being display-only (not focusable, no outputs, no key or pointer handling);
- projected content outside the two slots not being rendered;
- the width transition with motion on, and its absence with motion off;
- `provideNoopAnimations()` and `prefers-reduced-motion` turning motion off;
- the opacity pulse of the indeterminate fill;
- an `undefined` color falling back to `theme` (the unit test binds `null`, the e2e screenshot `''`);
- the `en-US` fallback name, and the `ru-RU` one without a locale service;
- overriding the fallback name through `kbqA11yLocaleConfigurationProvider` and `[kbqLocaleOverrides]`.

## progress-spinner

Change: `document-progress-spinner-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The overview page covers only `value` and `mode`. It does not mention:
    - `size`, `color` and `id`;
    - the text and caption directives;
    - that `value` is clamped for display and that non-numeric values read as 0 (the JSDoc of `value` does say so);
    - motion and accessibility.

    The indeterminate example uses `size="big"` and the colors `contrast` and `contrast-fade`, which the page never explains.

2. The examples tab is a "documentation in progress" stub in both languages. `structure.ts` sets `hasExamples: false`, so it is not routed.
3. The JSDoc of `KbqProgressSpinner` says it "reports the progress of an ongoing operation". It reports it only visually (see suspected defect 2).
4. The tokens file declares `--kbq-progress-spinner-size-compact-stroke-width` (2px) and `--kbq-progress-spinner-size-big-stroke-width` (3px), but the stroke is drawn at 13% and 6% of the box. `--kbq-progress-spinner-size-big-content-gap-vertical` is declared too, while the text of a big spinner uses the compact gap. Overriding these tokens changes nothing.

**Suspected defects (from reading the code, not reproduced)**

1. The compact arc overstates progress. The dash array and the offset are computed for 295 units, the circumference of the big circle (radius 47 in the 100-unit view box, 2π × 47 ≈ 295.3). The compact circle has radius 42.5 and a circumference of about 267. The visible compact arc is therefore about 10.5% longer than `value` says, and it closes from about 90.5%; the e2e grid draws its compact spinners at 44% as about 48.6%. Compact is the default size, so most spinners are affected.
2. Assistive technology gets nothing: no `role="progressbar"`, no `aria-valuenow`, `aria-valuemin` or `aria-valuemax`, no accessible name, and no link from the spinner to its text or caption. An indeterminate spinner is just as silent. `kbq-progress-bar` in the same library has all of these. No axe test renders the spinner.
3. `color` accepts every `KbqComponentColors` value and writes its host class, but only `contrast` and `contrast-fade` change the stroke. `error`, `warning`, `success` and `theme-fade` draw the theme stroke. The loader-overlay spec binds `KbqComponentColors.Error` to a spinner.

**Tests whose name and body disagree, or that cannot fail**

- "should move by default" and "should stand still when animations are disabled" only check that a class is absent or present on two inner elements. jsdom runs no CSS, so neither test observes motion. Both would still pass if the `kbq-animations-off()` mixin or the rotation keyframes were removed.
- "should apply class based on color attribute" binds the `color` input, not an attribute. It walks `Object.values(KbqComponentColors)`, which lists `contrast` twice (`Default` is an alias) and includes `empty`.
- The e2e `states` grid:
    - draws the default size next to `size="compact"`, so two pairs of rows are identical;
    - takes its shots with motion off (the e2e app's `KBQ_ANIMATIONS_CONFIG`, reduced motion in the browser context and Playwright's `animations: 'disabled'`), so a broken rotation would not show;
    - covers only the theme, `contrast` and `contrast-fade` colors.

**Behaviour without a test.** The spec states these from the source:

- the arc starting at the top and running clockwise, the fixed-length indeterminate arc and its rotation, and the transition of a determinate value change, all set in CSS;
- the indeterminate class going away, and the arc coming back, when the mode returns to determinate;
- `value()` keeping an out-of-range number as bound;
- the `theme` fallback for a falsy `color`, and `color.set()` on the spinner — covered only by `core/common-behaviors/color.spec.ts` on a generic host;
- the order of the text and the caption, the dropping of other content and the directive host classes — the e2e grid shows a text and a caption but asserts no DOM;
- turning motion off through `provideNoopAnimations()` or reduced motion;
- the absence of `role`, `aria-*` attributes and a tab stop;
- importing the classes without the module.

## radio

Change: `document-radio-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of the button's `change` says it fires "when the checked state of this radio button changes". It never fires when the button is unchecked. Both `change` outputs also write `<input type-"radio">` for `<input type="radio">`.
2. The group's `value` is documented as "Value of the radio button." and its `selected` as "Whether the radio button is selected." The first is the group's value; the second is a button or `null`, not a boolean.
3. The JSDoc of `KbqRadioChange` says it is "emitted by KbqRadio", a class that does not exist. For the group's event, `source` is the checked button, not the emitter.
4. `radio.en.mdx` and `radio.ru.mdx` say the group's `focus()` forwards to the checked option. When nothing is checked it goes to the first enabled button; only the JSDoc says so.
5. `big` has no JSDoc (the API report marks it undocumented), and no docs page names it. Unlike `disabled` and `required`, it does not coerce strings, so a bare `big` attribute leaves the group normal.
6. The JSDoc of `touch()` says the buttons call it "upon their blur". They also call it on every user selection, so a click marks the control touched before focus leaves.
7. The group's `change` is documented as emitted only on user interaction, but the public `emitChangeEvent()` emits it from code.
8. `examples.radio.en.mdx` and `examples.radio.ru.mdx` are "Documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so no route reaches them.

**Suspected defects (from reading the code, not reproduced)**

1. A button with no `value` inside a group whose value is `null`, which is the default, is checked: on init, because a button reads `group.value === value` and both are `null`, and again each time the group value is cleared to `null`. With several such buttons the last one stays checked. The group's `selected` is not set on init.
2. The migration guide says a button with its own `[name]` inside a group "forms its own selection group". Checking it still sets the group's `value` and `selected`, but does not uncheck the group-named button that was checked, so two buttons show as checked. Clicking the old one afterwards fires no `change`, because its native input is still checked, so the user cannot return the group value to it. The dev app's "Disabled selected buttons" groups use this pattern.
3. Two buttons with the same value in one group: writing that value seems to end, through a re-entrant uncheck, with no button checked and the group value reset to `null`, without telling the form control.
4. A `[checked]` binding on a button of a group bound to `formControl` or `ngModel` changes what the group shows without updating the control (see Decision 4), so the two can disagree from the first render.
5. The group's `focus()` targets the selected button even when that button is disabled, so focus does not move. The fallback to the first enabled button applies only when nothing is selected.

**Tests whose name and body disagree, or that cannot fail**

- "should move the group value on the change event an arrow key produces natively" sets `checked` and dispatches `change` by hand. No key is pressed, so a regression in the browser's arrow-key handling cannot fail it.
- The JSDoc of `describe('reactivity')` says it pins the contract for `disabled`, `value` and `selected`; its only test writes `disabled`.
- "should give the buttons the big size of the group" sits under `describe('accessibility')`; it checks size.
- "should deselect all of the radio buttons when the group value is cleared" passes only because every button in the fixture has a value, so it cannot catch suspected defect 1.
- "should keep an explicit name on a radio button inside a group" checks the names only, not what checking that button does to the group (suspected defect 2).
- "should report a boolean from required for a radio button outside a required group" uses a button inside a group that is not required; the name reads as if the button had no group.
- "should emit a change event from radio buttons" and the group `change` tests count calls only. No test checks the `source` or `value` of a `KbqRadioChange`.

**Behaviour without a test.** The spec states these from the source:

- the group classes `kbq-radio-group_normal` and `kbq-radio-group_big`, and `big` not coercing strings;
- the `kbq-empty` default color, a color written in code, and the error palette of a single button (only the screenshot shows it);
- a click on the hint selecting the button;
- `radios` listing the buttons and being empty before the content is initialized;
- object values matching by reference, and a button added later taking a kept group value;
- `selected` written through the property, and written as `null`;
- the button's `change` staying silent for an already checked button and for code writes;
- the payload of both `change` events and the order of the notifications;
- the native `change` and `click` events not leaving the button;
- a button outside a group checked by a click and emitting `change`, and its name falling back to its unique id after a `[name]` binding changes to `undefined`;
- the format and uniqueness of the generated group name, and no `value` attribute for a `null` value;
- `formControlName`, and code writes not reaching the form control;
- the host classes `kbq-selected` and `kbq-disabled` (only the screenshot shows them), and `tabindex="-1"` on a disabled button;
- the native `required` attribute, coercion of a bare `required`, and the absence of a validator of the group's own;
- the native keyboard: one tab stop per name, the arrow keys, Space;
- the host id, the `-input` id, the label's `for`, and the fallback for a `null` or empty `id`;
- re-rendering after code writes other than the group's `disabled`;
- `markRadiosForCheck()` and `markForCheck()`;
- the `exportAs` names.

## resizer

Change: `document-resizer-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. `resizer.en.mdx` and `resizer.ru.mdx` say the element is resized "using the mouse pointer". The directive listens to pointer events, so a pen or the first finger on a touch screen drags too.
2. The overview page documents only the direction. `cursor`, `disableSizeUpdate`, `resizeStart`, `sizeChange`, the box-model rule for the starting size, the body cursor during a drag and the missing keyboard and ARIA support are not on it.
3. `examples.resizer.en.mdx` and `examples.resizer.ru.mdx` are "Documentation in progress" placeholders. `structure.ts` sets `hasExamples: false` for the resizer, so neither page is routed.
4. The JSDoc of `sizeChange` says it emits "the new size of the element after resizing". It emits on every pointer move of the drag, the size the drag asks for: not clamped, not written at all under `disableSizeUpdate`, and not necessarily the size the element renders at.
5. The JSDoc of `KbqResizerSizeChangeEvent` calls it the event "emitted when the size of the resizable element changes". It is also the payload of `resizeStart`, and `sizeChange` emits it when nothing has changed since the previous move.
6. The overview example gives five `[0, 0]` filler cells a `(sizeChange)` handler that can never fire, and the example offers no alternative to dragging, which WCAG 2.2 success criterion 2.5.7 (Dragging Movements, level AA) asks for.

**Suspected defects (from reading the code, not reproduced)**

1. The directive sets no `touch-action` on the handle. On a touch screen the browser may take the gesture for panning and send a pointer cancel event, which ends the drag. `kbq-splitter` and `kbq-dl` set `touch-action: none` on their handles; `kbq-content-panel` and the docs example do not.
2. When a drag asks for a negative size, the browser rejects the negative pixel value, so the element keeps the last size written while `sizeChange` keeps reporting negative numbers.
3. Under `border-box` the starting size comes from `getBoundingClientRect()`, which includes CSS transforms. Inside a scaled ancestor the element jumps on the first move. In both box models the pointer travel is in screen pixels while `width` is in local CSS pixels, so under a scale the edge does not follow the pointer.
4. Two drags at once with primary pointers of different types (a mouse on one handle, a pen on another) each save the body cursor they find. If the first drag ends first, the second one later restores the first handle's resize cursor and leaves it on the body.
5. A direction change during a drag applies the new direction to the starting size and the whole travel, so the size jumps. Changing it to `[0, 0]` does not end the drag; unless `cursor` is set, the body cursor turns to `default`, and `sizeChange` keeps reporting the starting size.
6. Preventing the default action of the pointer-down event that starts a drag suppresses the compatibility mouse-down and mouse-up events, so a consumer's mouse-down listener on a handle does not run. Click and double-click events still fire, which the content panel and the description list rely on.

**Tests whose name and body disagree, or that cannot fail**

- "should fall back to the direction-derived cursor when the `cursor` input is empty" sets the input to `null`; the empty-string branch is not tested.
- "should ignore secondary buttons and non-primary pointers" moves pointer 1 after the non-primary press of pointer 2, so its `sizeChange` assertion cannot catch a broken non-primary guard. Only the body-cursor assertion would.
- The `resizeStart` test for presses "that do not start a drag" (`resizer.spec.ts:278`) covers secondary buttons and non-primary pointers only, not a `[0, 0]` handle or a second press during a drag.
- Four tests are declared `async` but await nothing: "should emit sizeChange event when resizing", "should NOT emit sizeChange event when mouse button is released (buttons = 0)", and the tests at `resizer.spec.ts:300` (no `sizeChange` without a press) and `resizer.spec.ts:436` (resizing stops on release).

**Behaviour without a test.** The spec states these from the source:

- the `kbq-resizable` and `kbq-resizer` classes and the `exportAs` names;
- nested containers, and the missing-provider error without a container;
- the sizes for `-1` directions (only their cursors are tested);
- no mirroring in a right-to-left layout;
- an empty-string `cursor` falling back to the derived one;
- `preventDefault()` on the pointer-down event that starts a drag;
- a computed size that is not a number counting as 0;
- no clamping;
- the element keeping its last written size after the drag;
- no keyboard, ARIA, stylesheet or `touch-action` of its own;
- server rendering;
- `KbqResizerModule`.

## scrollbar

Change: `document-scrollbar-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The overview says the component "supports mouse wheel, touch gestures, and keyboard controls". The scrollbar adds none of them: the content scrolls natively, the thumbs are not focusable, and the scrolling element gets no `tabindex`. A thumb cannot be dragged by touch, because only mouse events are handled.
2. The docs say `kbqScrollbarOptionsProvider` "sets the default mode", and its JSDoc says it "overrides the default scrollbar options within the given injector scope". Neither says that the keys left out are reset to the library defaults rather than inherited from an outer provider.
3. Neither docs page mentions `kbqScrollbarHideDelay` or the `hideDelay` option.
4. `structure.ts` declares an examples tab (`hasExamples: true`), but `examples.scrollbar.{en,ru}.mdx` only says the documentation is in progress.
5. The JSDoc of `scrollToElement` says it scrolls the target "into view". It always aligns the target with the top-left corner of the visible area, and moves the horizontal axis as well, even when the target is already visible.
6. The docs describe calling the methods through the `kbqScrollbar` export, and the virtual-scroll section points to `kbqScrollbarViewport`. They do not say that the directive has no export name, so its methods can only be reached through a query.
7. The docs say `flashScrollIndicators` "briefly reveals the scrollbar". That is visible only in `hover` mode: in `always` the track is already visible, and `native` and `hidden` have no track. The JSDoc of the directive says so; the component's JSDoc does not.
8. The docs say "the `behavior` parameter accepts `auto`, `instant`, and `smooth`". For `scrollToElement` and `scrollTo`, `behavior` is a key of the options object, not a parameter.

**Suspected defects (from reading the code, not reproduced)**

1. `kbqScrollbarMode` bound to `undefined` or `null` creates a track without the hover class, so the scrollbar behaves like `always` instead of falling back to the configured default.
2. `scrollToElement` and `scrollIntoView` sum `offsetTop`/`offsetLeft` up the `offsetParent` chain until they reach the scrolling element. On a `kbqScrollbarViewport` host that is not positioned, the chain skips the host and runs up to the page. The requested offset then includes the host's own position. `kbq-scrollbar` (`position: relative`) and `cdk-virtual-scroll-viewport` are positioned and not affected.
3. A selector passed to `scrollToElement` is matched inside the scrolling element, and the injected track is its first child. A generic selector such as `div` resolves to a bar when one is drawn.
4. The bars detect right-to-left from a bare `dir="rtl"` ancestor, but `scrollTo`, `scrollStart` and `scrollEnd` follow only CDK `Directionality`. Under a bare `dir="rtl"` without the `Dir` directive, `scrollEnd()` seems to request a positive `scrollLeft`, which a right-to-left element clamps to 0, so it does not move.
5. A bar is drawn only when the visible part is at most 99 % of the content. An overflow of up to 1 %, such as 10 px on a 1000 px viewport, scrolls without any bar.
6. A thumb drag or a bar press sets the inline `scroll-behavior` of the scrolling element to `auto` and then to an empty string. This wipes an inline `scroll-behavior` that the consumer set on that element.
7. A non-numeric `kbqScrollbarHideDelay` becomes `NaN`. The hide timer then fires on the next task, so a scroll barely reveals the track.
8. Any mouse button starts a thumb drag, the right button included; a unit test records this as current behaviour for a press on the bar.
9. The thumbs have `role="scrollbar"` but cannot be focused or operated from the keyboard, and the scrolling element gets no `tabindex`. A scrollable region without focusable content then depends on the browser making scroll containers focusable (axe `scrollable-region-focusable`). No axe test renders the scrollbar.

**Tests whose name and body disagree, or that cannot fail**

- "scrollToElement accepts a selector string resolved against the scrollbar" passes `'div'` and asserts only that `scrollTo` was called. A lookup in the whole document would pass too, and `div` can match the track's own bar.
- "scrollToElement accepts an HTMLElement target" asserts only that `scrollTo` was called, not the offsets.
- "sets aria-valuenow when the thumb is created" asserts only that the attribute is not `null`.
- "customizes the browser scrollbar when combined with KbqScrollbar in native mode" checks host classes only. jsdom loads no styles, so nothing about the scrollbar's look is asserted; the e2e spec covers that.

**Behaviour without a test.** The spec states these from the source:

- the 99 % threshold for drawing a bar;
- `kbqScrollbarHideDelay`, the `hideDelay` option, and the restart of the delay on each scroll (every test uses the 1000 ms default);
- a partial `kbqScrollbarOptionsProvider` in a nested injector falling back to the library defaults;
- the `hover`-mode track staying visible while a bar is pressed;
- a press on a bar not moving focus or starting a text selection;
- the instant scroll of a drag when the element has smooth `scroll-behavior`;
- `scrollTo` with `right`, `bottom`, `start` or `end`, and `scrollStart`/`scrollEnd` in a right-to-left layout;
- `flashScrollIndicators()` called on `kbqScrollbarViewport`, and its `flashes` stream;
- the `kbq-scrollbar-viewport-` prefix of the generated id;
- motion turned off by `prefers-reduced-motion` or by an `ANIMATION_MODULE_TYPE` of `NoopAnimations`;
- `hidden` mode keeping the content scrollable;
- re-measuring after a font loads, on hover and on focus;
- `kbqScrollbarViewport` leaving the host's overflow alone and having no export name (the latter is visible in the API golden file only);
- `KbqScrollbarModule`.

## search-expandable

Change: `document-search-expandable-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `value` says a write reaches the bound control once `emitValueTimeout` passes. With `isEmitValueByEnterEnabled` set, it reaches the control only on Enter. A write to a collapsed field does not expand it either.
2. The JSDoc of `isOpenedChange` says it fires when the search "has been toggled". It also fires when a model value expands the field. It does not fire when `[isOpened]` or the `isOpened` property changes the state.
3. The JSDoc of `localeConfiguration` calls it the strings "currently rendered by the component". With `tooltipText` or `placeholder` set, the rendered strings are those, not the locale's.
4. The JSDoc of `emitValueTimeout` says the default comes from `defaultEmitValueTimeout`. That holds only while the input is unbound: a bound `null` or a non-numeric string becomes `NaN` (see suspected defect 5).
5. The JSDoc of `KBQ_SEARCH_EXPANDABLE_LOCALE_CONFIGURATION` does not say that, once a locale service is provided, the token is ignored for every registered locale.
6. The JSDoc of the `isOpened` property ("state of component") does not say that writing it skips the event and the reset.
7. The docs page covers only the forms requirement, the emit timing and the auto-expand. It says nothing about these:
    - collapsing clears the model;
    - Escape;
    - `isOpened` and `isOpenedChange`;
    - `tooltipText`, `placeholder`, `disabled` and `tabIndex`;
    - localization.
8. `examples.search-expandable.en.mdx` and `examples.search-expandable.ru.mdx` are empty files, and `structure.ts` sets `hasExamples: false` for the component.
9. `KbqSearchExpandable`, `toggle()`, `defaultValue`, `defaultEmitValueTimeout` and `KbqSearchExpandableModule` have no JSDoc; the golden file marks them `(undocumented)`. A stray, empty `/** @docs-private */` sits above the JSDoc of the private control.

**Suspected defects (from reading the code, not reproduced)**

1. A collapse through `[isOpened]` or the `isOpened` property skips the reset. The query stays in the field and in the bound control, unlike every other collapse, so a parent that collapses a `[(isOpened)]` search leaves its filter applied. It also applies while disabled.
2. Every collapse moves focus to the collapsed button, including a collapse started by another control (`toggle()` from a toolbar button) or by `[isOpened]`. Focus is pulled away from where the user is.
3. Writing `value` while collapsed sends the text to the bound control after the debounce but leaves the field collapsed. The model then holds a query the user cannot see, against the docs rule that a model value renders the search expanded.
4. Every collapse hands `''` through the change callback, even when nothing was typed and the control already holds `''`. The control is marked dirty and `valueChanges` and `ngModelChange` fire, so a consumer that reloads data on `valueChanges` reloads on every collapse.
5. A bound `emitValueTimeout` of `null` or of a non-numeric string becomes `NaN`. The typed value then reaches the control almost at once, on a zero-delay timer, instead of after the 200 ms default. `tabIndex` uses `kbqOptionalNumberAttribute` for the same case; `emitValueTimeout` does not.
6. Escape is bound only on the input. With focus on the close button, Escape does not collapse the field, and inside a modal it closes the modal.
7. `tabIndex` is not applied to the close button, which keeps its own default stop. A consumer that sets `tabIndex` to `-1` still has a tabbable close button.
8. The collapsed button carries the same string as its `aria-label` and as its tooltip. While the tooltip is open, the button's `aria-describedby` points at it, so a screen reader may announce "Search" twice. The tooltip skips `aria-describedby` only when its text equals the host's text content, which an icon-only button does not have.
9. An empty-string `tooltipText` or `placeholder` is used as given, which leaves the button or the input with an empty `aria-label` and no accessible name. No axe test covers it.

**Tests whose name and body disagree, or that cannot fail**

- "should force-emit the reset value on close even mid-debounce" sets the control to `alpha`, which is a programmatic write: it starts no debounce and records `alpha` as the last exchanged value. A collapse that did not force the emission would also hand `''` to the control, so neither "mid-debounce" nor "force" is exercised.
- "should move focus into the input when the toggle button was focused at auto-open time" never focuses the button. It writes the protected `lastFocusOrigin` field instead.
- "should add opened class when opened" sits under `describe('toggle')` but opens through `[isOpened]`, which takes a different path: no event and no reset.
- "should not show input when closed" sits under `describe('disabled state')` but involves no disabled state; it repeats "should show button when closed".
- "should have default empty value" asserts `toBeFalsy()`, which also passes for `undefined` or `null`, not only for `defaultValue`.
- The two "focus monitoring" tests count calls to `FocusMonitor.monitor`. They test the wiring, and no requirement maps to them.

**Behaviour without a test.** The spec states these from the source:

- the error thrown without a form directive;
- `type="text"` and `autocomplete="off"` on the input, and `type="button"` on the collapsed button;
- the debounce restarting on each keystroke, and a changed `emitValueTimeout` applying from the next keystroke;
- `isOpenedChange` not firing for `[isOpened]`, for `toggle()` while disabled, or for the close button (only its collapse is tested);
- a collapse through `[isOpened]` keeping the query;
- `toggle()` hiding the tooltip, and the tooltip not opening when focus returns to the collapsed button;
- no focus move on a first render with `[isOpened]="true"` or with an initial form-control value;
- focus moving to the collapsed button after the close button or a collapse started elsewhere (the e2e test covers Escape only);
- the reset of an already empty field marking the control dirty, a pending emission dropped on collapse, and unconfirmed text discarded in Enter mode;
- `null` and `undefined` written to the control showing an empty field;
- a write to `value` not expanding a collapsed field;
- the error state through a consumer `ErrorStateMatcher` and after a form submit;
- a field disabled while expanded staying expanded, with a disabled close button;
- `tabIndex` reading `-1` while disabled, and `tabIndex` reaching the button and the input in the DOM;
- an empty-string `tooltipText` or `placeholder` used as given;
- the strings under a locale service and after `setLocale()`, `kbqSearchExpandableLocaleConfigurationProvider()` and `[localeOverrides]`;
- Escape on the close button not handled (the modal test covers only the collapsed button).

## select

Change: `2026-10-21-document-select-baseline` (archived; the main spec is `openspec/specs/select/spec.md`)

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The tag template snippet in `select.en.mdx` and `select.ru.mdx` uses `select.disabled` without calling it. `disabled` is a signal, so as written every tag renders disabled and no remove control appears. The live example correctly calls `select.disabled()`.
2. The JSDoc of `required` says it "affects validation and display of placeholder". It only sets `aria-required`.
3. The JSDoc of `selectionChange` says the value was "changed by the user". The output also fires for `option.select()` and `option.deselect()` called in code.
4. The JSDoc of `onSelectAll` mentions only the shortcut. The output also fires when the select-all row is clicked.
5. "Customized selection" reads as if the select can pin selected options to the top. That is the example reordering its own data on close.
6. "List with search" describes tokenizing and diacritic folding as if the select did them. They belong to the example's filter; the select does not filter.
7. The Ctrl/Cmd + A section does not say that the panel has to be open.
8. The examples page says the delay is "100 ms"; the constant is 101. It also says loading is shown for "at least 300 ms". `minimumTimeToDisplayLoading` is exported, but the select never applies it.
9. The accessibility section says reduced motion turns off the fade of the panel. The select panel has no fade animation at all.
10. The docs advise against an `<ng-container>` for `kbq-select-trigger`, but the `select-custom-trigger` example uses `<ng-container kbq-select-trigger>`.
11. The JSDoc of `panelMinWidth` says it is ignored when wider than the window. The code drops the minimum only when the pane overflows horizontally.
12. These have no place in the select pages:
    - `panelMaxWidth` and `clearPredicate` among the provider keys;
    - `triggerValuesLimit`, `hiddenItemsText`, `hiddenItemsTextFormatter` and `hiddenItems()`;
    - the tooltip on truncated options.

**Suspected defects (from reading the code, not reproduced)**

1. The tag remove control is `<i kbq-icon kbqTagRemove>`. `KbqIcon` puts `aria-hidden="true"` on its host by default, and nothing overrides it, so a focusable `role="button"` is hidden from assistive technology (axe `aria-hidden-focus`). No axe test renders tags.
2. With `#kbqSelectTagContent`, a remove control falls back to `tabindex="-1"` and the bare name "Remove". The docs template does not show how to restore the tab stop or the value-specific name.
3. Choosing a `null`-valued reset option seems to emit `selectionChange`, `valueChange` and the form change twice, through a re-entrant deselect. It emits even when the value is already empty.
4. Calling `close()` during the 101 ms delay of an empty select does not cancel the pending open.
5. With `selectAll`, the row also renders over the loading, error and no-options content. `aria-busy` is then not set, and activating the row does nothing.
6. Under virtual scrolling, one lookup calls `compareWith` without the guard that turns a throwing comparator into "no match".
7. A custom `id` is not written to the host element, and the panel id ignores it.
8. `useDefaultHandlers` of `kbq-select-matcher` has no effect on `kbq-select`.
9. When `searchMinOptionsThreshold` hides the search, opening may try to focus the detached field instead of the active option.

**Tests whose name and body disagree, or that cannot fail**

- "should update FormControl value to null after clear on single select" asserts `undefined`.
- "should not attempt to open a select that does not have any options" checks only the moment after the click; the panel opens 101 ms later.
- "should restore focus to the host before tabbing away": focus stays on the host; it does not tab away.
- "should allow providing custom tag content" probably runs `.every()` over an empty view query.
- The `kbq-form-field-should-float` assertions always pass, because nothing sets that class any more.
- "should be able to render options inside groups with an ng-container" uses a fixture without an `ng-container`.
- "should drop aria-busy once the options render" never goes through the loading-to-options transition.
- The e2e "positioning — ample/limited space" names refer to option centring, which the select does not have.
- `select.component.spec.ts:7057` keeps a commented-out `finishInit(fixture);`.

**Behaviour without a test.** The spec states these from the source:

- `aria-invalid`, `aria-required` and `aria-describedby` on the select;
- `panelMaxWidth`;
- the `'auto'` threshold and the provider path of `searchMinOptionsThreshold`;
- resetting the search on close;
- closing on a backdrop click;
- the long single value cut with an ellipsis;
- the select-all row being hidden under virtual scrolling.

## sidebar

Change: `document-sidebar-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqSidebarState.width` says it is absent "while the sidebar has never been resized away from the width its content declares". The code leaves it out only while the opened width is `inherit`; a declared width such as `200px` is always written (unit test "persists the width the content declares").
2. The JSDoc of `saveState()` says it is called "whenever `opened` changes" and that the width "is only captured as the sidebar closes". It runs on every assignment of `opened`, including one that keeps the state, and the width is captured on any assignment while the sidebar is open and not transitioning.
3. The keyboard table on both docs pages says `[` and `]` open and close the left and right sidebar. It does not say that:
    - this needs `position`, which the pages never mention;
    - the physical key counts, so on a Russian layout it is the keys of "х" and "ъ";
    - only `input` and `textarea` are excluded;
    - every sidebar of that side toggles, a sidebar with a bound `opened` included.
4. `position` has no JSDoc. Its type, `SidebarPositions`, claims a value is always there, but the default is `undefined`. Its only effect is the choice of the shortcut key, while its name suggests it places the sidebar.
5. `stateChanged` has no JSDoc. Nothing says that it fires once after the first render with the initial state, or that it waits for the width transition.
6. The overview example binds `[opened]` and also calls `toggle()` on the same sidebars. With no two-way binding, after "Toggle left" the "Toggle left model" button first does nothing visible. The docs page says a bound `opened` means the application decides, which the example contradicts.
7. The "With splitter" example uses `KbqSplitterModule` from `@koobiq/components/splitter/deprecated`, although `@koobiq/components/splitter` exists.
8. The inputs of `kbq-sidebar-opened` and `kbq-sidebar-closed` have no JSDoc. Nothing says the widths are read once, or that unset values become `inherit` and `32px`.
9. `params` and `internalState` are public, writable and only marked `@docs-private`; writing either changes what the sidebar renders. The golden file also warns that the type of `params`, `KbqSidebarParams`, is not exported.

**Suspected defects (from reading the code, not reproduced)**

1. The shortcut ignores only the Meta key. Its modifier check looks for a `keyCode` of Shift, Control or Alt, which a `keypress` of a bracket never has, so Shift + `[` (typing `{`) and, on macOS, Option + `[` still toggle the left sidebar.
2. Only `input` and `textarea` targets are excluded. Typing `[` in a `contenteditable` editor, or on any other focused widget, toggles the sidebar.
3. The shortcut is a single character, always on for the whole document, and cannot be turned off or remapped except by leaving `position` unset. This conflicts with WCAG 2.1.4 (Character Key Shortcuts). It also relies on the deprecated `keypress` event.
4. The sidebar exposes its state to nothing but its content: no `aria-expanded` relation to a toggle control and no region. When it closes while focus is inside the opened content, the focused element leaves the DOM after the transition and focus falls back to `<body>`.
5. Assigning `true` to `opened` on an open sidebar captures its current pixel width as the opened width and persists it. A declared `inherit` or percentage width is then fixed in pixels. The first close does the same by design, so a `width="50%"` sidebar stops following its container after it has been closed once.
6. Widths are read once. A bound `[width]` on the content has no effect after initialization, and content added later, under an `@if` for example, gets the default widths.
7. Toggling twice before the first change is reported emits `stateChanged` once, with the state the sidebar already had: an event without a net change.

**Tests whose name and body disagree, or that cannot fail**

- "should render with default parameters" binds both `position` and `opened`, so it checks bound values, not defaults. `position` has no default at all.
- "persists nothing when the sidebar is not in the document as it initializes" checks only that nothing is restored and no warning is logged. It never changes the state, so it cannot catch a write.
- "persists nothing while the application drives the opened state" seeds `{ opened: false }` and then toggles the sidebar to `false`. The assertion fails on a write only because the captured width adds `width: '0px'`; a write without the width would pass.
- "should change position" only reads back the input. It does not check that the shortcut follows the new position.
- "restores the width alongside the opened state" asserts the docs-private `params.openedStateWidth`, not the host's inline width.

**Behaviour without a test.** The spec states these from the source:

- the `kbq-sidebar-opened` and `kbq-sidebar-closed` classes and the `kbqSidebarOpened` and `kbqSidebarClosed` export names;
- no two-way binding of `opened`;
- the content switch timing: the opened content at once on opening, the closed content after the transition on closing;
- the declared `min-width` and `max-width`, the `inherit` default and a declared closed width;
- widths read once;
- the `kbq-animations-disabled` class and the instant change under reduced motion;
- `stateChanged` for the initial state, its absence for an unchanged assignment, and a single event for rapid changes;
- a write on an assignment of the current state, and through the property and the shortcut;
- a non-string `width` dropped while `opened` is restored;
- writes going to the new key after a key change;
- no write from a detached sidebar;
- `saveState()` doing nothing on a sidebar that does not persist;
- `hasSavedState` being `false` while `useStateSaving` is `false`;
- `opened`, `toggle()` and `saveState()` being untracked inside an effect;
- the `]` key on a right sidebar, the `input`, `textarea` and Meta exclusions, the missing `position`, every matching sidebar toggling, and the shortcut's lifetime;
- no ARIA on the host or the content.

## sidepanel

Change: `document-sidepanel-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The keyboard table says Escape closes the sidepanel "if no data was changed in the sidepanel". The sidepanel tracks no changes: Escape closes it unless `disableClose` is set or the key's default action was already prevented.
2. "Focus is set on the first available element inside the sidepanel body." The built-in default is the first element Tab can reach in the whole panel, so the close button of a closeable header gets focus before anything in the body.
3. The examples page says every option but `disableClose` is "read once, when the sidepanel opens". `size`, `ariaLabel` and, for `aria-modal`, `trapFocus` feed host bindings of the container, which are read again on every change detection, so changing them through `ref.config` changes those parts of an open panel. This comes from reading the code and was not reproduced.
4. "How it works" names only the right and left edges. `top` and `bottom` exist in `KbqSidepanelPosition`, in the position select of the modal, non-modal and stacked examples, in the dev app and in the e2e scenarios, but the text never mentions them. They also do not say that the size presets do not apply there: a top or bottom panel spans the width and takes a third of the height, at least 400 px.
5. "Stacked panels" says that non-modal sidepanels stack with an offset. Modal sidepanels at the same position stack the same way: the indent strip does not depend on the backdrop, and the e2e "nested" scenario opens modal panels.
6. "Disable close on backdrop click" lists the backdrop and Escape. `disableClose` also blocks the indent strip and a click on a panel underneath, and it does not block the close buttons or the header close button. The page does not say either.
7. The JSDoc of `ariaLabel` says it is "used when no `kbq-sidepanel-header` names it and no `ariaLabelledBy` is given". The attribute is always written; it is ARIA's precedence of `aria-labelledby` that leaves it unused.
8. The golden file marks `open()`, `close()`, `position`, `size`, `backdropClass`, `KbqSidepanelPosition`, `KbqSidepanelSize` and `KbqSidepanelModule` as undocumented. The API tab has nothing to say about the main entry points.

**Suspected defects (from reading the code, not reproduced)**

1. The docs promise that a sidepanel closes "on a left mouse button click only". That holds for the backdrop and the indent strip. In a non-modal stack, though, the click on a panel underneath arrives through the CDK outside-pointer stream, which also carries middle-button and context-menu clicks, and the sidepanel filters it only by target. A right or middle click on the panel underneath then closes the panel above it.
2. Closing a panel in the middle of a same-position stack of three or more leaves the panel under it hidden, while the top panel keeps its indent strip, which then exposes an invisible panel. The panel reappears only when the top one closes. The lookups that promote the panel underneath index from the top of the stack, not from the panel that closed.
3. A `backdropClass` with several space-separated classes, or an empty one, makes `open()` throw from `classList.add`. By then the overlay, the backdrop and the scroll block are already attached, and the panel never enters `openedSidepanels`, so nothing disposes of them.
4. The selectors `kbqSidepanelBody`, `kbqSidepanelFooter` and `kbqSidepanelActions` have no brackets. They match elements of those names, not attributes, so `<div kbqSidepanelBody>` gets none of the body behaviour.
5. A close button without a value, including the one in a closeable header, closes with `''` instead of `undefined` (spec: "Close button without a value").
6. When the first focus-trapping sidepanel opens, the page is hidden from assistive technology by marking the overlay container's siblings of that moment. Elements appended to the page later stay reachable while the panel is open.
7. When a header that named the sidepanel is removed, `aria-labelledby` keeps pointing at its missing title. A header rendered after a first one cannot rename the panel.
8. Backdrops become transparent only within a same-position stack. A modal sidepanel opened at another edge over a modal one leaves both backdrops visible, so the page is dimmed twice.

**Tests whose name and body disagree, or that cannot fail**

- "should fall back to the root injector when no custom injector is provided" only checks that `instance` is set. It does not look at the injector.
- "should close the sidepanel underneath when a same-position stack is clicked through": the code closes the panel above the click, while the name reads as if the lower one closes. The test only counts containers, so it cannot tell which panel closed.
- "should close sidepanel on indent click" counts indent strips. Closing the lower panel instead of the top one would remove the strip too.
- "should show only the topmost backdrop when multiple sidepanels are open" checks that all but one backdrop are transparent, not that the visible one is the topmost.
- "should set the proper animation states" and "should not animate a closing sidepanel back into view when closing all sidepanels" assert internal state names, so they break on a rename without any visible change.

**Behaviour without a test.** The spec states these from the source, or from the CDK source:

- `KBQ_SIDEPANEL_DEFAULT_OPTIONS`;
- the text of the duplicate-id error (the test only checks that `open()` throws);
- the generated id format, the container's `id` attribute and its `tabindex="-1"`;
- `ref.instance` staying unset for a template sidepanel;
- header title truncation, its class, its tooltip and `truncateText: false`;
- the close button's localized name and `[localeOverrides]` on the header;
- the empty-string result of a close button without a value;
- a close button keeping an author-set `type`, and the directive applying to `button` elements only;
- `align` on `kbq-sidepanel-actions`;
- the 400 px width of a small sidepanel (medium and large are backed by screenshots);
- `kbq-animations-disabled` and the events under reduced motion;
- right and middle clicks on the backdrop not closing the panel;
- Escape reaching only the topmost sidepanel;
- `close()` and the close buttons ignoring `disableClose`;
- a click elsewhere on the page not closing a non-modal sidepanel;
- lower panels of a stack being pushed back and hidden, beyond the transparency of their backdrops;
- `closeAll()` reaching sidepanels opened through other service instances;
- focus going to the first element Tab can reach when nothing is marked `cdkFocusInitial`, and focus returning before `afterClosed()` emits;
- Shift+Tab inside the focus trap, and `trapFocus` given explicitly;
- `script`, `style` and `aria-live` elements left visible to assistive technology, and earlier `aria-hidden` values restored;
- `wasOpen('')` returning `false`.

## skeleton

Change: `document-skeleton-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The typography section of `skeleton.en.mdx` says the widths of several lines "alternate randomly", and `skeleton.ru.mdx` says the same. The widths are fixed: 80 %, 100 % and 60 % in turn, through `nth-child` rules, and 50 % for a single line. The e2e test "should repeat the lengths of the lines of a paragraph" asserts that sequence.
2. The JSDoc of `KbqSkeletonTable.columns` and the docs ("the width of each column") do not say that the widths must be an array. A string such as `columns="160px 1fr"` is read as a number, which fails, so the table gets a single column.
3. The docs do not mention several inputs: `header` and `pinnedColumns` of the table, `vertical` of the tabs, and `label`, `labelClass` and `contentClass` of the form field.
4. The page has no accessibility section. An active skeleton is `inert`, so its content leaves the accessibility tree, and the skeleton announces nothing. The docs do not tell consumers to mark the loading region themselves, for example with `aria-busy`.
5. `examples.skeleton.en.mdx` and `examples.skeleton.ru.mdx` are "documentation in progress" stubs. `structure.ts` sets `hasExamples: false`, so they are not routed; every example lives on the overview page.

**Suspected defects (from reading the code, not reproduced)**

1. The element presets apply the skeleton as a host directive without exposing its input. Binding `[kbqSkeleton]` on one of them either fails to compile or, with `KbqSkeleton` imported, matches the directive twice on one element, which Angular rejects.
2. `toColumns` passes any object through. `[columns]="null"`, possible in a template without strict type checking, then reaches the grid-template computation, which spreads it and throws.
3. Providing `KBQ_SKELETON_PRESETS_CONFIGURATION` directly with a partial object, as the unit test does with a cast, leaves the missing keys `undefined` for presets right below it. They then render a single item instead of the default count. Only `kbqSkeletonPresetsConfigurationProvider()` fills in the defaults.
4. Once off, a `kbq-skeleton` element loses its block display and minimum height and becomes an empty inline element, so the width and height a consumer class gives it no longer apply. That is harmless when the element is swapped out with `@if`, but `[kbqSkeleton]` on the element only hides it.

**Tests whose name and body disagree, or that cannot fail**

- "should keep the wave running where IntersectionObserver is missing": both assertions hold whatever the code does. `env.observed` belongs to the fake observer that the overridden window no longer provides, and nothing can add the offscreen class without an observer. The test fails only if creating the skeleton throws, and it never checks the wave.
- "should run the wave by default" checks only that `kbq-animations-disabled` is absent. The fake window has no `matchMedia`, so reduced motion is never exercised, and nothing about the wave is asserted.
- "should keep the fill still when animations are disabled" asserts the class, not that the fill stands still; that rests on the CSS.
- "should put the label of a form field to the left, under a hint and around a textarea on demand": the name puts the label "under a hint". The body checks the horizontal and textarea classes and that a hint follows the control.
- The e2e screenshot "of every preset" has only the light baseline (`02-light.png`), while the other screenshot test also takes the dark one.

**Behaviour without a test.** The spec states these from the source:

- the `kbqSkeleton` export name, the `kbq-skeleton` class on a host that is off, and `null` or `undefined` turning a skeleton off;
- the transparent text, ignored pointer and selection, and one bar per line of an inline host (the e2e screenshots show the fill but assert nothing);
- the minimum height of the `kbq-skeleton` element and its collapse once off;
- motion turned off by `provideNoopAnimations()` and by a reduced-motion preference;
- the 100 px margin before the wave pauses outside the viewport;
- the styles loading without a skeleton stylesheet, and the absence of any ARIA;
- element presets having no `kbqSkeleton` input, and layout preset hosts not being inert;
- `preset` of `kbq-skeleton-group` being required;
- the parsing of `count`, `columns`, `contentLines` and `children` (only `lines` and `rows` are tested), and the default `treeChildren`;
- what `KbqSkeletonModule` exports.

## split-button

Change: `document-split-button-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `panelAutoWidth` says it "sets the width of the dropdown to the width of the trigger". It measures the whole split button, not the trigger. With the dropdown's default `panelWidth`, it sets only a minimum width. The menu matches the control exactly only with `panelWidth="auto"`, and `panelMinWidth` 0 for a control narrower than 200 px, which is what the `split-button-menu-width` example binds.
2. The "Menu width matching the button" section never names `panelAutoWidth`.
3. The same section says menu positioning "is configured the same way as in the Dropdown component". The split button writes the dropdown's `xPosition` itself (suspected defect 1).
4. The "In progress" section says progress, like the disabled state, can be applied "to the entire button group". The split button has no progress input. The example sets the `kbq-progress` class on each button, on both of them for "Completely in Progress".
5. The "Completely Disabled" header of the `split-button-disabled-state` example starts with a Cyrillic "С" (U+0421) instead of a Latin "C".
6. These are not documented on the pages:
    - `panelAutoWidth` by name, `firstDisabled` and `secondDisabled`;
    - the host and nested-button classes and the attribute selector;
    - the development-mode error;
    - that only direct `kbq-button` children are rendered.

    `KbqSplitButton` and `KbqSplitButtonModule` have no class JSDoc; the golden file marks them "(undocumented)".

7. `examples.split-button.{en,ru}.mdx` are "Documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so the site does not show them.

**Suspected defects (from reading the code, not reproduced)**

1. The split button sets the dropdown's `xPosition` to `before` on initialization and again whenever its buttons, the trigger, the trigger's dropdown or `panelAutoWidth` change. A consumer's `xPosition` on that dropdown seems to be overwritten. A dropdown shared with a trigger outside the split button opens `before` there too.
2. `panelAutoWidth` has no boolean transform, unlike `disabled`. A bare `panelAutoWidth` attribute passes `''`, which is falsy, so the menu keeps measuring the trigger. With strict template type-checking, the attribute form does not compile.
3. `panelAutoWidth` measures the host box, which can be wider than the visible buttons: the host is a flex row whose buttons do not grow. The e2e baseline `05-light.png` shows it. The split button is given 240 px, the visible control is narrower, and the menu is 240 px wide. As it does not fit toward the start, it falls back to opening from the chevron instead of lining up with the control.
4. The host color class does not follow the style. Under `transparent` with no `color`, the host has `kbq-contrast-fade` while its buttons are `kbq-contrast`. The host-level rules in `_split-button-theme.scss` key on the host's color and style pair, so they target a pair the buttons do not have.
5. `contrast-fade` written in code through `color.set()` is not passed to the buttons, because it equals the split button's own default. The same value bound through `[color]` is passed, so under `transparent` the two give different button colors.
6. A `kbq-button` wrapped in another element is dropped without a warning. When it is the only button, development mode throws "must contain at least one button" although the template has one.
7. Nothing limits the split button to two buttons. With three or more, the middle ones get only `kbq-split-button_item`, `secondDisabled` follows only the last one, and the joined styles assume two.

**Tests whose name and body disagree, or that cannot fail**

- "should have kbq-button_filled class on host by default" binds `kbqStyle` to `filled`. No unit test renders the unbound default.
- "should propagate style to all nested buttons" checks `filled`, which every `kbq-button` has on its own, so it cannot fail on propagation. "should update host class and nested buttons when kbqStyle changes" does cover propagation.
- "should default color on nested buttons to contrast-fade" binds `color` to `contrast-fade`, so it tests a bound color, not the default. Under `filled` that is also the buttons' own default, so it cannot fail.
- "should release nested buttons back to the style default when an empty value is set" runs under `filled`. There the style default and the split button's own default are both `contrast-fade`, so it cannot tell a released button from one given the split button's default.
- The e2e test "renders the open menu aligned to the whole control" shows the opposite. Its baseline, and the comment on `E2eSplitButtonDropdown`, have the menu anchored to the chevron, not aligned with the control.

**Behaviour without a test.** The spec states these from the source:

- the attribute selector;
- content other than direct `kbq-button` children not being rendered, including a wrapped button;
- the development-mode check running only once;
- a middle button of three getting no position class;
- the unbound `kbqStyle` default on the host, custom style strings, and reading and writing `kbqStyle` in code;
- the host `kbq-<color>` class;
- a color set in code;
- the color and the disabled state reaching a button added later;
- the bare `disabled` attribute, a button's own `disabled` set to false under a disabled split button, and `disabled` reading `undefined` while unset;
- the menu matching the split button exactly with `panelWidth="auto"`, and the split button being measured on each open;
- the host having no `aria-label`, not being a tab stop, and the tab order of its buttons.

## splitter

Change: `document-splitter-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Collapsed panel" section in both languages and the JSDoc of `collapsed` say that a panel collapsed to `0` leaves no separator to restore it. The separator stays rendered and in the tab order on the splitter's edge, and the inner half of its hit area still starts a drag: the e2e "nested in a collapsed layout" test grabs it. When the collapsed panel is the one before that separator, Enter on it expands the panel.
2. The English "Collapsed panel" section says pulling past `minSize` collapses the panel. The Russian page and the JSDoc of `collapsible` give the actual rule: past half of `minSize`.
3. The keyboard table says Enter "collapses and expands the panel" and Home collapses a panel at its minimum, without saying which panel. Both act only on the panel before the separator (see suspected defect 1).
4. The double-click row says the second double-click sets the minimum. Whenever `layout` is `null`, the first double-click already does that: nothing has been resized yet, or only Enter or the host changed the collapsed state.
5. The JSDoc of `layout` calls it "sizes of the panels". The model can differ from what is shown:
    - a collapsed panel's entry holds the size it returns to, not its strip;
    - a layout written by the host is shown fitted to the limits, but the bound value is not updated.
6. The JSDoc of `KbqSplitterGroup.resizerDirection` describes "the separator of the panel at `index`". The member is a signal and takes no index.
7. The docs page says `kbqSplitterOptionsProvider` sets defaults "for the whole application or for one injector". It does not say that a nested provider drops the keys of the outer one (see suspected defect 2).
8. `examples.splitter.{en,ru}.mdx` are "Documentation in progress" stubs. `structure.ts` sets `hasExamples: false`, so no route reaches them.

**Suspected defects (from reading the code, not reproduced)**

1. Enter, Home and End act only on the panel before the separator. A collapsible panel that is the last one, or that comes after its separator, therefore cannot be collapsed or expanded from the keyboard. Once a drag or the host collapses it, a keyboard user cannot get it back. The Terminal panel of the `splitter-collapsible` example is such a panel.
2. `kbqSplitterOptionsProvider` spreads the given keys over the built-in defaults, not over the options already in scope. So a component that provides `{ snapTolerance: 64 }` silently resets an application-wide `appearance: 'handle'` to `divider` for its subtree.
3. Only separators handle F6 and Shift+F6. Once focus is on a panel, F6 does nothing, so keyboard users cannot cycle through the panes, and there is no way back from a panel to the separators other than Tab.
4. Nothing relates `collapsedSize` to `minSize`:
    - a collapsible panel without `minSize` has its midpoint at `0`, so a drag collapses it only once the pointer passes the panel's far edge;
    - a `collapsedSize` larger than `minSize` makes collapsing grow the panel, and Home does the same.
5. `resizeSplitterSizesAt` and `KbqSplitterSnapPoint` are in the public API golden file without `@internal` or `@docs-private`, unlike their sibling helpers `resolveSplitterSize`, `fitSplitterSizes` and `snapSplitterSize`. `KbqSplitterSnapPoint` is used only by the `@internal` `snapSplitterSize`. This looks like unintended public surface, and removing it later will be a breaking change.

**Tests whose name and body disagree, or that cannot fail**

- "should report the room the boundary still has as the separator value range": the values report the room of the panel before the separator, not of the boundary, as the next test, "should report the pane it controls, not the boundary", states. In this two-panel fixture the two coincide, so the test would also pass if the values reported the boundary.
- "should keep a track below the container when the minimums cannot fit" asserts three 250 px tracks in a 600 px splitter, which overflow the container rather than stay below it.
- "should move focus between panels on F6" dispatches Shift+F6 on the separator after focus has already moved to the panel. A user pressing Shift+F6 there gets nothing (suspected defect 3).

**Behaviour without a test.** The spec states these from the source:

- a panel inside a wrapper element being left out and rendering no separator;
- pointer drags and the `w-resize` / `e-resize` cursors in right-to-left layout, and the `n-resize` / `s-resize` cursors;
- `kbq-splitter_dragging` and the panel content ignoring the pointer during a drag;
- the separator values before the first measurement, and drags and keys doing nothing in that state;
- equal tracks on the server;
- re-measuring when the orientation changes;
- a nested `kbqSplitterOptionsProvider` falling back to the built-in defaults;
- no warning in production builds;
- a `maxSize` below the `minSize`;
- the values `layoutChange` carries after a drag or a key press (only indirectly, through the double-click test);
- a host-supplied layout not being written back after fitting;
- `minSize` and `maxSize` acting as snap points;
- ties between the snap points of the two panels;
- a drag released with a panel collapsed not snapping;
- keyboard resizing not snapping;
- panels further out never collapsing by drag;
- `kbq-splitter-panel_collapsed`;
- End expanding a collapsed collapsible panel;
- Home, End, Enter and double-click being ignored while disabled;
- Up and Down Arrow in a vertical splitter;
- modified key presses passing through;
- `separatorAriaLabel`;
- the separator name following a locale change;
- a custom panel `id`;
- `KbqSplitterModule` and the `exportAs` names.

## table

Change: `document-table-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. `table.en.mdx` and `table.ru.mdx` say `border` draws a line "under every row". The line is drawn under body rows only: footer rows get none, and the header line is drawn whether or not `border` is set. The JSDoc of `border` correctly says "every body row".
2. The sticky header section shows `--kbq-table-sticky-header-background: var(--kbq-background-card);` without a selector and tells consumers to "point the token at that surface". The table defines the property on its own element, so a value set on the card, the modal or the side panel has no effect; it has to be set on the table, as the e2e scenario does inline. The same holds for `--kbq-table-cell-text-align` and every other `--kbq-table-*` token in the migration guide.
3. The docs say the table accounts for the header height on "the controls inside" its cells, and the JSDoc of the published height says "body cells". The scroll margin covers `a`, `button`, `input`, `select`, `textarea`, `summary` and `[tabindex]` in body and footer cells. A `[contenteditable]` element, an `iframe` or a media element with `controls` can still be scrolled under the header.
4. The JSDoc of `stickyHeader` says the header stays visible "while the table scrolls". The table does not scroll; the `th` cells stick to the nearest scrolling ancestor, and `td` cells in the header do not stick.
5. `examples.table.en.mdx` and `examples.table.ru.mdx` are "documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so they are never routed, while all five examples already appear on the overview page.
6. The example titled "Table full width" illustrates the sentence about wrapping text. The full width comes from the example's own `style="width: 100%"`; the component sets no width.

**Suspected defects (from reading the code, not reproduced)**

1. A `<thead>` with more than one row: every header `th` sticks at `top: 0`, so when the header is pinned the second row slides over the first instead of staying below it. The published height covers the whole `<thead>`, so the scroll margin is right while the header itself overlaps.
2. A `td` in the `<thead>`, such as an empty corner cell, gets no header line, does not stick and has no background. With `stickyHeader`, body rows show through that cell.
3. A `<thead>` added to, or replaced in, a table that is already rendered is not observed while `stickyHeader` stays on. The height stays unset, or at the last size reported for the old element, so a focused control can land under the header. A source comment says swapping the `<thead>` is not supported; the docs do not mention it.
4. The compact padding matches a `kbq-button` anywhere in a cell. A cell that holds wrapped text and a small button loses the full block padding around the text too.

**Tests whose name and body disagree, or that cannot fail**

- "should not attach anything to cells, inside or outside a kbq-table" checks only class names. The regression its comment describes — a directive instance and a content query on every cell — would pass it as long as the directive adds no class.
- "should have no axe violations" renders two tables without a `<thead>`, header cells or a pinned header, so the header-related axe rules have nothing to check.

**Behaviour without a test.** The spec states these from the source:

- the `kbq-table` attribute on an element other than `<table>` creating nothing;
- the standalone import of `KbqTable` (the unit spec and the e2e app import `KbqTableModule`);
- the `kbqTable` template reference;
- no `role`, `aria-*` or `tabindex` on the table, and Tab skipping the table itself;
- the removal of `kbq-table_bordered` and `kbq-table_sticky-header` when their option turns off (only `disableHover` is tested);
- the table's width following its content (every table in the e2e scenario has `width: 100%`);
- `--kbq-table-cell-text-align` set by a consumer;
- the compact padding in a footer cell;
- real pointer hover, on body, header and footer rows and under `disableHover` (the screenshot uses the `kbq-hovered` class);
- the square bottom corners of the last body row before a `<tfoot>` (the one footer table in the screenshot has `border`);
- the pinned header keeping the page background when the token is set only on an ancestor;
- a second size report updating the published height;
- no height without a `<thead>` or during server rendering;
- the scroll margin of footer cells and of focusable elements other than a button.

## tabs

Change: `document-tabs-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The overview says a disabled tab "can't be selected", and the JSDoc of `KbqTab.disabled` says the same. Only the default selection, the pointer and the keyboard skip it; `selectedIndex` and `activeTab` select a disabled tab.
2. "Tabs and navigation" calls a nav bar "a navigation landmark by default". The directive adds no role: the landmark comes from the `<nav>` element the author puts it on, and a `<div kbqTabNavBar>` is none.
3. The vertical-icons section says to "add a tooltip for icons". `tooltipTitle` shows only on an `empty` tab or a truncated label, which the docs do not say; the example gets its tooltips by marking every tab `empty`, which also renders their labels in the empty style.
4. The JSDoc of `dynamicHeight` says the group "should grow to the size of the active tab". Judging from the styles, the content area already takes the active content's height without it, and the height the group pins during a switch has no CSS transition, so nothing animates. `dynamicHeight` is not on the docs pages.
5. The JSDoc of `animationDone` says it fires when "the body animation has completed". From the code, it also fires once on the first render, when the initially selected body is centered without any motion (not reproduced).
6. The JSDoc of `KbqTabsConfig.animationDuration` and of `animationDuration` asks for a CSS value; a bare number is accepted too and read as milliseconds.
7. The docs present `KbqTabNavBar` as the component for `routerLink` navigation, but no example uses `routerLink`: the nav bars either bind `tabNavPanel`, or, in `tabs-actionbar`, switch with a `(click)` handler on `<a>` elements without `href`.

**Suspected defects (from reading the code, not reproduced)**

1. In a nav bar without `tabNavPanel`, Enter on a link does nothing: the strip prevents the default action of Enter on any keydown inside it, and only the panel mode clicks the link itself. A `routerLink` or `href` link cannot be followed from the keyboard. In the `tabs-actionbar` example a keyboard user can focus a dashboard link but not switch to it.
2. The arrow keys ignore right-to-left layouts: Right always moves to the next tab in document order, which is drawn on the left. The key manager is configured with the direction, but the strip never passes keys to it.
3. Removing the selected tab from the middle of the list shows the tab that takes its index without emitting `selectedTabChange`, `selectedIndexChange` or `activeTabChange`, and leaves that tab's `isActive` `false`.
4. Adding or removing tabs keeps the selected tab at a new index without emitting `selectedIndexChange` or `activeTabChange`, so a `[(selectedIndex)]` or numeric `[(activeTab)]` binding is left on the old index. Binding that same old index afterwards then changes nothing.
5. With `activeTab` bound to a string, clicking a tab that has no `tabId` selects the first enabled tab instead of the clicked one and emits `null`.
6. Unbinding `tabNavPanel` at runtime leaves `role="tablist"` on the nav bar and `role="tab"`, `aria-selected` and `aria-controls` on the links: without a panel the attributes are read back from the element, and the panel mode wrote them there.
7. Holding a pagination arrow and releasing the button anywhere but on the arrow, while the pointer stays over the strip, keeps the strip scrolling to its end.

**Tests whose name and body disagree, or that cannot fail**

- "should default to the first tab" asserts index 1: the fixture binds `selectedIndex` to 1.
- "should keep exactly one tab in the tab order when the selected tab is disabled" uses a group whose disabled first tab is not selected; the default picks the enabled second tab, so the disabled-selected case is never reached.
- "should lazy load the second tab" checks only that the content exists after the tab is selected, never that it was absent before; it passes with eager content.
- "should select by number and assign number to …" (the first test of "with selection by activeTab input") reads `typeof selectBy` before the asynchronous `activeTabChange`, so it reads the number the test itself assigned.
- `KbqTabNavBar` "should change active index on click" asserts the test host's own `(click)` handler; no nav bar code is involved.
- "should not crash when setting the selected index to NaN" binds `NaN` through the input, whose transform turns it into `undefined`, so the group's own `NaN` guard is never reached.
- "nested KbqTabGroup with enabled animations" enables no animation; the duration stays at its `0ms` default.

**Behaviour without a test.** The spec states these from the source:

- a numeric string for `selectedIndex`; `activeTab` with an unknown id, with a function, and the number it emits after a click in number mode;
- selecting a disabled tab from code; a click on a disabled label in the group;
- the template label winning over `label`; `kbqTabContent` replacing the projected content and being destroyed when its tab is left;
- `selectedIndexChange` and `activeTabChange` arriving asynchronously, after `selectedTabChange`;
- Up and Down in a vertical group, the keys of the other orientation doing nothing, no wrap-around at the ends, keys with a modifier being ignored;
- the tab stop following keyboard focus, and moving to the first enabled label when the selected tab is disabled; the generated label and region id patterns;
- the strip scrolling back to its start once it fits, the 80% arrow step, press-and-hold with its timings and the ignored non-primary button, the re-check after label text changes;
- drag scrolling not starting on nested controls or with a non-primary button, and a new press stopping a coast;
- the bare-number `animationDuration`, the slide direction at the group level, and no motion with animations disabled;
- the host classes of `transparent`, `onSurface` and `dynamicHeight`, the label classes of `underlined`, `iconOnly` and `empty`, and the stretch and align classes (seen only in screenshots);
- an `empty` tab being selectable; the label tooltip's hover and focus triggers and its default `right` placement;
- the text area re-measure after `animationDone` (only the provider is tested);
- the `kbqTab`, `kbqTabNavBar` and `kbqTabLink` export names;
- select, tree-select and dropdown panels closing on scroll inside a tab;
- in the nav bar: the arrow keys, Home and End, a focused link becoming the arrow keys' starting point, Enter and Space clicking a link with a panel, Enter and Space prevented on a disabled link, author attributes kept without a panel, the panel `id` input, the first active link winning, the host classes other than the vertical one, and no state saving;
- in state saving: restoring after a key change, `saveState()`, selections assigned in code not being written, and the `KBQ_STATE_SAVING_ENABLED` default.

## tags

Change: `document-tags-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Separators" section of `tag-input.{en,ru}.mdx` calls the keys set through `kbqTagInputSeparatorKeyCodes` "additional". A bound list replaces the default `[ENTER]`: with `[COMMA]`, Enter no longer ends a tag.
2. The same section says application-wide defaults are set with `kbqTagsDefaultOptionsProvider`. `KbqTagsModule` provides its own `{ separatorKeyCodes: [ENTER] }`, which a standalone component importing the module sees instead of an application-level provider. The comment in the test "emits (tagEnd) when the separator keys are configured globally" says the same. Only a provider on the component, or below the import, takes effect. Not reproduced at the application level.
3. The keyboard table of `tag.{en,ru}.mdx` lists Ctrl + A as "Select all tags". A tag outside a tag list ignores it.
4. The selection section of `tag.{en,ru}.mdx` says a tag is selected by a click "or by setting focus on it". Mouse focus alone does not select, and losing focus deselects a standalone tag, which the page does not mention.
5. The removal sections list "programmatic removal through the API". `remove()` only emits the `removed` request; the consumer deletes the tag.
6. The JSDoc of `KbqTagList.selectable` says that in a non-selectable list the selected states of all tags "are always ignored". A tag's own `selectable` still makes it selectable, and a `[selected]` binding still selects it, after which Delete treats it as a selected tag.
7. The JSDoc of `change` speaks of the "selected tag list value". The event carries the values of all rendered tags.
8. The JSDoc of `KbqTag.remove()` says the tag list calls it on Delete and Backspace. The tag handles those keys itself; the list calls `remove()` only for selected tags and for the cleaner.
9. The JSDoc of `KbqTagList.focus()` says it focuses the tag list. It focuses the tag input or the first enabled tag, and the list host only when nothing else can take focus.
10. The JSDoc of `kbqTagInputTokenEnd` says it is emitted "when a tag is to be added". It also emits an empty value on blur and for every empty part of a paste.
11. The JSDoc of `KbqTagInput` says it "may be placed inside or outside" a tag list. It works only with `kbqTagInputFor` bound (see suspected defect 5).
12. The JSDoc example of `kbqTagRemove` uses a `<kbq-icon>` element. `KbqIcon` matches only the `[kbq-icon]` attribute, so the example renders no icon.
13. The `tag-editable-with-validation` example submits a valid value on a cancel with the reason `focusout`. The tag emits `blur`, so that branch never runs.
14. The keyboard tables of the tag list, tag input and tag autocomplete pages omit Up and Down, which also move focus between tags.

**Suspected defects (from reading the code, not reproduced)**

1. `kbq-tag-with-icon` is bound to the array of projected icons, which is always truthy, so every tag carries the class. No style uses it.
2. In a `kbq-form-field`, a plain click on a tag of a list without a tag input reaches the field's container click, which calls the list's `focus()` and moves focus to the first enabled tag instead of the clicked one.
3. In an empty tag input of a list with no enabled tag, Shift+Tab has its default action prevented while nothing takes focus, so the user cannot tab backwards out of the field.
4. While a tag of a list is being edited, Left, Shift+Tab and Ctrl/Cmd + A pressed in an empty edit input bubble to the list, which takes the edit input for the tag input: focus jumps to the last tag, cancelling the edit, or every tag gets selected.
5. A tag input whose `kbqTagInputFor` is unbound or still undefined throws a `TypeError` on a key in its empty input, on focus, on blur and on a `distinct` check, because it calls into the missing list.
6. When the handler writes the new tag array to the list's form control, as the autocomplete validators example does, the list compares the re-rendered tags with that value, finds no difference and neither marks the control dirty nor emits `change` or `valueChange`. A `ShowOnControlDirtyErrorStateMatcher` then never shows an error. Tags added from an autocomplete option are not flagged as user changes at all, since nothing calls `notifyPendingTagChange()`. Conversely, the flag left by a rejected tag makes a later change of the consumer's data, made in code, count as a user change.
7. The tag list has no role, `aria-invalid`, `aria-required` or `aria-describedby`, and the tags have no role or `aria-selected`, so neither the error state nor the selection reaches assistive technology. `required` only feeds the form field and adds no validator. The skipped "error messages" suite records this; the axe test passes because there is no ARIA to check.
8. Most tag examples use `<i kbq-icon kbqTagRemove>`. `KbqIcon` sets `aria-hidden="true"` on its host by default, which hides the `role="button"` control and its name, as in the select baseline. With the default `tabindex="-1"` axe does not flag it.
9. `distinct` compares the typed text with the tags' `value`. With object values, which the tag input overview example binds, it would never detect a duplicate.

**Tests whose name and body disagree, or that cannot fail**

- `tag.component.spec.ts`:
    - "emits focus only once for multiple clicks" calls `focus()` twice and clicks nothing;
    - "should NOT select tag when it is disabled" uses a tag that is not selectable, so `select()` would do nothing even if `disabled` were ignored;
    - "should NOT select tag on Shift/Cmd/Ctrl + click" passes only because the tag is not selectable; a selectable standalone tag toggles on a modifier click;
    - "should be focused by focus() method" calls the native `HTMLElement.focus()`, not `KbqTag.focus()`.
- `tag-list.component.spec.ts`:
    - "should be able to become focused when disabled" asserts that the list does not become focused;
    - "should not have role when empty" cannot fail, because the list never has a role;
    - both "should clear the selection when the control is reset" tests reset a selection that was never made, since writing a value selects nothing;
    - "should not focus the active tag when the value is set programmatically" cannot fail, because writing a value never touches the tags;
    - "should not set the control to dirty when the value changes programmatically" carries a `// todo need rethink this selection logic` comment;
    - "should maintain focus if the active tag is deleted" and "should move focus to the last tag when the focused tag was deleted with a leave animation" assert before the removal is rendered, so the tag is still there;
    - the `StandardTagList` fixture listens to `(select)` and `(deselect)`, which `kbq-tag` does not emit;
    - three `it.skip` tests under "single selection" and the skipped "error messages" suite, whose only `kbq-error` is commented out, document behaviour that does not exist.
- `tag-input.spec.ts`:
    - "should kbqTagInputAddOnPaste by default" sets `addOnPaste: true` through a provider, so it does not test the default;
    - "emits the (tagEnd) on enter …" names a key release but dispatches a keydown;
    - "emits accepts the custom separator keys in a Set" passes an array;
    - "emits (tagEnd) when the separator keys are configured globally" sets the input binding, as its own comment admits.

**Behaviour without a test.** The spec states these from the source:

- the `kbq-standard-tag`, `kbq-tag_removable`, `kbq-tag_editable` and `kbq-tag-input` classes, the content classes (`kbq-tag-with-avatar`, `kbq-tag-with-trailing-icon`, `kbq-tag-avatar`, `kbq-tag-trailing-icon`, `kbq-tag-remove`), the tag list classes `kbq-tag-list_selectable`, `kbq-tag-list_editable`, `kbq-tag-list_removable` and `kbq-invalid`, and the list's id prefix;
- the text fallback of a tag's `value`, and the long text cut with an ellipsis;
- the default name and tab index of the remove control and its `[localeOverrides]`, which the select spec covers only with its own bound name;
- the prevented default action of Space, Delete and Backspace on a tag, the return value of `toggleSelected()`, `isUserInput: false` for selection that follows focus, and a modifier click toggling a selectable standalone tag;
- the edit start reason taken from the key, the `destroy` cancellation, the selected text of the edit input, Escape not leaving the edit input, and the missing edit input error;
- Up and Down between tags, no wrapping, the `-1` tab index of an empty list, and Ctrl + A from an empty tag input;
- no `selectionChange` on deselection when focus leaves the list;
- the `dropped` payload, the value reported on an edit submit, and `notifyPendingTagChange()`;
- the cleaner not clearing on Escape, and focus moving to the first remaining enabled tag after a clear;
- the `disabled` attribute of the tag input, the empty value requested on blur, key codes without a separator definition, trimming on a `kbqInput`, the native paste when adding on paste is off, Tab as a separator keeping focus, the input never cleared by the directive, and keys not propagating past an empty tag input.

## textarea

Change: `document-textarea-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Both overview pages present `canGrow` as something to turn on ("When the `canGrow` attribute is enabled"). It is on by default, and the overview example has to write `canGrow="false"` to get a fixed field. Neither page says that `canGrow="false"` makes the field resizable by the user.
2. The `maxRows` section does not say that the limit only applies while `canGrow` is on.
3. The JSDoc of `freeRowsHeight` calls it the distance from the last line to the bottom border. The value is added on top of the bottom padding.
4. The JSDoc of `maxRowLimitReached` says it turns true when the maximum number of lines is reached. The measured rows count the padding and the free space below the last line:
    - with the default free row, the flag turns true at `maxRows` lines of text;
    - with `freeRowsHeight` set to `0`, it turns true one line later.
5. `KbqTextarea` and `KBQ_TEXTAREA_VALUE_ACCESSOR` have no JSDoc; the golden file marks both "(undocumented)". The accessor's contract, a `value` getter and setter provided on the same element, is written down nowhere.
6. Neither page mentions:
    - the trimming of the model value and the `no-trim` attribute;
    - `errorStateMatcher`, `placeholder` and `required`;
    - the custom value accessor.
7. `examples.textarea.{en,ru}.mdx` are "documentation in progress" stubs. `structure.ts` sets `hasExamples: false`, so no route shows them.

**Suspected defects (from reading the code, not reproduced)**

1. The clamp at the row limit is `maxRows` times the line height, without the vertical padding. At the limit, fewer than `maxRows` lines are fully visible, and the field becomes shorter, by the padding, than it was one line earlier. The baseline screenshot `__screenshots__/01-light.png` is consistent with this: its "maxRows" field (`maxRows` 5) shows four full lines and a fifth one cut by the bottom border.
2. Switching `canGrow` off does not clear the minimum height set by the last measurement, so the resizable field cannot be dragged smaller than its last grown height. If the row limit had been reached, the limit state and its class stay as well, and no resize handle appears.
3. `KbqFormField.focus(options)` passes its options to the textarea, whose `focus()` takes none, so `preventScroll` and `focusVisible` are dropped.
4. The tab group is looked up only up to the host of the template that declares the textarea. A textarea inside a component placed in a tab therefore does not re-measure when the tab animation ends.
5. The measurement parses the computed `line-height` as pixels. With `line-height: normal`, for example without the Koobiq typography on the element, it gets `NaN`: the textarea stops growing and `maxRows` never triggers. The unit spec's own helper notes that jsdom is in this state.
6. The textarea's stylesheet is carried by `kbq-form-field`, because a directive cannot carry styles. A `kbqTextarea` outside any form field, on a page where none has rendered yet, gets none of the `kbq-textarea` rules and shows the browser's resize handle while it grows.
7. Each measurement inserts a shallow copy of the element next to it and removes it again. For that moment two elements share the textarea's `id`, and a `MutationObserver` on the field sees two mutations per keystroke.

**Tests whose name and body disagree, or that cannot fail**

- "in form › should not run validation (required)" checks the field before `NgForm` registers the control, which happens asynchronously. Validation does run once the control is registered.
- "in form › should run validation after submit (required)": the `ng-invalid` class follows the control's validity, not the submit. The test would probably pass without the click.
- "should not have kbq-textarea_max-row-limit-reached class when maxRows is not exceeded" cannot fail in jsdom. Without a measured line height the row count stays at 0, as the spec's own `measuredLineHeight` helper explains.
- "should defer grow to microtask so lineHeight is initialized before first grow call" never checks the line height. It checks that the measurement after an input event is deferred.
- "should drop the grows still pending when the textarea is destroyed" asserts only that the element left the DOM. It fails only through an uncaught error from a late measurement.
- "async validation › should emit VALID via statusChanges on blur": `VALID` comes from `setValue` and the timer. The blur part calls the handler directly, so there is no DOM blur and the control is not touched. It then checks that nothing more is emitted.
- 'should change "disabled" state' binds `[disabled]` together with `[(ngModel)]`, so the state reaches the textarea through `NgModel`'s control. The `disabled` input on its own is never tested.
- The comments in "should report the bound canGrow rather than folding in the row limit" describe change history ("The old getter returned …").

**Behaviour without a test.** The spec states these from the source:

- the `kbq-native-scrollbar` host class and `exportAs`;
- the `kbq-form-field-type-textarea` class and focusing on a container click;
- the free space below the last line and the single-line minimum; the baseline screenshot shows the free row;
- `kbq-textarea-resizable` at the row limit, growth resuming below the limit, and the limit never reached with `canGrow` off;
- the `disabled` input without a form, the precedence of the form control's disabled state, and disabling clearing the focus state;
- reading back a value written by a form with `emitEvent: false`, the `[value]` binding and `empty()`;
- `no-trim` and the unchanged displayed text on a textarea; both are tested on `kbqInput` only;
- `aria-invalid`, plus `kbq-form-field_invalid` and the rendered `kbq-error` for a textarea (only the screenshot shows them);
- no error state without a form directive, and the `errorStateMatcher` input taking precedence over the provider;
- the generated and custom id and the `<label for>`;
- `aria-describedby`, which is tested on `kbqInput` only;
- `focus()` and `focused()`;
- server rendering.

## time-range

Change: `document-time-range-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. "Empty value and value correction" lists three reasons for `valueCorrected`. A preset written without `startDateTime` is corrected and reported too, and `{ type: 'lastHour' }` is the form every docs example and the e2e page write. With an empty `availableTimeRangeTypes` any written type is kept, which the section does not say either.
2. The JSDoc of `availableTimeRangeTypes` says the options are offered "in order". `range` is always rendered last, wherever it sits in the list, and with `showRangeAsDefault` it is shown even when it is not listed.
3. "Providing presets through DI" says an entry can carry "a fixed `range` instead of a duration". Such an entry has `translationType: 'other'`, and both the default option label and the built-in trigger render it as empty text. The examples hide this behind their own templates.
4. "Selection restriction" says a `maxDate` at 23:59 makes the whole day available. The time fields include seconds (`HH:mm:ss`), so 23:59:01 to 23:59:59 are still rejected.
5. `KbqTimeRangeOptionContext` declares the duration units flattened onto the context, and `optionTemplate` is typed as a template of that context. At runtime the template gets `{ $implicit: … }`, and the units are nested under `units`.
6. In `types.ts` the JSDoc meant for `KbqCustomTimeRangeType` sits above `KbqTimeRangeUnits`. The golden file shows `KbqTimeRangeUnits` with that text and `KbqCustomTimeRangeType` as undocumented.
7. Exported but unusable:
    - `rangeValidator` takes the service, which the entry point does not export (a TODO in `constants.ts` already says so);
    - `KbqTimeRangeEditor` and `KbqTimeRangeTitle` are in `KbqTimeRangeModule` but throw outside `kbq-time-range`.
8. The docs pages do not say that a `DateAdapter` and a `DateFormatter` must be provided. Every example provides its own `DateFormatter`.
9. Custom types are not part of `KbqTimeRangeType`, so a list that includes them needs a cast (the custom range types example uses `as KbqTimeRangeType[]`).
10. Smaller things in the examples:
    - the examples tab calls the popover "a dialog";
    - the custom trigger example names its button with a fixed English `aria-label`.

**Suspected defects (from reading the code, not reproduced)**

1. When the popover closes, `kbqPopover` hands focus back to its host, the `kbq-time-range__trigger` wrapper. The wrapper is not focusable, so after Apply, Cancel or Escape focus probably falls to `<body>`.
2. The wrapper, not the focusable link, button or form-field control, carries `aria-expanded`, `aria-haspopup="dialog"` and `aria-controls`. The popover has no header and no `kbqPopoverAriaLabel`, so the panel has neither `role="dialog"` nor a name, although `aria-haspopup` promises a dialog.
3. `kbq-time-range-title-as-control` is focusable and named through `aria-labelledby` but has no role, and naming a generic element is prohibited. It also sets no `aria-invalid` or `aria-required`. The only axe test renders the editor, not the trigger.
4. Both fields of one end are named only by the end's prefix ("с" or "по"), so a screen reader cannot tell the time field from the date field.
5. With `showRangeAsDefault` on and `range` absent from `availableTimeRangeTypes`, the user can apply a manual range. Writing that value back, for example when it is restored from a URL, replaces it with the first type, because only listed types are kept.
6. With an empty `availableTimeRangeTypes`:
    - a preset such as `{ type: 'lastHour' }` written after initialization is kept, and the editor then opens with the range fields disabled and no option to switch them on;
    - the switch to `range` made once after initialization reaches the bound control as a user change, which marks it dirty, and is not reported through `valueCorrected`;
    - adding `[showRangeAsDefault]="false"` leaves the editor empty.
7. `valueCorrected` at initialization:
    - the component writes the control's value in `ngOnInit`, and the forms layer writes it again when it connects, so an initial value that needs correction is probably reported twice;
    - `ngModel` writes its value asynchronously, so under `nonNullable` a correction of `null` is probably reported before the model's own value arrives.
8. A type that neither the built-in set nor `KBQ_CUSTOM_TIME_RANGE_TYPES` knows fails with a bare `TypeError` (reading `units` or `translationType` of `undefined`) instead of a named error.
9. The built-in label of a duration preset is computed from the stored `startDateTime` to now:
    - a stale `startDateTime`, such as one restored from a URL, shows a different duration;
    - a `startDateTime` in the future or one that does not parse makes the date formatter throw while the trigger renders.
10. The `ru-RU` and `en-US` `durationTemplate.title.YEARS` use "# год" and "# year" for the singular, where every other unit says "последний" or "Last". A custom one-year preset reads "1 год" on the trigger.

**Tests whose name and body disagree, or that cannot fail**

- "should select first radio if availableTimeRangeTypes provided": the bound value is the first type as well, so the test cannot tell "the first option" from "the option of the value".
- "should disable the editor form together with the control": disabling closes the popover. The assertion holds only because the fake clock never runs the hide timer, so a user never sees a disabled editor.
- "should caption the bounds even with no preset option to hang them off" looks for a radio button inside the from/to block, which never holds one, so that assertion cannot fail.
- "should take focus from a click on its form field" does not check that the same click opens the popover, or where focus is once it has.
- "should check range as default if nothing provided" empties a bound list after initialization; "nothing provided" does not describe that.
- The `TestTimeRangeCustomOption` fixture carries the selector of the `time-range-custom-range-types-example` docs example.

**Behaviour without a test.** The spec states these from the source:

- opening with Enter and Space; Escape and an outside click closing the popover; focus moving into the popover and staying there;
- the popover placement and `arrow`;
- `showRangeAsDefault`;
- the default manual range without bounds ("yesterday to now");
- the empty labels of custom `'other'` types, on the trigger and in the options;
- the shape of applied presets (`startDateTime` only, the start of the quarter or year, no dates for `allTime`, a custom fixed range);
- Apply passing an unchanged value, the error of a wholly empty end after Apply, and focus moving to the first field at fault;
- `value` not following unapplied edits;
- a custom trigger opening the popover, and the `popover` and `formattedDate` properties of its context;
- the form-field container click opening the popover;
- the calendars limited to the bounds;
- a custom type with a built-in name being ignored;
- the missing `DateAdapter` or `DateFormatter` error;
- any written type kept when the list is empty, the switch to `range` once after initialization with an empty list, and `valueCorrected` for a preset written without `startDateTime`;
- disabling while the popover is open;
- the `role="button"` of the trigger link and the ARIA on the trigger wrapper;
- a rendered locale switch (the test reads the configuration, not the component) and `[localeOverrides]`;
- the `kbqTimeRangeTitlePlaceholder` class (covered only by an e2e screenshot).

## timepicker

Change: `document-timepicker-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The keyboard table says Left and Right move the caret by one character. The code selects the whole previous or next part, and only when the field has a value.
2. The keyboard table says Home and Page Up place the caret before the first hour digit, and End and Page Down after the last part. The code selects the hours or the last part.
3. "Entering symbols and digits" says a symbol typed after two digits is ignored. The code rejects it and emits `incorrectInput`, which shows the validation tooltip.
4. The Space row says Space after two digits moves to the next part. Reading the code, typing two digits already selects the next part, and Space then moves one part further.
5. "How it works" says time can only be entered in 24-hour format. A paste accepts `h:mm am` and `h:mm pm`.
6. "Validation of copied values" says text dropped with drag and drop is validated as it is entered. There is no drop handler: dropped text is read only on the next parsed key or on blur.
7. "How it works" says only a colon is inserted after two digits. The code rewrites the text as a full time, with `00` in the missing parts.
8. "Design and animation" says the right padding is always 16 px. `timepicker.scss` uses `--kbq-timepicker-size-padding-right`, which design tokens do not define, falling back to `--kbq-size-s` (8 px).
9. The JSDoc of `min` and `max` speaks of the earliest and latest time. The comparison uses the whole date and time, down to milliseconds.
10. These public names do not match their meaning:
    - `kbqTimepickerLowerThenMin` and `kbqTimepickerHigherThenMax` misspell "than";
    - `HOURS_PER_DAY`, `MINUTES_PER_HOUR` and `SECONDS_PER_MINUTE` hold the largest value of a part (23, 59, 59), not a count.
11. `incorrectInput` has no JSDoc. `hasSelection` carries a TODO in the source saying nothing uses it.
12. The examples tab (`examples.timepicker.{en,ru}.mdx`) is a "documentation in progress" stub, while the overview embeds all three examples.
13. The English overview lacks the structure and design images of the Russian one.
14. The overview and variations examples set the Russian tooltip text "Только цифры" on the English page as well.

**Suspected defects (from reading the code, not reproduced)**

1. A time typed into an empty field takes its milliseconds, and in `HH:mm` format often its seconds, from the current time. Typing exactly the `max` of the validation example, a whole hour, then fails `kbqTimepickerHigherThenMax` while the field shows the maximum.
2. Pasted 12-hour times have these problems:
    - `12:xx pm` becomes hour 24, which the Luxon adapter rolls over to `00:xx` of the next day;
    - `12:xx am` also lands on the next day (the unit test checks only the time);
    - hours 13 to 19 are accepted with `am`/`pm`;
    - `1:30PM` without the space is read as 01:30.
3. Pasted text without digits, or with more than three groups of digits, is written into the input as is. The value stays as it was, and nothing re-validates the control, so no `kbqTimepickerParse` error appears.
4. Without a form control, clearing the text and leaving the field reports `null` to nobody: `value()` keeps the previous time while the input is empty.
5. The arrow keys act on the last parsed value, not on the text. With `12:3` typed over `12:18`, Up shows `12:19` and drops what was typed.
6. `value()` takes the bound control's raw `valueChanges` without reading them through the date adapter. A control holding an ISO string leaves `value()` a string, and the arrow keys then compute an invalid date. The subscription is never unsubscribed.
7. Gaining focus marks the control touched. With the default matcher, a required empty timepicker therefore reports its error as soon as it is focused, before the user has typed anything.
8. A time zone change while the field has no value renders empty text over what the user has half typed.

**Tests whose name and body disagree, or that cannot fail**

- "Should ignore SPACE keyDown" dispatches a key event without `key`. It would pass without the Space handler.
- "Manual keyboard input digit-by-digit" asserts the text the test itself wrote. The directive does not listen to the `input` event it dispatches.
- "should emit VALID via statusChanges on blur": `VALID` comes from `setValue`; the blur part only asserts that nothing new is emitted.
- "Should invalidate time lower then min-time after typing while focused and blurring" pastes instead of typing. The paste alone makes the control invalid.
- "Paste am/pm from clipboard: 10:30 Pm" pastes `10:30 pm` in lower case.
- "Paste am/pm from clipboard: 12:3 aM" asserts only the time, so the day it moves by goes unnoticed.
- The two "should call errorStateMatcher and NOT update errorState on blur" tests (`ShowOnFormSubmitErrorStateMatcher`, `ShowOnControlDirtyErrorStateMatcher`) blur without a focus first. That does not touch the control, so they would pass with the default matcher too.
- The comment in "should call errorStateMatcher and update errorState on blur" says the control is touched only on a focus-to-blur transition. Focus alone touches it.
- The `HH:mm` tests with a `null` value check the value only up to the minutes. The seconds and milliseconds taken from the current time are not pinned.

**Behaviour without a test.** The spec states these from the source:

- the error thrown without a `DateAdapter`;
- a bound `placeholder`, the fallback to the exported placeholder map, `[localeOverrides]` and `kbqTimepickerLocaleConfigurationProvider()`;
- rejected letter and symbol keys, `incorrectInput` from a real key press, and the separator typed through a key press (the tests set the text and read it on the timer);
- in `HH:mm` format, ignoring pasted seconds and keeping the previous ones;
- Right and the wrap-around of Left and Right; Home, End, Page Up and Page Down;
- Space (its test cannot fail);
- Backspace and Delete not updating the value, and blur reporting `null` for empty text;
- padding and clamping of pasted text (only full times are pasted in the tests);
- `min` and `max` on another day, unreadable bounds ignored by the validators, and the error payloads;
- the `size`, `autocomplete` and `id` attributes, the `kbq-input` and `kbq-timepicker` classes, and the `kbq-form-field-type-timepicker` class;
- disabling through the form control, and losing focus state when disabled;
- focus alone marking the control touched (only `inline-edit.spec.ts` relies on it);
- the form-field container click;
- the 10 ms show delay, the 3,000 ms hide and no second show while the tooltip is open;
- the time zone change;
- `value()` and `viewValue` (read only in `inline-edit.spec.ts`);
- the values of `HOURS_PER_DAY`, `MINUTES_PER_HOUR` and `SECONDS_PER_MINUTE`.

## timezone

Change: `document-timezone-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Search" section of `timezone.{en,ru}.mdx` says the search splits the query into words, trims it, ignores case and folds diacritics. The select does not filter at all; that is `createSearchPredicate` in the example. What the option does itself, narrowing its city list, ignores case but does not fold diacritics or split the query.
2. The docs page says grouping is done by "three pure helpers, so the same data produces the same list on the server and in the browser", and the JSDoc of `getZonesGroupedByCountry` says the same input gives the same groups "on any machine". Zones without `offset` are sorted by the offset they are on at `Date.now()`, and the country names are compared with `localeCompare` in the host's default locale.
3. The docs page says `KbqTimezoneOptionTooltip` shows "the full city list". With `highlightText` set, it shows the narrowed list.
4. The JSDoc of `offset()` promises a signed `±HH:MM`. A zero offset comes out unsigned (`00:00`), and a value written with a leading `+` (`+03:00:00`) comes out negative (`−03:00`).
5. The JSDoc of `parseOffset` says it converts a "formatted offset". It cannot read the negative offsets `offsetFormatter` writes, because they use U+2212: `parseOffset(offsetFormatter('-03:00:00'))` is `NaN`, with an "Unknown time zone" warning in dev mode.
6. The JSDoc of `KbqTimezoneSelect.ngOnInit` relies on `KbqSelect` refusing a later change of `multiple`. Neither class refuses a later change of `multiline` (see suspected defect 2).
7. `KBQ_TIMEZONE_LOCALE_CONFIGURATION` is `@docs-private`, yet the search example injects it to read `otherCountriesLabel`. The docs page mentions neither `otherCountriesLabel` nor `kbqTimezoneLocaleConfigurationProvider`.
8. The `timezone` input of the option is `@docs-private` (only the getter is documented), and `highlightText` has no description, although both are needed by every search example.
9. The keyboard section says typing letters "in the field or in the open menu" moves to the matching city. With a search field projected, typing in the open panel goes to the search; on a closed select typing selects the option rather than only moving to it.
10. `examples.timezone.{en,ru}.mdx` is the "Documentation in progress" stub, although three examples exist; `structure.ts` sets `hasExamples: false`, so the tab is not routed.

**Suspected defects (from reading the code, not reproduced)**

1. `KbqTimezoneSelect` re-declares the providers of `KbqSelect` but not `KBQ_PARENT_POPUP`. Tooltips inside its panel, including the overflow tooltip, do not get the "parent pop-up closed" signal that hides them in `kbq-select`.
2. `multiline` turned on after the first change detection is not rejected. The select then seems to handle keys, clicks and the value as in multiple selection (arrows open the panel, a click keeps it open, the value is reported as an array) while its selection model stays single.
3. A `kbq-timezone-option` without `[timezone]` throws while rendering: the template and `viewValue` read the city and offset of an undefined zone. The `value` getter falls back to `[value]` as if a missing zone were supported.
4. With `foldDiacritics`, the highlight folds diacritics but the city list is narrowed without folding, so an option found through a folded city (`zurich` for `Zürich`) shows an empty city list.
5. Offsets west of UTC are rendered with U+2212. A query typed with a hyphen-minus (`-03`) marks nothing in such an offset, although the search example normalizes the dash to find the zone.
6. Only the `<kbq-timezone-select-trigger>` element is a trigger slot. A `kbq-select-trigger`, as used with `kbq-select`, matches no slot and seems to be projected into the default slot, which is inside the option list.
7. An explicit `offset` written with a leading `+` is labelled as negative (see docs finding 4) but sorted as positive, so the label and the position in the list disagree.

**Tests whose name and body disagree, or that cannot fail**

- "should keep the selected option as the active one after click selection": the clicked option is the last enabled one, and Down from the first option skips the disabled one and lands on it too, so the value is the same whichever option is active.
- "should clear the selection when the control is reset" ends by checking that the second option is not selected; that option is disabled and was never selected. The trigger assertions before it do check the reset.
- "should not display the tooltip when option text fits within the visible-rows clamp" cannot fail in jsdom: jsdom measures no line boxes, so the list always "fits", the width it sets has no effect, and no time passes for the 400 ms enter delay.
- "should filter options by the search input value" asserts the test host's own filter; the select does no filtering.
- "should not attempt to open a select that does not have any options" checks only the moment after the click; the panel opens 101 ms later.
- "should show the search input when option count is at or above the threshold" tests 3 options against a threshold of 2; the "at" boundary is not tested.
- "should not re-assign its state when the measured line count is unchanged" (option spec) spies on the `disabled` setter, which the directive never calls: it records its state through `setDerivedDisabled`, so the spy stays silent whatever happens.

**Behaviour without a test.** The spec states these from the source:

- `[value]` ignored on a timezone option, a plain `kbq-option` inside the timezone select, and the option's `viewValue` input being ignored;
- the trigger value on one line, `ngModel`, and the `disabled` input (the Playwright states screenshot renders the last two without asserting them);
- the panel of an empty select appearing after 101 ms;
- the cleaner (rendered in a screenshot, never activated);
- `role="option"` and the host classes of the option, the combobox ARIA of the select, its `kbq-select` host class and the listbox without `aria-multiselectable`;
- the zero offset written `UTC00:00` and `parseOffset` returning `NaN`;
- `promoteCountry` matching the country case-insensitively, and `collapseOtherCountries` with an unknown country;
- the overflow tooltip: re-checking on a content change, the right-hand placement, pointer events passing through, showing on keyboard focus, hiding on pointer leave, and `kbqTooltipDisabled="false"` not forcing it;
- the highlight in the offset columns and the city, and `foldDiacritics`;
- the empty-search-result slot, and a query keeping the search visible below the threshold;
- the attribute form of `kbq-timezone-select-trigger` not being matched;
- `kbqTimezoneLocaleConfigurationProvider` and the `otherCountriesLabel` strings.

## title

Change: `document-title-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqTitleDirective` says the tooltip hides on "a resize of the measured container". A resize closes it only when the text then fits; a resize that leaves the text truncated keeps it open.
2. The first sentence of `title.en.mdx` and `title.ru.mdx` says the tooltip appears when the content "is truncated with an ellipsis". A clip of a whole pixel or more counts without an ellipsis too, and the unit spec asserts it.
3. The "Accessibility" bullet of the docs says the tooltip opens on keyboard focus, but not that the host has to be focusable on its own. None of the five docs examples has a focusable host, so a keyboard user gets no tooltip in any of them.
4. The `Title` entry of `structure.ts` has `path: 'packages/components/core/title'`, so the docs link to the source points at the folder that holds only `KBQ_TITLE_TEXT_REF`, not at `packages/components/title`. The entry also sets `hasExamples: false`, while `examples.title.{en,ru}.mdx` exist as "documentation in progress" placeholders.
5. `TitleOverviewExample` carries a `field` property, an `onAddText()` method and a `KbqButtonModule` import that its template never uses, and a `wide` class that no rule styles.

**Suspected defects (from reading the code, not reproduced)**

1. The directive overrides `ngAfterViewInit` without calling the tooltip trigger's version, which is where a tooltip subscribes to the closing of a parent pop-up (`KBQ_PARENT_POPUP`, provided by `kbq-select` and `kbq-tree-select`). A `kbq-option kbq-title` tooltip that is open when the select panel closes may therefore stay open, anchored to a detached option.
2. Mutations are throttled without a trailing emission: a second change of the container content within 100 ms of the first is dropped, so an open tooltip may keep showing the earlier text until the next hover.
3. The default content is the `textContent` of the container. With several `#kbqTitleText` elements separated only by markup whitespace, which Angular removes by default, the texts run together: the multiple-text example probably shows `Status:A long value…` with no space after the colon.
4. The resize and mutation observers are bound once, in `ngAfterViewInit`, to the container resolved then. A `#kbqTitleContainer` rendered later, for example inside `@if`, is measured on hover but its resizes and mutations are not followed.
5. Until the first hover, keyboard focus, resize or mutation, `disabled` reads `false` even for text that fits. In a browser the first resize observation closes this gap after about 100 ms.
6. For a plain-text host whose whole-pixel widths show no overflow, which includes every such host whose text fits, the directive adds and removes a temporary element in the container to measure the text. That is a content mutation the directive observes itself, so each such hover probably runs one more overflow evaluation.

**Tests whose name and body disagree, or that cannot fail**

- "should enable but not open the tooltip when the content fits" asserts that `disabled` is `true`: the tooltip is not enabled.
- "should update disabled=true after debounceTime(100) on a container resize when not overflown" checks only after 100 ms and would pass without the debounce.
- "should open tooltip for overflown text with inline element" mocks the widths of the host, which is the measured element as in the plain case; the inline `<span>` plays no part.
- "should stop monitoring focus on destroy" passes on the teardown of the inherited tooltip trigger alone, whatever the directive does with its own focus subscription.

**Behaviour without a test.** The spec states these from the source:

- the `kbqTitle` export name and the `KbqTitleModule` re-export;
- the temporary measuring element being removed again;
- the exception for elements with a zero client width in the sibling-clip rule;
- no tooltip and no overlay pane for empty content;
- mutations being ignored for 100 ms after the one handled;
- a resize enabling the tooltip without opening it;
- `ignoreTooltipPointerEvents` set to `false`;
- the `aria-describedby` rule, which `tooltip.spec.ts` tests for `kbqTooltip` but no test exercises through `kbq-title`.

## toast

Change: `document-toast-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The animation section of `toast.en.mdx` and `toast.ru.mdx` says the toast appears "from the left", that its height does not change as it leaves, and that it slides beyond the right edge of the screen. The enter keyframe starts the toast offset to the right by its full width, for every position, left-anchored stacks included. The exit moves it by half its width while it fades, and collapses its height to zero, which is how the toasts below rise.
2. Both pages say a message "must remain in the toast list for at least 5 seconds". 5000 ms is only the default `duration`. Any duration is honoured (the e2e scenario uses 2000 ms); the only floor the code enforces is `delay`, after a dismissal or a pause.
3. The close button section says a `closeButton` template replaces the built-in button, but not that it needs the `kbq-toast-close-button` attribute. Without it, the focus hand-off skips that toast, and focus falls back to the trigger or is left where the browser puts it.
4. The docs pages do not mention:
    - `onTop`, as an argument or as a configuration key;
    - the `duration`, `delay` and `indent` configuration keys;
    - `hide()`, `hideTemplate()`, `read`, `hovered()` and `focused()`;
    - `KBQ_TOAST_FACTORY`;
    - Escape closing a toast that has no close button.

    In the API golden file `show`, `showTemplate`, `hide`, `close`, `KBQ_TOAST_CONFIG`, `KBQ_TOAST_FACTORY` and every `KbqToastData` field but `style` are `(undocumented)`.

5. The JSDoc of `timer` says the countdown pauses for "the pointer or the keyboard focus". Focus moved by a mouse press or by code pauses it too.
6. The JSDoc of `KbqToastConfig.indent` does not say that `center` ignores the indent and that `top-center` and `bottom-center` ignore its horizontal part.
7. `isFocusedOrHovered` is public and undocumented, and a TODO in the source says nothing in the library uses it.
8. The first sentence of the overview says a toast "appears in the top right corner". That is the default position only.

**Suspected defects (from reading the code, not reproduced)**

1. DS-5407 again. The container merges its resize notifications into `elementScrolled()`, and the scroll dispatcher re-broadcasts them to the whole application. An overlay with the close scroll strategy that does not contain the container, such as a tooltip, would close whenever a toast appears or leaves. The dev app keeps a manual "DS-5407" check block for this case.
2. A toast created in a `kbq-toast-container` that a consumer hosts is not in the root service's records. Its close button and Escape make the root service's `read` emit, but `hide()` finds no record, so the toast stays. Hovering or focusing it pauses the root service's stack.
3. Escape closes a toast that has no close button, such as the progress toast the docs recommend for an operation the user can cancel. The toast goes away without its "Cancel" action running.
4. A style outside `KbqToastStyle` with the default `icon: true` renders an empty icon container, which still takes the icon's width and margin.
5. Toast ids and template ids come from two counters that both start at 0, so `hide()` given a template's id removes the toast with the same number.
6. The focus hand-off picks the first toast in stack order, not the one next to the closed toast. With the default append order, closing the bottom toast from the keyboard sends focus to the top toast, past every toast in between: the jump the source comment says the stack order avoids.
7. Focus moved into a toast by a mouse press, on an action that does not close it, pauses the whole stack until focus leaves the toast. The pointer leaving does not end that pause.
8. Views destroyed from outside are dropped only on a heartbeat step, and steps are skipped while the stack is paused. A view destroyed during a hover keeps the overlay attached and the heartbeat running until the pause ends.
9. The `toast-hide-overview` example changes a plain `progress` field from an rxjs timer in an `OnPush` component. In the zoneless docs app, the "import complete" state probably renders only when the toast starts to leave.

**Tests whose name and body disagree, or that cannot fail**

- These three pass only because the jsdom `ResizeObserver` stub in `tools/vitest/setup-angular.ts` never fires. In a browser, the reflow requirement says the dispatcher is notified, and the "stack reflow" suite, which stubs the observer, asserts exactly that:
    - "does not notify the global ScrollDispatcher when a toast is shown, animated and hidden";
    - "keeps an overlay with the close-on-scroll strategy attached when a toast appears";
    - "keeps an open tooltip open when a toast appears".
- "hands the focus to the adjacent toast rather than the oldest one when `onTop` is set": the code picks the first toast in stack order. It is the adjacent one only because the closed toast was on top.
- "renders a custom icon class next to the default glyph" asserts the custom class only, not that the glyph class is still there.
- "reports a toast as read exactly once across repeated hover cycles and a close" would also pass if hovering never marked the toast as read: the close alone emits once.
- "renders only the title when nothing else is given" uses a fixture that still has a style, an icon and a close button.
- The e2e "renders the toast in the overlay, at the configured stack position" checks the container's class, not where the stack is on screen.

**Behaviour without a test.** The spec states these from the source:

- line breaks kept in string slots;
- the caption taking the title's place;
- the `$implicit` context of the slot templates (the e2e screenshot renders slot templates but does not use their context);
- `icon: false`, an icon template, `closeButton: false`, a close button template and the `kbq-toast_dismissible` class;
- a style outside `KbqToastStyle`: `role="status"` and no glyph;
- a negative duration making a toast sticky;
- one expiry per step;
- the pause renewing short lifetimes;
- template toasts paused by a hovered toast but not by their own hover;
- `read` on a click and on a dwell, and no `read` on expiry or `hide()` (the dwell itself is covered by `core/common-behaviors/read-state.spec.ts`);
- Escape closing a toast without a close button;
- `hide()` ignoring an unknown id;
- the anchoring and the `indent` of each position (only the class is tested);
- the `kbq-animations-disabled` class (the e2e test checks only that a toast still shows and closes under reduced motion);
- the locale texts of the close button and the region (the tests only check that they are not empty);
- the untracked service calls from an `effect()`;
- `createTemplate()` and `remove()` of a container hosted by a consumer;
- the `focused()` signals going back to `false`.

## toggle

Change: `document-toggle-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `indeterminate` is copied from the checkbox. It speaks of "a checkbox with three states" and says a click sets `indeterminate` to `false` "immediately". The toggle clears it in a microtask, after `change`, and with the `check` and `noop` click actions it does not clear it at all.
2. The `toggle-indeterminate` and `toggle-loading` examples render a toggle with no label text, `aria-label` or `aria-labelledby`, so its checkbox has no accessible name. The accessibility section of the same page asks for one.
3. The `toggle-with-hint` example says "When this witch is off"; it means "switch".
4. The "Error" section shows only `color="error"`. It does not say that the toggle never takes an error state from an invalid form control, as other form controls do.
5. These have no place in the toggle pages:
    - forms integration (`ngModel`, `formControl`) — every example binds `[checked]` and `(change)`;
    - Enter switching the toggle;
    - `indeterminateChange` and `[(indeterminate)]`, and the absence of `[(checked)]`;
    - `id`, `tabIndex`, `focus()` and `getAriaChecked()`.
6. The golden file marks `KbqToggleComponent` and most of its members `(undocumented)`: `change`, `big`, `labelPosition`, `name`, `value`, `focus()`, `getAriaChecked()` and `inputId`, among others. The template handlers `onChangeEvent()` and `onInputClick()` are public and carry neither JSDoc nor `@docs-private`.

**Suspected defects (from reading the code, not reproduced)**

1. Static `tabIndex`, `aria-label` and `aria-labelledby` attributes written on `<kbq-toggle>` stay on the host element as well as reaching the checkbox, because nothing clears them on the host. A static `tabIndex` would make the host a second tab stop. An `aria-label` on a host without a role may be reported by axe (`aria-prohibited-attr`). Bound values such as `[tabIndex]` are not affected.
2. `big` has no boolean transform, unlike `disabled`, `checked`, `indeterminate` and `loading`. A bare `big` attribute gives an empty string, so the toggle stays at its normal size, and strict template type checking rejects it.
3. With the `check` click action, a click on an indeterminate toggle clears the `indeterminate` property of the native checkbox. The component stays indeterminate, and its unchanged binding does not set the property again. The impact is low, because assistive technology reads the explicit `aria-checked`.
4. No unit test runs axe on the toggle (`toHaveNoViolations` is not used in its spec). So finding 1 above and the unnamed examples go unnoticed.

**Tests whose name and body disagree, or that cannot fail**

- "should make the host element a tab stop" asserts the tab index of the inner checkbox; the host is not a tab stop.
- "should not trigger the change event by changing the native value" changes the `checked` binding, not the native value.
- "with ngModel › should toggle checked state on click" never reads the model. No toggle test checks that a click reaches the form.
- The "without label" group tests the `name` and `value` attributes. Its fixture has a label binding that is only empty.
- "should trigger a change event when the native input does" counts the calls but never checks the `KbqToggleChange` it receives.
- "should toggle on enter without submitting the enclosing form" checks `defaultPrevented` only; it does not observe a submit.
- "should should not clear previous defined classes" repeats a word. The color tests use `primary` and `accent`, which are not `KbqComponentColors` values and have no style.
- The e2e "should expose the loading state to assistive technology" asserts `toBeDisabled()`. Playwright accepts `aria-disabled` alone for that, while the unit test asserts that the native checkbox is not disabled, so the two read as contradicting each other.
- The e2e "should have correct size" asserts the same 28 by 16 px switch before and after `big`. The name does not say that the size is meant to stay.

**Behaviour without a test.** The spec states these from the source:

- writing `checked` in code does not reach a bound form control;
- the content of the `KbqToggleChange` payload;
- no `checkedChange` output, so `checked` is one-way;
- no click event on the host for a keyboard switch;
- Space switching the toggle;
- the focus origin classes on the host, and the keyboard origin of `focus()`;
- `aria-disabled="true"` and `tabindex="-1"` on a disabled toggle (the tab index only through the shared test host);
- coercion of `indeterminate`, `loading` and the string `"false"`, and no coercion for `big`;
- no error state taken from forms;
- `indeterminateChange` for changes made in code, and `[(indeterminate)]`;
- `indeterminate` cleared after `change`, in a microtask;
- keys ignored while loading;
- `aria-describedby` set without a hint;
- the `value` attribute when `value` is given;
- the `check` click action on the toggle (only through the shared test host);
- through the toggle: the form value after a click, the dirty state, truthy coercion of written values and `formControlName` (only `ngModel` and value coercion, through the shared test host);
- the form value being current in the `change` handler;
- touched on a user switch;
- a `tabIndex` that is not a number giving `0`;
- motion turned off by noop animations;
- `getAriaChecked()` called on the toggle;
- the `kbqToggle` template reference.

## tooltip

Change: `document-tooltip-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `kbqTooltipModifier` says `warning` renders a warning tooltip, and the v20 migration rewrites `kbqWarningTooltip` to it. The modifier only adds `kbq-tooltip_warning` (or `kbq-tooltip_extended`), and no stylesheet in the library targets either class; the look comes from `kbqTooltipColor` alone. The timepicker and datepicker docs examples set `kbqTooltipModifier="warning"` without a color, so their hints render in the default contrast color.
2. The "Delay" section says the 0.4 s delay comes back once the previous tooltip "has disappeared and more than 2 seconds have passed". The window is measured from the moment the previous show started, not from when it disappeared, so a tooltip kept open for more than 2 s is followed by a full delay.
3. "Moving the Cursor onto the Tooltip" opens by saying that moving the cursor onto the tooltip does not close it. With the defaults (no `hideWithTimeout`, `kbqLeaveDelay` 0) the close scheduled on `mouseleave` still runs in the next task; only `hideWithTimeout` with a leave delay keeps the tooltip, as the second half of the paragraph says.
4. The "Interactive Tooltip" example sets `[hideWithTimeout]="true"` without `kbqLeaveDelay`, so the delay it describes is 0 ms. The JSDoc of `hideWithTimeout` ("will delay tooltip hiding") does not say that the delay is `kbqLeaveDelay`.
5. The JSDoc of `kbqTooltipHeader` says it is "only meaningful" with the `extended` modifier; the header is rendered with any modifier.
6. The JSDoc of `kbqRelativeToPointer` says it "does not work with kbqPlacementPriority". Both are applied together, and the unit fixture combines them.
7. The docs say `kbqPlacementPriority` configures "fallback positions". The list replaces the whole order, `kbqPlacement` included, so its first entry is tried first.
8. The caret section says the tooltip anchors to the field when the caret cannot be located. It anchors to the trigger element's box, which is a wrapper, not the field, when the directive sits on a container.
9. The "Delay" section shows the `tooltip-hide-with-timeout` example, which does not use `hideWithTimeout` at all.
10. These have no place on the tooltip pages: `kbqTooltipModifier`, `kbqTooltipHeader`, `kbqVisible` and `kbqVisibleChange`, `kbqPlacementChange`, `KBQ_TOOLTIP_INSTANT_SHOW_WINDOW`, `KBQ_TOOLTIP_SCROLL_STRATEGY`, `showForElement()`, and `forDisabledComponent` outside the examples.

**Suspected defects (from reading the code, not reproduced)**

1. Escape on the trigger element of a pinned (`manual`) tooltip, or bubbling from inside it, closes the tooltip through the trigger's own `keydown` handler and marks the key as handled, although the document-level handler deliberately skips pinned tooltips. The validation tooltip sits on the `kbq-form-field` around the input, so Escape typed in the input closes it and an enclosing modal does not close on that press.
2. A cancelled show counts for the instant-show window: the timestamp is taken when a show starts, so a pointer that crosses a trigger in less than the enter delay makes the next tooltip within 2 s appear at once although nothing was shown. Pinned tooltips shown from code count too.
3. With `kbqTooltipOffset` set, the margin is written on the side of the placement the tooltip has at that moment. When a fallback then flips the tooltip, the custom gap is lost: the stylesheet gap applies on the new side and the old margin stays.
4. Changing `kbqTooltipColor` while the tooltip is open does not recolor it until it is repositioned or reopened; clearing `kbqTooltipClass` while open does not remove the class either. `kbqTooltipModifier` refreshes at once.
5. Clearing the content of an open tooltip leaves an empty tooltip on screen until it is closed.
6. `showForElement()` writes `aria-describedby` on the directive's own host, not on the element the tooltip is anchored to, unlike `showForMouseEvent()`.
7. The pane classes (`ignoreTooltipPointerEvents`, and the click-through rule for pinned `kbqTrigger` values) and the scroll strategy are read when the overlay is first created. The overlay is reused, so changing them after the first show has no effect.
8. A `kbqPlacementPriority` made only of unknown names leaves the position strategy without positions; in dev mode CDK then throws "At least one position is required" on open.
9. `show()` or `kbqVisible` called right after a pointer-originated focus is swallowed by the keyboard-focus gate, because the gate reads the name of the last trigger event, which is still `focus`.
10. `kbqTooltipColor` accepts every `KbqComponentColors` value, but only `contrast`, `contrast-fade`, `theme`, `warning` and `error` are styled; `success`, `theme-fade` and `empty` render an unstyled tooltip.

**Tests whose name and body disagree, or that cannot fail**

- "should anchor the tooltip to the caret of the host field" and "should anchor the tooltip to the field the host wraps" only check that the origin has numeric coordinates. The caret origin always has them, also when it falls back to the trigger's box, so neither test can tell where the tooltip is anchored; "should anchor to the caret line of a textarea by default" asserts a height other than 80, which the fallback to the wrapper's empty box also satisfies. The Playwright spec covers real caret positions, but only for fields that carry the directive themselves.
- "should not leave an inline outline behind after a disable/enable cycle": nothing writes an inline outline, so the `style.outlineColor` assertion cannot fail; the class and role assertions carry the test.
- "should anchor the tooltip to the cursor instead of the host element" checks only that some origin with a numeric `y` was set, not that its `x` comes from the pointer.
- "should keep [kbqPlacementPriority] intact across a cursor-relative show" reads the private field and does not check that the priority is used for positioning.
- "should show/hide normal tooltip" and "should show/hide tooltip by focus" wait `defaultLeaveDelay` (100 ms) although the default leave delay is 0, and the comment on `tooltipDefaultEnterDelayWithDefer` credits the 400 ms default to `KbqPopUpTrigger`, whose own default is 0.

**Behaviour without a test.** The spec states these from the source:

- closing a click-triggered tooltip on an outside click, Space for the `keydown` trigger, and the end of a touch on the trigger;
- hover and focus being ignored for a `manual` tooltip;
- scrolling itself and `KBQ_TOOLTIP_SCROLL_STRATEGY` (the unit test detaches the overlay directly);
- the 300 px width limit and kept line breaks (the Playwright screenshot shows wrapping only);
- the unknown-placement warning, the default fallback order, `kbqPlacementPriority` replacing the order, and `kbqPlacementChange`;
- the pointer's horizontal position for `kbqRelativeToPointer`, and the trigger anchor for other placements and triggers;
- the close running despite the pointer on the tooltip without `hideWithTimeout`, the pointer leaving the tooltip, and the returning pointer without `hideWithTimeout`;
- the instant-show window for `show(delay)` and `kbqVisible`;
- `kbqTooltipDisabled` set to `true` while open (only the `forDisabledComponent` path is tested);
- content changes while open, a header with a modifier other than `extended`, and `kbqTooltipClass` reaching the element;
- the `kbq-tooltip_open` class and `kbqVisible` set to `false`;
- negative offsets and reduced motion.

## top-bar

Change: `document-top-bar-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Both overview pages open by calling the bar a toolbar that "always remains visible on the page". By default it scrolls away with the content: it only stays visible outside the scrolling area or with `--kbq-top-bar-inset-block-start` set. The scroll section further down says so.
2. "Responsive mode" presents the 80 px between the two sides as a property of the bar. It exists only when a `[kbqTopBarSpacer]` is placed between the containers. The JSDoc of `KbqTopBar` calls the spacer optional, and without it the containers touch.
3. The CSS variables section says the custom properties are set on `kbq-top-bar` itself. Every example that sets `--kbq-top-bar-container-start-min-width` sets it on the start container instead. Both work, because the start container is the element that reads it, but the guidance and the examples differ.
4. The table describes `--kbq-top-bar-shadow-transition` as the "transition of that shadow". It applies only to the shadow appearing: the transition is declared on the shadow modifier, so removing `withShadow` drops the shadow at once.
5. The JSDoc of `withShadow` says the shadow signals "that page content is scrolled under the bar". It can read as if the bar detects that itself. The consumer has to set it, as the overflow example does on scroll.
6. In `top-bar.ru.mdx` the link to the breadcrumb compression explanation sits under the page title variant, after the title-counter example. The English page has it under the breadcrumbs variant.

**Suspected defects (from reading the code, not reproduced)**

1. For a container that is itself the `kbqOverflowItems` host, the stylesheet sets `gap: unset`. The placement rules come later with the same specificity and set the gap again. That form then seems to space its items twice, with the flex gap and the margins the bar adds. No example or e2e scenario renders that form.
2. `aria-label` is rendered on a bar without a role. ARIA 1.2 does not allow naming a generic element, and screen readers ignore that name. The JSDoc asks for a landmark role alongside the name, but nothing warns, and axe is not run on a named bar without a role.
3. A `placement` outside `'start' | 'end'` is caught only by strict template type checking. In a template compiled without `strictTemplates`, `placement="center"` compiles and leaves the container with no layout at all.
4. `kbq-animations-disabled` reads the reduced-motion setting once, when the bar is created. The stylesheet's media query still turns the transition off when the setting changes later, so only a consumer styling against the class sees a stale value.

**Tests whose name and body disagree, or that cannot fail**

- "shadow modifier › should be absent by default" binds `withShadow` to `false` explicitly. The input's own default is not exercised by any test that asserts the class.
- "aria-label › should not be rendered when it is not set" binds `[aria-label]` to `null`. The unbound input is never checked.
- "motion › should fade the shadow in by default" asserts only that `kbq-animations-disabled` is absent. jsdom renders no transition, and without `matchMedia` in jsdom the reduced-motion branch never runs.
- "should never apply both placement modifiers to the same container" asserts exactly one modifier per container, which is more than its name says. It is correct, only named for half of what it checks.

**Behaviour without a test.** The spec states these from the source:

- the slots rendered as direct children of the bar, in the order written;
- `placement` being a required input, which the golden file shows as `"required": true`;
- `KbqTopBarModule` exporting all three classes: the unit tests import the standalone classes, and only the docs examples use the module;
- a spacer width other than the default, and the start container shrinking to no width by default;
- the default bar scrolling away with the content;
- the bar not setting its shadow on its own;
- the shadow fading in over 300 ms and disappearing at once;
- the `provideNoopAnimations()` and reduced-motion paths of `kbq-animations-disabled`;
- a panel opened from page content painting over the bar;
- a custom property set on an ancestor not reaching the bar, and one set on the start container applying there;
- the host having no `role`, and a written `role` rendered as is;
- the bar adding no tab stop or keyboard handling.

## tree

Change: `document-tree-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The keyboard table says Enter does nothing on a row with a checkbox. Enter toggles the active row in every mode, exactly like Space.
2. The table says Space does nothing on a row without a checkbox, and selects a row "and all nested items" when it has one. Space toggles only the active node, in every mode; descendants change only through `setStateChildren`.
3. The PgUp and PgDn rows are swapped: the PgUp row describes moving down to the lowest visible item. In the code PageUp moves back and PageDown forward, by the number of options that fit in the tree.
4. Ctrl + C is documented as copying the names of the items, separated by line breaks. The code copies only the `getValue` value of the active option.
5. Ctrl + A is documented without saying it needs multiple selection. In single selection the tree ignores it and does not prevent the browser's own select-all either.
6. "Text matching the search query … is highlighted in bold": the tree highlights nothing. The examples pipe the label through `kbqHighlightBackground`, which is a background highlight.
7. The JSDoc of `noUnselectLast`, "Whether the last selected node can be deselected", is the reverse of what the flag does.
8. The JSDoc of `autoSelect` speaks only of clicks. The flag also makes Up, Down, Home, End, PageUp and PageDown select the active option.
9. The JSDoc of `selectAllHandler` says the default handler toggles. It only selects, unless `selectAll` or `selectAllToggle` is set.
10. The JSDoc of `selectable` says options that are not rendered "are not checked by select all", which reads as if collapsed nodes were left out. "Select all" selects every collapsed node, whatever its option's `selectable` or `disabled` would say.
11. The JSDoc of `KbqTreeOption.selectionChange` says it emits "whenever the selected state … changes". It does not emit for these:
    - `toggle()`, `setSelected()` or assigning `selected`;
    - a Shift range.

    It emits only when the tree re-syncs an option after the selection model changed. Likewise, the tree's `selectionChange`, documented as "Emits when the selection changes", is silent for changes made in code that are reported to the form.

12. `KbqTreeNodeOutletContext.count` is documented as the number of data nodes but is never filled; a TODO in the source points at DS-2196.
13. `viewChange` is documented as a heuristic a data source can use to page. It is the constant `{ start: 0, end: Number.MAX_VALUE }`.
14. Nothing tells consumers that `kbq-tree-node-toggle` needs `[node]` for its `kbq-expanded` class; a click works without it. Most unit fixtures omit the binding.
15. The keyboard table mentions moving Tab to "the next additional action". An option holds a single `kbq-option-action`.
16. The JSDoc of `selectable` lists `select` among the ways to select an option from code. `KbqTreeOption.select()` and `deselect()` change only the option's displayed state and fire its own event. They leave the tree's selection untouched, and the next re-sync undoes them. Only `setSelected`, `toggle` and assigning `selected` reach the selection.

**Suspected defects (from reading the code, not reproduced)**

1. A plain click, and a vertical key with `autoSelect`, clear the selection model and then select. Each clear is reported, so the form briefly receives `undefined` or `[]` before the new value. Clicking or arrowing onto the node that is already selected (Down on the last row, for one) reports the value twice and emits `selectionChange`, marking the control dirty without a change.
2. An empty query reaches the default matcher as `null`, and the matcher builds the regular expression `/null/gi`. A node whose view value contains "null" (for example "Nullable") therefore matches when the search field is cleared, and the tree stays filtered down to it.
3. With `autoSelect` off, a plain click on the only selected node deselects it although `noUnselectLast` is on: the click path skips that guard. The `tree-action-button`, `tree-selection-separate-from-focus` and `tree-toggle-on-click` examples are affected.
4. The keyboard does not check whether the active option is disabled. Space and Enter test only `selectable`, and vertical keys re-select the active option. An option that becomes disabled while active, or a tree disabled while focus is inside it, can still change the selection from the keyboard. A custom `selectAllHandler` also runs on a disabled tree.
5. The padding corrections are pixel amounts applied in the indent's units. The first level loses 2, and a row without a toggle gains 24, so with `'10em'` a root row gets 8em with a toggle and 32em without one.
6. "Select all" emits `selectionChange` only for rendered options. When every rendered option is already selected and only collapsed nodes change, the value changes but no `selectionChange` is emitted.
7. Saved expansion values that never match a node are kept as pending forever and written back on every save, so storage keeps them indefinitely.
8. `navigationChange` probably does not fire for a pointer click. The focus event already moves the active index without an event, so the click's `setActiveItem` sees no change.
9. A bound `tabIndex` of 0 is treated as unbound, so an empty tree drops to `tabindex="-1"` despite the binding.
10. The anchor of a Shift click is the option that was active before the last keyboard or programmatic move, not the one active now. After Down moves from row 1 to row 2, a Shift click on row 4 spans rows 1 to 4 and applies row 1's state, not row 2's.

**Tests whose name and body disagree, or that cannot fail**

- "should filter nodes and but not their parents" asserts that the parent `Pictures` is rendered.
- "should select all visible options and values" selects all 17 nodes, collapsed ones included. It also asserts that the event's `option.selected` is `false`, which pins the lagging mirror rather than a behaviour.
- "should select the active option with ENTER" cannot fail on Enter. The preceding Down already selects the option in single selection, and Enter on the only selected node is then a no-op because of `noUnselectLast`.
- "should combine the disabled input with the filter state" starts with the input already disabled. It cannot tell whether the filter overrides the input, and it never clears the filter.
- "drops a saved value that names no node" checks only the expansion. The value is not dropped: it stays pending and is persisted again on the next save.
- "should keep narrowing the level across a chain of disabled ancestors" asserts that the focus does not move at all.
- "should hand the selected values to the registered change callback" drives the `@docs-private` `setOptionsFromValues`, not a form write. A form write reports nothing.
- `it.skip('should not blur on focused option when copying')` documents an open defect (DS-5079): copying blurs the active option.
- `describe('with when node template')` carries a stale `// todo need recover`, though its test runs.
- `nested-tree-control.spec.ts` names its suite `CdkNestedTreeControl`.

**Behaviour without a test.** The spec states these from the source:

- the errors for an invalid data source, two default node definitions, a node without a matching definition and a missing tree control;
- a single node definition being used whatever its `when`;
- array data sources, `level` in the node template context and `count` staying unset;
- the roles and `aria-level` of `kbq-tree` and `kbq-tree-node`;
- the `kbqTreeNodeToggle` directive, the toggle's `aria-disabled`, and `kbq-expanded` never appearing without `[node]`;
- `expand`, `collapse` and `toggle` doing nothing while a filter is active;
- special characters matched literally, a custom `compareViewValues`, and the warning for an unknown `multiple` value;
- a plain click with `autoSelect` off;
- `[showCheckbox]` on an option and a projected `kbq-pseudo-checkbox`;
- a click on a tri-state option toggling only its own node, and `setStateChildren` reporting to the form;
- `selectionChange` carrying only the acted-on option after a Shift range;
- Ctrl/Cmd + A in single selection, and the error for a `selectAllHandler` that is not a function;
- the select-all row:
    - not being rendered in single selection or for an empty tree;
    - Space and Enter on it;
    - `selectAllOptions()` called from code;
    - `selectAllChange` itself (the fixtures bind only `onSelectAll`);
- the selection order of the value in multiple selection;
- expansion made by the application not being persisted until `saveState()`;
- PageUp and PageDown;
- vertical keys not selecting with `autoSelect` off, in `checkbox` mode or with Ctrl/Cmd;
- the `copyChange`/`onCopy` path and Ctrl/Cmd + C without an active option;
- `navigationChange` for keys other than Left;
- `aria-labelledby`, scrolling the active option into view, and `tabindex="-1"` for an empty tree;
- the `kbq-tree-option_multiple` class;
- the `en-US` label and `[localeOverrides]`;
- re-indenting on a direction change, and rows rebuilt without `trackBy`.

## tree-select

Change: `document-tree-select-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqTreeSelectChange.isUserInput` says it tells a change by the user from one written to the model. Every `selectionChange` is built with `false`, user picks included, and written values emit nothing.
2. The JSDoc of `sortComparator` and `KbqTreeSelectSortComparator` says the values of a multiple tree-select are ordered by the panel or by the comparator. Only written values are sorted; nodes the user selects are appended in selection order, which the `Ctrl`+`A` and "should update the label" tests assert.
3. The host comment and the test "should not announce a popup the panel does not implement" say the panel has no `role="tree"` yet, which is why `aria-haspopup` is left out. The projected `kbq-tree-selection` already has `role="tree"` and its options `role="treeitem"`.
4. The `Ctrl`/`Cmd` + `A` section does not say that the panel has to be open.
5. The docs advise against an `<ng-container>` for `kbq-select-trigger`, but the `tree-select-custom-trigger` example uses `<ng-container kbq-select-trigger>`.
6. "Smart search" describes splitting the query and folding diacritics as if the tree-select did them. They belong to the example's filter; the tree-select does not filter.
7. The JSDoc of `panelMinWidth`, on the input and in `KbqTreeSelectOptions`, says it is ignored when wider than the window. The code drops the minimum only when the pane overflows horizontally.
8. The JSDoc of `searchMinOptionsThreshold` speaks of "available options". The count is the rendered nodes, so expanding or collapsing a branch can show or hide the search field while the panel is open.
9. "Multiple with child selection" has no text, and the cascade from a parent to its children is the example's own `selectionChange` handler, not something the tree-select does.
10. The examples page says `kbq-select-matcher` replaces "the entire contents of kbq-select".
11. These have no place in the tree-select pages:
    - `autoSelect` and the single-selection keyboard model;
    - `hasBackdrop` and `backdropClass`;
    - `kbq-select-no-options`;
    - `[localeOverrides]`;
    - `#kbqSelectTagContent` and `onRemoveSelectedOption`, shown only in the "Deleted nodes" example.

**Suspected defects (from reading the code, not reproduced)**

1. The tag remove control is `<i kbq-icon kbqTagRemove>`. `KbqIcon` puts `aria-hidden="true"` on its host by default, so a focusable `role="button"` is hidden from assistive technology (axe `aria-hidden-focus`). No axe test renders tags.
2. Every remove control is named only by `a11y.remove`, without the node's label, and the remove controls of tags clipped behind the "+N" counter keep `tabindex="0"`.
3. Picking an option in single mode, by click or by arrow key, clears the selection model and then selects the node. Switching from one value to another therefore reports `undefined` to the form before the new value, and picking the selected option again re-emits `selectionChange` and marks the control dirty.
4. Removing a tag and using the cleaner report the value to the form twice: once from the model change and once explicitly.
5. In an open single panel, any key that reaches the navigation branch selects the active option on the spot and emits `selectionChange`: a letter meant for typeahead, or Shift on its own. Typeahead then moves the highlight 200 ms later without selecting. Enter right after opening selects nothing, and Home, End, PageUp and PageDown leave the value behind the highlight.
6. PageUp and PageDown pressed in the search field move focus onto the option and leave it there.
7. Hovering an option gives it DOM focus, which takes focus out of the search field.
8. The footer slot projects `kbq-select-footer` and `[kbq-tree-select-footer]`. The attribute form of the footer directive, `[kbq-select-footer]`, is not projected at all, so the custom footer in the dev app is not rendered, and `[kbq-tree-select-footer]` matches no directive and gets no footer styles. Footer controls cannot be reached with Tab, which closes the panel, and Enter or Space on a focused footer control is prevented and acts on the active option.
9. A projected `kbq-select-no-options` is rendered whenever it is projected, also above a tree that has nodes.
10. When `searchMinOptionsThreshold` hides the search, opening still tries to focus the detached search field.
11. `typeAhead` and `autoSelect` are copied to the tree once, when the content initializes. A search field added later with `@if` leaves typeahead on, and a later change of `[autoSelect]` makes the tree-select's Enter handling and the tree's click handling disagree.
12. Writing `null` or `undefined` to a tree whose `getValue` returns that value for a node selects the node instead of clearing the selection.
13. The panel id is built from the generated id and ignores a custom `id`.

**Tests whose name and body disagree, or that cannot fail**

- "should be able to preselect an array value in single-selection mode" preselects the string `'Pictures'`.
- "should clear the selection when a nonexistent option value is selected" and "should clear the selection when the control is reset" first write `'pizza-1'`, which is not a node either, so nothing is ever selected before the clear; their "Pizza" assertions cannot fail.
- "should update the trigger based on the value" (with OnPush) ends by asserting that the trigger does not contain "Pizza" after resetting `rootNode_1`.
- "should show empty message" and "should have search input" call `toBeDefined()` on the result of `query()`, which is `null`, not `undefined`, when nothing matches.
- "should not scroll to options that are completely in the view" reads `scrollTop` of `.kbq-tree-select__panel`, which never scrolls, under jsdom, which has no layout.
- "should scroll to selected element on panel open" compares rectangles that are all zero under jsdom, so the option always counts as in view.
- "should calculate hidden items and output in show more button" runs where every width is zero, so the counter is always 0 and the assertion only finds a "0" in the text.
- The e2e "keyboard scrolling" tests press Space in an open single panel to "expand subtrees", but Space closes the panel. "should scroll down …", "… to the bottom when pressing END" and "should scroll up …" then compare a scroll offset of 0 with 0. "should scroll to the top when pressing HOME" opens five collapsed roots that never overflow.
- "should set the tabindex of each option according to disabled state" checks an enabled and a disabled option; every option has `tabindex="-1"` whatever its state.
- "should render the id the form-field label points at": the label does not point at the id; the tree-select points at the label through `aria-labelledby`.
- The describe "without Angular forms" binds every fixture with `[(ngModel)]`.
- "should select children with parent" and "should select parent when all children are selected" exercise the fixture's own `selectionChange` handler, not the tree-select.
- The skipped "when resetting the value by setting null or undefined" block asserts on `kbq-form-field-should-float`, which nothing sets any more.

**Behaviour without a test.** The spec states these from the source:

- the single-selection keyboard model: Up and Down selecting, Home, End, PageUp and PageDown not selecting, Enter closing without selecting, and the `autoSelect` input;
- Enter and Space toggling an option and Shift with an arrow in multiple mode;
- typeahead, PageUp and PageDown, and Left and Right expanding or collapsing a branch (only the focus returning to the search field is tested);
- a second click closing the panel, the backdrop, and the side staying fixed while the panel is open;
- picking the selected option again re-emitting `selectionChange`;
- `selectable` set to `false`;
- the tag of a disabled tree-select having no remove control, and removing a tag not toggling the panel;
- `#kbqSelectTagContent` and the focus and blur part of `useDefaultHandlers`;
- the cleaner moving focus to the tree-select, and a throwing `clearPredicate`;
- `selectAllHandler` and its error;
- the search control being reset on close, the errors for a search without `kbqInput` or a form control, and PageUp and PageDown from the search field;
- the footer;
- positioning against the form field container and following page scroll;
- `panelMaxWidth`, and an explicit `null` for it in the provider;
- the `role="tree"` and `treeitem` attributes, as seen through a tree-select;
- the `disabled` attribute and the `kbq-select_multiple` and `kbq-select_multiline` host classes;
- the `tabIndex` input given `null` or a non-integer;
- the form-field container click;
- `[localeOverrides]`;
- the number of hidden items, which jsdom always measures as 0;
- Tab moving focus on to the next control (only the key not being prevented is tested);
- the `selectionChange` payload of a removed tag and of "select all".

## username

Change: `document-username-baseline`

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqUsernameStyle` says `accented` has "no color theming" and emphasizes "via typography only". The theme sets both parts to the contrast color, so the login loses its secondary color as well.
2. The JSDoc of `kbqBuildUsernameText` says it mirrors the text rendered by `kbq-username`. It keeps a site without a login (`Root M. A. (corp)`), which the component drops outside compact mode, and it keeps the login, which compact mode drops.
3. The overview pages say that `isCompact` shows the name or the login, never both, but not that the site is still appended. With a name, compact mode shows the site of a login it has dropped (`Root M. A. (corp)`), and the tooltip has no login either.
4. The pages describe `kbqUsernameCustom` as copying unmapped characters verbatim but do not say that the separators of a missing field stay, unlike `kbqUsername`, which skips a missing field cleanly.
5. The `username-custom` example provides a `KBQ_PROFILE_MAPPING` identical to the shipped default, so it shows nothing about formatting "a profile of your own shape", which the page says the token is for.
6. These have no place on the pages:
    - the layout of the three modes and the four styles;
    - the tooltips of the parts;
    - the site label for assistive technology and `kbqUsernameLocaleConfigurationProvider()`;
    - the mapping argument of the pipes, `kbqFormatUsername` and `kbqFormatUsernameCustom`;
    - `kbqBuildUsernameText` and its options, which the search and filter-bar examples use without explanation.

**Suspected defects (from reading the code, not reproduced)**

1. `type="inherit"` sets `display: inherit` in a rule with the same specificity as, and placed after, the `stacked` and `text` rules. A `stacked` username with `inherit` takes the parent's `display` and stops stacking. Only `inline` excludes `inherit` explicitly. Outside a flex parent the parts are then inline boxes, so the ellipsis never applies while `kbq-title` is still attached. The e2e table renders `inherit` only with `inline`.
2. Binding `null` to `fullNameFormat`, or `null` as the format of either pipe or of the injected formatter, throws a `TypeError` from `split` or `replaceAll` instead of falling back to the default. The component also throws for `undefined`, which is possible without strict template checks. `undefined` for `mode` or `type` produces the class `kbq-username_undefined` and no layout.
3. The visually hidden site label and the `(corp)` hint seem to have no whitespace between them, so the text content reads "mroot site(corp)", and the label is part of the host's `textContent` for any consumer reading it.
4. The unmapped-key warning names `KbqUsernameCustomPipe` even when it comes from `kbqFormatUsernameCustom` called directly. It is reported once per key for the whole application, so a second wrong mapping elsewhere goes unreported.
5. An element with the `kbq-username-custom-view` attribute, projected without importing `KbqUsernameCustomView`, is still projected by the content selector. The default view is then not suppressed, and both render without any error.

**Tests whose name and body disagree, or that cannot fail**

- "should use default input values" binds every input explicitly, with values equal to the defaults, so it cannot detect a changed default of `mode` or `type`.
- "should format full name using default format and an explicit mapping" (both pipes) passes a mapping that resolves the same fields as the injected default, so it would pass if the mapping argument were ignored.
- "should return empty string if profile is not an object" (both pipes) passes an array, which is an object. The primitive branch has no test.
- "should use custom view instead default if provided" checks only that no primary part exists, not that the custom view is shown.
- "should attach the directive in the modes that truncate" checks only `inline`, not `stacked` or compact mode.
- "should warn once about a format key with no mapped field" depends on module-level state: it passes only because no earlier test in the file warns about `L`.
- "should no longer be resolvable as a root service" covers `KbqUsernamePipe` only.

**Behaviour without a test.** The spec states these from the source:

- rendering nothing without `userInfo` (only `{}` is tested);
- the site not shown without a login outside compact mode;
- the host classes for values of `mode` and `type` other than the defaults (the screenshots show their effect, not the classes);
- `isCompact` as a bare attribute;
- the tooltip text of the login part and of compact mode;
- the attribute form of the custom view, content outside it not being rendered, and the layout of the mode applying to it;
- the separators of a missing field in the case syntax;
- the effect of the mapping argument of the pipes;
- `kbqInjectUsernameFormatter()` outside an injection context;
- `KbqUsernameCustomPipe` not being injectable;
- no warning in production mode;
- `formatLogin` or `formatSite` returning an empty string;
- `siteLabel` following the locale service and an enclosing `kbqLocaleOverrides`;
- the `display` value that `inherit` takes from the parent;
- the exported constants, which only the API golden file guards.
