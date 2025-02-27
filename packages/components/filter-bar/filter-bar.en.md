A composite component for filtering data in a table or list.

<!-- example(filter-bar-overview) -->

### Operating modes

In the clear mode, filters remain on the panel after clicking the button with a cross, and in the delete mode, they disappear. Do not mix the two modes on one screen. If the buttons with the cross icon work differently for adjacent filters, this will confuse the user.

#### Cleaning

Use when the system has few filters or users often use several popular parameters. Filter buttons without selected values ​​are pre-showed on the screen, the filled filter is cleared by the cross, but the button itself does not disappear.

In the cleaning mode, you should not give the opportunity to add new filters from the menu, as this will conflict with the fact that the cross will either reset or delete the filter.

<!-- example(filter-bar-cleanable) -->

#### Removal

In this mode, the user has the option to hide the component if there are no values ​​selected in the filter. When filled, the button with a cross resets the filter values ​​and hides it.
Filters with the ability to delete are usually hidden in the menu to avoid cluttering the screen. The user will select the desired parameter from the drop-down list, and then the corresponding element will be added to the filter panel.

<!-- example(filter-bar-removable) -->

### Required filter

A filter can be added to the filter panel regardless of the operating mode, which will always be filled and cannot be cleared. The user will only be able to change its value.

<!-- example(filter-bar-required) -->

### Filter types

<!-- example(filter-bar-pipe-types) -->

### Search

Text search allows you to search for information based on any data, even if there are no separate filters for it.

<!-- example(filter-bar-search) -->

### Saving filters

The user can quickly get search results by selecting a saved filter, without re-configuring the parameters. It is also possible to create a new set of filters and use them in the future.

<!-- example(filter-bar-saved-filters) -->
