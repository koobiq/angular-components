# Spec Delta

## Purpose

Describes what `kbq-username` from `@koobiq/components/username` guarantees to consumers: how it renders a user's name, login and site from a profile, how the name format, compact mode, display modes, styles and custom view behave, and how the pipes and functions shipped with it format a profile outside the component.

## ADDED Requirements

### Requirement: Default view of a profile

Given a `userInfo` profile and no custom view, the component SHALL render the formatted name as the primary part, then the login as the secondary part, with the site in parentheses inside the secondary part as its hint. These parts SHALL carry the classes `kbq-username__primary`, `kbq-username__secondary` and `kbq-username__secondary-hint`.

#### Scenario: Full profile

- **WHEN** `userInfo` is `{ firstName: 'Maxwell', middleName: 'Alan', lastName: 'Root', login: 'mroot', site: 'corp' }`
- **THEN** the component reads "Root M. A. mroot (corp)"
- **AND** "Root M. A." is in the `kbq-username__primary` element, "mroot" in the `kbq-username__secondary` element and "(corp)" in the `kbq-username__secondary-hint` element inside it

### Requirement: Nothing to render

Without a `userInfo` profile, or with a profile that yields neither a name nor a login, the component MUST render none of its default parts.

#### Scenario: No profile

- **WHEN** `userInfo` is not bound
- **THEN** the component renders no primary or secondary part

#### Scenario: Empty profile

- **WHEN** `userInfo` is `{}`
- **THEN** the component has no text content

### Requirement: Partial profiles

The primary part SHALL be rendered whenever the name format yields any text from the profile, using whichever name fields the profile has. The secondary part SHALL be rendered only when the profile has a non-empty `login`.

#### Scenario: Last name and login

- **WHEN** `userInfo` is `{ lastName: 'Root', login: 'mroot' }`
- **THEN** the component reads "Root mroot"

#### Scenario: Name without a login

- **WHEN** `userInfo` is `{ firstName: 'Maxwell', middleName: 'Alan' }`
- **THEN** the component reads "M. A." and has no secondary part

#### Scenario: Login without a name

- **WHEN** `userInfo` is `{ login: 'mroot' }`
- **THEN** the component reads "mroot" and has no primary part

### Requirement: Site needs a login outside compact mode

Outside compact mode the site SHALL be rendered only inside the secondary part, so a profile with a `site` and no `login` MUST NOT show the site. The site hint SHALL be separated from the login by ordinary whitespace, not by a non-breaking space.

#### Scenario: Site without a login

- **WHEN** `userInfo` is `{ lastName: 'Root', site: 'corp' }` and `isCompact` is not set
- **THEN** the component reads "Root" and the site is not shown

#### Scenario: Separator before the site

- **WHEN** `userInfo` is `{ lastName: 'Root', login: 'mroot', site: 'corp' }` and `isCompact` is not set
- **THEN** the text of the secondary part contains no non-breaking space

### Requirement: Host classes

The host SHALL always have the class `kbq-username`, plus `kbq-username_<type>` for the value of `type` and `kbq-username_<mode>` for the value of `mode`. `mode` SHALL default to `inline` and `type` to `default`.

#### Scenario: Defaults

- **WHEN** a username is rendered without `mode` and `type`
- **THEN** its host has exactly the classes `kbq-username`, `kbq-username_default` and `kbq-username_inline`

#### Scenario: Explicit mode and type

- **WHEN** `mode` is `stacked` and `type` is `error`
- **THEN** the host has the classes `kbq-username_stacked` and `kbq-username_error`

### Requirement: Display modes

Unless `type` is `inherit`: in `stacked` mode the secondary part SHALL be laid out under the primary part; in `inline` mode both parts SHALL be on one line, in a block that starts on a line of its own; in `text` mode the component SHALL flow inline with the surrounding text.

#### Scenario: Stacked

- **WHEN** `mode` is `stacked` and the profile has a name and a login
- **THEN** the login is shown on the line below the name

#### Scenario: Inside a sentence

- **WHEN** a username is placed in the middle of a paragraph
- **THEN** in `text` mode it continues the line of the sentence
- **AND** in `inline` mode it breaks the sentence and occupies a line of its own

### Requirement: Truncation in stacked and inline modes

Unless `type` is `inherit`, in `stacked` and `inline` modes the primary and secondary parts SHALL each stay on one line and be cut with an ellipsis when the component is narrower than their text. In `text` mode the text MUST NOT be clipped.

