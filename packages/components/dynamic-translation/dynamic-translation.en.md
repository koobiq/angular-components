`KbqDynamicTranslation` — component for embedding custom components into translatable strings.

<!-- example(dynamic-translation-overview) -->

### Adding a component

Components are embedded into strings using special syntax: `[[<SLOT_NAME>:<CONTEXT>]]`, where `SLOT_NAME` is the key of the registered component, and `CONTEXT` is the data passed to the component.

<!-- prettier-ignore -->
```html
<!-- Slot with string passing -->
<kbq-dynamic-translation text="[[myLinkSlot:Open link]]">
    <a *kbqDynamicTranslationSlot="'myLinkSlot'; let context">{{ context }}</a>
</kbq-dynamic-translation>

<!-- Slot with list passing -->
<kbq-dynamic-translation text="[[myListSlot:(first,second,third)]]">
    <ul *kbqDynamicTranslationSlot="'myListSlot'; let items">
        @for (item of items; track $index) {
            <li>{{ item }}</li>
        }
    </ul>
</kbq-dynamic-translation>
```

### Key features

- Embedding components ([links](/en/components/link), [buttons](/en/components/button), [dropdowns](/en/components/dropdown), etc.) into localized strings.
- Separation of interface logic from localization texts.
- Support for multiple slots in a single string.

### When to use

- When you need to dynamically change the composition and context of embedded components depending on localization.
- If you need to add interactive elements ([links](/en/components/link), [buttons](/en/components/button), [dropdowns](/en/components/dropdown), etc.) directly into translatable text.
- For highlighting parts of text with special styles.
