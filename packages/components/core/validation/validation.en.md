<div class="kbq-callout kbq-callout_warning">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Form elements use the [`KbqValidateDirective`](https://github.com/koobiq/angular-components/blob/main/packages/components/form-field/validate.directive.ts), which overrides form methods (`Validators`, `onSubmit`), and this may lead to _"unpredictable"_ behavior.

</div>
</div>

### Disabling KbqValidateDirective

```ts
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';

@NgModule({
    providers: [kbqDisableLegacyValidationDirectiveProvider()]
})
```

### Summary

- The submit button is never disabled
- Invalid character input is reported as it's typed
- Error messages are shown on blur (focus loss)
- Empty required fields don't show errors on blur
- Fields already in error state are validated as user types

### Opening the form

Focus is placed on the first field. Unfilled fields are not highlighted in red by default. An exception is a saved draft with already-visible errors that the user resumes filling.

<!-- example(validation-on-open) -->

### Required fields

Required fields are not marked as such if most of the fields are required. Optional fields can be labeled with a tag or placeholder like “Optional.” It's even better to explain why filling in this info is helpful to the user.

<!-- example(validation-optional-label) -->

Some fields can go unmarked as optional if their auxiliary purpose is obvious. For example, “Description.”

If most fields in the form are optional, then the few required ones should be marked. You can add a red asterisk after the label or a gray “Required” tag below the field. Don't use multiple methods for indicating required fields in the same form.

<!-- example(validation-required-label) -->

### When to validate for errors

There are three main strategies for validation:

1. While typing
2. On blur (when leaving the field)
3. After submitting the form

#### While typing

Used to check for valid characters. Invalid characters are filtered out during input, and an error tooltip is shown near the cursor. The message disappears when a valid character is entered or the field loses focus.

<!-- example(validation-on-type) -->

#### On blur

For fields with complex requirements (like IP address or email), they shouldn't enter an error state during typing to avoid distracting the user. Validation is done on blur — the field is marked invalid and an error message appears beneath it.

<!-- example(validation-on-blur) -->

Empty fields are not validated on blur.

Real-time validation works for fields already marked as invalid. If the value is corrected, the error message disappears and the field is restored to normal state.

Invalid fields remain styled as such if the user leaves the field without correcting the error.

<!-- example(validation-on-blur-filled) -->

#### On form submission

Used for checking empty required fields and things that can't be validated client-side.

The submit button is **not disabled**, even if the form is empty or contains invalid fields. When clicked, validation and submission are triggered. The button enters a **Progress** state during submission. You can also display a [Loader Overlay](/ru/components/loader-overlay) over the form during this time.

If validation fails, focus is set to the first field with an error. If the error isn't tied to a specific field, show an alert above the form and focus on it — ensuring visibility even if the form's top section is off-screen.

If the same alert message remains valid on repeated submissions, don't hide and re-show it — instead, fade it out and back in while re-focusing.

<!-- example(validation-on-submit) -->

### Error messages

#### Field-specific message

Field-level error messages are shown below the field, **before** any helper text. If the error message duplicates the helper text, you can replace one with the other.

<!-- example(validation-message-for-specific-field) -->

You don't always need to display an error message just for a required field — marking it as invalid may be enough.

<!-- example(validation-no-message) -->

#### Global message

General form errors are shown in an alert **above the first field** and focused. The alert appears higher than any informational blocks above the form fields.

In this example, the message appears after clicking the submit button. For mouse users, scrolling to the alert is enough — no need to show a visible focus outline. If the button is activated via keyboard, show a visible focus outline on the alert.

<!-- example(validation-message-global) -->

#### One required field from several

Some forms require at least **one** of several fields to be filled. In this case, fields aren't marked as invalid after submission. Instead, a general error alert appears above the form. You can list the problematic fields and include pseudo-links to move focus to them.

<!-- example(validation-message-global-with-links) -->
