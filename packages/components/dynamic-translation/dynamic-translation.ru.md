`KbqDynamicTranslation` — компонент для встраивания пользовательских компонентов в переводимые строки.

<!-- example(dynamic-translation-overview) -->

### Добавление компонента

Компонент встраивается в строку с помощью специального синтаксиса: `[[<slotName>:<context>]]`, где `slotName` — ключ зарегистрированного компонента, а `context` — данные, передаваемые в компонент.

<!-- prettier-ignore -->
```html
<!-- Слот с передачей строки -->
<kbq-dynamic-translation text="[[myLinkSlot:Открыть ссылку]]">
    <a *kbqDynamicTranslationSlot="'myLinkSlot'; let context">{{ context }}</a>
</kbq-dynamic-translation>

<!-- Слот с передачей списка -->
<kbq-dynamic-translation text="[[myListSlot:(первый,второй,третий)]]">
    <ul *kbqDynamicTranslationSlot="'myListSlot'; let context">
        @for (item of context; track $index) {
            <li>{{ item }}</li>
        }
    </ul>
</kbq-dynamic-translation>
```

### Основные возможности

- Встраивание компонентов ([ссылки](/ru/components/link), [кнопки](/ru/components/button), [выпадающие списки](/ru/components/dropdown) и др.) в локализованные строки.
- Разделение логики интерфейса от текстов локализации.
- Поддержка нескольких слотов в одной строке.

### Когда использовать

- При необходимости динамически изменять состав и контекст встраиваемых компонентов в зависимости от локализации.
- Если требуется добавить интерактивные элементы ([ссылки](/ru/components/link), [кнопки](/ru/components/button), [выпадающие списки](/ru/components/dropdown) и др.) прямо в переводимый текст.
- Для выделения части текста специальными стилями.
