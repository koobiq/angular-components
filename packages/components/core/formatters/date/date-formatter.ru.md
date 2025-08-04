DateFormatter — унифицированная система форматирования дат и времени. Она обеспечивает единообразное отображение во всех частях приложения и соответствует корпоративным стандартам.

DateFormatter автоматически отслеживает изменения локали через KbqLocaleService и обновляет форматы при смене языка интерфейса.

### Методы в TypeScript-коде

Методы DateFormatter позволяют форматировать дату и время непосредственно в TypeScript-коде:

```typescript
const formattedStringOfDate = this.formatter.absoluteLongDate(this.adapter.today());
```

### Pipe в шаблонах

Для форматирования в HTML-шаблонах предназначен специальный pipe:

```html
<div>{{ adapter.today() | absoluteLongDate }}</div>
```

Названия pipe полностью соответствуют методам DateFormatter. [Примеры использования](https://github.com/koobiq/angular-components/tree/main/packages/components-dev/date-pipes)

### Доступные форматы

#### Абсолютная дата

<!-- example(absolute-date-formatter) -->

#### Относительная дата

<!-- example(relative-date-formatter) -->

#### Диапазон дат

<!-- example(range-date-formatter) -->

#### Продолжительность

<!-- example(duration-date-formatter) -->
