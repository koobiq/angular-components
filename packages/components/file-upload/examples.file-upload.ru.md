### Локализация компонента

Регистрация надписей как данных локали через `KBQ_LOCALE_DATA` меняет их во всех компонентах загрузки файлов внутри модуля сразу, и они продолжают следовать за `setLocale()`.

<!-- example(file-upload-multiple-custom-text-overview) -->

Привязка `[localeOverrides]` меняет только переданные надписи и только у этого компонента. Остальные остаются как есть и продолжают следовать за выбранным языком. Значение задаётся по секциям, поэтому надписи кладутся в `fileUpload.single` или `fileUpload.multiple`.

<!-- example(file-upload-custom-text-via-input) -->

### Неопределенный индикатор прогресса

Пример загрузки файлов с неопределенным по завершенности прогрессом:

<!-- example(file-upload-indeterminate-loading-overview) -->

### Сигналы

Пример загрузчика файлов с использованием [`signal`](https://angular.dev/guide/signals).
После загрузки файл подсвечивается как ошибочный - это симуляция обработки файла.

<!-- example(file-upload-single-with-signal) -->

### Реактивные формы

Пример загрузчика файлов с использованием [`FormControl`](https://angular.dev/api/forms/FormControl).

<!-- example(file-upload-cva-overview) -->

### Валидация: дополнительные примеры

В примерах используется [FileValidators](https://github.com/koobiq/angular-components/blob/main/packages/components/core/forms/validators.ts) - это набор статических методов для валидации поля загрузки файлов.

#### Обязательное поле

- **Один файл**: Пример загрузчика, проверяющего, что файл обязательно должен быть загружен.

<!-- example(file-upload-single-required-reactive-validation) -->

- **Несколько файлов**: Пример загрузчика, который требует обязательной загрузки нескольких файлов.

<!-- example(file-upload-multiple-required-reactive-validation) -->

#### Валидация размера файла

- **Один файл**: Пример загрузки одного файла с применением `Reactive Forms` для проверки данных.

<!-- example(file-upload-single-validation-reactive-forms-overview) -->

- **Несколько файлов**: Пример загрузки нескольких файлов с использованием `Reactive Forms` и встроенной валидации.

<!-- example(file-upload-multiple-default-validation-reactive-forms-overview) -->

#### Валидация типа или расширения файла

- **Один файл**: Пример загрузки одного файла с применением `Reactive Forms` для проверки данных.

<!-- example(file-upload-single-accept-validation) -->

- **Несколько файлов**: Пример загрузки нескольких файлов с использованием `Reactive Forms` и валидации.

<!-- example(file-upload-multiple-accept-validation) -->

#### Проверка файла: обязательность и расширение

- **Один файл**: Пример загрузки одного файла с применением `Reactive Forms` для проверки данных.

<!-- example(file-upload-single-mixed-validation) -->

- **Несколько файлов**: Пример загрузки нескольких файлов с использованием `Reactive Forms` и валидации.

<!-- example(file-upload-multiple-mixed-validation) -->

#### Асинхронная валидация

- Пример проверки контента при загрузке одного файла с использование `Reactive Forms`.

<!-- example(file-upload-single-async-validation) -->

### Примитивы

Пример демонстрирует применение примитивов компонента загрузки файлов.

<!-- example(file-upload-primitive) -->

### Дроп-зона

<!-- example(file-upload-dropzone) -->
