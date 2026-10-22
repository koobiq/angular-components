# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/alert/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Status icon slot": in `packages/components/alert/alert.component.ts`, verify that `icon` and `iconItem` are directive queries with `descendants: false` and that `alert.component.html` renders `kbq-alert__icon` from `projectedIcon()` while `<ng-content select="[kbq-icon-item],[kbq-icon]">` matches by attribute; then verify in `@angular/core` that `TQuery_.isApplyingToNode` looks through `<ng-container>` and matches the root nodes of an embedded view, that the projection definition instruction assigns slots only to the top-level children of the host, and in `@angular/compiler` that `ingestControlFlowInsertionPoint` gives a block with more than one root node no projection attributes
- [ ] 1.2 "Explicit icon color wins": in the icon effect of `alert.component.ts`, verify that an icon is re-tinted when its `color()` equals `lastAutoColor`, and that `lastAutoColor` is never reset when the projected icon goes away or is replaced
- [ ] 1.3 "Re-tint on status change": in `alert.component.ts`, verify that the effect only touches `projectedIcon()`, which prefers the `kbq-icon` over the icon item, and re-tints it only while its `color()` is `empty` or equals `lastAutoColor`
- [ ] 1.4 "Close control slot": in `alert.component.html`, verify that the `kbq-alert__close-button` wrapper is rendered from `closeButton()`, a directive query with `descendants: false`, and that the `(click)` listener that emits `closed` sits on that wrapper, so a close control projected into the text area does not reach it
- [ ] 1.5 "Dismissible host class": in the host bindings of `KbqAlert`, verify that `kbq-alert_dismissible` follows `closeButton()`, the same query as in 1.4
- [ ] 1.6 "Title layout modifiers": in `alert.component.html`, verify that `kbq-alert__content_title` and `kbq-alert__icon_title` follow `title()`, a directive query with `descendants: false`, while the title slot matches `[kbq-alert-title]` by attribute
- [ ] 1.7 "Action controls": in `alert.component.html`, verify that `kbq-alert__button-stack` is rendered from `control()`, a directive query with `descendants: false`, while the stack's slot matches `[kbq-alert-control]` by attribute
- [ ] 1.8 Run `openspec validate correct-alert-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/alert/spec.md`.
