# Popover component

## API

| Property               | Description                                                                                                                                                                              | Type                  | Default |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|---------|
| kbqPlacement            | Место для показа относительно элемента, к которому он привязан. Возможные значения: top, bottom, left, right                                                                             | string                | bottom  |
| kbqTrigger              | Триггер для показа Возможные значения: hover, manual, click, focus                                                                                                                       | string                | hover   |
| kbqVisible              | Ручное управление показом, используется только при kbqTrigger="manual"                                                                                                             | boolean               | false   |
| kbqPopoverHeader        | Содержимое шапки Обрати  внимание: если используешь строку, то используй аккуратно, желательно  предварительно сделать escape строки, чтобы избежать потенциальной XSS  уязвимости.      | string | ng-template  | –       |
| kbqPopoverContent       | Содержимое компонента Обрати  внимание: если используешь строку, то используй аккуратно, желательно  предварительно сделать escape строки, чтобы избежать потенциальной XSS  уязвимости. | string | ng-template  | –       |
| kbqPopoverFooter        | Содержимое подвала Обрати  внимание: если используешь строку, то используй аккуратно, желательно  предварительно сделать escape строки, чтобы избежать потенциальной XSS  уязвимости.    | string | ng-template  | –       |
| kbqPopoverDisabled      | Флаг для запрета показа                                                                                                                                                                  | boolean               | false   |
| kbqPopoverClass         | Добавление своих классов                                                                                                                                                                 | string | string[]     | –       |
| kbqVisibleChange        | Callback на изменение видимости компонента                                                                                                                                               | EventEmitter<boolean> | –       |

## Example

```html
<ng-template #customContent>
    Э́йяфьядлайё̀кюдль — шестой по величине ледник Исландии. Расположен на юге Исландии в 125 км к востоку от Рейкьявика. Под этим ледником находится одноимённый вулкан конической формы.
</ng-template>
 
<button
    kbqPopover
    [kbqTrigger]="'hover'"
    [kbqPlacement]="'top'"
    [kbqPopoverHeader]="'Это header'"
    [kbqPopoverContent]="customContent">
    Найти Эйяфьядлайёкюдль
</button>
```
