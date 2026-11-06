# Proposal

## Why

`@koobiq/components/tags` ships four public building blocks that are always used together — `kbq-tag`, `kbq-tag-list`, the `kbqTagInput` directive and the tag sub-directives (remove control, edit input and submit, prefix and suffix) — and it is the base of tag input, tag autocomplete and the multiple select trigger. What it promises consumers is spread across about 2,500 lines of source, 6,200 lines of unit tests, a Playwright spec and four MDX pages. A baseline spec of its current behaviour lets later tags changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `tags` capability: the observable behaviour of the tags entry point as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the tag itself (value, color, content slots, disabled state, tab order, removal requests, the remove control, selection and in-place editing), the tag list (inheritance of `selectable`, `editable`, `removable` and `disabled`, focus and keyboard navigation, multiple and range selection, removal from the keyboard, drag and drop, forms integration, error state, the cleaner) and the tag input (separators, paste, blur, `distinct`, keys in an empty input, autocomplete interplay, default options), plus localization of the remove control.
- Record behaviour that the docs and the code disagree on, suspected defects and weak tests as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `tags`: the behaviour contract of `kbq-tag`, `kbq-tag-list`, `input[kbqTagInputFor]` and the directives that ship with them in `@koobiq/components/tags` — what a consumer can rely on when they render tags, bind a tag list to a form, and a user operates it with mouse, keyboard or clipboard.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-tags-baseline/` now, and `openspec/specs/tags/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-select`, `kbq-tree-select` and `kbq-autocomplete` beyond the points where the tag input reacts to an attached autocomplete; `kbq-cleaner` and `kbq-form-field` beyond what a tag list exposes to them), deprecated APIs (the `KbqTag` method that adds positional icon classes, and those classes), visual styling and design tokens, and internals such as the focus key manager, change detection and private members.
- From then on, a change that alters tags behaviour updates this spec through a `MODIFIED` delta.
