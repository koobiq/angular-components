# Proposal

## Why

`openspec/specs/` holds only the `select` capability, so a change to `kbq-username` has no contract to diff against. The component is small (about 700 lines of source and template and 490 lines of unit tests), but what it promises is split between the component, two pipes with different format rules, three exported formatting functions, the profile-mapping token and the docs page. A baseline spec of its current behaviour lets later username changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `username` capability: the observable behaviour of `kbq-username` and the helpers that ship with it in `@koobiq/components/username`, as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover what the component renders from a profile (name, login, site, partial profiles), the name format, compact mode, the display modes and styles, the custom view and the styling directives, the truncation tooltips, right-to-left text, the site label for assistive technology and its localization, the `kbqUsername` and `kbqUsernameCustom` pipes, `KBQ_PROFILE_MAPPING`, `kbqInjectUsernameFormatter()` and `kbqBuildUsernameText()`.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `username`: the behaviour contract of the `kbq-username` component, its custom view and styling directives, the two formatting pipes and the exported formatting functions and tokens in `@koobiq/components/username` — what a consumer can rely on when they render a user's name from a profile, format it outside a template, or localize it.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-username-baseline/` now, and `openspec/specs/username/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-title`, `kbq-filter-bar`, `kbq-link` and the highlight pipe are used here only as consumers or dependencies), the internals of the locale service, visual styling and design tokens beyond the host classes a consumer sets, and internal members.
- From then on, a change that alters username behaviour updates this spec through a `MODIFIED` delta.
