# Proposal

## Why

`openspec/specs/` has no contract for `kbq-progress-bar`, so a change to it has nothing to diff against. The component is small (about 150 lines of source and 460 lines of unit tests), but what it promises consumers — how `value` and `mode` reach the fill and the `progressbar` range attributes, how the bar gets its accessible name, and how it behaves without motion — is spread across the source, the unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later progress-bar changes be written as `MODIFIED` deltas against a known contract.

## What Changes

- Add the `progress-bar` capability: the observable behaviour of `kbq-progress-bar` and its `[kbq-progress-bar-text]` and `[kbq-progress-bar-caption]` directives as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the default bar, `value` and its clamping, `mode`, `color`, the host id, content projection, the `progressbar` role and range attributes, the accessible name and description, the locale fallback name, and the motion of both modes with animations on and off.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `progress-bar`: the behaviour contract of `kbq-progress-bar` and the directives that ship with it in `@koobiq/components/progress-bar` — what a consumer can rely on when they render a bar, bind its value, mode and color, project a label and a caption, and a user perceives it visually or through assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-progress-bar-baseline/` now, and `openspec/specs/progress-bar/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-progress-spinner` included), visual styling and design tokens beyond the color classes a consumer sets, the internals of the shared color and locale code beyond what a progress bar exposes, and deprecated APIs.
- From then on, a change that alters progress-bar behaviour updates this spec through a `MODIFIED` delta.
