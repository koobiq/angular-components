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

Each bound is an exact instant rather than a calendar day: a border is checked once its date and its time are put together, so a `maxDate` at `00:00` admits only midnight of that day. To admit the whole day, pass its end — for example `createDateTime(2017, 11, 31, 23, 59, 59, 999)`. The bounds themselves are shown as a caption on the "range" option.

<!-- example(time-range-min-max) -->

### Custom time ranges

The component allows you to set custom time range options.

<!-- example(time-range-custom-range-types) -->
