A search field that expands from a compact icon button.

The component is a form control and has no standalone value input: bind it with `[formControl]`, `[formControlName]` or `[(ngModel)]`, otherwise it throws on initialization. The typed value reaches the bound control after `emitValueTimeout` milliseconds, or on `Enter` when `isEmitValueByEnterEnabled` is set.

<!-- example(search-expandable-overview) -->

The expandable search can be used, for example, in an action panel. When the bound model already holds a value, the search renders expanded:

<!-- example(search-expandable-in-header) -->
