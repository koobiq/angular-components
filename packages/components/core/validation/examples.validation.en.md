## Validation methods

Angular validators define **what** is invalid — they set error keys on the `FormControl` (`required`, `minlength`, etc.). They do not control **when** those errors are shown to the user. Without any additional mechanism, errors would appear immediately when the page loads, before the user has touched anything.

Koobiq solves this with two mechanisms. `ErrorStateMatcher` is the current recommended approach. `KbqValidateDirective` is a deprecated legacy alternative.

### ErrorStateMatcher

`ErrorStateMatcher` is a pure display policy. It reads the control's existing errors and the form's submission state, then answers a single question: **should the error be visible right now?**

Validators and the `FormControl` remain unchanged — `ErrorStateMatcher` never adds or removes errors. It only decides when `kbq-form-field` should reveal the `<kbq-error>` children and apply the `kbq-invalid` CSS class.

**Registration:**

Apply a matcher to all controls inside a component via providers:

```ts
providers: [
    kbqDisableLegacyValidationDirectiveProvider(),
    kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)
];
```

Override for a single control using the `[errorStateMatcher]` input (supported by `kbq-tag-list`, `kbq-file-upload`, and similar):

```html
<kbq-file-upload [errorStateMatcher]="myMatcher" ... />
```

### KbqValidateDirective (deprecated)

The directive controlled error display by patching methods on `NgForm` and `FormGroupDirective`. Method patching creates implicit dependencies between components in the form tree and is fragile against Angular upgrades. `ErrorStateMatcher` solves the same problem without side effects.

The directive is **deprecated and will be removed in the next major release**. Always disable it explicitly:

```ts
providers: [kbqDisableLegacyValidationDirectiveProvider()];
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
