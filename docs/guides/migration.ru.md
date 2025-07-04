## Как обновиться с Koobiq 17

Новые версии включают улучшения, но содержат **ломающие изменения**; их нужно применять постепенно.

---

### Краткий план

**До 18.5.3** — безопасная база с обновлением темизации и иконок
**18.6** — обновление токенов
**18.22** — изменение атрибутов компонентов
**После** — финальное обновление до последней версии (с актуальной темизацией)

---

### 1. Обновление до 18.5.3

```bash
npm install @koobiq/cdk@18.5.3
npm install @koobiq/components@18.5.3
npm install @koobiq/icons@^9.0.0
npm install @koobiq/design-tokens@~3.7.3
npm install @koobiq/angular-luxon-adapter@18.5.3
npm install @koobiq/date-adapter^3.1.3
npm install @koobiq/date-formatter^3.1.3
npm install luxon
npm install @messageformat/core
npm install @radix-ng/primitives@0.14.0
```

#### Новая темизация

Теперь темизация более простая и строится на основе CSS-переменных. Подробнее [по ссылке](https://koobiq.io/ru/main/theming/overview#как-использовать?).

Смотрите примеры в репозитории:

- [`apps/docs/src/main.scss`](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/main.scss)
- [`apps/docs/src/styles/_theme-kbq.scss`](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/styles/_theme-kbq.scss)

#### Обновление пакета иконок

- Установите новую версию иконок:

```bash
npm install @koobiq/icons@9.1.0
```

- Чтобы обновить названия иконок в шаблонах, используйте инструмент для обновления (схематик):

```bash
ng g @koobiq/angular-components:new-icons-pack --project <your project>
```

---

### 2. Обновление токенов (18.6.x)

- Были удалены устаревшие токены цветов и переименованы токены параметров типографики.

Скрипт заменит названия классов и CSS-переменных на новые и подсветит места, где нужно удалить (заменить) устаревшие цвета:

```bash
ng g @koobiq/angular-components:css-selectors --fix=true --project <your project>
```

- Для ручного контроля добавьте `--fix=false`. Скрипт подсветит места, где нужно удалить (заменить) цвета и названия типографики:

```bash
ng g @koobiq/angular-components:css-selectors --fix=false --project <your project>
```

---

### 3. Обновление атрибутов (18.22.0)

- Изменились имена атрибутов компонентов:
    - `KbqLoaderOverlay`: `compact` → `size`
    - `KbqEmptyState`: `big` → `size`

```bash
ng g @koobiq/angular-components:loader-overlay-size-attr --project <your project>
ng g @koobiq/angular-components:empty-state-size-attr --project <your project>
```
