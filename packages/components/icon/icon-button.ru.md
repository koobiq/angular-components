Для иконок-кнопок (кликабельных иконок).

<!-- example(icon-button) -->

### Размер

Используется, если в дефолтный по размеру контейнер нужно поместить иконку другого размера. Например, в Icon Button Medium можно поместить как иконку размера l (16px), так и иконку размера xl (24px)

<!-- example(icon-button-size) -->

#### Кастомизация отступов

Для иконок-кнопок предусмотрена возможность переопределения внутренних отступов с помощью CSS-переменных.

**Иконка-кнопка размера Compact**

```css
.custom-icon-button_compact {
    --kbq-icon-button-size-small-vertical-padding: var(--kbq-size-xs);
    --kbq-icon-button-size-small-horizontal-padding: var(--kbq-size-xs);
}
```

**Иконка-кнопка размера Normal**

```css
.custom-icon-button_normal {
    --kbq-icon-button-size-normal-vertical-padding: var(--kbq-size-xxs);
    --kbq-icon-button-size-normal-horizontal-padding: var(--kbq-size-xxs);
}
```

### Стиль

<!-- example(icon-button-style) -->
