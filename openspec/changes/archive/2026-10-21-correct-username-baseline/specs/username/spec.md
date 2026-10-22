# Spec Delta

## MODIFIED Requirements

### Requirement: Default view of a profile

Outside compact mode, given a `userInfo` profile and no custom view, the component SHALL render the formatted name as the primary part, then the login as the secondary part, with the site in parentheses inside the secondary part as its hint. These parts SHALL carry the classes `kbq-username__primary`, `kbq-username__secondary` and `kbq-username__secondary-hint`. In compact mode the login and the site are placed as the compact mode requirements describe.

#### Scenario: Full profile

- **WHEN** `userInfo` is `{ firstName: 'Maxwell', middleName: 'Alan', lastName: 'Root', login: 'mroot', site: 'corp' }` and `isCompact` is not set
- **THEN** the component reads "Root M. A. mroot (corp)"
- **AND** "Root M. A." is in the `kbq-username__primary` element, "mroot" in the `kbq-username__secondary` element and "(corp)" in the `kbq-username__secondary-hint` element inside it

### Requirement: Nothing to render

Without a `userInfo` profile the component MUST render none of its default parts. Outside compact mode the same SHALL hold for a profile that yields neither a name nor a login. In compact mode such a profile SHALL still get the primary part: empty, or holding only the site in parentheses when the profile has a `site`.

#### Scenario: No profile

- **WHEN** `userInfo` is not bound
- **THEN** the component renders no primary or secondary part

#### Scenario: Empty profile

- **WHEN** `userInfo` is `{}`
- **THEN** the component has no text content

#### Scenario: Site only outside compact mode

- **WHEN** `userInfo` is `{ site: 'corp' }` and `isCompact` is not set
- **THEN** the component renders no primary or secondary part

#### Scenario: Site only in compact mode

- **WHEN** `userInfo` is `{ site: 'corp' }` and `isCompact` is set
- **THEN** the component renders the primary part, which shows "(corp)"

### Requirement: Visual styles

`default` SHALL show the login and the site in the secondary text color, also when the profile has no name, except in compact mode, where a login shown in place of the name takes the color of the name. `error` SHALL show every part in the error color. `accented` SHALL show the name in the strong weight and the login and the site in the color of the name. `inherit` SHALL take the color, the font and the `display` value from the parent element, in place of the layout of the mode.

#### Scenario: Login without a name in the default style

- **WHEN** `type` is `default`, `userInfo` is `{ login: 'mroot', site: 'corp' }` and `isCompact` is not set
- **THEN** "mroot (corp)" is shown in the secondary text color

#### Scenario: Inside a link

- **WHEN** a username with `type` set to `inherit` is placed inside a `kbqLink` anchor
- **THEN** it is shown in the color of the link

#### Scenario: Login without a name in compact mode

- **WHEN** `type` is `default`, `isCompact` is set and `userInfo` is `{ login: 'mroot', site: 'corp' }`
- **THEN** "mroot" is shown in the color of the name
- **AND** "(corp)" is shown in the secondary text color
