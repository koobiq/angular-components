`<kbq-progress-bar>` - компонент, отображающий индикатор выполнения.

### Simple progress bar

Элемент `<kbq-progress-bar>` может быть использован отдельно для создания горизонтальной линии прогресса с темой Koobiq.

```html
<kbq-progress-bar></kbq-progress-bar>
```

### Props

#### value

Степень заполнения линии, определяющая прогресс, зависит от свойства value.
Его значение может меняться в диапазоне [0, 100].
Значение по-умолчанию: 0

Такое значение заполнит 30% линии:

```html
<kbq-progress-bar [value]="30"></kbq-progress-bar>
```

<!-- example(progress-bar-overview) -->

#### mode

Возможные значения: 'determinate', 'indeterminate'.
Значение по-умолчанию: 'determinate'.

Для отображения неопределенного по завершенности прогресса:

```html
<kbq-progress-bar [mode]="'indeterminate'"></kbq-progress-bar>
```

Для отображения определенного по завершенности прогресса:

```html
<kbq-progress-bar [mode]="'determinate'" [value]="30"></kbq-progress-bar>
```

<!-- example(progress-bar-indeterminate) -->
