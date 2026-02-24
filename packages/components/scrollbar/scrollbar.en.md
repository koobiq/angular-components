`<kbq-scrollbar>` is a component used to configure scrollbar parameters.

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

For the component to work, the [`overlayscrollbars@2.7.3`](https://github.com/KingSora/OverlayScrollbars/tree/v2.7.0) dependency is required:

```bash
npm install overlayscrollbars@2.7.3
```

</div>
</div>

## Configuration and passing parameters:

- for a specific scrollbar, using the `options` attribute:

<!-- example(scrollbar-with-options) -->

- for all scrollbars in a module, using _Dependency Injection_ with the `KBQ_SCROLLBAR_CONFIG` token:

<!-- example(scrollbar-with-custom-config) -->

### Event handling:

```ts
<kbq-scrollbar
    (onInitialize)="onInitialize($event)"
    (onDestroy)="onDestroy($event)"
    (onScroll)="onScroll($event)"
    (onUpdate)="onUpdate($event)"
>
    ...
</kbq-scrollbar>
```
