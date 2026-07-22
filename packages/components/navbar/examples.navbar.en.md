### Adding items from a template

You can declare `kbq-navbar-item` elements inside an `<ng-template>` and insert them with `*ngTemplateOutlet` — for example, to render the items from a data array. Declare the template inside `<kbq-navbar>` so the navbar keeps managing keyboard navigation, layout, and responsive collapsing of the items.

<!-- example(navbar-template-outlet) -->
