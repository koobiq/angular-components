## Validation methods

Angular validators define **what** is invalid — they set error keys on the `FormControl` (`required`, `minlength`, etc.). They do not control **when** those errors are shown to the user. Without any additional mechanism, errors would appear immediately when the page loads, before the user has touched anything.

Koobiq solves this with `ErrorStateMatcher`.

### ErrorStateMatcher

`ErrorStateMatcher` is a pure display policy. It reads the control's existing errors and the form's submission state, then answers a single question: **should the error be visible right now?**

Validators and the `FormControl` remain unchanged — `ErrorStateMatcher` never adds or removes errors. It only decides when `kbq-form-field` should reveal the `<kbq-error>` children and apply the `kbq-invalid` CSS class.

**Registration:**

Apply a matcher to all controls inside a component via providers:

```ts
@Component({
    providers: [kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)]
})
```

Override for a single control using the `[errorStateMatcher]` input (supported by `kbq-tag-list`, `kbq-file-upload`, and similar):

```html
<kbq-file-upload [errorStateMatcher]="myMatcher" ... />
```

## Displaying errors

### Single validator

<!-- example(validation-basic-single-validator) -->

### Multiple validators

<!-- example(validation-basic-multiple-validators) -->

## Components

**Tag list**

`kbq-tag-list` supports `ErrorStateMatcher` and integrates with `kbq-form-field` the same way as other controls.

<!-- example(validation-tag-list) -->

### File upload

File upload components support `ErrorStateMatcher` but have their own layout outside of `kbq-form-field`, so error output is handled differently from input-based controls. See all validation examples on the [File upload](/en/components/file-upload) page.

## Custom ErrorStateMatcher

Use `ShowRequiredOnSubmitErrorStateMatcher` when you need split behavior:

- If the field is empty, don't show the `required` error until the form is submitted.
- If the field is filled, validate it on blur.

<!-- example(validation-on-submit-custom-matcher) -->

## Cross-field validation

A cross-field rule — "confirm the password", "the new password must differ from the old one", "the end date
must not precede the start date" — compares several controls, so the natural place for it is a validator on
the `FormGroup`.

### Why a FormGroup error highlights nothing

`<kbq-error>` and the red border are driven by the **control's** `errorState`, which is the return value of
`ErrorStateMatcher.isErrorState(control, form)`. The `control` passed in is the field's own `FormControl`, so
an error that lives on the group is invisible to it: the group is invalid, the message can be rendered by
hand, and yet no field is marked.

This is a display rule, not a bug — and it is also where the fix belongs. Validators decide **what** is
invalid; the matcher decides **when and where** to show it.

### Recommended pattern

Keep the validator on the group, and teach the matcher to read the group's errors. For that, the validator has
to say which controls its error applies to:

```ts
return { matchAll: { controls: ['newPassword', 'confirmPassword'] } };
```

A group's own `errors` only ever holds errors set by validators attached to the group itself, never its
children's, so `control.parent?.errors` is exactly the cross-field error set. The matcher resolves the
control's name among its siblings and checks whether the error names it.

One rule matters more than the rest: show the error only once **every** control it names is `touched` (or the
form is submitted). While the user is still typing the second value, the pair is always "wrong", and
highlighting it at that point is noise. With this rule the group lights up on blur, and all the fields the
rule connects light up together.

<!-- example(validation-cross-field-password) -->

Because the contract is the array of control names, the same matcher serves any number of fields and any
number of rules on the same group. Only the validator changes:

```ts
// The listed controls must be in ascending order.
const exampleOrder =
    (controls: string[]): ValidatorFn =>
    (group: AbstractControl): ValidationErrors | null => {
        const values = controls.map((name) => group.get(name)?.value);
        const ordered = values.every((value, index) => index === 0 || values[index - 1] <= value);

        return ordered ? null : { order: { controls } };
    };
```

### Comparing values that are not primitives

Strict equality is right for strings and numbers, and wrong for everything with an identity. Two `Date`s,
Luxon `DateTime`s or Moment objects standing for the same moment are different references, so `===` reports
them as different and an equality rule would always fail — silently, with a plausible-looking message. The
rules in the example take a comparator for exactly this:

```ts
exampleMatchAll(['startDate', 'endDate'], (a, b) => adapter.sameDate(a as D, b as D));
```

`DateAdapter` provides `sameDate()` for equality and `compareDate()` / `compareDateTime()` for ordering.
The same applies to any object value — arrays from a tag list, options from a select.

