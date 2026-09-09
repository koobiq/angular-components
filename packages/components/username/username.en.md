The pattern is used when the interface refers to an internal user.

Displaying the username means showing a set of attributes from the internal system user that help identify them in the interface.

<!-- example(username-overview) -->

### Configuration demo

<!-- example(username-playground) -->

### Name format

`fullNameFormat` is a string of keys, each naming a field of the profile: `l` — last name, `f` — first name, `m` — middle name. A key followed by `.` renders an initial, any other key renders the field in full, and the separating spaces are inserted for you. The default, `lf.m.`, therefore renders `Root M. A.`; `fml` renders `Maxwell Alan Root`.

`isCompact` renders everything as a single line: the name if the profile has one, the login otherwise — never both. Use it where the row has no space for two parts, such as a select trigger.

### Custom template

If flexible layout is required and the default template doesn’t meet your needs, project a `<kbq-username-custom-view>`; it composes with any `mode` and `type`, so consistency with the design system is maintained.

Inside it, format the name with a pipe. The two pipes differ only in how they decide between the full value and an initial:

- `kbqUsername` follows the `fullNameFormat` rule above — a key followed by `.` is an initial — and drops every character it cannot map.
- `kbqUsernameCustom` takes the form from the key's case — `l` is an initial, `L` is the full value — and emits every character it cannot map verbatim, so the format carries its own punctuation: `L f. m.` renders `Root M. A.`

Both resolve their format-key-to-field mapping from `KBQ_PROFILE_MAPPING`. The shipped default maps `f`/`F`, `m`/`M` and `l`/`L` onto `KbqUserInfo`; provide the token at component or route level to format a profile of your own shape.

<!-- example(username-custom) -->

The component can be conveniently used inside links. To visually match the link style, set the `inherit` style — this ensures that color and appearance are inherited from the parent element.

<!-- example(username-as-link) -->

### Search and highlight

To filter a list of users by the displayed name, call `kbqInjectUsernameFormatter()` in an injection context and use the function it returns — it resolves `KBQ_PROFILE_MAPPING` where you call it, so a scoped mapping produces the same string the component renders.

The matched fragment is easy to highlight in a custom template with the `kbqHighlightBackground` pipe.

<!-- example(username-search) -->

#### Search in Filter bar

The same approach works in the filter bar, inside `kbq-pipe-select`. The look of an option is defined by `valueTemplate`, so you can render the username component as its label. The entered search text comes from the template context: the `$implicit` variable holds the pipe component itself, and its `searchControl.value` property keeps the current string.

Put the formatted name in the `name` property — it is used as the trigger display value. Add the login and site to `searchKey` so the built-in filter covers every visible field.

<!-- example(username-filter-bar-option) -->
