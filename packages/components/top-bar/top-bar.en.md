Topbar is a toolbar that always remains visible on the page and provides quick access to navigation and controls.

<!-- example(top-bar-overview) -->

Depending on the interface requirements, it may include a logo, a title, breadcrumbs, action buttons, and other elements.

### Page title

This content option is suitable for initial screens when there is no need to display the navigation path.

<!-- example(top-bar-overview) -->

If you need to display the number of objects on the current page, you can do so by showing a special counter next to the page title:

<!-- example(top-bar-title-counter) -->

### Breadcrumbs

For internal pages of a specific module, using [breadcrumbs](/en/components/breadcrumbs) is an excellent option. This helps users navigate the application more easily.

<!-- example(top-bar-breadcrumbs) -->

### Action buttons

On the right side of the toolbar, there is a dedicated area for placing any actions that need to be displayed on the current page.

We recommend using the following set of actions (from left to right):

-   Indicators (e.g., data refresh indicator)
-   A group of icon buttons (e.g., filters)
-   Frequently used actions as buttons (e.g., "Add...", "Share")
-   Additional actions in a dropdown menu, where all secondary actions related to the current page can be placed.

<!-- example(top-bar-actions) -->

### Responsive mode

Internal elements can adjust to the toolbar size.

The minimum allowed spacing between the left side and the right side with actions is **80px** and is defined using the CSS variable `--kbq-top-bar-spacer-min-width`.

#### Breadcrumbs variant

When the panel is compressed, the breadcrumbs will adjust as follows:

<!-- example(top-bar-breadcrumbs-adaptive) -->

A more detailed explanation of breadcrumb compression is provided on the [breadcrumbs](https://koobiq.io/en/components/breadcrumbs/overview) page.

#### Page title variant

The variant using only the page title will adjust as follows:

<!-- example(top-bar-title-counter-adaptive) -->

#### Scroll behavior

The toolbar can remain fixed while scrolling the page.

<!-- example(top-bar-overflow) -->
