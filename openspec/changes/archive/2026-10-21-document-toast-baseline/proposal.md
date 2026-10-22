# Proposal

## Why

`openspec/specs/` has no contract for toasts. What `@koobiq/components/toast` promises consumers is spread over `KbqToastService` (about 660 lines that own the stack, the countdown, the overlay and the focus hand-off), `kbq-toast`, `kbq-toast-container`, about 1,500 lines of unit tests, a Playwright spec and the MDX docs. A baseline spec of the current behaviour lets later toast changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `toast` capability: the observable behaviour of the toast service, the `kbq-toast` component and the `kbq-toast-container` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover showing a toast and what it renders, styles and icons, the stack order, auto-dismissal and the sticky mode, the hover and focus pause, closing (close button, Escape, `close()`, `hide()`), the read notification, the focus hand-off, template toasts, the configuration and the stack position, the overlay lifecycle and its stacking above other overlays, the custom component factory, a container hosted by a consumer, accessibility and localization.
- Record behaviour that the docs and the code disagree on, suspected defects, and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `toast`: the behaviour contract of `@koobiq/components/toast` — what a consumer can rely on when they show, configure and dismiss toasts through `KbqToastService`, render a `kbq-toast-container` of their own, and a user reads and dismisses toasts with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-toast-baseline/` now, and `openspec/specs/toast/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (the notification center that feeds toasts, the link, button and dropdown used inside them), deprecated APIs, visual styling and design tokens, and internals of the service and the components.
- From then on, a change that alters toast behaviour updates this spec through a `MODIFIED` delta.
