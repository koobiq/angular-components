For icon buttons (clickable icons).

<!-- example(icon-button) -->

### Size

Used when you need to place an icon of a different size into the default-sized container. For example, an Icon Button Medium can contain either an **l**-size icon (16px) or an **xl**-size icon (24px).

<!-- example(icon-button-size) -->

### Padding customization

Icon buttons support overriding internal padding via CSS custom properties.

**Compact icon button**

```css
.custom-icon-button_compact {
    --kbq-icon-button-size-small-vertical-padding: var(--kbq-size-xs);
    --kbq-icon-button-size-small-horizontal-padding: var(--kbq-size-xs);
}
```

**Normal icon button**

```css
.custom-icon-button_normal {
    --kbq-icon-button-size-normal-vertical-padding: var(--kbq-size-xxs);
    --kbq-icon-button-size-normal-horizontal-padding: var(--kbq-size-xxs);
}
```

### Style

<!-- example(icon-button-style) -->
