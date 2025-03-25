Breadcrumbs are a navigation element that helps users easily orient themselves on a website and understand their current location relative to the main page.

<!-- example(breadcrumbs-overview) -->

## Sizes

Breadcrumbs come in several sizes to offer more flexibility for adapting to different interfaces.

<!-- example(breadcrumbs-size) -->

## Dropdown Elements in Breadcrumbs

<!-- example(breadcrumbs-dropdown) -->

## Custom Template

<!-- example(breadcrumbs-custom-template) -->

## Item Truncation

Breadcrumb items can have names of varying lengths.  
Below are the modes for configuring the display length and number of items.

### Truncation by Name Length

A standard truncation method where the name is cut off after the first 14 characters.

<!-- example(breadcrumbs-truncate-head-items) -->

### Truncation to the Tail

Used in cases where highlighting a unique identifier at the end of the name is necessary.

<!-- example(breadcrumbs-truncate-tail-items) -->

### Middle Section Truncation

For cases when it is necessary to highlight the beginning and the end of the title.

<!-- example(breadcrumbs-truncate-center-items) -->

### Using Abbreviations

For cases where a name can be replaced with a shortened version using a well-known abbreviation. It is important that this abbreviation is already familiar to the service's user audience.

<!-- example(breadcrumbs-truncate-by-abbrev-items) -->

### Negative Margin

By default, the breadcrumb panel is shifted to the left by `--kbq-breadcrumb-item-negative-margin` using a negative margin. This behavior can be changed using the `firstItemNegativeMargin` property.

For specific breadcrumbs:

```ts
@Component({
    template: `
            <nav kbq-breadcrumbs [firstItemNegativeMargin]="false">...</nav>
    `
})
```

For all breadcrumbs in the module, using **Dependency Injection** with the `provideKbqBreadcrumbsConfiguration` provider:

```ts
import { kbqBreadcrumbsConfigurationProvider } from '@koobiq/components/breadcrumbs';

@NgModule({
    providers: [
        kbqBreadcrumbsConfigurationProvider({ firstItemNegativeMargin: false })
    ]
})
```

This version captures the same meaning but in English. Let me know if you need further adjustments!

## Keyboard Navigation

| <div style="min-width: 180px;">Key</div>                                                         | Behavior                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span class="hot-key-button">Tab</span>                                                          | Navigate to the start of the breadcrumbs: When the focus switches to breadcrumbs, the cursor automatically moves to the first item in the navigation path.                                                                                                                                                                                                                                                    |
| <span class="hot-key-button">Enter</span> \ <span class="hot-key-button">Space</span>            | Activates the item. Navigation to a link: If the selected item corresponds to a link to another page, navigation occurs. Expand a dropdown: For items with dropdown lists, the list opens, and the focus shifts to the first item in the list. Trigger an action: If the item has an associated action (e.g., opening a modal window), the action is performed. No action: For other items, no actions occur. |
| <span class="hot-key-button">Right Arrow</span> \ <span class="hot-key-button">Left Arrow</span> | Move through items: Allows navigation through the breadcrumb items forward or backward. When reaching the end or start of the list, the cursor cyclically moves to the opposite end.                                                                                                                                                                                                                          |
| <span class="hot-key-button">Bottom Arrow</span>                                                 | 🚧 Coming soon... 🚧                                                                                                                                                                                                                                                                                                                                                                                          |
| <span class="hot-key-button">Home</span>                                                         | 🚧 Coming soon... 🚧                                                                                                                                                                                                                                                                                                                                                                                          |
| <span class="hot-key-button">End</span>                                                          | 🚧 Coming soon... 🚧                                                                                                                                                                                                                                                                                                                                                                                          |
