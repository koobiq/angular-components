### Installing Fonts

Koobiq uses the [Inter](https://github.com/rsms/inter) and [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) font by default.

| Font           | Weight | Style  |
| -------------- | ------ | ------ |
| JetBrains Mono | 400    | Normal |
| JetBrains Mono | 700    | Normal |
| Inter          | 400    | Normal |
| Inter          | 400    | Italic |
| Inter          | 500    | Normal |
| Inter          | 500    | Italic |
| Inter          | 600    | Normal |
| Inter          | 700    | Normal |

Add it to your application via [Fontsource](#fontsource), or with the [Google Fonts CDN](#google-fonts-cdn).

##### Fontsource

Install packages:

```bash
npm install @fontsource/inter @fontsource/jetbrains-mono
```

Then you add the following code inside your global styles:

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

Add the following code inside your `<head>` tag:

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
