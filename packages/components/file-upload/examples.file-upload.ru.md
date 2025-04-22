Пример демонстрирует возможности локализации компонента по месту

<!-- example(file-upload-multiple-custom-text-overview) -->

Пример загрузки файлов с неопределенным по завершенности прогрессом:

<!-- example(file-upload-indeterminate-loading-overview) -->

### Сигналы

Пример загрузчика файлов с использованием [`signal`](https://angular.dev/guide/signals).

<!-- example(file-upload-single-with-signal) -->

## Простое использование Control Value Accessor для загрузчика файлов

В этом разделе представлен пример реализации загрузчика файлов, поддерживающего загрузку одного файла, с использованием `Control Value Accessor`.

<!-- example(file-upload-cva-overview) -->

### Валидация: дополнительные примеры

#### Обязательное поле

-   **Один файл**: Пример загрузчика, проверяющего, что файл обязательно должен быть загружен.
<!-- example(file-upload-single-required-reactive-validation) -->

-   **Несколько файлов**: Пример загрузчика, который требует обязательной загрузки нескольких файлов.
<!-- example(file-upload-multiple-required-reactive-validation) -->

#### Валидация размера файла

В примерах используется [FileValidators](https://github.com/koobiq/angular-components/blob/main/packages/components/core/forms/validators.ts) - это набор статических методов для валидации поля загрузки файлов.

-   **Один файл**: Пример загрузки одного файла с применением `Reactive Forms` для проверки данных.

<!-- example(file-upload-single-validation-reactive-forms-overview) -->

-   **Несколько файлов**: Пример загрузки нескольких файлов с использованием `Reactive Forms` и встроенной валидации.

<!-- example(file-upload-multiple-default-validation-reactive-forms-overview) -->
