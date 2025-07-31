Для форматирования дат необходимо использовать методы DateFormatter'а,
например:

```typescript
const formattedStringOfDate = this.formatter.absoluteLongDate(this.adapter.today());
```

Так же можно использовать pipe:

```html
<div>{{ adapter.today() | absoluteLongDate }}</div>
```

Название пайпа (absoluteLongDate) соответствует названию метода DateFormatter. Примеры с использованием можно посмотреть [здесь](https://github.com/koobiq/angular-components/tree/main/packages/components-dev/date-pipes)

### Абсолютная дата

<!-- example(absolute-date-formatter) -->

### Относительная дата

<!-- example(relative-date-formatter) -->

### Диапазон дат

<!-- example(range-date-formatter) -->

### Продолжительность

<!-- example(duration-date-formatter) -->
