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

When a date is missing or cannot be parsed, the pipe renders an empty string. The input types allow this: a binding that has not been populated yet is `null` or `undefined`, not a date, and for the range and duration pipes that applies to the whole `[from, to]` tuple as well as to a bound inside it.

The range pipes that support an opened range — `kbqRangeShortDate`, `kbqRangeLongDate`, `kbqRangeShortDateTime`, `kbqRangeLongDateTime` — render an empty string only when both bounds are missing or invalid; a single valid bound switches them to the opened-range format instead. `kbqRangeMiddleDateTime` and the duration pipes need both bounds, so they render an empty string as soon as either one is missing or invalid; the duration pipes additionally render an empty string when the start is later than the end.

Call the `DateFormatter` methods directly if you need to be told about the error instead of hiding it — they throw.

#### Custom formats

Formats that have no pipe are available through `DateFormatter`: its public `config` field holds the templates of the active locale.

```typescript
private readonly formatter = inject<DateFormatter<DateTime>>(DateFormatter);

format(from: DateTime, to: DateTime): string {
    return this.formatter.rangeDate(from, to, this.formatter.config.rangeTemplates.closedRange.middle);
}
```

`absoluteDate`, `relativeDate`, `rangeDateTime`, `duration` and `openedRangeDate` work the same way — they take a template as an argument.

### Time zone

By default dates are rendered in the time zone of the host the code runs on: the user's zone in the browser, the server's zone during server-side rendering. The `KBQ_DATE_TIMEZONE` token sets the zone once for the whole application — the pipes, `DateFormatter`, the calendar and the date inputs all switch to it, so there is no offset to pass to every pipe.

```typescript
bootstrapApplication(App, {
    providers: [kbqDateTimezoneProvider('Europe/Moscow')]
});
```

The token accepts:

| Value                      | Example                              | Notes                              |
| -------------------------- | ------------------------------------ | ---------------------------------- |
| IANA zone name             | `'Europe/Moscow'`                    | Follows the DST rules of that zone |
| Offset in minutes from UTC | `180`, `-330`                        | Fixed, with no DST                 |
| Offset as a string         | `'+03:00'`, `'UTC+3'`, `'GMT+05:30'` | The same, written out              |
| `'utc'`                    |                                      |                                    |
| `'system'`                 |                                      | The default — the zone of the host |

An unknown zone name does not break rendering: dates stay in the host zone and a warning is logged in development mode. The same applies to an offset outside `±14:00`, the widest any zone has ever used; a fractional offset is rounded to whole minutes.

#### Changing the zone at runtime

`KbqDateTimezoneService.setTimezone()` changes the zone without a reload, and the `kbq*` pipes re-render:

```typescript
private readonly timezoneService = inject(KbqDateTimezoneService);

setUserTimezone(timezone: string) {
    this.timezoneService.setTimezone(timezone);
}
```

Pure pipes (the ones without the `kbq` prefix) do not react to a zone change, exactly as they do not react to a locale change.

#### A zone for part of the application

The zone reaches the pipes through the date adapter and `DateFormatter`, and those read `KbqDateTimezoneService` from the injector that created them. `kbqDateTimezoneProvider` provides that service alongside the token, so scoping a zone to a subtree means listing it with the adapter and the formatter:

```typescript
@Component({
    providers: [
        kbqDateTimezoneProvider('Asia/Tokyo'),
        { provide: DateAdapter, useClass: LuxonDateAdapter },
        DateFormatter
    ]
})
```

#### Server-side rendering

With SSR the page is rendered in the server zone and re-rendered in the browser zone after hydration. When the two differ, every date on the page changes at once, which reads as flickering. To avoid it, the server and the client have to receive the same `KBQ_DATE_TIMEZONE` value.

The most reliable way to pass it is `TransferState`: the server resolves the zone from a cookie (or from the user profile) and puts it into the state, and the client reads the resolved value — so the two match even when there is no cookie yet.

```typescript
// server config
export const serverConfig = mergeApplicationConfig(appConfig, {
    providers: [
        provideServerRendering(),
        {
            provide: KBQ_DATE_TIMEZONE,
            useFactory: () => {
                const timezone = readTimezoneCookie(inject(REQUEST, { optional: true })) ?? 'utc';

                inject(TransferState).set(TIMEZONE_KEY, timezone);

                return timezone;
            }
        }
    ]
});

// browser config — take exactly what the server rendered with
export const appConfig: ApplicationConfig = {
    providers: [
        {
            provide: KBQ_DATE_TIMEZONE,
            useFactory: () => inject(TransferState).get(TIMEZONE_KEY, 'utc')
        }
    ]
};
```

On the very first visit there is no cookie yet, and the page renders with the fallback (`'utc'` in the example). After hydration, compare it with `Intl.DateTimeFormat().resolvedOptions().timeZone`, write the cookie and, if the zone has to apply right away, call `setTimezone()` — that is a single re-render, and only on the first visit. When the zone is stored in the user profile on the server, even the first visit avoids it.

### Absolute date

<!-- example(absolute-date-formatter) -->

### Relative date

<!-- example(relative-date-formatter) -->

### Date range

<!-- example(range-date-formatter) -->

### Duration

<!-- example(duration-date-formatter) -->
