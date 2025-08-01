The pattern is used when the interface refers to an internal user.

Displaying the username means showing a set of attributes of the system’s internal user that help identify the user within the interface.

<!-- example(username-overview) -->

### Settings demonstration

<!-- example(username-playground) -->

### Custom template

If flexible data display is needed and the standard template doesn’t fit, use the `custom` mode with the `KbqUsernameCustomView` directive.
It supports the same modes and styles while maintaining consistency with the design system.
To format the full name, you can use the `kbqUsernameCustom` pipe with format settings and a mapping object (which links format elements to the corresponding user properties, defining which data to display).

<!-- example(username-custom) -->
