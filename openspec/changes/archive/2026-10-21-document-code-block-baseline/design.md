# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/code-block/`: the component and its template, the highlighting directive, the highlight.js loader, the line numbers plugin, `types.ts`, `code-block.scss` where it defines behaviour (clipping, wrapping, the hidden number column, the floating action bar), both unit specs (`code-block.spec.ts`, `code-block-highlight.spec.ts`), `e2e.ts` and `e2e.playwright-spec.ts`;
- `code-block.{en,ru}.mdx`, `examples.code-block.{en,ru}.mdx` and the ten docs examples under `packages/docs-examples/components/code-block/`;
- the API golden file `tools/public_api_guard/components/code-block.api.md`;
- what the block relies on elsewhere: the `codeBlock` locale section and `KbqLocaleOverridesDirective` in `core/locales`, the overflow shadow directives and `kbqOptionalNumberAttribute` in `core`, the tab nav bar in `tabs`, `kbqScrollbarViewport` in `scrollbar` and the tooltip trigger in `core/pop-up`.

The component has no deprecated entry point. `openspec/specs/` holds only the `select` spec, whose baseline set the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when code block behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Using `kbqCodeBlockHighlight` on its own. The directive is exported but `@docs-private` and not part of `KbqCodeBlockModule`; the spec covers highlighting only as the code block uses it.
- Internals: the loader service, the line numbers plugin, class and method names, timers beyond the hover delay, CSS structure and design tokens.
- The tab nav bar, the scrollbar and the tooltip as components of their own.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the `select` baseline (archived as `2026-10-21-document-select-baseline`): one capability at a flat path matching the entry point, English text, quirks documented as they ship, only behaviour confirmed by a test or read directly in the source, and suspected defects kept out of the spec and listed under Findings. Decisions specific to the code block:

1. **Highlighting is specified through the block.** `data-language`, the `hljs` class, the plain-text stand-in, the fallback language and the server and hydration behaviour are what a consumer of `kbq-code-block` sees. The directive's own inputs `startFrom` and `singleLine` stay out, because the block never binds them.
2. **Development-mode console warnings count as contract**, like thrown error messages in the select spec: consumers and their test setups (this repository fails a spec on any `console.warn`) depend on their text and on when they appear.
3. **What counts as contract.** These count:
    - the host classes `kbq-code-block_filled`, `_outline`, `_no-border`, `_hide-line-numbers`, `_hide-tabs`, `_show-actionbar`, `_soft-wrap` and `_view-all`;
    - the `hljs` class and the `data-language` attribute of the code element, and `cdk-keyboard-focused` on the code area;
    - the `kbq-selected` class and the ARIA roles of the tabs;
    - public inputs, outputs, methods, writable signals, providers and injection tokens;
    - the console warning texts and the default fallback values `code` and `plaintext`.

    The 100 ms hover delay of the action bar is stated because the unit tests depend on it.

4. **Behaviour defined in CSS counts when a user can observe it**: the clipped, non-scrolling collapsed block, line wrapping and the hidden number column. Colors, sizes and tokens do not.
5. **Behaviour the block borrows is stated where the block wires it.** The tab roles and keys come from the tab nav bar, the scrollbar reveal from `kbqScrollbarViewport` and the tooltips from `kbqTooltip`. They are in the spec because the block's markup decides them, but no code block test covers the tab semantics, so they are listed as without a test.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/code-block` updates `openspec/specs/code-block/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:code-block` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. The spec states only the safe half of `hideTabsChange`: the block does not emit it when it hides the tabs by itself. That the output is never emitted at all is a finding.
- [A change in the tabs, scrollbar or tooltip components alters the block] → The requirements that borrow from them name the observable result, so such a change shows up as a mismatch in the hand checks and needs a delta here.
- [Two requirements rest on timing read from the code: the Enter focus move of "Show all" and the 100 ms hover delay] → Both are in the hand checks; the hover delay also has unit tests.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Changing the block height" section (EN and RU) says the line wrap toggle is unavailable in the collapsed state. The toggle is rendered and works whatever `viewAll` is.
2. The download section says the default extension is _txt_. The block suggests the bare name (`filename` or `code`) and only sets the blob type to `text/plain`; any extension comes from the browser.
3. The English page says "Languages are loaded lazily on first use", which reads as one load per language. Every configured language is loaded together with the core on the first highlight under that configuration. The Russian text, "on first use of the component", matches the code.
4. The JSDoc of `KbqCodeBlockFile.filename` and `.language` says a missing value "will be set to" the fallback token. The file object is never changed; the fallback is only used for the tab label, the download name and highlighting.
5. The JSDoc of `softWrap` says "Whether sequences of whitespace should be preserved". Whitespace is preserved either way; the input controls line wrapping. The JSDoc of `toggleSoftWrap()` says lines wrap when they exceed the height of the component; it is the width.
6. The JSDoc of `hideTabs` sends readers to `tabsHidden`, which is `@docs-private` and hidden from the API tab. The JSDoc of `hideTabsChange` promises two-way binding, but the output is never emitted.
7. The line numbers section does not say that content of a single line never shows a number.
8. The action panel section describes only hover for hidden tabs and says nothing about keyboard users (see defect 1).
9. `startFrom` and `singleLine` are public inputs of the exported `KbqCodeBlockHighlight`, but `kbq-code-block` never binds them, so a block always numbers from 1 and never numbers a single line.

