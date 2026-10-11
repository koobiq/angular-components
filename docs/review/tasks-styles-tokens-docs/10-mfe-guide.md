# 10. Гайд для микрофронтендов

**Приоритет:** P3 · **Где:** docs · **PR:** `docs: add a micro-frontends guide`

> Из разбора внешнего отзыва об использовании UI-кита. Состояние на 2026-10-08, `main` @ `7c3761794`.
> Все задачи — в [README](README.md).

**Проблема.** В документации описано только размещение оверлеев внутри shadow root (`kbqShadowDomOverlayProvider`,
страницы Core и Toast). Доставку токенов, темы, иконок и шрифтов в shadow root обе страницы прямо оставляют приложению,
не объясняя, как это сделать. Сравнения подходов нет.

**Что описать** (новая страница EN и RU, пункт в `apps/docs/src/app/structure.ts`, `docs:generate-llms`):

- **Глобальные стили в шелле:** токены, `theme.css`, иконки и шрифты подключает только шелл, remotes не подключают ничего
  глобального; общие пакеты (`@koobiq/components`, `@angular/cdk`, `@angular/core`) — singleton в shared-конфигурации
  Module Federation, чтобы не было двух копий библиотеки.
- **Shadow DOM:** что пересекает границу (наследуемые свойства, в том числе CSS-переменные темы с предка `.kbq-light`/
  `.kbq-dark`) и что нет (правила `theme.css`, классы иконок; `@font-face` нужно объявлять в документе). Как доставить
  нужное в shadow root (`adoptedStyleSheets`, `<style>`), как ставить класс темы, ссылка на `kbqShadowDomOverlayProvider`.
- **Компонент-«виджет» для других remotes:** какие SCSS-импорты допустимы без дублирования CSS (после [задачи 4](04-sass-entry-no-side-effects.md)).

Зависит от задач [4](04-sass-entry-no-side-effects.md)–[6](06-drop-palette-dependency.md): без них гайд описывает обходные пути.
