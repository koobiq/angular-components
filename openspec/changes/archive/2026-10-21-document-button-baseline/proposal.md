# Proposal

## Why

`openspec/specs/` has no contract for `kbq-button`, the most widely reused control in the library: breadcrumbs, the button toggle, the split button and the filter bar build on it. What it promises consumers is spread across about 900 lines of source, 2,000 lines of unit tests, a Playwright spec, and two docs pages whose English and Russian versions describe different things. A baseline spec of the current behaviour lets later button changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `button` capability: the observable behaviour of `[kbq-button]`, the `kbqButtonPrefix` and `kbqButtonSuffix` slots, the dropdown-trigger directive, `kbq-button-group` and `kbqButtonGroupRoot` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the supported hosts, the disabled state on native buttons and on anchors, the tab order, the anchor role, focus, the loading class, `kbqStyle` and the default color of each style, content slots, icon-only detection and the icon position classes, the accessible-name warning, label truncation and the `kbq-title` tooltip, the dropdown-trigger active class, and the propagation of style, color and disabled state by a button group.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `button`: the behaviour contract of `@koobiq/components/button` — what a consumer can rely on when they put `kbq-button` on a `<button>` or `<a>`, project text and icons into it, group buttons with `kbq-button-group` or `kbqButtonGroupRoot`, and a user operates the button with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-button-baseline/` now, and `openspec/specs/button/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components that compose `kbq-button` (button toggle, split button, breadcrumbs, filter bar), the dropdown's own behaviour beyond the class the button adds, `kbq-icon-button` from `@koobiq/components/icon`, visual styling and design tokens beyond the classes a consumer sets or tests against, internals, and deprecated APIs.
- From then on, a change that alters button behaviour updates this spec through a `MODIFIED` delta.
