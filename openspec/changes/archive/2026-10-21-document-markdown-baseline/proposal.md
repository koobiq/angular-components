# Proposal

## Why

`kbq-markdown` is small (about 250 lines of source in `@koobiq/components/markdown`), but what it promises consumers is split between the component, the parsing service, a list of aliased tags, two unit suites with snapshots, a Playwright screenshot and the MDX docs. Part of that contract is easy to break without noticing: the `kbq-markdown__*` classes are also what the docs site styles and builds anchors from. A baseline spec of the current behaviour lets later markdown changes be written as `MODIFIED` deltas against a known contract.

## What Changes

- Add the `markdown` capability: the observable behaviour of `kbq-markdown` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover where the source text comes from (the `markdownText` input or the projected content) and how changes to either re-render the output, the `marked` options token, the `kbq-markdown__*` classes put on the generated elements, how each Markdown construct of the docs page renders, the HTML that is passed through without sanitization, scrollbars, the link focus ring, server rendering and `KbqMarkdownModule`.
- Record behaviour that the docs and the code disagree on, suspected defects and gaps in the tests as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `markdown`: the behaviour contract of the `kbq-markdown` component and the pieces that ship with it in `@koobiq/components/markdown` (`KbqMarkdownModule`, `KBQ_MARKDOWN_MARKED_OPTIONS`, `kbqMarkdownMarkedOptionsProvider`, `KbqMarkdownService`, `CLASS_PREFIX`) — what a consumer can rely on when they render Markdown with it and style or test against its output.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-markdown-baseline/` now, and `openspec/specs/markdown/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (including the link component whose look the rendered links borrow), the behaviour of the `marked` library itself beyond what the component's output shows, visual styling and design tokens, deprecated APIs, and internals.
- From then on, a change that alters markdown behaviour updates this spec through a `MODIFIED` delta.
