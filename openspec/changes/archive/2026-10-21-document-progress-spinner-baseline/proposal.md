# Proposal

## Why

`openspec/specs/` has no contract for `kbq-progress-spinner`, so a change to it has nothing to diff against. The component is small (about 120 lines of source and 200 lines of unit tests), but what it promises consumers — how `value` and `mode` reach the arc, which host classes `size`, `mode` and `color` set, what the text and caption slots render, and how the spinner behaves without motion — is spread across the source, the unit and e2e tests, the shared color and motion code in `core` and two short MDX pages. A baseline spec of its current behaviour lets later progress-spinner changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `progress-spinner` capability: the observable behaviour of `kbq-progress-spinner` and its text and caption directives as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the determinate arc and how `value` is clamped and coerced, the indeterminate mode, the two sizes, the color host classes, the id, the text and caption slots, motion and its opt-outs, what assistive technology gets, and how the pieces are imported.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `progress-spinner`: the behaviour contract of `kbq-progress-spinner`, `[kbq-progress-spinner-text]` and `[kbq-progress-spinner-caption]` in `@koobiq/components/progress-spinner` — what a consumer can rely on when they render a spinner, bind its progress, mode, size and color, and add a text and a caption next to it.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-progress-spinner-baseline/` now, and `openspec/specs/progress-spinner/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including the ones that render a spinner inside them (`kbq-loader-overlay`, `kbq-select`, `kbq-file-upload`, the tree option and the notification center); deprecated APIs; visual styling and design tokens; internals such as the private computed members and the inner element classes.
- From then on, a change that alters progress-spinner behaviour updates this spec through a `MODIFIED` delta.
