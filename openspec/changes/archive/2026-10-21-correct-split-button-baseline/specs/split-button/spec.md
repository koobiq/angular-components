# Spec Delta

## MODIFIED Requirements

### Requirement: Menu opens toward the start

When one of its buttons is a dropdown trigger (`kbqDropdownTriggerFor`), the split button SHALL set that dropdown's `xPosition` to `before`. With the dropdown's default `overlapTriggerX`, the menu's end edge then lines up with the trigger's end edge and the menu extends toward the start; when it does not fit there, the dropdown's own fallback SHALL apply, which opens the menu from the trigger's start edge toward the end when it fits that way.

#### Scenario: Split button with a menu

- **WHEN** the second button of a split button is a dropdown trigger
- **THEN** the dropdown's `xPosition` is `before`

#### Scenario: Not enough room toward the start

- **WHEN** the open menu is wider than the space between the trigger's end edge and the start of the viewport, and fits between the trigger's start edge and the end of the viewport
- **THEN** the menu opens from the trigger's start edge toward the end

### Requirement: Menu width follows the trigger by default

With `panelAutoWidth` false, its default, the menu SHALL be sized against the dropdown trigger alone, as a standalone dropdown is. With the dropdown's default `panelWidth` or `panelWidth="auto"`, the menu SHALL never be narrower than the trigger or than the dropdown's `panelMinWidth` (200 px by default); an explicit `panelWidth` SHALL be the exact width of the menu, with neither floor.

#### Scenario: Narrow trigger

- **WHEN** `panelAutoWidth` is false, the dropdown's `panelWidth` is the default, the trigger is 50 px wide and the split button 600 px
- **THEN** the open menu has a minimum width of 200 px

#### Scenario: Explicit panel width

- **WHEN** `panelAutoWidth` is false, the trigger is 50 px wide and the dropdown has `panelWidth` 150
- **THEN** the open menu is 150 px wide, below the default `panelMinWidth`
