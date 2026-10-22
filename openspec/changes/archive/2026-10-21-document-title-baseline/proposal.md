# Proposal

## Why

`kbq-title` sits on dropdown items, list, select and tree options, filter-bar pipes, modal, sidepanel and toast headers, and on consumer markup, yet what it promises is spread across a 360-line directive, the tooltip trigger it extends, the unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later title changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `title` capability: the observable behaviour of the `kbq-title` directive as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover when text counts as truncated (horizontal and vertical overflow, the sub-pixel rule, several text elements and sibling clipping), how the measured container and text elements are chosen (template references and host components), the tooltip content (host text, a string or a template, and how it follows changes), re-evaluation on resize and content mutation, the fixed hover and keyboard-focus trigger, `kbqTooltipDisabled`, pointer events, placement and accessibility.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `title`: the behaviour contract of the `kbq-title` directive and `KbqTitleModule` in `@koobiq/components/title` — what a consumer can rely on when they put `kbq-title` on an element that may truncate its text, and a user reaches that element with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-title-baseline/` now, and `openspec/specs/title/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: the components that embed `kbq-title` (option, dropdown item, list and tree options, button, filter bar, modal and the rest) beyond the measured elements they hand to it, the behaviour of `kbqTooltip` itself (rendering, positioning, delays, the instant-show window, colors and modifiers), visual styling and design tokens, internals, and deprecated APIs.
- From then on, a change that alters title behaviour updates this spec through a `MODIFIED` delta.
