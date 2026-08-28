A date field (datepicker) is a special input field with a widget for selecting a date.

<!-- example(datepicker-overview) -->

### States

#### Inactive field

<!-- example(datepicker-inactive) -->

### Required

If the date field is required, use the `required` parameter.

<!-- example(datepicker-required) -->

### Usage examples

#### Date selection restriction

The range is configured with two separate pairs of bindings, and both are needed:

- `minDate` / `maxDate` on `<kbq-datepicker>` restrict the calendar — out-of-range days are
  not selectable.
- `min` / `max` on the `<input>` drive validation, including dates typed with the keyboard or
  pasted. A value outside the range is still written to the form control, and the control is
  marked invalid with `kbqDatepickerMin` or `kbqDatepickerMax`.

Validation requires a form control on the input (`ngModel`, `formControl` or `formControlName`) —
without one the validators never run.

`min` and `max` are compared with the time part included rather than by calendar day, because the
input keeps the time of the value it parses. Set the lower bound to the start of the first allowed
day and the upper bound to the end of the last allowed day, so that both boundary days stay valid.

<!-- example(datepicker-minimax) -->

#### Date range

There is no dedicated date range widget, so use separate input fields to specify the boundaries.

<!-- example(datepicker-range) -->

#### Using Datepicker and Timepicker together

<!-- example(datepicker-and-timepicker) -->
