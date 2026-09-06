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

Значения вне диапазона обрезаются, а в режиме indeterminate свойство не используется.

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

#### color

Возможные значения: 'theme', 'contrast', 'contrast-fade', 'error'.
Значение по-умолчанию: 'theme'.
Задает цвет заполненной части линии. Цвет дорожки одинаков для всех вариантов.

```html
<kbq-progress-bar [color]="'theme'" [value]="30"></kbq-progress-bar>
<kbq-progress-bar [color]="'contrast'" [value]="30"></kbq-progress-bar>
<kbq-progress-bar [color]="'contrast-fade'" [value]="30"></kbq-progress-bar>
<kbq-progress-bar [color]="'error'" [value]="30"></kbq-progress-bar>
```

Пустое значение, `null` или `undefined` возвращают компонент к цвету `'theme'`, поэтому еще не
вычисленный цвет не делает индикатор невидимым.

#### aria-label

Доступное имя индикатора.
Значение по-умолчанию: берется из конфигурации локали a11y.

Задавайте его, если у индикатора нет собственной видимой подписи:

```html
<kbq-progress-bar [value]="30" aria-label="Загрузка архива"></kbq-progress-bar>
```

### Content projection

`kbq-progress-bar-text` отображает подпись над линией, а `kbq-progress-bar-caption` — подпись под ней.
Обе необязательны и могут использоваться вместе.

```html
<kbq-progress-bar [value]="30">
    <div kbq-progress-bar-text>Загрузка архива</div>
    <div kbq-progress-bar-caption>3 из 12 файлов</div>
</kbq-progress-bar>
```

Спроецированный текст также задает доступное имя индикатора, а caption — его описание: компонент
связывает их через `aria-labelledby` и `aria-describedby`. Переданный `aria-label` имеет приоритет над
спроецированным текстом.

### Accessibility

Корневой элемент имеет `role="progressbar"`. В режиме determinate он сообщает `aria-valuenow`
(обрезанное значение `value`) вместе с `aria-valuemin="0"` и `aria-valuemax="100"`; в режиме
indeterminate все три атрибута отсутствуют — именно так выражается неизвестная продолжительность.

### Theming

Цвет `<kbq-progress-bar>` меняется свойством `color`. По-умолчанию используется цвет `theme`. Отдельные
индикаторы также можно перекрасить через CSS-переменные компонента, например
`--kbq-progress-bar-bar-foreground` и `--kbq-progress-bar-bar-background`.
