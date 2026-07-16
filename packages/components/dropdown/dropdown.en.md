<!-- example(dropdown-overview) -->

### Disabled Trigger

<!-- example(dropdown-disabled) -->

### Open by Arrow Down ↓

<!-- example(dropdown-open-by-arrow-down) -->

### Lazy Load Data

<!-- example(dropdown-lazyload-data) -->

### Nested Elements

<!-- example(dropdown-nested) -->

### Navigation Wrap

A "cyclic navigation" mode where reaching one end of the list loops back to the other end.

<!-- example(dropdown-navigation-wrap) -->

### Dynamic Rendering

Recursive rendering of an array or object, allowing the creation of nested dropdown menus.

<!-- example(dropdown-recursive-template) -->

### Menu Search

<!-- example(dropdown-with-filter) -->

## Horizontal alignment

Use the `xPosition` property to control horizontal alignment of the dropdown panel relative to the trigger. Supported values: `'after'` (default), `'before'`, and `'center'`.

<!-- example(dropdown-x-position) -->

## Panel width

The panel is never narrower than its trigger, and grows with its content between the bounds set by two design tokens:

| Token                                     | Default |
| ----------------------------------------- | ------- |
| `--kbq-dropdown-size-container-width-min` | `200px` |
| `--kbq-dropdown-size-container-width-max` | `640px` |

Nested panels and panels that overlap the trigger vertically are not matched to the trigger — they follow the tokens only.

When the trigger is only a part of a larger control, set `KbqDropdownTrigger.widthOrigin` to the element the panel should match instead. [Split button](en/components/split-button) does this through its `panelAutoWidth` input.
