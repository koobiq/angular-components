Time range selection menu. The user can choose one of the preset values or specify the time range manually.

<!-- example(time-range-overview) -->

### Trigger element

The component allows you to customize the trigger element. For example, it can be a button, a field, or a pseudo-link.

<!-- example(time-range-custom-trigger) -->

### Custom presets

When there are no preset values, only the start and end of the period remain in the window.

<!-- example(time-range-empty-type-list) -->

### Selection restriction

You can configure the minimum and maximum date through `minDate` and `maxDate`.

Both bounds take the time into account, not just the date. If you set `maxDate` to 31 December with no time, midnight is the only choice — to make the whole day available, set the time to 23:59.

The bounds are shown in the picker: next to the "Period" option, or under the "to" field when there are no presets.

<!-- example(time-range-min-max) -->

### Custom time ranges

The component allows you to set custom time range options.

<!-- example(time-range-custom-range-types) -->
