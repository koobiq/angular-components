`KbqContentPanel` - выезжающая сбоку панель, которая сдвигает соседний контент. Часто используется, чтобы реализовать режим быстрого просмотра сущности из таблицы.

<!-- example(content-panel-overview) -->

### Взаимодействие с клавиатурой

По умолчанию клавиша `ESCAPE` закрывает панель, но вы можете отключить это поведение с помощью атрибута `disableCloseByEscape`:

```html
<kbq-content-panel-container disableCloseByEscape>...</kbq-content-panel-container>
```
