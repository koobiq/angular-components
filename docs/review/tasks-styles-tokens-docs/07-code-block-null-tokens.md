# 7. Убрать `null`-декларации и мёртвые токены из code-block

**Приоритет:** P2 · **Где:** code-block · **PR:** `chore(code-block): drop the null and unused tokens`

> Из разбора внешнего отзыва об использовании UI-кита. Состояние на 2026-10-08, `main` @ `7c3761794`.
> Все задачи — в [README](README.md).

**Проблема.** В `packages/components/code-block/code-block-tokens.scss` 186 деклараций со значением `null` — след
конвертации SCSS map:

- 102 токена `--kbq-code-block-font-hljs-*` (с `:18`) нигде не читаются; 100 из них — `null`;
- 86 токенов `--kbq-code-block-hljs-*: null` (с `:147`) читаются в `_code-block-theme.scss` через
  `kbq-code-block-hljs-attr()`; `null` там работает как незаданная переменная, то есть свойство сбрасывается.

**Что сделать.** Удалить 102 мёртвых токена; удалить `null`-токены вместе с правилами, которые их читают (поведение то же).
Если токены считаются публичными — описать удаление в CHANGELOG.

**Готово, когда** `e2e:docker` по code-block без изменений baseline.
