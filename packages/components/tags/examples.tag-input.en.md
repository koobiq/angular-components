### Disable tag creation on the "paste" event

<!-- example(tags-input-onpaste-off) -->

### Tag input with validators

```ts
    readonly formControl = new FormControl(
        ['Koobiq', 'Angular', 'Design'],
        [Validators.required, customMaxLengthValidator(3)]
    );
```

**Notice** that the `[formControl]` directive should be applied to `<kbq-tag-list>`, not to `kbqInput`.

<!-- example(tag-input-with-form-control-validators) -->
