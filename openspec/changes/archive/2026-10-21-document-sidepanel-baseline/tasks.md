# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/sidepanel/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/sidepanel`, and verify the sidepanel unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/sidepanel` and verify the sidepanel e2e suite passes. It runs in WebKit and backs the size, position, stacking, overflow shadow, scrollbar, component layout and focus trap requirements
- [ ] 1.3 For each requirement in `specs/sidepanel/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`package.json` has `dev:sidepanel` (`ng serve dev-sidepanel --port 3003`). Run each check in `yarn run dev:sidepanel` at http://localhost:3003, using its own buttons and the docs examples embedded there. Console checks use the development-mode `ng` global: `app` below is `ng.getComponent(document.querySelector('dev-app'))`, and `ref` is `ng.getComponent(document.querySelector('kbq-sidepanel-header')).sidepanelRef` of the open sidepanel.

- [ ] 2.1 Open a sidepanel with "Open component sidepanel" and verify in the DOM:
    - the container's `id` has the form `kbq-sidepanel-<n>` and it has `role="dialog"` and `tabindex="-1"`;
    - it has no `aria-modal` with the "Modal" toggle off, and `aria-modal="true"` with it on;
    - the header close button has `aria-label="Закрыть"`;
    - `app.sidepanelService.open(app.template(), { id: ref.id })` throws `Sidepanel with id "<id>" exists already. The sidepanel id must be unique.`
- [ ] 2.2 Subscribe with `ref.afterClosed().subscribe(console.log)` and verify:
    - the footer "Close" button has `type="button"` and closing with it logs an empty string;
    - closing with the header close button also logs an empty string
- [ ] 2.3 Verify focus:
    - "Open component sidepanel", whose content marks nothing `cdkFocusInitial`, focuses the header close button;
    - "Open template sidepanel" focuses "Open another sidepanel", which is marked `cdkFocusInitial`;
    - after the panel closes, the trigger button has focus, and `document.activeElement` logged from an `afterClosed()` subscriber is already that button;
    - with "Modal" on, Shift+Tab on the first focusable element of the panel moves focus to its last one
- [ ] 2.4 Verify closing rules:
    - in the "disabled close" example, Escape and a backdrop click keep the panel open, while the footer "Close" button and the header close button close it;
    - right and middle clicks on the backdrop of a modal sidepanel do not close it;
    - in the dynamic configuration example, open another sidepanel from the first one and turn on "Disable close" in the top one: Escape closes neither of them
- [ ] 2.5 Verify the non-modal mode and explicit focus trapping:
    - with "Modal" off, a click on a page button keeps the sidepanel open, and no page element gets `aria-hidden`;
    - set `aria-hidden="false"` on one page element, then run `app.sidepanelService.open(app.template(), { hasBackdrop: false, trapFocus: true })`: the container has `aria-modal="true"`, and every child of `body` except the overlay container, `script`, `style` and `aria-live` elements has `aria-hidden="true"`;
    - after that sidepanel closes, the element is back to `aria-hidden="false"` and the others have no `aria-hidden`
- [ ] 2.6 Verify layout and stacking:
    - in the "overlayed" example, the lower of two right sidepanels is pushed back and shows at the indent strip, and opening a third one hides the first;
    - with the position select of the dev app on "Top" and "Bottom", the sidepanel spans the viewport width and a third of its height, at least 400 px, whatever the size select says;
    - in the sizes example, a small sidepanel is 400 px wide;
    - `kbq-sidepanel-actions` with `align="left"` and `align="right"` in the "overlayed" example place their buttons at the start and at the end of the footer
- [ ] 2.7 Verify the header and motion:
    - the long header title of "Open template sidepanel" stays on one line with an ellipsis and shows its full text in a tooltip on hover;
    - with `prefers-reduced-motion: reduce` emulated in the browser's developer tools and the page reloaded, an opened container has the class `kbq-animations-disabled` and appears without sliding
- [ ] 2.8 Verify the defaults and state saving:
    - `app.sidepanelService.wasOpen('')` returns `false`;
    - with `{ provide: KBQ_SIDEPANEL_DEFAULT_OPTIONS, useValue: { size: KbqSidepanelSize.Large } }` added for the check to the `bootstrapApplication()` call in `packages/components-dev/sidepanel/main.ts`, the "overlayed" example, which sets no size, opens 960 px wide sidepanels. Revert the file before 3.2;
    - in the state saving example, a sidepanel left open comes back after a reload, and one closed with its button stays closed after a reload

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-sidepanel-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-sidepanel-baseline` once the checks pass. This creates `openspec/specs/sidepanel/spec.md`.
- Decide which Findings in `design.md` become changes of their own. A right or middle click closing the top panel of a non-modal stack, which the docs rule out, and `open()` throwing on a `backdropClass` with several classes, which leaves the overlay behind, are the most user-visible ones.
