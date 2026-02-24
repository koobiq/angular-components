### Установка

Обратите внимание, что Koobiq Icons - это необязательный пакет, и его следует установить вручную.

#### Обновленный пакет иконок

Рады представить обновлённый пакет иконок!
Мы очень хотим сохранить именование пакета `@koobiq/icons` и дать возможность плавной миграции (использовать оба пакета в проекте).

Новая версия иконок доступна на [GitHub](https://github.com/koobiq/icons) под версией `@koobiq/icons@9.0.0`.

Старый набор иконок теперь будет называться `@koobiq/icons-lts`.

#### NPM

```bash
npm install @koobiq/icons --save
```

Затем вы должны импортировать стили:

```scss
@use '@koobiq/icons/fonts/kbq-icons.css';
```

И импортируйте KbqIconModule в ваш модуль.

```ts
import { KbqIconModule } from '@koobiq/components';
```

Если \*.css не используется вашем проекте, вы также можете добавить:

- kbq-icons.less;
- kbq-icons.scss;
- kbq-icons-embed.css (включает встроенные шрифты)

### Примеры использования

Есть два варианта использования иконок:

1. Добавить атрибут `[color]`, используя следующие значения: _theme_, _contrast_, _contrast-fade_, _error_, _warning_, _success_.

```html
<i kbq-icon="kbq-gear_16" [color]="'contrast'"></i>
```

2. Более простой способ

```html
<i class="kbq kbq-gear_16"></i>
```
