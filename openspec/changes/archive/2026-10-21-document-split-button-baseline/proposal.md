# Proposal

## Why

`kbq-split-button` has no spec in `openspec/specs/`, so a change to it has no contract to diff against. The component is small (about 200 lines of source), but most of what it promises lives in how it hands its style, color and disabled state to the buttons it holds and how it configures the menu of its dropdown trigger, and that is spread across the source, the unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later split-button changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `split-button` capability: the observable behaviour of `kbq-split-button` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the host and its content, the position and state classes on the host and on the nested buttons, the `kbqStyle`, `color` and `disabled` inputs and how they reach the nested buttons, the `firstDisabled` and `secondDisabled` getters, label truncation, the menu position and `panelAutoWidth`, and accessibility.
- Record behaviour that the docs and the code disagree on, suspected defects and weak tests as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `split-button`: the behaviour contract of the `kbq-split-button` component in `@koobiq/components/split-button` — what a consumer can rely on when they put buttons and a dropdown trigger inside it, set its inputs, and a user operates it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-split-button-baseline/` now, and `openspec/specs/split-button/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including the behaviour of `kbq-button` and `kbq-dropdown` beyond what the split button changes or exposes; deprecated APIs; visual styling and design tokens; internals.
- From then on, a change that alters split-button behaviour updates this spec through a `MODIFIED` delta.
