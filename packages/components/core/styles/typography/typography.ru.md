### Добавление шрифтов

Koobiq по умолчанию использует шрифты [Inter](https://github.com/rsms/inter) и [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono).

| Шрифт          | Жирность | Стиль   |
| -------------- | -------- | ------- |
| JetBrains Mono | 400      | Обычный |
| JetBrains Mono | 700      | Обычный |
| Inter          | 400      | Обычный |
| Inter          | 400      | Курсив  |
| Inter          | 500      | Обычный |
| Inter          | 500      | Курсив  |
| Inter          | 600      | Обычный |
| Inter          | 700      | Обычный |

Добавьте их в ваше приложение при помощи [Fontsource](#fontsource) или [Google Fonts CDN](#google-fonts-cdn).

##### Fontsource

Установите пакеты:

```bash
npm install @fontsource/inter @fontsource/jetbrains-mono
```

Затем добавьте следующий код в ваши глобальные стили:

```scss
// Inter
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/inter/400-italic.css';
@import '@fontsource/inter/500-italic.css';

// JetBrains Mono
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/700.css';
```

##### Google Fonts CDN

Добавьте следующий код в тег `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<!-- Inter -->
<link
    href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
    rel="stylesheet"
/>
<!-- JetBrains Mono -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
```
