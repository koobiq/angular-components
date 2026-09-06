Radio buttons allow users to select from a set of mutually exclusive, related options.

### States

#### Size

<!-- example(radio-overview) -->

#### Style

<!-- example(radio-style) -->

#### Content

<!-- example(radio-content) -->

### Usage examples

#### Radio Group

<!-- example(radio-group) -->

#### Multiline

<!-- example(radio-multiline) -->

### Accessibility

A `kbq-radio-group` is announced as a `radiogroup`, which does not take its name from the options
inside it. Point it at the visible group label instead — write `aria-labelledby` (or `aria-label`)
directly on the element, the way you would on any other host:

```html
<div id="delivery-label" class="kbq-form__label">Delivery</div>
<kbq-radio-group aria-labelledby="delivery-label">
    <kbq-radio-button [value]="'pickup'">Pickup</kbq-radio-button>
    <kbq-radio-button [value]="'courier'">Courier</kbq-radio-button>
</kbq-radio-group>
```

A `kbq-hint` projected into a button is exposed as its description, not as part of its name, so an
option is announced by its own text and the caption is left for assistive technology to defer.

`[required]` on the group reaches the `radiogroup` as `aria-required`, and a group colored with the
error palette reaches it as `aria-invalid`.

`focus()` on a button — or on the group, which forwards to the checked option — accepts a
`FocusOrigin`. Pass `'keyboard'` when you move focus in response to a keyboard action, so the focus
ring is visible; the default `'program'` moves focus without one.

### Name and native forms

Every group generates a unique `name`, and its buttons inherit it, so nothing has to be named by
hand. A button used outside a group falls back to an id unique to itself and is therefore
independent of every other ungrouped radio in the application.

Name the group explicitly when it has to participate in a native `<form>` submission: that name is
the field name in the payload, and a generated one changes between application loads. The button's
`value` is submitted as a string, so only string-like values round-trip.

### Recommendations

- By default, it is recommended to use up to 7 options in a Radio Group.
- Use [Button Toggle](/en/components/button-toggle) for short options when there is sufficient horizontal space.
- If more than 7 options need to be displayed, it is better to use [Select](/en/components/select).
- If the selection involves two values and can be classified as boolean, use [Toggle](/en/components/toggle). Toggle applies changes instantly, without additional data saving.
