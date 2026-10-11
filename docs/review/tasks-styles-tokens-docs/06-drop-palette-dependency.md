# 6. Библиотека без палитры; документировать минимальный набор токенов

**Приоритет:** P2 · **Где:** 5 компонентов, docs · **PR:** `refactor(code-block, scrollbar, skeleton, inline-edit): read semantic tokens instead of the palette`

> Из разбора внешнего отзыва об использовании UI-кита. Состояние на 2026-10-08, `main` @ `7c3761794`.
> Все задачи — в [README](README.md).

**Проблема.** Темы light/dark содержат уже вычисленные значения и на палитру не ссылаются, а палитра занимает большую
часть `:root`: в `web/new/css-tokens.css` 1482 из 2400 переменных — `--kbq-plt-*` и `--kbq-semantic-*`. Библиотека
читает палитру в 53 местах в 6 файлах:

- `code-block/code-block-tokens.scss` — 32 (цвета подсветки синтаксиса);
- `scrollbar/scrollbar-tokens.scss`, `scrollbar/deprecated/scrollbar-tokens.scss`,
  `core/styles/theming/scrollbar-tokens.scss` — по 6;
- `skeleton/skeleton-tokens.scss` — 2;
- `inline-edit/inline-edit.scss:163` — 1 (`--kbq-plt-black` в `mask-image`, хватит `black`).

Пакет уже поставляет отдельные файлы: `css/font.css`, `css/size.css`, `css/typography.css`, `css/md-typography.css`,
`new/{light,dark}/semantic-colors.css`, `new/{light,dark}/shadows.css`. Это около 770 переменных против примерно 5,7 тыс.
в старом наборе (без `css-tokens-font.css`), но нигде не описано.

**Что сделать.**

- Заменить ссылки на палитру семантическими токенами. Для подсветки синтаксиса code-block, скорее всего, нужны новые
  семантические токены — согласовать с дизайном и [задачей 8](08-design-tokens-cleanup.md).
- Описать в установке минимальный набор файлов как основной вариант; палитру подключать только для своих стилей.

**Готово, когда** dev-приложение без `palette.css`/`semantic-palette.css` проходит `e2e:docker` без изменений baseline.

**Проверка** — ссылки библиотеки на палитру:

```bash
grep -rcE 'var\(--kbq-(palette|plt|semantic)' packages/components --include='*.scss' | grep -v ':0$'
```
