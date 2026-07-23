<!-- example(autocomplete-overview) -->

### Нижний колонтитул

В нижнем колонтитуле можно разместить вспомогательные элементы: [кнопки](ru/components/button), [ссылки](ru/components/link), подсказки.

<!-- example(autocomplete-with-footer) -->

### Ширина выпадающего списка

По умолчанию список подстраивается под содержимое и не становится меньше ширины поля или `panelMinWidth` (по умолчанию 200 px). Это можно изменить атрибутами `panelWidth` и `panelMinWidth`:

```html
<!-- По ширине поля, но не меньше panelMinWidth -->
<kbq-autocomplete panelWidth="auto" />

<!-- Точная ширина; panelMinWidth не применяется -->
<kbq-autocomplete [panelWidth]="400" />

<!-- Подходит любое CSS-значение, например сжатие по содержимому -->
<kbq-autocomplete panelWidth="fit-content" />

<!-- Увеличить нижнюю границу по умолчанию -->
<kbq-autocomplete [panelMinWidth]="350" />

<!-- Изменена максимальная ширина раскрывающегося списка -->
<kbq-autocomplete [panelMaxWidth]="800" />
```

Рост по содержимому останавливается на 640 px. Ограничение мягкое: оно не делает панель меньше ширины поля и не уменьшает явно заданный `panelWidth`. Изменить его глобально можно токеном `--kbq-panel-size-width-max`, общим с [Select](ru/components/select), [Tree-select](ru/components/tree-select) и [Dropdown](ru/components/dropdown).

Эти же атрибуты работают, когда Autocomplete подключен к [полю с тегами](ru/components/tags): ширина списка считается по всему полю, а не по полю ввода внутри него.
