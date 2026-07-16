<!-- example(autocomplete-overview) -->

### Footer

You can place auxiliary elements in the footer: [buttons](en/components/button), [links](en/components/link), hints.

<!-- example(autocomplete-with-footer) -->

### Panel width

By default the panel sizes to its content and is never narrower than the field or than `panelMinWidth`, which is 200px. This can be changed with the `panelWidth` and `panelMinWidth` attributes:

```html
<!-- Match the field, but never go below panelMinWidth -->
<kbq-autocomplete panelWidth="auto" />

<!-- An exact width; panelMinWidth is not applied -->
<kbq-autocomplete [panelWidth]="400" />

<!-- Any CSS value works, e.g. shrink to fit the options -->
<kbq-autocomplete panelWidth="fit-content" />

<!-- Widen the default lower bound -->
<kbq-autocomplete [panelMinWidth]="350" />

<!-- Let the panel grow further with its content; the default cap is 640px -->
<kbq-autocomplete [panelMaxWidth]="800" />
```

Growth by content stops at 640px. The cap is soft — it never makes the panel narrower than the field, and never clamps an explicit `panelWidth`. Change it globally through the `--kbq-panel-size-width-max` token, which is shared with select, tree-select and dropdown.

The same attributes apply when the autocomplete is attached to a [tag input](en/components/tags), where the panel is measured against the whole field rather than the input.
