# Proposal

## Why

The baseline spec of `time-range` states behaviour the code does not have. A static audit of `openspec/specs/time-range/spec.md` against `packages/components/time-range` and the `core`, `popover`, `link` and `form-field` pieces it wires up, at `c9c196a9b`, found eighteen requirements whose descriptions contradict the source in some case; their scenarios hold and stay as they are.

## What Changes

- **Opening the editor from the keyboard**: only `kbqLink` on the built-in trigger cancels the default action of Space. Enter and Space on a focused element of a custom trigger reach the popover's own `keydown` listener, which opens the popover without cancelling anything, so Space on a `kbq-time-range-title-as-control` scrolls the page. The requirement is now scoped to the built-in trigger and says what a custom trigger does.
- **Popover placement and arrow**: the preferred placement is `bottomLeft`, whose `start` edges follow the text direction, so the popover is aligned to the right edge of the trigger in a right-to-left layout. The requirement now names the start edge.
- **Preset options in the editor**: the radio group, the `range` option included, is rendered only when the list holds a type other than `range`; a list of `['range']` renders no radio option. The requirement now says so.
- **Option checked on open**: the editor runs the opened value through the same correction as a written one, so an applied `range` that `availableTimeRangeTypes` does not hold (allowed by `showRangeAsDefault`) reopens on the first type. With an empty list there is no `range` option to check, and the first opening after `null` is written later on falls back to the first type of the application-wide default list. The requirement now describes the selected type.
- **Visibility of the manual range**: with no type other than `range` in the list, the from/to fields are shown without a `range` option. The requirement now ties the option to the presets.
- **Editor without presets**: an empty list with `showRangeAsDefault` set to `false` renders an empty editor, and a list of `['range']` behaves like an empty one. The requirement now covers both.
- **Manual range fields**: without presets the fields are editable with no option checked. The requirement now ties the fields to the `range` type rather than to its option.
- **Default manual range**: the default range is a `computed` that reads the clock without tracking it, so its "now" is the moment the time range was created, or the last change of `minDate`, `maxDate` or `defaultRangeValue`, not the moment the popover opens. The requirement now says so.
- **Default manual range within the bounds**: the end of a range opened upwards from `minDate` is clamped again, so it stops at `maxDate` when the bounds are less than a day apart. The requirement now includes the clamp.
- **Shape of the value**: a custom type gets its fixed `range` only when its `translationType` is `'other'`; one with a duration unit gets the duration even when it has a `range`, and an `'other'` type without one gets no dates. The requirement now says so.
- **Closing discards unapplied edits**: the next opening goes through the same correction, so an applied `range` that the list does not hold reopens on the first type. The requirement now says so.
- **Bounds caption**: the caption hangs off the `range` option or the `to` fields, so with the manual range hidden no caption is shown. The requirement is now scoped to a shown manual range.
- **Custom option template**: `formattedValue` is an empty string for every type whose `translationType` is `'other'`, `allTime`, `currentQuarter` and `currentYear` included, whose default labels come from the template instead. The requirement no longer calls it the default label.
- **Date adapter and formatter are required**: the `DateFormatter` of `core` injects `DateAdapter` itself, so with a formatter provided and no adapter, creating the formatter fails first with Angular's missing-provider error and the time range's own message is never thrown. The requirement now states when each message is thrown.
- **Missing dates are filled in**: the dates are computed as applying the type computes them, so `allTime` stays without dates and a custom fixed-range type gets its `range`. The requirement no longer says every preset gets a `startDateTime` from the current time.
- **Writing null**: with an empty list, `null` under `nonNullable` falls back to the first type of the application-wide default list, which only the switch made once after initialization replaces with `range`. The requirement now covers the empty list.
- **Corrections are not written back**: with an empty list from the start, the switch to `range` made once after initialization reaches the bound control although the list did not change. The requirement now names that switch.
- **Disabled state**: `kbq-time-range-title-as-control` follows the disabled state, dropping its `tabindex` and marking its form field `kbq-disabled`, so a custom trigger is not left entirely as is. The requirement now says so.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `time-range`: corrects the requirements "Opening the editor from the keyboard", "Popover placement and arrow", "Preset options in the editor", "Option checked on open", "Visibility of the manual range", "Editor without presets", "Manual range fields", "Default manual range", "Default manual range within the bounds", "Shape of the value", "Closing discards unapplied edits", "Bounds caption", "Custom option template", "Date adapter and formatter are required", "Missing dates are filled in", "Writing null", "Corrections are not written back" and "Disabled state" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-time-range-baseline/` now, and `openspec/specs/time-range/spec.md` once the change is archived. No source, test, example or documentation file changes.
