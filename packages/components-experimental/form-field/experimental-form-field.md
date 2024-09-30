**Обрати внимание!** Этот компонент является экспериментальным, он обратно совместим с оригинальным компонентом, но его не рекомендуется использовать в продакшн-приложениях.

Основные изменения:

-   удалена поддержка `KbqTrim`;
-   удалена поддержка `KbqValidateDirective` директивы, вместо этого предлагается использовать `ErrorStateMatcher`([см.](#изменение-поведения-отображения-сообщения-об-ошибке));
-   удалена директива `KbqFormFieldWithoutBorders`, вместо нее предлагается использовать `<kbq-form-field noBorders>` атрибут ([см.](#отключение-рамок));
-   удалена стилизация поля ввода при помощи селектора `.ng-invalid`, вместо этого предлагается использовать селектор `.kbq-form-field_invalid`, который зависит от `ErrorStateMatcher`([см.](#изменение-поведения-отображения-сообщения-об-ошибке));

---

`<kbq-form-field>` - это компонент, который используется для создания форм и полей ввода с поддержкой стилизации и дополнительных
функций.

Следующие компоненты предназначены для работы внутри `<kbq-form-field>`:

-   [Autocomplete](https://koobiq.io/components/autocomplete/overview);
-   [Input](https://koobiq.io/components/input/overview);
-   [Select](https://koobiq.io/components/select/overview);
-   [Tag autocomplete](https://koobiq.io/components/tag-autocomplete/overview);
-   [Tag input](https://koobiq.io/components/tag-input/overview);
-   [Textarea](https://koobiq.io/components/textarea/overview);
-   [Timepicker](https://koobiq.io/components/timepicker/overview);
-   [Timezone](https://koobiq.io/components/timezone/overview);
-   [Tree select](https://koobiq.io/components/tree-select/overview);

### Лейбл

<!-- example(form-field-with-label) -->

### Подсказки

`<kbq-hint>` — это компонент, который используется для добавления подсказок к полям формы внутри `<kbq-form-field>` компонента.
Подсказки могут быть полезны для предоставления дополнительной информации о том, как заполнить поле, какие данные ожидаются
или для отображения дополнительных инструкций.

<!-- example(form-field-with-hint) -->

### Сообщения об ошибке

`<kbq-error>` — это компонент, который используется для отображения сообщений об ошибках валидации поля формы внутри `<kbq-form-field>`
компонента. Ошибки изначально **скрыты** и будут отображаться **только** для невалидных полей формы после пользовательского
взаимодействия или в момент отправки формы.

<!-- example(form-field-with-error) -->

### Изменение поведения отображения сообщения об ошибке

По умолчанию сообщения об ошибках отображаются, когда поле формы невалидно и пользователь взаимодействовал с элементом
(коснулся) или родительская форма была отправлена ([см. `ErrorStateMatcher`](https://github.com/koobiq/angular-components/blob/main/packages/components/core/error/error-state-matcher.ts)).

Если необходимо переопределить это поведение, например показывать сообщение об ошибки после отправки формы, воспользуйся примером:

```ts
import { ErrorStateMatcher, ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';

@NgModule({
    providers: [
        {
            provide: ErrorStateMatcher,
            useClass: ShowOnFormSubmitErrorStateMatcher
        }
    ]
})
```

Либо напиши свою собственную реализацию `ErrorStateMatcher`:

<!-- example(form-field-with-custom-error-state-matcher) -->

### Очистка поля

`<kbq-cleaner />` - это компонент, который добавляет кнопку очистки для **заполненного** поля формы внутри `<kbq-form-field>`
компонента.

<!-- example(form-field-with-cleaner) -->

### Префикс и суффикс

`kbqPrefix` и `kbqSuffix` - это директивы, которые позволяют добавлять пользовательские элементы **до** и **после** поля
формы внутри `<kbq-form-field>` компонента. Эти директивы полезны для добавления иконок, текста, кнопок и других элементов,
которые должны быть расположены рядом с полем формы.

<!-- example(form-field-with-prefix-and-suffix) -->

### Отключение рамок:

-   для определенного поля, при помощи `noBorders` атрибута:

<!-- example(form-field-without-borders) -->

-   для всех полей, при помощи _Dependency Injection_ c использованием `KBQ_FORM_FIELD_DEFAULT_OPTIONS` токена:

```ts
import { KBQ_FORM_FIELD_DEFAULT_OPTIONS, KbqFormFieldDefaultOptions } from '@koobiq/components-experimental/form-field';

@NgModule({
    providers: [
        {
            provide: KBQ_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                noBorders: true
            } satisfies KbqFormFieldDefaultOptions
        }
    ]
})
```

### Поле для ввода пароля

`<kbq-password-toggle>` - это компонент, который добавляет кнопку _"Показать пароль"_ для **заполненного** поля
`<input kbqInputPassword />` внутри `<kbq-form-field>` компонента.

`<kbq-password-hint>` - это компонент, который используется для добавления подсказок к полю `<input kbqInputPassword />`
внутри `<kbq-form-field>` компонента.

В примере используется `PasswordValidators` - это набор статических методов для валидации пароля.

<!-- example(form-field-password-overview) -->

### Устранение неисправностей

-   `Error: kbq-form-field must contain a KbqFormFieldControl`;

Эта ошибка возникает, когда `<kbq-form-field>` не содержит поле формы, например: `<input kbqInput />` или его импорт `KbqInputModule`.

-   `Error: kbq-password-toggle should use with kbqInputPassword`;

Эта ошибка возникает, когда `<kbq-password-toggle>` не может найти поле `<input kbqInputPassword />` или его импорт `KbqInputModule`.

-   `Error: kbq-stepper should use with kbqNumberInput`;

Эта ошибка возникает, когда `<kbq-stepper>` не может найти поле `<input kbqNumberInput />` или его импорт `KbqInputModule`.
