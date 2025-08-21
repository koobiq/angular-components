Компонент **Clamped Text** помогает аккуратно показать длинный текст. В свернутом виде он оставляет только заданное число строк, а при разворачивании показывает весь текст.

<!-- example(clamped-text-overview) -->

### Количество строк

По умолчанию текст обрезается после 5 строк. Атрибут `rows` задает, сколько строк показывать в свернутом виде:

```html
<kbq-clamped-text [rows]="3">
    In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim originates from
    many different sources. More sophisticated strategies are required to mitigate this type of attack; simply
    attempting to block a single source is insufficient as there are multiple sources.
</kbq-clamped-text>
```

### Одна строка не сворачивается

Если скрытая часть содержит всего одну строку, компонент показывает её сразу. Кнопка «Развернуть» не появляется, потому что текст уже занимает ту же высоту, что и свернутая часть с кнопкой.
