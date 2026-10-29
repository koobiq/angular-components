# Proposal

## Why

`openspec/specs/` holds only the `select` baseline, so no tooltip change has a contract to diff against. `kbqTooltip` sits on almost every interactive element of the library and is reused by the overflow hints of other components, and what it promises consumers is spread across about 1,400 lines of its own source, the shared pop-up base classes in `core`, 2,900 lines of unit tests, the Playwright spec and the MDX docs. A baseline spec of its current behaviour lets later tooltip changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `tooltip` capability: the observable behaviour of the `kbqTooltip` directive as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the triggers and when the tooltip opens and closes, the enter and leave delays and the instant-show window, content, header, context, color, modifier, custom classes, the arrow, placement and fallback order, positioning relative to the pointer and to the text caret, the offset, moving the pointer onto the tooltip, the "one tooltip at a time" rule, muting by a pop-up on the same element, `forDisabledComponent`, the imperative API (`show`, `hide`, `showForElement`, `showForMouseEvent`), Escape, scrolling and accessibility.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `tooltip`: the behaviour contract of the `kbqTooltip` directive (`KbqTooltipTrigger`) and the services and tokens that ship with it in `@koobiq/components/tooltip` — what a consumer can rely on when they attach a tooltip to an element, configure it, drive it from code, and a user reaches it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-tooltip-baseline/` now, and `openspec/specs/tooltip/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including the ones that build on the tooltip (`kbq-title`, `kbqEllipsisCenter`, the option and timezone-option hints, the navbar item, the validation tooltips of datepicker, timepicker and inline edit) and `kbq-popover`; the deprecated `KBQ_TOOLTIP_OPEN_TIME` and `KBQ_TOOLTIP_OPEN_TIME_PROVIDER`; visual styling and design tokens beyond the ones a consumer sets; internals such as the overlay component class, the registry and the delay tracker beyond the tokens that configure them.
- From then on, a change that alters tooltip behaviour updates this spec through a `MODIFIED` delta.
