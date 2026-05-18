`KbqContentPanel` - выезжающая сбоку панель, которая сдвигает соседний контент. Часто используется, чтобы реализовать режим быстрого просмотра сущности из таблицы.

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Обрати внимание</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Компонент использует [Scrollbar](/ru/components/scrollbar), поэтому необходимо установить его зависимости:

```bash
npm install overlayscrollbars@2.7.3
```

</div>
</div>

<!-- example(content-panel-overview) -->

### Грид и контент-панель

<!-- example(content-panel-with-grid) -->

### Открытие и закрытие

Панель может быть открыта или закрыта с помощью методов `toggle()`, `open()` и `close()`.

### Ширина панели

Ширина панели настраивается при помощи атрибута `width`, `minWidth` и `maxWidth`.

```html
<kbq-content-panel-container width="400" minWidth="300" maxWidth="500">
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```

### Взаимодействие с клавиатурой

По умолчанию клавиша `ESCAPE` закрывает панель, но вы можете отключить это поведение с помощью атрибута `disableCloseByEscape`:

```html
<kbq-content-panel-container disableCloseByEscape>
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```
