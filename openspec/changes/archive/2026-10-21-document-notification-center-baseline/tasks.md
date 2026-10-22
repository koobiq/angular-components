# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/notification-center/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/notification-center`, and verify the notification center unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/notification-center` and verify the notification center e2e suite passes. It backs the in-place panel, the empty, loading, error and bottom states, the trigger's ARIA state, the dialog name, the keyboard reach of the delete buttons, the focus trap, Escape returning focus to the trigger, group deletion and the read-state reflow
- [ ] 1.3 For each requirement in `specs/notification-center/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:notification-center` exists in `package.json`. Run each check in `yarn run dev:notification-center` (http://localhost:3003), which renders a plain trigger button, a "push" button and the six docs examples. Where a check needs the trigger or its service, get the trigger instance in the browser console with `ng.getDirectives(<trigger element>)` and reach the service through its `service` field.

- [ ] 2.1 Verify the trigger:
    - Space on the focused plain trigger opens the panel;
    - while the panel is open the trigger has the classes `kbq-notification-center_open` and `kbq-active`, and loses both on close;
    - in the overview example the overlay pane has the classes `kbq-notification-center__panel` and `example-notification-center-panel`;
    - setting `disabled = true` on the trigger instance while the panel is open closes it
- [ ] 2.2 Verify the position: the plain trigger's panel opens on its end side, falls back to the bottom or top alignment when the window is too short, and `kbqPlacementChange` (subscribe to `placementChange` on the trigger instance) emits the placement applied
- [ ] 2.3 Verify closing:
    - a click elsewhere on the page closes the panel;
    - a click on an option of the silent-mode menu leaves it open;
    - the close button in the header closes it
- [ ] 2.4 Verify the header:
    - the silent-mode switch's `aria-label`, tooltip and bell icon change when the mode changes;
    - the "turn on" option turns silent mode off;
    - only the active option shows its mark;
    - with notifications in the list, the delete-all button stays visible after `setLoadingMode(true)` and after `setErrorMode(true)`
- [ ] 2.5 Verify the rows, assigning `items` from the console where an example does not cover the case:
    - `content`, `actions`, `iconClass` and an `icon` template are rendered;
    - the time reads as `HH:mm`;
    - a notification without a `title` shows no time and no unread marker
- [ ] 2.6 Verify the read state:
    - a row's delete button and a group's delete button appear only on hover or focus, and the row's time is hidden meanwhile;
    - leaving a row with the pointer after more than 500 ms marks it read;
    - subscribing to `onRead` after a read immediately receives the last notification read
- [ ] 2.7 Verify the states:
    - with `setLoadingMode(true)` and `setErrorMode(true)` both on, the error state is shown;
    - on the plain trigger, the reload button emits `onReload` and the error state stays;
    - in the infinite-scroll example, the retry button of the failed page moves focus to the list;
    - the `role="status"` region reads `failedToLoadNotifications` in error mode and with the bottom error row alone
- [ ] 2.8 Verify motion: with reduced motion emulated in DevTools and the page reloaded, the list of an opened panel has the class `kbq-animations-disabled`
- [ ] 2.9 Verify popover mode and size:
    - in the popover example the panel opens below the trigger and has the class `kbq-notification-center_popover`;
    - after `popoverHeight = ''` on its trigger instance, a reopened panel is as tall as the viewport minus the navbar height;
    - the plain trigger's panel is as tall as the viewport
- [ ] 2.10 Verify `stickToWindow`: setting it to `top`, `bottom` and `left` on the plain trigger instance before opening pins the overlay pane to that window edge
- [ ] 2.11 Verify by reading `notification-center.service.ts` and `notification-center.ts` that `DateAdapter` and `DateFormatter` are injected without `optional`, and that the panel applies the locale overrides directive as a host directive and is created in the trigger's view container, which is what lets an ancestor's `kbqLocaleOverrides` reach it

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-notification-center-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-notification-center-baseline` once the checks pass. This creates `openspec/specs/notification-center/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The placement and `offset` inputs that do not move the panel, and focus being pulled back to the trigger on an outside click, are the most user-visible ones.
