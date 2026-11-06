# Proposal

## Why

`kbq-inline-edit` decides when an edit is saved, cancelled or rejected, where focus goes afterwards and how a background save is reported, and none of that is written down in one place: it is spread across about 1,250 lines of source, 3,500 lines of unit tests, a Playwright spec and the MDX pages. A baseline spec of its current behaviour lets later inline-edit changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `inline-edit` capability: the observable behaviour of `kbq-inline-edit` and the `kbqInlineEditMenu` and `kbqInlineEditPlaceholder` directives as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the content slots and host classes, opening the editor by pointer and keyboard, interactive view content, the edit panel, saving and its triggers, validation and the validation tooltip, cancelling, the action buttons, value capture and the custom value handlers, background saving with `saveHandler` (progress, failure, retry and rollback), the action menu, programmatic mode switching, the select-style editor, Tab-out and chaining, focus return, accessibility and localization.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that do not check what they claim as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `inline-edit`: the behaviour contract of `kbq-inline-edit` and the directives that ship with it in `@koobiq/components/inline-edit` — what a consumer can rely on when they project a view and an editor into it, save the value locally or to a server, and a user operates it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-inline-edit-baseline/` now, and `openspec/specs/inline-edit/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including the controls projected into the editor (`kbq-select`, `kbq-form-field`, the pickers) beyond what the inline edit does with them; deprecated APIs; visual styling and design tokens; internals such as private members, timers below what a user notices and change-detection details.
- From then on, a change that alters inline-edit behaviour updates this spec through a `MODIFIED` delta.
