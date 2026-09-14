Splitter resizes neighboring panels by dragging the separator.

Only panels placed directly inside `kbq-splitter`, without a wrapper element, participate in the layout.

<!-- example(splitter-overview) -->

## Appearance

The `appearance` input sets how the separator is drawn:

| Variant       | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| `divider`     | Dividing line. Used by default                                                         |
| `transparent` | Invisible separator. Use it when panels differ by background or have their own borders |
| `handle`      | Drag handle at the center of the boundary                                              |

`kbqSplitterOptionsProvider` sets the default appearance for the whole application or for one injector.

<!-- example(splitter-appearance) -->

## Orientation

The `orientation` input sets the layout direction: `horizontal` places panels in a row, `vertical` in a column.

<!-- example(splitter-orientation) -->

## Disabling

The `disabled` input forbids resizing: the separators stop reacting to the pointer and the keyboard, leave the tab order and show the plain cursor.

<!-- example(splitter-disabled) -->

## Size and constraints

Three inputs set the size of a panel:

| Input     | Description                                                   |
| --------- | ------------------------------------------------------------- |
| `size`    | Initial size. Panels without `size` share the remaining space |
| `minSize` | Smallest size the panel can be reduced to                     |
| `maxSize` | Largest size the panel can be expanded to                     |

A value can be a number of pixels (`240`), a pixel string (`'240px'`), or a share of the splitter (`'30%'`). Units can be mixed within one splitter.

When a neighboring panel reaches its constraint, the separator keeps moving: the panels after it give up space, so the next separator moves too.

<!-- example(splitter-constraints) -->

## Snapping

The `snapSizes` input sets the sizes a panel snaps to. If either panel beside a separator has `snapSizes`, the `minSize` and `maxSize` of both panels also become snap points. The separator follows the pointer during a drag. The panel snaps after the drag ends.

The `snapTolerance` input sets the distance from a snap point at which a panel snaps to it. The default is 32 pixels and is set by `kbqSplitterOptionsProvider`.

<!-- example(splitter-snap) -->

## Collapsed panel

The `collapsible` input lets a panel be collapsed by dragging, and `collapsedSize` sets the width of the collapsed strip. Such a panel has no sizes in between: a drag stops at `minSize`, and pulling further collapses it.

When `collapsedSize` is zero, the panel is completely hidden and no separator remains to restore it. The panel can be expanded through the `[(collapsed)]` two-way binding, for example with a button or keyboard shortcut.

<!-- example(splitter-collapsible) -->

## Nested areas

One of the panels can hold nested resizable areas.

<!-- example(splitter-nested) -->

## Keyboard interaction

The separator is placed in the tab order between the content of neighboring panels.

| <div style="min-width: 180px;">Key</div>                                                                   | Behavior                                                                                                         |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| <span class="docs-hot-key-button">Left Arrow</span> \ <span class="docs-hot-key-button">Right Arrow</span> | Moves a vertical separator in the direction of the arrow.                                                        |
| <span class="docs-hot-key-button">Up Arrow</span> \ <span class="docs-hot-key-button">Down Arrow</span>    | Moves a horizontal separator in the direction of the arrow.                                                      |
| <span class="docs-hot-key-button">Home</span>                                                              | Sets the smallest available size of the panel. A panel already at its minimum collapses, when it is collapsible. |
| <span class="docs-hot-key-button">End</span>                                                               | Sets the largest available size of the panel, squeezing the neighboring panels when needed.                      |
| <span class="docs-hot-key-button">Enter</span>                                                             | Collapses and expands the panel, when `collapsible` is set.                                                      |
| <span class="docs-hot-key-button">F6</span> \ <span class="docs-hot-key-button">Shift + F6</span>          | Moves focus to the next or the previous panel.                                                                   |
| <span class="docs-hot-key-button">Double-click</span>                                                      | Resets the sizes to the ones the panels declare. A second double-click sets the panel to its minimum size.       |
