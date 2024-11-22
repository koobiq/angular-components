`<kbq-divider>` is a component that allows for koobiq styling of a line separator with various orientation options.

<!-- example(divider-overview) -->

### Simple divider

A `<kbq-divider>` element can be used on its own to create a horizontal or vertical line styled with a koobiq theme

```html
<kbq-divider></kbq-divider>
```

### Inset divider

Add the `inset` attribute in order to set whether or not the divider is an inset divider.

```html
<kbq-divider [inset]="true"></kbq-divider>
```

### Vertical divider

Add the `vertical` attribute in order to set whether or not the divider is vertically-oriented.

<!-- example(divider-vertical) -->

### Lists with inset dividers

Dividers can be added to lists as a means of separating content into distinct sections.
Inset dividers can also be added to provide the appearance of distinct elements in a list without cluttering content
like avatar images or icons. Make sure to avoid adding an inset divider to the last element
in a list, because it will overlap with the section divider.

```html
<kbq-list>
    <h3>Folders</h3>
    <kbq-list-item *ngFor="let folder of folders; last as last">
        <kbq-icon kbq-list-icon>folder</kbq-icon>
        <h4 kbq-line>{{folder.name}}</h4>
        <p class="demo-2" kbq-line>{{folder.updated}}</p>
        <kbq-divider [inset]="true" *ngIf="!last"></kbq-divider>
    </kbq-list-item>
    <kbq-divider></kbq-divider>
    <h3>Notes</h3>
    <kbq-list-item *ngFor="let note of notes">
        <kbq-icon kbq-list-icon>note</kbq-icon>
        <h4 kbq-line>{{note.name}}</h4>
        <p class="demo-2" kbq-line>{{note.updated}}</p>
    </kbq-list-item>
</kbq-list>
```
