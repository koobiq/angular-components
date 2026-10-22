# Proposal

## Why

`openspec/specs/` has no contract for the content panel. `kbq-content-panel-container` combines a slide-out panel, drag resizing and state that survives reloads, and what it promises consumers is spread across the source, a short unit suite, the Playwright spec, the shared state-saving code in `core` and the MDX overview. A baseline spec of its current behaviour lets later content panel changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `content-panel` capability: the observable behaviour of `@koobiq/components/content-panel` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the parts of the panel and where their content goes, opening and closing through the `opened` input, two-way binding, the methods and the close button, the width inputs, drag resizing and its reset, state saving, Escape handling, the overflow shadows of the header and footer, motion, focus, host classes and the localized name of the close button.
- Record behaviour that the docs and the code disagree on, suspected defects, weak tests and behaviour that no test covers as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `content-panel`: the behaviour contract of `kbq-content-panel-container` and the parts that ship with it in `@koobiq/components/content-panel` (`kbq-content-panel`, its aside, header, title, actions, body and footer) — what a consumer can rely on when they render the panel next to their content, open and resize it, and let it remember its state.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-content-panel-baseline/` now, and `openspec/specs/content-panel/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-sidepanel`, `kbq-splitter`, the resizer and scrollbar entry points beyond what the panel exposes), the shared state-saving store, key derivation and expiry rules beyond how the panel uses them, visual styling and design tokens, internals, and deprecated APIs.
- From then on, a change that alters content panel behaviour updates this spec through a `MODIFIED` delta.
