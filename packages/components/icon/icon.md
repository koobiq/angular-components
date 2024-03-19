### Установка
Обратите внимание, что Koobiq Icons - это необязательный пакет, и его следует установить вручную.

#### NPM
```
npm install @koobiq/icons --save
```

#### Yarn
```
yarn add @koobiq/icons
```

Затем вы должны импортировть стили:
```
@use '@koobiq/icons/dist/styles/kbq-icons.css';
```

И импортируйте KbqIconModule в ваш модуль.

```
import { KbqIconModule } from '@koobiq/components';
```

Если *.css не используется вашем проекте, вы также можете добавить:

- kbq-icons.less;
- kbq-icons.scss;
- kbq-icons-embed.css (включает встроенные шрифты)

### Примеры использования

Есть два варианта использования иконок:

1. Добавить атрибут `[color]`, используя следующие значения: *primary*, *secondary*, *error*.

```
<i kbq-icon="mc-gear_16" [color]="'contrast'"></i>
```

2. Более простой способ
```
<i class="mc kbq-gear_16"></i>
```
