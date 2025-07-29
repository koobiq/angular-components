`KbqContentPanel` - выезжающая сбоку панель, которая сдвигает соседний контент. Часто используется, чтобы реализовать режим быстрого просмотра сущности из таблицы.

<!-- example(content-panel-overview) -->

### Открытие и закрытие

Панель может быть открыта или закрыта с помощью методов `toggle()`, `open()` и `close()`.

```html
<kbq-content-panel-container #panel="kbqContentPanelContainer">
    <button (click)="panel.toggle()">переключить видимость</button>
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```

Открытое состояние также может быть установлено через свойство `opened`, которое поддерживает двустороннее связывание.

```html
<kbq-content-panel-container [(opened)]="opened">
    <button (click)="opened = !opened">переключить видимость</button>
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```

### Реакция на события прокрутки

Для реакции на прокрутку внутри `<kbq-content-panel-container>` или `<kbq-content-panel>`, вы можете получить экземпляры `CdkScrollable` и подписаться на их observable `elementScrolled()`.

<!-- example(content-panel-scroll-events) -->

### Взаимодействие с клавиатурой

По умолчанию клавиша `ESCAPE` закрывает панель, но вы можете отключить это поведение с помощью атрибута `disableCloseByEscape`:

```html
<kbq-content-panel-container disableCloseByEscape>...</kbq-content-panel-container>
```
