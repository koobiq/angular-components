# query-list-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`).
Reports subclasses that redeclare the query members turned into getters, and writes to those members. It never writes
to the tree.

## Background

The remaining decorator queries are signal queries. The members over them are getters that keep their types, so a
read and a subscription to `changes` work as before. Before the content is initialized a `QueryList` is empty rather
than `undefined`.

| Member                                                                                                  | Type         |
| ------------------------------------------------------------------------------------------------------- | ------------ |
| `options` of `KbqSelect`, `KbqAutocomplete` and `KbqListSelection`                                      | `QueryList`  |
| `tags` of `KbqSelect`, `KbqTreeSelect` (protected) and `KbqTagList`                                     | `QueryList`  |
| `KbqListItem.lines`, `KbqRadioGroup.radios`, `KbqTreeSelection.unorderedOptions`                        | `QueryList`  |
| `focusableItems` of `KbqNavbar` and `KbqVerticalNavbar`, `KbqAppSwitcherComponent.allItems` (protected) | `QueryList`  |
| `textElement` of `KbqTag` and `KbqDropdownItem`                                                         | `ElementRef` |
| `KbqCodeBlock.tabLinkTemplate` (protected)                                                              | Signal       |

| Use                                   | What to do                                       |
| ------------------------------------- | ------------------------------------------------ |
| A subclass that redeclared the member | Remove the redeclaration, or override the getter |
| A write to the member                 | Render the items in the template instead         |
| A subclass reading `tabLinkTemplate`  | Call it: `this.tabLinkTemplate()`                |

## Running it manually

```bash
ng g @koobiq/components:query-list-signals --project "<your project>"
```
