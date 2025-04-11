<!-- example(toggle-overview) -->

### Indeterminate state (partial selection)

The **indeterminate** state is applied using the `[indeterminate]` boolean attribute. It can be used when you have a group of options and a higher-level toggle should reflect their combined state:

-   If only some options in the group are selected, the higher-level toggle appears **partially selected** (`[indeterminate]="true"`).
-   If **all** options are selected, the higher-level toggle appears **fully checked**.
-   If **none** are selected, the higher-level toggle appears **unchecked**.

<!-- example(toggle-indeterminate) -->
