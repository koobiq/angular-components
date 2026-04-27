## Методы валидации

Валидаторы Angular определяют, **что** невалидно. Но они не управляют **когда** эти ошибки показываются пользователю. Без дополнительного механизма ошибки появлялись бы сразу при загрузке страницы, ещё до того, как пользователь что-либо заполнил.

В Koobiq эту задачу решают двумя механизмами. `ErrorStateMatcher` — текущий рекомендуемый подход. `KbqValidateDirective` — устаревшая альтернатива.

### ErrorStateMatcher

`ErrorStateMatcher` используется для отображения. Он читает существующие ошибки контрола и состояние формы, затем отвечает на вопрос: **нужно ли показывать ошибку прямо сейчас?**

Валидаторы и `FormControl` при этом остаются неизменными — `ErrorStateMatcher` не добавляет и не удаляет ошибки. Он только решает, когда `kbq-form-field` должен показать дочерние элементы `<kbq-error>` и применить CSS-класс `kbq-invalid`.

Иными словами: **ошибки живут в `FormControl`**. `control.hasError('required')` будет `true` с самого начала, если поле не заполнено. `ErrorStateMatcher` лишь определяет, когда стоит сообщить об этом пользователю.

**Подключение:**

Применить матчер ко всем элементам управления внутри компонента через `providers`:

```ts
providers: [
    kbqDisableLegacyValidationDirectiveProvider(),
    kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)
];
```

Переопределить для конкретного элемента управления через input `[errorStateMatcher]` (поддерживается в `kbq-tag-list`, `kbq-file-upload` и других):

```html
<kbq-file-upload [errorStateMatcher]="myMatcher" ... />
```

### KbqValidateDirective (устарел)

Директива управляла отображением ошибок через изменение методов `NgForm` и `FormGroupDirective`. Такой подход создаёт неявные зависимости между компонентами дерева форм и хрупок при обновлениях Angular. `ErrorStateMatcher` решает ту же задачу без побочных эффектов.

Директива **устарела и будет удалена в следующем мажорном релизе**. Всегда явно отключайте её:

```ts
providers: [kbqDisableLegacyValidationDirectiveProvider()];
```

## Отображение ошибок

**Один валидатор**

<!-- example(validation-basic-single-validator) -->

**Несколько валидаторов**

<!-- example(validation-basic-multiple-validators) -->

## Компоненты

**Список тегов**

`kbq-tag-list` поддерживает `ErrorStateMatcher` и интегрируется с `kbq-form-field` так же, как другие элементы управления.

<!-- example(validation-tag-list) -->

**Загрузка файлов**

Компоненты загрузки файлов поддерживают `ErrorStateMatcher`, но имеют собственный layout вне `kbq-form-field`, поэтому вывод ошибок отличается от полей ввода. Все примеры валидации — на странице [Загрузка файлов](/ru/components/file-upload).

## Кастомный ErrorStateMatcher

Используйте `ShowRequiredOnSubmitErrorStateMatcher`, если нужно разделённое поведение:

- Если поле не заполнено, не показывать ошибку `required`, пока не отправится форма.
- Если поле заполнено, проверять его при потере фокуса.

<!-- example(validation-on-submit-custom-matcher) -->
