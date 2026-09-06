`<kbq-progress-bar>` is a component that allows display progress bar.

### Simple progress bar

A `<kbq-progress-bar>` element can be used on its own to create a horizontal progress line with koobiq theme

```html
<kbq-progress-bar></kbq-progress-bar>
```

### Props

#### value

Displaying length of progress bar depends on this property  
The range of value is [0, 100]  
Default: 0

Values outside the range are clamped, and the property is ignored in indeterminate mode.

This will fill 30% of the whole progress bar

```html
<kbq-progress-bar [value]="30"></kbq-progress-bar>
```

<!-- example(progress-bar-overview) -->

#### mode

Enum ('determinate', 'indeterminate')  
Default: 'determinate'

To show indeterminate progress

```html
<kbq-progress-bar [mode]="'indeterminate'"></kbq-progress-bar>
```

Or for determinate progress

```html
<kbq-progress-bar [mode]="'determinate'" [value]="30"></kbq-progress-bar>
```

<!-- example(progress-bar-indeterminate) -->

#### color

Enum ('theme', 'contrast', 'contrast-fade', 'error')  
Default: 'theme'  
Sets the color of the filled part of the bar. The track keeps the same color in every variant.

```html
<kbq-progress-bar [color]="'theme'" [value]="30"></kbq-progress-bar>
<kbq-progress-bar [color]="'contrast'" [value]="30"></kbq-progress-bar>
<kbq-progress-bar [color]="'contrast-fade'" [value]="30"></kbq-progress-bar>
<kbq-progress-bar [color]="'error'" [value]="30"></kbq-progress-bar>
```

An empty, `null` or `undefined` binding falls back to `'theme'`, so a color that is not resolved yet
never leaves the bar invisible.

#### aria-label

Accessible name of the bar  
Default: taken from the a11y locale configuration

Bind it when the bar has no visible label of its own:

```html
<kbq-progress-bar [value]="30" aria-label="Uploading the archive"></kbq-progress-bar>
```

### Content projection

`kbq-progress-bar-text` renders a label above the bar and `kbq-progress-bar-caption` renders a caption
below it. Both are optional and can be used together.

```html
<kbq-progress-bar [value]="30">
    <div kbq-progress-bar-text>Uploading the archive</div>
    <div kbq-progress-bar-caption>3 of 12 files</div>
</kbq-progress-bar>
```

The projected text also names the bar for assistive technology, and the caption describes it — the
component links them with `aria-labelledby` and `aria-describedby`. A bound `aria-label` takes
precedence over the projected text.

### Accessibility

The host element carries `role="progressbar"`. In determinate mode it reports `aria-valuenow`
(the clamped `value`) together with `aria-valuemin="0"` and `aria-valuemax="100"`; in indeterminate
mode all three are omitted, which is how an unknown duration is expressed.

### Theming

The color of a `<kbq-progress-bar>` can be changed by using the `color` property. By default, it uses
the theme's `theme` color. Individual bars can also be restyled through the CSS custom properties the
component declares, such as `--kbq-progress-bar-bar-foreground` and `--kbq-progress-bar-bar-background`.
