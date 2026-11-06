# Proposal

## Why

`openspec/specs/` has no spec for `kbq-flag`, so a later flag change has no contract to diff against. The component is small (one component, about 100 lines of source, 360 lines of unit tests and one screenshot test), but what it promises consumers — how the flag markup is passed in, the box it is cropped to and the accessibility contract — is spread across the source, the stylesheet, the tests and the MDX docs. A baseline spec of its current behaviour lets later flag changes be written as `MODIFIED` deltas against a known contract.

## What Changes

- Add the `flag` capability: the observable behaviour of `kbq-flag` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the selector and the module, the three ways of passing the flag (a projected image, a projected inline SVG and the `svg` input), the box the flag is cropped to (default size, shape, `aspectRatio` and the two custom properties a consumer sets), the inset shadow, the empty placeholder and the accessibility contract (`label`, `decorative` and the hidden-by-default fail-safe).
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `flag`: the behaviour contract of the `kbq-flag` component in `@koobiq/components/flag` — what a consumer can rely on when they pass it flag markup, size and shape it, and expose it to assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-flag-baseline/` now, and `openspec/specs/flag/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (including `kbq-select` and `kbq-form-field`, which the docs examples place flags in), the `country-flag-icons` package the docs recommend, deprecated APIs, visual styling and design token values beyond the two custom properties a consumer sets (`--kbq-flag-aspect-ratio` and `--kbq-flag-border-radius`), and internals.
- From then on, a change that alters flag behaviour updates this spec through a `MODIFIED` delta.
