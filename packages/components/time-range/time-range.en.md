Time range selection menu. The user can choose one of the preset values or specify the time range manually.

<!-- example(time-range-overview) -->

### Trigger element

The component allows you to customize the trigger element. For example, it can be a button, a field, or a pseudo-link.

<!-- example(time-range-custom-trigger) -->

#### Trigger inside a field

`kbq-time-range-title-as-control` puts the trigger inside a `kbq-form-field`, so the range gets a label,
a hint and the error styling of a regular field. `kbqTimeRangeTitlePlaceholder` styles the text shown
while there is no value — set `[nonNullable]="false"` for that state to be reachable at all.

<!-- example(time-range-as-form-field) -->

### Custom presets

When there are no preset values, only the start and end of the period remain in the window.

<!-- example(time-range-empty-type-list) -->

### Selection restriction

You can configure the minimum and maximum date. For example, a range from 2015 to 2017.

<!-- example(time-range-min-max) -->

### Custom time ranges

The component allows you to set custom time range options.

<!-- example(time-range-custom-range-types) -->

### Providing presets through DI

The list of options and the options themselves are data, so both can be replaced without touching the
template:

- `KBQ_DEFAULT_TIME_RANGE_TYPES` replaces the default list of options (`defaultTimeRangeTypes`) for
  every `kbq-time-range` below the provider. `[availableTimeRangeTypes]` overrides it per component.
- `KBQ_CUSTOM_TIME_RANGE_TYPES` registers options the built-in list does not have. Each entry carries
  its identifier, its duration (`units`) and the unit its label is formatted in (`translationType`),
  or a fixed `range` instead of a duration.

```ts
providers: [
    {
        provide: KBQ_CUSTOM_TIME_RANGE_TYPES,
        useValue: [{ type: 'last3Weeks', units: { weeks: -3 }, translationType: 'weeks' }]
    },
    { provide: KBQ_DEFAULT_TIME_RANGE_TYPES, useValue: ['lastHour', 'last3Weeks', 'range'] }
];
```

### Empty value and value correction

`nonNullable` (default `true`) decides what a `null` written through the form control means. While it
is `true`, `null` is replaced with the first available option and the trigger always shows a range;
set it to `false` to let the component hold no value and render the placeholder.

`valueCorrected` fires whenever the component had to change the value it was given — a type that is
not in `availableTimeRangeTypes`, a `range` missing one of its ends, or a `null` under `nonNullable`.
It emits the corrected value so that a host can write it back, and it stays silent when the value is
already the one the component would produce.

### Properties

| Name                      | Type                                                | Default                 | Description                                                                     |
| ------------------------- | --------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `minDate`                 | `T`                                                 | —                       | The earliest date the calendars offer and the validation accepts.               |
| `maxDate`                 | `T`                                                 | —                       | The latest date the calendars offer and the validation accepts.                 |
| `defaultRangeValue`       | `KbqRangeValue<T>`                                  | yesterday → today       | Seeds the from/to pair of the manual range.                                     |
| `availableTimeRangeTypes` | `KbqTimeRangeType[]`                                | `defaultTimeRangeTypes` | The options the editor offers, in order. The first one is selected by default.  |
| `showRangeAsDefault`      | `boolean`                                           | `true`                  | Keeps the manual range visible even when `range` is not in the list of options. |
| `nonNullable`             | `boolean`                                           | `true`                  | Falls back to a default value instead of holding `null`.                        |
| `arrow`                   | `boolean`                                           | `true`                  | Whether the popover is drawn with an arrow.                                     |
| `titleTemplate`           | `TemplateRef<KbqTimeRangeCustomizableTitleContext>` | —                       | Replaces the built-in trigger.                                                  |
| `optionTemplate`          | `TemplateRef<KbqTimeRangeOptionContext>`            | —                       | Replaces the built-in rendering of an option in the editor.                     |
| `valueCorrected`          | `EventEmitter<KbqTimeRangeRange>`                   | —                       | Emits the corrected value when the provided one could not be used as is.        |
