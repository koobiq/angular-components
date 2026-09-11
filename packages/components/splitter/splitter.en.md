Splitter resizes neighboring panels by dragging the separator between them, so people can widen the column they need and narrow the rest.

Panels must be direct children of `kbq-splitter`: a panel inside a wrapper element is left out of the layout.

<!-- example(splitter-overview) -->

## Appearance

The `appearance` input sets how the separator is drawn:

| Variant       | Description                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `divider`     | A dividing line. Used by default                                                                                     |
| `transparent` | The separator is invisible and only the cursor gives it away. It fits a boundary that already has an edge of its own |
| `handle`      | A grip centred on the boundary                                                                                       |

`kbqSplitterOptionsProvider` sets the default appearance for the whole application or for one injector.

<!-- example(splitter-appearance) -->

## Orientation

The `orientation` input sets the axis the panels are laid out along: `horizontal` puts them in a row, `vertical` in a column.

<!-- example(splitter-orientation) -->

## Disabling

The `disabled` input forbids resizing: the separators stop reacting to the pointer and the keyboard, leave the tab order and show the plain cursor.

<!-- example(splitter-disabled) -->

## Size and constraints

Three inputs set the size of a panel:

| Input     | Description                                                                           |
| --------- | ------------------------------------------------------------------------------------- |
| `size`    | The starting size. Panels that leave it unset share whatever the others did not claim |
| `minSize` | The smallest size the panel can be squeezed to                                        |
| `maxSize` | The largest size the panel can be stretched to                                        |

A value is a number of pixels (`240`) or a share of the splitter (`'30%'`); the units can be mixed within one splitter.

When the panel beside it reaches its constraint the separator keeps moving: the space it needs comes from the panels after that one, so the next separator moves along with it.

<!-- example(splitter-constraints) -->

## Snapping

The `snapSizes` input sets the sizes a panel is pulled onto. The separator follows the pointer exactly for the whole drag, and the pull happens on release.

The `snapTolerance` input sets how far each point reaches: 32px by default, and that default comes from the same `kbqSplitterOptionsProvider`.

<!-- example(splitter-snap) -->

## Collapsed panel

The `collapsible` input lets a panel be collapsed by dragging, and `collapsedSize` sets the width of the collapsed strip. Such a panel has no sizes in between: a drag stops at `minSize`, and pulling further collapses it.

A `collapsedSize` of zero hides the panel completely. No separator is then left to grab it by, so offer a button or a shortcut and reopen the panel through the `[(collapsed)]` two-way binding.

<!-- example(splitter-collapsible) -->

## Nested areas

One of the panels can hold nested resizable areas.

<!-- example(splitter-nested) -->

## Keyboard interaction

The separator takes its place in the tab order between the content of the neighboring panels and implements the [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) pattern. The focus frame is shown for keyboard interaction only — it stays hidden while the separator is dragged with a pointer.

| <div style="min-width: 180px;">Key</div>                                                                   | Behavior                                                                                                         |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| <span class="docs-hot-key-button">Left Arrow</span> \ <span class="docs-hot-key-button">Right Arrow</span> | Moves a vertical separator in the direction of the arrow.                                                        |
| <span class="docs-hot-key-button">Up Arrow</span> \ <span class="docs-hot-key-button">Down Arrow</span>    | Moves a horizontal separator in the direction of the arrow.                                                      |
| <span class="docs-hot-key-button">Home</span>                                                              | Sets the smallest available size of the panel. A panel already at its minimum collapses, when it is collapsible. |
| <span class="docs-hot-key-button">End</span>                                                               | Sets the largest available size of the panel, squeezing the neighboring panels when needed.                      |
| <span class="docs-hot-key-button">Enter</span>                                                             | Collapses and expands the panel, when `collapsible` is set.                                                      |
| <span class="docs-hot-key-button">F6</span> \ <span class="docs-hot-key-button">Shift + F6</span>          | Moves focus to the next or the previous panel.                                                                   |
| <span class="docs-hot-key-button">Double Click</span>                                                      | Resets the sizes to the ones the panels declare. A second double click sets the panel to its minimum size.       |