#### Scenario: Narrow inline username

- **WHEN** a username in `inline` mode with a long name and login is 120 px wide
- **THEN** both the name and the login end in an ellipsis

#### Scenario: Narrow text username

- **WHEN** a username in `text` mode with the same profile is 120 px wide
- **THEN** the whole name, login and site are shown

### Requirement: Visual styles

`default` SHALL show the login and the site in the secondary text color, also when the profile has no name. `error` SHALL show every part in the error color. `accented` SHALL show the name in the strong weight and the login and the site in the color of the name. `inherit` SHALL take the color, the font and the `display` value from the parent element, in place of the layout of the mode.

#### Scenario: Login without a name in the default style

- **WHEN** `type` is `default` and `userInfo` is `{ login: 'mroot', site: 'corp' }`
- **THEN** "mroot (corp)" is shown in the secondary text color

#### Scenario: Inside a link

- **WHEN** a username with `type` set to `inherit` is placed inside a `kbqLink` anchor
- **THEN** it is shown in the color of the link

### Requirement: Name format

`fullNameFormat` SHALL default to `lf.m.` (`kbqDefaultFullNameFormat`). Each character that the profile mapping resolves to a field SHALL render that field: as its first character followed by `.` when the next character of the format is `.`, and in full otherwise. The rendered fields SHALL be joined with single spaces. With the default mapping the uppercase keys `L`, `F` and `M` follow the same rule.

#### Scenario: Default format

- **WHEN** `userInfo` is `{ firstName: 'Maxwell', middleName: 'Alan', lastName: 'Root' }` and `fullNameFormat` is not set
- **THEN** the name reads "Root M. A."

#### Scenario: Full fields

- **WHEN** `fullNameFormat` is `fml` for the same profile
- **THEN** the name reads "Maxwell Alan Root"

#### Scenario: Uppercase keys

- **WHEN** the format is `L F M` and the default mapping is in use
- **THEN** the name reads "Root Maxwell Alan"

### Requirement: Other characters are dropped from the name format

In `fullNameFormat`, a character that is neither `.` nor resolved to a field by the profile mapping, spaces and punctuation included, SHALL be dropped from the output without a warning.

#### Scenario: Unknown letter

- **WHEN** the format is `lf.m.s`
- **THEN** the name contains no "s" of the format

#### Scenario: Punctuation

- **WHEN** the format is `l, f.`
- **THEN** the name reads "Root M." without the comma

### Requirement: Missing fields are skipped in the name format

A field that is missing or empty in the profile SHALL be skipped together with its separator, so a partial profile renders exactly the fields it has.

#### Scenario: Partial profiles

- **WHEN** the default format is applied to `{ lastName: 'Carter' }`, to `{ firstName: 'Alice', middleName: 'Bishop' }` and to `{}`
- **THEN** the results are "Carter", "A. B." and an empty string

### Requirement: Initials by code point

An initial SHALL be the first Unicode code point of the field, so a character outside the Basic Multilingual Plane is kept whole. This SHALL hold for both format syntaxes.

#### Scenario: Surrogate pair

- **WHEN** the first name starts with U+1D4A5 and the format abbreviates it
- **THEN** the initial is U+1D4A5 followed by `.`

### Requirement: Compact mode

With `isCompact` set, which also accepts the bare attribute, the component SHALL render one primary part holding the formatted name when the profile yields one and the login otherwise, never both. `isCompact` SHALL default to `false`.

#### Scenario: Name and login

- **WHEN** `isCompact` is set and `userInfo` is `{ firstName: 'Maxwell', lastName: 'Root', login: 'mroot' }`
- **THEN** the component reads "Root M." and shows no login

#### Scenario: Login only

- **WHEN** `isCompact` is set and `userInfo` is `{ login: 'mroot' }`
- **THEN** the component reads "mroot" inside the primary part

### Requirement: Site in compact mode

In compact mode a profile with a `site` SHALL show it in parentheses after the name or the login, inside the primary part, separated by a non-breaking space so that it does not wrap away from the name. The site SHALL be shown whether or not the profile has a login.

#### Scenario: Name, login and site

- **WHEN** `isCompact` is set and `userInfo` is `{ lastName: 'Root', login: 'mroot', site: 'corp' }`
- **THEN** the primary part contains "Root", a non-breaking space and "(corp)"
- **AND** the login is not shown

