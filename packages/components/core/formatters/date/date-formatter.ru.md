DateFormatter — унифицированная система форматирования дат и времени. Она обеспечивает единообразное отображение во всех частях приложения и соответствует корпоративным стандартам.

DateFormatter автоматически отслеживает изменения локали через KbqLocaleService и обновляет форматы при смене языка интерфейса.

### Методы в TypeScript-коде

Методы DateFormatter позволяют форматировать дату и время непосредственно в TypeScript-коде:

```typescript
const formattedStringOfDate = this.formatter.absoluteLongDate(this.adapter.today());
```

### Pipe в шаблонах

Для форматирования в HTML-шаблонах предназначены pipe, названия которых соответствуют методам DateFormatter:

```html
<div>{{ adapter.today() | kbqAbsoluteLongDate }}</div>
```

Чтобы pipe работали, нужно импортировать `KbqFormattersModule` — он предоставляет `DateFormatter` и экспортирует все pipe. [Примеры использования](https://github.com/koobiq/angular-components/tree/main/packages/components-dev/date-pipes)

#### Какое семейство выбрать

Один и тот же формат доступен в трёх вариантах:

| Семейство                  | Пример                       | Поведение                                                                                                      |
| -------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `kbq*` — **рекомендуется** | `kbqAbsoluteLongDate`        | Пересчитывается при смене локали через KbqLocaleService, результат кэшируется по значению, аргументам и локали |
| Без префикса               | `absoluteLongDate`           | Pure pipe. Пересчитывается только при изменении входного значения — **при смене локали строка не обновится**   |
| С суффиксом `ImpurePipe`   | `absoluteLongDateImpurePipe` | Impure pipe без кэша: форматирует заново на каждом цикле проверки изменений                                    |

Беспрефиксные и `ImpurePipe`-варианты сохранены для обратной совместимости. В новом коде используйте `kbq*`.

#### Список pipe

| Pipe                       | Входное значение | Аргументы                                      | Метод DateFormatter     |
| -------------------------- | ---------------- | ---------------------------------------------- | ----------------------- |
| `kbqAbsoluteShortDate`     | дата             | `currYear?: boolean`                           | `absoluteShortDate`     |
| `kbqAbsoluteLongDate`      | дата             | `currYear?: boolean`                           | `absoluteLongDate`      |
| `kbqAbsoluteShortDateTime` | дата             | `options?: DateTimeOptions`                    | `absoluteShortDateTime` |
| `kbqAbsoluteLongDateTime`  | дата             | `options?: DateTimeOptions`                    | `absoluteLongDateTime`  |
| `kbqRelativeShortDate`     | дата             | —                                              | `relativeShortDate`     |
| `kbqRelativeLongDate`      | дата             | —                                              | `relativeLongDate`      |
| `kbqRelativeShortDateTime` | дата             | `options?: DateTimeOptions`                    | `relativeShortDateTime` |
| `kbqRelativeLongDateTime`  | дата             | `options?: DateTimeOptions`                    | `relativeLongDateTime`  |
| `kbqRangeShortDate`        | `[от, до]`       | —                                              | `rangeShortDate`        |
| `kbqRangeLongDate`         | `[от, до]`       | —                                              | `rangeLongDate`         |
| `kbqRangeShortDateTime`    | `[от, до]`       | `options?: DateTimeOptions`                    | `rangeShortDateTime`    |
| `kbqRangeMiddleDateTime`   | `[от, до]`       | `options?: DateTimeOptions`                    | `rangeMiddleDateTime`   |
| `kbqRangeLongDateTime`     | `[от, до]`       | `options?: DateTimeOptions`                    | `rangeLongDateTime`     |
| `kbqDurationShortest`      | `[от, до]`       | `options?: DateTimeOptions`                    | `durationShortest`      |
| `kbqDurationShort`         | `[от, до]`       | `units?: DurationUnit[]`, `fraction?: boolean` | `durationShort`         |
| `kbqDurationLong`          | `[от, до]`       | `units?: DurationUnit[]`, `fraction?: boolean` | `durationLong`          |

`DateTimeOptions` — это `{ seconds?: boolean; milliseconds?: boolean; currYear?: boolean }`. `kbqDurationShortest` использует из него только `seconds` (по умолчанию `true`) и `milliseconds`.

```html
<div>{{ [task.startedAt, task.finishedAt] | kbqDurationShortest }}</div>
<div>{{ [task.startedAt, task.finishedAt] | kbqDurationLong: ['hours', 'minutes'] }}</div>
```

#### Открытые диапазоны

Передайте `null` вместо одной из границ — pipe диапазона сам переключится на формат открытого диапазона («С 15 января», «По 20 июня»). Отдельного pipe для этого не требуется.

```html
<div>{{ [filter.from, filter.to] | kbqRangeLongDate }}</div>
```

Исключение — `kbqRangeMiddleDateTime`: у среднего формата нет шаблона открытого диапазона, поэтому он требует обе границы.

#### Пустые и некорректные значения

Если дату не удалось разобрать или она отсутствует, pipe выводит пустую строку. Это отражено в типах: ещё не заполненная привязка — это `null` или `undefined`, а не дата, и для pipe диапазонов и продолжительности это относится как к самому кортежу `[от, до]`, так и к отдельной границе в нём.

Pipe диапазонов, поддерживающие открытый диапазон, — `kbqRangeShortDate`, `kbqRangeLongDate`, `kbqRangeShortDateTime`, `kbqRangeLongDateTime` — выводят пустую строку, только если обе границы отсутствуют или некорректны; если задана хотя бы одна граница, они переключаются на формат открытого диапазона. `kbqRangeMiddleDateTime` и pipe продолжительности требуют обе границы, поэтому выводят пустую строку, если отсутствует или некорректна хотя бы одна из них; pipe продолжительности, кроме того, выводят пустую строку, если начало позже конца.

Если нужно узнать об ошибке, а не скрыть её, вызывайте методы `DateFormatter` напрямую — они бросают исключение.

#### Нестандартные форматы

Форматы, которых нет среди pipe, доступны через `DateFormatter`: у него есть публичное поле `config` с шаблонами текущей локали.

```typescript
private readonly formatter = inject<DateFormatter<DateTime>>(DateFormatter);

format(from: DateTime, to: DateTime): string {
    return this.formatter.rangeDate(from, to, this.formatter.config.rangeTemplates.closedRange.middle);
}
```

Так же работают `absoluteDate`, `relativeDate`, `rangeDateTime`, `duration` и `openedRangeDate` — они принимают шаблон аргументом.

### Часовой пояс

По умолчанию даты показываются в часовом поясе среды, где выполняется код: в браузере — в поясе пользователя, при серверном рендеринге — в поясе сервера. Токен `KBQ_DATE_TIMEZONE` задаёт пояс один раз для всего приложения — в нём начинают работать pipe, `DateFormatter`, календарь и поля ввода дат, поэтому передавать смещение в каждый pipe не нужно.

```typescript
bootstrapApplication(App, {
    providers: [kbqDateTimezoneProvider('Europe/Moscow')]
});
```

Токен принимает:

| Значение                  | Пример                               | Комментарий                                 |
| ------------------------- | ------------------------------------ | ------------------------------------------- |
| Имя пояса IANA            | `'Europe/Moscow'`                    | Учитывает переходы на летнее время          |
| Смещение в минутах от UTC | `180`, `-330`                        | Фиксированное, без перехода на летнее время |
| Смещение строкой          | `'+03:00'`, `'UTC+3'`, `'GMT+05:30'` | То же, в текстовом виде                     |
| `'utc'`                   |                                      |                                             |
| `'system'`                |                                      | Значение по умолчанию — пояс среды          |

Неизвестное имя пояса не ломает отрисовку: даты остаются в поясе среды, а в режиме разработки выводится предупреждение. То же касается смещения за пределами `±14:00` — самого широкого из существовавших; дробное смещение округляется до целых минут.

#### Смена пояса во время работы приложения

`KbqDateTimezoneService.setTimezone()` меняет пояс без перезагрузки страницы, `kbq*` pipe перерисовываются:

```typescript
private readonly timezoneService = inject(KbqDateTimezoneService);

setUserTimezone(timezone: string) {
    this.timezoneService.setTimezone(timezone);
}
```

Pure pipe (без префикса `kbq`) на смену пояса не реагируют — ровно так же, как и на смену локали.

#### Пояс для отдельной части приложения

Пояс приходит к pipe через адаптер дат и `DateFormatter`, а те берут `KbqDateTimezoneService` из инжектора, в котором были созданы. `kbqDateTimezoneProvider` объявляет этот сервис вместе с токеном, поэтому для поддерева его достаточно перечислить рядом с адаптером и форматтером:

```typescript
@Component({
    providers: [
        kbqDateTimezoneProvider('Asia/Tokyo'),
        { provide: DateAdapter, useClass: LuxonDateAdapter },
        DateFormatter
    ]
})
```

#### Серверный рендеринг

При SSR страница отрисовывается в поясе сервера, а после гидратации — в поясе браузера. Если значения различаются, все даты на странице пересчитываются, и это видно как мигание. Чтобы этого не было, сервер и клиент должны получить одно и то же значение `KBQ_DATE_TIMEZONE`.

Надёжнее всего передать пояс через `TransferState`: сервер берёт его из куки (или из профиля пользователя) и кладёт в состояние, а клиент читает готовое значение — тогда оно совпадает даже в том случае, когда куки нет.

```typescript
// конфигурация сервера
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

// конфигурация браузера — берём ровно то, чем рендерил сервер
export const appConfig: ApplicationConfig = {
    providers: [
        {
            provide: KBQ_DATE_TIMEZONE,
            useFactory: () => inject(TransferState).get(TIMEZONE_KEY, 'utc')
        }
    ]
};
```

На первом визите куки ещё нет, и страница отрисуется с запасным значением (`'utc'` в примере). После гидратации сравните его с `Intl.DateTimeFormat().resolvedOptions().timeZone`, запишите куку и, если пояс нужно применить сразу, вызовите `setTimezone()` — это одна перерисовка и только на первом визите. Если пояс хранится в профиле пользователя на сервере, первый визит тоже обойдётся без неё.

### Доступные форматы

#### Абсолютная дата

<!-- example(absolute-date-formatter) -->

#### Относительная дата

<!-- example(relative-date-formatter) -->

#### Диапазон дат

<!-- example(range-date-formatter) -->

#### Продолжительность

<!-- example(duration-date-formatter) -->
