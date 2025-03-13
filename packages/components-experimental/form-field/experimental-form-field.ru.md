<div class="kbq-callout kbq-callout_warning">
<div class="kbq-callout__header">Обрати внимание</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Этот компонент является экспериментальным, он обратно совместим с оригинальным компонентом, но его не рекомендуется использовать в продакшн-приложениях.

</div>
</div>

Основные изменения:

-   удалена поддержка `KbqTrim`
-   удалена поддержка `KbqValidateDirective` директивы, вместо этого предлагается использовать `ErrorStateMatcher`([см.](#изменение-поведения-отображения-сообщения-об-ошибке))
-   удалена директива `KbqFormFieldWithoutBorders`, вместо нее предлагается использовать `noBorders` атрибут ([см.](#отключение-рамок))
-   удалена стилизация поля ввода при помощи селектора `.ng-invalid`, вместо этого предлагается использовать селектор `.kbq-form-field_invalid`, который зависит от `ErrorStateMatcher`([см.](#изменение-поведения-отображения-сообщения-об-ошибке))

---

`<kbq-form-field>` - это компонент, который используется для создания форм и полей ввода с поддержкой стилизации и дополнительных
функций.

Следующие компоненты предназначены для работы внутри `<kbq-form-field>` компонента:

-   [Autocomplete](/ru/components/autocomplete)
-   [Input](/ru/components/input)
-   [Select](/ru/components/select)
-   [Tag autocomplete](/ru/components/tag-autocomplete)
-   [Tag input](/ru/components/tag-input)
-   [Textarea](/ru/components/textarea)
-   [Timepicker](/ru/components/timepicker)
-   [Timezone](/ru/components/timezone)
-   [Tree select](/ru/components/tree-select)

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

### Изменение поведения отображения подсветки и сообщения об ошибке

По умолчанию подсветка и сообщения об ошибках отображаются для **невалидных** полей после взаимодействия пользователя (коснулся или отправил форму)
с элементом формы. Это поведение можно переопределить при помощи [ErrorStateMatcher](https://github.com/koobiq/angular-components/blob/main/packages/components/core/error/error-state-matcher.ts),
который предоставляет возможность гибко настраивать логику подсветки и отображения ошибок валидации, что позволяет
адаптировать поведение полей ввода под конкретные требования приложения.

Можно использовать один из встроенных `ErrorStateMatcher`, либо написать свою собственную реализацию:

```ts
/**
 * Подсветит и отобразит ошибку для невалидного поля после отправки формы
 * Копия ShowOnFormSubmitErrorStateMatcher: https://github.com/koobiq/angular-components/blob/main/packages/components/core/error/error-state-matcher.ts
 */
class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control?.invalid && form?.submitted);
    }
}
```

Переопределение

Для определенного поля, при помощи `errorStateMatcher` атрибута:

<!-- example(form-field-with-custom-error-state-matcher-set-by-attribute) -->

Для всех полей, при помощи `ErrorStateMatcher` токена:

<!-- example(form-field-with-custom-error-state-matcher-set-by-dependency-injection-provider) -->

### Очистка поля

`<kbq-cleaner />` - это компонент, который добавляет кнопку очистки для **заполненного** поля формы внутри `<kbq-form-field>`
компонента.

<!-- example(form-field-with-cleaner) -->

### Префикс и суффикс

`kbqPrefix` и `kbqSuffix` - это директивы, которые позволяют добавлять пользовательские элементы **до** и **после** поля
формы внутри `<kbq-form-field>` компонента. Эти директивы полезны для добавления иконок, текста, кнопок и других элементов,
которые должны быть расположены рядом с полем формы.

<!-- example(form-field-with-prefix-and-suffix) -->

### Отключение рамок

Для определенного поля, при помощи `noBorders` атрибута:

<!-- example(form-field-without-borders) -->

Для всех полей, при помощи `KBQ_FORM_FIELD_DEFAULT_OPTIONS` токена:

```ts
import { kbqFormFieldDefaultOptionsProvider } from '@koobiq/components-experimental/form-field';

@NgModule({
    providers: [
        kbqFormFieldDefaultOptionsProvider({ noBorders: true })
    ]
})
```

### Поле для ввода пароля

`<kbq-password-toggle>` - это компонент, который добавляет кнопку _"Показать пароль"_ для **заполненного** поля
`<input kbqInputPassword />` внутри `<kbq-form-field>` компонента.

`<kbq-password-hint>` - это компонент, который используется для добавления подсказок к полю `<input kbqInputPassword />`
внутри `<kbq-form-field>` компонента.

В примере используется [PasswordValidators](https://github.com/koobiq/angular-components/blob/main/packages/components/core/forms/validators.ts) - это набор статических методов для валидации пароля.

<!-- example(form-field-password-overview) -->

### Устранение неисправностей

#### Error: kbq-form-field must contain a KbqFormFieldControl

Эта ошибка возникает, когда `<kbq-form-field>` не содержит поле формы, например: `<input kbqInput />` или его импорт `KbqInputModule`.

#### Error: kbq-password-toggle should use with kbqInputPassword

Эта ошибка возникает, когда `<kbq-password-toggle>` не может найти поле `<input kbqInputPassword />` или его импорт `KbqInputModule`.

#### Error: kbq-stepper should use with kbqNumberInput

Эта ошибка возникает, когда `<kbq-stepper>` не может найти поле `<input kbqNumberInput />` или его импорт `KbqInputModule`.