### Requirement: Custom view replaces the default view

When a `KbqUsernameCustomView` is projected — the `kbq-username-custom-view` element or an element with the `kbq-username-custom-view` attribute — the component SHALL render it instead of the default view, whatever `userInfo` holds. Projected content outside it MUST NOT be rendered. The custom view SHALL get the class `kbq-username__custom-view`.

#### Scenario: Custom view with a profile

- **WHEN** `userInfo` is bound and a `kbq-username-custom-view` with the text "Test" is projected
- **THEN** no default primary part is rendered and the custom view is shown

#### Scenario: Content without a custom view

- **WHEN** plain text is projected into `kbq-username` without a custom view
- **THEN** the text is not rendered

### Requirement: Custom view keeps the mode and style

With a custom view, the host classes of `mode` and `type` SHALL still be set, and the layout of the mode SHALL apply to the children of the custom view.

#### Scenario: Stacked custom view

- **WHEN** a custom view holds a primary and a secondary element and `mode` is `stacked`
- **THEN** the secondary element is laid out under the primary one

### Requirement: Styling directives

The `kbqUsernamePrimary`, `kbqUsernameSecondary` and `kbqUsernameSecondaryHint` attribute directives SHALL add the classes `kbq-username__primary`, `kbq-username__secondary` and `kbq-username__secondary-hint` to their host, so elements of a custom view are styled like the parts of the default view.

#### Scenario: Elements of a custom view

- **WHEN** a custom view contains elements with the three directives
- **THEN** they have the three classes

### Requirement: Module exports

`KbqUsernameModule` SHALL export the component, the custom view, the three styling directives and both pipes, so NgModule consumers can use any of them after importing the module.

#### Scenario: Module consumer

- **WHEN** a component imports only `KbqUsernameModule` and uses the custom view, the styling directives and the `kbqUsername` pipe in its template
- **THEN** the template compiles and the elements get their classes

### Requirement: The kbqUsername pipe

`profile | kbqUsername: format : mapping` SHALL format the profile with the rules of `fullNameFormat`, using `kbqDefaultFullNameFormat` when no format is given and the injected `KBQ_PROFILE_MAPPING` when no mapping is given. The exported `kbqFormatUsername(profile, format, mapping)` SHALL return the same string for the same arguments.

#### Scenario: Defaults

- **WHEN** `{ firstName: 'Alice', middleName: 'Bishop', lastName: 'Carter' }` goes through `kbqUsername` without arguments
- **THEN** the result is "Carter A. B."

### Requirement: Case syntax of the kbqUsernameCustom pipe

`profile | kbqUsernameCustom: format : mapping` SHALL render a mapped lowercase key as the first character of its field without adding a dot, a mapped uppercase key as the full field, and every other character verbatim, then trim the result. The format SHALL default to `L f. m.` (`kbqDefaultFullNameFormatCustom`). The exported `kbqFormatUsernameCustom` SHALL return the same string.

#### Scenario: Default format

- **WHEN** `{ firstName: 'Alice', middleName: 'Bishop', lastName: 'Carter' }` goes through `kbqUsernameCustom` without arguments
- **THEN** the result is "Carter A. B."

#### Scenario: Formats carry their own punctuation

- **WHEN** the same profile is formatted with `F m l`, `Fm.l.` and `f.m.l.`
- **THEN** the results are "Alice B C", "AliceB.C." and "A.B.C."

#### Scenario: Unknown letter is kept

- **WHEN** the format is `lf.m.s`
- **THEN** the result ends with "s"

### Requirement: Missing fields in the case syntax

In the case syntax a mapped key whose field is missing or empty SHALL render nothing, while the separators written around it in the format SHALL still be rendered.

#### Scenario: Only a last name

- **WHEN** `{ lastName: 'Carter' }` is formatted with `L f. m.`
- **THEN** the result is "Carter . ."

### Requirement: Warning about an unmapped field key

In dev mode, when the case syntax meets one of the keys `f`, `F`, `m`, `M`, `l`, `L` that the mapping does not resolve, it SHALL render the key verbatim and log one console warning naming the key, at most once per key for the lifetime of the application. It MUST NOT warn in production mode or for any other character, and the `kbqUsername` syntax MUST NOT warn.

#### Scenario: Mapping without the last name

