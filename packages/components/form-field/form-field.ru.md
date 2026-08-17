`<kbq-form-field>` - это компонент, который используется для создания форм и полей ввода с поддержкой стилизации и дополнительных
функций.

Следующие компоненты предназначены для использования внутри `<kbq-form-field>`:

- [Autocomplete](/ru/components/autocomplete)
- [Input](/ru/components/input)
- [Select](/ru/components/select)
- [Tag autocomplete](/ru/components/tag-autocomplete)
- [Tag input](/ru/components/tag-input)
- [Textarea](/ru/components/textarea)
- [Timepicker](/ru/components/timepicker)
- [Timezone](/ru/components/timezone)
- [Tree select](/ru/components/tree-select)

### Лейбл

<!-- example(form-field-overview) -->

### Горизонтальная форма

Для создания горизонтальной формы необходимо добавить `horizontal` атрибут к `<kbq-form-field>` компоненту.

<!-- example(form-field-horizontal) -->

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

Подробное описание обоих подходов и паттернов для конкретных компонентов (список тегов, загрузка файлов) — в руководстве [Валидация](/ru/other/validation).

### Очистка поля

`<kbq-cleaner />` - это компонент, который добавляет кнопку очистки для **заполненного** поля формы внутри `<kbq-form-field>`
компонента.

<!-- example(form-field-with-cleaner) -->

### Префикс и суффикс

`kbqPrefix` и `kbqSuffix` - это директивы, которые позволяют добавлять пользовательские элементы **до** и **после** поля
формы внутри `<kbq-form-field>` компонента. Эти директивы полезны для добавления иконок, текста, кнопок и других элементов,
которые должны быть расположены рядом с полем формы.

<!-- example(form-field-with-prefix-and-suffix) -->

### Фокус

В полях ввода текста при фокусе всегда отображается синяя рамка, независимо от способа активации (мышь, клавиатура или касание).
Для элементов формы с выпадающим списком (таких как: [select](/ru/components/select), [timezone](/ru/components/timezone) и [tree select](/ru/components/tree-select))
рамка фокуса показывается только при навигации с клавиатуры (при помощи клавиши `Tab`) и скрывается при открытии выпадающего списка.

### Отключение рамок

Для определенного поля, при помощи `noBorders` атрибута:

<!-- example(form-field-without-borders) -->

Для всех полей, при помощи `KBQ_FORM_FIELD_DEFAULT_OPTIONS` токена:

```ts
import { kbqFormFieldDefaultOptionsProvider } from '@koobiq/components/form-field';

@NgModule({
    providers: [kbqFormFieldDefaultOptionsProvider({ noBorders: true })]
})
```

### Автозаполнение

Когда браузер заполняет поле, `<kbq-form-field>` подсвечивает его цветом `--kbq-form-field-states-autofill-background`,
поэтому автозаполненное поле выглядит одинаково во всех браузерах: собственный фон браузера подавляется, а цвет текста
перерисовывается. Подсветка ложится на поле, а не на сам контрол, поэтому она никогда не накладывается дважды.

Подсветка — это слой, а не состояние. Она накладывается поверх того фона, который разрешило состояние поля: ничего не
теряется и ничего не нужно разрешать в пользу одного из двух. Поле с ошибкой остаётся красным **и** подсвеченным, поле
в оверлее сохраняет фон карточки, отключённое поле сохраняет серый цвет, который и говорит, что редактировать его
нельзя. Рамка, кольцо фокуса и цвет текста остаются за состоянием — автозаполненное поле с ошибкой печатает текст
цветом ошибки, а не плоским цветом автозаполнения.

`kbq-form-field` также объявляет `color-scheme` для активной темы. Без этого браузер рисует все свои собственные
поверхности светлой палитрой, каким бы тёмным ни было приложение, и автозаполненное поле в тёмной теме превращается в
светлый блок с чёрным текстом, как только браузер снова откроет выпадающий список автозаполнения. Этот список браузер
рисует поверх авторских стилей, и `color-scheme` — единственное, что на него влияет.

Чтобы изменить подсветку или отключить её, переопределите токен на поле — `!important` не нужен:

```css
.my-form-field {
    /* выглядеть точно как обычное заполненное поле */
    --kbq-form-field-states-autofill-background: transparent;
}
```

Состояние также отслеживается в TypeScript. `AutofillMonitor` из CDK добавляет класс `kbq-form-field_autofilled` на
`<kbq-form-field>`, а `KbqInput`, `KbqInputPassword`, `KbqTextarea` и `KbqTagInput` (проброшенный через `KbqTagList`)
отдают сигнал `autofilled`:

```ts
@ViewChild(KbqInput) input: KbqInput;

// ...

const filledByBrowser = this.input.autofilled();
```

Сигнал — это хук для кода приложения, а не механизм стилизации: он приходит на кадр-два позже отрисовки, тогда как CSS
срабатывает в том же проходе стилей.

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
