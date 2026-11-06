# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/code-block/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/code-block`, and verify both code block unit suites (`code-block.spec.ts` and `code-block-highlight.spec.ts`) pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/code-block` and verify the code block e2e suite passes. It backs the scrollbar reveal requirement and, through the "states" screenshot, the header shadow, the line numbers, the collapsed block and the visual variants
- [ ] 1.3 For each requirement in `specs/code-block/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:code-block` exists in `package.json`. Run each check in `yarn run dev:code-block` (http://localhost:3003), using the docs examples embedded there, the locale selector at the top, and the `ng` global of a development build in the browser console (`ng.getComponent(element)`, then `ng.applyChanges(element)`) where no example binds the input.

- [ ] 2.1 Verify the action bar of the "filled" example, whose single file has no name:
    - it appears about 100 ms after the pointer enters the block and hides after it leaves;
    - "Always show actionbar" keeps it shown;
    - with an iPhone emulated in the browser's device toolbar and the page reloaded, it is shown without hover
- [ ] 2.2 Verify the actions:
    - the copy button puts the raw file content on the clipboard (paste it into a text field) and its tooltip reads "✓ Copied" until the pointer leaves, then "Copy" on the next hover;
    - the download button of the "custom locale" example suggests the name `code`, and the one of the "tabs" example the name of the active file;
    - the link button of the "link" example opens the link in a new tab;
    - the "link" example, written with `canCopy="false"`, has no copy button
- [ ] 2.3 Verify in the DOM, with the locale set to `en-US`:
    - the action buttons have the `aria-label` values "Enable word wrap" or "Disable word wrap", "Download", "Copy" and "Open in the external system";
    - the tab bar of the "tabs" example has `role="tablist"`, its tabs `role="tab"` with `aria-selected` and `aria-controls`, and the code area `role="tabpanel"` with `aria-labelledby`;
    - with "Hide tabs" on, the code area keeps `role="tabpanel"`
- [ ] 2.4 Verify the tabs:
    - in the "tabs" example, clicking another tab switches the file and scrolls the code to the top;
    - only the selected tab is reached with Tab, and Right Arrow then Enter selects the next tab;
    - the single tab of the "link" example is not selected and ignores clicks
- [ ] 2.5 Verify the height limit in the "max height" example:
    - the collapsed code does not scroll with the wheel and is skipped by Tab;
    - the button reads "Show all" collapsed and "Show less" expanded;
    - Enter on "Show all" expands the block and moves keyboard focus to the code, which then has `cdk-keyboard-focused`;
    - collapsing scrolls the code back to the top;
    - the example's "Show all" toggle follows the button, which shows `viewAllChange`;
    - the soft wrap toggle still works while the block is collapsed
- [ ] 2.6 Verify soft wrap in the "soft wrap" example: the example's toggle follows the button, which shows `softWrapChange`, and the button's icon and name switch between the two states
- [ ] 2.7 Verify the code area and line numbers:
    - scrolling the code of the "tabs and shadow" example adds a shadow under the header, and scrolling back to the top removes it;
    - the "overview" example numbers its lines from 1;
    - the code element of the "filled" example, a single line, holds no `.hljs-ln` table, so no number can show for it
- [ ] 2.8 Verify the locale: with the default `ru-RU` the "max height" button reads "Показать все", and switching the selector to `en-US` changes it to "Show all"
- [ ] 2.9 Verify from the console on the "overview" block:
    - after `files.set([])`, the code area is empty, the copy button does nothing and nothing is thrown;
    - after `files.set([{ content: 'hello', language: 'javascript' }])`, the language-mismatch warning is logged;
    - after `softWrap.set(true)`, the block wraps lines
- [ ] 2.10 Verify by reading the source, because no example or test exercises them, and keep each in "Behaviour without a test":
    - a `maxHeight` of zero or less sets no limit;
    - the illegal-characters warning;
    - `kbqCodeBlockFallbackFileNameProvider()` and `kbqCodeBlockFallbackFileLanguageProvider()`;
    - `[localeOverrides]`, mapped onto the host directive in the API golden file

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-code-block-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-code-block-baseline` once the checks pass. This creates `openspec/specs/code-block/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The action bar that keyboard users cannot reach when tabs are hidden is the most user-visible one; `hideTabsChange`, which is never emitted, is the smallest.
