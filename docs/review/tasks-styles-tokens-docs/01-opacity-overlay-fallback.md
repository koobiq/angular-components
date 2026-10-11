# 1. Запасное значение для `--kbq-opacity-overlay`

**Приоритет:** P1 · **Где:** list, loader-overlay · **PR:** `fix(list): keep the drag preview and the transparent loader overlay visible with the legacy token set`

> Из разбора внешнего отзыва об использовании UI-кита. Состояние на 2026-10-08, `main` @ `7c3761794`.
> Все задачи — в [README](README.md).

**Проблема.** `--kbq-opacity-overlay` есть только в наборе `@koobiq/design-tokens/web/new/*`. Гайд по установке,
`ng add` и шаблон StackBlitz подключают старый набор `web/css-tokens*.css`, где этого токена нет. Без него
`color-mix(... calc(var(--kbq-opacity-overlay) * 100%) ...)` становится невалидным, и фон не применяется:

- `packages/components/list/list-tokens.scss:80` — фон drag-preview списка;
- `packages/components/loader-overlay/_loader-overlay-theme.scss:24` — фон `kbq-loader-overlay_transparent`.

Ещё два токена из `web/new` библиотека читает с запасным значением: `--kbq-line-visited-fade` (link), `--kbq-line-on-contrast-fade`
(split-button). У потребителей со старым набором они молча показывают другой цвет. Всего в старом наборе нет 29 токенов
из `web/new`.

**Что сделать.**

- `var(--kbq-opacity-overlay, 0.9)` в обоих местах.
- Найти в `packages/components` остальные ссылки на 29 токенов без запасного значения (скрипт — в разделе «Проверка» ниже)
  и добавить запасные значения, если найдутся.

**Готово, когда** drag-preview и прозрачный loader-overlay имеют фон в dev-приложении, собранном на старом наборе.

**Проверка** — токены, которые есть в web/new и отсутствуют в старом наборе:

```bash
node -e "const f=require('fs'),b='node_modules/@koobiq/design-tokens/web/',k=p=>new Set([...f.readFileSync(b+p,'utf8').matchAll(/^\s*(--kbq-[a-z0-9-]+):/gm)].map(m=>m[1]));const o=new Set([...k('css-tokens.css'),...k('css-tokens-light.css')]);console.log([...k('new/css-tokens.css'),...k('new/css-tokens-light.css')].filter(x=>!o.has(x)&&!/^--kbq-(plt|semantic)/.test(x)))"
```
