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

This will fill 30% of the hole progress bar

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

Enum ('primary', 'secondary', 'error')  
Default: 'primary'  
Set theming of element

```html
<kbq-progress-bar [color]="themePalette.Primary"></kbq-progress-bar>
<kbq-progress-bar [color]="themePalette.Secondary"></kbq-progress-bar>
<kbq-progress-bar [color]="themePalette.Error"></kbq-progress-bar>
```

### Theming

The color of a `<kbq-progress-bar>` can be changed by using the `color` property. By default, it
use the theme's `primary` color. This can be changed to `'secondary'` or `'error'`.
