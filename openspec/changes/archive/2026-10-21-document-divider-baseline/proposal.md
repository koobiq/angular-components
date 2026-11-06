# Proposal

## Why

`openspec/specs/` holds only the select baseline, so a change to `kbq-divider` has no contract to diff against. The divider is small (one component of about 90 lines and a 256-line unit spec), but what it promises consumers — orientation, spacing, length, and the separator semantics added when its inputs moved to signals — is spread across the source, the tests and the MDX docs. A baseline spec of its current behaviour lets later divider changes be written as `MODIFIED` deltas against a known contract.

## What Changes

- Add the `divider` capability: the observable behaviour of `kbq-divider` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the element and the module, orientation, spacing, length, how the layout sizes the line, the separator role and its decorative variant, and the attributes left to the caller.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `divider`: the behaviour contract of the `kbq-divider` component and `KbqDividerModule` in `@koobiq/components/divider` — what a consumer can rely on when they place a divider in a layout and when assistive technology reads it.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-divider-baseline/` now, and `openspec/specs/divider/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components that place or restyle a divider (lists, dropdowns, selects, the filter bar and others), visual styling and design tokens (color, thickness, the size of the spacing), internals, and deprecated APIs.
- From then on, a change that alters divider behaviour updates this spec through a `MODIFIED` delta.
