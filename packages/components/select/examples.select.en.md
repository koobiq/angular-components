## Loading Options

If the options have not loaded yet, open the panel with a 100 ms delay. In most cases, the list will finish loading within that brief moment, and the user will not perceive it as interface lag. If the data still has not loaded, show the menu with a loading indicator for at least 300 ms to avoid unpleasant flickering.

<!-- example(select-loading) -->

### Loading Error

After the loading indicator, show an error message with an option to retry.

<!-- example(select-loading-error) -->

## Pagination Loading

<!-- example(select-paging) -->

### Pagination Loading Error

<!-- example(select-paging-error) -->

## No Available Options

A select component is intended to have available choices. If it has no options, this should be treated as an exceptional case. When the application does not provide any choices, the select should be replaced with an input field or a dialog for creating a new entity.

<!-- example(select-add-new-option) -->

As a last resort, you can place a message in the dropdown menu. Hide the search field if it is known for sure that there are no options in the menu at all.

<!-- example(select-no-variants) -->

## Custom Message Design

<!-- example(select-loading-error-custom) -->

### Example with kbq-select-trigger

kbq-select-trigger allows you to override the block that displays the selected value without affecting the placeholder, cleaner, or icon.

<!-- example(select-custom-trigger) -->

### Example with kbq-select-matcher

kbq-select-matcher allows you to replace the entire contents of kbq-select, including the placeholder, cleaner, and icon.

<!-- example(select-custom-matcher) -->
