### Tag slots schematic

This schematic migrates legacy implicit icons in `KbqTag` to the explicit `kbqTagPrefix` slot. The old tag
template projected every element with `kbq-icon` before the label regardless of its source position, so every
matching element receives `kbqTagPrefix`; the migration never guesses a suffix from source order. Elements
with only `kbq-icon-button` or `kbq-icon-item` were not part of that legacy slot and remain unchanged.

`kbqTagRemove`, `kbqTagEditSubmit`, and icons already marked with `kbqTagPrefix` or `kbqTagSuffix` are left
unchanged.

Usage for Angular CLI:

```shell
ng g @koobiq/components:tag-slots --project <your project>
```

Run without writing first:

```shell
ng g @koobiq/components:tag-slots --project <your project> --fix=false
```

#### Before

```html
<kbq-tag>
    Tag
    <i kbq-icon="kbq-circle-info_16"></i>
    <i kbqTagRemove kbq-icon="kbq-xmark-s_16"></i>
</kbq-tag>
```

#### After

```html
<kbq-tag>
    Tag
    <i kbqTagPrefix kbq-icon="kbq-circle-info_16"></i>
    <i kbqTagRemove kbq-icon="kbq-xmark-s_16"></i>
</kbq-tag>
```
