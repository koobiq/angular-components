<div class="kbq-callout kbq-callout_warning">
<div class="kbq-callout__header">Обрати внимание</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

К элементам формы применяется [`KbqValidateDirective`](https://github.com/koobiq/angular-components/blob/main/packages/components/form-field/validate.directive.ts), которая подменяет методы формы (`Validators`, `onSubmit`), что может привести к _"непредсказуемому"_ поведению.

</div>
</div>

### Отключение KbqValidateDirective

```ts
import { KBQ_VALIDATION, KbqValidationOptions } from '@koobiq/components/core';

@NgModule({
    providers: [
        {
            provide: KBQ_VALIDATION,
            useValue: { useValidation: false } satisfies KbqValidationOptions
        }
    ]
})
```

---

Все описанные ниже рекомендации не применяются к форме входа.

Хорошая практика — сделать так, чтобы валидация вообще не понадобилась. Ниже примеры, когда интерфейс не позволяет пользователю совершить ошибку.

| <span class="kbq-error">Плохо<span>                 | <span class="kbq-success">Хорошо<span>                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Сообщать, что поле ввода обязательно для заполнения | Блокировать кнопку отправки формы до тех пор, пока поле не заполнено                                               |
| Сообщать, что в поле введены неподходящие данные    | Преобразовать введенные данные в корректные. Например, автоматически заменить все пробелы на знак подчеркивания    |
| Заранее сообщать, какие данные нужно вводить в поле | Использовать контрол, которые не позволяет вводить неправильные данные. Например, специальное поле для ввода чисел |

### Когда проверять на ошибки

Есть три способа проверить верность введенных значений:

1. Во время ввода значения
2. По уходу с поля (по потере фокуса)
3. После отправки формы

#### Во время ввода значения

В тех случаях, когда заранее известно, какие символы точно не подходят для ввода в поле, мы можем предотвратить ввод некорректных значений. Для этого нужно запрещать ввод определенных символов, например букв в IP-адрес. При этом запрещенные символы не вводятся и показывается желтый тултип.

<!-- example(validation-on-type) -->

#### По уходу с поля (по потере фокуса)

Если требования к значениям в поле относительно сложные (например, это IP-адрес или адрес эл. почты), то поле не должно получать состояние ошибки во время ввода, чтобы не сбивать пользователя с толку. Валидация в таких случаях выполняется по потере фокуса. Поле возвращается к нормальному состоянию после изменения значения.

Если у поля есть подпись, то текст ошибки выводится под подписью.

Пустые обязательные поля не получают состояние ошибки по потере фокуса.

<!-- example(validation-on-blur) -->

##### Составные поля

Когда значения в нескольких полях тесно связаны между собой (например, края диапазонов), нужно проверять их все вместе. Для этого нужно сначала отдельно проверить все поля [во время ввода значения](/other/validation/overview#во-время-ввода-значения) и [по уходу с поля](/other/validation/overview#по-уходу-с-поля-%28по-потере-фокуса%29). Если по-отдельности все значения валидны, срабатывает общая валидация на несколько полей: каждое поле не получает состояние ошибки, но все поля вместе выделяются фоном и внизу выводится общее сообщение.

<!-- example(validation-composite) -->

#### После отправки формы

##### Глобальная ошибка

При самой аккуратной валидации отдельных полей всегда что-то может пойти не так: пропадет соединение с БД, другой пользователь изменит данные системы и т. п. Если ошибка возникла после нажатия на терминальные кнопки и не связана со значениями в полях, то такая ошибка показывается алертом над формой и страница прокручивается до него.

Такой алерт «висит» и не скрывается, давая пользователю понять, что было не так, — и пропадает при повторной отправке формы.

При повторной отправке формы все поля проверяются еще раз. За время, пока пользователь дозаполнял форму, уникальность названия, например, могла пропасть.

<!-- example(validation-global) -->

##### Ошибки в полях

Если не удалось провести валидацию в полях во время ввода или по уходу с поля, то после отправки формы страница прокручивается до первого поля с ошибкой и оно получает фокус.

Не блокируйте терминальные кнопки после отправки формы!

### Обязательные поля

Если большинство полей на форме — обязательные для заполнения, то эту обязательность не нужно помечать. Необязательные поля, наоборот, подписываются (или в плейсхолдере, или в подписи под полем).

Поля «Комментарий», «Описание» почти всегда необязательные и воспринимаются как необязательные. Их можно не подписывать.

Незаполненное обязательное поле получает состояние ошибки только после отправки формы (пустые обязательные поля не получают состояние ошибки при потере фокуса). В тексте ошибки сообщается, по каким причинам поле обязательно. Иногда текстом можно пренебречь — если из контекста формы понятно, что поле обязательное, или если текст получается слишком длинным.

<!-- example(validation-overview) -->

#### Обязательные поля на небольших формах

На небольших формах, где обязательные поля очевидны, терминальные кнопки лучше заблокировать до заполнения полей.

На больших формах не рекомендуется блокировать терминальные кнопки, потому что может быть совсем неочевидно, почему кнопка неактивна.

<!-- example(validation-small) -->

#### Другие случаи

Бывают случаи, когда нужно заполнить хотя бы одно из обязательных полей. В этом случае после отправки формы обязательные поля не получают состояние ошибки, но выводится алерт.

<!-- example(validation-global-one-required) -->

### Показ сообщений об ошибках вне форм

Иногда требуется показывать ошибки вне форм, например если было запущено сканирование, но в процессе сервер вернул ошибку. В таких случаях лучше показывать уведомление в центре уведомлений.