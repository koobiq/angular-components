### Установка

Обратите внимание, что Koobiq Icons - это необязательный пакет, и его следует установить вручную.

#### Обновленный пакет иконок

Рады представить обновлённый пакет иконок!
Мы очень хотим сохранить именование пакета `@koobiq/icons` и дать возможность плавной миграции (использовать оба пакета в проекте).

Новая версия иконок доступна на GitHub под версией `@koobiq/icons@9.0.0`.

Старый набор иконок теперь будет называться `@koobiq/icons-lts`.

#### NPM

```
npm install @koobiq/icons --save
```

#### Yarn

```
yarn add @koobiq/icons
```

Затем вы должны импортировать стили:

```
@use '@koobiq/icons/fonts/kbq-icons.css';
```

И импортируйте KbqIconModule в ваш модуль.

```
import { KbqIconModule } from '@koobiq/components';
```

Если \*.css не используется вашем проекте, вы также можете добавить:

-   kbq-icons.less;
-   kbq-icons.scss;
-   kbq-icons-embed.css (включает встроенные шрифты)

### Примеры использования

Есть два варианта использования иконок:

1. Добавить атрибут `[color]`, используя следующие значения: _theme_, _contrast_, _contrast-fade_, _error_, _warning_, _success_.

```
<i kbq-icon="kbq-gear_16" [color]="'contrast'"></i>
```

2. Более простой способ

```
<i class="kbq kbq-gear_16"></i>
```
