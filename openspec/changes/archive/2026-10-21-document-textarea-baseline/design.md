# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/textarea/`: the directive, the module, `textarea.scss`, the unit spec, `e2e.ts` with the Playwright spec and its baseline screenshot, and the `textarea.{en,ru}.mdx` and `examples.textarea.{en,ru}.mdx` pages;
- the docs examples under `packages/docs-examples/components/textarea/` and the dev app in `packages/components-dev/textarea/`;
- the API golden file `tools/public_api_guard/components/textarea.api.md`;
- what the directive relies on: the error state tracker and matchers, `kbqOptionalNumberAttribute`, `kbqInjectAutofilled` and `KBQ_PARENT_ANIMATION_COMPONENT` in `packages/components/core`, `KbqNativeScrollbar` in `scrollbar`, the tab group's `animationDone`, and in `form-field` the control interface, `kbq-form-field` with its template, `KbqTrim`, `trim.spec.ts` and `autofill.spec.ts`.

The research was done in one pass by reading the source, and every requirement was checked against it. The select baseline set the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the directive, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when textarea behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the measuring steps, the private members and signals, change-detection and scheduling details, CSS structure and design tokens.
- The behaviour of `kbq-form-field` beyond what it does with a textarea as its control, `kbqInput`, `kbq-inline-edit` and deprecated APIs.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the select baseline apply unchanged: one capability at the flat path `textarea`, written in English, describing what ships with its quirks, holding only behaviour confirmed by a test or read in the source, and counting public names, selectors, host classes, ARIA attributes and exported tokens as contract. The decisions below are specific to the textarea.

1. **The form field's handling of the textarea is in scope.** These are stated as textarea behaviour:
    - `kbq-disabled`, `kbq-form-field_invalid` and `kbq-form-field_autofilled` on the field;
    - the `kbq-form-field-type-textarea` class;
    - the `<label for>`, `aria-describedby` and the container click;
    - the trimming of the model value.

    The docs only ever show the textarea inside a form field, its stylesheet ships with `kbq-form-field`, and a consumer sees all of this as what the textarea does. Leaving it to a future form-field spec was considered and rejected: until that spec exists, nothing would state it for the textarea. When it lands, duplicated requirements can move with `REMOVED` and `ADDED` deltas.

