# Proposal

## Why

`kbqPopover` has no spec to diff against. Its behaviour is split between the popover entry point (about 1,500 lines of source and 2,700 lines of unit tests) and the pop-up base classes in `core` that it shares with the tooltip, and what it promises consumers is spread across that source, the unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later popover changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `popover` capability: the observable behaviour of `kbqPopover` and `kbqPopoverConfirm` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the panel content (header, content, footer, templates and their context), sizes and paddings, the arrow and the offset, placement and its fallbacks, scrolling and closing on scroll, overlay layers and sticking to the window, the close button, the confirmation popover, custom origins, the trigger events and delays, every closing path, accessibility and focus handling, host classes and localization.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `popover`: the behaviour contract of the `kbqPopover` and `kbqPopoverConfirm` directives and the panels they open, in `@koobiq/components/popover` — what a consumer can rely on when they attach a popover to an element and a user opens, operates and closes it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-popover-baseline/` now, and `openspec/specs/popover/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including `kbqTooltip` beyond how it yields to a popover on the same element; the internals of the shared pop-up base classes beyond what a popover exposes; visual styling, animation and design tokens; and deprecated APIs.
- From then on, a change that alters popover behaviour updates this spec through a `MODIFIED` delta.
