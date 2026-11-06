# Proposal

## Why

`openspec/specs/` has no navbar capability, so a change to the navbar has no contract to diff against. `@koobiq/components/navbar` ships a horizontal and a vertical navbar, eleven directives and components that work inside them, a global keyboard shortcut and a responsive collapse algorithm. What it promises consumers is spread across about 2,000 lines of source, 3,000 lines of unit tests, a Playwright spec and two short MDX pages that describe little of the interaction. A baseline spec of its current behaviour lets later navbar changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `navbar` capability: the observable behaviour of `kbq-navbar`, `kbq-vertical-navbar` and the elements that ship with them in `@koobiq/components/navbar`, as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the structure of the two navbar components, items and their icons, titles and suffixes, the responsive collapse of the horizontal navbar, expanding and collapsing the vertical navbar, the toggle and its `Ctrl` + `/` shortcut, the brand and its automatic long title, the bento item, tooltips and accessible names, the roving keyboard focus, disabled and decorative elements, dropdown triggers inside items, overlay layering and localization.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `navbar`: the behaviour contract of the horizontal and vertical navbar components and the items, brand, divider, toggle and marker directives in `@koobiq/components/navbar` — what a consumer can rely on when they compose a navbar, and a user operates it with a mouse, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-navbar-baseline/` now, and `openspec/specs/navbar/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including `kbq-dropdown`, `kbq-tooltip` and `kbq-button` beyond what a navbar item changes about them; visual styling and design tokens beyond the classes a consumer sets or tests against; internals such as the measurement helpers and the key manager; and the deprecated `KBQ_VERTICAL_NAVBAR_CONFIGURATION` and `KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION` aliases.
- From then on, a change that alters navbar behaviour updates this spec through a `MODIFIED` delta.
