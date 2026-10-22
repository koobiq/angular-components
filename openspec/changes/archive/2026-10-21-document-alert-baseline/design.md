# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/alert/` (component, template, styles, the unit spec, `e2e.ts` and the Playwright spec), the `alert.{en,ru}.mdx` and `examples.alert.{en,ru}.mdx` pages, the six examples under `packages/docs-examples/components/alert/`, the dev app in `packages/components-dev/alert/`, and the API golden file `tools/public_api_guard/components/alert.api.md`. The alert's reactions to other entry points were checked against `KbqIcon`, `KbqIconItem` and `KbqIconButton` in `@koobiq/components/icon`, the color behaviour in `packages/components/core/common-behaviors/color.ts`, and `KbqButton`. Every claim in the spec was read from the source or matched to a test. `openspec/specs/` holds only the `select` spec, whose layout this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when alert behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the effect that tints the icon, the content queries, and CSS beyond the classes the spec names.
- The behaviour of the icon, icon item, icon button, button and link components themselves, such as the default `aria-hidden` of an icon or the disabled state of an icon button.
- Visual styling and design tokens: paddings, the corner shape and the colors behind the `kbq-alert_*` classes.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline.** One capability, `alert`, at a flat path that matches the entry point; English; the spec describes what ships, quirks included; only behaviour confirmed by a test or read in the source goes in; public inputs, outputs, selectors, export names, host classes and the dev-mode warning count as contract. Only the alert-specific decisions follow.
2. **Slot wrapper classes count as contract.** `kbq-alert__icon`, `kbq-alert__text`, `kbq-alert__button-stack`, `kbq-alert__close-button` and their `_title` and `_has-button` modifiers are not host classes. They are in the spec because the unit tests assert on them and the docs examples style `.kbq-alert__button-stack` from outside, so renaming one would break consumers. Leaving them out was considered and rejected: the spec would then say nothing about the empty-slot behaviour the tests protect.
3. **The alert's effect on other components is described, their own behaviour is not.** The auto-tint is written as the `kbq-<color>` class the icon ends up with, because that is what the alert changes. That the icon is hidden from assistive technology by default belongs to the icon's own spec.
4. **What the alert does not do is part of the contract.** No `role`, no ARIA, no text of its own, no focus handling and no self-hiding are written as requirements. The docs promise them, for example that a static alert gets no `role="alert"`, and a later change that adds any of them should show up as a `MODIFIED` delta rather than slip in.
5. **The dev-mode warning is quoted by its start and end.** Like an error message, it is something consumers and tests match on. The unit test matches "single status icon", so the spec quotes the opening and the closing sentence instead of every word.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/alert` updates `openspec/specs/alert/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Many requirements rest on the source rather than on a test] → tasks.md checks them by hand in `yarn run dev:alert`, or names the source line to read when the dev app cannot show them. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. The closed-output requirement, for one, names the parts of the alert that must not emit instead of saying "anywhere else", because of suspected defects 1 and 2.
- [Slot order and the close control's hit area also depend on CSS] → The spec states only what the template guarantees. The layout claims in Findings are marked as not reproduced.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqAlertTitle` calls it the alert heading, and the docs speak of a heading. The directive adds only a class: the examples use `<div kbq-alert-title>`, so assistive technology gets no heading, and the docs do not say to use a heading element.
2. The accessibility section of both pages tells consumers to mark a decorative status icon `aria-hidden="true"`. `kbq-icon` and `kbq-icon-item` already render `aria-hidden="true"` unless told otherwise, so the advice, which every example follows, is redundant.
3. The "Hide" section says an alert that reports a system problem "is displayed permanently and the user cannot close it". Nothing enforces that: an `error` alert with a close control can be dismissed. It is a design guideline that reads like behaviour.
4. The "Status" section describes the auto-tint, but the `alert-status` example it embeds, and `alert-variants` too, set `[color]` on every icon to the matching status, so neither shows the auto-tint. The comment in the unit spec says its fixture relies on the auto-tint "like the docs examples", which holds only for the overview, content and close examples.
5. The comment on the button query in `alert.component.ts` says it reports whether the control slot contains a button. The query covers the whole projected content (see suspected defect 3).

**Suspected defects (from reading the code, not reproduced)**

1. The `closed` listener sits on the close control's wrapper, not on the control. The wrapper is a flex item of the host, which keeps the default `align-items: stretch`, so it probably runs from just below the top of the alert to its bottom. A click in the empty column under the close button would then emit `closed`.
2. A disabled `kbq-icon-button` gets `pointer-events: none`. A click on a disabled close control then lands on the wrapper and probably still emits `closed`.
3. `kbq-alert__button-stack_has-button` follows any `kbq-button` at any depth of the content, for example one inside the text or a `kbq-button` used as the close control, not only one in the control slot.
4. The re-tint compares the icon's color with the last color the alert assigned, not with who set it. A consumer color equal to that last color, set later on the same icon or on a new icon that replaced the tinted one, is overwritten on the next `alertColor` change.
5. The dev-mode warning covers only one icon of each kind. Two `kbq-icon` or two `kbq-icon-item` elements render side by side, only the first is tinted, and nothing warns.

**Tests whose name and body disagree, or that cannot fail**

- "should default to the default style" and "should be normal by default and compact when requested" use a host that binds `alertStyle` to `default` and `compact` to `false`. They do not test the inputs' defaults and keep passing if the defaults change. No unit test checks the `info` default either.
- "should toggle the has-button modifier when the control is a button" checks only that the modifier is present; nothing checks that it is absent for link controls.
- "should toggle the title modifiers when a title is projected" checks only `kbq-alert__content_title`. The fixture shows no icon at the same time, so `kbq-alert__icon_title` is never checked.
- "should round-trip alertColor (get returns the raw value that was set)" names a getter that no longer exists; the body reads the `alertColor` signal.

**Behaviour without a test.** The spec states these from the source:

- the `info` and normal-size defaults, which only the e2e screenshot shows, and the `default` style default, which nothing checks;
- the bare `compact` attribute, and `null` or `undefined` falling back to `info` (the test covers the empty string);
- removing the previous status class when the status changes;
- the template references `kbqAlert`, `kbqAlertTitle`, `kbqAlertControl` and `kbqAlertCloseButton`;
- an icon nested inside the text not being taken as the status icon;
- the auto-tint of a `kbq-icon-item`, which only the e2e screenshot shows, and of an icon bound to an empty color;
- which icon is tinted when both kinds are projected;
- no warning in production mode;
- `kbq-alert__icon_title`;
- the fixed slot order and nested markers staying with their parent;
- no `closed` on clicks on the text, title or controls; `closed` from the keyboard; the alert staying rendered after `closed`;
- no `kbq-alert__button-stack_has-button` for link-only controls, which only the e2e screenshot shows;
- no `role` or ARIA on the host, and the consumer's `role="alert"` kept; no axe check renders an alert;
- no text of its own;
- the host classes of the three marker directives;
- `KbqAlertModule`, exercised only indirectly by `filter-bar/filters.spec.ts`, which renders an alert from that module.
