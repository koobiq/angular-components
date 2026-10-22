# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/toast/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/toast`, and verify the toast unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/toast` and verify the toast e2e suite passes. It backs the overlay, auto-dismissal, hover pause, reduced motion, stacking above a later overlay and close button requirements in a real browser
- [ ] 1.3 For each requirement in `specs/toast/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`yarn run dev:toast` exists in `package.json`; run the checks in it (http://localhost:3003), using its buttons and the docs examples embedded there. Where a check calls the service from the browser console, take it from the dev app with `const s = ng.getComponent(document.querySelector('dev-app')).toastService;` (the dev build keeps the `ng` debugging global).

- [ ] 2.1 Verify the content slots:
    - the toast of the "toast-multiline" example shows every line of its title, caption and content on a line of its own;
    - "showOnlyCaption" renders its caption with the class `kbq-toast__title`, no icon slot and no close button, and its host has no `kbq-toast_dismissible` class;
    - "Templates" renders the play icon instead of the error glyph, and its first "Кнопка 1" action closes the toast;
    - the "toast-user-data" example shows `Update` and `AnyUserData` from its data;
    - "Single Action" renders the close button template, and its host has `kbq-toast_dismissible`
- [ ] 2.2 Verify from the console:
    - `s.show({ style: 'custom', title: 'Custom' })` renders a host with `kbq-toast_custom` and `role="status"`, and no glyph inside its icon container;
    - `s.show({ title: 'Negative' }, -1)` is still on screen after 10 seconds;
    - `s.hide(123456)` throws nothing and changes nothing
- [ ] 2.3 Verify the countdown rules:
    - after `s.show({ title: 'A' }, 3000); s.show({ title: 'B' }, 3000)`, B leaves at least 2 seconds after A;
    - a toast shown with `s.show({ title: 'Short' }, 1000)` and hovered for a moment right away stays on screen for at least 2 seconds after the pointer leaves;
    - the "show template" toast leaves after about 5 seconds while the pointer rests on it, and stays while the pointer rests on a regular toast shown next to it
- [ ] 2.4 Verify the read notification after `s.read.subscribe((data) => console.log('read', data))`:
    - a click anywhere in a toast logs its data once;
    - resting the pointer on another toast for over half a second and leaving logs its data once;
    - a toast that expires on its own logs nothing, and neither does `s.hide(s.show({ title: 'Hidden' }, 0).id)`
- [ ] 2.5 Verify the keyboard:
    - Tab into the "Отмена" action of "Prevented from Auto Hiding", which has no close button, and press Escape: the toast closes;
    - show three toasts with "Single Action" (which use the `kbq-toast-close-button` template), Tab to the close button of the bottom one and press Enter: focus lands on the close button of the top toast;
    - with a close button focused, `s.focused()` is `true`, and it is `false` again after a click on the page
- [ ] 2.6 Verify the stack position. `packages/components-dev/toast/main.ts` already passes `{ position: KbqToastPosition.BOTTOM_RIGHT }` to `kbqToastConfigurationProvider`: check that the stack sits in the bottom right corner and its container has `kbq-toast-container-bottom-right`. Then temporarily change that call to `{ position: KbqToastPosition.BOTTOM_LEFT, indent: { vertical: 24, horizontal: 48 } }` and check that the stack's overlay is offset by 24 px from the bottom edge and 48 px from the left. Repeat with `top-center` (only the vertical offset applies) and `center` (no offset). Revert the edit afterwards
- [ ] 2.7 Verify motion: with reduced motion emulated in the browser's developer tools and the page reloaded, a shown toast has `kbq-animations-disabled` on its host and appears and leaves without sliding
- [ ] 2.8 Verify the localized names: in `yarn run dev:toast`, which has no locale service, the close button is named `Закрыть` and the container `Уведомления`. In the docs app (`yarn run docs`), with the examples language set to English, a toast example shows a close button named `Close` in a region named `Notifications`
- [ ] 2.9 Verify by reading `toast.service.ts` and `toast-container.component.ts`, since the dev app has no path to them:
    - `show()`, `showTemplate()`, `hide()` and `hideTemplate()` each run their body inside `untracked()`;
    - `createTemplate()` renders the template with the data as `$implicit` and marks its first root element as a live region, and `remove()` removes a view of the container

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-toast-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, the dev app edit of 2.6 included

## Workflow follow-up

- Archive with `/opsx:archive document-toast-baseline` once the checks pass. This creates `openspec/specs/toast/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The DS-5407 regression, toasts closing tooltips and other close-on-scroll overlays through the scroll dispatcher, is the most user-visible one; its fix replaces the "Stack reflow reported as a scroll" requirement through a `MODIFIED` delta.
