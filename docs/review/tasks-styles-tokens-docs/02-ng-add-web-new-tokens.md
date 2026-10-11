# 2. `ng add` и миграция на набор токенов `web/new`

**Приоритет:** P1 · **Где:** schematics · **PR:** `fix(schematics): set up the web/new design tokens and migrate projects off the legacy set`

> Из разбора внешнего отзыва об использовании UI-кита. Состояние на 2026-10-08, `main` @ `7c3761794`.
> Все задачи — в [README](README.md).

**Проблема.** Сайт документации, dev- и e2e-приложения работают на `web/new`
(`apps/docs/src/styles/koobiq/_index.scss`, `packages/components-dev/main.scss`). Потребителям `ng add` ставит
старый набор (`packages/schematics/src/utils/workspace-styles.ts:18`, `:32–34`). То есть потребители видят не те цвета,
что на сайте: значения в наборах разные. Например, `--kbq-background-overlay-inverse` в тёмной теме в двух наборах вообще
разного смысла. Плюс [задача 1](01-opacity-overlay-fallback.md). Старый набор к тому же самый тяжёлый: палитра в нём дважды
(`--kbq-palette-*` 921 + `--kbq-plt-*` 922), и около 2,5 тыс. устаревших компонентных токенов.

**Что сделать.**

- `ng add` прописывает `web/new/css-tokens.css`, `web/new/css-tokens-light.css`, `web/new/css-tokens-dark.css`
  (или минимальный набор из [задачи 6](06-drop-palette-dependency.md), если она будет раньше).
- `ng update`-миграция в `packages/schematics/src/migrations/`: переписать пути старых файлов в `angular.json`/`project.json`
  на `web/new`, удалить `css-tokens-font.css`, предупредить о смене значений цветов.
- Проверить нижнюю границу peer-диапазона `@koobiq/design-tokens` (`^3.14.0`): есть ли в 3.14 `web/new` со всеми
  токенами, которые читает библиотека. Если нет — поднять.

**Готово, когда** `unit:schematics` покрывает установку и миграцию (включая повторный запуск и nx `project.json`),
а в CHANGELOG описана визуальная разница.

**Риск.** Видимая смена цветов у потребителей. Это приведение к тому, что показывает документация, но заметки к релизу
должны сказать об этом явно.
