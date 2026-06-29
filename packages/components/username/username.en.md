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

To filter a list of users by the displayed value, inject `KbqUsernamePipe` as a service and call its `transform` method — it returns the same formatted string that `kbq-username` renders by default.

To highlight the matched substring, use `kbq-username-custom-view` together with the `kbqHighlightBackground` pipe.

<!-- example(username-search) -->

#### Usage in filter-bar

The same approach works inside `kbq-pipe-select`. Use `valueTemplate` to render `kbq-username` as an option label. The search text is available via `pipe.searchControl.value` — `pipe` is the `$implicit` template context, which is the pipe component instance itself.

Set `item.name` to the formatted name (used as the trigger display value) and `item.searchKey` to include login and site so the built-in option filter covers all displayed fields.

<!-- example(username-filter-bar-option) -->
