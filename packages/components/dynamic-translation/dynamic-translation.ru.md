`KbqDynamicTranslation` - компонент для встраивания пользовательских компонентов в переводимые строки.

<!-- example(dynamic-translation-overview) -->

### Добавление компонента

Кастомный элемент оборачивается в `[[]]`, параметры передаются через `:`:

```html
<kbq-dynamic-translation text="[[myCustomLinkComponent:Open in a new tab]] to continue working.">
    <a *kbqDynamicTranslationSlot="'myCustomLinkComponent'; let text">{{ text }}</a>
</kbq-dynamic-translation>
```

### Основные возможности

- Подстановка компонентов в строки локализации.
- Отделение логики интерфейса от текстов локализации.

### Когда использовать

- При необходимости встраивания пользовательских компонентов в локализованные строки.
- Когда в переводимом тексте нужны [ссылки](/ru/components/link), [кнопки](/ru/components/button) или другие интерактивные элементы.
- Для выделения части текста специальными стилями.