2. **Sizing is described by its outcomes.** The spec states that the textarea grows and shrinks, the free space below the last line, the clamp to `maxRows` times the line height, and the classes. It does not describe how the height is measured. The clamp is the one number stated, because a unit test asserts it and it is what makes the limit visible.
3. **The spec assumes the usual setup.** That is a textarea inside `kbq-form-field`, with the Koobiq typography applied. What happens outside it is not specified; the Findings list what reading the code suggests.
4. **Members marked `@docs-private` can still be contract.** `value`, `empty`, `focused`, `autofilled`, `disabled`, `placeholder` and `id` are documentation-private, but they implement the form-field control interface, are public in the typings and are read by consumers through `exportAs` or a view query. The event handlers and the update methods are not named in the spec.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/textarea` updates `openspec/specs/textarea/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:textarea` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. The one exception is the clamp to `maxRows` times the line height: a unit test asserts it, so the spec states it, and its visible effect is listed as a suspected defect.
- [The form field's behaviour is stated twice once it has a spec of its own] → Decision 1 says how to move it.
- [The spec is 32 requirements and 54 scenarios] → It follows the order of the docs page: the directive and the form field, auto-resize, the row limit, disabled, then the value and forms, the error state, and the attributes, focus and autofill that the page does not cover.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Both overview pages present `canGrow` as something to turn on ("When the `canGrow` attribute is enabled"). It is on by default, and the overview example has to write `canGrow="false"` to get a fixed field. Neither page says that `canGrow="false"` makes the field resizable by the user.
2. The `maxRows` section does not say that the limit only applies while `canGrow` is on.
3. The JSDoc of `freeRowsHeight` calls it the distance from the last line to the bottom border. The value is added on top of the bottom padding.
4. The JSDoc of `maxRowLimitReached` says it turns true when the maximum number of lines is reached. The measured rows count the padding and the free space below the last line:
    - with the default free row, the flag turns true at `maxRows` lines of text;
    - with `freeRowsHeight` set to `0`, it turns true one line later.
5. `KbqTextarea` and `KBQ_TEXTAREA_VALUE_ACCESSOR` have no JSDoc; the golden file marks both "(undocumented)". The accessor's contract, a `value` getter and setter provided on the same element, is written down nowhere.
6. Neither page mentions:
    - the trimming of the model value and the `no-trim` attribute;
    - `errorStateMatcher`, `placeholder` and `required`;
    - the custom value accessor.
7. `examples.textarea.{en,ru}.mdx` are "documentation in progress" stubs. `structure.ts` sets `hasExamples: false`, so no route shows them.

**Suspected defects (from reading the code, not reproduced)**

1. The clamp at the row limit is `maxRows` times the line height, without the vertical padding. At the limit, fewer than `maxRows` lines are fully visible, and the field becomes shorter, by the padding, than it was one line earlier. The baseline screenshot `__screenshots__/01-light.png` is consistent with this: its "maxRows" field (`maxRows` 5) shows four full lines and a fifth one cut by the bottom border.
2. Switching `canGrow` off does not clear the minimum height set by the last measurement, so the resizable field cannot be dragged smaller than its last grown height. If the row limit had been reached, the limit state and its class stay as well, and no resize handle appears.
3. `KbqFormField.focus(options)` passes its options to the textarea, whose `focus()` takes none, so `preventScroll` and `focusVisible` are dropped.
4. The tab group is looked up only up to the host of the template that declares the textarea. A textarea inside a component placed in a tab therefore does not re-measure when the tab animation ends.
5. The measurement parses the computed `line-height` as pixels. With `line-height: normal`, for example without the Koobiq typography on the element, it gets `NaN`: the textarea stops growing and `maxRows` never triggers. The unit spec's own helper notes that jsdom is in this state.
6. The textarea's stylesheet is carried by `kbq-form-field`, because a directive cannot carry styles. A `kbqTextarea` outside any form field, on a page where none has rendered yet, gets none of the `kbq-textarea` rules and shows the browser's resize handle while it grows.
7. Each measurement inserts a shallow copy of the element next to it and removes it again. For that moment two elements share the textarea's `id`, and a `MutationObserver` on the field sees two mutations per keystroke.

**Tests whose name and body disagree, or that cannot fail**

- "in form › should not run validation (required)" checks the field before `NgForm` registers the control, which happens asynchronously. Validation does run once the control is registered.
- "in form › should run validation after submit (required)": the `ng-invalid` class follows the control's validity, not the submit. The test would probably pass without the click.
- "should not have kbq-textarea_max-row-limit-reached class when maxRows is not exceeded" cannot fail in jsdom. Without a measured line height the row count stays at 0, as the spec's own `measuredLineHeight` helper explains.
- "should defer grow to microtask so lineHeight is initialized before first grow call" never checks the line height. It checks that the measurement after an input event is deferred.
- "should drop the grows still pending when the textarea is destroyed" asserts only that the element left the DOM. It fails only through an uncaught error from a late measurement.
- "async validation › should emit VALID via statusChanges on blur": `VALID` comes from `setValue` and the timer. The blur part calls the handler directly, so there is no DOM blur and the control is not touched. It then checks that nothing more is emitted.
- 'should change "disabled" state' binds `[disabled]` together with `[(ngModel)]`, so the state reaches the textarea through `NgModel`'s control. The `disabled` input on its own is never tested.
- The comments in "should report the bound canGrow rather than folding in the row limit" describe change history ("The old getter returned …").

**Behaviour without a test.** The spec states these from the source:

- the `kbq-native-scrollbar` host class and `exportAs`;
- the `kbq-form-field-type-textarea` class and focusing on a container click;
- the free space below the last line and the single-line minimum; the baseline screenshot shows the free row;
- `kbq-textarea-resizable` at the row limit, growth resuming below the limit, and the limit never reached with `canGrow` off;
- the `disabled` input without a form, the precedence of the form control's disabled state, and disabling clearing the focus state;
- reading back a value written by a form with `emitEvent: false`, the `[value]` binding and `empty()`;
- `no-trim` and the unchanged displayed text on a textarea; both are tested on `kbqInput` only;
- `aria-invalid`, plus `kbq-form-field_invalid` and the rendered `kbq-error` for a textarea (only the screenshot shows them);
- no error state without a form directive, and the `errorStateMatcher` input taking precedence over the provider;
- the generated and custom id and the `<label for>`;
- `aria-describedby`, which is tested on `kbqInput` only;
- `focus()` and `focused()`;
- server rendering.
