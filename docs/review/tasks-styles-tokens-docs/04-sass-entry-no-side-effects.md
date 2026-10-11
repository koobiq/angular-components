# 4. SCSS-точка входа без побочного CSS

**Приоритет:** P2 · **Где:** core · **PR:** `fix(core): stop the Sass entry point from emitting CSS on @use`

> Из разбора внешнего отзыва об использовании UI-кита. Состояние на 2026-10-08, `main` @ `7c3761794`.
> Все задачи — в [README](README.md).

**Проблема.** `@use '@koobiq/components'` — единственная SCSS-точка в `exports` — сама выдаёт около 16 КБ CSS.
Модули тем подключают файлы токенов на верхнем уровне (`@use './tag-tokens'` и т. п.), а те выводят правила при
загрузке:

| Модуль                                          | CSS при `@use` |
| ----------------------------------------------- | -------------- |
| `tags/_tag-theme.scss`                          | 7,1 КБ         |
| `markdown/_markdown-theme.scss`                 | 4,7 КБ         |
| `link/_link-theme.scss`                         | 1,6 КБ         |
| `core/styles/theming/_scrollbar-theme.scss`     | 1,6 КБ         |
| `core/forms/_forms-theme.scss`                  | 0,8 КБ         |
| `core/_core.scss` (комментарий `.kbq-progress`) | 0,4 КБ         |

Кто подключает точку входа ради миксинов в стили каждого компонента (типичный «библиотечный» компонент в MFE), получает
эти 16 КБ в каждом. Сборки «только миксины и функции» нет.

**Что сделать.**

- Подключать файлы токенов внутри миксинов тем через `meta.load-css(...)`, а не `@use` на верхнем уровне.
- Тест в `unit:tools` или скрипт в CI: компиляция `@use '@koobiq/components'` даёт пустой CSS.
- `prebuilt-themes/theme.css` до и после побайтно совпадает (или отличается только порядком).

**Проверка** — сколько CSS выдаёт SCSS-точка входа (нужен собранный dist/components):

```bash
echo "@use 'components';" | npx sass --stdin --load-path=dist --load-path=node_modules | wc -c
```