Once a field has entered the error state, it is re-validated as the user types — the error disappears as soon
as the value is corrected. That is the [general rule](/en/other/validation) for every field in the library,
and cross-field rules are no exception.

### Controls without an ErrorStateMatcher

`kbq-file-upload` is covered: it resolves the matcher through the same DI token and highlights itself from the
same `errorState`. It only renders messages differently — there is no `<kbq-error>` projection, so the
visibility of a `<kbq-hint>` is up to you, which for a cross-field rule is simpler rather than harder.

`kbq-checkbox`, `kbq-radio`, `kbq-toggle` and `kbq-button-toggle` have no error state at all. A rule involving
them cannot be surfaced through a matcher; report it in an alert above the form, or bind the class yourself.

### When not to use it

For "at least one of these fields must be filled", the guidelines ask you **not** to mark the fields as
invalid and to show a general alert above the form instead. See the
[validation guide](/en/other/validation) and its "One required field from several" example.

### Alternative: a validator directive on the dependent control

The other option is to keep the error on the control itself. The catch is that the rule depends on a control
the field does not own, so editing that control has to re-run the validator. `registerOnValidatorChange` is
the sanctioned hook for this: the callback Angular passes in re-validates the host control, so the link is
declarative and is torn down with the directive, instead of an `updateValueAndValidity()` subscription living
in the component.

The error then lands on the dependent control, and the default `ErrorStateMatcher` highlights it with no extra
wiring — at the cost of marking only that one field.

<!-- example(validation-cross-field-directive) -->

### Timing

The matcher answers "when to show". If you also need to control "when to validate", these are the tools:

**`updateOn: 'blur'`** — per control or for the whole group at once:

```ts
new FormGroup({ ... }, { updateOn: 'blur' });
```

The validator stops running on every keystroke, but the model now lags behind the input: live feedback such as
`kbq-reactive-password-hint` freezes until the field is left. Mixing the strategies per control is the usual
compromise.

**`AbstractControl.events`** — a single stream of `ValueChangeEvent`, `TouchedChangeEvent`,
`PristineChangeEvent`, `StatusChangeEvent`, `FormSubmittedEvent` and `FormResetEvent`. It is the only
supported way to react to a change of `touched`, which is exactly what the display timing of a cross-field
error depends on. Combined with `toSignal` it gives a signal-based error text:

```ts
readonly events = toSignal(this.form.events);
readonly mismatch = computed(() => (this.events(), this.form.hasError('matchAll')));
```

**`addValidators` / `removeValidators` / `hasValidator`** — for rules that switch on and off, instead of
rebuilding the group.

**Asynchronous rules** put the group into `pending` while the request is in flight. Pair them with
`updateOn: 'blur'`, otherwise every keystroke starts a request.

### Pitfalls

**Do not push a group error down into the children with `setErrors`.** It replaces the whole errors object,
and the next run of the child's own validators wipes it out.

**A validator reading `control.parent.get('sibling')` gets `null` while the `FormGroup` is being
constructed** — the sibling is not registered yet. Always guard.

**The error state is recomputed when the host view is checked.** As long as the fields share a template,
typing in one marks the view dirty and the others re-evaluate themselves. If the fields live in separate
`OnPush` components, a change in one does not reach the others: a group-level error makes neither
`valueChanges` nor `statusChanges` fire on the sibling controls. Subscribe to the group's `statusChanges` and
call `markForCheck()` in that case.

### Limits of the pattern

The pattern scales over the number of fields, because the contract is the array of names. It has edges
elsewhere, and they are easier to design around than to debug:

**One level of nesting.** The matcher reads `control.parent?.errors` and resolves names among the immediate
siblings. A rule placed on the root group whose controls sit in a nested `FormGroup` does not reach them, and
a path like `'passwords.newPassword'` does not resolve. In a `FormArray` the names are the indices, so they
shift whenever a row is inserted or removed.

**"All touched" is the wrong gate for a prefilled field.** In "start date must not follow end date" with the
end prefilled, a user who only edits the start never touches the end, so the error waits for the submit. Rules
over fields the user is not expected to visit need a different gate — "at least one touched", or the one that
was edited.

**The empty-value check is string-shaped.** `null`, `undefined` and `''` are treated as "not filled yet";
`[]` from a tag list and `false` from a checkbox are not, and go into the comparison as real values. (`0` is
deliberately a real value.)

**The payload is mandatory.** A group error without a `controls` array — a server-side `form.setErrors(...)`,
for one — is ignored by the matcher. Nothing breaks, but nothing is highlighted either.

**Two independent forms have no common parent**, so a rule connecting them is outside this mechanism
altogether.
