## Методы валидации

Валидаторы Angular определяют, **что** является недопустимым значением, но не управляют тем, **когда** сообщать об ошибке пользователю. Без дополнительного механизма ошибки появлялись бы сразу при загрузке страницы, ещё до того, как пользователь начал ввод данных.

В Koobiq эта задача решается через `ErrorStateMatcher`.

### ErrorStateMatcher

`ErrorStateMatcher` — это механизм, определяющий момент отображения ошибки. Он анализирует состояние контрола (`AbstractControl`) и формы (`FormGroupDirective | NgForm`), возвращая `true`, если ошибку нужно показать.

Валидаторы и `FormControl` при этом остаются неизменными — `ErrorStateMatcher` не добавляет и не удаляет ошибки. Он только решает, когда `kbq-form-field` должен показать дочерние элементы `<kbq-error>` и применить CSS-класс `kbq-invalid`.

Иными словами: **ошибки принадлежат `FormControl`**. Вызов `control.hasError('required')` вернет `true` с момента инициализации контрола, если поле обязательно для заполнения. `ErrorStateMatcher` лишь определяет, когда стоит сообщить об этом пользователю.

**Подключение:**

Применить матчер ко всем элементам управления внутри компонента через `providers`:

```ts
@Component({
    providers: [
        // Устанавливаем кастомный матчер для всего компонента
        kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)
    ]
})
```

Переопределить для конкретного элемента управления через input `[errorStateMatcher]` (поддерживается в `kbq-tag-list`, `kbq-file-upload` и других):

```html
<kbq-file-upload [errorStateMatcher]="myMatcher" ... />
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
