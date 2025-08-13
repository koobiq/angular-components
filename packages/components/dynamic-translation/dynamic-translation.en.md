`KbqDynamicTranslation` - component for embedding custom components into translatable strings.

<!-- example(dynamic-translation-overview) -->

### Adding a component

Custom element is wrapped in `[[]]`, parameters are passed through `:`:

```html
<kbq-dynamic-translation text="[[myCustomLinkComponent:Open in a new tab]] to continue working.">
    <a *kbqDynamicTranslationSlot="'myCustomLinkComponent'; let text">{{ text }}</a>
</kbq-dynamic-translation>
```

### Key features

- Component substitution in localization strings.
- Separation of interface logic from localization texts.

### When to use

- When you need to embed custom components into localized strings.
- When translatable text needs [links](/en/components/link), [buttons](/en/components/button) or other interactive elements.
- For highlighting parts of text with special styles.
