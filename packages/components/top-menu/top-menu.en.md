The `Top Menu` is a toolbar that remains visible on the page at all times, providing quick access to navigation and
controls. Depending on the interface requirements, it can include breadcrumbs, a title, action buttons, and other
elements. Below are various ways to use the toolbar and recommendations for adapting it to different scenarios.

### Breadcrumbs

Use breadcrumbs to display the navigation path. This panel is always visible and helps users navigate the application.

<!-- example(top-menu-breadcrumbs) -->

### Replacing Breadcrumbs with a Title

For a more compact layout, replace breadcrumbs with a title that reflects the current section.

<!-- example(top-menu-overview) -->

### Active Breadcrumb Display

The last breadcrumb in the navigation is always active and can be used for various actions.

<!-- example(top-menu-active-breadcrumb) -->

### Additional Actions

Additional (secondary) actions are placed in a dropdown menu for better UI convenience.

<!-- example(top-menu-secondary-actions) -->

### Responsive Behavior

Additional actions can be moved into the dropdown menu as the screen width decreases, ensuring a seamless user experience across different devices.

<!-- example(top-menu-secondary-actions-responsive) -->

### Minimum Spacing Between Elements

<!-- cspell:ignore Dashbo -->

To ensure usability:

-   Hide button text when the screen width decreases.
-   Show a tooltip with the button text on hover.
-   Maintain a minimum spacing of **80px**, set via `--kbq-top-menu-spacer-min-width`. It applies to top menu elements, including the header.
-   If a long title does not fit, truncate it with an ellipsis (**"Dashbo..."**).

<!-- example(top-menu-overflow) -->
