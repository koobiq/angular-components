# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/alert/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/alert`, and verify the alert unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/alert` and verify the alert e2e suite passes. Its screenshot backs the `info` and normal-size defaults, the auto-tint of `kbq-icon-item` and the link-only button stack
- [ ] 1.3 For each requirement in `specs/alert/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:alert` exists in `package.json` (`ng serve dev-alert --port 3003`). Run each check in `yarn run dev:alert` (http://localhost:3003), which embeds the six docs examples and the `E2eAlertStateAndStyle` table.

- [ ] 2.1 Verify in the DOM of the e2e table:
    - the first alert, which binds neither `alertColor` nor `compact`, has `kbq-alert_info` and `kbq-alert_normal`;
    - alerts with a close control have `kbq-alert_dismissible`, and the control has the `kbq-alert-close-button` class;
    - titles have `kbq-alert__title` and controls have `kbq-alert-control`;
    - the button stack of the pseudo-link row has no `kbq-alert__button-stack_has-button`
- [ ] 2.2 Verify the auto-tint in the e2e table: the uncolored `kbq-icon-item` of the `error`, `warning`, `success` and `info` alerts has `kbq-error`, `kbq-warning`, `kbq-success` and `kbq-contrast` respectively, and the icon wrapper of an alert with a title has `kbq-alert__icon_title`
- [ ] 2.3 Verify the close control:
    - in the `alert-close` example, Tab to the close button and press Enter: the alert is removed, because the example handles `closed`;
    - in the `alert-content` example, clicking the text or the link does not remove the alert;
    - in the e2e table, which does not handle `closed`, clicking a close button leaves the alert rendered
- [ ] 2.4 Verify accessibility in the DOM:
    - the hosts in the `alert-overview` and `alert-content` examples have no `role` and no `aria-*` attribute;
    - after "Show alert" in the `alert-dynamic` example, the inserted host has `role="alert"`;
    - no alert renders text other than its projected content
- [ ] 2.5 Verify by reading the source what the dev app cannot show:
    - `alert.component.html` renders the icon slot, then title, text and controls, then the close control;
    - the `compact` input uses `booleanAttribute` and `alertColor` falls back with `value || KbqAlertColors.Info`;
    - the double-icon warning is guarded by `isDevMode()`;
    - the icon, title, control and close-button queries use `descendants: false`;
    - `tools/public_api_guard/components/alert.api.md` lists the export names `kbqAlert`, `kbqAlertTitle`, `kbqAlertControl` and `kbqAlertCloseButton`, and `KbqAlertModule` exporting all four

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-alert-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-alert-baseline` once the checks pass. This creates `openspec/specs/alert/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The close control's click area (suspected defects 1 and 2) and the missing heading semantics of the title are the most user-visible ones.
