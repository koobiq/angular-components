## MODIFIED Requirements

### Requirement: Whitespace at the edges of the text

The link SHALL remove the space, tab, line feed, carriage return and form feed characters at the start and the end of its text where a text node stands at that edge, the anchors of control-flow blocks aside, so that a formatted template adds no underlined space. Whitespace inside an element at an edge of the text, whitespace inside the text and non-breaking spaces SHALL be kept. The text SHALL be trimmed again after it changes, including text projected through another component.

#### Scenario: Formatted template

- **WHEN** the text "Save" stands on its own line between a prefix and a suffix icon
- **THEN** the text element reads exactly "Save"

#### Scenario: Interpolated text changes

- **WHEN** the interpolated text changes from "first" to "second"
- **THEN** the text element reads exactly "second"

#### Scenario: Spaces inside the text

- **WHEN** the text has three spaces between `Save` and `report`
- **THEN** the three spaces between the words are kept

#### Scenario: Text projected through a wrapper

- **WHEN** a wrapper component projects its content into a link and the projected text changes
- **THEN** the text element reads exactly the new text
