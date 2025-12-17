A time field (timepicker) is a special input field that allows entering only time.

### When to use

Use when you need to specify time.

<!-- example(timepicker-validation-symbols) -->

### Component structure

Consists of an input field, mask, and icon (optional).

#### Variations

The input mask comes in two variations, with different time formats:

<!-- example(timepicker-variations) -->

### How it works

Time can be entered in two ways: using number keys and using arrow keys on the keyboard. Time input is only allowed in 24-hour format.

When entering values, depending on where the focus is (hours, minutes, or seconds), the field validates acceptable values at that position: hours 0–23, minutes and seconds 0–59.

After entering two digits (hours or minutes), a colon is inserted, and the cursor jumps to the next part of the mask (to minutes or seconds). After entering two digits for seconds, the cursor does not change position, and no colon is inserted.

#### Input using arrows

The ↑ ↓ keys increase or decrease the selected time unit by 1. Increase (decrease) affects only the selected unit (for example, in hours, 23 is followed by 0, and vice versa).

For more details on input, see the section <a target="_self" href="#focus-and-keyboard-interaction">Focus and keyboard interaction</a>.

#### Default state

In most cases, the field is empty, showing only the input mask. In other cases, when specifying time is not important for the user but important for the system, it will be useful to pre-fill the field with the current time (current time is understood as the time when the page was opened; it does not change dynamically).

### Validation

#### Validation during input

##### Entering letters and symbols

[Validation during input](/en/other/validation/overview#during-value-input) is triggered:

- when entering letters in any part of the mask;
- when entering the first character, except digits.

<!-- example(timepicker-validation-symbols) -->

##### Entering symbols and digits

If after entering two digits (in hours or minutes) any character other than digits and letters is entered, the field ignores this input.

If after entering one digit (in hours or minutes) any character other than digits and letters is entered, the field treats this character as a separator and converts it to a colon, and a zero is inserted before the entered digit.

If you enter values greater than 23 for hours and greater than 59 for minutes and seconds, they are converted to 23 for hours and 59 for minutes and seconds.

<!-- example(timepicker-validation-symbols) -->

#### Validation of copied values

When copying values from the clipboard or pasting them using drag-and-drop, validation during input is triggered. If the copied value contained characters other than digits and letters, the rules from the "Entering symbols and digits" section above are applied to them.

<!-- example(timepicker-validation-symbols) -->

#### Validation using ReactiveFormsModule

<!-- example(timepicker-field-validation) -->

### Focus and keyboard interaction

| <div style="min-width: 170px;">Key</div>                                                                                                     | Action                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span class="docs-hot-key-button">Tab</span> \ <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">Tab</span> | Move focus to (from) the time field                                                                                                                                                |
| <span class="docs-hot-key-button">↓</span> <span class="docs-hot-key-button">↑</span>                                                        | Cursor is set on any time unit (hours, minutes, or seconds) → decrease or increase the value by 1                                                                                  |
| <span class="docs-hot-key-button">→</span>                                                                                                   | Move the cursor to the next character. If the cursor is set after the last time unit (minutes or seconds, depending on variation), place the cursor before the first hour digit    |
| <span class="docs-hot-key-button">←</span>                                                                                                   | Move the cursor to the previous character. If the cursor is set before the first hour digit, move the cursor after the last time unit (minutes or seconds, depending on variation) |
| <span class="docs-hot-key-button">PgUp</span> \ <span class="docs-hot-key-button">Home</span>                                                | Place the cursor before the first hour digit                                                                                                                                       |
| <span class="docs-hot-key-button">PgDn</span> \ <span class="docs-hot-key-button">End</span>                                                 | Move the cursor after the last time unit (minutes or seconds, depending on variation)                                                                                              |
| <span class="docs-hot-key-button">Space</span>                                                                                               | — If in any part of the mask → nothing happens                                                                                                                                     |
|                                                                                                                                              | — If after entering two digits (hours or minutes) → move to the next part of the mask (minutes or seconds);                                                                        |
|                                                                                                                                              | — If after entering one digit (in hours or minutes) → the field treats this key as a separator, a colon is inserted, and a zero is inserted before the entered digit               |

### Design and animation

The time field has a fixed width, which is built by the formula _left padding + mask + right padding_.

The mask width will be different for each language; after entering time, the width does not change, even if the entered value is less than the mask width.

The left padding varies depending on the variation (with or without icon). The right padding is always 16px.

### Additional

#### Using Datepicker and Timepicker together

This is an example of using Datepicker and Timepicker together to select a specific date and time. This approach is useful when you need to set an exact time for an event or deadline.

The user can select a date through Datepicker and then specify the exact time through Timepicker.

An implementation example is available in the [Datepicker](/en/components/datepicker/overview#using-datepicker-and-timepicker-together) section
