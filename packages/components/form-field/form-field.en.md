`<kbq-form-field>` is a component used to create forms and input fields with support for styling and additional features.

The following components are intended to work inside the `<kbq-form-field>` component:

- [Autocomplete](/en/components/autocomplete)
- [Input](/en/components/input)
- [Select](/en/components/select)
- [Tag autocomplete](/en/components/tag-autocomplete)
- [Tag input](/en/components/tag-input)
- [Textarea](/en/components/textarea)
- [Timepicker](/en/components/timepicker)
- [Timezone](/en/components/timezone)
- [Tree select](/en/components/tree-select)

### Label

<!-- example(form-field-with-label) -->

### Hints

`<kbq-hint>` is a component used to add hints to form fields inside the `<kbq-form-field>` component.
Hints can be useful for providing additional information on how to fill out the field, what data is expected,
or for displaying additional instructions.

<!-- example(form-field-with-hint) -->

### Error messages

`<kbq-error>` is a component used to display validation error messages for form fields inside the `<kbq-form-field>` component. Errors are initially **hidden** and will be displayed **only** for invalid form fields after user interaction or form submission.

<div class="kbq-callout kbq-callout_warning">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

For the component to work correctly, it is necessary to disable the deprecated [`KbqValidateDirective`](https://github.com/koobiq/angular-components/blob/main/packages/components/form-field/validate.directive.ts).

```ts
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';

@NgModule({
    providers: [kbqDisableLegacyValidationDirectiveProvider()]
})
```

</div>
</div>

<!-- example(form-field-with-error) -->

### Changing error message display behavior

By default, error highlighting and messages are displayed for **invalid** fields after user interaction (touched or form submitted) with the form element. This behavior can be overridden using [ErrorStateMatcher](https://github.com/koobiq/angular-components/blob/main/packages/components/core/error/error-state-matcher.ts), which provides the ability to flexibly configure the logic for highlighting and displaying validation errors, allowing you to adapt the behavior of input fields to the specific requirements of the application.

You can use one of the built-in `ErrorStateMatcher`, or write your own implementation:

```ts
/**
 * Highlights and displays an error for an invalid field after form submission
 * Copy of ShowOnFormSubmitErrorStateMatcher: https://github.com/koobiq/angular-components/blob/main/packages/components/core/error/error-state-matcher.ts
 */
class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control?.invalid && form?.submitted);
    }
}
```

Override

For a specific field, using the `errorStateMatcher` attribute:

<!-- example(form-field-with-custom-error-state-matcher-set-by-attribute) -->

For all fields, using the `ErrorStateMatcher` token:

<!-- example(form-field-with-custom-error-state-matcher-set-by-dependency-injection-provider) -->

### Field cleaning

`<kbq-cleaner />` is a component that adds a clear button for **filled** form fields inside the `<kbq-form-field>` component.

<!-- example(form-field-with-cleaner) -->

### Prefix and suffix

`kbqPrefix` and `kbqSuffix` are directives that allow adding custom elements **before** and **after** the form field inside the `<kbq-form-field>` component. These directives are useful for adding icons, text, buttons, and other elements that should be placed next to the form field.

<!-- example(form-field-with-prefix-and-suffix) -->

### Focus

In text input fields, a blue border is always displayed when focused, regardless of the activation method (mouse, keyboard, or touch).
For form elements with dropdown lists (such as: [select](/en/components/select), [timezone](/en/components/timezone), and [tree select](/en/components/tree-select)),
the focus border is shown only during keyboard navigation (using the `Tab` key) and is hidden when the dropdown list is opened.

### Disabling borders

For a specific field, using the `noBorders` attribute:

<!-- example(form-field-without-borders) -->

For all fields, using the `KBQ_FORM_FIELD_DEFAULT_OPTIONS` token:

```ts
import { kbqFormFieldDefaultOptionsProvider } from '@koobiq/components/form-field';

@NgModule({
    providers: [
        kbqFormFieldDefaultOptionsProvider({ noBorders: true })
    ]
})
```

### Password input field

`<kbq-password-toggle>` is a component that adds a _"Show password"_ button for **filled** `<input kbqInputPassword />` fields inside the `<kbq-form-field>` component.

`<kbq-password-hint>` is a component used to add hints to the `<input kbqInputPassword />` field inside the `<kbq-form-field>` component.

The example uses [PasswordValidators](https://github.com/koobiq/angular-components/blob/main/packages/components/core/forms/validators.ts) - a set of static methods for password validation.

<!-- example(form-field-password-overview) -->

### Troubleshooting

#### Error: kbq-form-field must contain a KbqFormFieldControl

This error occurs when `<kbq-form-field>` does not contain a form field, such as `<input kbqInput />` or its import `KbqInputModule`.

#### Error: kbq-password-toggle should use with kbqInputPassword

This error occurs when `<kbq-password-toggle>` cannot find the `<input kbqInputPassword />` field or its import `KbqInputModule`.

#### Error: kbq-stepper should use with kbqNumberInput

This error occurs when `<kbq-stepper>` cannot find the `<input kbqNumberInput />` field or its import `KbqInputModule`.
