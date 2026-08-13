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

<!-- example(form-field-overview) -->

### Horizontal form

To create a horizontal form, add the `horizontal` attribute to the `<kbq-form-field>` component.

<!-- example(form-field-horizontal) -->

### Hints

`<kbq-hint>` is a component used to add hints to form fields inside the `<kbq-form-field>` component.
Hints can be useful for providing additional information on how to fill out the field, what data is expected,
or for displaying additional instructions.

<!-- example(form-field-with-hint) -->

### Error messages

`<kbq-error>` is a component used to display validation error messages for form fields inside the `<kbq-form-field>` component. Errors are initially **hidden** and will be displayed **only** for invalid form fields after user interaction or form submission.

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

For a full explanation of both approaches, built-in matchers, and component-specific patterns (tag list, file upload), see the [Validation](/en/other/validation) guide.

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

### Autofill

When the browser fills a field in, it is tinted with `--kbq-form-field-states-autofill-background`, so an autofilled field looks the same in every browser: the browser's own background is suppressed and its text color is repainted. The tint goes on the field, never on the control itself — the control stays transparent, so the tint is never applied twice.

The tint is the weakest state: `focused`, an error, `disabled` and `inOverlay` all win over it. `noBorders` does not win over it, because it is not a state — it only makes the border transparent, so an autofilled `noBorders` field keeps the tint. The tint is applied in CSS, in the same style pass the browser fills the value, so it appears together with the text. The state is also tracked by the CDK's `AutofillMonitor`, which adds `kbq-form-field_autofilled` on `<kbq-form-field>` and makes it readable from code — `KbqInput`, `KbqInputPassword`, `KbqTextarea` and `KbqTagInput` (forwarded by `KbqTagList`) expose an `autofilled` signal:

```ts
@ViewChild(KbqInput) input: KbqInput;

// ...

const filledByBrowser = this.input.autofilled();
```

To change the tint or switch it off, override the tokens on the field — no `!important` needed:

```css
.my-form-field {
    /* look exactly like a normally filled field */
    --kbq-form-field-states-autofill-background: var(--kbq-form-field-default-background);
    --kbq-form-field-states-autofill-text: var(--kbq-form-field-default-text);
}
```

| Token                                           | Applies to                                                                                                                                                                                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--kbq-form-field-states-autofill-background`   | field background                                                                                                                                                                                                                                              |
| `--kbq-form-field-states-autofill-border-color` | field border, the same as the default border unless overridden                                                                                                                                                                                                |
| `--kbq-form-field-states-autofill-text`         | value text and caret                                                                                                                                                                                                                                          |
| `--kbq-form-field-states-autofill-placeholder`  | placeholder — normally hidden, since an autofilled field has a value. It shows if the value is cleared programmatically (for example by `<kbq-cleaner>`) while the browser still marks the field autofilled, so keep it as legible as the default placeholder |

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
