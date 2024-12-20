### Отключение создания тега по событию "paste"

<!-- example(tags-input-onpaste-off) -->

### Ввод тегов с валидаторами

```ts
    readonly formControl = new FormControl(
        ['Koobiq', 'Angular', 'Design'],
        [Validators.required, customMaxLengthValidator(3)]
    );
```

**Обратите внимание**, что директива [formControl] должна быть применена к `<kbq-tag-list>`, а не к `kbqInput`.

<!-- example(tag-input-with-form-control-validators) -->
