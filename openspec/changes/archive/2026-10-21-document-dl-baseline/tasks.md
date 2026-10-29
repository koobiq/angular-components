# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/dl/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/dl`, and verify the description list unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/dl` and verify the description list e2e suite passes. It backs the layout and alignment requirements (the `E2eDlStates` screenshots) and the pointer drag, double-click, keyboard, focus frame, separator line and default minimum requirements
- [ ] 1.3 For each requirement in `specs/dl/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev apps

`package.json` has `dev:dl`. Run `yarn run dev:dl` (http://localhost:3003), which embeds the long-text, resizable and overview examples. For the states and the resizable list without minimums, run `yarn run dev:e2e` (http://localhost:4200) and open `/E2eDlStates` and `/E2eDlResizable`.

- [ ] 2.1 Verify the automatic layout on the overview example:
    - with the viewport set so that the list measures exactly 400 px, the host has `kbq-dl_vertical`;
    - with a DOM breakpoint on the host's attribute changes and a narrow viewport, a reload renders the list without `kbq-dl_vertical` first and adds it about 100 ms later;
    - with `display: none` set on the example's host in DevTools, the list gets `kbq-dl_vertical`, and it drops the class once the style is removed on a wide viewport
- [ ] 2.2 Verify the resizable example:
    - both lists have `kbq-dl_resizable`;
    - dragging the separator of one list moves the term column of the other;
    - `aria-valuemax` equals the list's `clientWidth`, minus its computed `column-gap`, minus 200;
    - ArrowRight and ArrowLeft change `aria-valuenow` by 8 and PageDown or ArrowDown changes nothing and still scrolls the page
- [ ] 2.3 Verify the clamp after a resize: in the resizable example, drag the separator close to its maximum, then narrow the window. The term column shrinks with the list, and the other list follows, which shows that `dtWidthChange` emitted
- [ ] 2.4 Verify `dtWidth` without `resizable`: in the console, call `ng.getComponent(<the overview list>).dtWidth.set(200)`. The host gets `kbq-dl_resized` and a 200 px term column. After the viewport turns it vertical, it keeps `kbq-dl_resized` with a single column, and the 200 px column returns once it is horizontal again
- [ ] 2.5 Verify the default minimums on `/E2eDlResizable` (`e2eDlResizableAuto`):
    - Home on the separator leaves the term column at its first rendered width;
    - `aria-valuemax` equals the list's `clientWidth`, minus its `column-gap`, minus that term width
- [ ] 2.6 Verify the long-text example: the hash and the path break between characters, and the term column keeps its width before and after the text is added, including after a resize of the column
- [ ] 2.7 No example binds `[localeOverrides]`, an empty `resizerAriaLabel` or an unparsable `verticalBreakpoint`, and no dev app switches the direction at runtime. Read `dl.component.ts` and verify the overrides directive on the host, the `||` fallback of the separator name, the `Directionality` change subscription, and the prevented default of the double-click. Keep these items in "Behaviour without a test"

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-dl-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-dl-baseline` once the checks pass. This creates `openspec/specs/dl/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The missing term and description semantics and the keyboard's lack of a way back to the default ratio are the most user-visible ones.
