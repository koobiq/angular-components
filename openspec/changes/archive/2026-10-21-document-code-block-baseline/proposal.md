# Proposal

## Why

`openspec/specs/` has no spec for `kbq-code-block`, so a change to it has no contract to diff against. What the component promises consumers is spread across about 1,600 lines of source and template (the component, the highlighting directive, the highlight.js loader and the line numbers plugin), 1,700 lines of unit tests, one Playwright spec and the MDX docs. A baseline spec of its current behaviour lets later code block changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `code-block` capability: the observable behaviour of `kbq-code-block` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover syntax highlighting and its configuration (lazy highlight.js loading, fallback language, server rendering and hydration), line numbers, the header with file tabs and custom tab labels, the maximum height and "Show all", soft wrap, the visual variants, the action bar and its buttons (copy, download, soft wrap, external link), the keyboard and scrolling behaviour of the code area, the public methods, accessibility and localization.
- Record behaviour that the docs and the code disagree on, suspected defects and weak tests as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `code-block`: the behaviour contract of the `kbq-code-block` component and the pieces that ship with it in `@koobiq/components/code-block` (`kbqCodeBlockTabLinkContent`, the providers and injection tokens) — what a consumer can rely on when they render code files in a block, configure highlighting, and a user reads, switches, copies or downloads them with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-code-block-baseline/` now, and `openspec/specs/code-block/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-tab-nav-bar`, `kbqScrollbarViewport`, `kbq-tooltip` and `kbq-button` are covered only where the code block relies on them), deprecated APIs, visual styling and design tokens, and internals such as the loader service and the line numbers plugin beyond what a consumer sees.
- From then on, a change that alters code block behaviour updates this spec through a `MODIFIED` delta.
