# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/form-field/`: the component, its template and styles, `cleaner.ts`, `password-toggle.ts`, `reactive-password-hint.ts`, `stepper.ts`, `fieldset.ts`, `hint.ts`, `error.ts`, the label, prefix and suffix directives, `form-field-control.ts`, the module, the unit specs (`form-field.spec.ts`, `autofill.spec.ts`, `fieldset.spec.ts`, `trim.spec.ts`), `e2e.ts` and `e2e.playwright-spec.ts`;
- the `form-field.{en,ru}.mdx` pages, the examples under `packages/docs-examples/components/form-field/`, the fieldset examples under `packages/docs-examples/components/forms/` and the "Grouped fields" section of `core/forms/forms.en.mdx`;
- the API golden file `tools/public_api_guard/components/form-field.api.md`;
- what the form field relies on elsewhere: `KbqColorDirective`, the a11y locale strings, `KBQ_FORM_FIELD_REF` and `KBQ_CONNECTED_OVERLAY_ORIGIN` and the error state matchers in `core`, `KbqIcon` and `KbqIconButton`, `KbqTooltipTrigger`, and `KbqInput`, `KbqInputPassword` and `KbqNumberInput`;
- the specs of other entry points that exercise the form field: `input-number.spec.ts`, `input-password.spec.ts`, `input.spec.ts` and `inline-edit.spec.ts`.

