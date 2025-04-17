State toggle button: On or Off. For example, Wi-Fi on a phone can be toggled on or off.

<!-- example(toggle-overview) -->

### Indeterminate state

The `indeterminate` state is applied using the boolean attribute `[indeterminate]` and can be used when you have a group of options, and a higher-level toggle needs to display their state:

-   If only some options in the group are selected, the higher-level toggle appears partially selected (`[indeterminate]="true"`).
-   If all options are selected, the higher-level toggle appears checked.
-   If none are selected, the higher-level toggle appears unchecked.

<!-- example(toggle-indeterminate) -->

## Recommendations

-   Use a toggle for instant switching of settings that don’t require confirmation. For example, changes apply immediately without needing a "Save" button. If form submission is required to save, use a [Checkbox](/en/components/checkbox) instead.
-   Avoid using a toggle if the selection options don’t fit binary logic (e.g., on/off, yes/no).
