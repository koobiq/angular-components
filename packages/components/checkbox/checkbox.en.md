### Dual-state

Dual-state is applied using the boolean attribute `[checked]` to show whether the checkbox is checked or not.

<!-- example(checkbox-overview) -->

### Indeterminate state (partial selection)

The indeterminate state is applied using the boolean attribute `[indeterminate]` and can be used when you have a group of options and a higher-level checkbox should reflect their state:

- If only some options in the group are selected, the higher-level checkbox appears partially selected (`[indeterminate]="true"`).
- If all are selected, the higher-level checkbox is shown as checked.
- If none are selected, the higher-level checkbox appears unchecked.

<!-- example(checkbox-indeterminate) -->

### Click action config

When the user clicks on a `kbq-checkbox`, the default behavior toggles the `checked` value and sets `indeterminate` to `false`.
This behavior can be configured by <a href="https://angular.io/guide/dependency-injection" target="_blank">providing a new value</a> for `KBQ_CHECKBOX_CLICK_ACTION` on the checkbox.

```
providers: [
    { provide: KBQ_CHECKBOX_CLICK_ACTION, useValue: 'check' }
]
```

Possible values: noop, check, check-indeterminate

### Pseudo checkbox

<!-- example(pseudo-checkbox) -->

### Multiline

<!-- example(checkbox-multiline) -->
