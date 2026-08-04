DateFormatter is a unified system for formatting dates and times. It keeps the presentation consistent across the whole application and follows the corporate standards.

DateFormatter tracks locale changes through KbqLocaleService on its own and updates the formats when the interface language changes.

### Methods in TypeScript code

DateFormatter methods format a date or a time directly in TypeScript code:

```typescript
const formattedStringOfDate = this.formatter.absoluteLongDate(this.adapter.today());
```

### Pipes in templates

Formatting in HTML templates is done with pipes whose names correspond to the DateFormatter methods:

```html
<div>{{ adapter.today() | kbqAbsoluteLongDate }}</div>
```

The pipes need `KbqFormattersModule` to be imported — it provides `DateFormatter` and exports every pipe. [Usage examples](https://github.com/koobiq/angular-components/tree/main/packages/components-dev/date-pipes)

#### Which family to choose

The same format is available in three flavours:

| Family                   | Example                      | Behaviour                                                                                                |
| ------------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `kbq*` — **recommended** | `kbqAbsoluteLongDate`        | Recomputes on a KbqLocaleService locale change, caches the result by value, arguments and locale         |
| No prefix                | `absoluteLongDate`           | A pure pipe. Recomputes only when the input value changes — **the string goes stale on a locale change** |
| `ImpurePipe` suffix      | `absoluteLongDateImpurePipe` | An impure pipe with no cache: reformats on every change detection cycle                                  |

The unprefixed and `ImpurePipe` flavours are kept for backward compatibility. Use `kbq*` in new code.

#### The pipes

| Pipe                       | Input        | Arguments                                      | DateFormatter method    |
| -------------------------- | ------------ | ---------------------------------------------- | ----------------------- |
| `kbqAbsoluteShortDate`     | date         | `currYear?: boolean`                           | `absoluteShortDate`     |
| `kbqAbsoluteLongDate`      | date         | `currYear?: boolean`                           | `absoluteLongDate`      |
| `kbqAbsoluteShortDateTime` | date         | `options?: DateTimeOptions`                    | `absoluteShortDateTime` |
| `kbqAbsoluteLongDateTime`  | date         | `options?: DateTimeOptions`                    | `absoluteLongDateTime`  |
| `kbqRelativeShortDate`     | date         | —                                              | `relativeShortDate`     |
| `kbqRelativeLongDate`      | date         | —                                              | `relativeLongDate`      |
| `kbqRelativeShortDateTime` | date         | `options?: DateTimeOptions`                    | `relativeShortDateTime` |
| `kbqRelativeLongDateTime`  | date         | `options?: DateTimeOptions`                    | `relativeLongDateTime`  |
| `kbqRangeShortDate`        | `[from, to]` | —                                              | `rangeShortDate`        |
| `kbqRangeLongDate`         | `[from, to]` | —                                              | `rangeLongDate`         |
| `kbqRangeShortDateTime`    | `[from, to]` | `options?: DateTimeOptions`                    | `rangeShortDateTime`    |
| `kbqRangeMiddleDateTime`   | `[from, to]` | `options?: DateTimeOptions`                    | `rangeMiddleDateTime`   |
| `kbqRangeLongDateTime`     | `[from, to]` | `options?: DateTimeOptions`                    | `rangeLongDateTime`     |
| `kbqDurationShortest`      | `[from, to]` | `options?: DateTimeOptions`                    | `durationShortest`      |
| `kbqDurationShort`         | `[from, to]` | `units?: DurationUnit[]`, `fraction?: boolean` | `durationShort`         |
| `kbqDurationLong`          | `[from, to]` | `units?: DurationUnit[]`, `fraction?: boolean` | `durationLong`          |

`DateTimeOptions` is `{ seconds?: boolean; milliseconds?: boolean; currYear?: boolean }`. `kbqDurationShortest` uses only `seconds` (`true` by default) and `milliseconds` from it.

```html
<div>{{ [task.startedAt, task.finishedAt] | kbqDurationShortest }}</div>
<div>{{ [task.startedAt, task.finishedAt] | kbqDurationLong: ['hours', 'minutes'] }}</div>
```

#### Opened ranges

Pass `null` instead of one of the bounds and the range pipe switches to the opened-range format ("From January 15", "Until June 20") on its own. No separate pipe is needed for that.

```html
<div>{{ [filter.from, filter.to] | kbqRangeLongDate }}</div>
```

`kbqRangeMiddleDateTime` is the exception: the middle format has no opened-range template, so it requires both bounds.

#### Empty and invalid values

When a date is missing or cannot be parsed, the pipe renders an empty string. For ranges that applies when both bounds are empty; the duration pipes additionally render an empty string when the start is later than the end. Call the `DateFormatter` methods directly if you need to be told about the error instead of hiding it — they throw.

#### Custom formats

Formats that have no pipe are available through `DateFormatter`: its public `config` field holds the templates of the active locale.

```typescript
private readonly formatter = inject<DateFormatter<DateTime>>(DateFormatter);

format(from: DateTime, to: DateTime): string {
    return this.formatter.rangeDate(from, to, this.formatter.config.rangeTemplates.closedRange.middle);
}
```

`absoluteDate`, `relativeDate`, `rangeDateTime`, `duration` and `openedRangeDate` work the same way — they take a template as an argument.

### Absolute date

<!-- example(absolute-date-formatter) -->

### Relative date

<!-- example(relative-date-formatter) -->

### Date range

<!-- example(range-date-formatter) -->

### Duration

<!-- example(duration-date-formatter) -->
