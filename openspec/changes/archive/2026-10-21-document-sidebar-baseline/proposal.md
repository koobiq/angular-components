# Proposal

## Why

`openspec/specs/` has no contract for `kbq-sidebar` yet. The component is small (about 420 lines of source and 530 lines of unit tests), but what it promises consumers is spread across the source, the unit tests, the shared state-saving directive in `core` and two short MDX pages, and much of what it does — the bracket shortcut, the width it remembers on close, when `stateChanged` fires, when it persists and when it does not — are not written down anywhere. A baseline spec of its current behaviour lets later sidebar changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `sidebar` capability: the observable behaviour of `kbq-sidebar` and its `kbq-sidebar-opened` and `kbq-sidebar-closed` content directives as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the opened and closed states and how they are set (the `opened` input, the `opened` property, `toggle()`), which content is rendered, the widths of each state and the width remembered on close, the width transition and its host classes, `stateChanged`, the `[` and `]` shortcut, state saving (restore, write, keys, payload validation, `clearSavedState()`, `hasSavedState`) and the absence of ARIA semantics.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `sidebar`: the behaviour contract of `kbq-sidebar` and the content directives that ship with it in `@koobiq/components/sidebar` — what a consumer can rely on when they render a sidebar, drive its state from code or a binding, let users toggle it with the keyboard, and let it persist its state.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-sidebar-baseline/` now, and `openspec/specs/sidebar/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (the splitter that the docs example pairs the sidebar with, `kbq-sidepanel`), the internals of the shared `KbqStateSaving` directive, `KbqStateSavingService` and the state stores beyond what a sidebar exposes, visual styling and design tokens, deprecated APIs, and internal members.
- From then on, a change that alters sidebar behaviour updates this spec through a `MODIFIED` delta.
