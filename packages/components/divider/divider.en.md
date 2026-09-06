`<kbq-divider>` is a component that allows for koobiq styling of a line separator with various orientation options.

<!-- example(divider-overview) -->

### Simple divider

A `<kbq-divider>` element can be used on its own to create a horizontal or vertical line styled with a koobiq theme

```html
<kbq-divider />
```

### Vertical divider

Add the `vertical` attribute in order to set whether or not the divider is vertically-oriented.

<!-- example(divider-vertical) -->

A vertical divider spans the flex or grid row it sits in, so it needs no height of its own inside a toolbar.
Give it an explicit height through the `--kbq-divider-size-vertical-height` token — declared on the divider
itself, which is where its default lives — for a shorter divider, or for one placed outside such a row.

```css
.toolbar .kbq-divider {
    --kbq-divider-size-vertical-height: var(--kbq-size-m);
}
```

### Spacing

Both orientations space themselves from the content around them by default. Add `[paddings]="false"` for a divider that
sits flush against them; the spacing is emitted as margins, so a surrounding class can also replace it outright.

```html
<kbq-divider [paddings]="false" />
```

### Decorative divider

A divider is a `separator` for assistive technology: it announces the boundary it draws. Add the `decorative`
attribute where the boundary is already conveyed some other way — by a heading, by a group, or by the layout —
so the same boundary is not announced twice.

```html
<kbq-divider decorative />
```

### Lists with dividers

Dividers can be added to lists as a means of separating content into distinct sections. A divider between the items
of one section repeats a boundary the list already conveys, so mark it `decorative`; the divider that ends a section
is the one worth announcing.

<!-- prettier-ignore -->
```html
<kbq-list>
    <h3>Folders</h3>
    @for (folder of folders; track folder.name) {
        <kbq-list-item>
            <h4 kbq-line>{{ folder.name }}</h4>
            <p kbq-line>{{ folder.updated }}</p>
        </kbq-list-item>
        @if (!$last) {
            <kbq-divider decorative />
        }
    }
    <kbq-divider />
    <h3>Notes</h3>
    @for (note of notes; track note.name) {
        <kbq-list-item>
            <h4 kbq-line>{{ note.name }}</h4>
            <p kbq-line>{{ note.updated }}</p>
        </kbq-list-item>
    }
</kbq-list>
```
