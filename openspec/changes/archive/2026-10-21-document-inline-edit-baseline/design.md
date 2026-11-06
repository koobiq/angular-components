# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/inline-edit/` (component, template, styles where they decide behaviour, the unit spec with its snapshot, `e2e.ts` and the Playwright spec), the docs examples under `packages/docs-examples/components/inline-edit/`, the `inline-edit.{en,ru}.mdx` and `examples.inline-edit.{en,ru}.mdx` pages, the API golden file `tools/public_api_guard/components/inline-edit.api.md`, and the pieces the component relies on: the `a11y` locale section and `KbqLocaleOverridesDirective`, `runCompareWith`, the form-field control contract (`open()`, `focus()`, `ngControl`) and `KBQ_CONNECTED_OVERLAY_ORIGIN` in `kbq-form-field`, and the CDK connected overlay and its outside-click and keyboard dispatchers. Every claim in the spec was checked against the source. `openspec/specs/` holds only the `select` baseline, which this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when inline-edit behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the tab-stop walk, the instance registry used for chaining, change-detection details, and the colors and backgrounds of the states beyond the class names that switch them.
- The behaviour of the controls projected into the editor (`kbq-select`, `kbq-form-field`, the pickers, `kbq-file-upload`) except for what the inline edit does with them.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline.** One capability at a flat path matching the entry point (`inline-edit`), written in English; the spec describes what ships, quirks included; only behaviour confirmed by a test or read directly from the source goes in; public inputs, outputs, methods, exported constants, selectors, host classes, ARIA attributes and locale keys count as contract.
2. **The directives ship in the same capability.** `kbqInlineEditMenu` and `kbqInlineEditPlaceholder` live in the same entry point and do nothing outside a `kbq-inline-edit`, so they get requirements here rather than capabilities of their own.
3. **Projected controls are described through the inline edit.** The spec says what the inline edit does with a form field: it reads and writes the form control, marks it touched, judges validity from it, focuses it and calls its `open()`. How a select or a picker behaves on its own belongs to that component's spec. The select-style editor is described as the classes and the anchoring the inline edit adds.
4. **Timings that count.** `kbqInlineEditSaveProgressDelay` (100 ms) and `kbqInlineEditSaveProgressMinimumDuration` (300 ms) are exported and stated. The 800 ms fallback of the validation tooltip is not exported but is stated, because a user sees it. "One task later" is stated for focus moves and for the value snapshot, because a consumer reading focus or the value right after the event observes it; nothing else about timers is.
5. **The focus ring is stated, its colors are not.** Which element draws the ring is accessibility behaviour that the Playwright spec asserts on the computed style; the colors of hover, active and save-error states are styling and stay out.
6. **Two documented promises the code does not keep stay out of the spec.** `disabled` does not stop `toggleMode()` or a write to `mode`, and a write to `mode` can reopen the editor during a request. The JSDoc and the docs say otherwise, so they are listed under Findings instead of being written down as contract.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/inline-edit` updates `openspec/specs/inline-edit/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:inline-edit` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [Focus and Tab behaviour depends on the browser] → jsdom does not move focus on Tab, so the chaining and select Tab-out requirements rest on the Playwright spec; they are checked in Docker, where the baselines live.
- [The spec is long: 62 requirements, 104 scenarios] → It is grouped roughly in the order of the docs page: structure and opening, the edit panel, the empty state, saving and validation, cancelling, saving to a server, the action menu, switching modes, the select-style editor, Tab and focus, accessibility, the custom value handlers and localization.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `disabled` says it prevents "mode switching". It blocks only click, Enter and Space: `toggleMode()` and a write to `mode` still open and close a disabled inline edit.
2. The docs say edit mode "cannot be reopened while the request is in flight", and the JSDoc of `toggleMode()` says it does nothing then. Both hold for the user and for `toggleMode()`, but a write to `mode` (`[(mode)]`) still opens the editor during a request.
3. "Empty state" says the system shows "Not filled" by default (`ru`: «Не заполнено»). The component renders no placeholder text: `kbqInlineEditPlaceholder` only styles what the consumer projects.
4. "An invalid value is never written through." The bound control holds the typed value from the first keystroke. A rejected save only withholds `saved` and `saveHandler`, and closing through `mode` or `toggleMode()` leaves the invalid value in the control.
5. "The field is a single tab stop." The menu button, interactive view content with its focus anchor, and controls in the label are tab stops of their own.
6. "After picking an option, the field returns to view mode" (select-style editor, twice). That is the examples' `(selectionChange)="inlineEdit.commit()"`; the page does not say the consumer has to bind it.
7. Two paragraphs describe what the examples do as if the component did it:
    - "The message doesn't hide on a timeout, and closing or dismissing it discards the unsaved value" — the inline edit shows no message;
    - blocking invalid characters with a yellow tooltip in "Validation" — that is the example's `(input)` handler.
8. The accessibility section suggests `aria-label` "wherever the projected value alone does not say what is being edited", which reads as if the value were announced. The label replaces the content as the name (see the first suspected defect).
9. The accessibility section asks for an `aria-label` on every `kbqInlineEditMenu`, but the `inline-edit-menu` and `inline-edit-disabled` examples render their menu buttons without one.
10. The JSDoc of `KBQ_INLINE_EDIT_SAVE_ERROR_HANDLER` says "Declare it in the root injector". It is resolved from the inline edit's own injector when the component is created, and the `inline-edit-save-error` example provides it on a component.
11. "Leaving edit mode returns focus to the field." Only when focus is on the page body or still in the panel: after a click outside on another focusable element, focus stays there.
12. The pages do not mention:
    - `editModeWidth`, `overlayPanelClass`, `tooltipPlacement` and `localeOverrides`;
    - the exported `kbqInlineEditSaveProgressDelay` and `kbqInlineEditSaveProgressMinimumDuration`;
    - that closing through `mode` neither saves nor cancels.
13. `KbqInlineEditMode` and the three methods of `KbqInlineEditSaveRecovery` have no JSDoc (`(undocumented)` in the golden file).

**Suspected defects (from reading the code, not reproduced)**

1. The view's `aria-label`, "Edit" by default, replaces its content as the accessible name, and the content of a `button` role is presentational. Assistive technology probably announces "Edit, button, collapsed" without the current value. The focus anchor is named the same way.
2. A focusable control in the label, or one in the view that `interactiveSelectors` does not match (a plain `button` by default), opens the editor when clicked. On Enter or Space the inline edit prevents the key's default action, which also cancels that control's own activation. The interactive-content check covers only the view, while the click filter covers the whole host with the same list.
3. With `getValueHandler` bound and no `setValueHandler`, cancelling and `rollback()` restore nothing, unless the getter returns an array: then its items are written into the form fields by index.
4. In the select-style editor without `commit()` bound to `selectionChange`, picking an option closes only the options panel. The editor stays open with its field hidden, and focus is probably left on the page body. Clicks in the options panel do not count as outside clicks of the edit panel, because the select subscribes to the outside clicks of its own overlay.
5. Selecting the text on open is guarded by `if (initialValue)`, which is always true for the default snapshot, an array. The guard only matters with `getValueHandler`, where a value of `0` or `''` skips the selection.

**Tests whose name and body disagree, or that cannot fail**

- "should not enter the error state while the value is still being typed" dispatches one `keydown` on the overlay and types nothing. A control is marked touched on blur, not on a key, so the test cannot fail through the path its name describes.
- "should stay in view mode when commit() is followed by a redundant outside-click save()" calls the protected `save()` directly. Its comment says a click on a select option also reaches the edit panel's outside-click handler; the select's own subscription makes the CDK dispatcher stop at the select's overlay, so that path looks unreachable (not reproduced).
- "should prevent close if control invalid" asserts only that `saved` did not fire, not that the editor stayed open, and it touches the control first.
- "should pass overlayPanelClass to panel" sits under "with multiple form fields" but renders the single-field host.
- "should finish a successful save after the inline edit is destroyed" asserts that `subscriptions` is 1, which holds before the response arrives. Only the fail-on-console hook guards the behaviour it names.
- "should setup with default parameters" snapshots only the host classes.
- "should toggle mode on click / space / enter" sends Space with `key: 'Space'`, which no browser sends. It matches `keydown.space` only because Angular lower-cases the key.
- The e2e "view states" test adds `cdk-focused` and `cdk-keyboard-focused` to the hosts by hand, so its screenshots show the class-driven ring and not a focus the component produced. The "keyboard" and focus-ring tests cover the real path.

**Behaviour without a test.** The spec states these from the source:

- a click on the label opens the editor, and the opening click does not propagate;
- an empty `interactiveSelectors` turns the interactive-content check off;
- the panel width: `editModeWidth`, the host width, and the inner width with a label;
- the text of the first input is selected when the editor opens;
- the accessible names of the save and cancel buttons;
- `kbqInlineEditPlaceholder` adds `kbq-inline-edit__placeholder`;
- a click on the host while editing saves without reopening;
- `showTooltipOnError` set to `false`, `tooltipPlacement`, and a template as `validationTooltip`;
- cancelling runs no validation;
- an Escape a control has already handled does not cancel;
- with `saveHandler`, an unchanged save emits no `saved`, a throwing comparator counts as a change, and emissions after the first are ignored;
- `saveErrorHandler` bound to `null`;
- cancelling does not clear the failed state;
- the menu's `role="button"`, its handling of Enter and Space, `kbq-inline-edit_with-menu`, and the menu being kept while disabled and removed in edit mode;
- closing through `toggleMode()` or `mode` neither saves nor cancels;
- Tab-out skips tab stops in other overlays, and the select Tab-out ignores Ctrl, Cmd and Alt;
- focus already moved elsewhere is not taken back;
- the view's `tabindex="-1"` in edit mode and the `a11y.edit` fallback for an empty `aria-label`;
- `kbq-inline-edit_disabled`, and a disabled inline edit not opening on click, Enter or Space;
- `setValueHandler` on cancel;
- `localeOverrides`.
