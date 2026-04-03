<!-- example(validation-tag-list) -->

### Custom ErrorStateMatcher

Use `ShowRequiredOnSubmitErrorStateMatcher` when you need split behavior:

- If the field is empty, don't show the `required` error until the form is submitted.
- If the field is filled, validate it on blur.

<!-- example(validation-on-submit-custom-matcher) -->