- **WHEN** a profile is formatted twice with `L f.` and a mapping that leaves `L` unmapped
- **THEN** both results are "L A."
- **AND** exactly one warning containing `"L"` is logged

### Requirement: Profiles that are not records

Both pipes and both format functions SHALL return an empty string when the profile is `null`, `undefined`, a primitive or an array.

#### Scenario: Null and array profiles

- **WHEN** `null` or `[]` is passed to either pipe
- **THEN** the result is an empty string

### Requirement: Explicit mapping argument of the pipes

A mapping passed to either pipe as its second argument SHALL replace the injected `KBQ_PROFILE_MAPPING` for that call. A missing or falsy mapping argument SHALL fall back to the injected one.

#### Scenario: Mapping of another profile shape

- **WHEN** a profile `{ surname: 'Root' }` goes through `kbqUsername` with the format `l` and a mapping of `l` to `surname`
- **THEN** the result is "Root"

### Requirement: Profile mapping token

`KBQ_PROFILE_MAPPING` SHALL default to `kbqDefaultProfileMapping`, which maps `f` and `F` to `firstName`, `m` and `M` to `middleName`, `l` and `L` to `lastName`, and `.` to no field. The component, both pipes and the injected formatter SHALL resolve the token from the injector they are used in, so a provider on a component or a route applies to everything rendered below it.

#### Scenario: Mapping scoped to a component

- **WHEN** a component provides `KBQ_PROFILE_MAPPING` mapping `f` to `given` and `l` to `surname` and renders a username for `{ surname: 'Root', given: 'Maxwell', login: 'mroot' }`
- **THEN** the username reads "Root M. mroot"
- **AND** the formatter injected in that component returns "Root M."

### Requirement: Injected formatter

`kbqInjectUsernameFormatter()` SHALL return a function `(profile, format?)` that formats with the rules of `fullNameFormat`, using `kbqDefaultFullNameFormat` when no format is given and the `KBQ_PROFILE_MAPPING` visible where `kbqInjectUsernameFormatter()` was called. It MUST be called in an injection context; outside one Angular throws its injection-context error.

#### Scenario: Same string as the component

- **WHEN** a component with a scoped mapping formats a profile with the injected formatter
- **THEN** the result equals the name its `kbq-username` renders for that profile

### Requirement: Pipes are not root services

`KbqUsernamePipe` and `KbqUsernameCustomPipe` SHALL be template pipes only; injecting either as a service MUST fail unless the consumer provides it.

#### Scenario: Injecting the pipe

- **WHEN** code injects `KbqUsernamePipe` from an injector that does not provide it
- **THEN** the injection throws

### Requirement: Building the full username text

`kbqBuildUsernameText({ name, login, site }, options)` SHALL join the name, the login and the site wrapped in parentheses with single spaces, skipping each empty segment, including the name.

#### Scenario: Segments

- **WHEN** it is called with the name "Root M. A." and then with the login `mroot` and the site `corp` added
- **THEN** the results are "Root M. A." and "Root M. A. mroot (corp)"

#### Scenario: Missing segments

- **WHEN** it is called with an empty name, the login `mroot` and the site `corp`, and again with the name "Root M. A." and only the site
- **THEN** the results are "mroot (corp)" and "Root M. A. (corp)"

### Requirement: Custom segment formatting

The `formatLogin` and `formatSite` options SHALL replace the formatting of the login and the site segments; a segment they turn into an empty string SHALL be skipped.

#### Scenario: Custom formatters

- **WHEN** `formatSite` returns the site unchanged and, in another call, `formatLogin` wraps the login as `[@mroot]`
- **THEN** the results are "Root M. A. corp" and "Root M. A. [@mroot]"

### Requirement: Bidirectional isolation of the text

When the isolation option of `KbqUsernameTextOptions` is `true`, `kbqBuildUsernameText` SHALL wrap every segment in U+2068 FIRST STRONG ISOLATE and U+2069 POP DIRECTIONAL ISOLATE. The option SHALL default to off, and without it the result MUST NOT contain these characters.

#### Scenario: Right-to-left name

- **WHEN** a Hebrew name, the login `mroot` and the site `corp` are joined with the isolation option set to `true`
- **THEN** each of the three segments is enclosed in U+2068 and U+2069
- **AND** without the option the result contains neither character

### Requirement: Tooltip with the full name

