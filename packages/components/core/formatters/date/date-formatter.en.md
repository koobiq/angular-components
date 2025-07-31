To format dates, you need to use DateFormatter methods,
for example:

```typescript
const formattedStringOfDate = this.formatter.absoluteLongDate(this.adapter.today());
```

You can also use pipe:

```html
<div>{{ adapter.today() | absoluteLongDate }}</div>
```

The pipe name (absoluteLongDate) corresponds to the name of the DateFormatter method. Examples of usage can be found [here](https://github.com/koobiq/angular-components/tree/main/packages/components-dev/date-pipes)

### Absolute date

<!-- example(absolute-date-formatter) -->

### Relative date

<!-- example(relative-date-formatter) -->

### Date range

<!-- example(range-date-formatter) -->

### Duration

<!-- example(duration-date-formatter) -->
