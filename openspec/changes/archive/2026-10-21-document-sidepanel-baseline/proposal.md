# Proposal

## Why

`openspec/specs/` has only the `select` capability, so a change to the sidepanel has no contract to diff against. `KbqSidepanelService` and the parts that ship with it are about 1,400 lines of source and 1,600 lines of unit tests, and what they promise consumers is spread across the source, the unit and e2e tests, the CDK overlay and focus-trap behaviour they build on, and the MDX docs. A baseline spec of the current behaviour lets later sidepanel changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `sidepanel` capability: the observable behaviour of `@koobiq/components/sidepanel` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover opening a sidepanel from a component or a template, the configuration and its defaults, the lifecycle events and the close result, closing by Escape, backdrop, indent strip and close buttons, `disableClose`, the modal and non-modal modes (backdrop, scroll blocking, focus trap, hiding the page from assistive technology), stacking several sidepanels, the header, body, footer and actions parts, positions and sizes, focus on open and close, state saving, component-level service instances, accessibility and localization.
- Record behaviour that the docs and the code disagree on, suspected defects and weak tests as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `sidepanel`: the behaviour contract of `KbqSidepanelService`, `KbqSidepanelRef`, `KbqSidepanelConfig` and the header, body, footer, actions and close parts in `@koobiq/components/sidepanel` — what a consumer can rely on when they open a sidepanel, put content in it, and a user operates it with the mouse, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-sidepanel-baseline/` now, and `openspec/specs/sidepanel/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-modal`, the CDK overlay itself, the scrollbar and title directives beyond what a sidepanel exposes), deprecated APIs, visual styling and design tokens beyond the size presets, and internals such as animation states and the container component's members.
- From then on, a change that alters sidepanel behaviour updates this spec through a `MODIFIED` delta.
