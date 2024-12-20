<!-- example(typography-overview) -->

### Использование и переопределение

```scss
@use '~@koobiq/components/theming';

// returns default typography config
$typography: kbq-typography-config();
//If you need to get font size of mosaic small-text and don`t want to use .kbq-small-text class
.some-selector {
    font-size: kbq-font-size($typography-config, small-text);
}
```

#### Частичное переопределение конфигурации

```scss
//kbq-typography-level($font-size, $line-height: $font-size, $letter-spacing: normal, $font-weight: normal, $font-family: null, $text-transform: null)
$typography: kbq-typography-config(
    $body: kbq-typography-level(45px, 45px, 0.55px)
);
```

#### Полное переопределение конфигурации

```scss
$fonts: (
    base: (
        font-family: #{Roboto,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        'Helvetica Neue',
        Arial,
        sans-serif}
    ),
    mono: (
        font-family: #{'Roboto Mono',
        'Consolas',
        'Menlo',
        'Monaco',
        monospace}
    )
);

$font-family: map.get(map.get($fonts, base), font-family);
$font-family-mono: map.get(map.get($fonts, mono), font-family);

$typography: kbq-typography-config(
    $font-family,
    $font-family-mono,
    $headline: kbq-typography-level(24px, 32px),
    $title: kbq-typography-level(20px, 28px, 0.15px, 500),
    $subheading: kbq-typography-level(15px, 20px, 0.15px, 700),
    $small-text: kbq-typography-level(13px, 16px, 0.25px)
);
```
