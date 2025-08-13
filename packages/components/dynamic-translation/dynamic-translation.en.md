`KbqDynamicTranslation` - component for embedding custom components into translatable strings.

<!-- example(dynamic-translation-overview) -->

### Adding a component

A component is embedded into a string using special syntax: `[[slotName: context]]`, where `slotName` is the key of the registered component, and `context` is the data passed to the component.

```html
<kbq-dynamic-translation text="[[myCustomLink:Open link]]">
    <a *kbqDynamicTranslationSlot="'myCustomLink'; let context">{{ context }}</a>
</kbq-dynamic-translation>
```

### Key features

- Component substitution in localization strings.
- Separation of interface logic from localization texts.

### When to use

- When you need to embed custom components into localized strings.
- When translatable text needs [links](/en/components/link), [buttons](/en/components/button) or other interactive elements.
- For highlighting parts of text with special styles.
