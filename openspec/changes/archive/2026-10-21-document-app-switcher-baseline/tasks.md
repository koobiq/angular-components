# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/app-switcher/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/app-switcher`, and verify that both app-switcher unit suites (the switcher and the icon sanitizer) pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/app-switcher` and verify the app-switcher e2e suite passes. It backs the keyboard, search, clear button, group click and flyout-from-keyboard requirements
- [ ] 1.3 For each requirement in `specs/app-switcher/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:app-switcher` exists in `package.json`. Run each check in `yarn run dev:app-switcher` (http://localhost:3003), which embeds the overview example (one site, seven applications) and the sites example (seven sites, with search and groups). The dev app has no locale service, so it shows the Russian strings. Where a check needs a property the examples do not bind, select the trigger button in the Elements panel and reach the directive from the DevTools console through `ng.getDirectives($0)`.

- [ ] 2.1 Verify the trigger:
    - with the trigger focused, Enter and Space open the switcher;
    - while it is open, the trigger has the classes `kbq-app-switcher_open` and `kbq-active`, and both go away on close;
    - `visibleChange` and `placementChange` of the directive, subscribed from the console, emit on open and close;
    - after setting `disabled = true` on an open switcher it closes, a click no longer opens it, and the button gets no `disabled` or `aria-disabled`
- [ ] 2.2 Verify closing:
    - a click elsewhere on the page closes the switcher, and no `.cdk-overlay-backdrop` exists while it is open;
    - after that click, and after an outer scroll closes it, focus is on the trigger;
    - Shift+Tab on a row closes the switcher and focuses the trigger;
    - scrolling inside an open site flyout keeps the switcher open
- [ ] 2.3 Verify the selection:
    - in the overview example, clicking an application leaves the "App:" label unchanged;
    - in the sites example, clicking an application of the current site leaves both labels unchanged;
    - picking an application in another site's flyout, and one inside a group's nested flyout, updates both labels;
    - search results and flyout rows never carry `aria-current`;
    - setting `selectedSite` of the overview trigger to another site object from the console leaves its list unchanged
- [ ] 2.4 Verify the flyout panels in the sites example:
    - a click and Space on an other-site row open its flyout;
    - Left inside a flyout closes it;
    - moving the pointer from a flyout onto the current site's list closes it;
    - group rows inside a flyout have `aria-haspopup="menu"`
- [ ] 2.5 Verify search in the sites example:
    - a query that matches several sites shows a label with each site's name;
    - applications that form a group in the full list appear as plain rows;
    - Escape with a query clears it and keeps the switcher open, and a second Escape closes it;
    - after closing with a query typed, reopening shows an empty field and the full list
- [ ] 2.6 Verify the remaining details:
    - the image of an `iconSrc` row is 24 by 24 pixels;
    - with a row focused, typing the first letters of another row's name moves focus to it;
    - after hovering a row, Down moves focus to the next row;
    - the trigger button has no `aria-haspopup` or `aria-expanded`
- [ ] 2.7 Verify the strings on the docs site, built with `yarn run docs` or on the pull request's preview: the English app-switcher page shows `Search` and `Other sites`, and the Russian one `Поиск` and `Другие площадки`. No example uses `kbqAppSwitcherLocaleConfigurationProvider()`, so verify its partial override by reading `kbqInjectLocaleConfiguration` in `packages/components/core/locales/configuration.ts`
- [ ] 2.8 No example imports `KbqAppSwitcherTrigger` without the module, so verify standalone use by reading `app-switcher.ts`: the scroll strategy falls back to the repositioning strategy when `KBQ_APP_SWITCHER_SCROLL_STRATEGY` is not provided, and a provided one is injected first
- [ ] 2.9 Verify the suspected defects 2, 5 and 7 in `design.md` and record the result there:
    - the popup root has no `kbq-app-switcher_placement-*` class, and setting `offset` from the console does not change its margin;
    - an axe browser extension run with a site flyout open reports whether the flyout rows lack a `role="menu"` parent;
    - hovering a search result while typing moves focus out of the search field

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-app-switcher-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-app-switcher-baseline` once the checks pass. This creates `openspec/specs/app-switcher/spec.md`.
- Decide which Findings in `design.md` become changes of their own. A pick from the current list not updating `selectedApp` is the most user-visible one; focus moving back to the trigger and the missing menu semantics of the trigger and the flyout panels are the main accessibility ones.
