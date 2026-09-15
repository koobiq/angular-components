### Tag list cleaner schematic

This schematic removes the `(click)` handler from every `<kbq-cleaner>` projected into a `<kbq-tag-list>`.

The reset control of a tag list now removes the tags itself and leaves the disabled ones in place. It
removes them through the same `removed` output as the remove control inside a tag, so the wiring that
control already needs is all it takes — a handler that cleared the collection is no longer needed.

A handler left in place runs **in addition** to the built-in clearing and cannot suppress it: the host
listener of `KbqCleaner` runs first. That is why the binding is removed rather than left to the developer.

The expression that was removed is printed for every file, because a handler may have done more than clear
the tags. Put anything else it did back in another binding. Cleaners outside a tag list are untouched.

To keep clearing the disabled tags as well, set the predicate on the list instead:

```html
<kbq-tag-list [clearPredicate]="() => true"></kbq-tag-list>
```

Usage for Angular CLI:

```shell
ng g @koobiq/components:tag-list-cleaner --project <your project>
```

Run without writing first:

```shell
ng g @koobiq/components:tag-list-cleaner --project <your project> --fix=false
```

#### Before

<!-- prettier-ignore -->
```html
<kbq-tag-list>
    <kbq-tag [value]="tag" (removed)="removed($event)">{{ tag }}</kbq-tag>

    <kbq-cleaner (click)="clear()" />
</kbq-tag-list>
```

#### After

<!-- prettier-ignore -->
```html
<kbq-tag-list>
    <kbq-tag [value]="tag" (removed)="removed($event)">{{ tag }}</kbq-tag>

    <kbq-cleaner />
</kbq-tag-list>
```
