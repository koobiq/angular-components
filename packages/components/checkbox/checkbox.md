### Dual-state

Dual-state применяется с использованием логического атрибута `[checked]`, чтобы показать,
установлен checkbox или нет.

<!-- example(checkbox-overview) -->

### Indeterminate state (частичный выбор)

Состояние indeterminate применяется с использованием логического атрибута «[indeterminate]» и может использоваться,
когда у вас есть группа параметров, а checkbox более высокого уровня должен отобразить их состояние:
+ если выбраны только некоторые параметры в группе, флажок более высокого уровня отображается частично выбранным (`[indeterminate] =" true "`).
+ если выбраны все, отображается checkbox более высокого уровня.
+ Если ни один не выбран, checkbox более высокого уровня появляется не установленным.

<!-- example(checkbox-indeterminate) -->

### Click action config

Когда пользователь кликает на `kbq-checkbox`, поведение по умолчанию переводит в значение `checked` и `indeterminate` to `false`.
Это поведение может быть настроено <a href="https://angular.io/guide/dependency-injection" target="_blank">добавлением нового значения</a>
`KBQ_CHECKBOX_CLICK_ACTION` на checkbox.

```
providers: [
    { provide: KBQ_CHECKBOX_CLICK_ACTION, useValue: 'check' }
]
```

Возможные значения: noop, check, check-indeterminate

### Pseudo checkbox

<!-- example(pseudo-checkbox) -->
