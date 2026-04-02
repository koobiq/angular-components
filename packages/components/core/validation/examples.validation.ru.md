<!-- example(validation-tag-list) -->

### Кастомный ErrorStateMatcher

Используйте `ShowRequiredOnSubmitErrorStateMatcher`, если нужно разделённое поведение:

- Если поле не заполнено, то не показывать `required` ошибку, пока не отправится форма.
- Если поле заполнено, то проверять его при потере фокуса.

<!-- example(validation-on-submit-custom-matcher) -->
