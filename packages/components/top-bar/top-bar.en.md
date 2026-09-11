Topbar is a toolbar that always remains visible on the page and provides quick access to navigation and controls.

<!-- example(top-bar-overview) -->

Depending on the interface requirements, it may include a logo, a title, breadcrumbs, action buttons, and other elements.

### Page title

This content option is suitable for initial screens when there is no need to display the navigation path.

<!-- example(top-bar-overview) -->

If you need to display the number of objects on the current page, you can do so by showing a special counter next to the page title:

<!-- example(top-bar-title-counter) -->

### Breadcrumbs

For internal pages of a specific module, using [Breadcrumbs](/en/components/breadcrumbs) is an excellent option. This helps users navigate the application more easily.

<!-- example(top-bar-breadcrumbs) -->

### Action buttons

On the right side of the toolbar, there is a dedicated area for placing any actions that need to be displayed on the current page.

We recommend using the following set of actions (from left to right):

- Indicators (e.g., data refresh indicator)
- A group of icon buttons (e.g., filters)
- Frequently used actions as buttons (e.g., "Add...", "Share")
- Additional actions in a dropdown menu, where all secondary actions related to the current page can be placed.

<!-- example(top-bar-actions) -->

### Responsive mode

Internal elements can adjust to the toolbar size.

The minimum allowed spacing between the left side and the right side with actions is **80px** and is defined using the CSS variable `--kbq-top-bar-spacer-min-width`.

#### Breadcrumbs variant

When the panel is compressed, the breadcrumbs will adjust as follows:

<!-- example(top-bar-breadcrumbs-adaptive) -->

A more detailed explanation of breadcrumb compression is provided on the [Breadcrumbs](/en/components/breadcrumbs) page.

#### Page title variant

The variant using only the page title will adjust as follows:

<!-- example(top-bar-title-counter-adaptive) -->

#### Scroll behavior

The toolbar can remain fixed while scrolling the page.

<!-- example(top-bar-overflow) -->

The example above keeps the toolbar outside the scrolling area, which needs no configuration at all. To make
the toolbar itself stick, set `--kbq-top-bar-inset-block-start: 0` and put it inside the scrolling element:
`--kbq-top-bar-position` is already `sticky`, but a sticky box is only offset once it has an inset, so with
the default `auto` the toolbar lays out exactly like `position: relative`.

### CSS variables

The inputs cover the shadow and the accessible name; everything else is configured through custom
properties, set on `kbq-top-bar` itself or on any of its ancestors.

| Variable                                  | Default                                    | Description                                                                                                                                          |
| ----------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--kbq-top-bar-z-index`                   | `990`                                      | Layer of the toolbar. It sits above page content and below every CDK overlay (`1000`), so dropdown, select and popover panels always paint above it. |
| `--kbq-top-bar-position`                  | `sticky`                                   | `position` of the host. On its own it changes nothing — see `--kbq-top-bar-inset-block-start`.                                                       |
| `--kbq-top-bar-inset-block-start`         | `auto`                                     | Distance a sticky toolbar keeps from the top of its scrolling ancestor. `auto` imposes no constraint, so the toolbar does not stick.                 |
| `--kbq-top-bar-padding-vertical`          | `var(--kbq-size-m)`                        | Vertical padding of the toolbar.                                                                                                                     |
| `--kbq-top-bar-padding-horizontal`        | `var(--kbq-size-xxl)`                      | Horizontal padding of the toolbar.                                                                                                                   |
| `--kbq-top-bar-border-radius`             | `0`                                        | Corner radius of the toolbar.                                                                                                                        |
| `--kbq-top-bar-spacer-min-width`          | `80px`                                     | Width of `[kbqTopBarSpacer]`, the guaranteed clearance between the two sides.                                                                        |
| `--kbq-top-bar-container-start-min-width` | `0`                                        | Width the `start` container never shrinks below. Set it whenever the left-hand content has to stay readable in a narrow toolbar.                     |
| `--kbq-top-bar-container-start-gap`       | `0`                                        | Gap between the elements of the `start` container.                                                                                                   |
| `--kbq-top-bar-container-end-gap`         | `var(--kbq-size-s)`                        | Gap between the elements of the `end` container, and between the overflowing action buttons.                                                         |
| `--kbq-top-bar-background`                | `var(--kbq-background-bg)`                 | Background of the toolbar.                                                                                                                           |
| `--kbq-top-bar-shadow-bottom`             | `var(--kbq-shadow-overflow-normal-bottom)` | Shadow drawn while `withShadow` is set.                                                                                                              |
| `--kbq-top-bar-shadow-transition`         | `ease-out 300ms`                           | Transition of that shadow.                                                                                                                           |

### Accessibility

`kbq-top-bar` ships without a landmark role on purpose: the same toolbar is the page header in one place and
a panel header in another, and a page may expose only one `banner`. Pick the semantics at the call site.

When the toolbar is the page header, give it the banner landmark — wrapping it in a `<header>` that is not
nested in `<main>`, `<article>` or `<section>` does the same thing:

```html
<kbq-top-bar role="banner">…</kbq-top-bar>
```

Whenever a page renders more than one toolbar, name each of them so assistive technology can tell them apart:

```html
<kbq-top-bar role="banner" aria-label="Dashboards">…</kbq-top-bar>
```

Use `role="toolbar"` only if the toolbar implements roving focus itself: a toolbar is expected to be a single
tab stop whose controls are reached with the arrow keys. Without that, leave the buttons as ordinary tab
stops. The icon-only buttons a toolbar usually carries — the overflow trigger included — need an `aria-label`
of their own, which the toolbar cannot supply.
