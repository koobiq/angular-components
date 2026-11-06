# Proposal

## Why

The baseline spec of `empty-state` states behaviour the code does not have. A static audit of `openspec/specs/empty-state/spec.md` against `packages/components/empty-state` on `c9c196a9b` found three requirements whose wording contradicts the source or the Angular behaviour it relies on; this change corrects them so the spec describes what ships.

## What Changes

- **Alignment needs a height**: outside a flex parent the host is not always as tall as its content: a grid container stretches it to a fixed row height just as a flex parent does, and in a block container it is as tall as its content plus its padding.
- **Error tint reaches an icon item in the illustration slot**: the slot directive finds the empty state through dependency injection, so an icon item in the template of another component placed in the slot is tinted when that template marks it, or an element around it, with `kbq-empty-state-icon`; only an unmarked one is left alone.
- **Content outside the slots is not rendered**: content projected with an `ngProjectAs` that matches a slot selector is rendered, and a slot element in a control flow block with more than one root node makes the Angular compiler report the `NG8011` warning at build time; only the runtime stays silent.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `empty-state`: corrects the requirements "Alignment needs a height", "Error tint reaches an icon item in the illustration slot" and "Content outside the slots is not rendered".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-empty-state-baseline/` and, once archived, `openspec/specs/empty-state/spec.md`. No source, test, documentation or public API changes.
