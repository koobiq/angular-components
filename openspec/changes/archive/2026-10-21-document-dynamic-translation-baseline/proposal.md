# Proposal

## Why

`kbq-dynamic-translation` puts Angular templates into an already translated string through a small marker syntax, `[[name:context]]`. The rules of that syntax — what counts as a marker, where a context ends, how a list is split, what happens to an unknown name — live only in a regular expression in the source and in eleven snapshot tests; the docs page shows two snippets. A baseline spec of the current behaviour lets later changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it from the regular expression.

## What Changes

- Add the `dynamic-translation` capability: the observable behaviour of `kbq-dynamic-translation`, the `kbqDynamicTranslationSlot` directive and the `kbq-dynamic-translation-with-dynamic-component-creation` helper as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover how the text is rendered, how slot templates are registered, the marker syntax (string context, no context, list context, where a context ends, repeated and unknown markers), how the output follows changes, the helper that renders plain elements, and the NgModule.
- Record behaviour that the docs and the code disagree on, suspected defects and untested behaviour as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, examples, styles or the public API.

## Capabilities

### New Capabilities

- `dynamic-translation`: the behaviour contract of `@koobiq/components/dynamic-translation` — what a consumer can rely on when they pass a translated string with slot markers and register templates for those slots.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-dynamic-translation-baseline/` now, and `openspec/specs/dynamic-translation/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including `KbqLink` and anything else placed inside a slot; the translation of the string itself, which is the application's job; deprecated APIs; styling and design tokens (the entry point has none); internals such as the parsed-slot model and private members.
- From then on, a change that alters dynamic-translation behaviour updates this spec through a `MODIFIED` delta.
