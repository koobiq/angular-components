# uninitialized-members

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.1.0-0`).
Reports reads of members that are `| undefined` now and the contracts that became a constructor or abstract members.
It never writes to the tree.

## Background

The library left some fields unset until a lifecycle hook ran or an overlay opened, and some getters returned
`undefined`, while their types promised a value. The types say `| undefined` now. Behaviour is unchanged: a read
that used to throw `TypeError` on `undefined` now fails to compile instead.

| Change                                                                                                             | Manual migration                                                     |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `selectionModel`, `selected`, `keyManager`, `trigger` and the other members listed in the guide are `\| undefined` | Check the value, or add `!` where the code runs after initialization |
| `new KbqCheckboxChange()`, `new KbqToggleChange()`, `new KbqTabChangeEvent()` take constructor arguments           | Pass the values instead of assigning them after `new`                |
| A class that `extends KbqFormFieldControl` or `KbqPopUp`                                                           | Declare the abstract members                                         |

The patterns match by name inside files that use the library types, so a report can point at an unrelated object.

## Running it manually

```bash
ng g @koobiq/components:uninitialized-members --project "<your project>"
```
