# datepicker-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`).
Reports subclasses of the datepicker classes and direct calls of their `ngOnChanges`. It never writes to the tree.

## Background

The decorator inputs of `KbqDatepicker`, `KbqDatepickerInput`, `KbqDatepickerToggleIconComponent`, `KbqCalendar`,
`KbqCalendarHeader` and `KbqMonthView` are signal inputs named `<member>Input`, handed to the unchanged member from
`ngOnChanges`. Reading and writing the members works as before.

| Use                                         | What to do                                                            |
| ------------------------------------------- | --------------------------------------------------------------------- |
| A subclass with its own `ngOnChanges`       | Mark it `override` and call `super.ngOnChanges(changes)`              |
| A subclass that redeclared an `@Input()`    | Override the `<member>Input` signal input, e.g. `minInput`            |
| `ngOnChanges` called with a `SimpleChanges` | Key it by `<member>Input` (`minDateInput`), or bind the input instead |

## Running it manually

```bash
ng g @koobiq/components:datepicker-signals --project "<your project>"
```
