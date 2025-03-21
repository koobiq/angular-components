#### Подключение

Для использования formatter необходимо подключить: `KbqFormattersModule` и `KbqLuxonDateModule`.
`KbqLuxonDateModule` - импортирует `KBQ_LOCALE_SERVICE`, поэтому нет необходимости дополнительно его импортировать.

<!-- example(date-formatter-typical-use) -->

Так же есть возможность подключать все необходимые сервисы без использования модулей (`KbqFormattersModule` и `KbqLuxonDateModule`).

<!-- example(date-formatter-special-use) -->