Every claim in the spec was checked against the source. The general approach follows the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`).

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the form field, and every scenario can be checked by an existing test or by hand in a dev app.
- One place to diff against when form-field behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Behaviour that belongs to the wrapped control: how `kbqInput` computes its error state and `aria-invalid`, the keyboard of `kbqNumberInput`, the `type` attribute handling of `kbqInputPassword`.
- Cleaners hosted by `kbq-select`, `kbq-tree-select`, `kbq-timezone-select` or `kbq-tag-list`, which supply their own cleaner context.
- Visual styling and design tokens: the autofill tint, the focus ring, the geometry of control groups and of `kbq-fieldset`, and the "Focus" section of the docs page, even though most of the Playwright spec is about them.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the select baseline apply unchanged: one capability at a flat path named after the entry point, English, quirks described as they ship, only confirmed behaviour in the spec, and the same definition of what counts as contract. Decisions specific to this change:

1. **One capability for the whole entry point.** The cleaner, the password toggle, the reactive password hint, the stepper, the fieldset and the trimming directive ship in `@koobiq/components/form-field` and all but the fieldset depend on the form field's control slot. Separate capabilities per element were considered and rejected: a change to the control slot or to the error state would touch most of them at once.
2. **The form field shows what the control reports.** The spec states what the form field does with the control's state (classes, rendering of errors, `aria-describedby`) and leaves the computation of that state to the control. The error timing requirements are the exception: they are what a consumer observes through the form field, the form-field spec tests them, and they are worded for the library's controls.
3. **Public members marked `@docs-private` count when a consumer reaches them and a test relies on them.** `clear(event)`, `toggle(event)`, `KBQ_FORM_FIELD`, `labelId`, `getConnectedOverlayOrigin()` and the trimming directive are in. Plumbing such as `shouldForward`, `runFocusMonitor`, `canShowCleaner` and `hasFocus` is not.
4. **Quirks stay as they ship.** Examples:
    - the password toggle is visible on an empty field, despite the docs;
    - a `kbq-error` inside a `kbq-fieldset` is always rendered;
    - `no-trim` works only as a static attribute;
    - the cleaner's error message mentions `type="number"` although it is thrown for any `kbqNumberInput`.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/form-field` updates `openspec/specs/form-field/spec.md` with a delta, reviewed like the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:form-field` or `yarn run dev:input` before archiving. A mismatch is corrected in the delta, not in the code.
- [Several requirements are backed only by the specs of other entry points (`input-number`, `input-password`, `inline-edit`)] → tasks.md runs those suites too. A change there can break the form-field contract without touching this directory.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings.
- [The spec is long: 64 requirements, 97 scenarios] → It follows the docs page (control, label, hints, errors, cleaner, prefix and suffix, focus, borders, autofill, password) and then the parts the page does not cover (stepper, fieldset, trimming, overlay origin, custom controls).

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The docs page (both languages) says `kbq-password-toggle` adds its button for **filled** password fields. The toggle is shown whenever the control is enabled, empty included; the unit snapshots show it visible on an empty field.
2. The Troubleshooting headings quote "kbq-password-toggle should use with kbqInputPassword" and "kbq-stepper should use with kbqNumberInput". The thrown messages are "You should use kbq-password-toggle with kbqInputPassword" and "You should use kbq-stepper with kbqNumberInput", so a search for the real message finds nothing.
3. The cleaner's error says "You can't use kbq-cleaner with input that have type=\"number\"". It is thrown for any `kbqNumberInput`, which renders `type="text"`, and the Troubleshooting section does not list it.
4. The JSDoc of `KbqCleaner` says it "resets form control by click". It also clears on Enter, Space and Escape, and resets nothing when the control has no form directive.
5. The docs page tells consumers to use `KBQ_FORM_FIELD_DEFAULT_OPTIONS`, but the token is marked `@docs-private`, so the API tab hides it. Likewise `kbqTooltipNotHidden` is `@docs-private` while its pair `kbqTooltipHidden` is documented; `tabindex` of the toggle has no description.
6. `KbqTrim` is `@docs-private` and listed under "Legacy components" in `KbqFormFieldModule`, yet it trims every `kbqInput` and `kbqTextarea` value wherever the module, `KbqInputModule` or `KbqTextareaModule` is imported. No page mentions trimming or `no-trim`.
7. The docs page says nothing about:
    - Escape clearing a field that has a cleaner, and Alt+F8 toggling the password;
    - `kbq-stepper`, `labelClass`, `contentClass` and `inOverlay`;
    - the reactive password hint staying neutral until the control is touched or edited, whatever `[hasError]` says.

**Suspected defects (from reading the code, not reproduced)**

1. A cleaner next to a control without a form directive (`<input kbqInput>` with no `ngModel` or `formControl`) appears once text is typed, but activating it only focuses the input: it resets the form control, and there is none.
2. The Escape handler of the cleaner listens on the form-field host, ignores `defaultPrevented` and stops propagation. With an open autocomplete panel in a filled field, Escape seems to clear the value, and the key never reaches the overlay that would close the panel. Inside a modal, Escape in a filled field clears it instead of closing the modal.
3. The `kbq-form-field-type-<type>` class and the subscription that refreshes the forwarded `ng-*` classes are set up once, for the first control. A control swapped in later keeps the old type class, and its `ng-*` classes refresh only when something else checks the view.
4. The forwarded `ng-*` classes are read outside the reactive graph. A state change with no value change and no event inside the field, such as `markAllAsTouched()` called from another component, may not reach the host classes until the next check of the parent view.
5. The password toggle combines `aria-pressed` with a label that flips between "Show password" and "Hide password", so a screen reader can announce "Hide password, pressed" for a shown password. A toggle button should keep one label.
6. The hints and errors of a `kbq-fieldset` are not referenced by any `aria-describedby`: neither the group nor its controls point to them.
7. The fieldset examples and test fixtures use `<legend kbqLegend>` inside `kbq-fieldset`, which is not a native `<fieldset>`, so the markup does not conform to HTML.

**Tests whose name and body disagree, or that cannot fail**

- `form-field.spec.ts`:
    - "should hide KbqPasswordToggle initially" records a snapshot in which the toggle is visible (`visibility: visible`, `aria-hidden="false"`).
    - "should display KbqPasswordToggle by input" records the same toggle state as the initial snapshot, so it cannot detect the transition its name describes.
    - "should clean field by KbqCleaner on Space" duplicates the `' '` case of "should clean field by KbqCleaner on %s" in the accessibility block.
- `input-number.spec.ts`:
    - "should throw an exception with kbq-cleaner" checks that a fixture without a cleaner renders none; it never expects a throw.
    - "should have stepper on focus" dispatches a focus event that plays no part: the stepper is rendered whatever the focus.
- `input-password.spec.ts` "should change visibility of toggle if form field disabled and empty" flips `disabled` and the value together; only `disabled` drives the toggle's visibility.
- `e2e.playwright-spec.ts`: "cleaner owns pointer and keyboard clearing" uses only the keyboard. Its fixture sets `ariaLabel="Clear text"` on `kbq-cleaner`, which is not an input (the input is `aria-label`) and is never asserted.

**Behaviour without a test.** The spec states these from the source:

- the form field throwing when its control is removed after initialization;
- the `id` of a native `<label>`, and the hint area being absent without hints, errors or reactive hints;
- the hint `color` input and its `[kbq-icon]` slot, and the form field's own `color` class;
- consumer ids kept in `aria-describedby`, and `setDescribedByIds` (no control in the library implements it);
- the cleaner hidden for a disabled control, Escape ignored in an empty field and stopped in a filled one, the cleaner's `aria-label` input, `localeOverrides` and the `en-US` string;
- the prefix and suffix areas being absent without content, and the order inside the suffix area;
- a click on the container focusing the control, and the focus-origin classes (only `cdk-focused` is asserted);
- a bound `noBorders` winning over the default options, and `inOverlayChange`;
- the password toggle's missing-input error, icon error color, projected content, tooltips, `tabindex` input and `localeOverrides`, and its doing nothing while disabled;
- the stepper's missing-input error, keeping focus when an arrow is pressed, and `aria-hidden` with `tabindex="-1"` on its arrows;
- trimming applied through `KbqFormFieldModule`, `KbqInputModule` and `KbqTextareaModule`, and `no-trim` working only as a static attribute;
- the container as the default overlay origin, checked only indirectly by the autocomplete panel-position tests;
- custom controls beyond the labelling case.
