<!-- example(typography-overview) -->

### Usage and Override

```scss
@use '~@koobiq/components/theming';

// returns default typography config
$typography: kbq-typography-config();
//If you need to get font size of mosaic small-text and don`t want to use .kbq-small-text class
.some-selector {
  font-size: kbq-font-size($typography-config, small-text);
}
```

#### Partial config override
```scss
//kbq-typography-level($font-size, $line-height: $font-size, $letter-spacing: normal, $font-weight: normal, $font-family: null, $text-transform: null)
$typography: kbq-typography-config($body: kbq-typography-level(45px, 45px, 0.55px));
```

#### Full config override
```scss
$fonts: (
    base: (
        font-family: #{Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif}
    ),
    monospace: (
        font-family: #{'Roboto Mono', 'Consolas', 'Menlo', 'Monaco', monospace}
    )
);

$font-family:   map-get(map-get($fonts, base), font-family);
$font-family-mono:   map-get(map-get($fonts, monospace), font-family);

$typography: kbq-typography-config(
    $font-family,
    $font-family-mono,
    $display-1:           kbq-typography-level(56px, 76px, -0.4px),
    $display-2:           kbq-typography-level(45px, 56px),
    $display-3:           kbq-typography-level(34px, 44px, 0.25px),

    $headline:            kbq-typography-level(24px, 32px),
    $title:               kbq-typography-level(20px, 28px, 0.15px, 500),
    $subheading:          kbq-typography-level(15px, 20px, 0.15px, 700),

    $body:                kbq-typography-level(45px, 20px, 0.55px),
    $body-strong:         kbq-typography-level(15px, 20px, 0.15px, 500),
    $body-caps:           kbq-typography-level(15px, 20px, 1.7px, normal, $font-family, uppercase),
    $body-mono:           kbq-typography-level(15px, 20px, normal, normal, $font-family-mono),
    $body-mono-strong:    kbq-typography-level(15px, 20px, normal, 500, $font-family-mono),

    $caption:             kbq-typography-level(13px, 16px, 0.25px),
    $caption-caps:        kbq-typography-level(13px, 16px, 1.5px, normal, $font-family, uppercase),
    $caption-mono:        kbq-typography-level(13px, 16px, normal, normal, $font-family-mono),
    $caption-mono-strong: kbq-typography-level(13px, 16px, normal, 500, $font-family-mono),

    $small-text:          kbq-typography-level(13px, 16px, 0.25px),
    $extra-small-text:    kbq-typography-level(11px, 16px, 0.22px)
);

```
