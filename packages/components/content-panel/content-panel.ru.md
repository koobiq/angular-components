`KbqContentPanel` - выезжающая сбоку панель, которая сдвигает соседний контент. Часто используется, чтобы реализовать режим быстрого просмотра сущности из таблицы.

<!-- example(content-panel-overview) -->

### Грид и контент-панель

<!-- example(content-panel-with-grid) -->

### Открытие и закрытие

Панель может быть открыта или закрыта с помощью методов `toggle()`, `open()` и `close()`.

### Ширина панели

Ширина панели настраивается при помощи атрибута `width`, `minWidth` и `maxWidth`. По умолчанию: `width="640"`, `minWidth="480"` и `maxWidth="800"`.

```html
<kbq-content-panel-container width="400" minWidth="300" maxWidth="500">
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```

### Реакция на события прокрутки

Для реакции на прокрутку внутри `<kbq-content-panel-container>` или `<kbq-content-panel>`, вы можете получить экземпляры `CdkScrollable` и подписаться на их observable `elementScrolled()`.

<!-- example(content-panel-scroll-events) -->

### Взаимодействие с клавиатурой

По умолчанию клавиша `ESCAPE` закрывает панель, но вы можете отключить это поведение с помощью атрибута `disableCloseByEscape`:

```html
<kbq-content-panel-container disableCloseByEscape>
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```
