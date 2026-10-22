# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/code-block/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Fallback language": in `highlight()` in `packages/components/code-block/code-block-highlight.ts`, verify that a missing or unknown `language` is replaced by the fallback and passed to `hljs.highlight()` outside any `try`; then verify in `node_modules/highlight.js/lib/core.js` that `_highlight()` throws `Unknown language: "<name>"` for a language the instance has not registered and that `highlight.js/lib/core` registers none, `plaintext` included
- [ ] 1.2 "Content warnings in development mode": in `code-block-highlight.ts`, verify that the mismatch warning depends only on `relevance === 0`, a known `language` and a result language other than `plaintext`; then verify in `highlight.js/lib/core.js` that `highlight()` defaults `ignoreIllegals` to `true` and reports `illegal: true` only when it is `false`, and that `highlight('42', { language: 'typescript' })` returns highlighted markup with relevance 0
- [ ] 1.3 "Collapsed code does not scroll": in `packages/components/code-block/code-block.ts`, verify that `calculatedMaxHeight` is `null` for a `maxHeight` of zero or less while `measureContentOverflow()` sets `contentExceedsMaxHeight` for any non-zero `maxHeight` the content exceeds
- [ ] 1.4 "Expanding and collapsing": in `code-block.ts`, verify that only `toggleViewAll()` calls `scrollTo({ top: 0 })` and emits `viewAllChange`, and that `viewAll` is a `linkedSignal` of `viewAllInput` that no effect watches to scroll or emit
- [ ] 1.5 "Show all from the keyboard": in `onViewAllEnterKeydown()` in `code-block.ts`, verify that focus moves only when `canCodeContentBeFocused` holds, read right after `toggleViewAll()`, before the new state renders, and that `canCodeContentBeFocused` needs `calculatedMaxHeight()` to be `null`
- [ ] 1.6 "Active file": in `code-block.ts`, verify that the transform of `activeFileIndexInput` passes the bound value through `numberAttribute`, so `"1"` reads as `1`, and floors anything that is not a non-negative integer at `0`
- [ ] 1.7 "Copying the code": in `ngAfterViewInit()` in `code-block.ts`, verify that the `visibleChange` subscription that resets the tooltip to `copyTooltip` is made once, and only when the copy button's tooltip exists at that moment
- [ ] 1.8 "Keyboard access to the code area": in `code-block.ts`, verify that `hasScroll()` compares the scroll and client sizes only, and in `code-block.scss` that the code area has `overflow: hidden` while the show all button is rendered and `viewAll` is off
- [ ] 1.9 Run `openspec validate correct-code-block-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/code-block/spec.md`.