In `stacked` and `inline` modes outside compact mode, the primary part SHALL carry a truncation tooltip (`kbq-title`) whose text is the name rendered from `fullNameFormat` with every `.` removed, so no field is abbreviated. As with any `kbq-title`, the tooltip SHALL appear only while the name is cut.

#### Scenario: Default format

- **WHEN** `userInfo` is `{ firstName: 'Maxwell', middleName: 'Alan', lastName: 'Root' }`
- **THEN** the tooltip text of the primary part is "Root Maxwell Alan"

#### Scenario: Mapping with lowercase keys only

- **WHEN** a scoped mapping maps only `f` and `l`
- **THEN** the tooltip text is the full last and first names, "Root Maxwell"

### Requirement: Tooltip of the login

In `stacked` and `inline` modes outside compact mode, the secondary part SHALL carry a truncation tooltip whose text is the login followed by the site in parentheses when the profile has a site.

#### Scenario: Cut login with a site

- **WHEN** the login `mroot` with the site `corp` is cut and the user hovers it
- **THEN** the tooltip reads "mroot (corp)"

### Requirement: Tooltip in compact mode

In compact mode in `stacked` and `inline` modes, the single part SHALL carry a truncation tooltip whose text is the unabbreviated name, or the login when the profile yields no name, followed by the site in parentheses when the profile has a site.

#### Scenario: Cut compact username

- **WHEN** `isCompact` is set, the profile has a name and the site `corp`, and the part is cut
- **THEN** the tooltip reads the unabbreviated name followed by "(corp)"

### Requirement: No tooltips in text mode

In `text` mode no part of the default view MUST carry a truncation tooltip.

#### Scenario: Text mode

- **WHEN** `mode` is `text`
- **THEN** no element of the username has the `kbq-title` directive
- **AND** the name and the login are still rendered

### Requirement: Right-to-left text

The name SHALL take its direction from its own first strong character, and the name, the login and the site hint SHALL each be laid out as an isolated directional run, so a right-to-left name next to a left-to-right login keeps the order of the parts and the parentheses stay attached to the site.

#### Scenario: Hebrew name in a right-to-left container

- **WHEN** a profile with a Hebrew name, the login `mroot` and the site `corp` is rendered inside `dir="rtl"`
- **THEN** the name is read first from the right, followed by "mroot" and "(corp)" with the parentheses around "corp"

### Requirement: Site label for assistive technology

When the site is rendered, the component SHALL place a visually hidden label holding the localized `siteLabel` right before the site hint, so assistive technology can tell what the parenthetical names. The label MUST NOT be visible.

#### Scenario: Default label

- **WHEN** `userInfo` is `{ lastName: 'Root', login: 'mroot', site: 'corp' }` and no locale is configured
- **THEN** a `cdk-visually-hidden` element holds the `siteLabel` of `KBQ_USERNAME_DEFAULT_LOCALE_CONFIGURATION`

### Requirement: No accessibility violations

The default view of a profile SHALL have no axe-core violations.

#### Scenario: Axe check

- **WHEN** axe-core runs on a username with a name and a login
- **THEN** it reports no violations

### Requirement: Localized site label

`siteLabel` SHALL follow the active locale of `KBQ_LOCALE_SERVICE` when the application provides one, and otherwise come from `KBQ_USERNAME_LOCALE_CONFIGURATION`, whose default is the `ru-RU` string. `kbqUsernameLocaleConfigurationProvider()` SHALL override it for the injector it is provided in, and an enclosing `kbqLocaleOverrides` SHALL override it for one region.

#### Scenario: Provider override

- **WHEN** `kbqUsernameLocaleConfigurationProvider({ siteLabel: 'site' })` is provided and a profile with a site is rendered
- **THEN** the hidden label reads "site"

#### Scenario: Switching the locale

- **WHEN** the application provides the locale service and switches it to `en-US`
- **THEN** the hidden label reads "site"

### Requirement: Exported format constants

`kbqDefaultFullNameFormat` SHALL be `lf.m.`, `kbqDefaultFullNameFormatCustom` SHALL be `L f. m.`, and the `KbqUsernameFormatKey` enum SHALL have the values `f`, `F`, `m`, `M`, `l`, `L` and `.`.

#### Scenario: Reading the constants

- **WHEN** a consumer imports the constants from `@koobiq/components/username`
- **THEN** they hold exactly these values
