`<kbq-progress-spinner>` is a component that allows display progress spinner.

### Simple progress spinner

A `<kbq-progress-spinner>` element can be used on its own to create a sector progress with koobiq theme

```html
<kbq-progress-spinner></kbq-progress-spinner>
```

<!-- example(progress-spinner-overview) -->

### Props

#### value

Displaying sector filling progress depends on this property  
The range of value is [0, 100]  
Default: 0

This will fill 30% of the sector

```html
<kbq-progress-spinner [value]="30"></kbq-progress-spinner>
```

#### mode

Enum ('determinate', 'indeterminate')  
Default: 'determinate'

To show indeterminate progress

```html
<kbq-progress-spinner [mode]="'indeterminate'"></kbq-progress-spinner>
```

Or for determinate progress

```html
<kbq-progress-spinner
    [mode]="'determinate'"
    [value]="30"
></kbq-progress-spinner>
```

<!-- example(progress-spinner-indeterminate) -->

#### color

Enum ('primary', 'secondary', 'error')
Default: 'primary'
Set theming of element

```html
<kbq-progress-spinner [color]="themePalette.Primary"></kbq-progress-spinner>
<kbq-progress-spinner [color]="themePalette.Secondary"></kbq-progress-spinner>
<kbq-progress-spinner [color]="themePalette.Error"></kbq-progress-spinner>
```

### Theming

The color of a `<kbq-progress-spinner>` can be changed by using the `color` property. By default, it
use the theme's `primary` color. This can be changed to `'secondary'` or `'error'`.