**Suspected defects (from reading the code, not reproduced)**

1. With tabs hidden, which includes every block with a single unnamed file, and without `alwaysShowActionbar`, the action bar is `display: none` until the pointer hovers. Nothing reveals it on keyboard focus, so keyboard and screen reader users cannot reach copy, download, soft wrap or the link.
2. `hideTabsChange` is declared but never emitted, so `[(hideTabs)]` never writes back.
3. The copy tooltip sits on a wrapper `<div>` that never receives `focus`, so keyboard users see neither "Copy" nor the "copied" confirmation. The button's `aria-label` stays `copyTooltip`, so a successful copy is not announced.
4. `openLink()` calls `window.open(url, '_blank')` without `noopener`, so the opened page gets `window.opener`. A URL the sanitizer rejects is still opened, as `unsafe:…`.
5. `downloadCode()` never revokes the object URL it creates, and clicks an anchor that is not attached to the document.
6. With `maxHeight` set and code that fits vertically but overflows horizontally, the code area scrolls but keeps `tabIndex` -1, so keyboard users cannot scroll it.
7. A negative `maxHeight` sets no limit, but the overflow measure treats any non-zero value as one, so "Show all" appears over code that is not clipped.
8. Enter on "Show all" decides whether to move focus before the expanded layout renders, so expanding always moves focus to the code area, which then gets `tabIndex` -1 when the expanded code no longer scrolls.
9. With tabs hidden, the code area keeps `role="tabpanel"` with no tab list and no accessible name. With one named file, the only tab has `aria-selected="false"` and no tab stop, and the panel has no `aria-labelledby`.
10. The "Show all" button exposes its state only through its text, with no `aria-expanded`.
11. With an empty `files` list, the tab bar renders without tabs and the copy button stays, doing nothing.

**Tests whose name and body disagree, or that cannot fail**

- "should toggle softWrap property by click" asserts only that `toggleSoftWrap` was called twice; `softWrap` and `softWrapChange` are never checked.
- "should toggle viewAll property by click" and "should toggle viewAll property by ENTER keydown" only spy on `toggleViewAll`; `viewAll`, `viewAllChange` and the focus move are not checked.
- "should copy code content by click" spies on `copyCode` without checking the clipboard or the tooltip. "should open link by click" does not check `window.open`, and "should download code content by click" does not check the file name or type.
- "should not re-emit hideTabsChange on every files assignment" cannot fail: nothing emits `hideTabsChange`.
- "should apply lineNumbers plugin" runs with `lineNumbers` off; what it shows is that the numbered rows are built regardless.
- "should hide lineNumbers" and "should outline the code block" set the input to its default and assert the default class.
- "should show viewAll button when content overflows maxHeight" exists twice with the same body, at the top level and under "viewAll button visibility".
- "should show actionbar on mobile devices" mocks iOS and Android as both true, so neither platform is covered alone.
- "should display copy button" binds `canCopy` to `false` first, so no unit test covers the default `true`.
- "should provide custom locale configuration" snapshots a protected member instead of the rendered strings.
- The e2e "states" test fakes the hover state by adding `kbq-code-block_show-actionbar` to two blocks, so its screenshot does not exercise hover.

**Behaviour without a test.** The spec states these from the source, or from a screenshot only:

- copying and downloading doing nothing on an empty `files` list;
- the illegal-characters and language-mismatch warnings;
- a single-line file showing no number (the numbering from 1 is visible only in the screenshot);
- the header shadow (screenshot only);
- a `maxHeight` of zero or less;
- the collapsed block being clipped without scrolling and out of the tab order;
- `viewAllChange`, the scroll to the top on collapse, `viewLessText` and the focus move on Enter;
- `softWrapChange` and the toggle's icon, name and tooltip;
- `kbqCodeBlockFallbackFileNameProvider()` and `kbqCodeBlockFallbackFileLanguageProvider()`;
- the tab of a single named file;
- switching tabs by click or keyboard, `activeFileIndexChange` and the scroll to the top;
- the clipboard content, the "copied" tooltip, the download name and type, and `window.open`;
- `cdk-keyboard-focused` on the code area;
- the `aria-label` of the action buttons and the tab roles;
- switching the locale and `[localeOverrides]`;
- the string `"false"` on boolean inputs;
- writing the state signals in code;
- the `kbqCodeBlock` template reference.
