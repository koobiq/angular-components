`kbq-timezone-select` - компонент выбора таймзоны является расширением `kbq-select`. Имеет те же возможности, за исключением множественного выбора. Может работать как с `kbq-timezone-option`, так и с `kbq-option`.

`kbq-timezone-option` - элемент списка таймзон является расширением `kbq-option`. Имеет те же возможности, но свой шаблон отображения.

<!-- example(timezone-overview) -->

### Размер выпадающего меню

Меню занимает 640 пикселей и увеличивается по размеру поля, если оно больше этого минимального ограничения. Настраивается при помощи атрибутов `panelMinWidth` и `panelWidth`.

### Поиск

<!-- example(timezone-search-overview) -->

### Пользовательский триггер

`kbq-timezone-select-trigger` — это директива, которая позволяет задать пользовательское отображение выбранного значения.

<!-- example(timezone-trigger-overview) -->