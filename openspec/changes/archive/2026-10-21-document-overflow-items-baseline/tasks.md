# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/overflow-items/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/overflow-items`, and verify the overflow-items unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/overflow-items` and verify the overflow-items e2e suite passes. It backs every requirement that hides items: measuring, the result element, reverse order, `order`, `alwaysVisible`, alignment, vertical orientation, wrap mode and the recalculation triggers
- [ ] 1.3 For each requirement in `specs/overflow-items/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`yarn run dev:overflow-items` exists in `package.json` and serves the six docs examples on http://localhost:3003. In a dev build, `ng.getDirectives(element)` in the browser console returns the directive instances of an element.

- [ ] 2.1 Verify in the DOM of the overview and vertical examples:
    - the container's inline style has `display: flex`, `position: relative`, `overflow: hidden` and `flex-grow: 1`;
    - its `flex-direction` is `row` in the overview example and `column` in the vertical one
- [ ] 2.2 Verify the hidden state of the result element in the overview example. Widen the container with its resize handle until every item fits: the result element has `kbq-overflow-item-hidden`, `aria-hidden="true"` and inline `visibility: hidden` and `position: absolute`. Narrow it again: the class and the inline styles are gone and `aria-hidden` is `"false"`
- [ ] 2.3 Verify the "nothing left to hide" case in the always-visible example. Set `min-width: 0; width: 20px` on the container in DevTools: only the always-visible item is visible and the result element has no `kbq-overflow-item-hidden`
- [ ] 2.4 Verify manual control in the overview example. With every item fitting, call `ng.getDirectives(resultElement)[0].show()` in the console: the result element appears. Resize the container slightly, keeping every item fitting: the next recalculation hides it again
- [ ] 2.5 Verify, in a temporary container added to `packages/components-dev/overflow-items/module.ts` and reverted before 3.2, with `[debounceTime]="3000"`, more items than fit, one item declared as `kbqOverflowItem="plain"` and one item wrapped in a `<span>`:
    - for 3 s after a reload every item and the result element ("and 0 more") are shown, then items are hidden;
    - the wrapped item is never hidden;
    - once the `plain` item is hidden, `ng.getDirectives(container)[0].hiddenItemIDs()` contains the string `'plain'`, and the IDs are listed in template order
- [ ] 2.6 Verify that binding `additionalResizeObserverTargets` replaces `document.body`: in a temporary unit test modelled on "should observe document.body by default", deleted before 3.2, bind another element and assert that `observe` is not called with `document.body`
- [ ] 2.7 Verify server rendering: in the prerendered HTML that `yarn run docs:build` writes for the overflow-items overview page, no element has `kbq-overflow-item-hidden` and each container has the inline `display: flex` and `overflow: hidden`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-overflow-items-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, including the temporary edits of 2.5 and 2.6

## Workflow follow-up

- Archive with `/opsx:archive document-overflow-items-baseline` once the checks pass. This creates `openspec/specs/overflow-items/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The inputs that do not trigger a recalculation and the `NaN` order from a `null` binding are the most likely to bite consumers.
