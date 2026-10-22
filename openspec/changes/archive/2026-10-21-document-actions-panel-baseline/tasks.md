# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/actions-panel/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/actions-panel`, and verify the actions panel unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/actions-panel` and verify the actions panel e2e suite passes. It backs the default placement, rendering into an element, the containing block and the width-following requirements
- [ ] 1.3 For each requirement in `specs/actions-panel/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test, or whose only test cannot fail, is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

Run each check in `yarn run dev:actions-panel` (the script is in `package.json`; http://localhost:3003), using the docs examples embedded on page 1. The dev app provides a locale service and its own `OverlayContainer`, whose element carries `DEV_CUSTOM_OVERLAY_CONTAINER`. Options the examples do not pass are passed from the browser console through the example's own service, for example `const ex = ng.getComponent(document.querySelector('actions-panel-global-example'))`, then `ex.actionsPanel.open(ex.templateRef(), { … })`. A check that needs a provider the dev app lacks uses a temporary edit of `packages/components-dev/actions-panel/main.ts`, reverted before 3.2.

- [ ] 2.1 Verify in the DOM of an open panel:
    - the panel element has `role="dialog"`, `aria-modal="false"`, `tabindex="-1"` and no `aria-label` or `aria-labelledby`;
    - a vertical divider precedes the close button;
    - hovering the close button shows a tooltip with the same text as its `aria-label`
- [ ] 2.2 Verify the `aria-hidden` marks:
    - close every panel on the page, then open the global example: once it has slid in, `dev-app` has `aria-hidden="true"`;
    - after it closes, the attribute is gone;
    - opening a scoped example adds no `aria-hidden` inside its element
- [ ] 2.3 Verify Escape:
    - with focus on a control inside a panel, Escape closes it;
    - with focus on a page control outside every panel, Escape leaves the panels open;
    - with a panel opened with `disableClose: true`, there is no close button, Escape inside it leaves it open, and `close()` on its reference closes it
- [ ] 2.4 Verify focus and pointer handling:
    - Tab from the last control of a panel moves focus out of it;
    - activating the close button from the keyboard leaves `document.activeElement` on `body`;
    - a click on the page outside a panel leaves it open;
    - clicking the close button of the overview example logs `undefined` as the result
- [ ] 2.5 Verify navigation:
    - a router navigation that keeps page 1, such as `ng.getDirectives(document.querySelector('a'))[0].router.navigateByUrl('/page-1?x=1')`, leaves an open global panel open;
    - `history.back()` afterwards closes it
- [ ] 2.6 Verify the configuration from the console:
    - `direction: 'rtl'` puts `dir="rtl"` on the overlay, the parent of the `.kbq-actions-panel-overlay` pane;
    - without `direction` the overlay has `dir="ltr"` even after `document.documentElement.dir = 'rtl'`;
    - with an open global panel the page still scrolls with the mouse wheel
- [ ] 2.7 Verify the reference and the service from the console:
    - when `open()` is called twice on one service, the second reference's `beforeOpened` emits only after the first one's `afterClosed`;
    - `close()` on a service without an open panel throws nothing;
    - `close('a')` followed by `close('b')` makes `afterClosed` emit `'a'`;
    - `keydownEvents` of an open global panel's reference emits a key pressed with focus on the page
- [ ] 2.8 Verify the content's injectors and overlays:
    - in a panel opened with a component class from the page (for example `ng.getComponent(document.querySelector('dev-theme-toggle')).constructor`), `ng.getInjector()` of the opened component resolves `ex.actionsPanel.constructor` to `ex.actionsPanel` itself;
    - in a global panel opened without `data`, `ng.getContext()` of an element of the template shows `$implicit: null`;
    - in the dropdown and popover example, the opened dropdown is inside `.DEV_CUSTOM_OVERLAY_CONTAINER`, not inside the example element;
    - `packages/components/actions-panel/module.ts` lists `KbqActionsPanel` in its `providers`
- [ ] 2.9 Verify the providers with a temporary edit of `main.ts`:
    - with `kbqActionsPanelLocaleConfigurationProvider({ closeTooltip: 'Done' })`, every close button is named "Done";
    - with `kbqActionsPanelDefaultConfigProvider({ disableClose: true })`, panels have no close button and one opened from the console with `disableClose: false` has one;
    - with `kbqLocaleServiceProvider()` removed, the close button reads "Отменить выбор", and providing `KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION` with `{ closeTooltip: 'X' }` renames it "X"
- [ ] 2.10 Verify reduced motion: with `prefers-reduced-motion: reduce` emulated in the browser's developer tools, a reloaded page shows panels with `kbq-animations-disabled` that appear without sliding, and the overview example still logs its opening and closing events

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-actions-panel-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, the temporary edit of `main.ts` included

## Workflow follow-up

- Archive with `/opsx:archive document-actions-panel-baseline` once the checks pass. This creates `openspec/specs/actions-panel/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The `aria-hidden` marks a global panel puts on the whole application are the most user-visible one, followed by the scroll lock a partial default configuration brings.
