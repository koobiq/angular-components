<!-- example(autocomplete-overview) -->

### Нижний колонтитул

В нижнем колонтитуле можно разместить вспомогательные элементы: [кнопки](ru/components/button), [ссылки](ru/components/link), подсказки.

<!-- example(autocomplete-with-footer) -->

### Ширина выпадающего списка

По умолчанию список подстраивается под контент и не бывает уже поля или `panelMinWidth`, который равен 200px. Это можно изменить атрибутами `panelWidth` и `panelMinWidth`:

```html
<!-- По ширине поля, но не уже panelMinWidth -->
<kbq-autocomplete panelWidth="auto" />

<!-- Точная ширина; panelMinWidth не применяется -->
<kbq-autocomplete [panelWidth]="400" />

<!-- Подходит любое CSS-значение, например сжатие по контенту -->
<kbq-autocomplete panelWidth="fit-content" />

<!-- Увеличить нижнюю границу по умолчанию -->
<kbq-autocomplete [panelMinWidth]="350" />

<!-- Разрешить панели расти по контенту дальше; по умолчанию потолок 640px -->
<kbq-autocomplete [panelMaxWidth]="800" />
```

Рост по контенту останавливается на 640px. Потолок мягкий — он никогда не делает панель уже поля и не обрезает явный `panelWidth`. Изменить его глобально можно токеном `--kbq-panel-size-width-max`, общим с select, tree-select и dropdown.

Эти же атрибуты работают, когда autocomplete подключён к [полю с тегами](ru/components/tags) — там ширина списка считается по всему полю, а не по инпуту.
