# Proposal

## Why

`openspec/specs/` holds only the select baseline, so a change to the modal has no contract to diff against. What `kbq-modal` and `KbqModalService` promise consumers is spread across the component (about 1,100 lines with its template), the service and the composition directives, about 2,000 lines of unit tests, the Playwright spec and the MDX docs. A baseline spec of the current behaviour lets later modal changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `modal` capability: the observable behaviour of `kbq-modal`, `KbqModalService`, `KbqModalRef` and the composition directives as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover both ways of opening a dialog (the service and a declarative `<kbq-modal [(kbqVisible)]>`), the open and close events, the default, confirm and custom layouts, the predefined OK and Cancel buttons and the footer buttons given as options, the OK and Cancel flows with their handlers, Escape, Ctrl + Enter and the dim layer, stacked dialogs, the page made inert behind a dialog, sizes and scrolling, focus on open and on close, accessible names, the injector and data passed to the content, and localization of the close button.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that do not check what their names say, as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `modal`: the behaviour contract of `@koobiq/components/modal` — the `kbq-modal` component, `KbqModalService`, `KbqModalRef`, the `kbq-modal-title`, `kbq-modal-caption`, `kbq-modal-body`, `kbq-modal-footer` and `kbq-modal-main-action` directives and the `toCssUnit` pipe: what a consumer can rely on when they open a dialog, fill it, and a user operates it with mouse, keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-modal-baseline/` now, and `openspec/specs/modal/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-sidepanel`, `kbq-popover` and the rest), deprecated APIs, visual styling and design tokens beyond the ones that set a documented size, and internals — the modal control service, the service's builder and the members marked `@docs-private`.
- From then on, a change that alters modal behaviour updates this spec through a `MODIFIED` delta.
