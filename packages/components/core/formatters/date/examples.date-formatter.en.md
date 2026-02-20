#### Setup

To use the formatter, you need to import: `KbqFormattersModule` and `KbqLuxonDateModule`.
`KbqLuxonDateModule` imports `KBQ_LOCALE_SERVICE`, so there is no need to import it separately.

<!-- example(date-formatter-typical-use) -->

It is also possible to connect all the necessary services without using modules (`KbqFormattersModule` and `KbqLuxonDateModule`).

<!-- example(date-formatter-special-use) -->
