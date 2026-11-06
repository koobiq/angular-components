# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/sidebar/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/sidebar`, and verify the sidebar unit suite passes on the baseline commit
- [ ] 1.2 Run `npx vitest run packages/components/core/state-saving` and verify it passes. It backs the `KBQ_STATE_SAVING_ENABLED` default of the state-saving requirement
- [ ] 1.3 Verify that `packages/components/sidebar` has no `e2e.ts` or `e2e.playwright-spec.ts` and that `packages/e2e/scenarios.ts` exports no sidebar scenario, so there is no e2e suite to run
- [ ] 1.4 For each requirement in `specs/sidebar/spec.md`, name at least one unit test that asserts it. Verify that every requirement, or part of one, without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

Run each check in `yarn run dev:sidebar` (http://localhost:3003; the script exists in `package.json` as `ng serve dev-sidebar --port 3003`), using the three docs examples embedded there and the browser DevTools. `ng.getComponent(element)` in the console returns the sidebar of a selected `kbq-sidebar` element.

- [ ] 2.1 Verify the content switch and the event timing in the overview example:
    - on load, the console logs `stateChanged` once for each sidebar, `true` for the left and `false` for the right one;
    - on closing, the opened content stays until the width has narrowed, and only then the closed content appears and `stateChanged` is logged;
    - on opening, the opened content appears at once, while the width still grows
- [ ] 2.2 Verify the opened state without two-way binding in the overview example:
    - after "Toggle left", a click on "Toggle left model" changes nothing and logs nothing;
    - `ng.getComponent(sidebar).opened = true` on an open sidebar logs nothing;
    - `const s = ng.getComponent(sidebar); s.toggle(); s.toggle();` logs `stateChanged` once, with the state the sidebar started with
- [ ] 2.3 Verify the widths in the "With splitter" example:
    - the opened host has `min-width: 170px`, `width: 170px` and `max-width: 50%`, and the closed host `44px` for all three;
    - after the splitter is dragged wider and the sidebar is toggled closed and open, it reopens at the dragged width as a whole-pixel inline `width`
- [ ] 2.4 Verify reduced motion: with "prefers-reduced-motion: reduce" emulated in the DevTools Rendering panel and the page reloaded, the host has `kbq-animations-disabled` and a toggle changes the width without a transition
- [ ] 2.5 Verify state saving in the "State saving" example and its `kbq.state.sidebar-state-saving-example` entry in `localStorage`:
    - a toggle writes `{ opened: false, width: '<px>' }` inside the entry, and the page reloads closed;
    - `ng.getComponent(sidebar).opened = false` on the closed sidebar rewrites the entry;
    - with the stored state edited to `{ "opened": false, "width": 42 }`, a reload restores it closed and reopens at `170px`;
    - "Reset saved state" removes the entry;
    - `ng.getComponent(sidebar).saveState()` on a sidebar of the overview example writes nothing
- [ ] 2.6 Verify the shortcut on the whole page:
    - `[` toggles the left sidebars of all three examples at once, the bound overview sidebar included, and `]` toggles only the right one;
    - on a Russian layout the "х" key does the same as `[`;
    - nothing toggles while typing `[` in an `<input>` and in a `<textarea>` added from the console, or while the Meta key is held
- [ ] 2.7 Verify the accessibility of the DOM: the host and both content elements carry no `role` and no `aria-*` attribute, and the content of the state not shown is absent from the DOM
- [ ] 2.8 Verify the behaviour that needs a different template by editing an example temporarily, and revert every edit before task 3.2:
    - a sidebar without `position` ignores `[` and `]`;
    - a sidebar whose `[kbq-sidebar-opened]` declares no width has `inherit` as its opened bounds, and one whose `[kbq-sidebar-closed]` declares none is `32px` wide when closed;
    - a `[width]` bound on the opened content and changed after the first render does not change the opened width;
    - with `[useStateSaving]="false"`, `hasSavedState` is `false` and nothing is written;
    - after `stateSavingKey` is changed at runtime, the next toggle writes under the new key
- [ ] 2.9 Verify that the requirements no hand check covers — no write from a detached sidebar, `opened`, `toggle()` and `saveState()` untracked inside an effect, and the shortcut's lifetime — are still listed under "Behaviour without a test" in `design.md` as resting on the source

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-sidebar-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-sidebar-baseline` once the checks pass. This creates `openspec/specs/sidebar/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The shortcut firing with Shift and inside a `contenteditable`, together with WCAG 2.1.4, is the most user-visible one; the wrong JSDoc of `KbqSidebarState.width` is the cheapest.
