`KbqMarkdown` - компонент, который позволяет преобразовывать текст, написанный на языке разметки _Markdown_, в _HTML_.

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Обрати внимание</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Для работы компонента, необходимо наличие [`marked`](https://github.com/markedjs/marked) зависимости:

```bash
npm install marked
```

</div>
</div>

### Заголовки

<!-- example(markdown-headers) -->

### Абзац

<!-- example(markdown-paragraph) -->

### Выделение текста

<!-- example(markdown-selection) -->

### Цитата

<!-- example(markdown-quote) -->

### Списки

<!-- example(markdown-list) -->

### Код

<!-- example(markdown-code) -->

### Блок кода

<!-- example(markdown-code-block) -->

### Горизонтальный разделитель

<!-- example(markdown-divider) -->

### Ссылка

<!-- example(markdown-link) -->

### Изображение

<!-- example(markdown-image) -->

### Таблица

<!-- example(markdown-table) -->

### Перенос строки

Для создания переноса строки в шаблоне компонента необходимо добавить два пробела `&#32;&#32;` в конце строки.

<!-- example(markdown-line-break) -->

При использовании атрибута `markdownText` необходимо добавить `\n` в конце строки, предварительно включив опцию конфигурации `{ breaks: true }`.

<!-- example(markdown-line-break-with-markdown-text-input) -->
