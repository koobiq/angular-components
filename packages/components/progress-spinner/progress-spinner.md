`<kbq-progress-spinner>` - компонент, отображающий индикатор загрузки в виде спиннера.

### Simple progress spinner

Элемент `<kbq-progress-spinner>` может быть использован отдельно для создания сектора прогресса с темой Koobiq.

```html
<kbq-progress-spinner></kbq-progress-spinner>
```

<!-- example(progress-spinner-overview) -->

### Props

#### value

Степень заполнения сектора, определяющая прогресс, зависит от свойства value.
Его значение может меняться в диапазоне [0, 100].
Значение по-умолчанию: 0

Такое значение заполнит 30% сектора:

```html
<kbq-progress-spinner value="30"></kbq-progress-spinner>
```

#### mode

Возможные значения: 'determinate', 'indeterminate'.
Значение по-умолчанию: 'determinate'.

Для отображения неопределенного по завершенности прогресса:

```html
<kbq-progress-spinner [mode]="'indeterminate'"></kbq-progress-spinner>
```

Для отображения определенного по завершенности прогресса:

```html
<kbq-progress-spinner
    [mode]="'determinate'"
    value="30"
></kbq-progress-spinner>
```

<!-- example(progress-spinner-indeterminate) -->
