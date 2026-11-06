# Proposal

## Why

`openspec/specs/` holds only the select spec, so a change to the notification center has no contract to diff against. What `@koobiq/components/notification-center` promises consumers is spread across the trigger, the panel, the row component, `KbqNotificationCenterService` (about 1,500 lines of source), 2,400 lines of unit tests, a Playwright suite and the MDX docs. A baseline spec of its current behaviour lets later notification center changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `notification-center` capability: the observable behaviour of the notification center as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the trigger (opening, closing, focus, ARIA, placement, popover mode, stick-to-window), the panel header (title, silent-mode switch, "delete all", close), the grouped list and its rows, the read state and the unread counter, the empty, loading and error states, infinite scroll, deletion and its events, the service commands and streams, accessibility and localization.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `notification-center`: the behaviour contract of `kbqNotificationCenterTrigger`, the panel it opens and `KbqNotificationCenterService` from `@koobiq/components/notification-center` — what a consumer can rely on when they feed notifications to the service, open the panel, and a user reads, deletes and pages through notifications with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-notification-center-baseline/` now, and `openspec/specs/notification-center/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-toast`, `kbq-dropdown`, `kbq-navbar` and the badge the examples put on the trigger), the shared pop-up base classes beyond what the notification center exposes, deprecated APIs (`KBQ_NOTIFICATION_CENTER_CONFIGURATION`, `KBQ_NOTIFICATION_CENTER_DEFAULT_CONFIGURATION`), visual styling and design tokens, and internals.
- From then on, a change that alters notification center behaviour updates this spec through a `MODIFIED` delta.
