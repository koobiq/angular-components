# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/resizer/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/resizer`, and verify the resizer unit suite passes on the baseline commit
- [ ] 1.2 Verify that `packages/components/resizer` has no `e2e.ts` and no `*.playwright-spec.ts`, so there is no e2e suite of its own to run. The splitter e2e exercises the resizer only through the splitter and does not count as coverage here
- [ ] 1.3 For each requirement in `specs/resizer/spec.md`, name at least one test in `resizer.spec.ts` that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:resizer` exists in `package.json`. Run each check in `yarn run dev:resizer` (http://localhost:3003) on the overview example it embeds: a 3 x 3 grid of handles, of which the right `[1, 0]`, bottom `[0, 1]` and corner `[1, 1]` cells resize and the rest are `[0, 0]`. Its `(sizeChange)` handler logs with `console.debug`, so turn on the verbose console level.

- [ ] 2.1 Verify in the DOM:
    - the container has the class `kbq-resizable` and every handle the class `kbq-resizer`;
    - a handle's only inline style is `cursor`, and it has no `touch-action`, `tabindex`, `role` or ARIA attribute;
    - Tab never lands on a handle, and no key resizes the container
- [ ] 2.2 In the console, add a document listener for the pointer-down event that logs the event's `defaultPrevented`. Verify that pressing the right handle with the main button logs `true`, and that a right-click on it or a press on a `[0, 0]` cell logs `false`
- [ ] 2.3 Verify the missing clamping: drag the right handle 50 px to the left. The log reports a width below the container's `min-width` of 125 px while the container stays at 125 px. Dragging further left than the container's starting width logs negative widths
- [ ] 2.4 Set `dir="rtl"` on `<html>` in the devtools, drag the right handle to the right, and verify that the container gets wider
- [ ] 2.5 Release a drag and verify that the container keeps the inline `width` written last and that `<body>` has no inline `cursor` left
- [ ] 2.6 Reload, give the container `display: inline`, `width: auto` and `box-sizing: content-box` in the devtools, so its computed width is `auto`. Press the right handle, move it 30 px right, and verify that the log reports a width of 30: a size that is not a number counts as 0
- [ ] 2.7 The overview example has no `-1` handle. Run `yarn run dev:content-panel` (the script exists in `package.json`), whose panel has a `[-1, 0]` handle on its left edge, and verify that dragging it to the left widens the panel

## 3. Check the remaining behaviour from the source and the docs build

- [ ] 3.1 Read `resizer.ts` and verify that `KbqResizer` injects `KbqResizable` without `optional` or `skipSelf`, so a handle without a container fails with Angular's missing-provider error and nested containers resolve to the closest one
- [ ] 3.2 Read `module.ts` and verify that `KbqResizerModule` imports and exports both `KbqResizable` and `KbqResizer`
- [ ] 3.3 Run `yarn run docs:build` and verify that the prerendered resizer overview page under `dist/releases/koobiq-docs` contains `kbq-resizable`, `kbq-resizer` and the handles' `cursor` styles in its HTML. The SSR dev app does not render the resizer, so the docs prerender is the server-rendering check

## 4. Final checks

- [ ] 4.1 Run `openspec validate document-resizer-baseline --strict` and verify it reports the change as valid
- [ ] 4.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-resizer-baseline` once the checks pass. This creates `openspec/specs/resizer/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The missing `touch-action` on handles that hosts such as `kbq-content-panel` do not add themselves is the most user-visible one.
