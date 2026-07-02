The pattern is used when the interface refers to an internal user.

Displaying the username means showing a set of attributes from the internal system user that help identify them in the interface.

<!-- example(username-overview) -->

### Configuration demo

<!-- example(username-playground) -->

### Custom template

If flexible layout is required and the default template doesn’t meet your needs, use the `custom` mode with the `KbqUsernameCustomView` directive.

This mode supports the same display styles and modes while maintaining consistency with the design system.

To format the full name, use the `kbqUsernameCustom` pipe with a format string and a mapping definition (an object that links format elements to corresponding user properties, determining what data should be shown).

<!-- example(username-custom) -->

The component can be conveniently used inside links. To visually match the link style, set the `inherit` style — this ensures that color and appearance are inherited from the parent element.

<!-- example(username-as-link) -->

### Search and highlight

To filter a list of users by the displayed name, inject `KbqUsernamePipe` as a service and call its `transform` method — it returns the same string the component renders by default.

The matched fragment is easy to highlight in a custom template with the `kbqHighlightBackground` pipe.

<!-- example(username-search) -->

#### Search in Filter bar

The same approach works in the filter bar, inside `kbq-pipe-select`. The look of an option is defined by `valueTemplate`, so you can render the username component as its label. The entered search text comes from the template context: the `$implicit` variable holds the pipe component itself, and its `searchControl.value` property keeps the current string.

Put the formatted name in the `name` property — it is used as the trigger display value. Add the login and site to `searchKey` so the built-in filter covers every visible field.

<!-- example(username-filter-bar-option) -->
