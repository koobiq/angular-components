Directive for resizing an element in a specified direction using the mouse pointer.

<!-- example(resizer-overview) -->

### Resize Direction

Set by the `kbqResizer` attribute in the array format `[x, y]`, where:

- `x` - horizontal direction: `-1` (left), `0` (disabled), `1` (right).
- `y` - vertical direction: `-1` (up), `0` (disabled), `1` (down).

```html
<div kbqResizable>
    <i [kbqResizer]="[1, 0]"></i>
</div>
```
