# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/app-switcher/` (the trigger directive and popup, the row components, the icon sanitizer, the template, the two unit specs, `e2e.ts` and the Playwright spec), the `app-switcher.{en,ru}.mdx` pages, the examples under `packages/docs-examples/components/app-switcher/`, the API golden file `tools/public_api_guard/components/app-switcher.api.md`, and the code the popup's behaviour comes from: the pop-up trigger and pop-up base classes in `packages/components/core/pop-up/`, the locale configuration in `packages/components/core/locales/`, the dropdown panel, item and trigger in `packages/components/dropdown/`, and the cleaner of `kbq-form-field`. Every claim was checked against the source before it went into the spec. `openspec/specs/` holds only the select spec so far.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the switcher, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when app-switcher behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the row components, the key manager, timers, change-detection details, CSS structure and design tokens.
- `kbq-dropdown`, `kbq-tooltip`, `kbq-form-field` and the pop-up base classes as components of their own, and the deprecated `KBQ_APP_SWITCHER_CONFIGURATION` and `KBQ_APP_SWITCHER_DEFAULT_CONFIGURATION`.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at the flat path of the entry point, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and the same definition of what counts as contract. The decisions below are specific to the app switcher.

1. **The public surface is the trigger, not the popup.** `KbqAppSwitcherComponent` and the three row components are exported but marked `@docs-private`; the popup is created by the trigger in an overlay, and consumers never place it. The spec therefore names only the trigger's inputs, outputs, methods and host classes, the data interfaces, the exported constants, `makeGroupsForApps`, `KbqAppSwitcherIconSanitizer` and the locale API, and describes the popup through what it renders: classes, roles and attributes. The e2e fixtures render `<kbq-app-switcher [trigger]>` inline to take screenshots; that is a test device, not a consumer API, and stays out of the spec.
2. **Behaviour borrowed from other components is in scope where the switcher shows it.** The site flyout panels, their safe area and switch delay, hover focusing a row and Left closing a flyout come from `kbq-dropdown`; the clear button and Escape clearing the query come from `kbq-form-field`; opening, closing and the tooltip hand-off come from the pop-up base classes. A user of the switcher sees them as switcher behaviour, so they are stated here. A change to those components that alters them updates this spec too.
3. **Inputs without a visible effect are specified only as values.** `offset` and `backdropClass` are accepted and reset to their defaults, which a test checks, but neither changes what the user sees (see Findings). The spec states the values the trigger reports and nothing more, so a later fix is an `ADDED` or `MODIFIED` requirement rather than a contradiction.
4. **Selection is specified where it is written.** `selectedApp` and `selectedSite` change only when an application is picked in a site flyout. The spec says so, including that a pick from the current list or the search results leaves them alone, because a consumer binding `[(selectedApp)]` relies on exactly that. Whether that is intended is a finding, not a spec question.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/app-switcher` updates `openspec/specs/app-switcher/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Part of the behaviour lives in `dropdown`, `form-field` and `core/pop-up`, which can change without touching the app-switcher directory] → The requirements that depend on them are named in Decision 2; tasks.md checks them by hand, and a review of those components should look for this spec.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:app-switcher` before archiving. A mismatch is corrected in the spec, not in the code.
- [A defect gets recorded as intended behaviour] → The selection that a pick from the current list does not write is stated because consumers depend on it, and it is also listed under Findings. Other suspected defects stay out of the spec.
- [The spec is long: 59 requirements, 113 scenarios] → It is grouped in the order of the docs page: opening and closing, the list and its icons, grouping, several sites, search, keyboard, accessibility, the tooltip, localization and setup.

## Findings

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
