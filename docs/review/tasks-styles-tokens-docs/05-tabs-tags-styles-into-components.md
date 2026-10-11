# 5. Стили tabs и tags — из глобальной темы в компоненты

**Приоритет:** P2 · **Где:** tabs, tags, core · **PR:** `refactor(tabs, tags): move the color styles from the global theme into the components`

> Из разбора внешнего отзыва об использовании UI-кита. Состояние на 2026-10-08, `main` @ `7c3761794`.
> Все задачи — в [README](README.md).

**Проблема.** `koobiq-theme()` подключает `kbq-tabs-theme()` и `kbq-tag-theme()`
(`packages/components/core/styles/_koobiq-theme.scss:26–27`, типографика — `:38–39`). Цвета и состояния вкладок и тегов
живут только в глобальном `theme.css`, а не в `styleUrls` компонентов. Поэтому:

- больше всего в `theme.css` (122 КБ) селекторов tabs: около 730 упоминаний `.kbq-tab*` против 300 у link и 180 у tags;
- tabs и tags без глобальной темы выглядят сломанными, а приложение без этих компонентов всё равно грузит их стили.

Link и markdown остаются глобальными: link — директива, `.kbq-markdown` применяется и к сырой разметке.

**Что сделать.**

- Подключить `kbq-tabs-theme`/`kbq-tabs-typography` в стили `KbqTabGroup` и `KbqTabNavBar`, `kbq-tag-theme`/
  `kbq-tag-typography` — в стили `KbqTag`/`KbqTagList`; убрать их из `koobiq-theme()`.
- Публичные миксины оставить, пометить `@deprecated` (их могут вызывать потребители).
- Проверить специфичность: глобальные правила и правила компонента вставляются в разном порядке.

**Готово, когда** `e2e:docker` без изменений baseline, а размер `theme.css` до и после записан в описание PR.
