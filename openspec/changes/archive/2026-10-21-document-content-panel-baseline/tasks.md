# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/content-panel/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/content-panel`, and verify the content panel unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/content-panel` and verify the content panel e2e suite passes. It backs the overflow shadow, layout and header requirements
- [ ] 1.3 Run `yarn run e2e:docker yarn playwright test packages/components/accordion -g "E2eAccordionContentPanel"` and verify it passes. It is the only test that relies on panel content existing before the first open and on a change of `width` after initialization
- [ ] 1.4 For each requirement in `specs/content-panel/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:content-panel` exists in `package.json`. Run each check in `yarn run dev:content-panel` (http://localhost:3003), on the overview example and the full panel with an aside embedded there. Both persist under a derived key, so first remove the `kbq.state.` entries from `localStorage` in DevTools. Where a check needs an input the dev app does not bind, add it to the dev app's own panel for the check and revert it before 3.2.

- [ ] 2.1 Verify the layout in the DOM:
    - the container has `kbq-content-panel-container__opened` only while the panel is open;
    - the main content's right margin is the panel width plus 16 px while open and 0 while closed;
    - loose content placed directly in `kbq-content-panel` is not rendered;
    - the extra header content is rendered below the title row
- [ ] 2.2 Verify opening, closing and focus:
    - after the Toggle button opens the panel, focus is still on that button;
    - after a click on the close button, `document.activeElement` is `<body>`;
    - with `disableClose` added, the close button is gone, Escape does nothing and Toggle still closes the panel;
    - with a one-way `[opened]` that stays `true`, the panel closed by the user does not reopen when the same value is assigned again
- [ ] 2.3 Verify resizing:
    - dragging the left edge widens and narrows the panel, stops at `minWidth` and `maxWidth`, and the main content follows without motion;
    - Tab never lands on the resize handle;
    - a double click on the handle restores the width given by `width`;
    - with `disableResizer` added, the handle is not rendered
- [ ] 2.4 Verify state saving in DevTools:
    - after open and close, the `kbq.state.` entry holds `{ opened, width }` at once;
    - after a drag, the entry changes about 300 ms after the pointer stops, and a double click on the handle writes the reset width at once;
    - a reload restores the opened state and the width;
    - an entry edited to a width below `minWidth` or above `maxWidth` is restored at the nearest bound;
    - an entry edited to an unusable value is ignored
- [ ] 2.5 Verify Escape with two `keydown` listeners added from the DevTools console, one on the container element and one on `document`:
    - with the panel open, Escape on the Toggle button in the main content closes the panel;
    - the container listener then logs `defaultPrevented` as `true`, and the `document` listener does not fire;
    - with the panel closed, Escape reaches the `document` listener
- [ ] 2.6 Verify motion: with `prefers-reduced-motion: reduce` emulated in DevTools, the panel and the main content take their final positions without a slide; without it, both slide
- [ ] 2.7 Verify the close button's `aria-label`: in the dev app it is the `ru-RU` value of `a11y.close`; in the docs site (`yarn run docs`), with the examples locale switched to `en-US` on the content panel overview, it is "Close"
- [ ] 2.8 Verify the behaviour the dev app cannot show by reading `content-panel.ts` and `core/state-saving/state-saving.ts`, or with a throwaway unit test that is deleted before 3.2:
    - a header outside a container throws `NG0201`;
    - changing `stateSavingKey` restores from the new key;
    - a container initialized while detached from the document neither restores nor writes;
    - `clearSavedState()` and `hasSavedState` do nothing and return `false` while `useStateSaving` is `false`;
    - `openedChange` does not emit for input changes or restored state;
    - a change of the `opened` or `width` input writes nothing

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-content-panel-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-content-panel-baseline` once the checks pass. This creates `openspec/specs/content-panel/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The content margin computed from an unclamped width and the missing focus handling and roles are the most user-visible ones.
