<!-- example(dropdown-overview) -->

### Disabled Trigger

<!-- example(dropdown-disabled) -->

### Progress state

Add the `progress` attribute to `kbq-dropdown-item` to show a loading shimmer on the item. It can be combined with `disabled` to also prevent interaction while loading.

<!-- example(dropdown-item-progress) -->

### Footer

You can place auxiliary elements in the footer: [buttons](en/components/button), [links](en/components/link), hints.

<!-- example(dropdown-with-footer) -->

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

By default the panel grows with its content, is never narrower than its trigger or than 200px, and stops at 640px. This is configured with the same `panelWidth`, `panelMinWidth` and `panelMaxWidth` attributes as [select](en/components/select) and [autocomplete](en/components/autocomplete):

```html
<!-- Match the trigger exactly -->
<kbq-dropdown panelWidth="auto" />

<!-- An exact width; panelMinWidth is not applied -->
<kbq-dropdown [panelWidth]="400" />

<!-- Let the panel grow further with its content -->
<kbq-dropdown [panelMaxWidth]="800" />
```

The 640px cap is soft: it limits growth by content only, so a trigger wider than 640px still gets a panel as wide as itself, and an explicit `panelWidth` is never clamped.

The defaults come from design tokens, which can be overridden by a theme:

| Token                                     | Default                                  |
| ----------------------------------------- | ---------------------------------------- |
| `--kbq-dropdown-size-container-width-min` | `200px`                                  |
| `--kbq-dropdown-size-container-width-max` | `var(--kbq-panel-size-width-max, 640px)` |

`--kbq-panel-size-width-max` is shared by every dropdown panel in the library, so setting it once on `:root` caps select, tree-select, autocomplete and dropdown together.

Nested panels and panels that overlap the trigger vertically are not matched to the trigger — they follow the tokens only.

When the trigger is only a part of a larger control, set `KbqDropdownTrigger.widthOrigin` to the element the panel should match instead. [Split button](en/components/split-button) does this through its `panelAutoWidth` input.
