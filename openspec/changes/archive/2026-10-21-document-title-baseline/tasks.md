# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/title/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/title packages/components/tree/tree-selection.component.spec.ts`, and verify the title unit suite and the `kbq-title` tests of the tree selection pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/title` and verify the title e2e suite passes. It has no screenshots; it backs the hover, text that fits, vertical overflow, several text elements, sibling clipping, sub-pixel and keyboard requirements in a real browser
- [ ] 1.3 For each requirement in `specs/title/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`yarn run dev:title` exists in `package.json`. Run each check in it (http://localhost:3003), using the docs examples and the hosts embedded there, and read directive state in the DevTools console with `ng.getDirectives(element)`.

- [ ] 2.1 Verify the public surface: `tools/public_api_guard/components/title.api.md` lists `kbqTitle` as the export name of `KbqTitleDirective`, and `KbqTitleModule` exports the directive
- [ ] 2.2 Verify the measuring element: hover the host under "Simple cut text with tooltip in div", whose plain text wraps and fits, and check with a `MutationObserver` on the host, or by comparing `childNodes` before and after, that every node added during the hover is removed again
- [ ] 2.3 Verify the zero client width exception: in the multiple-text example, set `display: block` on the row so that the two spans are inline, replace the value with a short text, and check that both spans report a `clientWidth` of 0 and that `isOverflown` is `false`
- [ ] 2.4 Verify empty content: in DevTools, replace the text of the truncated host in `.dev-container-responsive` with an empty `<span style="display: inline-block; width: 2000px">`, check that `isOverflown` is `true`, hover the host, and check that no `.kbq-tooltip` and no new `.cdk-overlay-pane` appear
- [ ] 2.5 Verify the mutation window: reload, change the text of the responsive host twice, 50 ms apart, from the console without hovering it, and check that the directive's `content` holds the first new text, not the second
- [ ] 2.6 Verify that a resize does not open the tooltip: with the pointer outside the responsive host, resize the window so that the host's width changes, wait at least 100 ms, and check that no tooltip opens; then hover the host and check that the tooltip opens
- [ ] 2.7 Verify `ignoreTooltipPointerEvents="false"`: bind it on one host of the dev template locally, check that the open tooltip's overlay pane has no `cdk-overlay-pane_ignore-pointer-events` class, and revert the edit before 3.2
- [ ] 2.8 Verify `aria-describedby`:
    - hovering the responsive host, whose tooltip repeats its text, adds no `aria-describedby` to it;
    - hovering the "Plain string content" row of the custom-content example adds the tooltip id to the row's `aria-describedby`;
    - the id is removed again once the tooltip closes

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-title-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-title-baseline` once the checks pass. This creates `openspec/specs/title/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The tooltip that may stay open when a select panel closes, and the docs examples that no keyboard user can reach, are the most user-visible ones.
