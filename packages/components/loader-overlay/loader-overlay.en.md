The loading overlay displays an ongoing process within a block.

### When to use

When you need to clearly show that a block is loading or a process is running. Before adding a loader overlay, clarify the loading time.

### Component structure

- Semi-transparent backdrop
- Spinner
- Main text (optional)
- Caption (optional)

<!-- example(loader-overlay-overview) -->

### How it works

The spinner overlay is a temporary state of a block. It appears in response to a user action (for example, clicking a submit button in a form) or a system process. After the process completes, the overlay and spinner disappear.

Elements behind the overlay must not be accessible for focus, selection, or clicking.

#### Default state

Opaque overlay, spinner, main text.
The default text is "Loading"; it is recommended to choose the text individually.
Do not use single-word "Loading" text with an enlarged spinner.

<!-- example(loader-overlay-default) -->

#### Focus and keyboard navigation

The system prevents focusing on form elements covered by the overlay.

### Design and animation

#### Overlay color

The backdrop has a background color with 90% opacity.

#### Horizontal alignment and width

The overlay covers the full width and height of the container it is displayed over.
Padding from the overlay edges is 10% of its width.
Maximum width of the text and caption under the spinner is 480px.

#### Vertical alignment

Center alignment with optical compensation is available: the top offset should be smaller than the bottom. By default, the compensation height equals 40% of the block height comprising the loading indicator and captions.

Fixed top-offset alignment is also available (72px by default).

<!-- example(loader-overlay-fixed-top) -->

#### Enlarged spinner

When it is necessary to display the loading process on the entire page, an enlarged spinner is used. Do not use single-word "Loading" text with an enlarged spinner.

<!-- example(loader-overlay-large) -->

#### Sizes

The component size is set using the `size` attribute.

<!-- example(loader-overlay-size) -->
